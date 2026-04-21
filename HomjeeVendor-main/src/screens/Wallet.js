import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  ToastAndroid,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useVendorContext } from '../Utilities/VendorContext';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import WalletCard from './WalletCard';
import { usePerformance } from '../Utilities/PerformanceContext';
import { getRequest } from '../ApiService/apiHelper';

// his profile status as Low coins as soon as coins are
// below 100 and then no leads to be notified to him
// till he recharge his wallet

const Wallet = () => {
  const { vendorDataContext, setVendorDataContext } = useVendorContext();
  const vendorId = vendorDataContext?._id;
  const [loading, setLoading] = useState(false);
  const [trasactionData, setTrasactionData] = useState([]);
  const [openPrompt, setOpenPrompt] = useState(false);
  const { buyCoinsEnabled, isPerformanceLow, coins } = usePerformance();
  const [linkStatus, setLinkStatus] = useState({
    canGenerateLink: true,
  });
  const [isSendingLink, setIsSendingLink] = useState(false);
  console.log('vendorId', vendorDataContext);

  const updateVendor = useCallback(async () => {
    if (!vendorId) return;
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GET_VENDOR_PROFILE}${vendorId}`,
      );

      if (response?.vendor) {
        console.log('response.vendor', response.vendor);
        setVendorDataContext(response.vendor);
      }
    } catch (error) {
      console.error('Error in returing vendor', error);
    }
  }, [vendorId]);

  const fetchBuyStatus = useCallback(async () => {
    if (!vendorId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.PAYMENT_LINK_STATUS}${vendorId}`,
      );

      setLinkStatus({
        canGenerateLink: Boolean(res?.data?.canGenerateLink),
        wallet: res?.data?.wallet || {},
      });
    } catch (err) {
      console.error('status api error', err);

      // fallback: allow buying instead of crashing
      setLinkStatus({
        canGenerateLink: true,
        wallet: {},
      });
    }
  }, [vendorId]);

  const fetchTransactionHistory = useCallback(async () => {
    if (!vendorId) {
      setTrasactionData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.FETCH_WALLET_TRANSACTIONS}${vendorId}`,
      );
      // console.log('Wallet history response', response.data);
      const list = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      setTrasactionData(list);
    } catch (error) {
      console.error('Failed to Transaction history:', error);
      setTrasactionData([]);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchTransactionHistory();
    fetchBuyStatus();
    updateVendor();
  }, [fetchTransactionHistory, fetchBuyStatus]);

  const onRefresh = useCallback(async () => {
    await fetchTransactionHistory();
    await fetchBuyStatus();
    await updateVendor();
  }, [fetchTransactionHistory, fetchBuyStatus, updateVendor]);

  console.log('buyCoinsEnabled', buyCoinsEnabled);
  console.log('isPerformanceLow', isPerformanceLow);
  console.log('linkStatus', linkStatus);

  const finalBuyCoinsEnabled =
    buyCoinsEnabled && linkStatus?.canGenerateLink && !isSendingLink;

  const sendPaymentLink = async () => {
    setOpenPrompt(false);
    setIsSendingLink(true);
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.SEND_PAYMENT_LINK}${vendorId}/payment-link`;

      const res = await axios.put(url);

      console.log('sendLink response:', res?.data);

      if (res?.data?.status === 'success') {
        ToastAndroid.showWithGravity(
          'Payment link generated & sent to WhatsApp',
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );

        // 🔴 refresh backend truth
        await fetchBuyStatus();
      } else {
        setIsSendingLink(false); // unlock if failed
        ToastAndroid.showWithGravity(
          res?.data?.message || 'Failed to send payment link',
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );
      }
    } catch (error) {
      console.error(
        'sendPaymentLink error:',
        error?.response?.data || error?.message,
      );
      setIsSendingLink(false);
      ToastAndroid.showWithGravity(
        error?.response?.data?.message || 'Fail to send a link',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    }
  };

  const HistoryItem = React.memo(({ item }) => {
    // ✅ title fallback: title -> transactionType -> default
    const title =
      item?.title ||
      (item?.transactionType
        ? String(item.transactionType)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
        : 'Transaction');

    // ✅ type fallback: type -> action -> derive from amount sign if needed
    const rawType = String(item?.type ?? item?.action ?? '').toLowerCase();
    const isAdded =
      rawType === 'added' ||
      rawType === 'add' ||
      rawType === 'credit' ||
      item?.amount > 0;

    const sign = isAdded ? '+' : '-';
    const amountColor = isAdded ? '#008E00' : '#df2020';

    // ✅ date fallback: createdAt -> date -> transactionDate
    const rawDate = item?.createdAt || item?.date || item?.transactionDate;
    const dateText = rawDate
      ? new Date(rawDate).toLocaleDateString('en-GB')
      : '--/--/----';

    return (
      <View style={styles.mainleadone}>
        <View style={styles.leadone}></View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 0.1 }}>
            <FontAwesome5 name="coins" color="#F6C10E" size={17} />
          </View>
          <View style={{ flex: 0.7 }}>
            <Text
              style={{
                fontSize: 13,
                color: '#000000',
                fontFamily: 'Poppins-SemiBold',
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: '#000000',
                fontFamily: 'Poppins-Medium',
                fontSize: 12,
              }}
            >
              {dateText}
            </Text>
          </View>
          <View style={{ flex: 0.2 }}>
            <Text
              style={{
                fontSize: 12,
                color: amountColor,
                fontFamily: 'Poppins-SemiBold',
              }}
            >
              {sign} {Math.abs(item?.coin)} coins{' '}
            </Text>
          </View>
        </View>
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <TouchableOpacity
        onPress={() => {
          navigation.navigate('Payment');
        }}>
        <Image
          style={{ margin: 10, }}
          source={require('../assets/images/group.png')}
        />
      </TouchableOpacity> */}
      <WalletCard
        coins={coins}
        onBuyCoins={() => setOpenPrompt(true)}
        buyCoinsEnabled={finalBuyCoinsEnabled}
        // buyCoinsEnabled={buyCoinsEnabled}
        isPerformanceLow={isPerformanceLow}
      />
      <Text
        style={{
          fontFamily: 'Poppins-SemiBold',
          fontSize: 16,
          color: '#000000',
          margin: 10,
        }}
      >
        Transactions
      </Text>
      {Array.isArray(trasactionData) && trasactionData.length > 0 ? (
        <FlatList
          data={trasactionData}
          keyExtractor={(it, idx) => String(it?._id || idx)}
          renderItem={({ item }) => <HistoryItem item={item} />}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={{ marginTop: 200 }}>
          <Text
            style={{
              color: '#b1b1b1',
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              textAlign: 'center',
            }}
          >
            No Transaction History
          </Text>
        </View>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={openPrompt}
        onRequestClose={() => setOpenPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }}>
                Buy Coins
              </Text>
              <Fontisto
                name="close"
                color="#000000ff"
                size={17}
                onPress={() => setOpenPrompt(false)}
              />
            </View>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Are you sure you want to buy coins?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={sendPaymentLink}
            >
              <Text style={styles.confirmButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setOpenPrompt(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    // paddingTop: 50,
  },
  discoverleads: {
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 30,
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationWrappertwo: {
    borderRadius: 28,
    borderWidth: 1,
    width: '22%',
    paddingHorizontal: 5,
    paddingTop: 3,
    paddingBottom: 3,
    marginLeft: 100,
  },
  icon: {
    width: 30,
    height: 20,

    left: -2,
  },
  iconsnewlead: {
    left: 5,
    top: -2,
  },
  icontwo: {
    width: 35,
    height: 22,
    top: 3,
  },
  badge: {
    position: 'absolute',
    right: -10,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgetwo: {
    position: 'absolute',
    left: 40,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    top: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTexttwo: {
    color: '#ED1F24',
    fontSize: 12,
    fontWeight: 'bold',
    right: 5,
    bottom: 3,
  },
  title: {
    fontSize: 12,
    color: '#434343',
    // marginTop: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    padding: 30,
    marginLeft: -25,
    letterSpacing: 0,
    fontWeight: 500,
  },
  titles: {
    marginRight: 200,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0,
    right: 4,
  },
  headertwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: -20,
    marginBottom: -20,
  },
  newleads: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#636363',
    letterSpacing: 0,
    left: 3,
  },
  locationicon: {
    width: 20,
    height: 15,
    // top: 12,
    paddingRight: 10,
    right: 10,
  },
  leadone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  location: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // padding: 10,
    margin: 5,
  },
  mainleadone: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    // top: 20,
    borderRadius: 5,
    margin: 5,
  },
  mainleadtwo: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 40,
    borderRadius: 10,
  },
  mainleadthree: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 60,
    borderRadius: 10,
  },
  mainleadfour: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 80,
    borderRadius: 10,
  },
  mainleadfive: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 100,
    borderRadius: 10,
    marginBottom: 80,
  },
  downborder: {
    position: 'relative',
    // bottom: -250,
    left: 100,
    right: 20,
    borderBottomWidth: 5, // Increased thickness for visibility
    borderBottomColor: '#ED1F24', // Set to red as requested
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,
    top: 35,
    // Span the full width
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
  checkIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
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
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});

export default Wallet;

// wallet case
// Case 1: Coins < 100 AND Performance = Low
// Buy Coins:  Disabled
// Respond Lead:  Disabled
// New Leads: Not Visible

// Case 2: Coins < 100 AND Performance = Good
// Buy Coins:  Enabled
// Respond Lead: Enabled
// New Leads:  Visible
// buyCoinsEnabled true
// isPerformanceLow false

// Case 3: Coins > 100 AND Performance = Low
// Buy Coins:  Disabled
// Respond Lead:  Enabled
// New Leads:  Visible
// buyCoinsEnabled false
// isPerformanceLow true

// Case 4: Coins > 100 AND Performance = Good
// Buy Coins:  Disabled
// Respond Lead: Enabled
// New Leads: Visible
// isPerformanceLow false
// buyCoinsEnabled false

// vendor id : 689472b895ba472e19ad7284

// pending in coins
// reshcduel - refund, cancel - refund,
// disable leads based on rule
