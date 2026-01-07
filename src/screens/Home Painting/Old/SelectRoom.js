import { useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import Entypo from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import PageLoader from '../../components/PageLoader';

const SelectRoom = ({ navigation }) => {
  const route = useRoute();

  const {
    quoteId, // destination quote (after clone)
    leadId,
    measurementId,
    vendorId,
    quote: initialQuote, // optional, if you pass duplicated quote in params
    dupMode = false,
    sourceQuoteId = null, // only used for old prefill path
  } = route.params || {};
  const { predefPackage } = route.params || {};
  const [estimateData] = useEstimateContext();
  const { autoApplyOnMount = true } = route.params || {};
  const didAutoApplyRef = useRef(false);
  const roomsData = estimateData?.rooms || {};
  const hasInitial = !!(initialQuote && Array.isArray(initialQuote.lines));
  const [activeQuote, setActiveQuote] = useState(
    hasInitial ? initialQuote : null,
  );
  const [loadingQuote, setLoadingQuote] = useState(!hasInitial);
  const [isLoading, setIsLoading] = useState(!hasInitial);
  const [paintsCache, setPaintsCache] = useState(null);
  const [additionalByRoom, setAdditionalByRoom] = useState({});
  console.log('additionalByRoom', additionalByRoom);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (paintsCache) return;
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.GET_PAINT}`,
        );
        if (alive) setPaintsCache(data?.paints || data?.data?.paints || []);
      } catch (e) {
        // ignore – SelectPaint will refetch if needed
      }
    })();
    return () => {
      alive = false;
    };
  }, [paintsCache]);

  const onSavedAdditionalLocal = (roomName, respData) => {
    const updatedAdditionalByRoom = { ...additionalByRoom };
    updatedAdditionalByRoom[norm(roomName)] = respData;
    setAdditionalByRoom(updatedAdditionalByRoom);
  };

  useEffect(() => {
    let alive = true;

    const fetchFromId = async idToFetch => {
      setIsLoading(true);
      try {
        setLoadingQuote(true);
        const url = `${API_BASE_URL}${
          API_ENDPOINTS.GET_QUOTATION
        }${encodeURIComponent(idToFetch)}`;
        const { data } = await axios.get(url);
        const q = data?.data?.quote || data?.data || null;
        console.log('q', q);
        if (alive) setActiveQuote(q);
      } catch (e) {
        if (alive) setActiveQuote(null);
      } finally {
        setIsLoading(false);
        if (alive) setLoadingQuote(false);
      }
    };

    if (hasInitial) {
      // ← you passed `quote: duplicated`
      setLoadingQuote(false);
      setIsLoading(false);
      return () => {
        alive = false;
      };
    }

    if (dupMode && sourceQuoteId) {
      fetchFromId(sourceQuoteId); // legacy prefill
    } else if (quoteId) {
      fetchFromId(quoteId); // normal fetch (after clone)
    } else {
      setActiveQuote(null);
      setLoadingQuote(false);
    }

    return () => {
      alive = false;
    };
  }, [dupMode, sourceQuoteId, quoteId, hasInitial]);

  useEffect(() => {
    if (!autoApplyOnMount) return;
    if (!predefPackage || !quoteId) return;
    if (didAutoApplyRef.current) return;

    // Ensure rooms are available
    const allRooms = [
      ...(groupedRooms?.Interior || []),
      ...(groupedRooms?.Exterior || []),
      ...(groupedRooms?.Others || []),
    ];
    if (!allRooms.length) return;

    // Build lines from package, but only for rooms without saved pricing
    const toSave = allRooms
      .map(r => buildLineFromPackage(r, predefPackage))
      .filter(l => l && l.subtotal > 0 && !linesByRoom[norm(l.roomName)]);

    if (!toSave.length) {
      didAutoApplyRef.current = true;
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        for (const l of toSave) {
          const saved = await saveRoomLine(quoteId, l);
          // keep local state in sync
          setActiveQuote(q => {
            const lines = [...(q?.lines || [])];
            const i = lines.findIndex(
              x => norm(x.roomName) === norm(saved.roomName),
            );
            if (i >= 0) lines[i] = saved;
            else lines.push(saved);
            return { ...(q || {}), lines };
          });
        }
      } catch (e) {
        Alert.alert(
          'Error',
          e?.response?.data?.message || 'Failed to apply package',
        );
      } finally {
        didAutoApplyRef.current = true; // prevent re-runs
        setIsLoading(false);
      }
    })();
  }, [
    autoApplyOnMount,
    predefPackage,
    quoteId,
    groupedRooms, // ensures rooms are ready
    linesByRoom, // allows skipping already-priced rooms
  ]);

  const norm = s => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();

  useEffect(() => {
    // pull additional services from the quote lines
    const map = {};
    for (const l of activeQuote?.lines || []) {
      map[norm(l.roomName)] = {
        additionalServices: Array.isArray(l.additionalServices)
          ? l.additionalServices
          : [],
        additionalTotal: Number(l.additionalTotal || 0),
      };
    }
    setAdditionalByRoom(map);
  }, [activeQuote]);

  const linesByRoom = useMemo(() => {
    const map = {};
    for (const l of activeQuote?.lines || []) {
      // prefer an explicit savedName if you ever add it; fallback to roomName
      const key = norm(l.savedName || l.roomName);
      map[key] = l;
    }
    return map;
  }, [activeQuote]);

  const sectionTypes = ['Interior', 'Exterior', 'Others'];

  const groupedRooms = Object.entries(roomsData).reduce(
    (acc, [name, details]) => {
      if (!acc[details.sectionType]) acc[details.sectionType] = [];
      acc[details.sectionType].push({ name, ...details });
      return acc;
    },
    {},
  );

  sectionTypes.forEach(t => (groupedRooms[t] ||= []));
  const [activeTab, setActiveTab] = useState(
    Object.keys(groupedRooms)[0] || 'Interior',
  );

  const PUTTY_RATE = 10;

  // small helpers
  const fmtMoney = n => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtSqft = n => `${Number(n || 0)} sq ft`;
  const toNum = v => Number(v || 0);
  const sumMoney = arr => arr.reduce((s, b) => s + toNum(b.price), 0);
  const sumSqftLn = arr => arr.reduce((s, b) => s + toNum(b.sqft), 0);

  const indexPackage = pkg => {
    // key: `${category}|${itemName}` e.g. "Interior|Ceiling", "Others|Others"
    const byKey = new Map();
    for (const d of pkg?.details ?? []) {
      const key = `${(d.category || '').trim()}|${(d.itemName || '').trim()}`;
      byKey.set(key, d);
    }
    return byKey;
  };

  const toPaintStub = d => {
    if (!d) return null;
    // Keep the same shape your BE expects from SelectPaint onDone()
    return {
      id: String(d._id?.$oid || d._id || d.id || `pkg-${d.paintName}`),
      name: d.paintName,
      isSpecial: /special/i.test(d.paintType || ''),
      price: Number(d.paintPrice || 0),
      includePuttyOnFresh: !!d.includePuttyOnFresh,
      includePuttyOnRepaint: !!d.includePuttyOnRepaint,
    };
  };

  const netSqft = it => Number(it?.totalSqt ?? it?.area ?? 0) || 0;

  const unitFrom = (paintStub, mode) => {
    if (!paintStub) return 0;
    const base = Number(paintStub.price || 0);
    const needsPutty =
      (mode === 'FRESH' && paintStub.includePuttyOnFresh) ||
      (mode !== 'FRESH' && paintStub.includePuttyOnRepaint);
    return base + (needsPutty ? PUTTY_RATE : 0);
  };

  const mkLineItem = (kind, it, paintStub) => {
    const sqft = Math.max(0, netSqft(it));
    if (!paintStub || sqft <= 0) return null;
    const unit = unitFrom(paintStub, it.mode);
    return {
      type: kind, // "Ceiling" | "Wall" | "Measurement"
      mode: it.mode, // "FRESH" | "REPAINT"
      sqft,
      unitPrice: unit,
      price: Number((sqft * unit).toFixed(2)),
      paintId: paintStub.id,
      paintName: paintStub.name,
      displayIndex:
        typeof it._origIdx === 'number' ? it._origIdx + 1 : undefined,
    };
  };
  const buildLineFromPackage = (room, pkg) => {
    if (!room || !pkg) return null;

    const map = indexPackage(pkg);
    const sect = (room.sectionType || '').trim(); // "Interior" | "Exterior" | "Others"

    // Pick paints by room type
    const pCeil =
      sect !== 'Others' ? toPaintStub(map.get(`${sect}|Ceiling`)) : null;
    const pWall =
      sect !== 'Others' ? toPaintStub(map.get(`${sect}|Walls`)) : null;
    const pMeas =
      sect === 'Others' ? toPaintStub(map.get(`Others|Others`)) : null;

    // Build breakdown from room items
    const ceilings = (room.ceilings || [])
      .map(it => mkLineItem('Ceiling', it, pCeil))
      .filter(Boolean);
    const walls = (room.walls || [])
      .map(it => mkLineItem('Wall', it, pWall))
      .filter(Boolean);
    const meas = (room.measurements || [])
      .map(it => mkLineItem('Measurement', it, pMeas))
      .filter(Boolean);

    const sum = arr => arr.reduce((s, x) => s + (x?.price || 0), 0);

    const line = {
      roomName: room.name,
      sectionType: sect,
      selectedPaints: {
        ceiling: pCeil,
        wall: pWall,
        measurements: pMeas,
      },
      breakdown: [...ceilings, ...walls, ...meas],
      ceilingsTotal: sum(ceilings),
      wallsTotal: sum(walls),
      othersTotal: sum(meas),
      subtotal: sum([...ceilings, ...walls, ...meas]),
    };

    // If the package doesn’t define a paint for some part, those arrays are empty.
    // That’s fine—we’ll just not price that part.
    return line;
  };

  // Save one room's package pricing into the quote (same endpoint you already use)
  const saveRoomLine = async (quoteId, line) => {
    const url = `${API_BASE_URL}${
      API_ENDPOINTS.UPDATE_QUOTE_PRICING
    }${encodeURIComponent(quoteId)}/rooms/${encodeURIComponent(
      line.roomName,
    )}/pricing`;
    const { data } = await axios.post(url, line);
    return data?.data?.line || line;
  };

  // paint object from the saved line
  const getPaintFromLine = (line, kindKey) =>
    line?.selectedPaints?.[kindKey] ?? null;
  const net = it => toNum(it.totalSqt ?? it.area ?? 0);
  const pick = (line, type) =>
    (line?.breakdown || []).filter(b => b.type === type);
  const sortByDisplay = (a, b) =>
    (a.displayIndex ?? 1e9) - (b.displayIndex ?? 1e9);
  const sum = arr => arr.reduce((s, b) => s + (b.price || 0), 0);

  const processLabel = m =>
    m === 'FRESH' ? 'Fresh Paint' : 'Repaint With Primer';
  const isOthersTab = room => (room?.sectionType || '').trim() === 'Others';

  const isSpecialPaint = paint =>
    !!paint?.isSpecial || /spl|special/i.test(paint?.name || '');

  // fetch the selected paint for a kind (“ceiling” | “wall” | “measurements”)
  const getSelectedPaintFor = (room, kind) =>
    room?.pricing?.selectedPaints?.[kind] ?? null;

  // unit price for a given paint + process
  const unitPrice = (paint, mode) => {
    if (!paint) return 0;
    const base = toNum(paint.price);
    const addPutty =
      mode === 'FRESH'
        ? !!paint.includePuttyOnFresh
        : !!paint.includePuttyOnRepaint;
    return base + (addPutty ? PUTTY_RATE : 0);
  };

  const specialBadge = (
    <Text style={{ color: '#ED1F24', fontWeight: '700' }}>S </Text>
  );

  // combine label rules (Normal shows process, Special/Others do not)
  const composePaintLabel = (room, paint, mode) => {
    if (!paint) return '—';
    const special = isSpecialPaint(paint);
    if (isOthersTab(room) || special) {
      return (
        <Text>
          {special ? specialBadge : null}
          <Text>{paint.name}</Text>
        </Text>
      );
    }
    return `${paint.name} ${processLabel(mode)}`;
  };
  // sum sqft of an item list
  const sumSqft = arr => arr.reduce((s, it) => s + net(it), 0);

  // sum amount of an item list, honoring per-item process pricing
  const sumAmount = (items, paint) =>
    items.reduce((s, it) => s + net(it) * unitPrice(paint, it.mode), 0);

  const summarizeKind = (room, kind) => {
    const items =
      kind === 'measurements'
        ? room?.measurements || []
        : room?.[kind + 's'] || [];

    const positive = items.filter(it => net(it) > 0);
    if (!positive.length) return [];

    const paint = getSelectedPaintFor(room, kind);
    if (!paint) return [];
    // For Special paints or Others tab: 1 combined line (no process suffix)
    if (isOthersTab(room) || isSpecialPaint(paint)) {
      const sqft = sumSqft(positive);
      const amount = sumAmount(positive, paint);
      const base =
        kind === 'measurements'
          ? room?.name?.replace(/s$/i, '') || 'Measurement'
          : kind.charAt(0).toUpperCase() + kind.slice(1);
      return [
        {
          paintText: paint?.name ?? '—',
          countText: `${base} (${positive.length})`,
          sqft,
          amount,
        },
      ];
    }

    // Normal paints: split by process (Fresh / Repaint) and show process in name
    const fresh = positive.filter(it => it.mode === 'FRESH');
    const repaint = positive.filter(it => it.mode !== 'FRESH');

    const base =
      kind === 'measurements'
        ? room?.name?.replace(/s$/i, '') || 'Measurement'
        : kind.charAt(0).toUpperCase() + kind.slice(1);

    const lines = [];

    if (fresh.length) {
      lines.push({
        paintText: composePaintLabel(room, paint, 'FRESH'),
        countText: `${base} (${fresh.length})`,
        sqft: sumSqft(fresh),
        amount: sumAmount(fresh, paint),
      });
    }
    if (repaint.length) {
      lines.push({
        paintText: composePaintLabel(room, paint, 'REPAINT'),
        countText: `${base} (${repaint.length})`,
        sqft: sumSqft(repaint),
        amount: sumAmount(repaint, paint),
      });
    }

    return lines;
  };

  const badgeSpecial = paint =>
    paint?.isSpecial ? (
      <Text style={{ color: '#ED1F24', fontWeight: '700' }}>S </Text>
    ) : null;

  const modesSuffix = (items = []) => {
    const hasFresh = items.some(it => it.mode === 'FRESH');
    const hasRepaint = items.some(it => it.mode === 'REPAINT');
    if (hasFresh && hasRepaint) return ' – Fresh Paint & Repaint With Primer';
    if (hasFresh) return ' – Fresh Paint';
    if (hasRepaint) return ' – Repaint With Primer';
    return '';
  };

  // Build reductions (per room) from additional services: partial sqft & full zero
  const buildReductionsForRoom = room => {
    const extra = additionalByRoom[norm(room.name)] || {};
    const list = Array.isArray(extra.additionalServices)
      ? extra.additionalServices
      : [];
    const partial = new Map(); // surface -> sqft to subtract
    const fullSet = new Set(); // surfaces fully zeroed (without paint + no area)
    for (const it of list) {
      if (it.withPaint === false && it.surfaceType) {
        const k = norm(it.surfaceType);
        const a = Number(it.areaSqft || 0);
        if (a > 0) partial.set(k, (partial.get(k) || 0) + a);
        else fullSet.add(k); // treat '0' area as "whole surface handled" → price becomes 0
      }
    }
    return { partial, fullSet };
  };

  // Make the human label we also use as key: "Wall 1", "Ceiling 2", or "Measurement 1"
  const labelForBreakdown = (room, b) => {
    const base =
      b.type === 'Measurement'
        ? room?.name?.replace(/s$/i, '') || 'Measurement'
        : b.type;
    const idx = Number(b.displayIndex || 1);
    return `${base} ${idx}`;
  };

  const renderAdditionalForSurface = (room, surfaceLabel) => {
    const extra = additionalByRoom[norm(room.name)];
    if (!extra?.additionalServices?.length) return null;
    const key = String(surfaceLabel).trim().toLowerCase();
    const list = extra.additionalServices.filter(
      s =>
        String(s.surfaceType || '')
          .trim()
          .toLowerCase() === key,
    );
    if (!list.length) return null;
    return (
      <View style={{ marginTop: 4 }}>
        {list.map((it, i) => (
          <View key={`svc-${i}`} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{it.serviceType}</Text>
            <Text style={styles.detailValue}>
              {Number(it.areaSqft || 0) > 0
                ? `${Number(it.areaSqft)} sq ft`
                : '-'}
            </Text>
            <Text style={styles.detailValue}>
              {fmtMoney(Number(it.total || 0))}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const summarizeFromLine = (room, line, type) => {
    // const items = pick(line, type).filter(ln => toNum(ln.sqft) > 0); // only selected
    // if (!items.length) return [];

    const all = pick(line, type);
    if (!all.length) return [];

    const { partial, fullSet } = buildReductionsForRoom(room);

    const items = all
      .map(b => {
        const label = norm(labelForBreakdown(room, b)); // e.g. "wall 1"
        const zeroAll = fullSet.has(label);
        const reduce = partial.get(label) || 0;
        const oldSqft = toNum(b.sqft);
        const newSqft = zeroAll ? 0 : Math.max(0, oldSqft - reduce);
        if (newSqft <= 0) return null;
        return {
          ...b,
          sqft: newSqft,
          price: Number((newSqft * toNum(b.unitPrice)).toFixed(2)),
        };
      })
      .filter(Boolean);
    if (!items.length) return [];

    const base =
      type === 'Measurement'
        ? room?.name?.replace(/s$/i, '') || 'Measurement'
        : type;

    const kindKey =
      type === 'Ceiling'
        ? 'ceiling'
        : type === 'Wall'
        ? 'wall'
        : 'measurements';

    const paint = getPaintFromLine(line, kindKey);
    if (!paint) return [];

    // Special paint or "Others" tab → single combined row
    if (isOthersTab(room) || isSpecialPaint(paint)) {
      return [
        {
          paintText: paint?.name ?? '—',
          countText: `${base} (${items.length})`,
          sqft: sumSqftLn(items),
          amount: sumMoney(items),
        },
      ];
    }

    // Normal paint → split by process so Living Room can show two rows
    const fresh = items.filter(i => i.mode === 'FRESH');
    const repaint = items.filter(i => i.mode !== 'FRESH');

    const rows = [];
    if (fresh.length) {
      rows.push({
        paintText: composePaintLabel(room, paint, 'FRESH'), // "… Fresh Paint"
        countText: `${base} (${fresh.length})`,
        sqft: sumSqftLn(fresh),
        amount: sumMoney(fresh),
      });
    }
    if (repaint.length) {
      rows.push({
        paintText: composePaintLabel(room, paint, 'REPAINT'), // "… Repaint With Primer"
        countText: `${base} (${repaint.length})`,
        sqft: sumSqftLn(repaint),
        amount: sumMoney(repaint),
      });
    }
    return rows;
  };

  const renderFromQuoteLine = (room, line) => {
    const cSum = summarizeFromLine(room, line, 'Ceiling');
    const wSum = summarizeFromLine(room, line, 'Wall');
    const mSum = summarizeFromLine(room, line, 'Measurement');

    const hasAny = cSum.length || wSum.length || mSum.length;
    if (!hasAny) return null;

    const Row = ({ r }) => (
      <>
        <Text style={styles.paintName /* add in styles if missing */}>
          {r.paintText}
        </Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{r.countText}</Text>
          <Text style={styles.detailValue}>{fmtSqft(r.sqft)}</Text>
          <Text style={styles.detailValue}>{fmtMoney(r.amount)}</Text>
        </View>
      </>
    );

    const renderAdditionalBlock = room => {
      const extra = additionalByRoom[norm(room.name)];
      if (!extra) return null;

      const list = Array.isArray(extra.additionalServices)
        ? extra.additionalServices
        : [];
      if (!list.length) return null;

      return (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.detailTitle}>Additional Services</Text>

          {list.map((it, i) => (
            <View key={`add-${i}`}>
              <Text style={styles.detailLabel}> {it.serviceType} </Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {/* {it.materialName ? ` — ${it.materialName}` : ''} */}
                  {it.surfaceType ? ` ${it.surfaceType}` : ''}
                  {/* {it.withPaint === true
                    ? ' — With Paint'
                    : it.withPaint === false
                    ? ' — Without Paint'
                    : ''} */}
                </Text>

                {/* Middle column: show qty × rate if area>0, else a dash */}
                <Text style={styles.detailValue}>
                  {/* {Number(it.areaSqft || 0) > 0
                    ? `${Number(it.areaSqft)} sq ft × ₹${Number(
                        it.unitPrice || 0,
                      )}`
                    : '—'} */}

                  {Number(it.areaSqft || 0) > 0
                    ? `${Number(it.areaSqft)} sq ft`
                    : `-`}
                </Text>

                {/* Right column: total */}
                <Text style={styles.detailValue}>
                  {fmtMoney(Number(it.total || 0))}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.underlineRed} />
          {/* <View style={styles.detailRow}>
            <Text style={styles.totalCostLabel}>Additional Total</Text>
            <Text style={styles.totalCostValue}>
              {fmtMoney(Number(extra.additionalTotal || 0))}
            </Text>
          </View> */}
        </View>
      );
    };

    return (
      <View style={{ marginTop: 8 }}>
        {room.sectionType !== 'Others' ? (
          <>
            {!!cSum.length && (
              <>
                <Text style={styles.detailTitle}>Ceilings</Text>
                {cSum.map((r, i) => (
                  <Row key={`c-${i}`} r={r} />
                ))}
                {!!wSum.length && <View style={styles.underlineRed} />}
              </>
            )}

            {!!wSum.length && (
              <>
                <Text style={styles.detailTitle}>Walls</Text>
                {wSum.map((r, i) => (
                  <Row key={`w-${i}`} r={r} />
                ))}
                <View style={styles.underlineRed} />
              </>
            )}
          </>
        ) : (
          !!mSum.length && (
            <>
              <Text style={styles.detailTitle}>{room.name}</Text>
              {mSum.map((r, i) => (
                <Row key={`m-${i}`} r={r} />
              ))}
              <View style={styles.underlineRed} />
            </>
          )
        )}
        {renderAdditionalBlock(room)}

        <View style={styles.detailRow}>
          <Text style={styles.totalCostLabel}>Total Cost</Text>
          <Text style={styles.totalCostValue}>
            {/* {fmtMoney(
              sum(line.breakdown) +
                (additionalByRoom[norm(room.name)]?.total || 0),
            )} */}
            {fmtMoney(
              sum(line.breakdown) +
                Number(additionalByRoom[norm(room.name)]?.additionalTotal || 0),
            )}
            {/* {fmtMoney(sum(line.breakdown))} */}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      {(isLoading || loadingQuote) && <PageLoader />}

      <View style={styles.container}>
        <View style={styles.tabRow}>
          {sectionTypes.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setActiveTab(type)}
              style={[styles.tabButton, activeTab === type && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === type && styles.activeTabText,
                ]}
              >
                {type} ({groupedRooms[type].length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView contentContainerStyle={styles.roomList}>
          {groupedRooms[activeTab]?.map((room, index) => {
            const line = linesByRoom[norm(room.name)];
            const hasPricing = !!line;
            const pkgLine =
              !hasPricing && predefPackage
                ? buildLineFromPackage(room, predefPackage)
                : null;

            {
              loadingQuote
                ? null
                : hasPricing
                ? renderFromQuoteLine(room, line)
                : pkgLine
                ? renderFromQuoteLine(room, pkgLine)
                : null;
            }
            return (
              <View key={index} style={styles.summaryCard}>
                <TouchableOpacity
                  style={styles.rowHeader}
                  onPress={() =>
                    navigation.navigate('SelectPaint', {
                      dupMode,
                      roomName: room.name,
                      existingRoom: room,
                      quoteId,
                      existingLine: line || null,
                      paintsCache,
                      onSaved: newLine => {
                        setActiveQuote(q => {
                          const lines = [...(q?.lines || [])];
                          const i = lines.findIndex(
                            l => norm(l.roomName) === norm(room.name),
                          );
                          if (i >= 0) lines[i] = newLine;
                          else lines.push(newLine);
                          return { ...(q || {}), lines };
                        });
                      },
                      // merge additional services in SelectRoom state
                      onSavedAdditionalLocal: respData => {
                        const key = norm(room.name);
                        setAdditionalByRoom(prev => {
                          const old = prev[key]?.additionalServices || [];
                          const incoming = respData?.additionalServices || [];
                          const keyOf = x =>
                            `${(x.serviceType || '').trim()}|${(
                              x.surfaceType || ''
                            ).trim()}|${x.materialId || x.materialName || ''}|${
                              x.withPaint ? 'W' : 'NW'
                            }`;
                          const merged = new Map(old.map(p => [keyOf(p), p]));
                          incoming.forEach(n => merged.set(keyOf(n), n));
                          const list = Array.from(merged.values());
                          const total = list.reduce(
                            (s, it) => s + Number(it.total || 0),
                            0,
                          );
                          return {
                            ...prev,
                            [key]: {
                              additionalServices: list,
                              additionalTotal: Number(total.toFixed(2)),
                            },
                          };
                        });
                      },
                      additionalForRoom:
                        additionalByRoom[norm(room.name)] || null,
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.roomText}>{room.name}</Text>
                  <Entypo
                    name="chevron-with-circle-right"
                    size={18}
                    color="#FF0000"
                  />
                </TouchableOpacity>

                {loadingQuote
                  ? null
                  : hasPricing
                  ? renderFromQuoteLine(room, line)
                  : null}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('QuoteSummary', {
                quoteId: quoteId,
                quote: activeQuote || null,
              })
            }
            style={styles.continueButton}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default SelectRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: '#ED1F24',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#555',
  },
  activeTabText: {
    color: '#ED1F24',
    fontFamily: 'Poppins-SemiBold',
  },
  roomList: {
    padding: 16,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#eee',
  },
  roomText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#fff',
  },
  detailSection: {
    marginBottom: 8,
    paddingTop: 10,
  },
  detailTitle: {
    color: '#ED1F24',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    flexShrink: 1,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 12,
    color: '#000',
    // marginBottom: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  totalCostLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: 'black',
  },
  totalCostValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#ED1F24',
    textAlign: 'right',
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#ED1F24',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  continueButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  underlineRed: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderStyle: 'dashed',
    marginVertical: 8,
    width: '100%',
    alignSelf: 'center',
  },
  paintName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#111',
    marginTop: 4,
    marginBottom: 2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});
