// import {View, Text, Image, StyleSheet} from 'react-native';
// import React from 'react';

// const Viewid = () => {
//   return (
//     <View>
//       <Image
//         source={require('../../assets/images/logo.png.png')}
//         style={{width: 141, height: 42, alignSelf: 'center', margin: 20}}
//       />
//       <Image
//         source={require('../../assets/images/profilemenu.png')}
//         style={{width: 80, height: 80, alignSelf: 'center'}}
//       />
//       <Text
//         style={{
//           alignSelf: 'center',
//           color: '#000',
//           fontFamily: 'Poppins-Bold',
//           fontSize: 12,
//           marginTop: 5,
//         }}>
//         RAMESH H
//       </Text>
//       <Text
//         style={{
//           alignSelf: 'center',
//           color: '#000',
//           fontFamily: 'Poppins-SemiBold',
//           fontSize: 10,
//           marginTop: 5,
//         }}>
//         Project Manager
//       </Text>
//       <View style={{flexDirection: 'row', paddingTop: 20}}>
//         <Image
//           source={require('../../assets/icons/dateofbirth.png')}
//           style={{width: 15, height: 15, marginLeft: 15}}
//         />
//         <Text
//           style={{
//             marginLeft: 10,
//             fontSize: 12,
//             fontFamily: 'Poppins-SemiBold',
//           }}>
//           Date Of Birth
//         </Text>
//       </View>
//       <Text
//         style={{
//           marginLeft: 45,
//           fontSize: 12,
//           fontFamily: 'Poppins-SemiBold',
//           color: '#000000AD',
//         }}>
//         1234556789
//       </Text>
//       <View style={{flexDirection: 'row', paddingTop: 20}}>
//         <Image
//           source={require('../../assets/icons/userid.png')}
//           style={{width: 15, height: 15, marginLeft: 15}}
//         />
//         <Text
//           style={{
//             marginLeft: 10,
//             fontSize: 12,
//             fontFamily: 'Poppins-SemiBold',
//           }}>
//           ID Number
//         </Text>
//       </View>
//       <Text
//         style={{
//           marginLeft: 45,
//           fontSize: 12,
//           fontFamily: 'Poppins-SemiBold',
//           color: '#000000AD',
//         }}>
//         1234556789
//       </Text>
//       <View></View>
//       <View style={styles.downborder} />
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   downborder: {
//     position: 'relative',
//     top: 350,
//     left: 100,
//     right: 20,
//     borderBottomWidth: 5, // Increased thickness for visibility
//     borderBottomColor: '#ED1F24', // Set to red as requested
//     width: '40%',
//     justifyContent: 'center',
//     borderRadius: 20,

//     // Span the full width
//   },
// });
// export default Viewid;
import React from 'react';
import {View, Text, Image, StyleSheet, Dimensions} from 'react-native';

const Viewid = () => {
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
      <View style={styles.photoWrapper}>
        <Image source={userData.photo} style={styles.photo} />
      </View>

      {/* User Info */}
      <Text style={styles.name}>{userData.name}PRADEEP SK</Text>
      <Text style={{fontFamily: 'Poppins-SemiBold'}}>
        {userData.name}Vendor
      </Text>
      <Text style={styles.job}>{userData.job}</Text>
      <Text style={styles.id}>ID NO : 567890987{userData.id}</Text>
      <View style={styles.dottedLine} />
      <Text style={styles.id}>EMAIL : pradeep@gmail.com {userData.id}</Text>
      <View style={styles.dottedLine} />
      <Text style={styles.id}>PHONE : 7656789098 {userData.id}</Text>
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
    marginBottom: 12,
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
