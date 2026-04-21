import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useVendorContext } from '../../Utilities/VendorContext';

const Viewid = () => {
  const { vendorDataContext } = useVendorContext();

  const userData = {
    name: '',
    id: '',
    category: 'VENDOR',
    logo: require('../../assets/images/logo.png.png'), // replace with your logo path
    photo: require('../../assets/images/profilemenu.png'), // replace with the profile image path
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={userData.logo} style={styles.logo} resizeMode="contain" />

      {/* Profile Photo */}
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

      {/* User Info */}
      <Text style={styles.name}>{vendorDataContext.vendor?.vendorName}</Text>
      <Text style={styles.status}>Live</Text>
      <Text style={{ fontFamily: 'Poppins-SemiBold', marginBottom: 15 }}>{vendorDataContext.vendor?.serviceType}</Text>

      <Text style={styles.id}>ID NO :  {vendorDataContext.documents?.aadhaarNumber}</Text>
      <View style={styles.dottedLine} />
      <Text style={styles.id}>PHONE :  {vendorDataContext.vendor?.mobileNumber}</Text>
      {/* Category Label */}

      {/* Barcode Placeholder */}
    </View>
  );
};

export default Viewid;

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 4,
    alignSelf: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 50,
  },
  status: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    fontSize: 10,
    letterSpacing: 0.2,
    alignSelf: 'center',
  },
  photoWrapper: {
    borderWidth: 4,
    borderColor: '#e60000',
    borderRadius: 100,
    padding: 3,
    marginBottom: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 28,
    color: '#000',
    marginTop: 4,
    fontFamily: 'Poppins-Bold',
  },
  job: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  id: {
    fontSize: 16,
    color: '#111',
    // marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
    alignSelf: 'flex-start',
    marginLeft: 10,
    fontSize: 16,
  },

  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    borderStyle: 'dashed',
    width: '100%',
    marginVertical: 5,
  },
});
