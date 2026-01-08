import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  setModalVisible,
  FlatList,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useVendorContext } from '../Utilities/VendorContext';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import WalletCard from './WalletCard';

// "Are you sure you want to buy coins?" 
const Wallet = ({ navigation }) => {
  const { vendorDataContext } = useVendorContext();
  const vendorId = vendorDataContext?._id;
  const [loading, setLoading] = useState(false);
  const [trasactionData, setTrasactionData] = useState([]);


  const fetchTransactionHistory = useCallback(async () => {
    // ✅ safe check
    if (!vendorId) {
      setTrasactionData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.FETCH_WALLET_TRANSACTIONS}${vendorId}`,
      );

      console.log('Wallet history response', response.data);

      // ✅ safe fallback
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
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
  }, [fetchTransactionHistory]);

  const onRefresh = useCallback(async () => {
    await fetchTransactionHistory();
  }, [fetchTransactionHistory]);

  console.log('Wallet history response', trasactionData);

  const HistoryItem = React.memo(({ item }) => {
    // ✅ title fallback: title -> transactionType -> default
    const title =
      item?.title ||
      (item?.transactionType
        ? String(item.transactionType)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
        : 'Transaction');

    // ✅ amount fallback: amount -> coins -> coinAmount -> 0
    const amount = Number(item?.amount ?? item?.coins ?? item?.coinAmount ?? 0);

    // ✅ type fallback: type -> action -> derive from amount sign if needed
    const rawType = String(item?.type ?? item?.action ?? '').toLowerCase();
    const isAdded =
      rawType === 'added' || rawType === 'add' || rawType === 'credit' || amount > 0;

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

        <View style={styles.location}>
          {/* <Image
            style={styles.locationicon}
            source={require('../assets/icons/circleyellow.png')}
            resizeMode="contain"
          /> */}
          <FontAwesome5 name="coins" color="#F6C10E" size={17} />
          <Text
            style={{
              fontSize: 13,
              color: '#000000',
              fontFamily: 'Poppins-SemiBold',
              marginRight: 120,
            }}>
            {title}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: amountColor, // ✅ use computed color
              fontFamily: 'Poppins-SemiBold',
              marginRight: 50,
            }}>
            {sign} {Math.abs(amount)} coins
          </Text>
        </View>

        <Text
          style={{
            marginLeft: 30,
            color: '#000000',
            fontFamily: 'Poppins-Medium',
            fontSize: 12,
          }}>
          {dateText}
        </Text>
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
        coins={200}
        onBuyCoins={() => navigation.navigate("Payment")}
      />
      <Text
        style={{
          fontFamily: 'Poppins-SemiBold',
          fontSize: 16,
          color: '#000000',
          margin: 10,
        }}>
        Transactions
      </Text>
      {Array.isArray(trasactionData) && trasactionData.length > 0 ? (
        <FlatList
          data={trasactionData}
          keyExtractor={(it, idx) => String(it?._id || idx)}
          renderItem={({ item }) => <HistoryItem item={item} />}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={{ marginTop: 200 }}>
          <Text
            style={{
              color: '#b1b1b1',
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              textAlign: 'center',
            }}>
            No Transaction History
          </Text>
        </View>
      )}

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
});

export default Wallet;
