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
// import MapView, { Marker } from 'react-native-maps';
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
  const leadId = leadDataContext?._id;
  const { vendorDataContext } = useVendorContext();
  const vendorId = vendorDataContext?._id;
  const [estimateData, setEstimateData] = useEstimateContext();
  const measurementId = estimateData?._id;
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState(0);
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
  console.log('leadDataContext Id', leadDataContext?._id);
  // console.log('leadDataContext', leadDataContext);
  // console.log('vendorDataContext', vendorDataContext);
  // console.log('quotes', quotes);

  const today = moment().format('YYYY-MM-DD');
  const tomorrow = moment().add(1, 'day');
  const dayAfterTomorrow = moment().add(2, 'day');
  // const dayAfterTomorrow = moment().add(2, 'days').format('YYYY-MM-DD');

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
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const availableSlots = ['10:30am', '12:30pm', '01:30pm', '2:30pm', '5:30pm'];

  const allowedStatusesForUpdate = ['Hired', 'Completed'];

  console.log('bookingDetails>>>', leadDataContext);

  const handleGoBack = () => {
    // if (leadDataContext) {
    //   setLeadDataContext(null);
    // }
    navigation.navigate('BottomTab', {
      screen: 'Ongoing',
    });
  };

  const uniqueSubCategories = [
    ...new Set(leadDataContext?.service?.map(unq => unq.subCategory)),
  ];
  const queryString = uniqueSubCategories
    .map(sub => `subCategory=${encodeURIComponent(sub)}`)
    .join('&');

  const hiring = leadDataContext?.assignedProfessional?.hiring || {};
  const projectDates = Array.isArray(hiring.projectDate)
    ? [...hiring.projectDate]
    : [];
  projectDates.sort(); // ISO YYYY-MM-DD sorts lexicographically ok

  const bookingId = leadDataContext?._id;

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

  // useEffect(() => {
  //   preloadAvailability();
  // }, [openCalendar]);

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

  // 1) Make preloadAvailability return info for selectedRescheduleDate
  const preloadAvailability = async () => {
    if (!selectedRescheduleDate) return null;

    setIsLoading(true);
    try {
      const start = moment(selectedRescheduleDate, 'YYYY-MM-DD').format(
        'YYYY-MM-DD',
      );
      const end = moment(selectedRescheduleDate, 'YYYY-MM-DD')
        .add(daysRequired - 1, 'days')
        .format('YYYY-MM-DD');

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.CHECK_AVAILABILITY_RANGE}${vendorId}/availability-range`,
        {
          params: { startDate: start, endDate: end, daysRequired },
        },
      );

      const data = res.data;
      if (!data.success) return null;

      setAvailability(data.availability);

      const blocked = {};
      Object.entries(data.availability).forEach(([date, info]) => {
        if (!info.canStart) {
          blocked[date] = { disabled: true, disableTouchEvent: true };
        }
      });

      setMarkedDates({
        ...disabledMarkedDates,
        ...blocked,
      });

      // return the info for the currently selected start date
      return data.availability[selectedRescheduleDate] || null;
    } catch (err) {
      console.error('Error preloading availability:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  console.log('availableTeam', availableTeam);
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
      leadDataContext?.bookingDetails?.status === 'Survey Ongoing' ||
      leadDataContext?.bookingDetails?.status === 'Project Ongoing' ||
      leadDataContext?.bookingDetails?.status === 'Job Ongoing'
    ) {
      return '#FF7F00';
    } else if (leadDataContext?.bookingDetails?.status === 'Survey Completed') {
      return 'green';
    } else if (
      leadDataContext?.bookingDetails?.status === 'Customer Cancelled' ||
      leadDataContext?.bookingDetails?.status === 'Waiting for final payment' ||
      leadDataContext?.bookingDetails?.status === 'Customer Unreachable' ||
      leadDataContext?.bookingDetails?.status === 'Customer Denied' ||
      leadDataContext?.bookingDetails?.status === 'Negotiation'
    ) {
      return '#ff0000';
    } else if (leadDataContext?.bookingDetails?.status === 'Pending Hiring') {
      return '#fabb05ff';
    } else if (
      leadDataContext?.bookingDetails?.status === 'Hired' ||
      leadDataContext?.bookingDetails?.status === 'Project Completed'
    ) {
      return '#008e00ff';
    }
  };

  //Banner
  const getScopeTypeText = scopeType => {
    return scopeType === 'Added' ? 'Added' : 'Reduced';
  };

  const getStatusText = (status, scopeType) => {
    const user = scopeType === 'Added' ? 'customer' : 'admin';
    switch (status.toLowerCase()) {
      case 'pending':
        return `Waiting for ${user}'s Approval `;
      case 'approved':
        return `Approved by ${user}`;
      case 'rejected':
        return `Disapproved by ${user}`;
      default:
        return '';
    }
  };

  // console.log('Vendor Service Type:', vendorDataContext?.vendor?.serviceType);

  // --- 💰 Payment Calculation Logic ---
  const bd = leadDataContext?.bookingDetails ?? {};
  const priceChanges = bd.priceChanges || [];
  const latestChange = priceChanges[priceChanges.length - 1] || null;
  // const latestChange = leadDataContext?.bookingDetails?.priceChanges?.slice(-1)[0];
  const hasPendingPriceEdit =
    !!latestChange &&
    latestChange.status === 'pending' &&
    leadDataContext?.bookingDetails?.hasPriceUpdated;

  const paymentLinkActive =
    leadDataContext?.bookingDetails?.paymentLink?.isActive === true;
  const isDeepCleaning =
    vendorDataContext?.vendor?.serviceType === 'deep-cleaning';
  const isHousePainter =
    vendorDataContext?.vendor?.serviceType === 'house-painter' ||
    vendorDataContext?.vendor?.serviceType === 'House Painting';

  // Disable or hide End Project button if pending edit or active payment request
  const disableEndProject =
    isDeepCleaning && (hasPendingPriceEdit || paymentLinkActive);

  // "End Survey" — unaffected
  const showEndSurvey =
    isHousePainter &&
    leadDataContext?.bookingDetails?.status !== 'Survey Completed' &&
    !leadDataContext?.bookingDetails?.startProject;

  const approvedChanges = priceChanges.filter(c => c.status === 'approved');
  const hasApprovedChange = approvedChanges.length > 0;

  // console.log('approvedChanges', approvedChanges);

  // Only count cumulative delta for APPROVED changes
  const originalTotal = bd.originalTotalAmount || bd.bookingAmount || 0; //  uncommand it later

  // console.log("originalTotal", originalTotal);

  // const originalTotal = bd.finalTotal || bd.bookingAmount || 0;
  const totalApprovedDelta = approvedChanges.reduce(
    (sum, c) =>
      sum +
      (c.scopeType === 'Reduced'
        ? -(c.adjustmentAmount || 0)
        : c.adjustmentAmount || 0),
    0,
  );
  const approvedTotal = originalTotal + totalApprovedDelta;

  // PENDING change info (not used in committed state!)
  const isPending = !!latestChange && latestChange.status === 'pending';
  const pendingDelta = isPending
    ? latestChange.scopeType === 'Reduced'
      ? -(latestChange.adjustmentAmount || 0)
      : latestChange.adjustmentAmount || 0
    : 0;
  const pendingTotal = approvedTotal + pendingDelta;

  // REJECTED logic
  const isRejected = !!latestChange && latestChange.status === 'rejected';

  // Dynamic amount paid (aggregate all paid up to now)
  const paid = bd.paidAmount; // command and replace beblow cmd
  // uncommand if need
  // (bd.firstPayment?.status === 'paid' ? bd.firstPayment.amount || 0 : 0) +
  // (bd.secondPayment?.status === 'partial'
  //   || bd.secondPayment?.status === 'paid'
  //   ? bd.secondPayment.amount || 0 : 0) +
  // (bd.finalPayment?.status === 'partial' ? bd.finalPayment.prePayment || 0 :
  //   bd.finalPayment?.status === 'paid' ? bd.finalPayment.amount || 0 : 0);

  // console.log("paid", paid);
  // console.log("amountYetToPay", bd.amountYetToPay);

  // Amount Yet to Pay always relative to visible displayed TOTAL
  let currentVisibleTotal = originalTotal; // default fallback
  let showOldTotal = false;
  let oldTotal = null,
    changeDelta = null,
    newTotal = null;

  // For the very first pending edit (no previous approvals)
  const isFirstPending = isPending && !hasApprovedChange;

  if (isPending && hasApprovedChange) {
    // Show both last APPROVED and current PENDING
    showOldTotal = true;
    oldTotal = approvedTotal;
    changeDelta = pendingDelta;
    newTotal = pendingTotal;
    currentVisibleTotal = pendingTotal;
  } else if (isPending && !hasApprovedChange) {
    // First PENDING: show new total, old total, change
    showOldTotal = true;
    oldTotal = originalTotal;
    changeDelta = pendingDelta;
    newTotal = pendingTotal;
    currentVisibleTotal = pendingTotal;
  } else if (isRejected && hasApprovedChange) {
    // Rejected after approval: revert to latest approved, ignore pending
    showOldTotal = true;
    oldTotal = originalTotal;
    changeDelta = totalApprovedDelta;
    newTotal = approvedTotal;
    currentVisibleTotal = approvedTotal;
  } else if (isRejected && !hasApprovedChange) {
    // First-time rejection: fall back to basic original
    showOldTotal = false;
    currentVisibleTotal = originalTotal;
  } else if (hasApprovedChange) {
    // At least one approved change and NOTHING currently pending: reflect approved chain
    showOldTotal = true;
    oldTotal = originalTotal;
    changeDelta = totalApprovedDelta;
    newTotal = approvedTotal;
    currentVisibleTotal = approvedTotal;
  } else {
    // No change at all
    showOldTotal = false;
    currentVisibleTotal = originalTotal;
  }

  // Always maintain positive/negative display of deltas.
  const currency = n => `₹ ${Number(n ?? 0).toLocaleString('en-IN')}`;

  // .....................................................

  // icon action
  const lastChange = bd.priceChanges?.[bd.priceChanges.length - 1];
  const isPriceUpdatePending =
    !!bd.hasPriceUpdated && lastChange?.status === 'pending';
  const isPaymentRequestPending = bd.paymentLink?.isActive === true;
  const isProjectCompleted =
    bd.status?.toLowerCase() === 'project completed' &&
    bd.firstPayment?.status === 'paid' &&
    bd.secondPayment?.status === 'paid' &&
    bd.finalPayment?.status === 'paid';

  const iconDisabled =
    isPriceUpdatePending || isPaymentRequestPending || isProjectCompleted;

  const isProjectFullyPaid =
    bd.status?.toLowerCase().trim() === 'project completed' &&
    bd.firstPayment?.status === 'paid' &&
    bd.secondPayment?.status === 'paid' &&
    bd.finalPayment?.status === 'paid';

  // let disableAllTheHell = false
  // const serviceType = bd.serviceType?.toLowerCase().trim();
  // if (isProjectFullyPaid) {
  //   // don't show any buttons
  //   disableAllTheHell = true;
  // }

  let disableAllTheHell = false;

  const serviceType = leadDataContext?.serviceType?.toLowerCase().trim();
  console.log('serviceType', serviceType);
  if (
    (serviceType === 'deep_cleaning' &&
      bd.status?.toLowerCase().trim() === 'project completed' &&
      bd.firstPayment?.status === 'paid' &&
      bd.finalPayment?.status === 'paid') ||
    (serviceType === 'house_painting' &&
      bd.status?.toLowerCase().trim() === 'project completed' &&
      bd.firstPayment?.status === 'paid' &&
      bd.secondPayment?.status === 'paid' &&
      bd.finalPayment?.status === 'paid')
  ) {
    // don't show any buttons
    disableAllTheHell = true;
  }

  // console.log('iconDisabled', iconDisabled);
  // ----------------------------------------------------------------
  const priceEditPending =
    !!bd.hasPriceUpdated && lastChange?.status === 'pending';
  const paymentRequestActive = bd.paymentLink?.isActive;
  const serviceMatch =
    vendorDataContext?.vendor?.serviceType === 'house-painter' ||
    vendorDataContext?.vendor?.serviceType === 'House Painting';

  const firstPaid = bd.firstPayment?.status === 'paid';
  const secondPaid = bd.secondPayment?.status === 'paid';
  const secondPending = bd.secondPayment?.status === 'pending';
  const finalPending =
    bd.finalPayment?.status === 'pending' ||
    bd.finalPayment?.status === 'partial';

  console.log('firstPaid', firstPaid);

  const canShowRequestNextPayment = // req.2nd installment
    serviceMatch && firstPaid && secondPending && !paymentRequestActive;

  const requestNextEnabled = canShowRequestNextPayment && !priceEditPending;

  // 🔵 Show “End Project” only after 2nd payment requested
  const canShowEndProject =
    serviceMatch &&
    (paymentRequestActive || secondPaid) && // visible right after request
    finalPending;

  // console.log("canShowEndProject", canShowEndProject);

  // 🔒 Disable until 2nd payment is successful
  const endProjectEnabled =
    canShowEndProject &&
    !priceEditPending &&
    secondPaid && // enable only after 2nd payment success
    !bd.paymentLink?.isActive; // disable while link still active

  // 🚫 Hide if final payment request already sent
  const shouldHideEndProject =
    bd.status === 'Survey Completed' ||
    bd.status === 'Waiting for final payment' ||
    bd.finalPayment?.status === 'paid';

  // CUSTOMER  UNREACHABLE
  // const custUnReach =
  //   leadDataContext?.bookingDetails?.status !== 'Customer Unreachable' 
  //   leadDataContext?.bookingDetails?.status === 'Negotiation' ||
  //               leadDataContext?.bookingDetails?.status === 'Customer Denied'

  const status = leadDataContext?.bookingDetails?.status;

  const custUnReach = ['Customer Unreachable', 'Negotiation', 'Customer Denied'].includes(status)

  const started = !!leadDataContext?.bookingDetails?.startProject;
  const showStartProjectBtn =
    status === 'Pending Hiring' ||
    status === 'Customer Cancelled' ||
    (status === 'Hired' && started) ||
    (status === 'Customer Unreachable' && firstPaid);

  console.log('showStartProjectBtn', showStartProjectBtn);

  // ............................................................................
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
      leadDataContext?.address &&
      leadDataContext?.address.location &&
      Array.isArray(leadDataContext?.address.location.coordinates) &&
      leadDataContext?.address.location.coordinates.length === 2
    ) {
      // GeoJSON format: [longitude, latitude]
      const [longitude, latitude] =
        leadDataContext?.address.location.coordinates;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
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

  const canContinue =
    Array.isArray(selectedMembers) && selectedMembers.length >= 2;

  const onDayPress = dateString => {
    console.log('Date is blocked:', dateString);

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

  const disabledMarkedDates = {
    [today]: {
      disabled: true,
      disableTouchEvent: true,
    },
    [tomorrow.format('YYYY-MM-DD')]: {
      disabled: true,
      disableTouchEvent: true,
    },
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

  const handleStatusModal = type => {
    setStatusType(type);
    setStatusModalVisible(false);
    setOpenStatusModal(true);
  };

  const getConfirmText = statusType => {
    if ([1, 2, 3].includes(statusType))
      return 'Are you sure you want to update the status?';
    if (statusType === 4) return 'Are you sure you want to cancel the job?';
    return '';
  };

  const STATUS_MAP = {
    1: 'Customer Unreachable',
    2: 'Customer Denied',
    3: 'Negotiation',
    4: 'Customer Cancelled',
  };

  const handleUpdateStatus = async statusType => {
    setLoading(true);

    const statusText = STATUS_MAP[statusType];

    if (!statusText) {
      ToastAndroid.showWithGravity(
        'Invalid status',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return;
    }
    try {
      const formData = {
        bookingId: leadDataContext?._id,
        status: statusText,
        vendorId: vendorDataContext._id,
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
    const lat = leadDataContext?.address?.location?.coordinates[1];
    const lng = leadDataContext?.address?.location?.coordinates[0];

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
    ? Number(leadDataContext?.bookingDetails.amountYetToPay) - Number(amount)
    : Number(leadDataContext?.bookingDetails.amountYetToPay) + Number(amount);

  const checkAmount = entered => {
    const enteredNum = parseInt(entered, 10) || 0;
    const paidNum =
      parseInt(leadDataContext?.bookingDetails.paidAmount, 10) || 0;
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
    const bookingId = leadDataContext?._id;

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
        proposedTotal: newPrice,
        reason: comment.trim(),
        scopeType: isReduce ? 'Reduced' : 'Added',
        requestedBy: 'vendor',
      };

      // Optional: validate on frontend
      // if (!formData.reason) {
      //   throw new Error('Reason is required');
      // }

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

  // ending after all measurement
  const handleCompleteSurvey = async () => {
    setLoading(true);
    setModalVisible(false);
    try {
      const formData = {
        bookingId: leadDataContext?._id,
        status:
          vendorDataContext?.vendor?.serviceType === 'house-painter' ||
            vendorDataContext?.vendor?.serviceType === 'House Painting'
            ? 'Survey Completed'
            : 'Project Completed',
        assignedProfessional: {
          professionalId: vendorDataContext._id,
          name: vendorDataContext.vendor?.vendorName,
          phone: vendorDataContext.vendor?.mobileNumber,
          profile: vendorDataContext.vendor?.profileImage,
          acceptedDate: leadDataContext?.assignedProfessional?.acceptedDate,
          acceptedTime: leadDataContext?.assignedProfessional?.acceptedTime,
          startedDate: leadDataContext?.assignedProfessional?.startedDate,
          startedTime: leadDataContext?.assignedProfessional?.startedTime,
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

  // final ending after payment [SENDING FINAL PAYMENT LINK] - hp and dc
  // requesting for final payment
  const handleEndProject = async () => {
    // requesting for final payment
    setLoading(true);
    setEndProject(false);
    setModalVisible(false);
    try {
      //  Releasing final payment to make 20% [SENDING FINAL PAYMENT LINK]
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
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'black'}
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
          <TouchableOpacity onPress={() => handleGoBack()}>
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
            {leadDataContext?.bookingDetails?.status}
          </Text>
          {latestChange && (
            <View style={styles.headerBlock}>
              <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 12 }}>
                Amount {getScopeTypeText(latestChange.scopeType)}: Rs.{' '}
                {latestChange.adjustmentAmount}
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 12,
                  color: '#FF7F00',
                }}
              >
                Status:{' '}
                {getStatusText(latestChange.status, latestChange.scopeType)}
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
                  {moment(leadDataContext?.selectedSlot?.slotDate).format('ll')}
                </Text>
                <Text style={styles.timeText}>
                  {' '}
                  {leadDataContext?.selectedSlot?.slotTime}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={require('../assets/icons/location.png')}
                style={{ marginTop: 9, marginRight: 5, width: 20, height: 20 }}
              />
              <Text style={styles.descriptionText}>
                {leadDataContext?.address?.houseFlatNumber},{' '}
                {leadDataContext?.address?.streetArea}
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
              leadDataContext?.bookingDetails?.status === 'Survey Completed' ||
              leadDataContext?.bookingDetails?.status ===
              'Customer Unreachable' ||
              leadDataContext?.bookingDetails?.status === 'Customer Denied' ||
              leadDataContext?.bookingDetails?.status === 'Negotiation' ||
              leadDataContext?.bookingDetails?.status ===
              'Customer Cancelled') &&
              // !leadDataContext?.bookingDetails?.isJobStarted &&
              (vendorDataContext?.vendor?.serviceType === 'house-painter' ||
                vendorDataContext?.vendor?.serviceType ===
                'House Painting') && (
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
                onPress={() => openDialPad(leadDataContext?.customer?.phone)}
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
            // leadDataContext?.bookingDetails?.status === 'Pending Hiring' ||
            leadDataContext?.bookingDetails?.status === 'Hired' ||
              leadDataContext?.bookingDetails?.status === 'Customer Cancelled' ||
              (leadDataContext?.bookingDetails?.status === 'Customer Unreachable'
                && firstPaid) ||
              leadDataContext?.bookingDetails?.status === 'Project Ongoing' ||
              leadDataContext?.bookingDetails?.status ===
              'Waiting for final payment' ||
              // leadDataContext?.bookingDetails?.status === 'Survey Completed' ||
              vendorDataContext?.vendor?.serviceType === 'deep cleaning' || // deep cleaing
              leadDataContext?.bookingDetails?.status === 'Project Completed' ? (
              <View
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 10,
                  paddingTop: 10,
                  marginTop: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: 'white',
                    // padding: 10,
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
                  <View>
                    {isPending && hasApprovedChange ? (
                      <>
                        {/* Show last approved edit info */}
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            Old Total Amount
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(originalTotal)}
                          </Text>
                        </View>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Change</Text>
                          <Text
                            style={[
                              styles.amountDue,
                              {
                                color: totalApprovedDelta < 0 ? 'red' : 'green',
                              },
                            ]}
                          >
                            {totalApprovedDelta < 0 ? '-' : '+'}{' '}
                            {currency(Math.abs(totalApprovedDelta))}
                          </Text>
                        </View>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            New Total Amount
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(approvedTotal)}
                          </Text>
                        </View>
                        <View style={styles.dottedLine2} />

                        {/* Payment summary as per last approved */}
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
                            {currency(approvedTotal - paid)}
                          </Text>
                        </View>
                        {/* Show pending proposal */}
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
                            {currency(pendingTotal)}
                          </Text>
                        </View>
                      </>
                    ) : isFirstPending ? (
                      // FIRST TIME PENDING EDIT UI
                      <>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Total Amount</Text>
                          <Text style={styles.amountBold}>
                            {currency(originalTotal)}
                          </Text>
                        </View>
                        <View style={styles.dottedLine2} />
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
                            {currency(originalTotal - paid)}
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
                          <Text style={styles.amountLabel}>New Total</Text>
                          <Text style={styles.amountDue}>
                            {currency(pendingTotal)}
                          </Text>
                        </View>
                      </>
                    ) : showOldTotal ? (
                      // SUBSEQUENT EDIT/APPROVAL OR REJECTED BLOCK
                      <>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            Old Total Amount
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(oldTotal)}
                          </Text>
                        </View>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Change</Text>
                          <Text
                            style={[
                              styles.amountDue,
                              { color: changeDelta < 0 ? 'red' : 'green' },
                            ]}
                          >
                            {changeDelta < 0 ? '-' : '+'}{' '}
                            {currency(Math.abs(changeDelta))}
                          </Text>
                        </View>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            New Total Amount
                          </Text>
                          <Text style={styles.amountDue}>
                            {currency(newTotal)}{' '}
                            {(leadDataContext?.bookingDetails?.status ===
                              'Project Ongoing' ||
                              leadDataContext?.bookingDetails?.status ===
                              'Job Ongoing') &&
                              !iconDisabled && (
                                <TouchableOpacity
                                  onPress={() => setSecondModalVisible(true)}
                                  style={{ marginRight: 8 }}
                                  accessibilityRole="button"
                                  accessibilityLabel="Edit price"
                                  disabled={iconDisabled}
                                >
                                  <MaterialIcons
                                    name="edit"
                                    color={iconDisabled ? 'gray' : 'black'}
                                    size={20}
                                  />
                                </TouchableOpacity>
                              )}
                          </Text>
                        </View>
                        <View style={styles.dottedLine2} />
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
                            {currency(currentVisibleTotal - paid)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      // DEFAULT (NO EDIT)
                      <>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>Total Amount</Text>
                          <Text style={styles.amountBold}>
                            {currency(originalTotal)}{' '}
                            {(leadDataContext?.bookingDetails?.status ===
                              'Project Ongoing' ||
                              leadDataContext?.bookingDetails?.status ===
                              'Job Ongoing') &&
                              !leadDataContext?.bookingDetails?.paymentLink
                                ?.isActive && (
                                <TouchableOpacity
                                  onPress={() => setSecondModalVisible(true)}
                                  style={{ marginRight: 8 }}
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
                          <Text style={styles.amountPaid}>
                            {currency(paid)}
                          </Text>
                        </View>
                        <View style={styles.rowBetween}>
                          <Text style={styles.amountLabel}>
                            Amount Yet to be Paid
                          </Text>
                          <Text style={styles.amountDue}>
                            {firstPaid && secondPending && finalPending
                              ? currency(bd.amountYetToPay)
                              : // either bd.finalPayment.remaining
                              currency(originalTotal - paid)}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
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

            {leadDataContext?.assignedProfessional?.endedDate && (
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                Survey End at:{' '}
                {moment(
                  leadDataContext?.assignedProfessional?.endedDate,
                ).format('DD-MM-YYYY')}{' '}
                : {leadDataContext?.assignedProfessional?.endedTime}
              </Text>
            )}

            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                marginBottom: 10,
              }}
            >
              {vendorDataContext?.vendor?.serviceType === 'house-painter' ||
                vendorDataContext?.vendor?.serviceType === 'House Painting'
                ? 'Survey Start'
                : 'Job Ongoing'}{' '}
              at:{' '}
              {moment(
                leadDataContext?.assignedProfessional?.startedDate,
              ).format('DD-MM-YYYY')}{' '}
              : {leadDataContext?.assignedProfessional?.startedTime}
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
            {/* {!disableAllTheHell && (
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
            )} */}
          </View>
        </ScrollView>
        {showEndSurvey && !custUnReach ? (
          // END SURVEY - House Painter (always allowed)
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: '#ED1F24' }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.endBtnText}>END SURVEY</Text>
          </TouchableOpacity>
        ) : leadDataContext?.bookingDetails?.status == 'Job Ongoing' ? (
          <TouchableOpacity
            style={[
              styles.endBtn,
              {
                backgroundColor: hasPendingPriceEdit ? '#ff9294ff' : '#ED1F24',
              }, // show in inactive color if disabled
            ]}
            onPress={
              !hasPendingPriceEdit ? () => setModalVisible(true) : undefined
            }
            disabled={hasPendingPriceEdit}
          >
            <Text style={styles.endBtnText}>
              END PROJECT
              {/* DEEP */}{' '}
            </Text>
          </TouchableOpacity>
        ) :
          //  leadDataContext?.bookingDetails?.status === 'Pending Hiring' ||  -- old logic to show start project btn (hp)
          //   leadDataContext?.bookingDetails?.status === 'Customer Cancelled' ||
          //   (leadDataContext?.bookingDetails?.status === 'Hired' &&
          //     leadDataContext?.bookingDetails?.startProject)
          showStartProjectBtn ? (
            <TouchableOpacity
              // old logic toshow bg and disable
              // style={[
              //   styles.endBtn,
              //   {
              //     backgroundColor:
              //       leadDataContext?.bookingDetails?.status === 'Hired' ||
              //         leadDataContext?.bookingDetails?.status === 'Customer Cancelled' &&
              //         leadDataContext?.bookingDetails?.startProject
              //         ? '#119b11ff'
              //         : 'rgba(200, 220, 200, 1)',
              //   },
              // ]}
              // disabled={
              //   leadDataContext?.bookingDetails?.status === 'Hired' ||
              //     leadDataContext?.bookingDetails?.status === 'Customer Cancelled' &&
              //     leadDataContext?.bookingDetails?.startProject
              //     ? false
              //     : true
              // }

              //            style={[
              //   styles.endBtn,    // chatGPT
              //   {
              //     backgroundColor:
              //       status === "Hired" && started ? "#119b11ff" : "rgba(200, 220, 200, 1)",
              //   },
              // ]}
              // disabled={!(status === "Hired" && started)} 
              style={[
                styles.endBtn,
                {
                  backgroundColor:
                    (status === 'Hired' && started) ||
                      status === 'Customer Cancelled' ||
                      (status === 'Customer Unreachable' && firstPaid)
                      ? '#119b11ff'
                      : 'rgba(200, 220, 200, 1)',
                },
              ]}
              disabled={!((status === 'Hired' && started) ||
                status === 'Customer Cancelled' ||
                (status === 'Customer Unreachable' && firstPaid)
              )}
              onPress={() => setStartProject(true)}
            >
              {/* api REQUESTING_SEND_OTP calling */}
              <Text style={styles.endBtnText}>START PROJECT</Text>
            </TouchableOpacity>
          ) : canShowRequestNextPayment ? (
            <TouchableOpacity
              style={[
                styles.endBtn,
                { backgroundColor: requestNextEnabled ? '#ff7f00ff' : '#ffb97a' },
              ]}
              disabled={!requestNextEnabled}
              onPress={
                requestNextEnabled ? () => setRequestNext(true) : undefined
              }
            >
              <Text style={styles.endBtnText}>Request Next Payment</Text>
            </TouchableOpacity>
          ) : (
            !disableAllTheHell &&
            !shouldHideEndProject &&
            !custUnReach && (
              <TouchableOpacity
                style={[
                  styles.endBtn,
                  {
                    backgroundColor: endProjectEnabled
                      ? '#ed1f24ff'
                      : '#ff9294ff', // dull red when disabled
                  },
                ]}
                disabled={!endProjectEnabled}
                onPress={
                  endProjectEnabled ? () => setEndProject(true) : undefined
                }
              >
                <Text style={styles.endBtnText}>
                  End Project
                  {/* House */}
                </Text>
              </TouchableOpacity>
            )
          )}
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
                ₹ {leadDataContext?.bookingDetails.paidAmount}
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
              {vendorDataContext?.vendor?.serviceType === 'house-painter' ||
                vendorDataContext?.vendor?.serviceType === 'House Painting'
                ? 'survey'
                : 'project'}
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
              {vendorDataContext?.vendor?.serviceType === 'house-painter' ||
                vendorDataContext?.vendor?.serviceType === 'House Painting'
                ? 'survey'
                : 'project'}
              ?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={
                vendorDataContext?.vendor?.serviceType === 'deep cleaning' ||
                  leadDataContext?.service[0]?.category === 'Deep Cleaning'
                  ? handleEndProject
                  : handleCompleteSurvey
              }
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

      {/* update status STATUS-TYPE */}
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
            {leadDataContext?.bookingDetails?.status === 'Hired' ||
              leadDataContext?.bookingDetails?.status === 'Customer Cancelled' ||
              (leadDataContext?.bookingDetails?.status ===
                'Customer Unreachable' && firstPaid) &&
              !leadDataContext?.bookingDetails?.isJobStarted ? (
              // ✅ After Hired, Before Start → Show Cancellation/Rescheduling options
              <>
                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() => handleStatusModal(1)}
                >
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
                  onPress={() => handleStatusModal(4)}
                >
                  <Text style={styles.statusOptionText}>Customer Cancel</Text>
                </TouchableOpacity>
              </>
            ) : leadDataContext?.bookingDetails?.isJobStarted ? (
              // ✅ Project has started → Show same options (if needed)
              <>
                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() => handleStatusModal(1)}
                >
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
                  onPress={() => handleStatusModal(4)}
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
                  <Text
                    style={styles.statusOptionText}
                    onPress={() => handleStatusModal(1)}
                  >
                    Customer Unreachable
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() => handleStatusModal(2)}
                >
                  <Text style={styles.statusOptionText}>Customer Denied</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() => handleStatusModal(3)}
                >
                  <Text style={styles.statusOptionText}>
                    Customer Negotiation going on
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* prompt for customer cancel ,unreachable, denied, negatiation going */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={openStatusModal}
        onRequestClose={() => setOpenStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.StatusModalContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={() => setOpenStatusModal(false)}>
                <AntDesign name="close" color="black" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>
              {statusType === 1
                ? 'Customer Unreachable!'
                : statusType === 2
                  ? 'Customer Denied'
                  : statusType === 3
                    ? 'Customer Negotiation going on'
                    : statusType === 4
                      ? 'Cancel Job!'
                      : ''}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Medium',
                color: '#000',
                marginBottom: 8,
              }}
            >
              <Text>
                <Text>{getConfirmText(statusType)}</Text>
              </Text>
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => handleUpdateStatus(statusType)}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setOpenStatusModal(false);
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
                markedDates={{
                  ...markedDates,
                  ...disabledMarkedDates,
                }}
                minDate={dayAfterTomorrow.format('YYYY-MM-DD')}
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
              disabled={!isStored}
              onPress={async () => {
                if (!isStored) return;
                if (!selectedRescheduleDate) return;

                // wait for availability to load for this selection
                const selectedInfo = await preloadAvailability();

                if (
                  selectedInfo &&
                  selectedInfo.canStart &&
                  selectedInfo.availableMembers?.length
                ) {
                  setAvailableTeam(selectedInfo.availableMembers);
                  setOpenCalendar(false);
                  setTeamModalVisible(true);
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
        {/* final payment */}
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
    bottom: -1,
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

// changin booking terms
// exports.createBooking = async (req, res) => {
//   try {
//     const {
//       customer,
//       service,
//       bookingDetails,
//       assignedProfessional,
//       address,
//       selectedSlot,
//       isEnquiry,
//       formName,
//     } = req.body;
//     console.log("req.body", req.body);

//     // Validation
//     if (!service || !Array.isArray(service) || service.length === 0) {
//       return res.status(400).json({ message: "Service list cannot be empty." });
//     }

//     // Parse coordinates
//     let coords = [0, 0];
//     if (
//       address?.location?.coordinates &&
//       Array.isArray(address.location.coordinates) &&
//       address.location.coordinates.length === 2 &&
//       typeof address.location.coordinates[0] === "number" &&
//       typeof address.location.coordinates[1] === "number"
//     ) {
//       coords = address.location.coordinates;
//     } else {
//       return res
//         .status(400)
//         .json({ message: "Invalid or missing address coordinates." });
//     }

//     // 🔍 Detect service type
//     const serviceType = detectServiceType(formName, service);

//     // 💰 Calculate total from services
//     const originalTotalAmount = service.reduce((sum, s) => {
//       return sum + Number(s.price) * Number(s.quantity || 1);
//     }, 0);

//     console.log("bookingDetails", bookingDetails);

//     // Booking amount from frontend (paid on website)
//     const bookingAmount = Number(bookingDetails?.bookingAmount) || 0;

//     // ✅ Prepare bookingDetails with correct installments
//     let bookingDetailsConfig = {
//       bookingDate: bookingDetails?.bookingDate
//         ? new Date(bookingDetails.bookingDate)
//         : new Date(),
//       bookingTime: bookingDetails?.bookingTime || "10:30 AM",
//       status: "Pending",
//       bookingAmount: 0,
//       originalTotalAmount: 0,
//       finalTotal: 0,
//       paidAmount: bookingDetails.paidAmount,
//       amountYetToPay: 0,
//       paymentMethod: bookingDetails?.paymentMethod || "Cash",
//       paymentStatus: bookingAmount > 0 ? "Partial Payment" : "Unpaid",
//       otp: generateOTP(), // 4-digit OTP
//       siteVisitCharges: 0,
//       paymentLink: { isActive: false },
//     };

//     if (serviceType === "deep_cleaning") {
//       // ✅ Deep Cleaning: total is known at booking
//       const bookingAmount = Number(bookingDetails?.bookingAmount) || 0;
//       const originalTotal = originalTotalAmount; // computed from service prices

//       bookingDetailsConfig.bookingAmount = bookingAmount;
//       bookingDetailsConfig.originalTotalAmount = originalTotal;
//       bookingDetailsConfig.finalTotal = originalTotal;
//       bookingDetailsConfig.paidAmount = bookingDetails.paidAmount;
//       bookingDetailsConfig.amountYetToPay = bookingDetails.amountYetToPay
//       // Math.max(
//       //   0,
//       //   bookingAmount - bookingDetails.paidAmount
//       // );
//       bookingDetailsConfig.paymentStatus =
//         bookingAmount > 0 ? "Partial Payment" : "Unpaid";

//       // Installments
//       bookingDetailsConfig.firstPayment = {
//         status: bookingAmount > 0 ? "paid" : "pending",
//         amount: bookingDetails.paidAmount,
//         paidAt: bookingAmount > 0 ? new Date() : null,
//         method: bookingDetails?.paymentMethod || "UPI",
//       };
//       bookingDetailsConfig.finalPayment = {
//         status: "pending",
//         amount: Math.max(0, originalTotal - bookingAmount),
//       };
//     } else if (serviceType === "house_painting") {
//       // 🏠 House Painting: ONLY site visit charges (if any) collected now
//       const siteVisitCharges = Number(bookingDetails?.siteVisitCharges) || 0;

//       // All main amounts are 0 — will be set later during quotation
//       bookingDetailsConfig.siteVisitCharges = siteVisitCharges;
//       // bookingDetailsConfig.bookingAmount = siteVisitCharges; // this is the only "advance"
//       bookingDetailsConfig.paidAmount = siteVisitCharges;
//       bookingDetailsConfig.paymentStatus =
//         siteVisitCharges > 0 ? "Partial Payment" : "Unpaid";
//       bookingDetailsConfig.amountYetToPay = 0; // because total is unknown

//       // Installments: only firstPayment may have site visit amount (but usually 0)
//       // We'll leave all as pending with 0 — they'll be updated in `markPendingHiring`
//       bookingDetailsConfig.firstPayment = { status: "pending", amount: 0 };
//       bookingDetailsConfig.secondPayment = { status: "pending", amount: 0 };
//       bookingDetailsConfig.finalPayment = { status: "pending", amount: 0 };

//       // originalTotalAmount & finalTotal remain 0 until quote is finalized
//     }

//     // Track payment line-item
//     const payments =
//       serviceType === "house_painting"
//         ? [] // empty array for house painting
//         : [
//           {
//             at: new Date(),
//             method: "UPI", // You can replace this dynamically later once payment integration
//             amount: bookingDetails.paidAmount,
//             providerRef: "razorpay_order_xyz" || undefined,
//           },
//         ];

//     // 📦 Create booking
//     const booking = new UserBooking({
//       customer: {
//         customerId: customer?.customerId,
//         name: customer?.name,
//         phone: customer?.phone,
//       },
//       service: service.map((s) => ({
//         category: s.category,
//         subCategory: s.subCategory,
//         serviceName: s.serviceName,
//         price: Number(s.price),
//         quantity: Number(s.quantity) || 1,
//         teamMembersRequired: Number(s.teamMembersRequired) || 1,
//       })),
//       serviceType, // NEW FIELD
//       bookingDetails: bookingDetailsConfig,
//       assignedProfessional: assignedProfessional
//         ? {
//           professionalId: assignedProfessional.professionalId,
//           name: assignedProfessional.name,
//           phone: assignedProfessional.phone,
//         }
//         : undefined,
//       address: {
//         houseFlatNumber: address?.houseFlatNumber || "",
//         streetArea: address?.streetArea || "",
//         landMark: address?.landMark || "",
//         city: address?.city || "",
//         location: {
//           type: "Point",
//           coordinates: coords,
//         },
//       },
//       selectedSlot: {
//         slotDate: selectedSlot?.slotDate || moment().format("YYYY-MM-DD"),
//         slotTime: selectedSlot?.slotTime || "10:00 AM",
//       },
//       payments,
//       isEnquiry: Boolean(isEnquiry),
//       formName: formName || "Unknown",
//       createdDate: new Date(),
//     });

//     await booking.save();

//     res.status(201).json({
//       message: "Booking created successfully",
//       bookingId: booking._id,
//       serviceType,
//       booking,
//     });
//   } catch (error) {
//     console.error("Error creating booking:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
