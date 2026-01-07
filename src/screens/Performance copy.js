import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColor } from '../Utilities/ThemeContext';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';
import { useVendorContext } from '../Utilities/VendorContext';

const Performance = () => {
  const { deviceTheme } = useThemeColor();
  const TABS = ['last', 'month'];
  const { vendorDataContext } = useVendorContext();
  const sellerId = vendorDataContext?._id;
  const [activeTab, setActiveTab] = useState('last');
  const [totalLeads, setTotalLeads] = useState(null);
  const [responsePct, setResponsePct] = useState(null);
  const [responseCount, setResponseCount] = useState(null);
  const [cancelPct, setCancelPct] = useState(null);
  const [cancelCount, setCancelCount] = useState(null);
  const [avgGsv, setAvgGsv] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [strikeCount, setStrikeCount] = useState(null);

  useEffect(() => {
    if (!sellerId) return;

    const scope = activeTab === 'last' ? 'last' : 'month';
    const qs = scope === 'last' ? `scope=last&lastDays=30` : `scope=month`;
    const url = `${API_BASE_URL}${API_ENDPOINTS.GET_VENDOR_DEEP_CLEANING_PERFORMANCE_RECORD}?vendorId=${sellerId}&${qs}`;

    fetch(url)
      .then(r => r.json())
      .then(
        ({
          totalLeads,
          response,
          cancellation,
          averageGsv,
          rating,
          strikes,
        }) => {
          setTotalLeads(totalLeads ?? 0);
          setResponsePct(response?.percent ?? 0);
          setResponseCount(response?.count ?? 0);
          setCancelPct(cancellation?.percent ?? 0);
          setCancelCount(cancellation?.count ?? 0);
          setAvgGsv(averageGsv ?? 0);
          setAvgRating(rating?.average ?? null); // might be null if backend not sending
          setStrikeCount(strikes ?? null); // might be null if backend not sending
        },
      )
      .catch(console.error);
  }, [activeTab, sellerId]);

  const clamp0to100 = v => Math.max(0, Math.min(100, Number(v) || 0));
  const inr = n => `₹ ${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

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

  return (
    <GestureDetector gesture={swipeGesture}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <Header />
        <Text style={styles.title}>Performance Dashboard</Text>
        <ScrollView
        // showsVerticalScrollIndicator={false}
        >
          <View style={styles.tabContainer}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.activeTabItem,
                ]}
                onPress={() => setActiveTab(tab)}
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

          <View style={styles.statusRow}>
            <View style={styles.cardBox}>
              <AnimatedCircularProgress
                size={50}
                width={10}
                fill={clamp0to100(responsePct)}
                arcSweepAngle={180}
                rotation={-90}
                tintColor="green"
                backgroundColor="#c8e6c9"
              >
                {() => (
                  <Text style={styles.percentText}>
                    {Math.round(responsePct ?? 0)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
              <View style={[styles.cardFooter, { backgroundColor: '#a5d6a7' }]}>
                <Text style={styles.cardFooterText}>
                  Response ({responseCount ?? 0})
                </Text>
              </View>
            </View>

            <View style={styles.cardBox}>
              <AnimatedCircularProgress
                size={50}
                width={10}
                fill={clamp0to100(cancelPct)}
                arcSweepAngle={180}
                rotation={-90}
                tintColor="orange"
                backgroundColor="#ffe0b2"
              >
                {() => (
                  <Text style={[styles.percentText, { color: 'orange' }]}>
                    {Math.round(cancelPct ?? 0)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
              <View style={[styles.cardFooter, { backgroundColor: '#ffe082' }]}>
                <Text style={[styles.cardFooterText, { color: '#ff9800' }]}>
                  Cancellation ({cancelCount ?? 0})
                </Text>
              </View>
            </View>
          </View>

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
                fill={clamp0to100(responsePct)}
                arcSweepAngle={180}
                rotation={-90}
                tintColor="#0F6A97"
                backgroundColor="#a8d0e6"
                lineCap="line"
              >
                {() => <Text style={styles.gsvValue}>{inr(avgGsv)}</Text>}
              </AnimatedCircularProgress>
            </View>
            <View style={styles.averageBox}>
              <Text style={styles.averageText}>Average GSV</Text>
            </View>
          </View>
          {/* <View style={styles.ratingRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: '#ffc107', marginTop: 30 },
              ]}
            >
              <Text style={styles.badgeText}>Rating : 4.8/5</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: '#2e7d32', marginTop: 30 },
              ]}
            >
              <Text style={styles.badgeText}>Strikes : 0/3</Text>
            </View>
          </View> */}
          {avgRating != null && strikeCount != null && (
            <View style={styles.ratingRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: '#ffc107', marginTop: 30 },
                ]}
              >
                <Text style={styles.badgeText}>Rating : {avgRating}/5</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: '#2e7d32', marginTop: 30 },
                ]}
              >
                <Text style={styles.badgeText}>Strikes : {strikeCount}/3</Text>
              </View>
            </View>
          )}
          <View style={styles.totalLeadsBox}>
            <Text style={styles.totalLeadsText}>
              Total Leads : {totalLeads ?? 0}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureDetector>
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
    fontWeight: 'bold',
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
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Bold',
  },
});

// vendor_house painintg_performance_response
// {
//     "surveyRate": 23.53,
//     "hiringRate": 23.53,
//     "averageGsv": 8857.29,
//     "totalLeads": 17,
//     "surveyLeads": 4,
//     "hiredLeads": 4,
//     "timeframe": "last"
// }

// vendor_deep_cleaning_performance_response
// {
//     "responseRate": 27.27,
//     "cancellationRate": 33.33,
//     "averageGsv": 6716.36,
//     "totalLeads": 11,
//     "respondedLeads": 3,
//     "cancelledLeads": 1,
//     "timeframe": "last"
// }