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

        {/* Response and Cancellation */}
        <View style={styles.statusRow}>
          <View style={styles.cardBox}>
            <AnimatedCircularProgress
              size={70}
              width={10}
              fill={
                serviceType === 'house-painter'
                  ? performanceData
                    ? performanceData.surveyRate
                    : 0
                  : performanceData
                    ? performanceData.responseRate
                    : 0
              }
              arcSweepAngle={180}
              rotation={-90}
              tintColor="green"
              backgroundColor="#c8e6c9"
            >
              {() => (
                <Text style={styles.percentText}>
                  {serviceType === 'house-painter'
                    ? performanceData
                      ? `${performanceData.surveyRate}%`
                      : '0%'
                    : performanceData
                      ? `${performanceData.responseRate}%`
                      : '0%'}
                </Text>
              )}
            </AnimatedCircularProgress>
            <View style={[styles.cardFooter, { backgroundColor: '#a5d6a7' }]}>
              <Text style={styles.cardFooterText}>
                {serviceType === 'house-painter'
                  ? `Survey (${performanceData ? performanceData.surveyLeads : 0
                  })`
                  : `Response (${performanceData ? performanceData.respondedLeads : 0
                  })`}
              </Text>
            </View>
          </View>

          <View style={styles.cardBox}>
            <AnimatedCircularProgress
              size={70}
              width={10}
              fill={
                serviceType === 'house-painter'
                  ? performanceData
                    ? performanceData.hiringRate
                    : 0
                  : performanceData
                    ? performanceData.cancellationRate
                    : 0
              }
              arcSweepAngle={180}
              rotation={-90}
              tintColor="orange"
              backgroundColor="#ffe0b2"
            >
              {() => (
                <Text style={[styles.percentText, { color: 'orange' }]}>
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
            <View style={[styles.cardFooter, { backgroundColor: '#ffe082' }]}>
              <Text style={[styles.cardFooterText, { color: '#ff9800' }]}>
                {serviceType === 'house-painter'
                  ? `Hiring (${performanceData ? performanceData.hiredLeads : 0})`
                  : `Cancellation (${performanceData ? performanceData.cancelledLeads : 0})`}
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
              tintColor="#0F6A97"
              backgroundColor="#a8d0e6"
              lineCap="line"
            >
              {() => (
                <Text style={styles.gsvValue}>
                  {' '}
                  ₹{' '}
                  {performanceData
                    ? performanceData.averageGsv.toFixed(0)
                    : '0'}
                </Text>
              )}
            </AnimatedCircularProgress>
          </View>
          <View style={styles.averageBox}>
            <Text style={styles.averageText}>Average GSV</Text>
          </View>
        </View>
        {/* Ratings & Strikes */}
        <View style={styles.ratingRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: '#ffc107', marginTop: 30 },
            ]}
          >
            <Text style={styles.badgeText}>Rating :  {performanceData ? performanceData.averageRating : 0}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: '#2e7d32', marginTop: 30 },
            ]}
          >
            <Text style={styles.badgeText}>Strikes : {performanceData ? performanceData.strikes : 0}</Text>
          </View>
        </View>

        {/* Total Leads */}
        <View style={styles.totalLeadsBox}>
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
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
    color: 'green',
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
    color: 'green',
  },
  meterWrapper: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  gsvValue: {
    fontSize: 18,
    color: '#0F6A97',
    position: 'absolute',
    fontFamily: 'Poppins-Bold',
    top: 35,
  },
  averageBox: {
    backgroundColor: '#9FC3D5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
    marginTop: -60,
  },
  averageText: {
    color: '#0F6A97',
    fontFamily: 'Poppins-Bold',
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
