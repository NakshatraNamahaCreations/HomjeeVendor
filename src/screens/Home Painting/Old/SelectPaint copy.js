import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../Utilities/ThemeContext';
import PaintDropdown from '../../Utilities/PaintDropdown';
import { useLeadContext } from '../../Utilities/LeadContext';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import { getRequest } from '../../ApiService/apiHelper';
import PageLoader from '../../components/PageLoader';

const PUTTY_RATE_PER_SQFT = 10;
const fmtMoney = n => `₹ ${Number(n || 0).toFixed(2)}`;
const num = v => (v == null ? null : Number(v));
const toNum = v => Number(v || 0);
const net = item => toNum(item?.totalSqt ?? item?.area ?? 0);

export default function SelectPaint() {
  const navigation = useNavigation();
  const route = useRoute();
  const { deviceTheme } = useThemeColor();

  const [additionalPreview, setAdditionalPreview] = useState({
    items: [],
    total: 0,
  });

  const {
    roomName,
    existingRoom,
    quoteId,
    existingLine,
    onSaved,
    paintsCache,
  } = route.params || {};
  const { leadDataContext } = useLeadContext();
  const [estimateData, setEstimateData] = useEstimateContext();
  const leadId = leadDataContext?._id;

  const [loading, setLoading] = useState(true);
  const [paintOptions, setPaintOptions] = useState([]);

  // Selected paints
  const [selectedPaintCeiling, setSelectedPaintCeiling] = useState(null);
  const [selectedPaintWall, setSelectedPaintWall] = useState(null);
  const [selectedPaintOthers, setSelectedPaintOthers] = useState(null);
  console.log('paintOptions', paintOptions);

  // --- Bootstrap items with stable ids and toggleable sqft ---
  const safeKey = s =>
    (s || 'measurement').toString().trim().toLowerCase().replace(/\s+/g, '-');

  const addIds = (arr = [], type) =>
    arr.map((it, origIdx) => ({
      ...it,
      id: `${type}-${origIdx}`, // stable id
      _origIdx: origIdx, // stable display order (1-based later)
      originalSqft: net(it), // stash original sqft
      deselected: net(it) <= 0, // if already 0, treat as deselected
    }));

  const ceilingsAll0 = addIds(existingRoom?.ceilings || [], 'ceiling');
  const wallsAll0 = addIds(existingRoom?.walls || [], 'wall');
  const measurementsAll0 = addIds(
    existingRoom?.measurements || [],
    safeKey(existingRoom?.name),
  );

  const [ceilings, setCeilings] = useState(ceilingsAll0);
  const [walls, setWalls] = useState(wallsAll0);
  const [measurements, setMeasurements] = useState(measurementsAll0);

  useEffect(() => {
    if (Array.isArray(paintsCache) && paintsCache.length) {
      setPaintOptions(paintsCache);
    }
  }, [paintsCache]);

  const mergeById = (oldList, newList) => {
    const m = new Map((oldList || []).map(p => [String(p._id), p]));
    (newList || []).forEach(p => m.set(String(p._id), p));
    return Array.from(m.values());
  };

  // Fetch paints
  const fetchPaintProducts = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_PAINT}`);
      const fresh = resp?.data?.paints || resp?.paints || [];
      setPaintOptions(prev => mergeById(prev || [], fresh));
    } catch (e) {
      console.log('error while fetching data', e);
      // keep cache
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaintProducts();
  }, []);

  const resolvePaint = sel => {
    if (!sel) return null;
    const wantId = String(sel.id || sel._id || '');
    const found = paintOptions.find(p => String(p._id) === wantId);
    if (found) return found;

    // paint was deleted/renamed server-side → keep a stub so UI still shows it
    const stub = { ...sel, _id: sel._id || sel.id || `stub-${Date.now()}` };
    setPaintOptions(prev => {
      if (prev.some(p => String(p._id) === String(stub._id))) return prev;
      return [stub, ...(prev || [])];
    });
    return stub;
  };

  // --- Price helpers ---
  const getSelectedPaintForType = type => {
    if (type === 'measurements') return selectedPaintOthers;
    if (type === 'ceiling') return selectedPaintCeiling;
    return selectedPaintWall;
  };

  const getRateDetailForItem = (item, type) => {
    const sel = getSelectedPaintForType(type);
    if (!sel) return null;

    const base = num(sel.price);
    const isFresh = item?.mode === 'FRESH';
    const needsPutty =
      (isFresh && sel.includePuttyOnFresh) ||
      (!isFresh && sel.includePuttyOnRepaint);
    const putty = needsPutty ? PUTTY_RATE_PER_SQFT : 0;
    const total = (base ?? 0) + putty;
    return { base, putty, total, needsPutty };
  };

  const hydrateFromLine = (list, type, saved) => {
    // saved keyed by displayIndex (1-based)
    const map = new Map(
      (saved || []).map(b => [Number(b.displayIndex || 0), b]),
    );

    return list.map((it, i) => {
      const disp = typeof it._origIdx === 'number' ? it._origIdx + 1 : i + 1;
      const sv = map.get(disp);
      if (!sv) return it; // untouched

      const restoredOrig = it.originalSqft ?? net(it);
      const sqft = toNum(sv.sqft);
      const deselected = sqft <= 0;

      return {
        ...it,
        originalSqft: restoredOrig,
        // write sqft back where it lives (totalSqt or area)
        totalSqt: it.totalSqt !== undefined ? sqft : undefined,
        area: it.area !== undefined ? sqft : undefined,
        mode: sv.mode || it.mode,
        deselected,
      };
    });
  };

  useEffect(() => {
    // only run when we have paints and room data
    if (!existingRoom) return;
    if (!paintOptions || !paintOptions.length) return;

    // 3.a select paints
    const sp = existingLine?.selectedPaints || {};
    setSelectedPaintCeiling(resolvePaint(sp.ceiling || null));
    setSelectedPaintWall(resolvePaint(sp.wall || null));
    setSelectedPaintOthers(resolvePaint(sp.measurements || null));

    // 3.b hydrate item sqft/mode from saved breakdown
    const savedC = (existingLine?.breakdown || []).filter(
      b => b.type === 'Ceiling',
    );
    const savedW = (existingLine?.breakdown || []).filter(
      b => b.type === 'Wall',
    );
    const savedM = (existingLine?.breakdown || []).filter(
      b => b.type === 'Measurement',
    );

    setCeilings(prev => hydrateFromLine(prev, 'Ceiling', savedC));
    setWalls(prev => hydrateFromLine(prev, 'Wall', savedW));
    setMeasurements(prev => hydrateFromLine(prev, 'Measurement', savedM));
  }, [existingRoom, existingLine, paintOptions]);

  // --- Toggle handler: zero sqft when off, restore when on ---
  const toggleItem = setter => idxOrId => {
    setter(prev =>
      prev.map((it, i) => {
        const hit =
          typeof idxOrId === 'number' ? i === idxOrId : it.id === idxOrId;
        if (!hit) return it;

        const currentSqft = net(it);
        if (it.deselected) {
          // Re-select → restore sqft
          const restored = it.originalSqft ?? currentSqft;
          return {
            ...it,
            deselected: false,
            totalSqt: it.totalSqt !== undefined ? restored : undefined,
            area: it.area !== undefined ? restored : undefined,
          };
        }
        // Deselect → stash & zero
        const stash = it.originalSqft ?? currentSqft;
        return {
          ...it,
          deselected: true,
          originalSqft: stash,
          totalSqt: it.totalSqt !== undefined ? 0 : undefined,
          area: it.area !== undefined ? 0 : undefined,
        };
      }),
    );
  };

  const onToggleCeiling = toggleItem(setCeilings);
  const onToggleWall = toggleItem(setWalls);
  const onToggleMeasure = toggleItem(setMeasurements);

  const renderAdditionalPreview = () => {
    const items = additionalPreview?.items || [];
    if (!items.length) return null;

    return (
      <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: 15,
            color: 'black',
            marginBottom: 6,
          }}
        >
          Additional Services
        </Text>

        {items.map((it, i) => (
          <View
            key={`add-${i}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 6,
              borderBottomWidth: 0.6,
              borderBottomColor: '#eee',
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontFamily: 'Poppins-Medium', color: '#111' }}>
                {it.serviceType}
                {it.materialName ? ` — ${it.materialName}` : ''}
                {it.surfaceType ? ` (${it.surfaceType})` : ''}
                {it.withPaint === true
                  ? ' — With Paint'
                  : it.withPaint === false
                  ? ' — Without Paint'
                  : ''}
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  color: '#666',
                  fontSize: 12,
                }}
              >
                {Number(it.areaSqft || 0) > 0
                  ? `${Number(it.areaSqft)} sq ft × ₹${Number(
                      it.unitPrice || 0,
                    )}`
                  : '—'}
              </Text>
            </View>

            <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#111' }}>
              {fmtMoney(Number(it.total || 0))}
            </Text>
          </View>
        ))}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#111' }}>
            Additional Total
          </Text>
          <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#111' }}>
            {fmtMoney(Number(additionalPreview.total || 0))}
          </Text>
        </View>
        <View style={styles.dottedLine} />
      </View>
    );
  };

  // --- Card UI ---
  const renderCard = (item, idx, type) => {
    const isOthers = existingRoom?.sectionType === 'Others';
    const title = isOthers
      ? `${existingRoom?.name ?? roomName ?? 'Measurement'} ${idx + 1}`
      : `${type.charAt(0).toUpperCase() + type.slice(1)} ${idx + 1}`;
    const modeText =
      item.mode === 'FRESH' ? 'Fresh Paint' : 'Repaint with primer';

    const sqt = net(item);
    const rateDetail = getRateDetailForItem(item, type);
    const rate = rateDetail?.total ?? null;
    const amount = rate != null ? sqt * rate : null;

    const checked = !item.deselected && sqt > 0;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.paintCard}
        onPress={() => {
          if (type === 'ceiling') onToggleCeiling(item.id);
          else if (type === 'wall') onToggleWall(item.id);
          else onToggleMeasure(item.id);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardTopRow}>
          <View
            style={[styles.redCheck, checked && { backgroundColor: '#ED1F24' }]}
          >
            {checked && <Icon name="check" size={14} color="#fff" />}
          </View>

          <Text style={styles.paintLabel}>
            {title}
            {!isOthers ? ` (${modeText})` : ''}
          </Text>

          <Text style={styles.areaText}>
            {sqt} sq ft
            {amount != null ? ` × ${rate} = ${fmtMoney(amount)}` : ''}
          </Text>
        </View>

        {rateDetail && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Poppins-Medium',
              color: 'green',
            }}
          >
            {`Rate = ₹${rateDetail.base}`}
            {rateDetail.needsPutty ? ` + Putty ₹${PUTTY_RATE_PER_SQFT}` : ''}
            {` = ₹${rateDetail.total}/sq ft`}
          </Text>
        )}

        <View style={styles.dottedLine} />

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AdditionalService', {
              quoteId,
              roomName: existingRoom?.name || roomName, // be consistent with what backend stores
              surfaceType: title,
              onSavedAdditionalLocal: respData => {
                const items = respData?.additionalServices || [];
                const total = Number(respData?.additionalTotal || 0);
                setAdditionalPreview({ items, total });
              },
            })
          }
          style={styles.additionalServices}
          activeOpacity={0.7}
        >
          <Text style={styles.additionalText}>Additional Services</Text>
          <Entypo name="chevron-with-circle-right" size={18} color="#FF0000" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // --- Save ---
  const onDone = async () => {
    const anyPositive =
      ceilings.some(it => net(it) > 0) ||
      walls.some(it => net(it) > 0) ||
      measurements.some(it => net(it) > 0);

    if (!anyPositive) {
      Alert.alert(
        'Nothing selected',
        'Pick at least one ceiling / wall / measurement item.',
      );
      return;
    }

    const pickPaint = p =>
      !p
        ? null
        : {
            id: String(p._id),
            name: p.name,
            isSpecial: !!p.isSpecial,
            price: Number(p.price),
            includePuttyOnFresh: !!p.includePuttyOnFresh,
            includePuttyOnRepaint: !!p.includePuttyOnRepaint,
          };

    const mk = (kind, it, paintSel) => {
      const sel =
        kind === 'Measurement'
          ? selectedPaintOthers
          : kind === 'Ceiling'
          ? selectedPaintCeiling
          : selectedPaintWall;

      if (!sel) return null;

      const isFresh = it.mode === 'FRESH';
      const base = Number(sel.price) || 0;
      const needsPutty =
        (isFresh && sel.includePuttyOnFresh) ||
        (!isFresh && sel.includePuttyOnRepaint);
      const unit = base + (needsPutty ? PUTTY_RATE_PER_SQFT : 0);

      const sqft = Math.max(0, net(it)); // <- zero if deselected
      return {
        type: kind,
        mode: it.mode,
        sqft,
        unitPrice: unit,
        price: +(sqft * unit).toFixed(2),
        paintId: sel?._id ?? null,
        paintName: sel?.name ?? '',
        displayIndex:
          typeof it._origIdx === 'number' ? it._origIdx + 1 : undefined,
      };
    };

    // Build breakdown from ALL items (zeros included)
    const cLines = ceilings
      .map(it => mk('Ceiling', it, selectedPaintCeiling))
      .filter(Boolean);
    const wLines = walls
      .map(it => mk('Wall', it, selectedPaintWall))
      .filter(Boolean);
    const mLines = measurements
      .map(it => mk('Measurement', it, selectedPaintOthers))
      .filter(Boolean);

    const breakdown = [...cLines, ...wLines, ...mLines];
    const sum = arr => arr.reduce((s, x) => s + (x?.price || 0), 0);

    const payload = {
      roomName,
      sectionType: existingRoom.sectionType,
      selectedPaints: {
        ceiling: pickPaint(selectedPaintCeiling),
        wall: pickPaint(selectedPaintWall),
        measurements: pickPaint(selectedPaintOthers),
      },
      breakdown, // contains zero-sqft rows for deselected items
      ceilingsTotal: sum(cLines),
      wallsTotal: sum(wLines),
      othersTotal: sum(mLines),
      subtotal: sum(breakdown),
    };

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}${
          API_ENDPOINTS.UPDATE_QUOTE_PRICING
        }${encodeURIComponent(quoteId)}/rooms/${encodeURIComponent(
          roomName,
        )}/pricing`,
        payload,
      );

      const savedLine = data?.data?.line || data?.data || payload;
      onSaved?.(savedLine);
      navigation.goBack();
    } catch (err) {
      console.log('save line error', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to save pricing',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}

      <View
        style={{
          backgroundColor: 'white',
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderBottomColor: '#e9e9e9',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" color="black" size={23} />
          </TouchableOpacity>
          <Text
            style={{
              paddingHorizontal: 33,
              color: 'black',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
              marginTop: 5,
            }}
          >
            {roomName}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {existingRoom.sectionType === 'Interior' ||
        existingRoom.sectionType === 'Exterior' ? (
          <>
            {!!ceilings.length && (
              <>
                <Text style={styles.sectionTitle}>Ceiling</Text>
                <PaintDropdown
                  value={selectedPaintCeiling}
                  onChange={setSelectedPaintCeiling}
                  options={paintOptions}
                />
                {ceilings.map((item, idx) => renderCard(item, idx, 'ceiling'))}
              </>
            )}

            {!!walls.length && (
              <>
                <Text style={styles.sectionTitle}>Walls</Text>
                <PaintDropdown
                  value={selectedPaintWall}
                  onChange={setSelectedPaintWall}
                  options={paintOptions}
                />
                {walls.map((item, idx) => renderCard(item, idx, 'wall'))}
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{existingRoom.name}</Text>
            <PaintDropdown
              value={selectedPaintOthers}
              onChange={setSelectedPaintOthers}
              options={paintOptions}
            />
            {measurements.map((item, idx) =>
              renderCard(item, idx, 'measurements'),
            )}
          </>
        )}
        {renderAdditionalPreview()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  roomName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#ED1F24',
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 6,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#ccc',
    borderWidth: 1,
    marginHorizontal: 20,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#888',
  },
  paintCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  paintLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  areaText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ED1F24',
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 12,
  },
  additionalServices: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalText: {
    color: '#ED1F24',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 4,
  },
  iconStyle: {
    width: 18,
    height: 18,
    tintColor: '#ED1F24',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  doneButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});

{
  /* single select */
}
{
  /* Ceiling Section
        <View>
          <Text style={styles.sectionTitle}>Ceiling</Text>
          <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
            <Text style={styles.dropdownText}>Select Paint Type</Text>
            <Icon name="keyboard-arrow-down" size={20} color="#999" />
          </TouchableOpacity>

          {existingDetails?.ceilings?.map((item, idx) => {
            const ceilingItem = { ...item, id: `ceiling-${idx}` }; 
            return renderCard(
              ceilingItem,
              idx,
              selectedCeilingItem?.id === ceilingItem.id,
              () => setSelectedCeilingItem(ceilingItem),
              'ceiling',
            );
          })}
        </View>
        {/* Walls Section */
}
{
  /* <Text style={styles.sectionTitle}>Walls</Text>
        <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
          <Text style={styles.dropdownText}>Select Paint Type</Text>
          <Icon name="keyboard-arrow-down" size={20} color="#999" />
        </TouchableOpacity>

        {existingDetails?.walls?.map((item, idx) => {
          const wallItem = { ...item, id: `wall-${idx}` }; // ensure unique id
          const isSelected = selectedWallItem.some(
            wall => wall.id === wallItem.id,
          );

          return renderCard(
            wallItem,
            idx,
            isSelected,
            () => {
              if (isSelected) {
                setSelectedWallItem(
                  selectedWallItem.filter(wall => wall.id !== wallItem.id),
                );
              } else {
                setSelectedWallItem([...selectedWallItem, wallItem]);
              }
            },
            'wall',
          );
        })} */
}

{
  /* Ceiling Section */
}
