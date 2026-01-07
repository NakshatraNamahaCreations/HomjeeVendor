import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';

const FinancialDetails = () => {
  return (
    <View style={{marginTop: 20}}>
      <Image
        source={require('../../assets/images/profilemenu.png')}
        style={{width: 80, height: 80, alignSelf: 'center'}}
      />
      <Text style={styles.profileName}>RAMESH H</Text>
      <Text style={styles.status}>Live</Text>
      <Text style={styles.lastActive}>Last Active</Text>
      <Text style={styles.lastActiveTime}>09 Jan 2023 | 5:30 PM</Text>
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
          GST No.
        </Text>
        <Text
          style={{
            color: '#000000AD',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 12,
            top: 30,
            marginLeft: 20,
          }}>
          29AAACH7409R1ZX
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
          State Bank of INDIA
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
        xxxxxxxxxxxxxxxxx
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
        XXXXXXXXXXX
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
