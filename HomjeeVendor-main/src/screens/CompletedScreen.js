import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Calendar as RNCalendar } from 'react-native-calendars';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  StatusBar,
} from 'react-native';
import { useLeadContext } from '../Utilities/LeadContext';
import { useVendorContext } from '../Utilities/VendorContext';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { getRequest } from '../ApiService/apiHelper';
import PageLoader from '../components/PageLoader';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import useBackHandler from '../Utilities/useBackHandler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';

const CompletedScreen = () => {
  const { deviceTheme } = useThemeColor();
  useBackHandler();
  const route = useRoute();
  const navigation = useNavigation();
  const { leadDataContext, setLeadDataContext } = useLeadContext();
  const leadId = leadDataContext._id;
  const { vendorDataContext } = useVendorContext();
  const [loading, setLoading] = useState(false);

  console.log('leadDataContext', leadDataContext);

  const fetchBookingData = async () => {
    setLoading(true);
    getRequest(`${API_ENDPOINTS.GET_BOOKINGS_BY_bOOKING_ID}${leadId}`)
      .then(response => {
        console.log('response', response);
        setLeadDataContext(response.booking);
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

  const handleNavigateToMap = () => {
    const lat = leadDataContext.address?.location?.coordinates[1];
    const lng = leadDataContext.address?.location?.coordinates[0];

    if (lat && lng) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      Linking.openURL(url).catch(err =>
        console.error('Error opening map:', err),
      );
    } else {
      console.warn('Invalid or missing coordinates');
    }
  };

  const openDialPad = async (phone = 8526190332) => {
    if (!phone) {
      console.log('Phone number not provided.');
      return;
    }
    const url = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log('Dial pad not supported on this device.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      <View
        style={{
          backgroundColor:
            leadDataContext.bookingDetails?.status === 'Completed'
              ? 'green'
              : leadDataContext.bookingDetails?.status === 'Customer Cancelled'
              ? 'red'
              : '#FF7F00',
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderBottomColor: '#e9e9e9',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('BottomTab', {
                screen: 'Ongoing',
              })
            }
          >
            <Ionicons name="arrow-back" color="white" size={23} />
          </TouchableOpacity>
          <Text
            style={{
              paddingHorizontal: 33,
              color: 'white',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
              marginTop: 5,
            }}
          >
            {leadDataContext.bookingDetails?.status}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <View style={styles.headerTop}>
            <Text style={styles.customerName}>
              {leadDataContext?.customer?.name}
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.dateText}>
                {' '}
                {moment(leadDataContext.selectedSlot?.slotDate).format('ll')}
              </Text>
              <Text style={styles.timeText}>
                {' '}
                {leadDataContext.selectedSlot?.slotTime}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={require('../assets/icons/location.png')}
              style={{ marginTop: 9, marginRight: 5, width: 20, height: 20 }}
            />
            <Text style={styles.descriptionText}>
              {leadDataContext.address?.houseFlatNumber},{' '}
              {leadDataContext.address?.streetArea}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.directionBtn}
              onPress={handleNavigateToMap}
            >
              <Image
                source={require('../assets/icons/navigation.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.contactText}> Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => openDialPad(leadDataContext.customer?.phone)}
            >
              <Image
                source={require('../assets/icons/contact.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.contactText}> Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
        {leadDataContext?.service[0]?.category === 'Deep Cleaning' ? (
          <>
            <View style={styles.packageRow}>
              <Text style={styles.sectionHeader}>Package Details</Text>
            </View>
            <View style={{ backgroundColor: 'white', marginVertical: 10 }}>
              {leadDataContext?.service?.map((ele, idx) => (
                <View style={styles.card} key={idx}>
                  <Text style={styles.packageTitle}>{ele.serviceName}</Text>
                  <View style={styles.location}>
                    <Image
                      style={{ marginRight: 5 }}
                      source={require('../assets/icons/star.png')}
                    />
                    <Text style={styles.bulletText}>₹ {ele.price}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'black',
                        fontFamily: 'Poppins-SemiBold',
                      }}
                    >
                      {' '}
                      x {ele.quantity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.sectionHeader}>Payment Details</Text>
            <View
              style={{
                backgroundColor: 'white',
                padding: 10,
                // marginBottom: 100,
                // paddingRight: 10,
                // paddingLeft: 10,
                // marginRight: 10,
                // marginLeft: 10,
              }}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Total Amount</Text>
                <Text style={styles.amountBold}>
                  ₹ {leadDataContext.bookingDetails?.paidAmount}
                </Text>
              </View>
              {/* <View style={styles.dottedLine} /> */}
              <View style={styles.rowBetween}>
                <Text style={styles.amountLabel}>Amount paid</Text>
                <Text style={styles.amountPaid}>
                  ₹ {leadDataContext.bookingDetails?.paidAmount}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.amountLabel}>Amount yet to paid</Text>
                <Text style={styles.amountDue}>₹ 0</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                backgroundColor: 'white',
                paddingHorizontal: 10,
                paddingTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.sectionHeader}>Measurement Summary</Text>
              </View>

              {/* <View style={[styles.headerBlock, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={styles.measureBtn}
                  onPress={() =>
                    navigation.navigate('StartMeasurement', { lead })
                  }
                >
                  <Text style={styles.measureText}>Start Measurement</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: 'black',
    // marginBottom: 20,
    // marginTop: 15,
    marginLeft: 10,
  },
  headerBlock: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '95%',
    borderRadius: 10,
  },
  tab: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#ED1F24',
  },
  tabInactive: {
    backgroundColor: '#E8E8E8',
  },
  tabTextActive: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  tabTextInactive: {
    color: '#373737',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  inputBox: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 10,
    paddingLeft: 10,
    fontFamily: 'Poppins-Medium',
  },
  rescheduleModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
  },
  rescheduleTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    flexDirection: 'row',
    padding: 12,
  },
  rescheduleText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: 'white',
    textAlign: 'center',
  },
  rescheduleBtn: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  rescheduleBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginRight: 40,
  },
  measurementSummaryContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  summaryLabel: {
    fontWeight: '600',
    color: '#333',
    marginRight: -20,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#333',
  },
  measureBtn: {
    borderWidth: 1,
    borderColor: '#ED1F24',
    padding: 10,
    borderRadius: 30,
    marginTop: -10,
  },
  measureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ED1F24',
    textAlign: 'center',
  },
  endBtn: {
    backgroundColor: '#ED1F24',
    padding: 16,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 50,
    alignSelf: 'center',
    minWidth: 340,
    marginBottom: 30,
  },
  endBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  directionBtn: {
    backgroundColor: '#616161',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    color: 'white',
  },
  contactBtn: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  updateButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    flexDirection: 'row',
    padding: 12,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginRight: 40,
  },
  contactText: {
    color: 'white',
  },
  contactText: { color: '#fff', fontFamily: 'Poppins-SemiBold' },
  packageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  viewDetails: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    top: 15,
    marginRight: 10,
  },
  packageTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    // marginBottom: 6,
  },

  bulletText: {
    fontSize: 12,
    color: '#393939',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },

  location: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: { fontFamily: 'Poppins-SemiBold', color: '#615858' },
  amountLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#4D4D4D',
    fontSize: 14,
  },
  amountBold: { fontFamily: 'Poppins-SemiBold', marginLeft: 130, marginTop: 5 },
  amountPaid: { fontFamily: 'Poppins-SemiBold' },
  amountDue: { color: '#000000', fontFamily: 'Poppins-SemiBold' },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dashed',
  },
  endBtn: {
    position: 'absolute',
    bottom: 20,
    width: '95%',
    backgroundColor: '#ED1F24',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center',
  },
  endBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    // backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    // marginBottom: 20,
  },
  slotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  slotButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E74C3C',
    flex: 1,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#E74C3C',
  },
  map: {
    marginBottom: 100,
    marginLeft: 30,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 10,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'white',
  },
});
export default CompletedScreen;
