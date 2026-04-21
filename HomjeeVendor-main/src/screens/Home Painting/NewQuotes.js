import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing FontAwesome icons
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';

export default function NewQuotes() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    quote,
    leadId: leadIdParam,
    measurementId: measurementIdParam,
    vendorId: vendorIdParam,
  } = route.params || {};
  console.log('quote', quote);

  const leadId = leadIdParam || quote?.leadId;
  const measurementId =
    measurementIdParam || quote?.measurementId || quote?.measurement?._id;
  const vendorId = vendorIdParam || quote?.vendorId;

  const [quotes, setQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Optimistically show the just-created quote at the top (optional),
  // until the API returns the full list.
  const optimistic = useMemo(() => {
    if (!quote) return null;
    return {
      id: String(quote._id || quote.id || 'new'),
      title: quote.title || 'Quote',
      amount: quote?.totals?.grandTotal ?? 0,
      taxes: !!quote.applyTaxes,
      days: quote.days ?? 1,
      finalized: quote.status === 'final',
      breakdown: [
        { label: 'Interior', amount: quote?.totals?.interior ?? 0 },
        { label: 'Exterior', amount: quote?.totals?.exterior ?? 0 },
        { label: 'Others', amount: quote?.totals?.others ?? 0 },
        {
          label: 'Additional Services',
          amount: quote?.totals?.additionalServices ?? 0,
        },
      ],
    };
  }, [quote]);

  useEffect(() => {
    fetchQuotes();
  }, [leadId, measurementId, vendorId]);

  const listToRender = useMemo(() => {
    if (!optimistic) return quotes;
    const exists = quotes.some(q => q.id === optimistic.id);
    return exists ? quotes : [optimistic, ...quotes];
  }, [quotes, optimistic]);

  const toggleSelection = id => {
    if (!quotes.find(q => q.id === id)?.finalized) {
      setSelectedQuoteId(prev => (prev === id ? null : id));
    }
  };

  // const toggleSelection = id => {
  //   try {
  //     console.log(`Selecting quote with id: ${id}`);
  //     if (!quotes.find(q => q.id === id)?.finalized) {
  //       setSelectedQuoteId(prev => (prev === id ? null : id));
  //     }
  //   } catch (error) {
  //     console.error('Error in toggleSelection:', error);
  //     Alert.alert('Error', 'Failed to select quote. Please try again.');
  //   }
  // };

  // const finalizeQuote = id => {
  //   try {
  //     console.log(`Finalizing quote with id: ${id}`);
  //     const updatedQuotes = quotes.map(quote =>
  //       quote.id === id ? { ...quote, finalized: true } : quote,
  //     );
  //     setQuotes(updatedQuotes);
  //     setSelectedQuoteId(null);
  //   } catch (error) {
  //     console.error('Error in finalizeQuote:', error);
  //     Alert.alert('Error', 'Failed to finalize quote. Please try again.');
  //   }
  // };

  // const duplicateQuote = id => {
  //   try {
  //     console.log(`Duplicating quote with id: ${id}`);
  //     const quoteToDuplicate = quotes.find(q => q.id === id);
  //     if (quoteToDuplicate) {
  //       const newQuote = {
  //         ...quoteToDuplicate,
  //         id: (quotes.length + 1).toString(),
  //         title: `Quote ${quotes.length + 1}`,
  //         finalized: false,
  //       };
  //       setQuotes([...quotes, newQuote]);
  //     } else {
  //       throw new Error('Quote not found');
  //     }
  //   } catch (error) {
  //     console.error('Error in duplicateQuote:', error);
  //     Alert.alert('Error', 'Failed to duplicate quote. Please try again.');
  //   }
  // };

  const finalizeQuote = async id => {
    try {
      // await axios.patch(`${API_BASE_URL}/api/quotes/${id}`, { status: 'final' });
      setQuotes(prev =>
        prev.map(q => (q.id === id ? { ...q, finalized: true } : q)),
      );
      setSelectedQuoteId(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to finalize quote.');
    }
  };

  const duplicateQuote = async id => {
    try {
      // const { data } = await axios.post(`${API_BASE_URL}/api/quotes/${id}/duplicate`);
      // setQuotes(prev => [data.data, ...prev]);
      Alert.alert('Info', 'Duplicate endpoint not wired yet.');
    } catch (e) {
      Alert.alert('Error', 'Failed to duplicate quote.');
    }
  };

  const handleNavigation = () => {
    try {
      console.log('Navigating to LeadDescriptionFinal');
      if (navigation && navigation.navigate) {
        navigation.navigate('LeadDescriptionFinal'); // Navigate to LeadDescriptionFinal page
      } else {
        throw new Error('Navigation object is not available');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Error',
        'Failed to navigate to LeadDescriptionFinal. Please check your navigation setup.',
      );
    }
  };

  return (
    <>
      {loading && (
        <View style={[styles.quoteCard, { alignItems: 'center' }]}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }}>
            Loading quotes…
          </Text>
        </View>
      )}
      {!loading && listToRender.length === 0 && (
        <View style={[styles.quoteCard, { alignItems: 'center' }]}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }}>
            No quotes yet for this lead.
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        {quotes.length === 0 ? (
          <View style={[styles.quoteCard, { alignItems: 'center' }]}>
            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>
              No quotes yet for this lead.
            </Text>
          </View>
        ) : null}
        {/* Quote List */}
        {quotes.map(quote => (
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
                <Text style={styles.quoteTitle}>{quote.title}</Text>
              </View>
              {!quote.finalized ? (
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
              ) : (
                <Text style={styles.finalQuoteText}>Final Quote</Text>
              )}
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
                    onPress={() =>
                      navigation.navigate('QuoteSummary', {
                        quoteId: quote.id,
                        leadId,
                        measurementId,
                        vendorId,
                      })
                    }
                  >
                    <Text style={styles.viewQuoteText}>View Quote</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.duplicateQuoteButton}
                    onPress={() => duplicateQuote(quote.id)}
                  >
                    <Text style={styles.duplicateQuoteText}>
                      Duplicate Quote
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {quote.finalized && (
                <View style={styles.buttonsLine}>
                  <TouchableOpacity
                    style={styles.viewQuoteButton}
                    onPress={() =>
                      navigation.navigate('QuoteSummary', {
                        quoteId: quote.id,
                        leadId,
                        measurementId,
                        vendorId,
                      })
                    }
                  >
                    <Text style={styles.viewQuoteText}>View Quote</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.duplicateQuoteButton}
                    onPress={() => duplicateQuote(quote.id)}
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

        <TouchableOpacity
          style={styles.createNewQuoteButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createNewQuoteText}>Create New Quote</Text>
        </TouchableOpacity>

        {/* Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={{ marginBottom: 10 }}>
                {Image.resolveAssetSource(
                  require('../../assets/icons/featured.png'),
                ) ? (
                  <Image
                    source={require('../../assets/icons/featured.png')}
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <Text style={styles.errorText}>Image not found</Text>
                )}
              </View>
              <Text style={styles.modalTitle}>Duplicate Quote!</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to duplicate the quote?
              </Text>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setModalVisible(false);
                  handleNavigation();
                }}
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 40,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  container: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 40,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  container: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 40,
    backgroundColor: '#F6F6F6',
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
    fontWeight: 'bold',
  },
  amountText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  taxesText: {
    fontSize: 12,
    color: 'green',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  daysText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  breakdownLabel: {
    color: '#555',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  breakdownAmount: {
    color: '#555',
    fontWeight: '600',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    alignSelf: 'center',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 10,
    borderColor: '#CCC',
    borderWidth: 1,
  },
  cancelButtonText: {
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    alignSelf: 'center',
    fontSize: 16,
  },
  errorText: {
    color: '#ED1F24',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },

  // Other styles remain unchanged...
});
