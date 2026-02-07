import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { useVendorContext } from '../../Utilities/VendorContext';
import moment from 'moment';


const Profiledetails = () => {
  const { vendorDataContext } = useVendorContext();
  return (
    <View style={{ marginTop: 20 }}>

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
      {/* <Text style={styles.lastActiveTime}>09 Jan 2023 | 5:30 PM</Text> */}
      <View>
        <Text
          style={{
            color: '#151515',
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            top: 20,
            marginLeft: 20,
          }}>
          Profile Details
        </Text>
        <Text
          style={{
            color: '#151515',
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            top: 30,
            marginLeft: 20,
          }}>
          Name
        </Text>
        <Text
          style={{
            color: '#000000AD',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 12,
            top: 30,
            marginLeft: 20,
          }}>
          {vendorDataContext.vendor?.vendorName}
        </Text>
        <Text
          style={{
            color: '#151515',
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            top: 30,
            marginLeft: 20,
            marginTop: 10,
          }}>
          Date Of Birth
        </Text>
        <Text
          style={{
            color: '#000000AD',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 12,
            top: 30,
            marginLeft: 20,
          }}>
          {/* 09 Jan 2023 */}
          {moment(vendorDataContext.vendor?.dateOfBirth).format('ll')}
        </Text>
        <Text
          style={{
            color: '#151515',
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            top: 30,
            marginLeft: 20,
            marginTop: 10,
          }}>
          Date of Joining
        </Text>
        <Text
          style={{
            color: '#000000AD',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 12,
            top: 30,
            marginLeft: 20,
          }}>
          {/* 09 Jan 2023 */}
          {moment(vendorDataContext?.createdAt).format('ll')}
        </Text>

      </View>
      {/* <Text
        style={{
          color: '#151515',
          fontFamily: 'Poppins-Bold',
          fontSize: 14,
          top: 30,
          marginLeft: 20,
          marginTop: 10,
        }}>
        Email ID
      </Text>
      <Text
        style={{
          color: '#000000AD',
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          top: 30,
          marginLeft: 20,
        }}>
        {vendorDataContext.vendor?.vendorName}
      </Text> */}
      <Text
        style={{
          color: '#151515',
          fontFamily: 'Poppins-Bold',
          fontSize: 14,
          top: 30,
          marginLeft: 20,
          marginTop: 10,
        }}>
        Aadhaar No
      </Text>
      <Text
        style={{
          color: '#000000AD',
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          top: 30,
          marginLeft: 20,
        }}>
        {vendorDataContext.documents?.aadhaarNumber}
      </Text>
      <Text
        style={{
          color: '#151515',
          fontFamily: 'Poppins-Bold',
          fontSize: 14,
          top: 30,
          marginLeft: 20,
          marginTop: 10,
        }}>
        Phone No
      </Text>
      <Text
        style={{
          color: '#000000AD',
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          top: 30,
          marginLeft: 20,
        }}>
        {vendorDataContext.vendor?.mobileNumber}
      </Text>
      {/* <Text
        style={{
          color: '#151515',
          fontFamily: 'Poppins-Bold',
          fontSize: 14,
          top: 30,
          marginLeft: 20,
          marginTop: 10,
        }}>
        Alternate No.
      </Text>
      <Text
        style={{
          color: '#000000AD',
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          top: 30,
          marginLeft: 20,
        }}>
        9876543210
      </Text> */}
      {/* <View style={styles.downborder} /> */}
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
    bottom: -60,
    left: 110,
    right: 20,
    borderBottomWidth: 5, // Increased thickness for visibility
    borderBottomColor: '#ED1F24', // Set to red as requested
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,

    // Span the full width
  },
});
export default Profiledetails;
