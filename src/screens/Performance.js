import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Header from '../components/Header';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';
import { useVendorContext } from '../Utilities/VendorContext';
import axios from 'axios';
import PageLoader from '../components/PageLoader';

const Performance = () => {
  const { vendorDataContext } = useVendorContext();
  const [activeTab, setActiveTab] = useState('last');
  const [performanceData, setPerformanceData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const vendorLat = vendorDataContext.address.latitude;
  const vendorLong = vendorDataContext.address.longitude;
  const vendorId = vendorDataContext?._id;

  const serviceType = vendorDataContext.vendor?.serviceType;
  console.log('serviceType', serviceType);
  // deep cleaning
  const METRICS_ENDPOINT =
    serviceType === 'house-painter'
      ? API_ENDPOINTS.HOUSE_PAINTING_PERFORMANCE_METRICS
      : API_ENDPOINTS.DEEP_CLEANING_PERFORMANCE_METRICS;

  const renamedServiceType = serviceType === 'house-painter' ? "house_painting" : "deep_cleaning"

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}${METRICS_ENDPOINT}${vendorId}/${vendorLat}/${vendorLong}/${activeTab}`,
        );
        console.log("performance API Url:", `${API_BASE_URL}${METRICS_ENDPOINT}${vendorId}/${vendorLat}/${vendorLong}/${activeTab}`)
        setPerformanceData(response.data);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [activeTab, vendorLat, vendorLong]);

  useEffect(() => {
    const fetchKPIParameters = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.KPI_PARAMETERS}${renamedServiceType}`,
        );
        // console.log("fetch KPI Parameters data:", `${API_BASE_URL}${API_ENDPOINTS.KPI_PARAMETERS}${renamedServiceType}`,)
        setKpiData(response.data.data.ranges);
      } catch (error) {
        console.error('Failed to fetch KPI Parameters data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIParameters();
  }, []);

  // console.log('performanceData', performanceData);
  console.log('kpiData', kpiData);

  const getKpiColor = (value, ranges, options = { positive: true }) => {
    if (!ranges) return '#6c757d';

    const a = ranges.a ?? 0;
    const b = ranges.b ?? 0;
    const c = ranges.c ?? 0;
    const d = ranges.d ?? 0;

    // your range logic
    const red = '#df2020';
    const orange = '#ff8c00';
    const yellow = '#fcce00ff';
    const green = '#198754';

    // higher is better (response, hiring, gsv, rating)
    if (options.positive) {
      if (value >= a && value < b) return red;
      if (value >= b && value < c) return orange;
      if (value >= c && value < d) return yellow;
      if (value >= d) return green;
    } else {
      // lower is better (cancellation, strikes)
      if (value >= a && value < b) return green;
      if (value >= b && value < c) return yellow;
      if (value >= c && value < d) return orange;
      if (value >= d) return red;
    }

    return '#6c757d';
  };

  const getPositiveKpiColor = (value, ranges) => {
    if (!ranges) return '#6c757d'; // default grey

    const a = ranges.a ?? 0;
    const b = ranges.b ?? 0;
    const c = ranges.c ?? 0;
    const d = ranges.d ?? 0;

    if (value >= a && value < b) return '#df2020'; // Red
    if (value >= b && value < c) return '#ff8c00'; // Orange
    if (value >= c && value < d) return '#fcce00ff'; // Yellow
    if (value >= d) return '#198754';              // Green

    return '#6c757d'; // fallback
  };

  const getNegativeKpiColor = (value, ranges) => {
    if (!ranges) return '#6c757d';

    const a = ranges.a ?? 0;
    const b = ranges.b ?? 0;
    const c = ranges.c ?? 0;
    const d = ranges.d ?? 0;

    if (value >= a && value < b) return '#198754'; // best = Green
    if (value >= b && value < c) return '#fcce00ff'; // Yellow
    if (value >= c && value < d) return '#ff8c00'; // Orange
    if (value >= d) return '#df2020';              // worst = Red

    return '#6c757d';
  };

  const responseValue =
    serviceType === 'house-painter'
      ? performanceData?.surveyRate || 0
      : performanceData?.responseRate || 0;


  const responseColor = getKpiColor(
    responseValue,
    serviceType === 'house-painter'
      ? kpiData?.surveyPercentage
      : kpiData?.responsePercentage,
    { positive: true }
  );

  const secondValue =
    serviceType === 'house-painter'
      ? performanceData?.hiringRate || 0
      : performanceData?.cancellationRate || 0;

  const secondColor = getKpiColor(
    secondValue,
    serviceType === 'house-painter'
      ? kpiData?.hiringPercentage
      : kpiData?.cancellationPercentage,
    { positive: serviceType === 'house-painter' } // hiring = positive, cancel = negative
  );

  // GSV (higher is better)
  const gsvValue = performanceData?.averageGsv || 0;
  const gsvColor = getKpiColor(gsvValue, kpiData?.avgGSV, { positive: true });

  // Rating (higher is better)
  const ratingValue = performanceData?.averageRating || 0;
  const ratingColor = getKpiColor(ratingValue, kpiData?.rating, { positive: true });

  // Strikes (lower is better)
  const strikesValue = performanceData?.strikes || 0;
  const strikesColor = getKpiColor(strikesValue, kpiData?.strikes, { positive: false });

  // Total Leads – if you have ranges in KPI, use them, else pick a fixed color
  const leadsValue = performanceData?.totalLeads || 0;
  const leadsColor = kpiData?.totalLeads
    ? getKpiColor(leadsValue, kpiData.totalLeads, { positive: true })
    : '#0F6A97';

  const cancellationColor = getNegativeKpiColor(
    performanceData?.cancellationRate || 0,
    kpiData?.cancellationPercentage
  );

  const hiringColor = getPositiveKpiColor(
    performanceData?.hiringRate || 0,
    kpiData?.hiringPercentage
  );


  return (
    <View style={styles.container}>
      {loading && <PageLoader />}
      <Header />
      <Text style={styles.title}>Performance Dashboard</Text>

      {/* Tabs */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'last' && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab('last')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'last' && styles.activeTabText,
              ]}
            >
              Last {performanceData ? performanceData.totalLeads : 0} Leads
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'month' && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab('month')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'month' && styles.activeTabText,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Response */}
        <View style={styles.statusRow}>
          <View style={styles.cardBox}>
            <AnimatedCircularProgress
              size={70}
              width={10}
              fill={responseValue}
              arcSweepAngle={180}
              rotation={-90}
              tintColor={responseColor}
              backgroundColor="#e2e2e2ff"
            >
              {() => (
                <Text style={[styles.percentText, { color: responseColor }]}>
                  {serviceType === 'house-painter'
                    ? `${performanceData?.surveyRate ?? 0}%`
                    : `${performanceData?.responseRate ?? 0}%`}
                </Text>
              )}
            </AnimatedCircularProgress>
            <View style={[styles.cardFooter, { backgroundColor: responseColor }]}>
              <Text style={styles.cardFooterText}>
                {serviceType === 'house-painter'
                  ? `Survey (${performanceData?.surveyLeads ?? 0})`
                  : `Response (${performanceData?.respondedLeads ?? 0})`}
              </Text>
            </View>
          </View>
          {/* cancel for dp and hiring for hp */}
          <View style={styles.cardBox}>
            <AnimatedCircularProgress
              size={70}
              width={10}
              fill={secondValue}
              arcSweepAngle={180}
              rotation={-90}
              tintColor={serviceType === 'house-painter' ? hiringColor : cancellationColor}
              backgroundColor="#e2e2e2ff"
            >
              {() => (
                <Text style={[styles.percentText, { color: serviceType === 'house-painter' ? hiringColor : cancellationColor }]}>
                  {serviceType === 'house-painter'
                    ? performanceData
                      ? `${performanceData.hiringRate}%`
                      : '0%'
                    : performanceData
                      ? `${performanceData.cancellationRate}%`
                      : '0%'}
                </Text>
              )}
            </AnimatedCircularProgress>
            <View style={[styles.cardFooter, { backgroundColor: secondColor }]}>
              <Text style={styles.cardFooterText}>
                {serviceType === 'house-painter'
                  ? `Hiring (${performanceData?.hiredLeads ?? 0})`
                  : `Cancellation (${performanceData?.cancelledLeads ?? 0})`}
              </Text>
            </View>
          </View>
        </View>

        {/* GSV Semi-Circle */}
        <View
          style={{
            backgroundColor: 'white',
            margin: 10,
            borderRadius: 10,
          }}
        >
          <View style={styles.meterWrapper}>
            <AnimatedCircularProgress
              size={180}
              width={35}
              fill={70}
              arcSweepAngle={180}
              rotation={-90}
              tintColor={gsvColor}
              // tintColor="#0F6A97"
              backgroundColor="#e2e2e2ff"
              lineCap="line"
            >
              {() => (
                <Text style={[styles.gsvValue, { color: gsvColor }]}>
                  {' '}
                  ₹{' '}
                  {performanceData ? performanceData.averageGsv.toFixed(0) : '0'}
                </Text>
              )}
            </AnimatedCircularProgress>
          </View>
          <View style={[styles.averageBox, { backgroundColor: gsvColor }]}>
            <Text style={styles.averageText}>Average GSV</Text>
          </View>
        </View>
        {/* Ratings & Strikes */}
        <View style={styles.ratingRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: ratingColor, marginTop: 30 },
            ]}
          >
            <Text style={styles.badgeText}>Rating :  {performanceData ? performanceData.averageRating : 0}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: strikesColor, marginTop: 30 },
            ]}
          >
            <Text style={styles.badgeText}>Strikes :  {performanceData ? performanceData.strikes : 0}</Text>
          </View>
        </View>

        {/* Total Leads */}
        <View style={[styles.totalLeadsBox, { backgroundColor: leadsColor }]}>
          <Text style={styles.totalLeadsText}>
            Total Leads : {performanceData ? performanceData.totalLeads : 0}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Performance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    // marginBottom: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 30,
  },
  notificationWrappertwo: {
    borderRadius: 28,
    borderWidth: 1,
    width: '22%',
    paddingHorizontal: 35,
    paddingVertical: 5,
    marginLeft: 100,
  },
  badgetwo: {
    position: 'absolute',
    left: 40,
    top: 5,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeTexttwo: {
    color: '#ED1F24',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  title: {
    margin: 20,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9E9E9',
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 15,
    padding: 5,
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTabItem: {
    backgroundColor: '#fff',
    shadowColor: '#ccc',
    shadowOpacity: 0.3,
  },
  tabText: {
    color: '#A3A7AA',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  activeTabText: {
    color: '#ED1F24',
    fontFamily: 'Poppins-SemiBold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardBox: {
    backgroundColor: '#fff',
    width: '45%',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  percentText: {
    fontSize: 10, fontFamily: 'Poppins-Bold',
  },
  cardFooter: {
    width: '100%',
    paddingVertical: 6,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  cardFooterText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: "white"
  },
  meterWrapper: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  gsvValue: {
    fontSize: 18,
    // color: '#0F6A97',
    // position: 'absolute',
    fontFamily: 'Poppins-Bold',
    // top: 35,
  },
  averageBox: {
    // backgroundColor: '#9FC3D5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
    marginTop: -60,
  },
  averageText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  badge: {
    flex: 0.48,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    // fontSize: 12,
  },
  totalLeadsBox: {
    backgroundColor: '#0F6A97',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  totalLeadsText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
});
