import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Alert,
  ToastAndroid,
  BackHandler,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import axios from 'axios';

export default function QuoteSummary() {
  const navigation = useNavigation();
  const route = useRoute();
  const { quoteId, quote: quoteFromRoute } = route.params || {};
  const [estimateData] = useEstimateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [activeQuote, setActiveQuote] = useState(quoteFromRoute || null);

  console.log('quoteFromRoute', quoteFromRoute);
  console.log(
    'activeQuote lines',
    activeQuote?.lines?.length,
    activeQuote?.lines,
  );
  console.log('activeQuote totals', activeQuote?.totals);

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  // useEffect(() => {
  //   if (!quoteId || quoteFromRoute) return; // already have it
  //   let mounted = true;
  //   (async () => {
  //     try {
  //       const { data } = await axios.get(
  //         `${API_BASE_URL}${API_ENDPOINTS.GET_QUOTATION}${quoteId}`,
  //       );
  //       if (mounted) setActiveQuote(data?.data || null);
  //     } catch (e) {
  //       // optional: show toast
  //     }
  //   })();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [quoteId, quoteFromRoute]);

  const loadQuote = useCallback(async () => {
    if (!quoteId) return;
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_QUOTATION}${encodeURIComponent(
          quoteId,
        )}`,
      );
      const q = data?.data?.quote || data?.data || null;
      setActiveQuote(q);
      // preload UI state from server
      setDays(Math.max(1, Number(q?.days ?? 1)));
      const dt = (q?.discount?.type || 'PERCENT').toUpperCase();
      setDiscountType(dt);
      setDiscountPercent(Number(q?.discount?.value || 0));
      setDiscountFlat(String(q?.discount?.amount || 0));
      setComments(q?.comments || '');
    } catch {}
  }, [quoteId]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]); // initial fetch
  useFocusEffect(
    useCallback(() => {
      loadQuote();
    }, [loadQuote]),
  );

  // ---------- constants & helpers ----------
  const totalsFromServer = activeQuote?.totals;
  const totalsFromLines = useMemo(() => {
    const sum = t =>
      (activeQuote?.lines || [])
        .filter(l => l.sectionType === t)
        .reduce((s, l) => s + Number(l.subtotal || 0), 0);
    const interior = sum('Interior');
    const exterior = sum('Exterior');
    const others = sum('Others');
    return {
      interior,
      exterior,
      others,
      subtotal: +(interior + exterior + others).toFixed(2),
    };
  }, [activeQuote]);

  const DISCOUNT_TYPES = { PERCENT: 'PERCENT', FLAT: 'FLAT' };
  const PERCENT_OPTIONS = [0, 5, 10, 15, 20];

  const toNum = v => (Number.isFinite(+v) ? +v : 0);
  const round2 = n => +Number(n || 0).toFixed(2);
  const INR = n => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

  // ---------- UI state ----------
  const [days, setDays] = useState(1);
  const [comments, setComments] = useState('');

  // committed discount (what the UI & payload use)
  const [discountType, setDiscountType] = useState(DISCOUNT_TYPES.PERCENT);
  const [discountPercent, setDiscountPercent] = useState(0); // 0–20
  const [discountFlat, setDiscountFlat] = useState('0'); // string for input

  // modal state (draft until Apply)
  const [discountModal, setDiscountModal] = useState(false);
  const [draftType, setDraftType] = useState(discountType);
  const [draftPercent, setDraftPercent] = useState(discountPercent);
  const [draftFlat, setDraftFlat] = useState(discountFlat);

  const openDiscountModal = () => {
    setDraftType(discountType);
    setDraftPercent(discountPercent);
    setDraftFlat(discountFlat);
    setDiscountModal(true);
  };

  const onApplyDiscount = () => {
    setDiscountType(draftType);
    if (draftType === DISCOUNT_TYPES.PERCENT) {
      setDiscountPercent(toNum(draftPercent));
      setDiscountFlat('0'); // reset flat
    } else {
      setDiscountFlat(String(round2(toNum(draftFlat))));
      setDiscountPercent(0); // reset percent
    }
    setDiscountModal(false);
  };

  // ---------- measurement → money ----------
  const roomsObj = estimateData?.rooms || {};
  const roomsArr = useMemo(
    () => Object.entries(roomsObj).map(([name, r]) => ({ name, ...r })),
    [roomsObj],
  );

  const sumBySection = type =>
    roomsArr
      .filter(
        r => (r.sectionType || '').trim() === type && r?.pricing?.total != null,
      )
      .reduce((s, r) => s + toNum(r.pricing.total), 0);

  const preferQuote = !!(activeQuote && (activeQuote.lines?.length || 0) > 0);
  const qTotals = activeQuote?.totals || null;

  const sumQuoteBySection = type =>
    (activeQuote?.lines || [])
      .filter(l => l.sectionType === type)
      .reduce((s, l) => s + toNum(l.subtotal), 0);

  const quoteTotalsFromLines = useMemo(() => {
    const interior = sumQuoteBySection('Interior');
    const exterior = sumQuoteBySection('Exterior');
    const others = sumQuoteBySection('Others');
    const subtotal = round2(
      interior + exterior + others + 0 /* additionalServices */,
    );
    return { interior, exterior, others, subtotal };
  }, [activeQuote]);

  // decide which totals source to use
  const useQuoteLines = preferQuote && !(toNum(qTotals?.subtotal) > 0);

  // const interiorTotal = useMemo(() => {
  //   if (preferQuote) {
  //     return useQuoteLines
  //       ? quoteTotalsFromLines.interior
  //       : toNum(qTotals?.interior);
  //   }
  //   return sumBySection('Interior');
  // }, [preferQuote, useQuoteLines, qTotals, quoteTotalsFromLines, roomsArr]);

  // const exteriorTotal = useMemo(() => {
  //   if (preferQuote) {
  //     return useQuoteLines
  //       ? quoteTotalsFromLines.exterior
  //       : toNum(qTotals?.exterior);
  //   }
  //   return sumBySection('Exterior');
  // }, [preferQuote, useQuoteLines, qTotals, quoteTotalsFromLines, roomsArr]);

  // const othersTotal = useMemo(() => {
  //   if (preferQuote) {
  //     return useQuoteLines
  //       ? quoteTotalsFromLines.others
  //       : toNum(qTotals?.others);
  //   }
  //   return sumBySection('Others');
  // }, [preferQuote, useQuoteLines, qTotals, quoteTotalsFromLines, roomsArr]);

  // const subtotal = useMemo(() => {
  //   if (preferQuote) {
  //     return useQuoteLines
  //       ? quoteTotalsFromLines.subtotal
  //       : round2(toNum(qTotals?.subtotal));
  //   }
  //   return round2(
  //     interiorTotal + exteriorTotal + othersTotal + additionalServices,
  //   );
  // }, [
  //   preferQuote,
  //   useQuoteLines,
  //   qTotals,
  //   quoteTotalsFromLines,
  //   interiorTotal,
  //   exteriorTotal,
  //   othersTotal,
  //   additionalServices,
  // ]);

  // discount from committed state

  const interiorTotal = Number(
    totalsFromServer?.interior ?? totalsFromLines.interior ?? 0,
  );
  const exteriorTotal = Number(
    totalsFromServer?.exterior ?? totalsFromLines.exterior ?? 0,
  );
  const othersTotal = Number(
    totalsFromServer?.others ?? totalsFromLines.others ?? 0,
  );
  const subtotal = Number(
    totalsFromServer?.subtotal ?? totalsFromLines.subtotal ?? 0,
  );
  const additionalServices = Number(
    totalsFromServer?.additionalServices ??
      totalsFromLines.additionalServices ??
      0,
  );
  // console.log('additionalServices', additionalServices);

  const discountAmount = useMemo(() => {
    if (discountType === DISCOUNT_TYPES.PERCENT) {
      return round2(subtotal * (toNum(discountPercent) / 100));
    }
    return round2(toNum(discountFlat));
  }, [discountType, discountPercent, discountFlat, subtotal]);

  const safeDiscount = useMemo(
    () => Math.min(discountAmount, subtotal),
    [discountAmount, subtotal],
  );

  // *** NEW RULE: multiply the discounted total by days ***
  // const finalAmount = useMemo(
  //   () =>
  //     round2(Math.max(0, subtotal - safeDiscount) * Math.max(1, toNum(days))),
  //   [subtotal, safeDiscount, days],
  // );

  const finalAmount = useMemo(
    () => round2(Math.max(0, subtotal - safeDiscount)),
    [subtotal, safeDiscount],
  );
  console.log('finalAmount', finalAmount);

  // days stepper
  const incrementDays = () => setDays(d => d + 1);
  const decrementDays = () => setDays(d => Math.max(1, d - 1));

  // ---------- create quote ----------
  // const createQuote = async () => {
  //   try {
  //     setIsLoading(true);

  //     // build normalized discount payload
  //     const discountPayload =
  //       discountType === DISCOUNT_TYPES.PERCENT
  //         ? {
  //             type: 'PERCENT',
  //             value: toNum(discountPercent),
  //             amount: safeDiscount,
  //           }
  //         : {
  //             type: 'FLAT',
  //             value: round2(toNum(discountFlat)),
  //             amount: safeDiscount,
  //           };

  //     const body = {
  //       leadId: estimateData?.leadId,
  //       vendorId: estimateData?.vendorId,
  //       measurementId: estimateData?._id,

  //       days: Math.max(1, toNum(days)),
  //       discount: discountPayload,

  //       totals: {
  //         interior: round2(interiorTotal),
  //         exterior: round2(exteriorTotal),
  //         others: round2(othersTotal),
  //         additionalServices: round2(additionalServices),
  //         subtotal,
  //         discountAmount: safeDiscount,
  //         finalPerDay: round2(Math.max(0, subtotal - safeDiscount)),
  //         grandTotal: finalAmount, // (subtotal - discount) × days
  //       },

  //       comments,
  //     };

  //     const { data } = await axios.post(
  //       `${API_BASE_URL}${API_ENDPOINTS.SAVE_QUOTATION}`,
  //       body,
  //     );

  //     // go to quotes list (adjust as needed)
  //     navigation.navigate('Quotes', {
  //       leadId: body.leadId,
  //       measurementId: body.measurementId,
  //       vendorId: body.vendorId,
  //     });
  //   } catch (e) {
  //     Alert.alert(
  //       'Error',
  //       e?.response?.data?.message || 'Failed to create quote',
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const createQuote = async () => {
    setModalVisible(false);
    setIsLoading(true);
    try {
      const discountPayload =
        discountType === 'PERCENT'
          ? { type: 'PERCENT', value: +discountPercent }
          : { type: 'FLAT', value: +discountFlat };

      if (quoteId) {
        await axios.patch(
          `${API_BASE_URL}${API_ENDPOINTS.UPDATE_QUOTATION}${encodeURIComponent(
            quoteId,
          )}`,
          {
            days: Math.max(1, +days),
            discount: discountPayload,
            comments,
          },
        );
      } else {
        await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SAVE_QUOTATION}`, {
          leadId: estimateData?.leadId,
          vendorId: estimateData?.vendorId,
          measurementId: estimateData?._id,
          days: Math.max(1, +days),
          discount: discountPayload,
          comments,
        });
      }

      navigation.navigate('Quotes');
    } catch (e) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Failed to save quote',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* {isLoading && <ResponseLoader />} */}

      <ScrollView contentContainerStyle={styles.container}>
        {/* Cost Summary */}
        <View style={styles.box}>
          <Text style={styles.header}>Cost Summary</Text>
          {/* <Text style={{ opacity: 0.4, fontSize: 12, alignSelf: 'center' }}>
            {preferQuote ? 'from quote' : 'from measurement'}
          </Text> */}
          <View style={styles.dottedLine} />

          <View style={styles.row}>
            <Text style={styles.label}>Interior</Text>
            <Text style={styles.value}>{INR(interiorTotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Exterior</Text>
            <Text style={styles.value}>{INR(exteriorTotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Others</Text>
            <Text style={styles.value}>{INR(othersTotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Additional Services</Text>
            <Text style={styles.value}>{INR(additionalServices)}</Text>
          </View>

          <View style={styles.dottedLine} />

          <View style={styles.row}>
            <Text style={[styles.label, styles.bold]}>Total Amount</Text>
            <Text style={[styles.value, styles.bold]}>{INR(subtotal)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Discount
              {discountType === DISCOUNT_TYPES.PERCENT
                ? ` (${discountPercent}%)`
                : ''}
            </Text>
            <Text style={styles.value}>-{INR(safeDiscount)}</Text>
          </View>

          <View style={styles.dottedLine} />

          <View style={styles.row}>
            <Text style={[styles.label, styles.bold]}>
              Final Amount
              {/* {days > 1 ? `(× ${days})` : ''} */}
            </Text>
            <Text style={[styles.value, styles.bold]}>{INR(finalAmount)}</Text>
          </View>
        </View>

        {/* Days */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              marginTop: 20,
              fontSize: 13,
            }}
          >
            No.Of Days
          </Text>
          <View style={styles.daysContainer}>
            <TouchableOpacity style={styles.dayButton} onPress={decrementDays}>
              <Text style={styles.dayButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.daysText}>{days}</Text>
            <TouchableOpacity style={styles.dayButton} onPress={incrementDays}>
              <Text style={styles.dayButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Discount dropdown trigger */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={styles.flatAmountRow}
            activeOpacity={0.7}
            onPress={openDiscountModal}
          >
            <Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 15 }}>
              {discountType === DISCOUNT_TYPES.PERCENT
                ? `Discount (Percentage${
                    discountPercent ? ` – ${discountPercent}%` : ''
                  })`
                : 'Discount (Flat amount)'}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.flatAmountValue}>{INR(safeDiscount)}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color="#ff0000"
                style={{ marginLeft: 6, marginRight: 10 }}
              />
            </View>
          </TouchableOpacity>

          <TextInput
            style={styles.commentsInput}
            multiline
            placeholder="Comments"
            placeholderTextColor="#999"
            value={comments}
            onChangeText={setComments}
          />
        </View>

        {/* Generate */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.generateButtonText}>Generate Quote</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Discount Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={discountModal}
        onRequestClose={() => setDiscountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Discount</Text>

            <View style={{ flexDirection: 'row', marginBottom: 12, gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setDraftType(DISCOUNT_TYPES.PERCENT);
                  setDraftPercent(draftPercent ?? 0);
                  setDraftFlat('0');
                }}
                style={[
                  styles.togglePill,
                  draftType === DISCOUNT_TYPES.PERCENT &&
                    styles.togglePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    draftType === DISCOUNT_TYPES.PERCENT &&
                      styles.togglePillTextActive,
                  ]}
                >
                  Percentage
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setDraftType(DISCOUNT_TYPES.FLAT);
                  setDraftPercent(0);
                }}
                style={[
                  styles.togglePill,
                  draftType === DISCOUNT_TYPES.FLAT && styles.togglePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    draftType === DISCOUNT_TYPES.FLAT &&
                      styles.togglePillTextActive,
                  ]}
                >
                  Flat amount
                </Text>
              </TouchableOpacity>
            </View>

            {draftType === DISCOUNT_TYPES.PERCENT && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {PERCENT_OPTIONS.map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setDraftPercent(p)}
                    style={[
                      styles.percentChip,
                      draftPercent === p && styles.percentChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.percentChipText,
                        draftPercent === p && styles.percentChipTextActive,
                      ]}
                    >
                      {p}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {draftType === DISCOUNT_TYPES.FLAT && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.inputLabel}>Amount (₹)</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  value={draftFlat}
                  onChangeText={t => setDraftFlat(t.replace(/[^\d.]/g, ''))}
                  style={styles.amountInput}
                  placeholderTextColor="#aaa"
                />
              </View>
            )}

            <View style={{ height: 16 }} />

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onApplyDiscount}
            >
              <Text style={styles.confirmButtonText}>Apply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDiscountModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              source={require('../../assets/icons/featured.png')}
              style={styles.checkmarkImage}
            />
            <Text style={styles.modalTitle}>Generate Quote!</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to generate the quote?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={createQuote}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 10,
    backgroundColor: '#F6F6F6',
  },
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#ED1F24',
  },
  box: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'Poppins-SemiBold',
  },
  value: {
    fontSize: 12,
    color: '#444',
    fontFamily: 'Poppins-SemiBold',
  },
  bold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: 'black',
  },
  discountLabel: {
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  discountValue: {
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginTop: 20,
    // marginLeft: 150,
  },
  dayButton: {
    borderWidth: 1,
    borderColor: '#ED1F24',
    borderRadius: 4,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  dayButtonText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  daysText: {
    fontSize: 16,
    marginHorizontal: 20,
    color: '#222',
    fontFamily: 'Poppins-SemiBold',
  },
  flatAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#949494ff',
    paddingVertical: 10,
  },
  flatAmountValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#222',
    // marginTop: 12,
    marginRight: 10,
  },
  commentsInput: {
    height: 80,
    marginTop: 30,
    borderWidth: 1,
    fontFamily: 'Poppins-Medium',
    borderColor: '#b0c4de',
    borderRadius: 4,
    padding: 8,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#444',
  },
  generateButton: {
    marginTop: 30,
    backgroundColor: '#ff0000',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 330,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
  },
  checkmarkImage: {
    width: 50,
    height: 50,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    color: '#222',
  },
  modalMessage: {
    fontSize: 14,
    color: '#444',
    marginBottom: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#cececeff',
    borderWidth: 1,
    borderColor: '#ccc',

    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  togglePill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    flex: 0.5,
    // marginRight: 8,
  },
  togglePillActive: {
    backgroundColor: '#ED1F24',
    borderColor: '#ED1F24',
  },
  togglePillText: {
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  togglePillTextActive: { color: '#fff' },
  percentChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  percentChipActive: {
    backgroundColor: '#ED1F24',
    borderColor: '#ED1F24',
  },
  percentChipText: { color: '#333', fontFamily: 'Poppins-SemiBold' },
  percentChipTextActive: { color: '#fff' },
  inputLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 6,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
});
