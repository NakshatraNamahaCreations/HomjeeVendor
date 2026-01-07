import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Calendar, Calendar as RNCalendar } from 'react-native-calendars';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ToastAndroid,
  Linking,
  TextInput,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLeadContext } from '../Utilities/LeadContext';
import { useVendorContext } from '../Utilities/VendorContext';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';
import { getRequest, postRequest } from '../ApiService/apiHelper';
import PageLoader from '../components/PageLoader';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import useBackHandler from '../Utilities/useBackHandler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';
import { useEstimateContext } from '../Utilities/EstimateContext';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ResponseLoader from '../components/ResponseLoader';
import DynamicImage from '../Utilities/DynamicImage';

const JobOngoing = () => {
  useBackHandler();
  const route = useRoute();
  const { deviceTheme } = useThemeColor();
  const navigation = useNavigation();
  const { leadDataContext, setLeadDataContext } = useLeadContext();
  const leadId = leadDataContext._id;
  const { vendorDataContext } = useVendorContext();
  const vendorId = vendorDataContext?._id;
  const [estimateData, setEstimateData] = useEstimateContext();
  const measurementId = estimateData?._id;
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  // const { lead } = route?.params || DEFAULT_LEAD;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState(0);
  const [comment, setComment] = useState('');
  const [isReduce, setIsReduce] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false); // Calendar modal visibility
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [region, setRegion] = useState({
    latitude: 12.900724675418454,
    longitude: 77.52341310849678,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [viewPackages, setViewPackages] = useState(false);
  const [packageList, setPackageList] = useState([]);

  const [markerPosition, setMarkerPosition] = useState(null);
  console.log('leadDataContext Id', leadDataContext._id);
  console.log('leadDataContext', leadDataContext);
  // console.log('vendorDataContext', vendorDataContext);
  // console.log('quotes', quotes);

  const today = moment().format('YYYY-MM-DD');
  const dayAfterTomorrow = moment().add(2, 'days').format('YYYY-MM-DD');

  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [availability, setAvailability] = useState({});
  const [isStored, setIsStored] = useState(false);

  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [availableTeam, setAvailableTeam] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [startProject, setStartProject] = useState(false);
  const [endProject, setEndProject] = useState(false);
  const [requestNext, setRequestNext] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const inputs = useRef([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [joinedOtp, setJoinedOTP] = useState(null);
  const [showOTP, setShowOTP] = useState(null);

  const [starJob, setStarJob] = useState(false); //reschedule
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [ReachablePrompt, setReachablePrompt] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const availableSlots = ['10:30am', '12:30pm', '01:30pm', '2:30pm', '5:30pm'];

  const allowedStatusesForUpdate = ['Hired', 'Completed'];

  console.log('Booking status>>>', leadDataContext.bookingDetails.status);

  const uniqueSubCategories = [
    ...new Set(leadDataContext.service?.map(unq => unq.subCategory)),
  ];
  const queryString = uniqueSubCategories
    .map(sub => `subCategory=${encodeURIComponent(sub)}`)
    .join('&');

  const hiring = leadDataContext?.assignedProfessional?.hiring || {};
  const projectDates = Array.isArray(hiring.projectDate)
    ? [...hiring.projectDate]
    : [];
  projectDates.sort(); // ISO YYYY-MM-DD sorts lexicographically ok

  const bookingId = leadDataContext._id;

  const startDate = projectDates[0]
    ? moment(projectDates[0]).format('DD MMM YYYY')
    : null;
  const team = Array.isArray(hiring.teamMember) ? hiring.teamMember : [];

  let startProjectApprovedDate = null;
  let startProjectApprovedTime = null;
  let jobEndedDateAt = null;
  let jobEndedTimeAt = null;

  const ts = leadDataContext?.bookingDetails?.startProjectApprovedAt;
  const endTs = leadDataContext?.bookingDetails?.jobEndRequestedAt;
  if (ts) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      // ✅ valid date
      startProjectApprovedDate = d.toISOString().split('T')[0];
      startProjectApprovedTime = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  if (endTs) {
    const d = new Date(endTs);
    if (!isNaN(d.getTime())) {
      // ✅ valid date
      jobEndedDateAt = d.toISOString().split('T')[0];
      jobEndedTimeAt = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  // console.log('Ended Date:', jobEndedDateAt);
  // console.log('Ended Time:', jobEndedTimeAt);

  useEffect(() => {
    preloadAvailability();
  }, [openCalendar]);

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

  useEffect(() => {
    fetchBookingData();
  }, [leadId]);

  const fetchBookingData = async () => {
    setLoading(true);
    getRequest(`${API_ENDPOINTS.GET_BOOKINGS_BY_bOOKING_ID}${leadId}`)
      .then(response => {
        setLeadDataContext(response.booking);
        setLoading(false);
      })
      .catch(err => {
        if (err) return;
        setLoading(false);
        console.error('Error fetching bookings:', err);
      });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookingData();
    setRefreshing(false);
  }, [fetchBookingData]);

  const preloadAvailability = async () => {
    setIsLoading(true);
    try {
      const start = moment().format('YYYY-MM-DD');
      const end = moment().add(30, 'days').format('YYYY-MM-DD');

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.CHECK_AVAILABILITY_RANGE}${vendorId}/availability-range`,
        {
          params: {
            startDate: start,
            endDate: end,
            daysRequired,
          },
        },
      );

      const data = res.data;
      console.log('Availability Res:', data);

      if (!data.success) return;
      setAvailability(data.availability);

      const blocked = {};
      Object.entries(data.availability).forEach(([date, info]) => {
        if (!info.canStart) {
          blocked[date] = { disabled: true, disableTouchEvent: true };
        }
      });
      setMarkedDates(blocked);
      setIsLoading(false);
    } catch (err) {
      console.error('Error preloading availability:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // console.log('availableTeam', availableTeam);
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

  const backgroundColorStatus = () => {
    if (
      leadDataContext.bookingDetails?.status === 'Survey Ongoing' ||
      leadDataContext.bookingDetails?.status === 'Project Ongoing' ||
      leadDataContext.bookingDetails?.status === 'Job Ongoing'
    ) {
      return '#FF7F00';
    } else if (leadDataContext.bookingDetails?.status === 'Survey Completed') {
      return 'green';
    } else if (
      leadDataContext.bookingDetails?.status === 'Customer Cancelled' ||
      leadDataContext.bookingDetails?.status === 'Waiting for final payment'
    ) {
      return '#ff0000';
    } else if (
      leadDataContext.bookingDetails?.status === 'Customer Unreachable'
    ) {
      return '#ff0000';
    } else if (leadDataContext.bookingDetails?.status === 'Pending Hiring') {
      return '#fabb05ff';
    } else if (
      leadDataContext.bookingDetails?.status === 'Hired' ||
      leadDataContext.bookingDetails?.status === 'Project Completed'
    ) {
      return '#008e00ff';
    }
  };

  const getApprovalState = bd => {
    // tri-state first; fallback: true→approved, false→pending only if edited
    const raw =
      bd.priceApprovalState ??
      (bd.priceApprovalStatus === true
        ? 'approved'
        : bd.hasPriceUpdated
        ? 'pending'
        : 'approved');
    return String(raw).toLowerCase();
  };

  const getStatusText = () => {
    try {
      const bd = leadDataContext?.bookingDetails;
      if (!bd) return 'Status: —';

      const state = getApprovalState(bd);
      const toTitle = s =>
        s
          ? `${s}`.charAt(0).toUpperCase() + `${s}`.slice(1).toLowerCase()
          : 'Unknown';

      if (state === 'approved') {
        const who = toTitle(bd.approvedBy) || 'Unknown';
        return `Status: Approved by ${who}`;
      }
      if (state === 'rejected') {
        const who = toTitle(bd.rejectedBy) || 'Unknown';
        return `Status: Disapproved by ${who}`;
      }
      // pending
      const approver = bd.scopeType === 'Reduced' ? "admin's" : "customer's";
      return `Status: Waiting for ${approver} approval`;
    } catch {
      return 'Status: —';
    }
  };

  const bd = leadDataContext?.bookingDetails ?? {};
  const state = getApprovalState(bd);
  const showStatusBanner = ['pending', 'approved', 'rejected'].includes(state);
  const amountLabel =
    bd.scopeType || (bd.editedPrice < 0 ? 'Reduced' : 'Added');
  const amountValue = Math.abs(Number(bd.editedPrice ?? 0));

  const status = (bd.status || '').trim().toLowerCase();
  const paymentStatus = (bd.paymentStatus || '').trim().toLowerCase();
  const paymentLinkActive = !!bd.paymentLink?.isActive;

  const isOngoing = status === 'project ongoing';
  const showRequestNextPayment =
    isOngoing && paymentStatus === 'partial payment' && !paymentLinkActive;
  const showEndJobDisabled =
    isOngoing && paymentStatus === 'partial payment' && paymentLinkActive;
  const showEndJobEnabled =
    isOngoing && paymentStatus === 'partially completed';

  const approvalState = String(
    bd.priceApprovalState ??
      (bd.priceApprovalStatus
        ? 'approved'
        : bd.hasPriceUpdated
        ? 'pending'
        : 'approved'),
  ).toLowerCase();

  const paid = Number(bd.paidAmount ?? 0);
  const originalQuote = Number(bd.bookingAmount ?? 0); // ← define FIRST

  // trust finalTotal only if sensible
  const finalValid =
    Number.isFinite(bd.finalTotal) &&
    bd.finalTotal > 0 &&
    bd.finalTotal >= paid;

  const effectiveTotal = Number(
    (finalValid ? bd.finalTotal : undefined) ??
      bd.currentTotalAmount ?? // approved mirror
      bd.bookingAmount ??
      0,
  );

  // last price change from history (for rejected banner/details)
  const lastChange =
    Array.isArray(bd.priceChanges) && bd.priceChanges.length > 0
      ? bd.priceChanges[bd.priceChanges.length - 1]
      : null;

  // derive “pending/rejected” display deltas
  const pendingDelta = Number(bd.editedPrice ?? 0); // signed
  const pendingNewTotal = Number(bd.newTotal ?? effectiveTotal + pendingDelta);
  // Number.isFinite(bd.newTotal) && bd.newTotal > 0
  //   ? Number(bd.newTotal)
  //   : Number(effectiveTotal + pendingDelta);

  // when rejected, use lastChange snapshot if present
  const rejectedDelta =
    approvalState === 'rejected'
      ? Number(pendingDelta || lastChange?.delta || 0)
      : 0;

  const rejectedNewTotal =
    approvalState === 'rejected'
      ? Number(
          (Number.isFinite(bd.newTotal) ? bd.newTotal : null) ??
            lastChange?.proposedTotal ??
            effectiveTotal + rejectedDelta,
        )
      : 0;

  const isPending = bd?.hasPriceUpdated && getApprovalState(bd) === 'pending';
  const isApproved = approvalState === 'approved';
  const isRejected = approvalState === 'rejected';
  const shouldShowPriceBanner = isPending || lastChange;
  // banner text
  const bannerHasAmount =
    isPending || isRejected || (isApproved && hasApprovedDelta);

  const bannerDeltaAbs = Math.abs(
    isPending ? pendingDelta : isRejected ? rejectedDelta : approvedDelta,
  );

  // approved delta (bookingAmount → effectiveTotal)
  const approvedDelta = effectiveTotal - originalQuote;

  // has approved change anywhere in history
  const hasApprovedDelta = approvedDelta !== 0;

  // pending proposal?
  const isPendingProposal = !!bd.hasPriceUpdated && approvalState === 'pending';

  // pending proposal values for the orange banner (NOT for totals)
  const proposedDelta = Number(bd.editedPrice ?? 0); // signed (+/-)
  const proposedNewTotal = Number(bd.newTotal ?? 0);

  // UI locks
  const allowedStatuses = new Set([
    'project ongoing',
    'survey completed',
    'waiting for final payment',
  ]);

  const isAllowedStatus = allowedStatuses.has(status);
  const isProjectCompleted = status === 'project completed';
  const disableAllTheHell = paymentStatus === 'paid' && isProjectCompleted;
  const priceEditLocked = isPendingProposal;
  const canEditPrice = !disableAllTheHell && !priceEditLocked;

  const currency = n => `₹ ${Number(n ?? 0).toLocaleString('en-IN')}`;

  const isPriceEditable =
    !['Waiting for final payment', 'Project Completed'].includes(
      leadDataContext.bookingDetails?.status,
    ) && !disableAllTheHell;

  const isEdited = !!bd.hasPriceUpdated;
  const priceGateDisabled = isEdited && approvalState === 'pending';

  const endJobEnabledFinal =
    isOngoing && showEndJobEnabled && !priceGateDisabled;
  const endJobDisabledFinal = isOngoing && !endJobEnabledFinal;
  const canRequestNextEnabled = isOngoing && !priceGateDisabled;

  const approvedHistory = Array.isArray(bd.priceChanges)
    ? bd.priceChanges.filter(c => String(c.state).toLowerCase() === 'approved')
    : [];
  const lastApproved = approvedHistory.length
    ? approvedHistory[approvedHistory.length - 1]
    : null;

  // Old total for the APPROVED block
  const oldTotalForApproved = Number.isFinite(lastApproved?.baseAtProposal)
    ? Number(lastApproved.baseAtProposal)
    : originalQuote; // fallback to original quote

  // Change/New taken from history when present (safer for multi-approvals)
  const approvedChangeDelta = Number.isFinite(lastApproved?.delta)
    ? Number(lastApproved.delta)
    : approvedDelta;

  const approvedNewTotal = Number.isFinite(lastApproved?.proposedTotal)
    ? Number(lastApproved.proposedTotal)
    : effectiveTotal;

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

  const hasFinalized = quotes?.some(ele => ele.finalized);

  const quotesWithIds = quotes.map(q => ({
    ...q,
    _id: q.id,
  }));
  const finalizedQuote = quotesWithIds.find(ele => ele.finalized);
  const finalizedQuoteId = finalizedQuote?._id || null;

  const hasQuoteLocked = quotes.some(q => q.locked);

  // console.log('hasQuoteLocked', hasQuoteLocked);

  const getNumberOfDays = () => {
    if (hasFinalized) {
      const finalizedQuote = quotes?.find(ele => ele.finalized);
      return finalizedQuote?.days || 0;
    }
    return 0;
  };
  const daysRequired = getNumberOfDays();

  const highlightRange = (startDate, daysRequired) => {
    const range = {};
    for (let i = 0; i < daysRequired; i++) {
      const d = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
      range[d] = {
        selected: true,
        selectedColor: '#E74C3C',
        selectedTextColor: '#fff',
      };
    }
    return range;
  };
  // console.log(
  //   'leadDataContext.bookingDetails?.startProject',
  //   leadDataContext.bookingDetails?.startProject,
  // );

  // const onDayPress = dateString => {
  //   if (markedDates[dateString]?.disabled) {
  //     console.log('Date is blocked:', dateString);
  //     return;
  //   }

  //   setSelectedRescheduleDate(dateString);

  //   // build new range
  //   const newRange = highlightRange(dateString, daysRequired);

  //   // reset markedDates → keep only blocked + new range
  //   setMarkedDates(prev => {
  //     const blockedOnly = Object.fromEntries(
  //       Object.entries(prev).filter(([_, v]) => v.disabled), // keep only disabled dates
  //     );

  //     return {
  //       ...blockedOnly,
  //       ...newRange,
  //     };
  //   });
  // };

  const canContinue =
    Array.isArray(selectedMembers) && selectedMembers.length >= 2;

  const onDayPress = dateString => {
    // if clicked date itself is blocked → stop
    if (markedDates[dateString]?.disabled) {
      console.log('Date is blocked:', dateString);
      return;
    }

    // check if any day in the required span is blocked
    const spanBlocked = Array.from({ length: daysRequired }).some((_, i) => {
      const d = moment(dateString).add(i, 'days').format('YYYY-MM-DD');
      return markedDates[d]?.disabled;
    });

    if (spanBlocked) {
      console.log(
        'This start date cannot be selected because span has blocked days.',
      );
      return; // don’t allow selection
    }

    setSelectedRescheduleDate(dateString);

    // build new range
    const newRange = highlightRange(dateString, daysRequired);

    // reset markedDates → keep only blocked + new range
    setMarkedDates(prev => {
      const blockedOnly = Object.fromEntries(
        Object.entries(prev).filter(([_, v]) => v.disabled),
      );
      setIsStored(true);
      return {
        ...blockedOnly,
        ...newRange,
      };
    });
  };

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

  // console.log('disableAllTheHell', disableAllTheHell);

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

  const handleMarkPendingHiring = async () => {
    if (!selectedRescheduleDate) {
      ToastAndroid.show('Please select a start date', ToastAndroid.SHORT);
      return;
    }

    if (!selectedMembers || selectedMembers.length < 2) {
      ToastAndroid.show(
        'Please select at least 2 team members',
        ToastAndroid.SHORT,
      );
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.MARK_PENDING_HIRING}`,
        {
          bookingId: leadId,
          // vendorId,
          startDate: selectedRescheduleDate,
          noOfDays: daysRequired,
          quotationId: finalizedQuoteId,
          teamMembers: selectedMembers.map(id => {
            const member = availableTeam.find(m => m._id === id);
            return { _id: member._id, name: member.name };
          }),
        },
      );

      if (res.data.success) {
        // ToastAndroid.show(
        //   'Booking moved to Pending Hiring. Payment link sent to customer.',
        //   ToastAndroid.LONG,
        // );
        ToastAndroid.show(
          'Status updated to Pending Hiring',
          ToastAndroid.LONG,
        );
        console.log('Payment Link:', res.data.paymentLink);
        // navigation.navigate('BottomTab', {
        //   screen: 'Ongoing',
        // });
        setOpenCalendar(false);
        setTeamModalVisible(false);
        setSelectedMembers([]);
        fetchBookingData();
        // Optionally store link in state
        // setPaymentLink(res.data.paymentLink);
      } else {
        ToastAndroid.show(res.data.message, ToastAndroid.LONG);
      }
    } catch (err) {
      console.error('Error marking pending hiring:', err);
      ToastAndroid.show('Failed to mark hiring', ToastAndroid.LONG);
    }
  };

  const handleRequestOtp = async () => {
    setLoading(true);

    try {
      const result = await postRequest(
        `${API_ENDPOINTS.REQUESTING_SEND_OTP}${bookingId}`,
      );
      ToastAndroid.showWithGravity(
        result.message || 'OTP Sent',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      console.log('otp response:', result);
      setShowOTP(result.otp);
      setStartProject(false);
      setOtpModalVisible(true);
      console.log('✅ ' + result);
    } catch (err) {
      console.log('Failed: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async () => {
    setLoading(true);
    if (joinedOtp === null) {
      return ToastAndroid.showWithGravity(
        'OTP Is Required',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    }
    try {
      const formData = {
        otp: joinedOtp,
      };

      const result = await postRequest(
        `${API_ENDPOINTS.START_PROJECT_HOUSE_PAINTING}${bookingId}`,
        formData,
      );
      console.log('Job Started');
      setOtp(['', '', '', '']);
      fetchBookingData();
      setOtpModalVisible(false);
      setModalVisible(false);
      ToastAndroid.showWithGravity(
        result.message || 'Project Started',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      console.log('result', result);

      // navigation.navigate('BottomTab', {
      //   screen: 'Ongoing',
      // });
    } catch (error) {
      console.log('Error while starting job:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to start Job',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNextPayment = async () => {
    setLoading(true);
    try {
      const result = await postRequest(
        `${API_ENDPOINTS.REQUEST_NEXT_PAYMENT}${bookingId}`,
      );

      ToastAndroid.showWithGravity(
        result.message || 'Request Sent for Final Payment',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      // navigation.navigate('BottomTab', {
      //   screen: 'Ongoing',
      // });
      setRequestNext(false);
      fetchBookingData();
      console.log('result', result);
    } catch (error) {
      console.log('Error while requesting payment:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to send request',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  const nightStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#3e3a24ff' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#ffffffff' }] },
  ];

  const roomsObj = estimateData?.rooms || {};
  // console.log('quotes', quotes);

  const roomsArr = React.useMemo(() => {
    return Object.entries(roomsObj).map(([name, room]) => ({ name, ...room }));
  }, [estimateData]);

  const hasEstimate =
    !!estimateData && Object.keys(estimateData?.rooms || {}).length > 0;
  const hasQuotes = Array.isArray(quotes) && quotes.length > 0;

  const INR = n => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
  const area2 = (w, h) => Math.max(toNum(w) * toNum(h), 0);
  const getNet = it =>
    toNum(it?.totalSqt ?? it?.area ?? area2(it?.width, it?.height));
  const toNum = v => (Number.isFinite(+v) ? +v : 0);
  const quoteTitle = (q, idx) => q?.title || 'Quote';
  const quoteAmount = q =>
    toNum(q?.amount ?? q?.totals?.final ?? q?.final ?? 0);
  const isFinal = q => q?.finalized === true || q?.status === 'FINAL';

  const sumBySection = section =>
    (roomsArr || []).reduce((sum, room) => {
      const roomSection = (room?.sectionType || '').trim() || 'Others';
      if (roomSection !== section) return sum;

      // always compute nets
      const c = (room?.ceilings || []).reduce((s, x) => s + getNet(x), 0);
      const w = (room?.walls || []).reduce((s, x) => s + getNet(x), 0);

      if (section === 'Others') {
        const m = (room?.measurements || []).reduce((s, x) => s + getNet(x), 0);
        return sum + c + w + m; // <-- include all three for Others
      }

      // Interior / Exterior: keep as before
      return sum + c + w;
    }, 0);

  // memoized totals
  const interiorSqft = React.useMemo(
    () => +sumBySection('Interior').toFixed(2),
    [roomsArr],
  );
  const exteriorSqft = React.useMemo(
    () => +sumBySection('Exterior').toFixed(2),
    [roomsArr],
  );
  const othersSqft = React.useMemo(
    () => +sumBySection('Others').toFixed(2),
    [roomsArr],
  );
  const totalSqft = React.useMemo(
    () => +(interiorSqft + exteriorSqft + othersSqft).toFixed(2),
    [interiorSqft, exteriorSqft, othersSqft],
  );

  // Measurement Summary from StartMeasurement page
  const [measurementSummary, setMeasurementSummary] = useState(
    route?.params?.measurementSummary || {},
  );

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

  useEffect(() => {
    fetchQuotes();
  }, [leadId, vendorId]);

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

  useEffect(() => {
    if (route.params?.measurementSummary) {
      setMeasurementSummary(route.params.measurementSummary);
    }
  }, [route.params?.measurementSummary]);

  const calculatedPrice = isReduce
    ? Number(leadDataContext.bookingDetails.amountYetToPay) - Number(amount)
    : Number(leadDataContext.bookingDetails.amountYetToPay) + Number(amount);

  const checkAmount = entered => {
    const enteredNum = parseInt(entered, 10) || 0;
    const paidNum =
      parseInt(leadDataContext.bookingDetails.paidAmount, 10) || 0;
    if (enteredNum > paidNum) {
      ToastAndroid.showWithGravity(
        'Entered amount should not exceed paid amount.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    }
  };

  // console.log('isReduce', isReduce);

  const updatePrice = async () => {
    setLoading(true);
    const bookingId = leadDataContext._id;
    const newPrice = isReduce
      ? Number(leadDataContext?.bookingDetails?.bookingAmount) - Number(amount)
      : Number(leadDataContext?.bookingDetails?.bookingAmount) + Number(amount);
    try {
      const formData = {
        // newTotal: newPrice,
        amount: amount,
        reasonForEditing: comment,
        scopeType: isReduce ? 'Reduced' : 'Added',
      };

      const result = await postRequest(
        `${API_ENDPOINTS.UPDATE_PRICING}${bookingId}`,
        formData,
      );

      ToastAndroid.showWithGravity(
        result.message || 'Price Updated',
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
        error?.message || 'Failed to update the price',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  // ending after all measurement
  const handleCompleteSurvey = async () => {
    setLoading(true);
    setModalVisible(false);
    try {
      const formData = {
        bookingId: leadDataContext._id,
        status:
          vendorDataContext?.vendor?.serviceType === 'house-painter'
            ? 'Survey Completed'
            : 'Project Completed',
        assignedProfessional: {
          professionalId: vendorDataContext._id,
          name: vendorDataContext.vendor?.vendorName,
          phone: vendorDataContext.vendor?.mobileNumber,
          acceptedDate: leadDataContext.assignedProfessional?.acceptedDate,
          acceptedTime: leadDataContext.assignedProfessional?.acceptedTime,
          startedDate: leadDataContext.assignedProfessional?.startedDate,
          startedTime: leadDataContext.assignedProfessional?.startedTime,
          endedDate: moment().format('ll'),
          endedTime: moment().format('LT'),
        },
      };

      const result = await postRequest(
        API_ENDPOINTS.COMPLETED_SURVEY,
        formData,
      );
      // console.log('Job Completed');
      ToastAndroid.showWithGravity(
        result.message || 'Survey Completed!',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      navigation.navigate('BottomTab', {
        screen: 'Ongoing',
      });
    } catch (error) {
      console.log('Error while Completing Survey:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to Completing a Survey',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };
  // final ending
  const handleEndProject = async () => {
    setLoading(true);
    setEndProject(false);
    try {
      const result = await postRequest(
        `${API_ENDPOINTS.COMPLETE_PROJECT}${bookingId}`,
      );

      ToastAndroid.showWithGravity(
        result.message || 'Job Completed Successfully',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      fetchBookingData();
      // navigation.navigate('BottomTab', {
      //   screen: 'Ongoing',
      // });
      console.log('result', result);
    } catch (error) {
      console.log('Error while ending:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to ending job',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      {isLoading && <ResponseLoader />}
      <View
        style={{
          backgroundColor: 'white',
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
            <Ionicons name="arrow-back" color="black" size={23} />
          </TouchableOpacity>
          <Text
            style={{
              paddingHorizontal: 33,
              color: '#232323',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
              marginTop: 5,
            }}
          >
            End Job
          </Text>
        </View>
      </View>
      <View style={{ backgroundColor: '#F6F6F6', flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text
            style={{
              backgroundColor: backgroundColorStatus(),
              padding: 5,
              textAlign: 'center',
              color: 'white',
              fontFamily: 'Poppins-SemiBold',
            }}
          >
            {leadDataContext.bookingDetails?.status}
            {/* Project Ongoing{' '} */}
            {/* {moment(leadDataContext.assignedProfessional?.startedDate).format(
              'll',
            )}{' '}
            : {leadDataContext.assignedProfessional?.startedTime} */}
          </Text>
          {shouldShowPriceBanner && (
            <View style={styles.headerBlock}>
              <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 12 }}>
                Amount {isPending ? bd.scopeType : lastChange.scopeType}: Rs.{' '}
                {Math.abs(isPending ? bd.editedPrice : lastChange.delta)}
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 12,
                  color: '#FF7F00',
                }}
              >
                {getStatusText()}
              </Text>
            </View>
          )}

          {/* <Text style={styles.sectionHeader}>Customer Details</Text> */}
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
            {/* {(leadDataContext?.bookingDetails.status === 'Completed' ||
              leadDataContext?.bookingDetails.status === 'Hired' ||
              leadDataContext?.bookingDetails.status !== 'Pending Hiring' ||
              leadDataContext?.bookingDetails.status !== 'Ongoing' ||
              leadDataContext?.bookingDetails.status === 'Negotiation' ||
              leadDataContext?.bookingDetails.status === 'Set Remainder') &&
              vendorDataContext?.vendor?.serviceType === 'house-painter' && (
                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    {
                      backgroundColor: disableAllTheHell
                        ? '#c2c2c2ff'
                        : '#ED1F24',
                    },
                  ]}
                  onPress={() => setStatusModalVisible(true)}
                  disabled={disableAllTheHell}
                >
                  <Text style={styles.updateButtonText}>Update Status</Text>
                  <FontAwesome name="angle-right" color="white" size={20} />
                </TouchableOpacity>
              )} */}
            {(leadDataContext?.bookingDetails?.status === 'Hired' ||
              leadDataContext?.bookingDetails?.status === 'Survey Completed') &&
              // !leadDataContext?.bookingDetails?.isJobStarted &&
              vendorDataContext?.vendor?.serviceType === 'house-painter' && (
                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    {
                      backgroundColor: disableAllTheHell
                        ? '#c2c2c2ff'
                        : '#ED1F24',
                    },
                  ]}
                  onPress={() => setStatusModalVisible(true)}
                  disabled={disableAllTheHell}
                >
                  <Text style={styles.updateButtonText}>Update Status</Text>
                  <FontAwesome name="angle-right" color="white" size={20} />
                </TouchableOpacity>
              )}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.directionBtn,
                  {
                    backgroundColor: disableAllTheHell
                      ? '#c2c2c2ff'
                      : '#616161',
                  },
                ]}
                disabled={disableAllTheHell}
                onPress={!disableAllTheHell && handleNavigateToMap}
              >
                <Feather name="navigation-2" color="white" size={17} />
                <Text style={styles.contactText}> Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.contactBtn,
                  {
                    backgroundColor: disableAllTheHell
                      ? '#c2c2c2ff'
                      : '#4285F4',
                  },
                ]}
                disabled={disableAllTheHell}
                onPress={() => openDialPad(leadDataContext.customer?.phone)}
              >
                <Feather name="phone" color="white" size={17} />
                <Text style={styles.contactText}> Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
          {leadDataContext?.service[0]?.category === 'Deep Cleaning' ? (
            <>
              <View style={styles.packageRow}>
                <Text style={styles.sectionHeader}>Package Details</Text>
                <TouchableOpacity onPress={() => setViewPackages(true)}>
                  <Text style={styles.viewDetails}>View Details</Text>
                </TouchableOpacity>
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
            </>
          ) : (
            <>
              {/* Measurement Summary */}
              <View
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  disabled={disableAllTheHell}
                  onPress={() => navigation.navigate('StartMeasurement')}
                >
                  <Text style={[styles.sectionHeader, { marginLeft: 0 }]}>
                    Measurement Summary
                  </Text>
                  {!disableAllTheHell && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('StartMeasurement')}
                    >
                      <Entypo
                        name="chevron-with-circle-right"
                        size={18}
                        color="#FF0000"
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {hasEstimate ? (
                  <>
                    <View style={styles.dottedLine2} />
                    <View style={styles.row}>
                      <Text style={styles.label2}>Interior</Text>
                      <Text style={styles.value}>{interiorSqft} sq ft</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label2}>Exterior</Text>
                      <Text style={styles.value}>{exteriorSqft} sq ft</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label2}>Others</Text>
                      <Text style={styles.value}>{othersSqft} sq ft</Text>
                    </View>
                    <View style={styles.dottedLine2} />
                    <View style={styles.row}>
                      <Text style={[styles.label2, styles.bold]}>
                        Total Measurement
                      </Text>
                      <Text style={[styles.value, styles.bold]}>
                        {totalSqft} sq ft
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={[styles.headerBlock, { marginTop: 10 }]}>
                    <TouchableOpacity
                      style={styles.measureBtn}
                      onPress={() => navigation.navigate('StartMeasurement')}
                    >
                      <Text style={styles.measureText}>Start Measurement</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Quotes Summary */}
              {hasEstimate && (
                <View
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 10,
                    paddingTop: 10,
                    marginTop: 10,
                    // marginBottom: 100,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    disabled={disableAllTheHell}
                    onPress={() => navigation.navigate('Quotes')}
                  >
                    <Text style={[styles.sectionHeader, { marginLeft: 0 }]}>
                      Quotes Summary
                    </Text>
                    {!disableAllTheHell && (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Quotes')}
                      >
                        <Entypo
                          name="chevron-with-circle-right"
                          size={18}
                          color="#FF0000"
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  <View style={styles.dottedLine2} />

                  {hasQuotes ? (
                    quotes.map((qot, idx) => (
                      <View
                        key={qot._id || qot.id || idx}
                        style={styles.row}
                        // onPress={() =>
                        //   navigation.navigate('SelectRoom', {
                        //     dupMode: false,
                        //     quoteId:
                        //       qot._id ||
                        //       String(qot._id) ||
                        //       qot.id ||
                        //       String(qot.id),
                        //     leadId,
                        //     measurementId,
                        //     vendorId,
                        //     quote: qot, // optional, lets SelectRoom skip GET
                        //   })
                        // }
                      >
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text style={styles.label2}>
                            {quoteTitle(qot, idx)}
                            {/* {idx + 1} */}
                          </Text>
                          {isFinal(qot) && (
                            <Text
                              style={{
                                color: '#ED1F24',
                                marginLeft: 6,
                                fontFamily: 'Poppins-SemiBold',
                              }}
                            >
                              Final Quote
                            </Text>
                          )}
                        </View>
                        <Text style={styles.value}>
                          {INR(quoteAmount(qot))}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={[styles.headerBlock, { marginTop: 10 }]}>
                      <TouchableOpacity
                        style={styles.measureBtn}
                        onPress={() => navigation.navigate('Quotes')}
                      >
                        <Text style={styles.measureText}>Create a Quote</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
          {
            // leadDataContext.bookingDetails?.status === 'Pending Hiring' ||
            leadDataContext.bookingDetails?.status === 'Hired' ||
            leadDataContext.bookingDetails?.status === 'Project Ongoing' ||
            leadDataContext.bookingDetails?.status ===
              'Waiting for final payment' ||
            // leadDataContext.bookingDetails?.status === 'Survey Completed' ||
            vendorDataContext?.vendor?.serviceType === 'deep cleaning' || // deep cleaing
            leadDataContext.bookingDetails?.status === 'Project Completed' ? (
              <View
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 10,
                  paddingTop: 10,
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    paddingVertical: 10,
                  }}
                >
                  Payment Details
                </Text>
                {/** 🟠 PENDING — show only when awaiting approval */}
                {isPending ? (
                  <View>
                    {/* ✅ CASE 1: FIRST TIME (no approved history) */}
                    {!hasApprovedDelta ? (
                      <>
                        {/* Total Amount with divider */}
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Total Amount</Text>
                          <Text style={styles.amountDue}>
                            {currency(originalQuote)}
                          </Text>
                        </View>

                        {/* Divider right below Total Amount */}
                        <View style={styles.dottedLine2} />

                        {/* Main section */}
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Amount Paid</Text>
                          <Text style={styles.amountPaid}>
                            {currency(paid)}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            Amount Yet to be Paid
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(bd.amountYetToPay)}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Change</Text>
                          <Text
                            style={[
                              styles.amountDue,
                              { color: pendingDelta < 0 ? 'red' : 'green' },
                            ]}
                          >
                            {pendingDelta < 0 ? '-' : '+'}{' '}
                            {currency(Math.abs(pendingDelta))}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            New Total Amount
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(pendingNewTotal)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        {/* ✅ CASE 2: SECOND TIME OR MORE (already has approved change) */}
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Old Total</Text>
                          <Text style={styles.amountDue}>
                            {currency(oldTotalForApproved)}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Change</Text>
                          <Text
                            style={[
                              styles.amountDue,
                              {
                                color:
                                  approvedChangeDelta < 0 ? 'red' : 'green',
                              },
                            ]}
                          >
                            {approvedChangeDelta < 0 ? '-' : '+'}{' '}
                            {currency(Math.abs(approvedChangeDelta))}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            New Total Amount
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(approvedNewTotal)}
                          </Text>
                        </View>

                        {/* Divider BELOW this block */}
                        <View style={styles.dottedLine2} />

                        {/* Then show the pending proposal part */}
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Amount Paid</Text>
                          <Text style={styles.amountPaid}>
                            {currency(paid)}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            Amount Yet to be Paid
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(bd.amountYetToPay)}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Change</Text>
                          <Text
                            style={[
                              styles.amountDue,
                              { color: pendingDelta < 0 ? 'red' : 'green' },
                            ]}
                          >
                            {pendingDelta < 0 ? '-' : '+'}{' '}
                            {currency(Math.abs(pendingDelta))}
                          </Text>
                        </View>

                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            New Total Amount
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(pendingNewTotal)}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                ) : /** 🔴 REJECTED (after approval) */
                isRejected && hasApprovedDelta ? (
                  <View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Old Total</Text>
                      <Text style={styles.amountDue}>
                        {currency(oldTotalForApproved)}
                      </Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Change</Text>
                      <Text style={[styles.amountDue, { color: 'green' }]}>
                        + {currency(Math.abs(approvedChangeDelta))}
                      </Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>New Total Amount</Text>
                      <Text style={styles.amountDue}>
                        {currency(approvedNewTotal)}{' '}
                        <TouchableOpacity
                          onPress={() => setSecondModalVisible(true)}
                          style={{ marginRight: 8 }}
                          // hitSlop={{ top: 8, right: 6, bottom: 6, left: 6 }}
                          accessibilityRole="button"
                          accessibilityLabel="Edit price"
                        >
                          <MaterialIcons name="edit" color="black" size={20} />
                        </TouchableOpacity>
                      </Text>
                    </View>

                    <View style={styles.dottedLine2} />

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Amount Paid</Text>
                      <Text style={styles.amountPaid}>{currency(paid)}</Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>
                        Amount Yet to be Paid
                      </Text>
                      <Text style={styles.amountDue}>
                        {currency(bd.amountYetToPay)}
                      </Text>
                    </View>
                  </View>
                ) : /** 🔴 FIRST REJECTED (no previous approvals) */
                isRejected && !hasApprovedDelta ? (
                  <View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Total Amount</Text>
                      <Text style={styles.amountBold}>
                        {currency(originalQuote)}{' '}
                        <TouchableOpacity
                          onPress={() => setSecondModalVisible(true)}
                          style={{ marginRight: 8 }}
                          // hitSlop={{ top: 8, right: 6, bottom: 6, left: 6 }}
                          accessibilityRole="button"
                          accessibilityLabel="Edit price"
                        >
                          <MaterialIcons name="edit" color="black" size={20} />
                        </TouchableOpacity>
                      </Text>
                    </View>

                    <View style={styles.dottedLine2} />

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Amount Paid</Text>
                      <Text style={styles.amountPaid}>{currency(paid)}</Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>
                        Amount Yet to be Paid
                      </Text>
                      <Text style={styles.amountDue}>
                        {currency(bd.amountYetToPay)}
                      </Text>
                    </View>
                  </View>
                ) : /** 🟢 APPROVED (combine all changes) */
                isApproved && hasApprovedDelta ? (
                  <View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Old Amount</Text>
                      <Text style={styles.amountDue}>
                        {currency(originalQuote)}
                      </Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Changes</Text>
                      <Text style={[styles.amountDue, { color: 'green' }]}>
                        + {currency(Math.abs(approvedChangeDelta))}
                      </Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>New Total Amount</Text>
                      <Text style={styles.amountDue}>
                        {currency(approvedNewTotal)}{' '}
                        {isPriceEditable && (
                          <TouchableOpacity
                            onPress={() => setSecondModalVisible(true)}
                            style={{ marginRight: 8 }}
                            // hitSlop={{ top: 8, right: 6, bottom: 6, left: 6 }}
                            accessibilityRole="button"
                            accessibilityLabel="Edit price"
                          >
                            <MaterialIcons
                              name="edit"
                              color="black"
                              size={20}
                            />
                          </TouchableOpacity>
                        )}
                      </Text>
                    </View>

                    <View style={styles.dottedLine2} />

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Amount Paid</Text>
                      <Text style={styles.amountPaid}>{currency(paid)}</Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>
                        Amount Yet to be Paid
                      </Text>
                      <Text style={styles.amountDue}>
                        {currency(bd.amountYetToPay)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  /** ⚪ DEFAULT (no edits) */
                  <View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Total Amount</Text>
                      <Text style={styles.amountBold}>
                        {currency(originalQuote)}{' '}
                        {leadDataContext.bookingDetails?.status ===
                          'Project Ongoing' || // house painting - job started
                          (leadDataContext.bookingDetails?.status ===
                            'Job Ongoing' && ( // deep cleaning  - job started
                            <TouchableOpacity
                              onPress={() => setSecondModalVisible(true)}
                              style={{ marginRight: 8 }}
                              // hitSlop={{ top: 8, right: 6, bottom: 6, left: 6 }}
                              accessibilityRole="button"
                              accessibilityLabel="Edit price"
                            >
                              <MaterialIcons
                                name="edit"
                                color="black"
                                size={20}
                              />
                            </TouchableOpacity>
                          ))}
                      </Text>
                    </View>

                    <View style={styles.dottedLine2} />

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>Amount Paid</Text>
                      <Text style={styles.amountPaid}>{currency(paid)}</Text>
                    </View>

                    <View style={styles.rowBetween}>
                      <Text style={styles.amountLabel}>
                        Amount Yet to be Paid
                      </Text>
                      <Text style={styles.amountDue}>
                        {currency(bd.amountYetToPay)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : null
          }
          <View
            style={{ marginTop: 10, marginHorizontal: 10, marginBottom: 50 }}
          >
            {/* {startDate && (
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                Project Start On: {startDate}
              </Text>
            )} */}

            {jobEndedDateAt && jobEndedTimeAt && (
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                Project Ended At: {moment(jobEndedDateAt).format('DD-MM-YYYY')}{' '}
                : {jobEndedTimeAt}
              </Text>
            )}

            {startProjectApprovedDate && startProjectApprovedTime && (
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                Project Started At:{' '}
                {moment(startProjectApprovedDate).format('DD-MM-YYYY')} :{' '}
                {startProjectApprovedTime}
              </Text>
            )}

            {leadDataContext.assignedProfessional?.endedDate && (
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                Survey End at:{' '}
                {moment(leadDataContext.assignedProfessional?.endedDate).format(
                  'DD-MM-YYYY',
                )}{' '}
                : {leadDataContext.assignedProfessional?.endedTime}
              </Text>
            )}

            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                marginBottom: 10,
              }}
            >
              {vendorDataContext?.vendor?.serviceType === 'house-painter'
                ? 'Survey Start'
                : 'Job Ongoing'}{' '}
              at:{' '}
              {moment(leadDataContext.assignedProfessional?.startedDate).format(
                'DD-MM-YYYY',
              )}{' '}
              : {leadDataContext.assignedProfessional?.startedTime}
            </Text>
            {team.length > 0 && (
              <>
                <Text style={[styles.sectionHeader, { marginLeft: 0 }]}>
                  Assigned Team Members
                </Text>
                <View style={{ marginBottom: 15 }}>
                  {team.map(m => (
                    <Text
                      key={m.memberId}
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: 14,
                        marginBottom: 5,
                      }}
                    >
                      <FontAwesome5 name="user" color="black" size={15} />{' '}
                      {m.memberName}
                    </Text>
                  ))}
                </View>
              </>
            )}
            {!disableAllTheHell && (
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
            )}
          </View>
        </ScrollView>
        {leadDataContext.bookingDetails?.status !== 'Survey Completed' &&
        !leadDataContext.bookingDetails?.startProject ? (
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: '#ED1F24' }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.endBtnText}>
              {vendorDataContext?.vendor?.serviceType === 'house-painter'
                ? 'END SURVEY'
                : 'END PROJECT'}
            </Text>
          </TouchableOpacity>
        ) : leadDataContext.bookingDetails?.status === 'Pending Hiring' ||
          (leadDataContext.bookingDetails?.status === 'Hired' &&
            leadDataContext.bookingDetails?.startProject) ? (
          <TouchableOpacity
            style={[
              styles.endBtn,
              {
                backgroundColor:
                  leadDataContext.bookingDetails?.status === 'Hired' &&
                  leadDataContext.bookingDetails?.startProject
                    ? '#119b11ff'
                    : 'rgba(200, 220, 200, 1)',
              },
            ]}
            disabled={
              leadDataContext.bookingDetails?.status === 'Hired' &&
              leadDataContext.bookingDetails?.startProject
                ? false
                : true
            }
            onPress={() => setStartProject(true)}
          >
            <Text style={styles.endBtnText}>START PROJECT</Text>
          </TouchableOpacity>
        ) : showRequestNextPayment ? (
          <TouchableOpacity
            style={[
              styles.endBtn,
              {
                backgroundColor: canRequestNextEnabled
                  ? '#ff7f00ff'
                  : '#ffb97a',
              },
            ]}
            disabled={!canRequestNextEnabled} // visible only for ongoing; disabled if not approved
            onPress={
              canRequestNextEnabled ? () => setRequestNext(true) : undefined
            }
          >
            <Text style={styles.endBtnText}>Request Next Payment</Text>
          </TouchableOpacity>
        ) : endJobEnabledFinal || endJobDisabledFinal ? (
          <TouchableOpacity
            style={[
              styles.endBtn,
              {
                backgroundColor: endJobEnabledFinal ? '#ed1f24ff' : '#ff9294ff',
              },
            ]}
            disabled={!endJobEnabledFinal}
            onPress={endJobEnabledFinal ? () => setEndProject(true) : undefined}
          >
            <Text style={styles.endBtnText}>End Project</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* edit price */}
      <Modal transparent visible={secondModalVisible} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}
            >
              <Text style={styles.modalTitle}>Edit Scope</Text>
              <TouchableOpacity onPress={() => setSecondModalVisible(false)}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* <Text style={{ fontFamily: 'Poppins-SemiBold' }}></Text> */}
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
              placeholder="Enter amount"
              value={amount?.toString() ?? ''}
              onChangeText={text => {
                const numeric = Number(text.replace(/[^0-9]/g, ''));
                setAmount(numeric);
              }}
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
                ₹ {leadDataContext?.bookingDetails?.bookingAmount}
                {/* calculatedPrice */}
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
                ₹ {leadDataContext.bookingDetails.paidAmount}
                {/* {calculatedPrice} */}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                {/* modal */}
                Amount yet to Pay
              </Text>
              <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>
                ₹ {calculatedPrice}
                {/* {leadDataContext?.bookingDetails?.paidAmount === 0
                  ? leadDataContext?.bookingDetails?.bookingAmount
                  : leadDataContext?.bookingDetails?.amountYetToPay} */}
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
              style={styles.rescheduleBtn}
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

      {/* End Job Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              style={styles.checkIcon}
              source={require('../assets/icons/featured.png')}
              resizeMode="contain"
            />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }}>
              End the{' '}
              {vendorDataContext?.vendor?.serviceType === 'house-painter'
                ? 'survey'
                : 'project'}
              !
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Are you sure you want to end the{' '}
              {vendorDataContext?.vendor?.serviceType === 'house-painter'
                ? 'survey'
                : 'project'}
              ?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleCompleteSurvey}
              // onPress={() => {
              //   setModalVisible(false);
              //   navigation.navigate('OngoingLeadsScreen');
              // }}
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
      {/* start project */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={startProject}
        onRequestClose={() => setStartProject(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              style={styles.checkIcon}
              source={require('../assets/icons/featured.png')}
              resizeMode="contain"
            />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }}>
              Start the project!
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Are you sure you want to start the project?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleRequestOtp}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setStartProject(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
            {leadDataContext?.bookingDetails?.status === 'Hired' &&
            !leadDataContext?.bookingDetails?.isJobStarted ? (
              // ✅ After Hired, Before Start → Show Cancellation/Rescheduling options
              <>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Unreachable
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Reschedule
                  </Text>
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
              </>
            ) : leadDataContext?.bookingDetails?.isJobStarted ? (
              // ✅ Project has started → Show same options (if needed)
              <>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Unreachable
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Reschedule
                  </Text>
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
              </>
            ) : (
              // ❌ Default / Pre-Hired → Show hiring-related options
              <>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>Set Remainder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusOption}
                  disabled={hasQuoteLocked ? true : false}
                  onPress={() => {
                    if (!hasFinalized) {
                      setShowAlertPopup(true);
                      setStatusModalVisible(false);
                    } else {
                      setOpenCalendar(true);
                      setStatusModalVisible(false);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: hasQuoteLocked ? 'gray' : 'black' },
                    ]}
                  >
                    Mark Hiring
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Unreachable
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>Customer Denied</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Negotiation going on
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {/* {leadDataContext?.bookingDetails.isJobStarted ? (
              <>
                <TouchableOpacity
                  style={styles.statusOption}
                  //  onPress={() => {
                  //    setReachablePrompt(true);
                  //    setStatusModalVisible(false);
                  //  }}
                >
                  <Text style={styles.statusOptionText}>
                    Customer Unreachable
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusOption}
                  // onPress={() => handleUpdateStatus('Customer Reschedule')}
                >
                  <Text style={styles.statusOptionText}>
                    Customer Reschedule
                  </Text>
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
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>Set Remainder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusOption}
                  disabled={hasQuoteLocked ? true : false}
                  onPress={() => {
                    if (!hasFinalized) {
                      setShowAlertPopup(true);
                      setStatusModalVisible(false);
                    } else {
                      setOpenCalendar(true);
                      setStatusModalVisible(false);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: hasQuoteLocked ? 'gray' : 'black' },
                    ]}
                  >
                    Mark Hiring
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Unreachable
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>Customer Denied</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption}>
                  <Text style={styles.statusOptionText}>
                    Customer Negotiation going on
                  </Text>
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
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rescheduleModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRescheduleModal(false)}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.rescheduleTitle}>Reschedule Date and Time</Text>
            <Text style={styles.subHeader}>Calendar</Text>
            <Calendar
              onDayPress={day => setSelectedRescheduleDate(day.dateString)}
              markedDates={{
                [selectedRescheduleDate]: {
                  selected: true,
                  selectedColor: '#E74C3C',
                },
              }}
              theme={{
                selectedDayTextColor: '#fff',
              }}
              style={{ borderRadius: 8 }}
            />
            <Text style={styles.subHeader}>Available Slots</Text>
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
                  onPress={() => setSelectedSlot(slot)}
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
            <Text style={styles.crmNote}>
              Vendors while choosing the time slots - the available slots will
              come from the CRM. Based on that, select the time slot.
            </Text>
            <TouchableOpacity
              style={styles.rescheduleBtn}
              onPress={() => {
                setShowRescheduleModal(false);
                setStarJob(true);
              }}
            >
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* calendar */}
      <Modal
        transparent
        visible={openCalendar}
        animationType="slide"
        onRequestClose={() => setOpenCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rescheduleModal}>
            <TouchableOpacity
              style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
              onPress={() => setOpenCalendar(false)}
            >
              <AntDesign name="close" color="black" size={20} />
            </TouchableOpacity>
            <Text style={styles.rescheduleTitle}>Hiring</Text>
            <Text style={styles.subHeader}>Pick a date</Text>
            <View
              style={{
                borderColor: '#c4c4c4ff',
                borderWidth: 1.5,
                borderRadius: 5,
              }}
            >
              <Calendar
                onDayPress={day => onDayPress(day.dateString)}
                markedDates={markedDates}
                minDate={moment().format('YYYY-MM-DD')} // hide past days
                theme={{
                  selectedDayTextColor: '#fff',
                  todayTextColor: '#2980B9',
                }}
                style={{ borderRadius: 8 }}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: isStored ? '#ED1F24' : '#b4b4b4ff',
                paddingVertical: 12,
                borderRadius: 6,
                marginTop: 20,
              }}
              disabled={!isStored ? true : false}
              onPress={() => {
                if (!isStored) return;
                if (!selectedRescheduleDate) return;

                // 1. Find available members from your API response (preloaded availability)
                const selectedInfo = availability[selectedRescheduleDate];
                // 👆 availability is the API response object you stored from preloadAvailability

                if (selectedInfo && selectedInfo.canStart) {
                  setAvailableTeam(selectedInfo.availableMembers); // save members
                  setOpenCalendar(false); // close calendar
                  setTeamModalVisible(true); // open team modal
                }
              }}
            >
              <Text style={styles.rescheduleBtnText}>Done</Text>
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
              onPress={handleMarkPendingHiring}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* alert popup */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAlertPopup}
        onRequestClose={() => setShowAlertPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
              Alert
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Please finalize at least one quotation before marking hiring.
              {/* {showMessage} */}
            </Text>
            <TouchableOpacity
              style={[
                styles.okBtn,
                { flexDirection: 'row', justifyContent: 'flex-end' },
              ]}
              onPress={() => setShowAlertPopup(false)}
            >
              <Text style={styles.okTxt}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* package list */}
      <Modal transparent visible={viewPackages} animationType="slide">
        <View style={styles.modalOverlay}>
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
              <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={() => {
          setOtpModalVisible(false);
          setOtp(['', '', '', '']);
          setJoinedOTP(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.otpModal}>
            <TouchableOpacity
              onPress={() => {
                setOtpModalVisible(false);
                setOtp(['', '', '', '']);
                setJoinedOTP(null);
              }}
              style={styles.closeButton}
            >
              <AntDesign name="close" color="black" size={20} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>OTP</Text>
            <Text style={styles.modalSubtitle}>
              Enter OTP sent to customer's phone
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: 'red',
                fontFamily: 'Poppins-Medium',
              }}
            >
              {showOTP} (development)
            </Text>
            <View style={styles.otpInputRow}>
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={el => (inputs.current[index] = el)}
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
            <TouchableOpacity
              style={{
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: 'red',
                  fontFamily: 'Poppins-Medium',
                  borderBottomColor: 'red',
                  borderBottomWidth: 1,
                }}
              >
                Re-Send OTP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleStartProject}
            >
              <Text style={styles.confirmButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={endProject}
        onRequestClose={() => setEndProject(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              style={styles.checkIcon}
              source={require('../assets/icons/featured.png')}
              resizeMode="contain"
            />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }}>
              End the Project!
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Are you sure you want to end the project?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleEndProject}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEndProject(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={requestNext}
        onRequestClose={() => setRequestNext(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              style={styles.checkIcon}
              source={require('../assets/icons/featured.png')}
              resizeMode="contain"
            />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }}>
              Request Next Payment
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Are you sure you want to request Next Payment?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleRequestNextPayment}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setRequestNext(false)}
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
  container: { padding: 15 },
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
    borderRadius: 6,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    // marginBottom: 20,
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
    fontFamily: 'Poppins-Medium',
  },
  // endBtn: {
  //   backgroundColor: '#ED1F24',
  //   padding: 16,
  //   alignItems: 'center',
  //   borderRadius: 5,
  //   marginHorizontal: 50,
  //   alignSelf: 'center',
  //   minWidth: 340,
  //   marginBottom: 30,
  // },

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
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    color: 'white',
  },
  contactBtn: {
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
  updateButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    // marginRight: 40,
  },

  contactText: { color: '#fff', fontFamily: 'Poppins-SemiBold' },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetails: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    // top: 15,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: { fontFamily: 'Poppins-SemiBold', color: '#615858' },
  label2: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: 'black' },
  value: {
    fontSize: 13,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  bold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: 'black',
  },
  amountLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#4D4D4D',
    fontSize: 14,
  },
  amountBold: { fontFamily: 'Poppins-SemiBold', marginLeft: 130, marginTop: 5 },
  amountPaid: { fontFamily: 'Poppins-SemiBold' },
  amountDue: { color: '#000000', fontFamily: 'Poppins-SemiBold' },
  dottedLine2: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dashed',
    marginVertical: 5,
  },
  endBtn: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 15,
    alignItems: 'center',
    // borderRadius: 5,
    alignSelf: 'center',
  },
  endBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
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
  subHeader: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 10,
  },
  closeButton: { position: 'absolute', top: 15, right: 15 },
  okBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  okTxt: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  StatusModalContainer: {
    width: '85%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  crmNote: {
    color: '#E74C3C',
    fontSize: 11,
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
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
  teamModalContainer: {
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
});
export default JobOngoing;

// use it in website
// const approvePrice = async (approvedBy) => {
//   try {
//     const result = await postRequest(
//       `${API_ENDPOINTS.APPROVE_PRICING}${bookingId}`,
//       { approvedBy } // "admin" or "customer"
//     );

//     ToastAndroid.showWithGravity(
//       result.message || "Price approved successfully",
//       ToastAndroid.LONG,
//       ToastAndroid.CENTER
//     );

//     fetchBookingData();
//   } catch (error) {
//     console.error("Error approving price:", error);
//     ToastAndroid.showWithGravity(
//       error?.message || "Failed to approve the price",
//       ToastAndroid.LONG,
//       ToastAndroid.CENTER
//     );
//   }
// };
