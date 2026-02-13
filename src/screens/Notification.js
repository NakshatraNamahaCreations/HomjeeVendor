import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';
import { useVendorContext } from '../Utilities/VendorContext';
import { getRequest } from '../ApiService/apiHelper';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';
import PageLoader from '../components/PageLoader';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';

const Notification = () => {
  const { deviceTheme } = useThemeColor();
  const { vendorDataContext } = useVendorContext();
  const navigation = useNavigation();
  const vendorId = vendorDataContext?._id;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationData, setNotificationData] = useState([]);

  const fetchNotifications = useCallback(
    async signal => {
      setLoading(true); // Loading state starts when data is being fetched
      try {
        const response = await getRequest(
          `${API_ENDPOINTS.GET_NOTIFICATION}${vendorId}`,
          {
            serviceType: vendorDataContext?.vendor?.serviceType,
          },
          signal ? { signal } : undefined,
        );

        // Combine paidDate and paidTime into a single string and convert to Date
        // const sortedPayments = response?.payments
        //   ?.map(payment => {
        //     // Combine paidDate and paidTime into one string for parsing
        //     const fullDateTime = `${payment.paidDate} ${payment.paidTime}`; // e.g., "19/01/2026 02:56:15 PM"

        //     // Parse the combined string into a Date object
        //     const paymentDate = moment(fullDateTime, "DD/MM/YYYY hh:mm:ss A").toDate();

        //     return {
        //       ...payment,
        //       paymentDate, // Store Date object here
        //       // Format paymentDate for rendering
        //       formattedPaymentDate: moment(paymentDate).format("DD/MM/YYYY hh:mm:ss A")
        //     };
        //   })
        //   .sort((a, b) => b.paymentDate - a.paymentDate) || []; // Sort Date objects

        setNotificationData(response.data || []);
      } catch (err) {
        if (err.name !== 'AbortError') console.log(err);
      } finally {
        setLoading(false); // Loading ends when data is fetched
      }
    },
    [vendorId],
  );

  console.log('notificationData', notificationData);
  console.log('vendorDataContext', vendorDataContext.vendor?.serviceType);

  useEffect(() => {
    const controller = new AbortController();
    fetchNotifications(controller.signal).finally(() => setLoading(false));
    return () => controller.abort(); // Cleanup the request when the component unmounts or vendorId changes
  }, [vendorId, fetchNotifications]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const controller = new AbortController();
    await fetchNotifications(controller.signal); // Fetch the latest data
    setRefreshing(false); // Stop refreshing once data is fetched
  }, [fetchNotifications]);

  // console.log("paymentData Money Dash", paymentData);

  const handleNotificationClick = notification => {
    console.log('notification type', notification);
    //  const lead ={
    //         customerName: booking?.customer?.name || "-",
    //         bookingId: booking?.bookingDetails?.booking_id || "-",
    //         leadId: booking?._id,
    //         paymentDate: paidAt ? paidAt.toISOString() : null,
    //         paidDate,
    //         paidTime,
    //         paymentType,
    //         amount: Number(p.amount),
    //         method: p.method,
    //         providerRef: p.providerRef || null, // ✅ cash will be null
    //         formattedPaymentDate: paidAt ? `${paidDate} ${paidTime}` : "",
    //   } 
    switch (notification.notificationType) {

      case 'PAYMENT':
        navigation.navigate('PaymentDetailed', {
          lead: notification.metaData.bookingId,
        });
        break;
      case 'REMINDER':
        navigation.navigate('PaymentDetailed', {
          lead: notification.metaData.bookingId,
        });
        break;
      // case 'product_booking':
      //   navigation.navigate('Booking List', {
      //     vendorNotification: vendorData,
      //     // bookingId: notification.metadata.bookingId,
      //   });
      //   break;
      // case 'service_booking':
      //   navigation.navigate('Schedule', {
      //     vendorNotification: vendorData,
      //     // bookingId: notification.metadata.bookingId,
      //   });
      //   break;
      // case 'vendor_payment':
      //   navigation.navigate('PayoutHistory', {
      //     vendor: vendorData,
      //   });
      //   break;
      default:
        console.log('Unknown notification type');
    }

    // Mark notification as read
    markNotificationAsRead(notification._id);
  };

  const markNotificationAsRead = async notificationId => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MARK_AS_READ_NOTIFICATION}${notificationId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data = await response.json();
      console.log("notification data RES", data);

      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const showIcon = (type) => {
    if (type === "PAYMENT") {
      return <MaterialIcons name="currency-rupee" color="#008d00" size={25} />
    } else if (type === "REMINDER") {
      return <MaterialIcons name="notifications-active" color="#F6C10E" size={25} />
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        backgroundColor:
          item.status === 'unread' ? '#d7e9fb' : 'white',
        padding: 10,
        marginTop: .5, alignItems: "center"
      }}
      onPress={() => handleNotificationClick(item)}
    >
      <View style={{ flex: 0.2, justifyContent: 'flex-end' }}>
        {showIcon(item.notificationType)}

      </View>
      <View style={{ flex: 0.8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'black', fontFamily: 'Poppins-SemiBold' }}>
            {item.thumbnailTitle}
          </Text>
          <Text
            style={{
              color: 'black',
              fontFamily: 'Poppins-Regular',
              fontSize: 12,
              letterSpacing: 0,
            }}
          >
            {moment(item.createdAt).fromNow()}
            {/* 12.45 PM */}
          </Text>
        </View>

        <Text
          style={{
            color: 'grey',
            fontSize: 12,
            fontFamily: 'Poppins-Regular',
          }}
        >
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      <View style={{ marginTop: .5 }} />
      <FlatList
        data={notificationData}
        keyExtractor={(item, index) => `${item._id}-${index}`} // Unique key for each item
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text
              style={{
                color: '#b1b1b1',
                fontSize: 14,
                fontFamily: 'Poppins-Medium',
                textAlign: 'center',
              }}
            >
              No payment records found.
            </Text>
          </View>
        }
      />
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
    fontFamily: 'Poppins-Medium',
    color: '#1b8800',
    fontSize: 10,
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
    marginTop: 200,
  },
});

export default Notification;
