import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  BackHandler,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { useLeadContext } from '../../Utilities/LeadContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Entypo from 'react-native-vector-icons/Entypo';
import { getRequest } from '../../ApiService/apiHelper';
import { API_ENDPOINTS } from '../../ApiService/apiConstants';
import PageLoader from '../../components/PageLoader';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../Utilities/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoomNameContext } from '../../Utilities/RoomContext';

const StartMeasurement = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { deviceTheme } = useThemeColor();
  const { leadDataContext } = useLeadContext();
  const leadId = leadDataContext._id;
  const [activeTab, setActiveTab] = useState('Interior');
  const [roomData, setRoomData] = useState({});
  const [customRooms, setCustomRooms] = useState([]);
  const [customRoomsByTab, setCustomRoomsByTab] = useState({
    Interior: [],
    Exterior: [],
    Others: [],
  });
  const { setNameOfTheRoom } = useRoomNameContext();
  const [loading, setLoading] = useState(false);
  const [estimateData, setEstimateData] = useEstimateContext();
  const roomsData = estimateData?.rooms ?? {};

  const TABS = ['Interior', 'Exterior', 'Others'];
  const tabsData = {
    Interior: [
      'Entrance Passage',
      'Living Room',
      'Kitchen',
      'Passage',
      'Bedroom 1',
      'Washroom 1',
      'Bedroom 2',
      'Washroom 2',
    ],
    Exterior: ['Balcony', 'Dry Balcony', 'Bedroom Balcony'],
    Others: ['Doors', 'Grills'],
  };

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      // 1) Room data hydration you already have:
      if (route.params?.roomName && route.params?.data) {
        setRoomData(prev => ({
          ...prev,
          [route.params.roomName]: route.params.data,
        }));
      }
      // 2) Handle rename of custom rooms so the list shows the new name
      const rn = route.params?.rename;
      if (rn?.tab && rn?.from && rn?.to && rn.from !== rn.to) {
        setCustomRoomsByTab(prev => {
          const arr = prev[rn.tab] || [];
          const idx = arr.indexOf(rn.from);
          let nextArr = arr;
          if (idx >= 0) {
            nextArr = [...arr.slice(0, idx), rn.to, ...arr.slice(idx + 1)];
          } else if (!arr.includes(rn.to)) {
            // If it wasn't in the list for some reason, add the new name
            nextArr = [...arr, rn.to];
          }
          return { ...prev, [rn.tab]: nextArr };
        });
        // clear the param so it won't run again
        navigation.setParams({ rename: undefined });
      }
    }, [route.params]),
  );

  //   const byTab = { Interior: [], Exterior: [], Others: [] };
  // Object.entries(response?.rooms || {}).forEach(([name, room]) => {
  //   const sec = (room?.sectionType || '').trim();
  //   // Only treat as "custom" if it's not one of your fixed names
  //   if (!tabsData[sec]?.includes(name)) byTab[sec]?.push(name);
  // });
  // setCustomRoomsByTab(byTab);

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

  const calculateSummary = (roomsObj = {}) => {
    let interior = 0,
      exterior = 0,
      others = 0;

    for (const [, room] of Object.entries(roomsObj)) {
      const section = (room?.sectionType || '').trim();
      const total =
        (room.ceilings || []).reduce((s, x) => s + netOf(x), 0) +
        (room.walls || []).reduce((s, x) => s + netOf(x), 0) +
        (room.measurements || []).reduce((s, x) => s + netOf(x), 0);

      if (total <= 0) continue;

      if (section === 'Interior') interior += total;
      else if (section === 'Exterior') exterior += total;
      else others += total;
    }

    return {
      interior: +interior.toFixed(2),
      exterior: +exterior.toFixed(2),
      others: +others.toFixed(2),
      total: +(interior + exterior + others).toFixed(2),
    };
  };

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
        const byTab = { Interior: [], Exterior: [], Others: [] };
        const fixed = tabsData; // your base names
        Object.entries(response?.rooms || {}).forEach(([name, room]) => {
          const sec = (room?.sectionType || '').trim();
          if (!fixed[sec]?.includes(name)) {
            byTab[sec]?.push(name);
          }
        });
        setCustomRoomsByTab(byTab);
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

  const NAME_SECTION = useMemo(() => {
    const m = new Map();
    Object.entries(tabsData).forEach(([sec, arr]) =>
      (arr || []).forEach(n => m.set(n, sec)),
    );
    Object.entries(customRoomsByTab).forEach(([sec, arr]) =>
      (arr || []).forEach(n => m.set(n, sec)),
    );
    return m;
  }, [tabsData, customRoomsByTab]);

  const addCustomRoom = tab => {
    const currentCustomRooms = customRoomsByTab?.[tab] || [];
    let nextNumber = 1;
    let newLabel = `Custom Room ${nextNumber}`;
    const existingRooms = [...(tabsData[tab] || []), ...currentCustomRooms];
    while (existingRooms.includes(newLabel)) {
      nextNumber++;
      newLabel = `Custom Room ${nextNumber}`;
    }
    setCustomRoomsByTab(prev => ({
      ...prev,
      [tab]: [...currentCustomRooms, newLabel],
    }));
  };

  const normalize = s => {
    const key = (s || '').toLowerCase();
    if (key === 'interior') return 'Interior';
    if (key === 'exterior') return 'Exterior';
    if (key === 'others' || key === 'other') return 'Others';
    return s;
  };

  const displayList = useMemo(() => {
    const tab = (activeTab || '').trim();

    const base = [
      ...(tabsData?.[tab] || []),
      ...(customRoomsByTab?.[tab] || []),
    ];

    if (!roomsData || typeof roomsData !== 'object') return base;

    const extras = Object.entries(roomsData)
      .filter(([name, room]) => {
        const belongsTo =
          normalize(room?.sectionType) || NAME_SECTION.get(name);
        if (belongsTo !== tab) return false;
        if (base.includes(name)) return false;

        if (tab === 'Interior') {
          return (
            (room?.ceilings?.length || 0) > 0 || (room?.walls?.length || 0) > 0
          );
        }
        return (
          (room?.measurements?.length || 0) > 0 ||
          +((room?.ceilings?.length || 0) > 0 || (room?.walls?.length || 0) > 0)
        );
      })
      .map(([name]) => name);

    return [...base, ...extras];
  }, [activeTab, tabsData, customRoomsByTab, roomsData, NAME_SECTION]);

  const toNum = v => +(`${v || 0}`.trim() || 0);
  const rectArea = (w, h) => +(toNum(w) * toNum(h)).toFixed(2);

  const netOf = x => toNum(x?.totalSqt ?? rectArea(x?.width, x?.height));
  const roomNetTotal = (room = {}) => {
    const c = (room.ceilings || []).reduce((s, it) => s + netOf(it), 0);
    const w = (room.walls || []).reduce((s, it) => s + netOf(it), 0);
    const m = (room.measurements || []).reduce((s, it) => s + netOf(it), 0);
    return +(c + w + m).toFixed(2);
  };

  const getCeilNet = c => toNum(c.totalSqt ?? netCeilingArea(c));
  const getWallNet = w => toNum(w.totalSqt ?? netWallArea(w));
  const getMeasNet = m => toNum(m.totalSqt ?? m.area);

  const openingsArea = (arr = []) =>
    arr.reduce((s, o) => s + toNum(o.area ?? rectArea(o.width, o.height)), 0);

  const netCeilingArea = c =>
    Math.max(
      rectArea(c.width, c.height) -
        openingsArea(c.windows) -
        openingsArea(c.doors) -
        openingsArea(c.cupboards),
      0,
    );

  const netWallArea = w =>
    Math.max(
      rectArea(w.width, w.height) -
        openingsArea(w.windows) -
        openingsArea(w.doors) -
        openingsArea(w.cupboards),
      0,
    );

  const netOtherArea = w =>
    Math.max(
      rectArea(w.width, w.height) -
        openingsArea(w.windows) -
        openingsArea(w.doors) -
        openingsArea(w.cupboards),
      0,
    );

  const sumAreas = (list = [], getAreaFn = x => toNum(x.totalSqt ?? x.area)) =>
    +list.reduce((s, it) => s + getAreaFn(it), 0).toFixed(2);

  const navigateToScreen = type => {
    setNameOfTheRoom(type);
    navigation.navigate('RoomMeasurementScreen', {
      type,
      activeTab,
    });
  };

  const handleContinue = () => {
    // Start from backend rooms
    const rawRooms = roomsData || {};

    // Drop rooms whose total net area is 0
    const filteredRooms = Object.fromEntries(
      Object.entries(rawRooms).filter(([, r]) => roomNetTotal(r) > 0),
    );

    const summary = calculateSummary(filteredRooms);
    const data = { category: 'House Painting' };

    navigation.navigate('Quotes', {
      lead: data,
      measurementSummary: summary,
      // Optional: pass filteredRooms if your Quotes screen can use it
      rooms: filteredRooms,
    });
  };

  console.log('etstimateData', estimateData);

  return (
    <GestureDetector gesture={swipeGesture}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar
          barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
        />

        {loading && <PageLoader />}
        <View style={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
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
        <ScrollView contentContainerStyle={{ padding: 16, marginBottom: 100 }}>
          {displayList.length === 0 ? (
            <Text style={{ color: 'black' }}>
              No items (should never see this)
            </Text>
          ) : (
            displayList.map(roomName => {
              const room = roomsData[roomName];
              const tab = (activeTab || '').trim();
              // const isInteriorLike = tab === 'Interior' || tab === 'Exterior';
              const isOthersRoomLike =
                tab === 'Others' &&
                room &&
                ((room?.ceilings?.length || 0) > 0 ||
                  (room?.walls?.length || 0) > 0);
              const isInteriorLike =
                tab === 'Interior' || tab === 'Exterior' || isOthersRoomLike;
              const repaintCeil = (room?.ceilings || []).filter(
                c => c.mode === 'REPAINT' && getCeilNet(c) > 0,
              );
              const freshCeil = (room?.ceilings || []).filter(
                c => c.mode === 'FRESH' && getCeilNet(c) > 0,
              );
              const repaintWall = (room?.walls || []).filter(
                w => w.mode === 'REPAINT' && getWallNet(w) > 0,
              );
              const freshWall = (room?.walls || []).filter(
                w => w.mode === 'FRESH' && getWallNet(w) > 0,
              );

              const hasRepaint = repaintCeil.length || repaintWall.length;
              const hasFresh = freshCeil.length || freshWall.length;
              const hasAny = hasRepaint || hasFresh;
              const hasBoth = hasRepaint && hasFresh;

              const posMeasurements = (room?.measurements || []).filter(
                m => getMeasNet(m) > 0,
              );

              return (
                <View key={roomName} style={styles.rowCard}>
                  <TouchableOpacity
                    style={styles.rowHeader}
                    onPress={() => navigateToScreen(roomName)}
                  >
                    <Text style={styles.listItemText}>{roomName}</Text>
                    <Entypo
                      name="chevron-with-circle-right"
                      size={18}
                      color="#FF0000"
                    />
                  </TouchableOpacity>

                  {room && (
                    <View style={{ marginTop: 10 }}>
                      {isInteriorLike &&
                        (hasAny ? (
                          <>
                            {hasRepaint && (
                              <>
                                <Text style={styles.modeText}>
                                  Repaint with primer
                                </Text>

                                {!!repaintCeil.length && (
                                  <View style={styles.kvRow}>
                                    <Text style={styles.kvLabel}>
                                      Ceilings ({repaintCeil.length})
                                    </Text>
                                    <Text style={styles.kvValue}>
                                      {sumAreas(repaintCeil, getCeilNet)} sq ft
                                    </Text>
                                  </View>
                                )}

                                {!!repaintWall.length && (
                                  <View style={styles.kvRow}>
                                    <Text style={styles.kvLabel}>
                                      Walls ({repaintWall.length})
                                    </Text>
                                    <Text style={styles.kvValue}>
                                      {sumAreas(repaintWall, getWallNet)} sq ft
                                    </Text>
                                  </View>
                                )}
                              </>
                            )}

                            {hasBoth && <View style={styles.underlineRed} />}

                            {hasFresh && (
                              <>
                                <Text style={styles.modeText}>Fresh Paint</Text>

                                {!!freshCeil.length && (
                                  <View style={styles.kvRow}>
                                    <Text style={styles.kvLabel}>
                                      Ceilings ({freshCeil.length})
                                    </Text>
                                    <Text style={styles.kvValue}>
                                      {sumAreas(freshCeil, getCeilNet)} sq ft
                                    </Text>
                                  </View>
                                )}

                                {!!freshWall.length && (
                                  <View style={styles.kvRow}>
                                    <Text style={styles.kvLabel}>
                                      Walls ({freshWall.length})
                                    </Text>
                                    <Text style={styles.kvValue}>
                                      {sumAreas(freshWall, getWallNet)} sq ft
                                    </Text>
                                  </View>
                                )}
                              </>
                            )}

                            {!hasBoth && hasAny && (
                              <View style={styles.underlineRed} />
                            )}
                          </>
                        ) : (
                          // legacy fallback for Exterior: if no ceilings/walls but measurements exist
                          !!posMeasurements.length && (
                            <View style={styles.kvRow}>
                              <Text style={styles.kvLabel}>
                                {roomName} ({posMeasurements.length})
                              </Text>
                              <Text style={styles.kvValue}>
                                {sumAreas(posMeasurements, getMeasNet)} sq ft
                              </Text>
                            </View>
                          )
                        ))}

                      {!isInteriorLike && !!posMeasurements.length && (
                        <View style={styles.kvRow}>
                          <Text style={styles.kvLabel}>
                            {roomName} ({posMeasurements.length})
                          </Text>
                          <Text style={styles.kvValue}>
                            {sumAreas(posMeasurements, getMeasNet)} sq ft
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={[styles.rowCard, { marginBottom: 150 }]}>
            <TouchableOpacity
              onPress={() => addCustomRoom(activeTab)}
              style={styles.rowHeader}
            >
              <Text style={styles.listItemText}>
                Add Custom {activeTab} Room
              </Text>
              <Ionicons name="add-circle" size={25} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            Object.keys(roomsData || {}).length === 0 && styles.disabledButton,
          ]}
          onPress={
            Object.keys(roomsData || {}).length > 0 ? handleContinue : null
          }
          disabled={Object.keys(roomsData || {}).length === 0}
        >
          <Text
            style={[
              styles.continueButtonText,
              Object.keys(roomsData || {}).length === 0 &&
                styles.disabledButtonText,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    marginBottom: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginLeft: 20,
    marginTop: 10,
  },
  headerText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
    color: '#000',
  },
  tabsContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: '#ECECEC',
    borderRadius: 14,
    padding: 6,
  },
  tabButton: {
    flex: 1,
    height: 44,
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#9A9A9A',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FF0000',
    fontFamily: 'Poppins-SemiBold',
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    borderRadius: 5,
  },
  underlineRed: {
    borderBottomColor: '#ED1F24',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 0,
  },
  addCustomRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  listItemText: {
    fontFamily: 'Poppins-Medium',
    color: '#1F1F1F',
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  continueButton: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FF0000',
    marginTop: 50,
    // borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    // marginBottom: 40,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  disabledButton: {
    backgroundColor: '#ccc', // grey background
  },
  disabledButtonText: {
    color: '#666', // faded text
  },
  downborder: {
    position: 'relative',
    left: 118,
    right: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#ED1F24',
    width: '35%',
    justifyContent: 'center',
    borderRadius: 20,
    bottom: 10,
  },
  expandedContent: {
    backgroundColor: '#fff',
    paddingLeft: 25,
    paddingBottom: 10,
  },
  areaLine: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  dottedLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 8,
    marginRight: 20,
    width: '85%',
  },
  rowCard: {
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#1F1F1F',
    marginBottom: 6,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  kvLabel: {
    fontFamily: 'Poppins-Medium',
    color: '#444',
  },
  kvValue: {
    fontFamily: 'Poppins-Medium',
    color: '#444',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  cta: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FF1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  ctaText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
});

export default StartMeasurement;

// working well with showing total lght
//  displayList.map(roomName => {
//               const room = roomsData[roomName];
//               console.log('room', room);
//               const tab = (activeTab || '').trim();
//               console.log('tab', tab);
//               const total = room ? getRoomAreaForTab(room, tab) : 0;
//               const filterRepaintCeiling = room?.ceilings?.filter(
//                 re => re.mode === 'REPAINT',
//               );
//               const filterFreshPaintCeiling = room?.ceilings?.filter(
//                 fr => fr.mode === 'FRESH',
//               );
//               const filterRepaintWalls = room?.walls?.filter(
//                 re => re.mode === 'REPAINT',
//               );
//               const filterFreshPaintWalls = room?.walls?.filter(
//                 fr => fr.mode === 'FRESH',
//               );

//               return (
//                 <View key={roomName} style={styles.rowCard}>
//                   <TouchableOpacity
//                     style={styles.rowHeader}
//                     onPress={() => navigateToScreen(roomName)}
//                   >
//                     <Text style={styles.listItemText}>{roomName}</Text>
//                     <Entypo
//                       name="chevron-with-circle-right"
//                       size={18}
//                       color="#FF0000"
//                     />
//                   </TouchableOpacity>

//                   {room && (
//                     <View style={{ marginTop: 10 }}>
//                       {tab === 'Interior' ? (
//                         <>
//                           <Text style={styles.modeText}>
//                             Repaint with primer
//                           </Text>
//                           {/* ceiling */}
//                           {!!filterRepaintCeiling?.length && (
//                             <View style={styles.kvRow}>
//                               <Text style={styles.kvLabel}>
//                                 Ceilings ({filterRepaintCeiling.length})
//                               </Text>
//                               <Text style={styles.kvValue}>
//                                 {sumAreas(filterRepaintCeiling, netCeilingArea)}{' '}
//                                 sq ft
//                               </Text>
//                             </View>
//                           )}

//                           {/* Walls (REPAINT) */}
//                           {!!filterRepaintWalls?.length && (
//                             <View style={styles.kvRow}>
//                               <Text style={styles.kvLabel}>
//                                 Walls ({filterRepaintWalls.length})
//                               </Text>
//                               <Text style={styles.kvValue}>
//                                 {sumAreas(filterRepaintWalls, netWallArea)} sq
//                                 ft
//                               </Text>
//                             </View>
//                           )}

//                           <View style={styles.underlineRed} />

//                           <Text style={styles.modeText}>Fresh Paint</Text>

//                           {/* Ceilings (FRESH) */}
//                           {!!filterFreshPaintCeiling?.length && (
//                             <View style={styles.kvRow}>
//                               <Text style={styles.kvLabel}>
//                                 Ceilings ({filterFreshPaintCeiling.length})
//                               </Text>
//                               <Text style={styles.kvValue}>
//                                 {sumAreas(
//                                   filterFreshPaintCeiling,
//                                   netCeilingArea,
//                                 )}{' '}
//                                 sq ft
//                               </Text>
//                             </View>
//                           )}

//                           {/* Walls (FRESH) */}
//                           {!!filterFreshPaintWalls?.length && (
//                             <View style={styles.kvRow}>
//                               <Text style={styles.kvLabel}>
//                                 Walls ({filterFreshPaintWalls.length})
//                               </Text>
//                               <Text style={styles.kvValue}>
//                                 {sumAreas(filterFreshPaintWalls, netWallArea)}{' '}
//                                 sq ft
//                               </Text>
//                             </View>
//                           )}
//                         </>
//                       ) : (
//                         <View style={styles.kvRow}>
//                           <Text style={styles.kvLabel}>
//                             {roomName} ({room?.measurements?.length || 0})
//                           </Text>
//                           <Text style={styles.kvValue}>
//                             {sumAreas(room?.measurements, netOtherArea)} sq ft
//                           </Text>
//                         </View>
//                       )}
//                     </View>
//                   )}
//                 </View>
//               );
//             })
