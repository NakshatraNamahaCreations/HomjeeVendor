import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { Calendar, Calendar as RNCalendar } from 'react-native-calendars';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';

const TeamCalendarDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vendorId, teamMember, statusLabel, statusColor } = route.params;

  const [selectedDates, setSelectedDates] = useState({});
  const [workingDates, setWorkingDates] = useState({});
  const [resDate, setResDate] = useState(null);
  const today = moment().format('YYYY-MM-DD');

  useEffect(() => {
    fetchTeamMemberById();
  }, []);

  const fetchTeamMemberById = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_TEAM_MEMBER_BY_OWN_ID}${vendorId}/${teamMember._id}`,
      );
      const getRes = res.data.results;
      setResDate(getRes);
      // Leaves
      const preSelected = {};
      getRes.markedLeaves?.forEach(date => {
        preSelected[date] = {
          selected: true,
          selectedColor: '#E74C3C', // red = leave
        };
      });

      // Busy Dates
      const busyRes = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_TEAM_MEMBER_BUSY_DATES}${vendorId}/${teamMember._id}`,
      );
      const busyDates = busyRes.data.busyDates || [];

      const busy = {};
      busyDates.forEach(date => {
        busy[date] = {
          selected: true,
          selectedColor: '#B0B0B0', // grey = working
          disabled: true,
          disableTouchEvent: true,
        };
      });

      setSelectedDates(preSelected);
      setWorkingDates(busy);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  // const onDayPress = dateString => {
  //   setSelectedDates(prev => {
  //     const updated = { ...prev };

  //     if (updated[dateString]) {
  //       delete updated[dateString];
  //     } else {
  //       updated[dateString] = {
  //         selected: true,
  //         selectedColor: '#E74C3C',
  //       };
  //     }
  //     return updated;
  //   });
  // };

  const onDayPress = dateString => {
    // ❌ Don’t allow toggling if busy
    if (workingDates[dateString]) {
      ToastAndroid.show('This date is busy (working)', ToastAndroid.SHORT);
      return;
    }

    setSelectedDates(prev => {
      const updated = { ...prev };
      if (updated[dateString]) {
        delete updated[dateString];
      } else {
        updated[dateString] = {
          selected: true,
          selectedColor: '#E74C3C',
        };
      }
      return updated;
    });
  };

  const handleMarkLeaves = async () => {
    try {
      const leaveDates = Object.keys(selectedDates);
      const res = await axios.put(
        `${API_BASE_URL}${API_ENDPOINTS.MARK_LEAVES}${vendorId}/${teamMember._id}`,
        { leaveDates },
      );
      ToastAndroid.showWithGravity(
        res.message || 'Leave Updated!',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      console.log('res', res.data.result);
      fetchTeamMemberById();
      navigation.goBack();
      console.log('Marked Leave Dates:', leaveDates);
    } catch (error) {
      console.log('Error while marking leaves:', error);
      ToastAndroid.showWithGravity(
        error?.message || 'Failed to mark leave',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    }
  };

  console.log('workingDates', workingDates);
  console.log('resDate', resDate);
  console.log('statusLabel', statusLabel);

  return (
    <ScrollView style={{ backgroundColor: '#fff' }}>
      <Image
        source={{
          uri:
            resDate?.profileImage ||
            'https://www.vlp.org.uk/wp-content/uploads/2024/12/c830d1dee245de3c851f0f88b6c57c83c69f3ace-300x300.png',
        }}
        style={[
          styles.profileImage,
          statusLabel === 'Working' && {
            borderWidth: 2.5,
            borderColor: statusColor,
          },
        ]}
        resizeMode="stretch"
      />
      <Text style={styles.name}>{teamMember.name}</Text>
      <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Date of Birth</Text>
        <Text style={styles.value}>{teamMember.dateOfBirth}</Text>
        <Text style={styles.label}>Date of Joining</Text>
        <Text style={styles.value}>12th July 1987</Text>
        <Text style={styles.label}>Email ID</Text>
        <Text style={styles.value}>testing@gamil.com</Text>
        <Text style={styles.label}>Phone No.</Text>
        <Text style={styles.value}>{teamMember.mobileNumber}</Text>
      </View>

      <View style={styles.calendarBox}>
        <View
          style={{
            borderColor: '#e6e6e6ff',
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Calendar
            onDayPress={day => onDayPress(day.dateString)}
            markedDates={{ ...workingDates, ...selectedDates }}
            // markedDates={selectedDates}
            minDate={today} // prevents past selection
            theme={{
              selectedDayTextColor: '#fff',
              todayTextColor: '#2980B9', // highlight today
            }}
            style={{ borderRadius: 8 }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleMarkLeaves}>
        <Text style={styles.buttonText}>Mark Leaves</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TeamCalendarDetails;

const styles = StyleSheet.create({
  profileImage: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 50,
  },
  name: {
    fontSize: 12,
    alignSelf: 'center',
    marginTop: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  status: {
    alignSelf: 'center',
    fontSize: 10,
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  value: {
    fontSize: 12,
    // marginTop: 5,
    color: '#555',
    fontFamily: 'Poppins-Medium',
  },
  calendarBox: {
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  button: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingRight: 20,
    paddingLeft: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingTop: 30,
    paddingBottom: 70,
    paddingRight: 20,
    paddingLeft: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  modalSubTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 10,
  },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotButton: {
    width: '30%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 12,
    color: '#000',
  },
  noteText: {
    fontSize: 10,
    color: '#E74C3C',
    marginTop: 10,
    marginBottom: 20,
  },
  rescheduleBtn: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  rescheduleText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  tab: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  tabActive: {
    backgroundColor: '#E74C3C',
  },
  tabInactive: {
    backgroundColor: '#D9D9D9',
  },
  tabTextActive: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  tabTextInactive: {
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  summaryText: {
    fontSize: 12,
    marginVertical: 3,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  closeIcon: {
    width: 35,
    height: 35,
    top: 20,
  },
  downborder: {
    position: 'relative',
    bottom: 20,
    left: 100,
    right: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#ED1F24',
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,
  },
  downborders: {
    left: 100,
    right: 20,
    bottom: 8,
    borderBottomWidth: 5,
    borderBottomColor: '#ED1F24',
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 10,
  },
});
