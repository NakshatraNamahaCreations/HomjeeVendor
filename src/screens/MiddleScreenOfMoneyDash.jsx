import {
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { getRequest } from '../ApiService/apiHelper';
import { useLeadContext } from '../Utilities/LeadContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';
import PageLoader from '../components/PageLoader';
import moment from 'moment';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

const MiddleScreenOfMoneyDash = () => {
  const route = useRoute();
  const lead = route.params.lead ?? {};
  const leadId = lead.leadId;
  const navigation = useNavigation();
  const { setLeadDataContext } = useLeadContext();
  const [bookingDetails, setBookingDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [navigationLoader, setNavigationLoader] = useState(false);
  const { deviceTheme } = useThemeColor();
  console.log('leadId', lead);

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

  const fetchBookingData = async () => {
    setLoading(true);
    getRequest(`${API_ENDPOINTS.GET_BOOKINGS_BY_bOOKING_ID}${leadId}`)
      .then(response => {
        setBookingDetails(response.booking);
        //   setLeadDataContext(response.booking);
        setLoading(false);
      })
      .catch(err => {
        if (err) return;
        setLoading(false);
        console.error('Error fetching bookings:', err);
      });
  };

  useEffect(() => {
    fetchBookingData();
  }, [leadId]);

  const STATUS_COLORS = {
    'Survey Ongoing': '#FF7F00',
    'Project Ongoing': '#FF7F00',
    'Job Ongoing': '#FF7F00',
    'Survey Completed': 'green',
    'Customer Cancelled': '#ff0000',
    'Waiting for final payment': '#ff0000',
    'Customer Unreachable': '#ff0000',
    'Pending Hiring': '#fabb05ff',
    Hired: '#008e00ff',
    'Project Completed': '#008e00ff',
  };

  const leadDataStatus = bookingDetails?.bookingDetails?.status;
  const bgColor = STATUS_COLORS[leadDataStatus] ?? '#00000000';
  const currency = n => `₹ ${Number(n ?? 0).toLocaleString('en-IN')}`;

  const navigationDecision = lead => {
    setNavigationLoader(true);

    const hasLeadLocked = lead.bookingDetails?.hasLeadLocked;

    // Navigate first, without waiting for context update
    if (
      leadDataStatus === 'Customer Cancelled' ||
      leadDataStatus === 'Rescheduled'
    ) {
      if (hasLeadLocked) {
        setNavigationLoader(false); // Stop loader if no navigation happens
        return;
      }
      navigation.navigate('LeadDescriptionScreen');
    }

    // For other statuses
    if (
      leadDataStatus === 'Confirmed' ||
      leadDataStatus === 'Customer Unreachable'
    ) {
      navigation.navigate('LeadDescriptionScreen');
    }
    if (
      [
        'Survey Ongoing',
        'Survey Completed',
        'Pending Hiring',
        'Hired',
        'Project Ongoing',
        'Job Ongoing',
        'Project Completed',
        'Waiting for final payment',
      ].includes(leadDataStatus)
    ) {
      // Navigate immediately to the job ongoing screen
      navigation.navigate('JobOngoing');
    }

    // Update the context after navigation is triggered
    setLeadDataContext(lead);
    setNavigationLoader(false); // Stop loader after the context is updated
  };

  console.log('bookingDetails', bookingDetails);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      <View style={{ backgroundColor: '#F6F6F6', flex: 1 }}>
        <ScrollView
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
        >
          <Text
            style={{
              backgroundColor: bgColor,
              padding: 5,
              textAlign: 'center',
              color: 'white',
              fontFamily: 'Poppins-SemiBold',
            }}
          >
            {leadDataStatus}
          </Text>
          {/* Customer Details  */}
          <View style={styles.headerBlock}>
            <View style={styles.headerTop}>
              <Text style={styles.customerName}>
                {bookingDetails?.customer?.name}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.dateText}>
                  {' '}
                  {moment(bookingDetails?.selectedSlot?.slotDate).format('ll')}
                </Text>
                <Text style={styles.timeText}>
                  {' '}
                  {bookingDetails?.selectedSlot?.slotTime}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', paddingRight: 10 }}>
              <SimpleLineIcons
                name="location-pin"
                color="red"
                size={20}
                style={{ marginTop: 9, marginRight: 5 }}
              />
              <Text style={styles.descriptionText}>
                {bookingDetails?.address?.houseFlatNumber},{' '}
                {bookingDetails?.address?.streetArea}
              </Text>
            </View>
          </View>
          {/* Payment Details */}
          <View
            style={{
              backgroundColor: 'white',
              padding: 16,
            }}
          >
            <Text style={[styles.customerName, { marginBottom: 10 }]}>
              Payment Details
            </Text>
            <View style={styles.rowBetween}>
              <Text style={styles.amountLabel}>Paid Amount</Text>
              <Text style={styles.amountDue}>{currency(lead.amount)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.amountLabel}>Payment Type</Text>
              <Text style={styles.amountDue}>{lead.paymentType}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.amountLabel}>Paid At</Text>
              <Text style={styles.amountDue}>
                {lead.paidDate} at {lead.paidTime}
              </Text>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[styles.endBtn, { backgroundColor: '#ED1F24' }]}
          onPress={() => navigationDecision(bookingDetails)}
        >
          <Text style={styles.endBtnText}>VIEW DETAILS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MiddleScreenOfMoneyDash;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    // marginBottom: 100,
  },
  headerBlock: {
    backgroundColor: '#fff',
    padding: 16,
    // borderRadius: 10,
    marginBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
  },
  dateText: { color: '#ED1F24', fontSize: 13, fontFamily: 'Poppins-Medium' },
  timeText: { fontSize: 15, color: '#474141', fontFamily: 'Poppins-Medium' },
  descriptionText: {
    marginVertical: 8,
    color: '#575757',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  amountLabel: {
    // marginVertical: 8,
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  amountDue: { color: '#000000', fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  endBtn: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 15,
    alignItems: 'center',
    alignSelf: 'center',
  },
  endBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
