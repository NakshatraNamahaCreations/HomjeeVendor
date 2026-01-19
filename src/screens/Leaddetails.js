import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRequest, postRequest } from '../ApiService/apiHelper';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import PageLoader from '../components/PageLoader';
import moment from 'moment';
import MapView, { Marker } from 'react-native-maps';
import { useVendorContext } from '../Utilities/VendorContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useThemeColor } from '../Utilities/ThemeContext';
import { useLeadContext } from '../Utilities/LeadContext';
import IsEnabled3HoursBeforeSlot from '../Utilities/IsEnabled3HoursBeforeSlot';

const Leaddetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { vendorDataContext } = useVendorContext();
  const { deviceTheme } = useThemeColor();
  const leadId = route.params.leadId;
  const { leadDataContext } = useLeadContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: 12.900724675418454,
    longitude: 77.52341310849678,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [markerPosition, setMarkerPosition] = useState(null);

  const nightStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#ffffffff' }] },
  ];
  console.log('leadDataContext', leadDataContext);

  useEffect(() => {
    if (!leadId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getRequest(`${API_ENDPOINTS.GET_BOOKINGS_BY_bOOKING_ID}${leadId}`, {
      signal: controller.signal,
    })
      .then(response => {
        setBookingDetails(response.booking);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err);
        setLoading(false);
        console.error('Error fetching bookings:', err);
      });

    return () => controller.abort();
  }, [leadId]);

  useEffect(() => {
    if (
      bookingDetails &&
      bookingDetails.address &&
      bookingDetails.address.location &&
      Array.isArray(bookingDetails.address.location.coordinates)
    ) {
      const [longitude, latitude] = bookingDetails.address.location.coordinates;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005, // use suitable zoom/scaling factors
        longitudeDelta: 0.005,
      });

      setMarkerPosition({
        latitude,
        longitude,
      });
    }
  }, [bookingDetails]);

  // console.log('bookingDetails', bookingDetails);

  const handleSubmit = () => {
    setModalVisible(true);
  };

  const enableUI = IsEnabled3HoursBeforeSlot(
    leadDataContext.selectedSlot?.slotDate,
    leadDataContext.selectedSlot?.slotTime,
  );

  const handleConfirmJob = async () => {
    setLoading(true);

    try {
      const formData = {
        bookingId: leadId,
        vendorId: vendorDataContext._id,
        status: 'Confirmed',
        assignedProfessional: {
          professionalId: vendorDataContext._id,
          name: vendorDataContext.vendor?.vendorName,
          phone: vendorDataContext.vendor?.mobileNumber,
          profile: vendorDataContext.vendor?.profileImage,
          acceptedDate: moment().format('ll'),
          acceptedTime: moment().format('LT'),
        },
      };

      const result = await postRequest(API_ENDPOINTS.RESPOND_JOB, formData);
      console.log('Job Confirmed');
      setModalVisible(false);
      ToastAndroid.showWithGravity(
        result.message || 'Job Confirmed',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      navigation.navigate('BottomTab', {
        screen: 'New',
      });
    } catch (error) {
      // console.log('Error while update status:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to confirm Job',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  const overallCoinDeduction = (leadDataContext?.service ?? [])
    .reduce((sum, s) => sum + (Number(s?.coinDeduction) || 0), 0);

  console.log("overallCoinDeduction", overallCoinDeduction);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      {error && (
        <Text
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            color: 'red',
            textAlign: 'center',
            fontFamily: 'Poppins-Bold',
            marginTop: 50,
          }}
        >
          Error fetching booking details. Please try again.
        </Text>
      )}
      {!loading && !error && bookingDetails && (
        <>
          <ScrollView>
            <View style={{ marginTop: 10 }}>
              <View style={styles.mainleadone}>
                <View style={styles.leadone}>
                  <Text style={styles.titles}>
                    {bookingDetails.customer?.name}
                  </Text>
                  <Text style={styles.dateText}>
                    {moment(bookingDetails.selectedSlot?.slotDate).format('ll')}
                  </Text>
                </View>

                <Text style={styles.timeText}>
                  {bookingDetails.selectedSlot?.slotTime}
                </Text>

                <View style={styles.location}>
                  <Image
                    style={styles.locationicon}
                    source={require('../assets/icons/location.png')}
                    resizeMode="contain"
                  />
                  <Text style={styles.addressText}>
                    {/* {enableUI && bookingDetails?.address.houseFlatNumber + ','} */}
                    {bookingDetails.address?.streetArea}
                  </Text>
                </View>
                {enableUI && (
                  <View style={{ marginTop: 20 }}>
                    <MapView
                      style={{
                        width: '100%',
                        height: 200,
                      }}
                      region={region}
                      showsUserLocation
                      customMapStyle={nightStyle}
                    >
                      {markerPosition && (
                        <Marker
                          coordinate={markerPosition}
                          title="Selected Location"
                        />
                      )}
                    </MapView>
                  </View>
                )}
                <View style={styles.dottedLine} />

                <Text style={styles.sectionLabel}>Slot Date & Time</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.sectionContent}>
                    {moment(bookingDetails.selectedSlot?.slotDate).format('ll')}
                    {/* {bookingDetails.selectedSlot?.slotDate} */}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: 5,
                    }}
                  >
                    <View style={{ justifyContent: 'center', marginRight: 5 }}>
                      <Image
                        source={require('../assets/icons/ellipse.png')}
                        style={{ width: 5, height: 5 }}
                      ></Image>
                    </View>

                    <Text style={styles.sectionContent}>
                      {bookingDetails.selectedSlot?.slotTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.dottedLine} />

                <Text style={styles.sectionLabel}>Package Details</Text>
                <Text style={styles.packageTitle}>
                  {bookingDetails.service[0]?.category}
                </Text>
                {bookingDetails.service?.map((ele, idx) => (
                  <View style={styles.location} key={idx + 1}>
                    <Image
                      style={styles.starIcon}
                      source={require('../assets/icons/star.png')}
                      resizeMode="contain"
                    />
                    <Text style={styles.bulletText}>{ele.serviceName}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          {bookingDetails.bookingDetails?.status === 'Confirmed' ? (
            <Text
              style={{
                color: 'green',
                fontSize: 13,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
                marginTop: 30,
              }}
            >
              ✅ Responded
            </Text>
          ) : (
            <TouchableOpacity onPress={handleSubmit} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Respond</Text>
              <View style={{ flexDirection: 'row', marginLeft: 5 }}>
                <Text style={{ color: 'white' }}>( </Text>
                {/* <Image
                    style={{ width: 10, height: 10, marginTop: 5 }}
                    source={require('../assets/icons/respond.png')}
                    resizeMode="contain"
                  /> */}
                <FontAwesome5
                  name="coins"
                  color="#f5d138"
                  size={13}
                  style={{ marginTop: 5 }}
                />
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Poppins-SemiBold',
                    marginLeft: 5,
                  }}
                >
                  {overallCoinDeduction}
                </Text>
                <Text style={{ color: 'white' }}>)</Text>
              </View>
            </TouchableOpacity>
          )}
        </>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Top Row with Icon and Close */}
            <View style={styles.modalTopRow}>
              <Image
                style={styles.successIcon}
                source={require('../assets/icons/featured.png')}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Image
                  source={require('../assets/icons/close.png')}
                  style={styles.closeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Respond to the Lead</Text>

            {/* Subtitle */}
            <Text style={styles.modalSubtitle}>
              Are you sure you want to Respond to the lead.
            </Text>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmJob}
            // onPress={() => navigation.navigate('Leadone')}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
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
  safeArea: { flex: 1, backgroundColor: '#F6F6F6' },
  mainleadone: {
    padding: 10,
    borderRadius: 10,
  },
  leadone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titles: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#818181',
    marginLeft: -40,
  },
  timeText: {
    alignSelf: 'flex-end',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginTop: 10,
  },
  locationicon: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 10,
  },
  addressText: {
    fontSize: 12,
    color: '#575757',
    fontFamily: 'Poppins-Medium',
    top: 10,
    flex: 1,
  },
  mapImage: {
    width: '100%',
    height: 105,
    borderRadius: 10,
    marginTop: 20,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 20,
  },
  sectionLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#393939',
  },
  sectionContent: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#393939',
    fontWeight: '500',
    marginTop: 5,
  },
  packageTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#393939',
    marginTop: 10,
  },
  starIcon: {
    width: 16,
    height: 16,
    marginTop: 15,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 12,
    color: '#575757',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 15,
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    borderRadius: 5,
    // width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  errorImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'flex-start',
    width: '100%',
  },
  successIcon: {
    width: 48,
    height: 48,
  },
  closeIcon: {
    width: 44,
    height: 44,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginTop: 10,
    marginRight: 110,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  downborder: {
    position: 'relative',
    // bottom: -250,
    borderBottomWidth: 5, // Increased thickness for visibility
    borderBottomColor: '#ED1F24', // Set to red as requested
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,
    top: 25,
    left: 95,

    // Span the full width
  },
});

export default Leaddetails;
