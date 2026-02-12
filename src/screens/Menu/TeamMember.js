import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useVendorContext } from '../../Utilities/VendorContext';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import axios from 'axios';

const STATUS_COLOR = {
  Available: '#FF7F00', // orange
  Working: '#008E00', // green
  'On Leave': '#ED1F24', // red
};

const TeamMember = () => {
  const navigation = useNavigation();
  const { vendorDataContext, setVendorDataContext } = useVendorContext();
  console.log('vendorDataContext', vendorDataContext);
  const vendorId = vendorDataContext._id;
  const teamList = vendorDataContext.team || [];

  const [teamStatuses, setTeamStatuses] = useState({});
  const today = moment().format('YYYY-MM-DD');

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

  const fetchTeamStatuses = useCallback(async () => {
    if (!vendorId) return;
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.TEAM_MEMBERS_STATUS}${vendorId}/status`;
      const res = await axios.get(url);
      if (res?.data?.success) {
        setTeamStatuses(res.data.statuses || {});
        setVendorDataContext(res.data.getVendor);
      } else {
        setTeamStatuses({});
      }
    } catch (err) {
      console.log('fetchTeamStatuses error:', err?.message);
      setTeamStatuses({});
    }
  }, [vendorId]);

  useEffect(() => {
    fetchTeamStatuses();
  }, [fetchTeamStatuses]);

  // compute final status per member with precedence
  const getMemberStatus = member => {
    try {
      const leaveToday =
        Array.isArray(member.markedLeaves) &&
        member.markedLeaves.includes(today);
      const apiStatus = teamStatuses[String(member._id)]?.status; // 'Working' or 'Available'

      // Precedence: Working > On Leave > Available
      if (apiStatus === 'Working') return 'Working';
      if (leaveToday) return 'On Leave';
      return apiStatus || 'Available';
    } catch {
      return 'Available';
    }
  };
  console.log('teamStatuses', teamStatuses);
  console.log('teamList', teamList);

  return (
    <View style={{ margin: 20 }}>
      <ScrollView>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#ED1F24",
            alignItems: "center",
            justifyContent: "center", alignSelf: 'center'
            // padding: 1,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 44,
              overflow: "hidden", // ✅ important to clip image inside
              backgroundColor: "#fff",
            }}
          >
            <Image
              source={{ uri: vendorDataContext?.vendor?.profileImage }}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"  // ✅ fills circle without stretching
            />
          </View>
        </View>
        <Text style={styles.profileName}>{vendorDataContext.vendor?.vendorName}</Text>
        <Text style={styles.status}>Live</Text>
        <Text style={styles.lastActive}>{vendorDataContext.vendor?.serviceType}</Text>

        <Text
          style={{
            color: '#151515',
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            marginBottom: 10,
            marginTop: 20,
          }}
        >
          Team Members
        </Text>

        {!teamList || teamList.length === 0 ? (
          <Text style={{ fontSize: 12, fontFamily: 'Poppins-Medium', textAlign: "center", marginTop: 12, color: "#888" }}>
            No team member added
          </Text>
        ) : teamList.map(team => {
          const statusLabel = getMemberStatus(team);
          const statusColor = STATUS_COLOR[statusLabel] || '#444';

          return (
            <TouchableOpacity
              key={String(team._id)}
              onPress={() =>
                navigation.navigate('TeamCalendarDetails', {
                  vendorId,
                  teamMember: team,
                  statusLabel,
                  statusColor,
                })
              }
              style={styles.logoutItem}
            >
              <View
                style={{
                  flexDirection: 'row',
                  // justifyContent: 'space-between',
                  marginBottom: 10, alignItems: "center",
                  backgroundColor: 'white',
                  // paddingTop: 10,
                  // paddingBottom: 10,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: '#DADADA',
                  padding: 10
                }}
              >
                <View style={{ flex: 0.2 }}>
                  <Image
                    source={{
                      uri:
                        team?.profileImage ||
                        'https://www.vlp.org.uk/wp-content/uploads/2024/12/c830d1dee245de3c851f0f88b6c57c83c69f3ace-300x300.png',
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      // marginLeft: 20,
                      borderRadius: 50,
                    }}
                    resizeMode="cover"
                  />
                </View>

                <View style={{ flex: 0.4, justifyContent: "center" }}>
                  <Text
                    style={{
                      color: '#151515',
                      fontFamily: 'Poppins-Medium',
                      fontSize: 13,
                    }}
                  >
                    {team.name}
                  </Text>
                </View>
                <View style={{ flex: 0.4, justifyContent: "center", alignItems: "flex-end" }}>
                  <Text style={[styles.badge, { color: statusColor }]}>
                    {statusLabel}
                  </Text>
                </View>

              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  profileContainer: {
    marginBottom: 10,
  },
  profileName: {
    color: '#000',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'center',
  },
  status: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    fontSize: 10,
    letterSpacing: 0.2,
    alignSelf: 'center',
  },
  lastActive: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#263238',
    alignSelf: 'center',
  },
  lastActiveTime: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#263238',
    alignSelf: 'center',
  },
  downborder: {
    position: 'relative',
    top: 180,
    left: 115,
    right: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#ED1F24',
    width: '35%',
    justifyContent: 'center',
    borderRadius: 20,
  },
  badge: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
  },
});
export default TeamMember;
