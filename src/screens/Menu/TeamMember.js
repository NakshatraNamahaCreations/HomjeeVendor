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
  const vendorName = vendorDataContext.vendor.vendorName;
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

  return (
    <View style={{ margin: 20 }}>
      <ScrollView>
        <Image
          source={{ uri: vendorDataContext.vendor.profileImage }}
          style={{
            width: 80,
            height: 80,
            alignSelf: 'center',
            borderRadius: 50,
          }}
        />
        <Text style={styles.profileName}>{vendorName}</Text>
        <Text style={styles.status}>Live</Text>
        <Text style={styles.lastActive}>Last Active</Text>
        <Text style={styles.lastActiveTime}>09 Jan 2023 | 5:30 PM</Text>

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

        {teamList.map(team => {
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
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  backgroundColor: 'white',
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: '#DADADA',
                }}
              >
                <Image
                  source={{
                    uri:
                      team?.profileImage ||
                      'https://www.vlp.org.uk/wp-content/uploads/2024/12/c830d1dee245de3c851f0f88b6c57c83c69f3ace-300x300.png',
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    marginLeft: 20,
                    borderRadius: 50,
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    color: '#151515',
                    fontFamily: 'Poppins-Bold',
                    fontSize: 14,
                    marginTop: 10,
                    textAlign: 'left',
                    marginRight: 130,
                  }}
                >
                  {team.name}
                </Text>
                <Text style={[styles.badge, { color: statusColor }]}>
                  {statusLabel}
                </Text>
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
    marginRight: 15,
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    marginTop: 15,
  },
});
export default TeamMember;
