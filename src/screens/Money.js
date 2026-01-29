import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';
import { getRequest } from '../ApiService/apiHelper';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { useVendorContext } from '../Utilities/VendorContext';
import PageLoader from '../components/PageLoader';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const Money = () => {
  const navigation = useNavigation()
  const { deviceTheme } = useThemeColor();
  const { vendorDataContext } = useVendorContext();
  const vendorId = vendorDataContext?._id;
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentRecords = useCallback(
    async (signal) => {
      setError(null);
      setLoading(true); // Loading state starts when data is being fetched
      try {
        const response = await getRequest(
          `${API_ENDPOINTS.GET_MONEY_DASHBOARD}${vendorId}`,
          signal ? { signal } : undefined
        );

        // Combine paidDate and paidTime into a single string and convert to Date
        const sortedPayments = response?.payments
          ?.map(payment => {
            // Combine paidDate and paidTime into one string for parsing
            const fullDateTime = `${payment.paidDate} ${payment.paidTime}`; // e.g., "19/01/2026 02:56:15 PM"

            // Parse the combined string into a Date object
            const paymentDate = moment(fullDateTime, "DD/MM/YYYY hh:mm:ss A").toDate();

            return {
              ...payment,
              paymentDate, // Store Date object here
              // Format paymentDate for rendering
              formattedPaymentDate: moment(paymentDate).format("DD/MM/YYYY hh:mm:ss A")
            };
          })
          .sort((a, b) => b.paymentDate - a.paymentDate) || []; // Sort Date objects

        setPaymentData(sortedPayments);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        setLoading(false); // Loading ends when data is fetched
      }
    },
    [vendorId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPaymentRecords(controller.signal).finally(() => setLoading(false));
    return () => controller.abort(); // Cleanup the request when the component unmounts or vendorId changes
  }, [vendorId, fetchPaymentRecords]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const controller = new AbortController();
    await fetchPaymentRecords(controller.signal); // Fetch the latest data
    setRefreshing(false); // Stop refreshing once data is fetched
  }, [fetchPaymentRecords]);

  console.log("paymentData Money Dash", paymentData);


  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.mainleadone}
      onPress={() => navigation.navigate('PaymentDetailed', {
        lead: item,
      })}
    >
      <View style={styles.leadone}></View>
      <View style={styles.location}>
        <Text style={styles.notifHead}>
          <Text style={styles.boldText}>₹ {item.amount}</Text> received on {item.paidDate} at {item.paidTime}{' '}
          as {item.paymentType} done by {item.customerName}
        </Text>

      </View>
      {/* <Text style={styles.bookingId}>Booking Id: {item.bookingId}</Text> */}
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      <Header />
      <View style={{ padding: 10 }}>
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            marginVertical: 10,
          }}
        >
          Money Dashboard
        </Text>

        <FlatList
          data={paymentData}
          keyExtractor={(item, index) => `${item._id}-${index}`} // Unique key for each item
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{
                color: '#b1b1b1',
                fontSize: 14,
                fontFamily: 'Poppins-Medium',
                textAlign: 'center',
              }} >No payment records found.</Text>
            </View>
          }
        />
        <View style={{ marginBottom: 20 }} />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    // marginBottom: 100,
  },
  notifHead: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  boldText: {
    color: '#1b8800',
  },
  bookingId: {
    fontFamily: 'Poppins-Medium', color: '#1b8800', fontSize: 10,
  },
  leadone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  location: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  mainleadone: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  emptyState: {
    marginTop: 200
  },
});

export default Money;
