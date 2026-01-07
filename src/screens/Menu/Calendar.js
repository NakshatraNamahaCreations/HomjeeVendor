import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Calendar as RNCalendar} from 'react-native-calendars';

const Calendar = () => {
  const [selectedDates, setSelectedDates] = useState({});

  // Get today's date string in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const onDayPress = day => {
    const updatedDates = {...selectedDates};

    if (updatedDates[day.dateString]) {
      delete updatedDates[day.dateString]; // Toggle off
    } else {
      updatedDates[day.dateString] = {
        selected: true,
        selectedColor: '#E74C3C',
      };
    }

    setSelectedDates(updatedDates);
  };
  const markedDates = {
    ...selectedDates,
    [today]: selectedDates[today]
      ? selectedDates[today]
      : {
          selected: true,
          selectedColor: '#E74C3C',
          selectedTextColor: '#fff',
        },
  };

  return (
    <ScrollView style={{backgroundColor: '#fff'}}>
      <Image
        source={require('../../assets/images/profilemenu.png')}
        style={{width: 80, height: 80, alignSelf: 'center', marginTop: 20}}
      />
      <Text style={styles.name}>RAMESH H</Text>
      <Text style={styles.status}>Live</Text>
      <Text
        style={{
          color: '#263238',
          alignSelf: 'center',
          fontSize: 10,
          fontFamily: 'Poppins-SemiBold',
          marginTop: -15,
        }}>
        Last Active
      </Text>
      <Text
        style={{
          color: '#263238',
          alignSelf: 'center',
          fontSize: 10,
          fontFamily: 'Poppins-SemiBold',
        }}>
        09 Jan 2023 | 05:30 PM
      </Text>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Calendar</Text>
      </View>

      <View style={styles.calendarBox}>
        <RNCalendar
          current={today} // Show current month based on today
          onDayPress={onDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            // todayTextColor: '#E74C3C', // red text for today
            // todayDotColor: 'red',

            selectedDayBackgroundColor: '#E74C3C',
            selectedDayTextColor: '#ffffff',
            dayTextColor: '#000000',
            textDisabledColor: '#d9e1e8',
            monthTextColor: '#000000',
            arrowColor: '#000000',
            textMonthFontWeight: 'bold',
          }}
          style={{borderRadius: 10}}
        />
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Mark Leaves</Text>
      </TouchableOpacity>
      <View style={styles.downborder} />
    </ScrollView>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  profileImage: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginTop: 20,
  },
  name: {
    fontFamily: 'Poppins-Bold',
    alignSelf: 'center',
    fontSize: 12,
    marginTop: 10,
  },
  status: {
    fontFamily: 'Poppins-SemiBold',
    alignSelf: 'center',
    fontSize: 10,
    color: '#ED1F24',
    marginBottom: 20,
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    color: '#151515',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginTop: 20,
  },
  value: {
    color: '#000000AD',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    marginTop: 5,
  },
  calendarBox: {
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    backgroundColor: '#fff',
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
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 14,
  },
  downborder: {
    position: 'relative',
    left: 115,
    right: 20,
    borderBottomWidth: 5, // Increased thickness for visibility
    borderBottomColor: '#ED1F24', // Set to red as requested
    width: '35%',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 30,
    // Span the full width
  },
});
