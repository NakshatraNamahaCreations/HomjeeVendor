import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  ToastAndroid,
  Modal,
  BackHandler,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../Utilities/ThemeContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import { useVendorContext } from '../../Utilities/VendorContext';
import axios from 'axios';
import { useLeadContext } from '../../Utilities/LeadContext';
import PageLoader from '../../components/PageLoader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ResponseLoader from '../../components/ResponseLoader';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import { getRequest } from '../../ApiService/apiHelper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Quotes = () => {
  const navigation = useNavigation();
  const { deviceTheme } = useThemeColor();
  const { vendorDataContext } = useVendorContext();
  const vendorId = vendorDataContext?._id;
  const { leadDataContext } = useLeadContext();
  const leadId = leadDataContext._id;
  const [estimateData, setEstimateData] = useEstimateContext();
  const measurementId = estimateData?._id;
  const [loading, setLoading] = useState(true);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.navigate('JobOngoing');
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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // go to JobOngoing without stacking
        // Option A: replace current screen
        navigation.replace('JobOngoing');

        // Option B: reset to JobOngoing as root
        // navigation.reset({ index: 0, routes: [{ name: 'JobOngoing' }] });

        return true; // consume so nothing else runs
      };

      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => sub.remove();
    }, [navigation]),
  );

  const openModal = item => {
    setModalVisible(true);
    setSelectedData(item);
  };

  console.log('quotes', quotes);

  const fetchMeasurements = async () => {
    setLoading(true);
    setEstimateData(null);

    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GET_MEASUREMENTS_BY_LEADID}${leadId}`,
      );
      console.log('response', response);

      if (response) {
        setEstimateData(response);
      } else {
        setEstimateData(null);
      }
    } catch (err) {
      console.log('Error fetching bookings:', err);
      setEstimateData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [leadId]);

  const fetchQuotes = async () => {
    if (!leadId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_QUOTATION_BY_ID}`,
        {
          params: { leadId, vendorId },
        },
      );
      setQuotes(data?.data?.list ?? []);
    } catch (error) {
      console.error(
        'Fetch quotes error:',
        error?.response?.data || error.message,
      );
      Alert.alert('Error', 'Failed to load quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAnyQuoteLocked = quotes?.some(q => q.locked);

  const createEmptyQuoteAndGo = async () => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SAVE_QUOTATION}`,
        { leadId, vendorId, measurementId },
      );
      const quote = data?.data;

      navigation.navigate('Selectpackage', {
        dupMode: false,
        quoteId: quote.id || String(quote._id),
        leadId,
        measurementId,
        vendorId,
      });
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [leadId, vendorId]);

  const toggleSelection = id => {
    if (!quotes.find(q => q.id === id)?.finalized) {
      setSelectedQuoteId(prev => (prev === id ? null : id));
    }
  };

  const mapListItem = x => ({
    id: x.id,
    title: x.title || 'Quote',
    amount: x.amount || 0,
    taxes: !!x.taxes,
    days: x.days || 1,
    finalized: !!x.finalized,
    breakdown: x.breakdown || [],
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchQuotes();
    }, [leadId, vendorId]),
  );

  const duplicateQuote = async sourceId => {
    if (isResponseLoading) return; // guard against double taps
    setIsResponseLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SAVE_QUOTATION}`,
        { leadId, vendorId, measurementId },
      );
      const dest = data?.data;
      const destId = dest?.id || String(dest?._id);
      if (!destId) throw new Error('No destination quote id');

      const cloneResp = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.DUPLICATE_QUOTE}${encodeURIComponent(
          sourceId,
        )}/duplicate`,
        { destId },
      );
      const duplicated = cloneResp?.data?.data;
      navigation.navigate('SelectRoom', {
        dupMode: false,
        quoteId: duplicated?.id || String(duplicated?._id || destId),
        leadId,
        measurementId,
        vendorId,
        quote: duplicated || dest, // pass initial to avoid loader flicker
      });
    } catch (e) {
      Alert.alert('Duplicate failed', e?.response?.data?.message || e.message);
    } finally {
      setModalVisible(false); // always close the modal
      setSelectedData(null); // clear selection
      setIsResponseLoading(false);
    }
  };
  const finalizeQuote = async id => {
    setIsResponseLoading(true);
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.FINALIZE_QUOTE}${id}/finalize`,
        {
          vendorId,
          leadId,
          exclusive: true,
        },
      );

      const listItem = data?.data?.listItem;
      if (!listItem) {
        Alert.alert('Error', 'Malformed finalize response');
        return;
      }

      setQuotes(prev =>
        prev.map(q => (q.id === listItem.id ? mapListItem(listItem) : q)),
      );

      setQuotes(prev =>
        prev.map(q => (q.id !== listItem.id ? { ...q, finalized: false } : q)),
      );

      setSelectedQuoteId(null);
      ToastAndroid.show('Quote finalized', ToastAndroid.SHORT);
    } catch (e) {
      console.log('Finalize error', e?.response?.data || e);
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Failed to finalize quote.',
      );
    } finally {
      setIsResponseLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
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
          <TouchableOpacity onPress={() => navigation.navigate('JobOngoing')}>
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
            Quotes
          </Text>
        </View>
      </View>
      {loading && <PageLoader />}
      {isResponseLoading && <ResponseLoader />}
      {quotes.length === 0 ? (
        <Text
          style={{
            textAlign: 'center',
            color: '#B1B1B1',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 16,
            marginVertical: 250,
          }}
        >
          You have not created any quote yet
        </Text>
      ) : (
        <ScrollView style={{ padding: 10 }}>
          {quotes.map((quote, idx) => (
            <View
              key={quote.id}
              style={[
                styles.quoteCard,
                quote.finalized && styles.finalizedCard,
                selectedQuoteId === quote.id && styles.selectedQuote,
              ]}
            >
              <View style={styles.quoteHeader}>
                <View style={styles.quoteTitleContainer}>
                  <Text style={styles.quoteTitle}>{`Quote ${idx + 1}`}</Text>
                </View>
                {!quote.finalized && !isAnyQuoteLocked ? (
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      selectedQuoteId === quote.id && styles.checkedCheckbox,
                    ]}
                    onPress={() => toggleSelection(quote.id)}
                  >
                    {selectedQuoteId === quote.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ) : quote.finalized ? (
                  <Text style={styles.finalQuoteText}>Final Quote</Text>
                ) : null}
              </View>

              <Text style={styles.amountText}>
                ₹ {Number(quote.amount || 0).toLocaleString('en-IN')}{' '}
                <Text style={styles.taxesText}>
                  {quote.taxes ? '+taxes' : ''}
                </Text>
              </Text>
              <Text style={styles.daysText}>{quote.days} Days</Text>

              {(quote.breakdown || []).map((item, idx) => (
                <View key={idx} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownAmount}>₹ {item.amount}</Text>
                </View>
              ))}

              <View style={styles.dottedLine} />

              <View style={styles.buttonsRow}>
                {selectedQuoteId !== quote.id && !quote.finalized && (
                  <View style={styles.buttonsLine}>
                    <TouchableOpacity
                      style={styles.viewQuoteButton}
                      onPress={() => navigation.navigate('QuotesView')}
                    >
                      <Text style={styles.viewQuoteText}>View Quote</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.duplicateQuoteButton}
                      onPress={() => openModal(quote.id)}
                    >
                      <Text style={styles.duplicateQuoteText}>
                        Duplicate Quote
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {quote.finalized && (
                  <View style={styles.buttonsLine}>
                    <TouchableOpacity style={styles.viewQuoteButton}>
                      <Text style={styles.viewQuoteText}>View Quote</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.duplicateQuoteButton}
                      onPress={() => openModal(quote.id)}
                    >
                      <Text style={styles.duplicateQuoteText}>
                        Duplicate Quote
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedQuoteId === quote.id && !quote.finalized && (
                  <TouchableOpacity
                    style={styles.finalizeQuoteButton}
                    onPress={() => finalizeQuote(quote.id)}
                  >
                    <Text style={styles.finalizeQuoteText}>Finalize Quote</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <View style={{ marginBottom: 150 }} />
        </ScrollView>
      )}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={createEmptyQuoteAndGo}
      >
        <Text style={styles.doneButtonText}>Create New Quote</Text>
      </TouchableOpacity>

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
              style={[
                styles.confirmButton,
                isResponseLoading && { opacity: 0.6 },
              ]}
              onPress={() => duplicateQuote(selectedData)}
              disabled={isResponseLoading}
            >
              <Text style={styles.confirmButtonText}>
                {isResponseLoading ? 'Duplicating…' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Quotes;
const styles = StyleSheet.create({
  doneButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    // borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  doneButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#0000001A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  finalizedCard: {
    borderWidth: 2,
    borderColor: '#ED1F24',
  },
  selectedQuote: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteTitleContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  quoteTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  amountText: {
    fontSize: 17,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  taxesText: {
    fontSize: 12,
    color: 'green',
    fontFamily: 'Poppins-SemiBold',
  },
  daysText: {
    color: '#000000ff',
    marginTop: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  breakdownLabel: {
    color: '#000000ff',
    fontFamily: 'Poppins-SemiBold',
  },
  breakdownAmount: {
    color: '#000000ff',
    fontFamily: 'Poppins-SemiBold',
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderStyle: 'dashed',
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
  },
  buttonsRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  buttonsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  viewQuoteButton: {
    backgroundColor: '#555555',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  duplicateQuoteButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewQuoteText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  duplicateQuoteText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  finalizeQuoteButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '50%',
  },
  finalizeQuoteText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  finalQuoteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ED1F24',
    fontFamily: 'Poppins-SemiBold',
  },
  createNewQuoteButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 40,
    alignItems: 'center',
  },
  createNewQuoteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
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
});
