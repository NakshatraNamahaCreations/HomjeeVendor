import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { useVendorContext } from '../Utilities/VendorContext';
import { getRequest } from '../ApiService/apiHelper';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import PageLoader from '../components/PageLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';
import { useLeadContext } from '../Utilities/LeadContext';
import IsEnabled3HoursBeforeSlot from '../Utilities/IsEnabled3HoursBeforeSlot';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePerformance } from '../Utilities/PerformanceContext';

const Leadone = () => {
  const deviceHeight = useWindowDimensions().height;
  const { buyCoinsEnabled, isPerformanceLow } = usePerformance();
  // console.log('deviceHeight', deviceHeight);
  const { setLeadDataContext } = useLeadContext();
  const { deviceTheme } = useThemeColor();
  const navigation = useNavigation();
  const { vendorDataContext } = useVendorContext();
  const vendorId = vendorDataContext?._id;
  const lat = vendorDataContext?.address?.latitude || null;
  const long = vendorDataContext?.address?.longitude || null;

  // console.log('vendorDataContext', vendorDataContext);
  console.log(' buyCoinsEnabled', buyCoinsEnabled, 'isPerformanceLow', isPerformanceLow);


  const vendorType = vendorDataContext.vendor?.serviceType;
  // console.log('vendorType', vendorType);

  const VENDOR_SERVICE_TYPE =
    vendorType === 'house-painter' || vendorType === 'House Painting'
      ? API_ENDPOINTS.GET_NEARBY_BOOKING_HOUSE_PAINTER
      : API_ENDPOINTS.GET_NEARBY_BOOKING_DEEP_CLEANING;

  const [nearByBookings, setNearByBookigs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // console.log('nearByBookings', nearByBookings);

  const fetchNearbyBookings = useCallback(
    async signal => {
      setError(null);
      if (!refreshing) setLoading(true);
      try {
        const response = await getRequest(
          `${VENDOR_SERVICE_TYPE}${lat}/${long}`,
          signal ? { signal } : undefined,
        );
        const decideToShowRes = isPerformanceLow ? [] : response.bookings
        setNearByBookigs(decideToShowRes);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          // console.error('Error fetching bookings:', err);
        }
      } finally {
        if (!refreshing) setLoading(false);
      }
    },
    [lat, long, refreshing],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchNearbyBookings(controller.signal).finally(() => setLoading(false));
    return () => controller.abort();
  }, [vendorId, lat, long, fetchNearbyBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNearbyBookings();
    setRefreshing(false);
  }, [fetchNearbyBookings]);

  const routeNavigation = lead => {
    setLeadDataContext(lead);
    navigation.navigate('LeadDetails', {
      leadId: lead._id,
    });
  };

  const LeadItem = React.memo(({ lead }) => {
    const enableUI = IsEnabled3HoursBeforeSlot(
      lead.selectedSlot?.slotDate,
      lead.selectedSlot?.slotTime,
    );
    return (
      <TouchableOpacity
        onPress={() => routeNavigation(lead)}
        style={styles.mainleadone}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* <Text
          style={{
            color: '#ED1F24',
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
          }}
        >
          {lead?.service[0]?.category}
        </Text> */}
          {/* <Text
          style={{
            color: '#ED1F24',
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
          }}
        >
          {' '}
          •{' '}
        </Text>
        <Text
          style={{
            color: '#ED1F24',
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
          }}
        >
          {lead?.bookingDetails?.status}
        </Text> */}
        </View>
        <View style={styles.leadone}>
          <Text style={styles.titles}>{lead.customer?.name}</Text>
          <Text
            style={{
              // marginLeft: -40,
              fontSize: 14,
              fontFamily: 'Poppins-Regular',
              color: '#818181',
            }}
          >
            {moment(lead.selectedSlot?.slotDate).format('ll')}
          </Text>
        </View>
        <Text
          style={{
            alignSelf: 'flex-end',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 14,
            color: 'black',
          }}
        >
          {lead.selectedSlot?.slotTime}
        </Text>

        <View style={styles.cardBody}>
          <Ionicons name="location" color="red" size={17} />
          <Text style={styles.cardText} numberOfLines={2}>
            {/* {enableUI && lead?.address.houseFlatNumber + ','} */}
            {lead?.address.streetArea}
          </Text>
        </View>

        {/* <View style={styles.location}>
          <Image
            style={styles.locationicon}
            source={require('../assets/icons/location.png')}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 13,
              color: '#575757',
              fontFamily: 'Poppins-Regular',
            }}
            numberOfLines={2}
          >
            {lead.address?.houseFlatNumber},{lead.address?.streetArea}
          </Text>
        </View> */}
      </TouchableOpacity>
    );
  });

  // console.log('error', error);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      <Header />
      {/* <View style={{ padding: 15 }}> */}
      <View style={{ padding: 15 }}>
        <Text style={styles.title}>Discover today’s new leads!</Text>
        <View style={styles.headertwo}>
          <Image
            style={styles.iconsnewlead}
            source={require('../assets/icons/Icon.png')}
            resizeMode="contain"
          />
          <Text style={[styles.titles]}>New Leads</Text>
          <View style={styles.notificationWrapper}></View>
        </View>
        <Text style={styles.newleads}>
          {nearByBookings?.length > 0
            ? nearByBookings?.length + ' New Leads Found'
            : 'No New Leads Found'}
        </Text>
      </View>

      {/* <View style={styles.discoverleads}> */}
      {nearByBookings?.length > 0 ? (
        <FlatList
          data={nearByBookings}
          keyExtractor={item => item._id.toString()}
          renderItem={({ item }) => <LeadItem lead={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
      {/* </View> */}
      {/* </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#F6F6F6',
  },
  // discoverleads: {
  //   margin: 10,
  //   flex: 1,
  // },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  notificationWrapper: {
    position: 'relative',
  },
  iconsnewlead: {
    marginRight: 10,
  },
  title: {
    fontSize: 12,
    color: '#434343',
    fontFamily: 'Poppins-Regular',
  },
  titles: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  headertwo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBody: {
    flexDirection: 'row',
    marginVertical: 5,
    // alignItems: 'center',
  },
  cardText: {
    color: '#575757',
    fontSize: 13,
    flex: 1,
    fontFamily: 'Poppins-Regular',
    marginLeft: 5,
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
    alignItems: 'center',
  },
  location: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    padding: 5,
    alignItems: 'center',
  },
  mainleadone: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    marginTop: 10,
    borderRadius: 5,
    marginHorizontal: 15,
  },
  mainleadtwo: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    // top: 40,
    borderRadius: 10,
  },
  mainleadthree: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    // top: 60,
    borderRadius: 10,
  },
  mainleadfour: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    // top: 80,
    borderRadius: 10,
  },
  mainleadfive: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    // top: 100,
    borderRadius: 10,
    marginBottom: 80,
  },
});

export default Leadone;
