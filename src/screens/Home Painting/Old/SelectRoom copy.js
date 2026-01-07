import { useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import Entypo from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';

const SelectRoom = ({ navigation }) => {
  const route = useRoute();
  // const selectedPackage = route.params.selectedPackage;
  const {
    quoteId,
    leadId,
    measurementId,
    vendorId,
    quote: initialQuote,
  } = route.params;
  const [estimateData] = useEstimateContext();

  console.log('estimateData', estimateData);
  const roomsData = estimateData?.rooms || {};

  const [activeQuote, setActiveQuote] = useState(initialQuote || null);

  useEffect(() => {
    if (!activeQuote && quoteId) {
      axios
        .get(`${API_BASE_URL}${API_ENDPOINTS.GET_QUOTATION}${quoteId}`)
        .then(({ data }) => setActiveQuote(data.data))
        .catch(() => {});
    }
  }, [quoteId, activeQuote]);

  // Fast lookup: roomName -> quote line (pricing)
  const linesByRoom = useMemo(() => {
    const map = {};
    (activeQuote?.lines || []).forEach(l => {
      map[l.roomName] = l;
    });
    return map;
  }, [activeQuote]);

  const sectionTypes = ['Interior', 'Exterior', 'Others'];

  const groupedRooms = Object.entries(roomsData).reduce(
    (acc, [name, details]) => {
      if (!acc[details.sectionType]) {
        acc[details.sectionType] = [];
      }
      acc[details.sectionType].push({ name, ...details });
      return acc;
    },
    {},
  );

  const [activeTab, setActiveTab] = useState(Object.keys(groupedRooms)[0]);
  sectionTypes.forEach(type => {
    if (!groupedRooms[type]) {
      groupedRooms[type] = [];
    }
  });
  const [roomDetails, setRoomDetails] = useState({});

  const PUTTY_RATE = 10;

  const fmtMoney = n => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtSqft = n => `${Number(n || 0)} sq ft`;
  const isOthers = room => (room?.sectionType || '').trim() === 'Others';
  const toNum = v => Number(v || 0);
  const net = it => toNum(it.totalSqt ?? it.area ?? 0);

  const pick = (line, type) =>
    (line?.breakdown || []).filter(b => b.type === type);
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

  // detect which modes exist, but only count items with positive net area
  const hasFreshRepaintFor = (arr = []) => {
    let hasFresh = false,
      hasRepaint = false;
    for (const it of arr) {
      const net = Number(it?.totalSqt ?? it?.area ?? 0);
      if (net > 0) {
        if (it.mode === 'FRESH') hasFresh = true;
        if (it.mode === 'REPAINT') hasRepaint = true;
      }
    }
    return { hasFresh, hasRepaint };
  };

  const buildPaintTypeText = (paint, items, isOthers) => {
    if (!paint) return '—';
    if (paint.isSpecial || isOthers) {
      return (
        <Text>
          {badgeSpecial(paint)}
          <Text>{paint.name}</Text>
        </Text>
      );
    }
    return (
      <Text>
        {badgeSpecial(paint)}
        <Text>
          {paint.name}
          {modesSuffix(items)}
        </Text>
      </Text>
    );
  };

  const renderFromQuoteLine = (room, line) => {
    const isOthers = room.sectionType === 'Others';
    const c = pick(line, 'Ceiling');
    const w = pick(line, 'Wall');
    const m = pick(line, 'Measurement');
    const any = c.length || w.length || m.length;

    if (!any) return null;

    return (
      <View style={{ marginTop: 8 }}>
        {room.sectionType !== 'Others' ? (
          <>
            {!!c.length && (
              <>
                <Text style={styles.detailTitle}>Ceilings</Text>
                {c.map((ln, i) => (
                  <View key={`c-${i}`} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ceiling ({i + 1})</Text>
                    <Text style={styles.detailValue}>{fmtSqft(ln.sqft)}</Text>
                    <Text style={styles.detailValue}>{fmtMoney(ln.price)}</Text>
                  </View>
                ))}
                {!!w.length && <View style={styles.underlineRed} />}
              </>
            )}

            {!!w.length && (
              <>
                <Text style={styles.detailTitle}>Walls</Text>
                {w.map((ln, i) => (
                  <View key={`w-${i}`} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Wall ({i + 1})</Text>
                    <Text style={styles.detailValue}>{fmtSqft(ln.sqft)}</Text>
                    <Text style={styles.detailValue}>{fmtMoney(ln.price)}</Text>
                  </View>
                ))}
                <View style={styles.underlineRed} />
              </>
            )}
          </>
        ) : (
          !!m.length && (
            <>
              <Text style={styles.detailTitle}>{room.name}</Text>
              {m.map((ln, i) => (
                <View key={`m-${i}`} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {room.name.replace(/s$/i, '')} ({i + 1})
                  </Text>
                  <Text style={styles.detailValue}>{fmtSqft(ln.sqft)}</Text>
                  <Text style={styles.detailValue}>{fmtMoney(ln.price)}</Text>
                </View>
              ))}
              <View style={styles.underlineRed} />
            </>
          )
        )}

        <View style={styles.detailRow}>
          <Text style={styles.totalCostLabel}>Total Cost</Text>
          <Text style={styles.totalCostValue}>
            {fmtMoney(sum(line.breakdown))}
          </Text>
        </View>
      </View>
    );
  };

  return (
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
          const ceilingLines = summarizeKind(room, 'ceiling');
          const wallLines = summarizeKind(room, 'wall');
          const measLines = summarizeKind(room, 'measurements');
          const showCeil = ceilingLines.length > 0;
          const showWall = wallLines.length > 0;
          const showMeas = measLines.length > 0;

          const anyLines = showCeil || showWall || showMeas;

          const total = [...ceilingLines, ...wallLines, ...measLines].reduce(
            (s, ln) => s + ln.amount,
            0,
          );

          return (
            <View key={index} style={styles.summaryCard}>
              <TouchableOpacity
                style={styles.rowHeader}
                onPress={() =>
                  navigation.navigate('BedroomDetail', {
                    roomName: room.name,
                    existingDetails: room,
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

              {room.sectionType !== 'Others' ? (
                <>
                  {showCeil && (
                    <>
                      <Text style={styles.detailTitle}>Ceilings</Text>
                      {ceilingLines.map((ln, i) => (
                        <View key={`c-${i}`} style={{ marginBottom: 6 }}>
                          <Text style={styles.paintName}>{ln.paintText}</Text>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              {ln.countText}
                            </Text>
                            <Text style={styles.detailValue}>
                              {fmtSqft(ln.sqft)}
                            </Text>
                            <Text style={styles.detailValue}>
                              {fmtMoney(ln.amount)}
                            </Text>
                          </View>
                        </View>
                      ))}
                      {showWall && <View style={styles.underlineRed} />}
                    </>
                  )}

                  {showWall && (
                    <>
                      <Text style={styles.detailTitle}>Walls</Text>
                      {wallLines.map((ln, i) => (
                        <View key={`w-${i}`} style={{ marginBottom: 6 }}>
                          <Text style={styles.paintName}>{ln.paintText}</Text>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              {ln.countText}
                            </Text>
                            <Text style={styles.detailValue}>
                              {fmtSqft(ln.sqft)}
                            </Text>
                            <Text style={styles.detailValue}>
                              {fmtMoney(ln.amount)}
                            </Text>
                          </View>
                        </View>
                      ))}
                      {anyLines && <View style={styles.underlineRed} />}
                    </>
                  )}
                </>
              ) : (
                showMeas && (
                  <>
                    <Text style={styles.detailTitle}>{room.name}</Text>
                    {measLines.map((ln, i) => (
                      <View key={`m-${i}`} style={{ marginBottom: 6 }}>
                        <Text style={styles.paintName}>{ln.paintText}</Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{ln.countText}</Text>
                          <Text style={styles.detailValue}>
                            {fmtSqft(ln.sqft)}
                          </Text>
                          <Text style={styles.detailValue}>
                            {fmtMoney(ln.amount)}
                          </Text>
                        </View>
                      </View>
                    ))}
                    {anyLines && <View style={styles.underlineRed} />}
                  </>
                )
              )}

              {anyLines && (
                <View style={[styles.detailRow, { marginTop: 6 }]}>
                  <Text style={styles.totalCostLabel}>Total Cost</Text>
                  <Text style={styles.totalCostValue}>{fmtMoney(total)}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('QuoteSummary')}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    color: '#000',
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
