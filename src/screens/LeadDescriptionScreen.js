import moment from 'moment';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ToastAndroid,
  Linking,
  StatusBar,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import MapView, { Marker } from 'react-native-maps';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';
import { getRequest, postRequest } from '../ApiService/apiHelper';
import PageLoader from '../components/PageLoader';
import { Link, useNavigation, useRoute } from '@react-navigation/native';
import { useVendorContext } from '../Utilities/VendorContext';
import { useLeadContext } from '../Utilities/LeadContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DynamicImage from '../Utilities/DynamicImage';
import IsEnabled3HoursBeforeSlot from '../Utilities/IsEnabled3HoursBeforeSlot';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';

const LeadDescriptionScreen = () => {
  // const route = useRoute();
  const navigation = useNavigation();
  const { deviceTheme } = useThemeColor();
  const { vendorDataContext } = useVendorContext();
  // const { lead } = route.params;

  const { leadDataContext, setLeadDataContext } = useLeadContext();
  const leadId = leadDataContext._id;
  console.log('leadId', leadDataContext);

  const [loading, setLoading] = useState(false);
  const [isSlotLoaded, setIsSlotLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [ReachablePrompt, setReachablePrompt] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false);
  const [amount, setAmount] = useState(0);
  const [comment, setComment] = useState('');
  const [isReduce, setIsReduce] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  const inputs = useRef([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [joinedOtp, setJoinedOTP] = useState(null);
  const [packageList, setPackageList] = useState([]);
  const [viewPackages, setViewPackages] = useState(false);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSlotSelected, setIsSlotSelected] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [requiredTime, setRequiredTime] = useState(null);
  // const availableSlots = ['10:30am', '12:30pm', '01:30pm', '2:30pm', '5:30pm'];

  const [region, setRegion] = useState({
    latitude: 12.900724675418454,
    longitude: 77.52341310849678,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [markerPosition, setMarkerPosition] = useState(null);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableTeam, setAvailableTeam] = useState([]);
  const [availability, setAvailability] = useState({});
  const today = new Date().toISOString().split('T')[0];
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState(today);

  // function isEnabled3HoursBeforeSlot(slotDateISOString, slotTimeStr) {
  //   if (!slotDateISOString || !slotTimeStr) return false;

  //   // Get the date portion in local time (IST, user's time)
  //   const slotDateLocal = moment(slotDateISOString);
  //   const slotDateLocalString = slotDateLocal.format('YYYY-MM-DD');
  //   // Combine local date and slot time, then parse in local time!
  //   const slotDateTime = moment(
  //     `${slotDateLocalString} ${slotTimeStr}`,
  //     'YYYY-MM-DD hh:mm A',
  //   );

  //   // Debug: console.log('Slot DateTime:', slotDateTime.format(), "Now:", moment().format());

  //   const activationTime = slotDateTime.clone().subtract(3, 'hours');
  //   return moment().isSameOrAfter(activationTime);
  // }
  // isEnabled3HoursBeforeSlot

  const enableUI = IsEnabled3HoursBeforeSlot(
    leadDataContext.selectedSlot?.slotDate,
    leadDataContext.selectedSlot?.slotTime,
  );

  const toggleMember = memberId => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        // if already selected → remove
        return prev.filter(id => id !== memberId);
      } else {
        // add to selection
        return [...prev, memberId];
      }
    });
  };

  const fetchBookingData = async () => {
    setLoading(true);
    getRequest(`${API_ENDPOINTS.GET_BOOKINGS_BY_bOOKING_ID}${leadId}`)
      .then(response => {
        // console.log('response', response);
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

  const uniqueSubCategories = [
    ...new Set(leadDataContext.service?.map(unq => unq.subCategory)),
  ];
  const queryString = uniqueSubCategories
    .map(sub => `subCategory=${encodeURIComponent(sub)}`)
    .join('&');

  const fetchPackages = async () => {
    setLoading(true);
    getRequest(`${API_ENDPOINTS.GET_PACKAGES_BY_SERVICE_TYPE}?${queryString}`)
      .then(response => {
        setPackageList(response.packages);
        setLoading(false);
      })
      .catch(err => {
        if (err) return;
        setLoading(false);
        console.error('Error fetching packages:', err);
      });
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  console.log('availableSlots', availableSlots);
  console.log('selectedSlot', selectedSlot);

  const calculatedPrice = isReduce
    ? Number(leadDataContext.bookingDetails.paidAmount) - Number(amount)
    : Number(leadDataContext.bookingDetails.paidAmount) + Number(amount);
  // console.log('calculatedPrice', calculatedPrice);

  const updatePrice = async () => {
    setLoading(true);
    const bookingId = leadDataContext._id;
    // 🔢 Ensure numeric safety
    const currentTotal =
      Number(leadDataContext?.bookingDetails?.finalTotal) || 0;
    const adjustment = Number(amount) || 0;
    const newPrice = isReduce
      ? currentTotal - adjustment
      : currentTotal + adjustment;

    // 🛑 Prevent invalid numbers
    if (isNaN(newPrice) || newPrice < 0) {
      ToastAndroid.showWithGravity(
        'Invalid amount entered',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      setLoading(false);
      return;
    }
    try {
      const formData = {
        adjustmentAmount: adjustment,
        proposedTotal: newPrice, // ✅ Correct field name
        reason: comment.trim(), // ✅ "reason", not "reasonForEditing"
        scopeType: isReduce ? 'Reduced' : 'Added',
        requestedBy: 'vendor', // ✅ REQUIRED! (or 'admin', 'customer')
      };

      // Optional: validate on frontend
      if (!formData.reason) {
        throw new Error('Reason is required');
      }

      const result = await postRequest(
        `${API_ENDPOINTS.UPDATE_PRICING}${bookingId}`,
        formData,
      );

      ToastAndroid.showWithGravity(
        result.message || 'Price change requested',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );

      fetchBookingData();
      setAmount('');
      setComment('');
      setSecondModalVisible(false);
    } catch (error) {
      console.error('Error while updating price:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to request price change',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    preloadAvailability();
  }, []);

  const preloadAvailability = async () => {
    try {
      const start = moment().format('YYYY-MM-DD');
      const end = moment().add(30, 'days').format('YYYY-MM-DD');

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.CHECK_AVAILABILITY_RANGE}${vendorDataContext?._id}/availability-range`,
        {
          params: {
            startDate: start,
            endDate: end,
            daysRequired: 1,
          },
        },
      );

      const data = res.data;
      // console.log('Availability Res:', data);

      if (!data.success) return;
      setAvailability(data.availability);

      const blocked = {};
      Object.entries(data.availability).forEach(([date, info]) => {
        if (!info.canStart) {
          blocked[date] = { disabled: true, disableTouchEvent: true };
        }
      });
    } catch (err) {
      console.error('Error preloading availability:', err);
    }
  };

  useEffect(() => {
    const selectedDate = leadDataContext.selectedSlot?.slotDate;
    if (!selectedDate || !availability) {
      setAvailableTeam([]);
      return;
    }

    const info = availability[selectedDate];
    if (info && info.canStart) {
      setAvailableTeam(info.availableMembers || []);
    } else {
      setAvailableTeam([]);
    }
  }, [leadDataContext.selectedSlot?.slotDate, availability]);

  const minTeamRequired = useMemo(() => {
    if (!leadDataContext.service || leadDataContext.service.length === 0)
      return 0;

    // Assume each package has a `teamMembersRequired` field from admin config
    return Math.max(
      ...leadDataContext.service.map(pkg => pkg.teamMembersRequired || 1),
    );
  }, [leadDataContext.service]);

  const canContinue =
    selectedMembers.length >= minTeamRequired && selectedMembers.length > 0;

  console.log('minTeamRequired', minTeamRequired);

  useEffect(() => {
    if (
      leadDataContext &&
      leadDataContext.address &&
      leadDataContext.address?.location &&
      Array.isArray(leadDataContext.address?.location.coordinates)
    ) {
      const [longitude, latitude] =
        leadDataContext.address?.location.coordinates;

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
  }, [leadDataContext]);
  // console.log('joinedOtp', joinedOtp);

  const nightStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#3e3a24ff' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#ffffffff' }] },
  ];

  const handleStartJob = () => {
    setModalVisible(false);
    setTeamModalVisible(true);
  };

  const handleOpenOtp = () => {
    setModalVisible(false);
    setOtpModalVisible(true);
  };

  const openDialPad = phoneNumber => {
    // console.log('phoneNumber', phoneNumber);

    const phoneCallURL = `tel:${phoneNumber}`;
    Linking.openURL(phoneCallURL)
      .then(data => {
        console.log('Phone call initiated successfully');
      })
      .catch(() => {
        console.error('Error initiating phone call');
      });
  };

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
  const handleChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      const joinString = newOtp.join('');
      setJoinedOTP(joinString);
      setOtp(newOtp);
      if (text && index < 3) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  // const handleConfirmJob = async () => {
  //   setLoading(true);
  //   if (joinedOtp === null) {
  //     return ToastAndroid.showWithGravity(
  //       'OTP Is Required',
  //       ToastAndroid.LONG,
  //       ToastAndroid.CENTER,
  //     );
  //   }
  //   try {
  //     const formData = {
  //       bookingId: leadDataContext._id,
  //       status:
  //         vendorDataContext?.vendor?.serviceType === 'house-painter'
  //           ? 'Survey Ongoing'
  //           : 'Job Ongoing',
  //       otp: joinedOtp,
  //       assignedProfessional: {
  //         professionalId: vendorDataContext._id,
  //         name: vendorDataContext.vendor?.vendorName,
  //         phone: vendorDataContext.vendor?.mobileNumber,
  //         acceptedDate: leadDataContext.assignedProfessional?.acceptedDate,
  //         acceptedTime: leadDataContext.assignedProfessional?.acceptedTime,
  //         startedDate: moment().format('ll'),
  //         startedTime: moment().format('LT'),
  //       },
  //       teamMembers:
  //         vendorDataContext?.vendor?.serviceType === 'house-painter'
  //           ? []
  //           : selectedMembers.map(id => {
  //               const member = availableTeam.find(m => m._id === id);
  //               return { _id: member._id, name: member.name };
  //             }),
  //     };

  //     const result = await postRequest(API_ENDPOINTS.START_JOB, formData);
  //     console.log('Job Started');
  //     setOtp(['', '', '', '']);
  //     setOtpModalVisible(false);
  //     setModalVisible(false);
  //     ToastAndroid.showWithGravity(
  //       result.message || 'Job Started',
  //       ToastAndroid.LONG,
  //       ToastAndroid.CENTER,
  //     );

  //     navigation.navigate('JobOngoing');
  //   } catch (error) {
  //     console.log('Error while starting job:', error);
  //     ToastAndroid.showWithGravity(
  //       error?.message || 'Failed to start Job',
  //       ToastAndroid.LONG,
  //       ToastAndroid.CENTER,
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleConfirmJob = async () => {
    setLoading(true);
    if (joinedOtp === null) {
      ToastAndroid.showWithGravity(
        'OTP Is Required',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      setLoading(false);
      return;
    }

    // Determine effective start date & days
    const startDate = leadDataContext.selectedSlot?.slotDate;
    const days = 1;

    if (!startDate) {
      ToastAndroid.showWithGravity(
        'Start date is missing',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      setLoading(false);
      return;
    }
    console.log('outside try');
    try {
      const formData = {
        bookingId: leadDataContext._id,
        status:
          vendorDataContext?.vendor?.serviceType === 'deep cleaning'
            ? 'Job Ongoing'
            : 'Survey Ongoing',
        otp: joinedOtp,
        startDate, // ← now used in backend
        daysRequired: days, // ← aligned name
        assignedProfessional: {
          professionalId: vendorDataContext._id,
          name: vendorDataContext.vendor?.vendorName,
          phone: vendorDataContext.vendor?.mobileNumber,
          profile: vendorDataContext.vendor?.profileImage,
          acceptedDate: leadDataContext.assignedProfessional?.acceptedDate,
          acceptedTime: leadDataContext.assignedProfessional?.acceptedTime,
          startedDate: moment().format('YYYY-MM-DD'), // ISO date for DB
          startedTime: moment().format('LT'),
        },
        teamMembers: selectedMembers.map(id => {
          const member = availableTeam.find(m => m._id === id);
          return { _id: member._id, name: member.name };
        }),
      };
      console.log('inside try');
      const result = await postRequest(API_ENDPOINTS.START_JOB, formData);
      console.log('result', result);

      // ... success handling
      navigation.navigate('JobOngoing');
    } catch (error) {
      // ... error handling
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async status => {
    setLoading(true);
    // if (status === 'Customer Cancelled' && cancelReason === '') {
    //   return ToastAndroid.showWithGravity(
    //     'Reason for cancel is required',
    //     ToastAndroid.LONG,
    //     ToastAndroid.CENTER,
    //   );
    // }
    try {
      const formData = {
        bookingId: leadDataContext._id,
        status: status,
        vendorId: vendorDataContext._id,
        // reasonForCancelled: cancelReason,
      };

      const result = await postRequest(API_ENDPOINTS.UPDATE_STATUS, formData);
      // console.log('Status Updated', result);
      setStatusModalVisible(false);
      ToastAndroid.showWithGravity(
        result.message || 'Status Updated',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      navigation.goBack();
    } catch (error) {
      console.log('Error while updating status:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to update status',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  const backgroundColorStatus = () => {
    if (
      leadDataContext.bookingDetails?.status === 'Survey Ongoing' ||
      leadDataContext.bookingDetails?.status === 'Job Ongoing'
    ) {
      return '#FF7F00';
    }
    // else if (leadDataContext.bookingDetails?.status === 'Confirmed') {
    //   return 'green';
    // }
    else if (
      leadDataContext.bookingDetails?.status === 'Customer Cancelled' ||
      leadDataContext.bookingDetails?.status === 'Rescheduled'
    ) {
      return '#ff0000';
    } else if (
      leadDataContext.bookingDetails?.status === 'Customer Unreachable'
    ) {
      return '#ff0000';
    }
  };

  useEffect(() => {
    if (!vendorDataContext?._id || !leadId || !selectedRescheduleDate) return;

    fetchAvailableSlots();
  }, [vendorDataContext?._id, leadId, selectedRescheduleDate]);

  const fetchAvailableSlots = async () => {
    setIsSlotLoaded(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.FETCH_RESCHEDULE_BOOKING}${vendorDataContext?._id}`,
        {
          bookingId: leadId,
          targetDate: selectedRescheduleDate,
        },
      );
      const data = res.data;
      // console.log('Availability reshedule Res:', data);
      setAvailableSlots(data?.availableSlots);
      setRequiredTime(data?.requiredTotalMinutes);
    } catch (err) {
      console.error('Error fetching available vendor slots:', err);
    } finally {
      setIsSlotLoaded(false);
    }
  };

  const handleSlotSelection = slot => {
    setIsSlotSelected(true);
    setSelectedSlot(slot);
  };
  const handleResetSlotndClose = () => {
    setShowRescheduleModal(false);
    setIsSlotSelected(false);
    setSelectedSlot('');
  };

  console.log('selectedSlotTime', selectedSlot);
  console.log('selectedSlotDate', selectedRescheduleDate);

  const handleRescheduleBooking = async () => {
    if (!isSlotSelected) {
      ToastAndroid.show('Please select a slot', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    try {
      const formData = {
        bookingId: leadDataContext._id,
        vendorId: vendorDataContext._id,
        slotDate: selectedRescheduleDate,
        slotTime: selectedSlot,
      };

      const result = await postRequest(
        API_ENDPOINTS.RESCHEDULE_BOOKING,
        formData,
      );

      ToastAndroid.showWithGravity(
        result.message || 'Booking Rescheduled',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );

      setStatusModalVisible(false);
      handleResetSlotndClose(); // ✅ call function
      navigation.goBack();
    } catch (error) {
      console.log('Error while rescheduling:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to reschedule',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  // console.log('availableSlots', availableSlots);
  console.log('requiredTime', requiredTime);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          style={{
            backgroundColor: backgroundColorStatus(),
            padding: 5,
            textAlign: 'center',
            color: 'white',
            fontFamily: 'Poppins-SemiBold',
          }}
        >
          {leadDataContext.bookingDetails?.status !== 'Confirmed'
            ? leadDataContext.bookingDetails?.status
            : ''}
        </Text>
        <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
          {/* <Text style={styles.categoryHeader}>
            {leadDataContext?.service[0]?.category}
          </Text> */}

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
                  {leadDataContext.selectedSlot?.slotTime}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.descriptionText}>
                <Ionicons name="location" color="red" size={17} />{' '}
                {enableUI && leadDataContext?.address.houseFlatNumber + ','}
                {leadDataContext?.address.streetArea}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, !enableUI && styles.disabledButton]}
              onPress={() => enableUI && setStatusModalVisible(true)}
              disabled={!enableUI}
            >
              <Text
                style={[
                  styles.updateButtonText,
                  !enableUI && styles.disabledText,
                ]}
              >
                Update Status
              </Text>
              <FontAwesome name="angle-right" color="white" size={20} />
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.directionBtn,
                  !enableUI && styles.disabledButton,
                ]}
                onPress={enableUI && handleNavigateToMap}
                disabled={!enableUI}
              >
                <Feather name="navigation-2" color="white" size={17} />
                <Text
                  style={[styles.contactText, !enableUI && styles.disabledText]}
                >
                  {' '}
                  Directions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, !enableUI && styles.disabledButton]}
                onPress={() => openDialPad(leadDataContext.customer?.phone)}
                disabled={!enableUI}
              >
                <Feather name="phone" color="white" size={17} />
                <Text
                  style={[styles.contactText, !enableUI && styles.disabledText]}
                >
                  {' '}
                  Contact
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {vendorDataContext?.vendor?.serviceType === 'deep cleaning' && (
            <View
              style={{
                marginBottom: enableUI ? 0 : 100,
                // marginBottom: 50,
              }}
            >
              <View style={styles.packageRow}>
                <Text style={styles.sectionHeader}>Package Details</Text>
                <TouchableOpacity onPress={() => setViewPackages(true)}>
                  <Text style={styles.viewDetails}>View Details</Text>
                </TouchableOpacity>
              </View>
              {leadDataContext?.service?.map((ele, idx) => (
                <View key={idx} style={styles.card}>
                  <Text style={styles.packageTitle}>{ele.serviceName}</Text>
                  <View style={styles.location}>
                    <Text style={styles.bulletText}>₹ {ele.price}</Text>
                    <Text
                      style={{
                        fontSize: 13,
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

              {/* <Text
                style={{ fontFamily: 'Poppins-SemiBold', paddingVertical: 10 }}
              >
                Payment Details
              </Text>
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Total Amount</Text>
                  <Text style={styles.amountBold}>
                    ₹ {leadDataContext?.bookingDetails?.paidAmount}
                  </Text>
                  <TouchableOpacity onPress={openEditModal}>
                    <Image
                      style={{ width: 20, height: 20 }}
                      source={require('../assets/icons/edit.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.dottedLine} />
                <View style={styles.rowBetween}>
                  <Text style={styles.amountLabel}>Amount paid</Text>
                  <Text style={styles.amountPaid}>
                    {' '}
                    ₹ {leadDataContext?.bookingDetails?.paidAmount}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.amountLabel}>Amount yet to paid</Text>
                  <Text style={styles.amountDue}>₹ 0</Text>
                </View>
              </View> */}
            </View>
          )}
          {enableUI && (
            <View
              style={{ flexDirection: 'row', marginTop: 10, marginBottom: 50 }}
            >
              <MapView
                style={{
                  width: '100%',
                  height: 200,
                  marginBottom: 15,
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
              {/* <Text style={styles.descriptionText}>
                {leadDataContext?.address.houseFlatNumber},{' '}
                {leadDataContext?.address.streetArea}
              </Text> */}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{
          alignItems: 'center',
          // marginTop: enableUI ? 0 : 50,
          paddingVertical: 12,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: enableUI ? '#119B11' : '#A0D7A0',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
        }}
        onPress={() => {
          enableUI && setModalVisible(true);
        }}
        disabled={!enableUI}
      >
        <Text style={styles.confirmButtonText}>
          {vendorDataContext?.vendor?.serviceType === 'house-painter'
            ? 'START SURVEY'
            : 'START JOB'}
        </Text>
      </TouchableOpacity>

      {/* prompt message */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.teamModalContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Image
                source={require('../assets/icons/featured.png')}
                style={{}}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AntDesign name="close" color="black" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>
              Start the{' '}
              {vendorDataContext?.vendor?.serviceType === 'house-painter'
                ? 'survey'
                : 'job'}
              !
            </Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to start the{' '}
              {vendorDataContext?.vendor?.serviceType === 'house-painter'
                ? 'survey'
                : 'job'}
              ?
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={
                vendorDataContext.vendor?.serviceType === 'deep cleaning'
                  ? handleStartJob // start,team,otp/deep cleaning
                  : handleOpenOtp // start,otp/house painting
              }
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

      {/* Team members */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={teamModalVisible}
        onRequestClose={() => setTeamModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.teamModalContainer}>
            <View style={styles.teamModalHeader}>
              <Text style={styles.teamTitle}>Team members</Text>
              <TouchableOpacity onPress={() => setTeamModalVisible(false)}>
                {/* <Image
                    source={require('../assets/icons/close.png')}
                    style={styles.closeIcon}
                  /> */}
                <AntDesign name="close" color="black" size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.memberList}>
              {availableTeam.length > 0 ? (
                availableTeam.map(member => {
                  const isSelected = selectedMembers.includes(member._id);
                  return (
                    <TouchableOpacity
                      style={styles.memberItem}
                      key={member._id}
                      onPress={() => toggleMember(member._id)}
                    >
                      <FontAwesome5
                        name="user-alt"
                        color="#ff6868ff"
                        size={20}
                      />
                      <Text style={styles.memberName}>{member.name}</Text>
                      {isSelected ? (
                        <Feather name="minus-circle" color="red" size={22} />
                      ) : (
                        <Feather name="plus-circle" color="green" size={22} />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: 'Poppins-SemiBold',
                    marginTop: 20,
                    color: 'red',
                  }}
                >
                  No team members available
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.continueBtn,
                { backgroundColor: canContinue ? '#ED1F24' : '#b4b4b4ff' },
              ]}
              disabled={!canContinue}
              onPress={() => {
                setTeamModalVisible(false);
                setOtpModalVisible(true);
              }}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* otp */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.otpModal}>
            <TouchableOpacity
              onPress={() => setOtpModalVisible(false)}
              style={styles.closeButton}
            >
              <AntDesign name="close" color="black" size={20} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>OTP</Text>
            <Text style={styles.modalSubtitle}>
              Enter OTP sent to customer's phone
            </Text>
            {/* developement */}
            <Text
              style={{
                fontSize: 13,
                color: 'red',
                fontFamily: 'Poppins-Medium',
              }}
            >
              {leadDataContext.bookingDetails?.otp} (development)
            </Text>
            <View style={styles.otpInputRow}>
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={el => (inputs.current[index] = el)} // <-- correct ref usage
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={value}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (
                      nativeEvent.key === 'Backspace' &&
                      !value &&
                      index > 0
                    ) {
                      inputs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>
            {/* <TouchableOpacity>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmJob}
            // onPress={() => {
            //   const enteredOtp = otp.join('');
            //   if (enteredOtp.length === 4) {
            //     setOtpModalVisible(false);
            //     navigation.navigate('JobOngoing', { lead });
            //   }
            // }}
            >
              <Text style={styles.confirmButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* update status */}
      <Modal
        transparent
        visible={statusModalVisible}
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.statusModalTitle}>Update Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* {vendorDataContext?.vendor?.serviceType === 'deep cleaning' ? (
              <> */}
            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => {
                setReachablePrompt(true);
                setStatusModalVisible(false);
              }}
            >
              <Text style={styles.statusOptionText}>Customer Unreachable</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => {
                setShowRescheduleModal(true);
                //  handleUpdateStatus('Customer Reschedule')
              }}
            >
              <Text style={styles.statusOptionText}>Customer Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => {
                setCancelModal(true);
                setStatusModalVisible(false);
              }}
            >
              <Text style={styles.statusOptionText}>Customer Cancel</Text>
            </TouchableOpacity>
            {/* </>
              
            ) : (
              // house painting
              <>
                <TouchableOpacity
                  style={styles.statusOption}
                  // onPress={() => {
                  //   setReachablePrompt(true);
                  //   setStatusModalVisible(false);
                  // }}
                >
                  <Text style={styles.statusOptionText}>Negotiations</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusOption}
                  // onPress={() => handleUpdateStatus('Customer Reschedule')}
                >
                  <Text style={styles.statusOptionText}>Hired</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusOption}
                  // onPress={() => {
                  //   setCancelModal(true);
                  //   setStatusModalVisible(false);
                  // }}
                >
                  <Text style={styles.statusOptionText}>Customer Cancel</Text>
                </TouchableOpacity>
              </>
            )} */}
          </View>
        </View>
      </Modal>

      {/* prompt for Not Reachable */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={ReachablePrompt}
        onRequestClose={() => setReachablePrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.StatusModalContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={() => setReachablePrompt(false)}>
                <AntDesign name="close" color="black" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Customer Unreachable!</Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Medium',
                color: '#000',
                marginBottom: 8,
              }}
            >
              Are you sure want to update the status.
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => handleUpdateStatus('Customer Unreachable')}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setReachablePrompt(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/* <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={[
                    styles.cancelReasonJobBtn,
                    { backgroundColor: '#F4F4F4' },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setReachablePrompt(false);
                    }}
                  >
                    <Text style={[styles.cancleReasonTxt, { color: 'black' }]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.cancelReasonJobBtn,
                    { backgroundColor: '#ED1F24' },
                  ]}
                >
                  <TouchableOpacity
                    
                  >
                    <Text style={[styles.cancleReasonTxt, { color: 'white' }]}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View> */}
          </View>
        </View>
      </Modal>

      {/* prompt for cancellening */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModal}
        onRequestClose={() => setCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.StatusModalContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={() => setCancelModal(false)}>
                <AntDesign name="close" color="black" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Cancel Job!</Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Medium',
                color: '#000',
                marginBottom: 8,
              }}
            >
              Are sure want to cancel the job.
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => handleUpdateStatus('Customer Cancelled')}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCancelModal(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Reschedule */}
      <Modal
        transparent
        visible={showRescheduleModal}
        animationType="slide"
        onRequestClose={handleResetSlotndClose}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            // justifyContent: 'center',
            // alignItems: 'center',
          }}
        >
          <View style={styles.rescheduleModal}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 20,
                marginRight: 10,
              }}
              onPress={handleResetSlotndClose}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.rescheduleTitle}>Reschedule Date and Time</Text>

            <Calendar
              onDayPress={day => setSelectedRescheduleDate(day.dateString)}
              markedDates={{
                [selectedRescheduleDate]: {
                  selected: true,
                  selectedColor: '#E74C3C',
                },
              }}
              minDate={moment().format('YYYY-MM-DD')}
              theme={{
                selectedDayTextColor: '#fff',
              }}
            />
            <Text style={styles.subHeader}>Available Slots</Text>
            <Text style={styles.durationHeader}>
              Duration: {requiredTime} min's - (dev mode)
            </Text>

            {isSlotLoaded && <PageLoader />}

            {availableSlots?.length > 0 ? (
              <ScrollView>
                <View style={styles.slotWrapper}>
                  {availableSlots.map((slot, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.slotBox,
                        selectedSlot === slot && {
                          backgroundColor: '#E74C3C',
                        },
                      ]}
                      onPress={() => handleSlotSelection(slot)}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          selectedSlot === slot && { color: '#fff' },
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text
                style={{
                  color: '#6d6d6dff',
                  fontSize: 15,
                  marginTop: 10,
                  textAlign: 'center',
                  fontFamily: 'Poppins-Medium',
                }}
              >
                No slots available
              </Text>
            )}

            <Text style={styles.crmNote}>
              Vendors while choosing the time slots - the available slots will
              come from the CRM. Based on that, select the time slot.
            </Text>
            <TouchableOpacity
              style={[
                styles.rescheduleBtn,
                { backgroundColor: isSlotSelected ? '#ED1F24' : 'gray' },
              ]}
              disabled={!isSlotSelected}
              onPress={handleRescheduleBooking} // ✅ invoke properly
            >
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* edit price not using in this screen*/}
      <Modal transparent visible={secondModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSecondModalVisible(false)}
            >
              <Image
                source={require('../assets/icons/close.png')}
                style={styles.closeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Edit Scope</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                // marginVertical: 10,
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.tab,
                  !isReduce ? styles.tabActive : styles.tabInactive,
                ]}
                onPress={() => setIsReduce(false)}
              >
                <Text
                  style={
                    isReduce ? styles.tabTextInactive : styles.tabTextActive
                  }
                >
                  Add
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  isReduce ? styles.tabActive : styles.tabInactive,
                ]}
                onPress={() => setIsReduce(true)}
              >
                <Text
                  style={
                    isReduce ? styles.tabTextActive : styles.tabTextInactive
                  }
                >
                  Reduce
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                color: '#373737',
                fontFamily: 'Poppins-SemiBold',
                marginTop: 10,
              }}
            >
              {isReduce
                ? 'Enter Amount you want to reduce'
                : 'Enter Amount you want to add'}
            </Text>
            <TextInput
              style={styles.inputBox}
              placeholder=""
              value={amount}
              onChangeText={text => setAmount(text)}
              keyboardType="numeric"
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                Total Amount
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                ₹ {calculatedPrice || leadDataContext.bookingDetails.paidAmount}
              </Text>
            </View>
            <View style={styles.dottedLine} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                Amount Paid
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                ₹ {calculatedPrice || leadDataContext.bookingDetails.paidAmount}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                Amount yet to Pay
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                ₹ 0
              </Text>
            </View>
            <View style={styles.dottedLine} />
            <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#3F3F3F' }}>
              Add Comment
            </Text>
            <TextInput
              style={styles.inputBox}
              placeholder=""
              value={comment}
              onChangeText={text => setComment(text)}
              multiline
            />
            <TouchableOpacity
              style={styles.updatePricBtn}
              onPress={updatePrice}
            // onPress={() => setSecondModalVisible(false)}
            >
              <Text style={styles.rescheduleText}>
                {isReduce ? 'Share to Admin' : 'Share to Customer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* package list */}
      <Modal transparent visible={viewPackages} animationType="slide">
        <View style={styles.modalContainer}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              width: '100%',
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 18,
                }}
              >
                Package Details
              </Text>
              <TouchableOpacity onPress={() => setViewPackages(false)}>
                <AntDesign name="close" color="black" size={20} />
              </TouchableOpacity>
            </View>
            {packageList?.length > 0 ? (
              <View style={{ marginTop: 10 }}>
                <ScrollView>
                  {packageList.map(item => (
                    <View key={item._id}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: 16,
                          marginVertical: 10,
                        }}
                      >
                        {item.serviceType}
                      </Text>
                      {item.packageImage.map((img, idx) => (
                        <DynamicImage key={idx} uri={img} />
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  textAlign: 'center',
                  color: 'red',
                  marginTop: 20,
                }}
              >
                No Packages Available
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#4D4D4D',
  },
  headerBlock: {
    backgroundColor: '#fff',
    padding: 10,
    // marginTop: 10,
    borderRadius: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rescheduleText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: 'white',
    textAlign: 'center',
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
  updateButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    // marginRight: 10,
  },
  disabledText: {
    color: '#6B6B6B',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  directionBtn: {
    backgroundColor: '#616161',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactBtn: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactText: { color: '#fff', fontFamily: 'Poppins-SemiBold' },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  viewDetails: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    // top: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 5,
  },
  packageTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    // marginBottom: 6,
  },
  bulletText: {
    fontSize: 14,
    color: '#da8b16ff',
    fontFamily: 'Poppins-SemiBold',
  },
  location: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: { fontFamily: 'Poppins-SemiBold', color: '#615858', marginTop: 5 },
  amountLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#4D4D4D',
    fontSize: 14,
  },
  amountBold: { fontFamily: 'Poppins-Bold', marginLeft: 80, marginTop: 5 },
  amountPaid: { color: '#000000', fontFamily: 'Poppins-SemiBold' },
  amountDue: { color: '#000000', fontFamily: 'Poppins-SemiBold' },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 20,
  },
  map: { width: '100%', height: 122, marginBottom: 30 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '95%',
    borderRadius: 10,
  },
  closeButton: { position: 'absolute', top: 15, right: 15 },
  closeIcon: { color: 'black' },
  modalTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 8,
    backgroundColor: 'white',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 10,
    marginTop: 20,
    // position:"absolute",
    // bottom:0
  },
  startBtn: {
    // backgroundColor: '#ED1F24',
    // borderRadius: 6,
    // width: '100%',
    // paddingVertical: 12,
    // marginBottom: 50,

    // backgroundColor: '#ED1F24',
    // paddingVertical: 12,
    borderRadius: 5,

    alignItems: 'center',
    // marginTop: 10,
    // marginBottom: 15,
    // marginHorizontal: 20,

    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelReasonJobBtn: {
    borderRadius: 6,
    flex: 0.45,
    paddingVertical: 10,
  },
  cancleReasonTxt: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F4F4F4',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  teamModalContainer: {
    width: '85%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  StatusModalContainer: {
    width: '85%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  teamModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    textAlign: 'center',
  },
  memberList: { width: '100%', marginBottom: 20 },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  memberImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  memberName: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginLeft: 10,
    marginTop: 5,
  },
  memberCheck: {
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
  },
  continueBtn: {
    // backgroundColor: '#ED1F24',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  otpModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: 45,
    height: 50,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
  resendText: {
    color: '#ED1F24',
    fontSize: 10,
    marginTop: -10,
    fontFamily: 'Poppins-Bold',
    marginLeft: 200,
  },
  categoryHeader: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
    // marginBottom: 50,
    textTransform: 'uppercase',
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
    paddingHorizontal: 10,
    height: '100%',
    // borderRadius: 12,
    width: '100%',
    alignSelf: 'center',
  },
  rescheduleTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 10,
  },
  durationHeader: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#E74C3C',
  },
  slotWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  slotBox: {
    width: '30%',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E74C3C',
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  slotText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#000',
  },
  crmNote: {
    color: '#E74C3C',
    fontSize: 11,
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
  },
  updatePricBtn: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  rescheduleBtn: {
    paddingVertical: 12,
    borderRadius: 6,
    marginVertical: 20,
  },
  rescheduleBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  statusModalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  statusModalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusOption: {
    paddingVertical: 12,
    backgroundColor: '#F6F6F6',
    borderRadius: 6,
    marginBottom: 10,
  },
  statusOptionText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});

export default LeadDescriptionScreen;
