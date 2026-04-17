import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useVendorContext } from '../../Utilities/VendorContext';
import moment from 'moment';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Calendar = () => {
  const navigation = useNavigation();
  const { vendorDataContext, setVendorDataContext } = useVendorContext();
  const [selectedDates, setSelectedDates] = useState({});
  const [savingLeaves, setSavingLeaves] = useState(false);

  const today = moment().format("YYYY-MM-DD");
  const tomorrow = moment().add(1, "day").format("YYYY-MM-DD");

  useEffect(() => {
    try {
      const leaves = Array.isArray(vendorDataContext?.markedLeaves)
        ? vendorDataContext.markedLeaves
        : [];

      const prefilled = leaves.reduce((acc, d) => {
        const key = String(d || "").trim();
        if (!key) return acc;

        acc[key] = {
          selected: true,
          selectedColor: "#E74C3C",
          selectedTextColor: "#fff",
        };
        return acc;
      }, {});

      setSelectedDates(prefilled);
    } catch (e) { }
  }, [vendorDataContext?.markedLeaves]);

  const onDayPress = (day) => {
    try {
      if (moment(day.dateString).isBefore(tomorrow, "day")) return;

      setSelectedDates((prev) => {
        const updated = { ...prev };

        if (updated[day.dateString]) {
          delete updated[day.dateString]; // ✅ deselect
        } else {
          updated[day.dateString] = {
            selected: true,
            selectedColor: "#E74C3C",
            selectedTextColor: "#fff",
          };
        }
        return updated;
      });
    } catch (e) {
      console.log("onpress select date", e)
    }
  };
  const markedDates = selectedDates;

  const handleSaveLeaves = async () => {
    try {
      if (savingLeaves) return;

      setSavingLeaves(true);

      const markedLeaves = Object.keys(selectedDates).sort();

      const body = {
        vendorId: vendorDataContext?._id,
        markedLeaves, // ✅ final list after deselect/select
      };

      const res = await axios.put(
        `${API_BASE_URL}${API_ENDPOINTS.MARK_VENDOR_LEAVES}`,
        body
      );

      ToastAndroid.showWithGravity(
        res?.data?.message || "Leaves updated",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      console.log("res.data.vendor", res.data);

      setVendorDataContext(res.data.results)
      navigation.goBack();
    } catch (error) {
      console.log("update leaves error:", error);

      ToastAndroid.showWithGravity(
        error?.response?.data?.message || error?.message || "Failed to update leave",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } finally {
      setSavingLeaves(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: '#fff' }}>
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#ED1F24",
          alignItems: "center",
          justifyContent: "center", alignSelf: 'center',
          marginTop: 15,
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
      <Text style={styles.name}>{vendorDataContext.vendor?.vendorName}</Text>
      <Text style={styles.status}>Live</Text>
      <Text
        style={{
          color: '#263238',
          alignSelf: 'center',
          fontSize: 10,
          fontFamily: 'Poppins-SemiBold',
          marginTop: -15,
        }}>
        {vendorDataContext.vendor?.serviceType}
      </Text>


      <View style={styles.infoSection}>
        <Text style={styles.label}>Calendar</Text>
      </View>

      <View style={styles.calendarBox}>
        .        <RNCalendar
          current={today}
          minDate={tomorrow}   // ✅ disables past + today, selectable from tomorrow
          onDayPress={onDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            selectedDayBackgroundColor: "#E74C3C",
            selectedDayTextColor: "#ffffff",
            dayTextColor: "#000000",
            textDisabledColor: "#d9e1e8",
            monthTextColor: "#000000",
            arrowColor: "#000000",
            textMonthFontWeight: "bold",
          }}
          style={{ borderRadius: 10 }}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          savingLeaves ? { opacity: 0.7 } : null,
        ]}
        onPress={handleSaveLeaves}
        disabled={savingLeaves}
      >
        {savingLeaves ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Mark Leaves</Text>
        )}
      </TouchableOpacity>
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
