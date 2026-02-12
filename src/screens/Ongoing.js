import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  RefreshControl,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { getRequest } from '../ApiService/apiHelper';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { useVendorContext } from '../Utilities/VendorContext';
import moment from 'moment';
import PageLoader from '../components/PageLoader';
import { useLeadContext } from '../Utilities/LeadContext';
import { filterLeads } from '../Utilities/leadFilters';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColor } from '../Utilities/ThemeContext';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IsEnabled3HoursBeforeSlot from '../Utilities/IsEnabled3HoursBeforeSlot';

const screenWidth = Dimensions.get('window').width;

const OngoingLeadsScreen = () => {
  const { deviceTheme } = useThemeColor();
  const { vendorDataContext } = useVendorContext();
  const { leadDataContext, setLeadDataContext } = useLeadContext();
  const professionalId = vendorDataContext?._id;
  const navigation = useNavigation();
  const TABS = ['All Leads', 'Today', 'Tomorrow'];
  const [activeTab, setActiveTab] = useState('All Leads');
  const [searchText, setSearchText] = useState('');
  const translateX = useRef(new Animated.Value(0)).current;
  const [leadsList, setLeadsLists] = useState([]);
  const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigationLoader, setNavigationLoader] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const displayedLeads = filterLeads(
    activeTab,
    leadsList,
    selectedStatus,
    searchText,
  );

  console.log('leadDataContext', leadDataContext);
  const fetchConfirmedLeads = useCallback(
    async signal => {
      if (!refreshing) setLoading(true);
      try {
        const response = await getRequest(
          `${API_ENDPOINTS.GET_CONFIRM_BOOKINGS}${professionalId}`,
          signal ? { signal } : undefined,
        );
        setLeadsLists(response.leadsList);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          console.error('Error fetching bookings:', err);
        }
      } finally {
        if (!refreshing) setLoading(false);
      }
    },
    [refreshing],
  );
  console.log('leadsList', leadsList);

  useEffect(() => {
    const controller = new AbortController();
    fetchConfirmedLeads(controller.signal).finally(() => setLoading(false));
    return () => controller.abort();
  }, [professionalId, fetchConfirmedLeads]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConfirmedLeads();
    setRefreshing(false);
  }, [fetchConfirmedLeads]);

  // console.log('leadsList Ongoing', leadsList);


  useEffect(() => {
    Animated.spring(translateX, {
      toValue: -activeTab * screenWidth,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();
  }, [activeTab]);

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-999, 999])
        .minDistance(20)
        .onEnd(e => {
          if (e.translationX < -50) {
            // Swiped left
            const idx = TABS.indexOf(activeTab);
            if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1]);
          }
          if (e.translationX > 50) {
            // Swiped right
            const idx = TABS.indexOf(activeTab);
            if (idx > 0) setActiveTab(TABS[idx - 1]);
          }
        }),
    [activeTab],
  );

  // const filteredLeads = leadsData
  //   .filter(item => activeTab === 'All Leads' || item.day === activeTab)
  //   .filter(item => !selectedStatus || item.status === selectedStatus);

  // const groupedLeads = {};
  // filteredLeads.forEach(item => {
  //   if (!groupedLeads[item.day]) groupedLeads[item.day] = [];
  //   groupedLeads[item.day].push(item);
  // });

  const handleFilterSelect = status => {
    setSelectedStatus(status);
    setFilterPopupVisible(false);
  };

  // const navigationDecision = lead => {
  //   setNavigationLoader(true); // Show the loader

  //   const status = lead.bookingDetails?.status;
  //   const hasLeadLocked = lead.bookingDetails?.hasLeadLocked;
  //   const isSurveyStarted = lead.bookingDetails?.isSurveyStarted;


  //   // Navigate first, without waiting for context update
  //   if (status === 'Customer Cancelled' || status === 'Rescheduled') {
  //     if (hasLeadLocked) {
  //       setNavigationLoader(false); // Stop loader if no navigation happens
  //       return;
  //     }
  //     // Navigate immediately to the appropriate screen
  //     navigation.navigate('LeadDescriptionScreen');
  //   }

  //   // For other statuses
  //   if (status === 'Confirmed' || status === 'Customer Unreachable') {
  //     // Navigate immediately to the appropriate screen
  //     navigation.navigate('LeadDescriptionScreen');
  //   }

  //   // For job or survey ongoing statuses
  //   if (
  //     [
  //       'Survey Ongoing',
  //       'Survey Completed',
  //       'Pending Hiring',
  //       'Hired',
  //       'Project Ongoing',
  //       'Job Ongoing',
  //       'Project Completed',
  //       'Waiting for final payment',
  //     ].includes(status)
  //   ) {
  //     // Navigate immediately to the job ongoing screen
  //     navigation.navigate('JobOngoing');
  //   }

  //   // Update the context after navigation is triggered
  //   setLeadDataContext(lead);
  //   setNavigationLoader(false); // Stop loader after the context is updated
  // };

  const navigationDecision = (lead) => {
    try {
      setNavigationLoader(true);

      const status = lead?.bookingDetails?.status;
      const hasLeadLocked = lead?.bookingDetails?.hasLeadLocked;
      const isSurveyStarted = lead?.bookingDetails?.isSurveyStarted;

      // ✅ Special case: Customer Unreachable
      if (status === "Customer Unreachable" ||
        status === "Negotiation" ||
        status === "Customer Denied" ||
        status === "Customer Cancelled"

      ) {
        if (isSurveyStarted) {
          navigation.navigate("JobOngoing");
        } else {
          navigation.navigate("LeadDescriptionScreen");
        }

        setLeadDataContext(lead);
        setNavigationLoader(false);
        return;
      }

      // Customer Cancelled / Rescheduled
      if (status === "Customer Cancelled" || status === "Rescheduled") {
        if (hasLeadLocked) {
          setNavigationLoader(false);
          return;
        }
        navigation.navigate("LeadDescriptionScreen");
        setLeadDataContext(lead);
        setNavigationLoader(false);
        return;
      }

      // Confirmed
      if (status === "Confirmed") {
        navigation.navigate("LeadDescriptionScreen");
        setLeadDataContext(lead);
        setNavigationLoader(false);
        return;
      }

      // Job or survey ongoing statuses
      if (
        [
          "Survey Ongoing",
          "Survey Completed",
          "Pending Hiring",
          "Hired",
          "Project Ongoing",
          "Job Ongoing",
          "Project Completed",
          "Waiting for final payment",
        ].includes(status)
      ) {
        navigation.navigate("JobOngoing");
        setLeadDataContext(lead);
        setNavigationLoader(false);
        return;
      }

      // ✅ Default fallback (optional)
      navigation.navigate("LeadDescriptionScreen");
      setLeadDataContext(lead);
      setNavigationLoader(false);
    } catch (e) {
      setNavigationLoader(false);
      console.log("navigationDecision error:", e);
    }
  };


  const showStatus = lead => {
    if (lead.bookingDetails?.status === 'Confirmed') {
      return null;
    } else {
      return lead.bookingDetails?.status;
    }
  };
  const backgroundColorStatus = lead => {
    if (lead.bookingDetails?.status === 'Confirmed') {
      return '';
    } else if (
      lead.bookingDetails?.status === 'Survey Ongoing' ||
      lead.bookingDetails?.status === 'Project Ongoing' ||
      lead.bookingDetails?.status === 'Job Ongoing'
    ) {
      return '#ffe1c3';
    } else if (lead.bookingDetails?.status === 'Survey Completed') {
      return '#ecffef';
    } else if (
      lead.bookingDetails?.status === 'Customer Cancelled' ||
      lead.bookingDetails?.status === 'Rescheduled' ||
      lead.bookingDetails?.status === 'Admin Cancelled' ||
      lead.bookingDetails?.status === 'Waiting for final payment' ||
      lead.bookingDetails?.status === 'Customer Unreachable' ||
      lead.bookingDetails?.status === 'Customer Denied' ||
      lead.bookingDetails?.status === 'Negotiation'
    ) {
      return '#ffecec';
    } else if (lead.bookingDetails?.status === 'Pending Hiring') {
      return '#fabd0533';
    } else if (
      lead.bookingDetails?.status === 'Hired' ||
      lead.bookingDetails?.status === 'Project Completed'
    ) {
      return 'rgba(0, 142, 0, 0.14)';
    }
  };

  const textColorStatus = lead => {
    if (lead.bookingDetails?.status === 'Confirmed') {
      return '';
    } else if (
      lead.bookingDetails?.status === 'Survey Ongoing' ||
      lead.bookingDetails?.status === 'Project Ongoing' ||
      lead.bookingDetails?.status === 'Job Ongoing'
    ) {
      return '#FF7F00';
    } else if (lead.bookingDetails?.status === 'Survey Completed') {
      return 'green';
    } else if (
      lead.bookingDetails?.status === 'Customer Cancelled' ||
      lead.bookingDetails?.status === 'Rescheduled' ||
      lead.bookingDetails?.status === 'Admin Cancelled' ||
      lead.bookingDetails?.status === 'Waiting for final payment' ||
      lead.bookingDetails?.status === 'Customer Unreachable' ||
      lead.bookingDetails?.status === 'Customer Denied' ||
      lead.bookingDetails?.status === 'Negotiation'
    ) {
      return '#ff0000';
    } else if (lead.bookingDetails?.status === 'Pending Hiring') {
      return '#ebb103ff';
    } else if (
      lead.bookingDetails?.status === 'Hired' ||
      lead.bookingDetails?.status === 'Project Completed'
    ) {
      return 'green';
    }
  };

  {
    /* <Text style={styles.housePaintingText}>
          {lead?.service[0]?.category}
        </Text> */
  }
  {
    /* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              color: '#ED1F24',
              fontSize: 11,
              fontFamily: 'Poppins-SemiBold',
            }}
          >
            {lead?.service[0]?.category}
          </Text>
        </View> */
  }

  const LeadItem = React.memo(({ lead }) => {
    const enableUI = IsEnabled3HoursBeforeSlot(
      lead.selectedSlot?.slotDate,
      lead.selectedSlot?.slotTime,
    );
    return (
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          marginBottom: 10,
          borderRadius: 10,
          elevation: 1,
        }}
        key={lead?._id}
        onPress={() => navigationDecision(lead)}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{lead?.customer?.name}</Text>
            <View style={styles.cardRightTime}>
              <Text style={styles.cardDay}>
                {moment(lead.selectedSlot?.slotDate).format('ll')}
              </Text>
              <Text style={styles.cardTime}>{lead.selectedSlot?.slotTime}</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Ionicons name="location" color="red" size={17} />
            <Text style={styles.cardText} numberOfLines={2}>
              {/* {enableUI && lead?.address.houseFlatNumber + ','} */}
              {lead.address?.streetArea}
            </Text>
          </View>
          {/* <View style={styles.cardBody}>
            {enableUI ? (
              <>
                <Ionicons name="location" color="red" size={17} />
                <Text style={styles.cardText} numberOfLines={2}>
                  {lead?.address.houseFlatNumber}, {lead?.address.streetArea}
                </Text>
              </>
            ) : (
              <View
                style={{
                  backgroundColor: '#ffecec',
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  color="red"
                  size={14}
                />
                <Text
                  style={[styles.cardText, { color: '#ED1F24', fontSize: 11 }]}
                >
                  Address will appear 3 hours prior to the Slot time.
                </Text>
              </View>
            )}
          </View> */}
        </View>
        <View
          style={{
            backgroundColor: backgroundColorStatus(lead),
            paddingVertical: 2,
            paddingHorizontal: 8,
            marginBottom: 0.3,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        >
          <Text
            style={{
              color: textColorStatus(lead),
              fontSize: 11,
              fontFamily: 'Poppins-SemiBold',
            }}
          >
            {showStatus(lead)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });
  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1 }}>
        <SafeAreaView>
          <StatusBar
            barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
          />
          {(loading || navigationLoader) && <PageLoader />}
          <Header />

          <View style={styles.container}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{activeTab}</Text>
              <TouchableOpacity
                onPress={() => setShowSearchBar(!showSearchBar)}
              >
                {showSearchBar ? (
                  <Fontisto name="close-a" color="black" size={15} />
                ) : (
                  <Fontisto name="search" color="black" size={17} />
                )}
              </TouchableOpacity>
            </View>
            {showSearchBar && (
              <TextInput
                style={{
                  backgroundColor: 'white',
                  fontSize: 14,
                  color: 'black',
                  fontFamily: 'Poppins-Regular',
                  paddingVertical: 10,
                  paddingHorizontal: 7,
                  marginTop: 10,
                  borderRadius: 6,
                }}
                value={searchText}
                onChangeText={text => setSearchText(text)}
                placeholder="Search by name, location"
                placeholderTextColor="#969696ff"
              />
            )}
            <View style={styles.tabRow}>
              <View style={styles.tabs}>
                {TABS.map(tab => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setFilterPopupVisible(true)}
              >
                <Image
                  source={require('../assets/icons/Frame.png')}
                  style={styles.filterIcon}
                />
              </TouchableOpacity>
            </View>
            {displayedLeads?.length > 0 ? (
              <FlatList
                data={displayedLeads}
                keyExtractor={item => item?._id.toString()}
                renderItem={({ item }) => <LeadItem lead={item} />}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.5}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={21}
                removeClippedSubviews={true}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                style={styles.listContainer}
              />
            ) : (
              <View
                style={{
                  marginTop: 200,
                }}
              >
                <Text
                  style={{
                    color: '#b1b1b1',
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    textAlign: 'center',
                  }}
                >
                  No leads found
                </Text>
              </View>
            )}
          </View>

          <Modal
            transparent={true}
            visible={isFilterPopupVisible}
            animationType="fade"
            onRequestClose={() => setFilterPopupVisible(false)}
          >
            <View style={styles.popupOverlay}>
              <View style={styles.popupContainer}>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>Filter</Text>
                  <TouchableOpacity
                    onPress={() => setFilterPopupVisible(false)}
                  >
                    <Text style={styles.popupClose}>×</Text>
                  </TouchableOpacity>
                </View>
                {vendorDataContext.vendor?.serviceType === 'deep cleaning' ? (
                  <>
                    {/* <Text style={styles.sectionHeading}>Deep Cleaning</Text> */}
                    <View style={styles.popupOptions}>
                      {[
                        'Customer Unreachable',
                        'Customer Cancelled',
                        'Project Completed',
                      ].map((option, index) => (
                        <TouchableOpacity
                          key={`deep-${index}`}
                          style={styles.popupOption}
                          onPress={() => handleFilterSelect(option)}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              selectedStatus === option &&
                              styles.radioCircleSelected,
                            ]}
                          >
                            {selectedStatus === option && (
                              <View style={styles.radioCircleInner} />
                            )}
                          </View>
                          <Text style={styles.popupOptionText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    {/* <Text style={styles.sectionHeading}>House Painting</Text> */}
                    <View style={styles.popupOptions}>
                      {[
                        'Negotiation',
                        'Confirmed', // Pending Hiring
                        'Hired',
                        'Project Ongoing',
                        'Customer Cancelled',
                      ].map((option, index) => (
                        <TouchableOpacity
                          key={`house-${index}`}
                          style={styles.popupOption}
                          onPress={() => handleFilterSelect(option)}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              selectedStatus === option &&
                              styles.radioCircleSelected,
                            ]}
                          >
                            {selectedStatus === option && (
                              <View style={styles.radioCircleInner} />
                            )}
                          </View>
                          <Text style={styles.popupOptionText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
                {/* <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                > */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStatus(null);
                    setFilterPopupVisible(false);
                  }}
                  style={{
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      color: '#ED1F24',
                      textAlign: 'center',
                    }}
                  >
                    Clear Filter
                  </Text>
                </TouchableOpacity>
                {/* </View> */}
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  // safeArea: { flex: 1, backgroundColor: '#F6F6F6' },
  container: { padding: 15 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#000000',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E9E9E9',
    justifyContent: 'space-between',
    borderRadius: 10,
    flex: 1,
    padding: 3,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    color: '#A3A7AA',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  activeTab: { backgroundColor: '#fff' },
  activeTabText: {
    color: '#ED1F24',
    fontFamily: 'Poppins-SemiBold',
  },
  filterBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterIcon: {
    width: 16,
    height: 16,
    tintColor: '#888',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    padding: 20,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  popupTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  popupClose: {
    fontSize: 24,
    color: '#000',
  },
  sectionHeading: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#ED1F24',
    marginBottom: 8,
  },
  popupOptions: {
    flexDirection: 'column',
  },
  popupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#888',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#ED1F24',
  },
  listContainer: {
    paddingTop: 10,
    marginBottom: 200,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ED1F24',
  },
  popupOptionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  leads: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    marginVertical: 10,
    color: '#6B6B6B',
  },
  noLeadsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  cardRightTime: {
    alignItems: 'flex-end',
  },
  cardDay: {
    color: '#818181',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  cardTime: {
    alignSelf: 'flex-end',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: 'black',
  },
  cardBody: {
    flexDirection: 'row',
    marginVertical: 5,
    // alignItems: 'center',
  },
  cardIcon: {
    width: 20,
    height: 15,
    marginRight: 5,
  },
  cardText: {
    color: '#575757',
    fontSize: 13,
    flex: 1,
    fontFamily: 'Poppins-Regular',
    marginLeft: 5,
  },
  statusBadge: {
    backgroundColor: '#FEE9EA',
    paddingRight: 220,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    color: '#ED1F24',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    paddingLeft: 10,
  },
  housePaintingText: {
    color: '#ED1F24',
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  deepCleaningText: {
    color: '#ED1F24',
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default OngoingLeadsScreen;
