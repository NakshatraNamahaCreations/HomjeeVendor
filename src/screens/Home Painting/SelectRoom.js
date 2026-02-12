import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import PageLoader from '../../components/PageLoader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import { useBackHandler } from '@react-native-community/hooks';

const SelectRoom = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    quoteId,
    quote: initialQuote,
    dupMode = false,
    sourceQuoteId = null,
  } = route.params || {};
  const { predefPackage } = route.params || {};
  const {
    autoApplyOnMount = true,
    applyMode = 'merge',
    applyKey,
  } = route.params || {};
  const [applyStage, setApplyStage] = useState('idle');
  const [estimateData] = useEstimateContext();
  const didAutoApplyRef = useRef(false);
  const isFocused = useIsFocused();
  const roomsData = estimateData?.rooms || {};
  const hasInitial = !!(initialQuote && Array.isArray(initialQuote.lines));
  const [activeQuote, setActiveQuote] = useState(
    hasInitial ? initialQuote : null,
  );
  console.log('applyMode', applyMode);

  const [loadingQuote, setLoadingQuote] = useState(!hasInitial);
  const [isLoading, setIsLoading] = useState(!hasInitial);
  const [paintsCache, setPaintsCache] = useState(null);
  const [responseLoader, setResponseLoader] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const confirmActionRef = useRef(null);

  const saveRoomLine = async (quoteId, line) => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.UPDATE_QUOTE_PRICING
        }${encodeURIComponent(quoteId)}/rooms/${encodeURIComponent(
          line.roomName,
        )}/pricing`;
      console.log('➡️ POST pricing payload', JSON.stringify(line, null, 2));
      const { data } = await axios.post(url, line);
      return data?.data?.line || line;
    } catch (e) {
      console.warn('❌ pricing failed', e?.response?.status, e?.response?.data);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Server error';
      Alert.alert('Error', msg);
      throw e;
    }
  };

  const clearQuoteServices = async (quoteId, line) => {
    setResponseLoader(true);
    console.log('line', line);

    try {
      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.CLEAR_ROOM_VALUES}${encodeURIComponent(
          quoteId,
        )}/clear`,
      );
      console.log('Quote services cleared:', response.data);
    } catch (error) {
      console.error(
        'Error clearing quote services:',
        error.response?.data?.message || error.message,
      );
    } finally {
      setResponseLoader(false);
    }
  };

  const emptyLineForRoom = room => ({
    roomName: room.name,
    sectionType: room.sectionType,
    selectedPaints: { ceiling: null, wall: null, measurements: null },
    breakdown: [],
    ceilingsTotal: 0,
    wallsTotal: 0,
    othersTotal: 0,
    additionalServices: [],
    additionalTotal: 0,
    subtotal: 0,
  });

  // REPLACE confirmDiscardAndGoBack with:
  // const confirmDiscardAndLeave = goBackCallback => {
  //   Alert.alert(
  //     'Discard changes?',
  //     'Are you sure you want to exit without saving the changes?',
  //     [
  //       { text: 'No', style: 'cancel' },
  //       {
  //         text: 'Yes',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             // Call zeroizeQuote to clear data
  //             await zeroizeQuote();

  //             // After clearing the quote, navigate back
  //             goBackCallback(); // Now go back to the previous screen
  //           } catch (error) {
  //             console.log(
  //               'Something went wrong while discarding changes:',
  //               error,
  //             );
  //           }
  //         },
  //       },
  //     ],
  //   );
  // };

  const confirmDiscardAndLeave = goBackCallback => {
    confirmActionRef.current = goBackCallback;
    setShowAlertPopup(true);
  };

  useBackHandler(() => {
    if (!isFocused) return false;
    if (dupMode) {
      return false; // Don't handle the back press if in duplication mode
    }
    if (showAlertPopup) {
      // if popup is already shown, close it instead of navigating
      setShowAlertPopup(false);
      return true;
    }

    // Call the confirmation function with navigation.goBack as callback
    confirmDiscardAndLeave(() => navigation.goBack());

    return true; // We handled the back button
  });

  useFocusEffect(
    React.useCallback(
      () => {
        const onBackPress = () => {
          // custom modal flow
          confirmDiscardAndLeave(() => navigation.goBack());
          return true;
        };
        const sub = BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress,
        );
        return () => sub.remove(); // remove when unfocused
      },
      [
        /* deps you need */
      ],
    ),
  );

  const sectionTypes = ['Interior', 'Exterior', 'Others'];

  const groupedRooms = Object.entries(roomsData).reduce(
    (acc, [name, details]) => {
      if (!acc[details.sectionType]) acc[details.sectionType] = [];
      acc[details.sectionType].push({ name, ...details });
      return acc;
    },
    {},
  );

  const zeroizeQuote = async () => {
    if (!quoteId) return;

    const allRooms = [
      ...(groupedRooms?.Interior || []),
      ...(groupedRooms?.Exterior || []),
      ...(groupedRooms?.Others || []),
    ];

    // Optimistic UI update
    setActiveQuote(q => ({
      ...(q || {}),
      lines: allRooms.map(r => emptyLineForRoom(r)),
      totals: {
        interior: 0,
        exterior: 0,
        others: 0,
        additionalServices: 0,
        subtotal: 0,
        discountAmount: 0,
        finalPerDay: 0,
        grandTotal: 0,
      },
      discount: { ...(q?.discount || {}), value: 0, amount: 0 },
      comments: '',
      status: 'draft', // Reset status to draft
    }));

    // Persist each room with zero payload
    for (const r of allRooms) {
      await clearQuoteServices(quoteId, emptyLineForRoom(r));
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (paintsCache) return;
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.GET_PAINT}`,
        );
        if (alive) setPaintsCache(data?.paints || data?.data?.paints || []);
      } catch (e) { }
    })();
    return () => {
      alive = false;
    };
  }, [paintsCache]);

  useEffect(() => {
    let alive = true;

    const shouldSkipInitialFetch = false;

    const fetchFromId = async idToFetch => {
      if (shouldSkipInitialFetch) return;
      setIsLoading(true);
      try {
        setLoadingQuote(true);
        const url = `${API_BASE_URL}${API_ENDPOINTS.GET_QUOTATION
          }${encodeURIComponent(idToFetch)}`;
        const { data } = await axios.get(url);
        if (!alive) return;
        if (applyStage === 'applying') return;
        const q = data?.data?.quote || data?.data || null;
        // Prevent unnecessary state updates if activeQuote is already the same
        if (q !== activeQuote) {
          setActiveQuote(q);
        }
      } catch (e) {
        if (alive) setActiveQuote(null);
      } finally {
        if (alive) {
          setIsLoading(false);
          setLoadingQuote(false);
        }
      }
    };

    if (hasInitial) {
      setLoadingQuote(false);
      setIsLoading(false);
      return () => {
        alive = false;
      };
    }

    if (dupMode && sourceQuoteId) {
      fetchFromId(sourceQuoteId);
    } else if (quoteId) {
      fetchFromId(quoteId);
    } else {
      setActiveQuote(null);
      setLoadingQuote(false);
    }

    return () => {
      alive = false;
    };
  }, [dupMode, sourceQuoteId, quoteId, hasInitial, applyMode, applyStage]); // Correct dependencies

  useEffect(() => {
    if (!autoApplyOnMount) return;
    if (didAutoApplyRef.current) return;
    if (!quoteId) return;

    const allRooms = [
      ...(groupedRooms?.Interior || []),
      ...(groupedRooms?.Exterior || []),
      ...(groupedRooms?.Others || []),
    ];
    if (!allRooms.length) return;

    const hasExistingWork = (activeQuote?.lines || []).some(l => {
      const subtotal = Number(l?.subtotal || 0);
      const hasBreakdown =
        Array.isArray(l?.breakdown) && l.breakdown.length > 0;
      const hasPaints =
        l?.selectedPaints?.ceiling ||
        l?.selectedPaints?.wall ||
        l?.selectedPaints?.measurements;
      return subtotal > 0 || hasBreakdown || !!hasPaints;
    });

    const run = async () => {
      try {
        setIsLoading(true);
        if (
          (applyMode === 'clear' || applyMode === 'replace') &&
          hasExistingWork
        ) {
          didAutoApplyRef.current = true;
          setApplyStage('done');
          return;
        }

        if (applyMode === 'clear') {
          const draft = allRooms.map(r => emptyLineForRoom(r));
          setActiveQuote(q => ({ ...(q || {}), lines: draft })); // optimistic

          for (const r of allRooms) {
            await saveRoomLine(quoteId, emptyLineForRoom(r));
          }

          didAutoApplyRef.current = true;
          setApplyStage('done');
          return;
        }

        if (applyMode === 'replace' && predefPackage) {
          const built = allRooms
            .map(r => buildLineFromPackage(r, predefPackage))
            .filter(Boolean);

          setActiveQuote(q => ({ ...(q || {}), lines: built })); // optimistic

          for (const l of built) {
            const saved = await saveRoomLine(quoteId, l);
            setActiveQuote(q => {
              const lines = [...(q?.lines || [])];
              const i = lines.findIndex(
                x => norm(x.roomName) === norm(saved.roomName),
              );
              if (i >= 0) lines[i] = { ...(lines[i] || {}), ...saved };
              else lines.push(saved);
              return { ...(q || {}), lines };
            });
          }

          didAutoApplyRef.current = true;
          setApplyStage('done');
          return;
        }

        // --- MERGE or nothing to apply
        didAutoApplyRef.current = true;
        setApplyStage('done');
      } catch (e) {
        Alert.alert(
          'Error',
          e?.response?.data?.message || 'Failed to apply package',
        );
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [
    autoApplyOnMount,
    applyMode,
    predefPackage?._id,
    quoteId,
    groupedRooms,
    applyKey,
    // activeQuote, // include this so the guard sees latest data; run is idempotent
  ]);

  useEffect(() => {
    if (applyStage !== 'done' || !quoteId) return;
    let alive = true;

    (async () => {
      try {
        const url = `${API_BASE_URL}${API_ENDPOINTS.GET_QUOTATION
          }${encodeURIComponent(quoteId)}`;
        const { data } = await axios.get(url);
        const q = data?.data?.quote || data?.data || null;
        if (!alive || !q) return;

        const norm = s => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

        setActiveQuote(prev => {
          const prevLines = prev?.lines || [];
          const srvLines = q?.lines || [];

          const mergedLines = prevLines.map(l => {
            const m = srvLines.find(s => norm(s.roomName) === norm(l.roomName));
            return m
              ? {
                ...l,
                subtotal: m.subtotal,
                ceilingsTotal: m.ceilingsTotal,
                wallsTotal: m.wallsTotal,
                othersTotal: m.othersTotal,
              }
              : l;
          });

          return {
            ...(prev || {}),
            totals: q?.totals ?? prev?.totals,
            lines: mergedLines,
          };
        });
      } catch {
        /* swallow – UI already correct optimistically */
      }
    })();

    return () => {
      alive = false;
    };
  }, [applyStage, quoteId]);

  const norm = s => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();

  const linesByRoom = useMemo(() => {
    const map = {};
    for (const l of activeQuote?.lines || []) {
      const key = norm(l.savedName || l.roomName);
      map[key] = l;
    }
    return map;
  }, [activeQuote]);

  sectionTypes.forEach(t => (groupedRooms[t] ||= []));
  const [activeTab, setActiveTab] = useState(
    Object.keys(groupedRooms)[0] || 'Interior',
  );

  const PUTTY_RATE = 10;

  const fmtMoney = n => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtSqft = n => `${Number(n || 0)} sq ft`;
  const toNum = v => Number(v || 0);
  const sumMoney = arr => arr.reduce((s, b) => s + toNum(b.price), 0);
  const sumSqftLn = arr => arr.reduce((s, b) => s + toNum(b.sqft), 0);

  const isNonZeroPaintRow = b =>
    Number(b?.sqft || 0) > 0 && Number(b?.price || 0) > 0;

  const indexPackage = pkg => {
    const byKey = new Map();
    for (const d of pkg?.details ?? []) {
      const key = `${(d.category || '').trim()}|${(d.itemName || '').trim()}`;
      byKey.set(key, d);
    }
    return byKey;
  };

  const toPaintStub = d => {
    if (!d) return null;
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
      type: kind,
      mode: it.mode,
      sqft,
      unitPrice: unit,
      price: Number((sqft * unit).toFixed(2)),
      ...(paintStub.id ? { paintId: paintStub.id } : {}), // <-- no bogus id
      paintName: paintStub.name,
      source: 'BASE',
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
      additionalServices: room.additionalServices
        ? [...room.additionalServices]
        : [],
      additionalTotal: room.additionalTotal || 0,
    };
    return line;
  };

  const getPaintFromLine = (line, kindKey) =>
    line?.selectedPaints?.[kindKey] ?? null;
  const pick = (line, type) =>
    (line?.breakdown || []).filter(b => b.type === type);

  const sortByDisplay = (a, b) =>
    (a.displayIndex ?? 1e9) - (b.displayIndex ?? 1e9);
  const sum = arr => arr.reduce((s, b) => s + (b.price || 0), 0);

  const processLabel = m =>
    m === 'FRESH' ? 'Fresh Paint' : 'Repaint With Primer';
  // const isOthersTab = room => (room?.sectionType || '').trim() === 'Others';

  const isOthersTab = room =>
    (room?.sectionType || '').trim() === 'Others' &&
    !(Array.isArray(room?.ceilings) && room.ceilings.length) &&
    !(Array.isArray(room?.walls) && room.walls.length);

  const isSpecialPaint = paint =>
    !!paint?.isSpecial || /spl|special/i.test(paint?.name || '');

  const specialBadge = (
    <Text style={{ color: '#ED1F24', fontWeight: '700' }}>S </Text>
  );

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

  const summarizeFromLine = (room, line, type) => {
    const all = pick(line, type).sort(sortByDisplay).filter(isNonZeroPaintRow);
    if (!all.length) return [];

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

    const special = isSpecialPaint(paint);
    const inOthersTab = isOthersTab(room);

    // "Others" or "Special paint" → single combined row
    if (inOthersTab || special) {
      return [
        {
          paintText: paint?.name ?? '—',
          countText: `${base} (${all.length})`,
          sqft: sumSqftLn(all),
          amount: sumMoney(all),
        },
      ];
    }

    // Normal paint → split by process
    const fresh = all.filter(i => i.mode === 'FRESH');
    const repaint = all.filter(i => i.mode !== 'FRESH');

    const rows = [];
    if (fresh.length) {
      rows.push({
        paintText: composePaintLabel(room, paint, 'FRESH'),
        countText: `${base} (${fresh.length})`,
        sqft: sumSqftLn(fresh),
        amount: sumMoney(fresh),
      });
    }
    if (repaint.length) {
      rows.push({
        paintText: composePaintLabel(room, paint, 'REPAINT'),
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

    // Calculate additional total from the line
    const additionalTotal = Number(
      line.additionalTotal ??
      (Array.isArray(line.additionalServices)
        ? line.additionalServices.reduce(
          (s, it) => s + Number(it.total || 0),
          0,
        )
        : 0),
    );

    // Calculate paint subtotal (total cost of paint services)
    const paintSubtotal = Number(line.subtotal ?? sum(line.breakdown));

    const Row = ({ r }) => (
      <>
        <Text style={styles.paintName}>{r.paintText}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{r.countText}</Text>
          <Text style={styles.detailValue}>{fmtSqft(r.sqft)}</Text>
          <Text style={styles.detailValue}>{fmtMoney(r.amount)}</Text>
        </View>
      </>
    );

    // Function to club additional services by their material name and sum up the areas
    const clubAdditionalServices = additionalServices => {
      const grouped = {};

      additionalServices.forEach(service => {
        const label = service.materialName;
        const existing = grouped[label] || {
          label,
          count: 0,
          sqft: 0,
          amount: 0,
        };

        // Sum up the areas and total cost for the same material
        existing.count += 1;
        existing.sqft += service.areaSqft || 0;
        existing.amount += service.total || 0;

        grouped[label] = existing;
      });

      return Object.values(grouped); // Return the grouped additional services
    };

    const renderAdditionalBlock = (room, line) => {
      const list = Array.isArray(line?.additionalServices)
        ? line.additionalServices
        : [];

      if (!list.length) return null;

      // Group by service material name and sum up the details
      const rows = clubAdditionalServices(list);

      return (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.detailTitle}>Additional Services</Text>
          {rows.map((r, i) => (
            <View key={`${r.label}-${i}`} style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {r.label}
                {r.count > 1 ? ` (${r.count})` : ''}
              </Text>
              <Text style={styles.detailValue}>{fmtSqft(r.sqft)}</Text>
              <Text style={styles.detailValue}>{fmtMoney(r.amount)}</Text>
            </View>
          ))}
          <View style={styles.underlineRed} />
        </View>
      );
    };
    console.log(
      'fmtMoney(paintSubtotal + additionalTotal)',
      fmtMoney(paintSubtotal + additionalTotal),
    );
    console.log('fmtMoney(paintSubtotal)', fmtMoney(paintSubtotal));
    console.log('fmtMoney(additionalTotal)', fmtMoney(additionalTotal));
    const hasCW =
      (Array.isArray(room?.ceilings) && room.ceilings.length > 0) ||
      (Array.isArray(room?.walls) && room.walls.length > 0);
    return (
      <View style={{ marginTop: 8 }}>
        {hasCW ? (
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

        {renderAdditionalBlock(room, line)}
        <View className={styles.detailRow}>
          <Text style={styles.totalCostLabel}>Total Cost</Text>
          <Text style={styles.totalCostValue}>
            {fmtMoney(paintSubtotal + additionalTotal)}
          </Text>
        </View>
      </View>
    );
    // return (
    //   <View style={{ marginTop: 8 }}>
    //     {room.sectionType !== 'Others' ? (
    //       <>
    //         {!!cSum.length && (
    //           <>
    //             <Text style={styles.detailTitle}>Ceilings</Text>
    //             {cSum.map((r, i) => (
    //               <Row key={`c-${i}`} r={r} />
    //             ))}
    //             {!!wSum.length && <View style={styles.underlineRed} />}
    //           </>
    //         )}

    //         {!!wSum.length && (
    //           <>
    //             <Text style={styles.detailTitle}>Walls</Text>
    //             {wSum.map((r, i) => (
    //               <Row key={`w-${i}`} r={r} />
    //             ))}
    //             <View style={styles.underlineRed} />
    //           </>
    //         )}
    //       </>
    //     ) : (
    //       !!mSum.length && (
    //         <>
    //           <Text style={styles.detailTitle}>{room.name}</Text>
    //           {mSum.map((r, i) => (
    //             <Row key={`m-${i}`} r={r} />
    //           ))}
    //           <View style={styles.underlineRed} />
    //         </>
    //       )
    //     )}
    //     {renderAdditionalBlock(room, line)}
    //     <View style={styles.detailRow}>
    //       <Text style={styles.totalCostLabel}>Total Cost</Text>
    //       <Text style={styles.totalCostValue}>
    //         {fmtMoney(paintSubtotal + additionalTotal)}
    //       </Text>
    //     </View>
    //   </View>
    // );
  };

  return (
    <>
      {(isLoading || loadingQuote) && <PageLoader />}
      {responseLoader && <PageLoader />}
      <View key={applyKey || quoteId} style={styles.container}>
        <View
          style={{
            backgroundColor: 'white',
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderBottomColor: '#575353ff',
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => confirmDiscardAndLeave(() => navigation.goBack())}
            >
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
              Select Room
            </Text>
          </View>
        </View>

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
                          if (i >= 0) {
                            const prev = lines[i] || {};
                            lines[i] = {
                              ...prev,
                              ...newLine,
                              // preserve any additional fields if newLine doesn't send them
                              additionalServices: Array.isArray(
                                newLine?.additionalServices,
                              )
                                ? newLine.additionalServices
                                : prev.additionalServices || [],
                              additionalTotal:
                                typeof newLine?.additionalTotal === 'number'
                                  ? newLine.additionalTotal
                                  : prev.additionalTotal || 0,
                            };
                          } else {
                            lines.push(newLine);
                          }
                          return { ...(q || {}), lines };
                        });
                      },
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAlertPopup}
        onRequestClose={() => setShowAlertPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
              Discard changes?
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Are you sure you want to exit without saving the changes?
            </Text>

            <TouchableOpacity
              style={[styles.confirmButton, isDiscarding && { opacity: 0.7 }]}
              disabled={isDiscarding}
              onPress={async () => {
                if (isDiscarding) return;
                setIsDiscarding(true);
                try {
                  await zeroizeQuote(); // clear draft
                  setShowAlertPopup(false); // close popup
                  confirmActionRef.current?.(); // run the pending action (goBack)
                } catch (error) {
                  console.log('Discard failed:', error);
                } finally {
                  setIsDiscarding(false);
                }
              }}
            >
              {isDiscarding ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAlertPopup(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});
