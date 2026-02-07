import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { useVendorContext } from '../../Utilities/VendorContext';

const FinancialDetails = () => {
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
      <View>
        <Text
          style={{
            color: '#151515',
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            top: 20,
            marginLeft: 20,
          }}>
          Financial Details
        </Text>
        <Text
          style={{
            color: '#151515',
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            top: 30,
            marginLeft: 20,
          }}>
          GST No
        </Text>
        <Text
          style={{
            color: '#000000AD',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 12,
            top: 30,
            marginLeft: 20,
          }}>
          {vendorDataContext.documents?.gstNumber ? vendorDataContext.documents?.gstNumber : "N/A"}
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
          Bank Name
        </Text>
        <Text
          style={{
            color: '#000000AD',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 12,
            top: 30,
            marginLeft: 20,
          }}>
          {vendorDataContext.bankDetails?.bankName}
        </Text>
      </View>

      <Text
        style={{
          color: '#151515',
          fontFamily: 'Poppins-Bold',
          fontSize: 14,
          top: 30,
          marginLeft: 20,
          marginTop: 10,
        }}>
        Account Number
      </Text>
      <Text
        style={{
          color: '#000000AD',
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          top: 30,
          marginLeft: 20,
        }}>
        {vendorDataContext.bankDetails?.accountNumber}
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
        IFSC Code
      </Text>
      <Text
        style={{
          color: '#000000AD',
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          top: 30,
          marginLeft: 20,
        }}>
        {vendorDataContext.bankDetails?.ifscCode}
      </Text>
      <View style={styles.downborder} />
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
    top: 280,
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
export default FinancialDetails;
