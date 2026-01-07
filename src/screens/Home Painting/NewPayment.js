// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const NewPayment = () => {
//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scroll}>
//         <Text style={styles.sectionTitle}>Customer Details</Text>

//         {/* Customer Card */}
//         <View style={styles.card}>
//           <View style={styles.customerTop}>
//             <View style={{flex: 1}}>
//               <Text style={styles.customerName}>Sonali K</Text>
//               <View style={styles.locationRow}>
//                 <Icon name="location-pin" size={16} color="#ED1F24" />
//                 <Text style={styles.address}>
//                   Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
//                   do
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.dateTimeBox}>
//               <Text style={styles.dateText}>28-02-2025</Text>
//               <Text style={styles.timeText}>12:00 PM</Text>
//             </View>
//           </View>

//           <TouchableOpacity style={styles.updateBtn}>
//             <Text style={styles.updateBtnText}>Update Status</Text>
//           </TouchableOpacity>

//           <View style={styles.actionRow}>
//             <TouchableOpacity style={styles.directionBtn}>
//               <Text style={styles.buttonText}>Directions</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.contactBtn}>
//               <Text style={styles.buttonText}>Contact</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Measurements Summary */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Measurements Summary</Text>
//             <Image
//               source={require('../../assets/icons/arrowredcircle.png')}
//               style={styles.icon}
//               onError={e =>
//                 console.log('Image load error:', e.nativeEvent.error)
//               }
//             />
//           </View>
//           <View style={styles.dottedLine} />
//           <View style={styles.rowText}>
//             <Text style={styles.leftText}>Interior</Text>
//             <Text style={styles.rightText}>2000 sq ft</Text>
//           </View>
//           <View style={styles.rowText}>
//             <Text style={styles.leftText}>Exterior</Text>
//             <Text style={styles.rightText}>2000 sq ft</Text>
//           </View>
//           <View style={styles.rowText}>
//             <Text style={styles.leftText}>Others</Text>
//             <Text style={styles.rightText}>1688 sq ft</Text>
//           </View>
//           <View style={styles.rowText}>
//             <Text style={styles.leftTextBold}>Total measurement</Text>
//             <Text style={styles.rightTextBold}>2000 sq ft</Text>
//           </View>
//         </View>

//         {/* Quote Summary */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Quotes Summary</Text>
//             <Image
//               source={require('../../assets/icons/arrowredcircle.png')}
//               style={styles.icon}
//               onError={e =>
//                 console.log('Image load error:', e.nativeEvent.error)
//               }
//             />
//           </View>
//           <View style={styles.dottedLine} />
//           <View style={styles.rowText}>
//             <Text style={styles.leftText}>Quote 1</Text>
//             <Text style={styles.rightText}>₹ 56000</Text>
//           </View>
//           <View style={styles.rowText}>
//             <Text style={styles.leftText}>Quote 2</Text>
//             <Text style={styles.rightText}>₹ 56000</Text>
//           </View>
//         </View>

//         {/* Payment Summary */}
//         <View style={styles.summaryBox}>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Total Amount</Text>
//             <Text style={styles.summaryBold}>₹ 20,537</Text>
//             <Image
//               source={require('../../assets/icons/edit.png')}
//               style={styles.icon}
//               onError={e =>
//                 console.log('Image load error:', e.nativeEvent.error)
//               }
//             />
//           </View>
//           <View style={styles.summaryRow}>
//             <Text>Amount paid</Text>
//             <Text>₹ 4,000</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text>Amount yet to paid</Text>
//             <Text>₹ 6,537</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom CTA */}
//       <TouchableOpacity
//         style={styles.requestBtn}
//         onPress={() => navigation.navigate('JobOngoingFinal')}>
//         <Text style={styles.requestText}>Request Next Payment</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#F6F6F6'},
//   scroll: {padding: 16, paddingBottom: 100},
//   sectionTitle: {
//     fontSize: 16,
//     fontFamily: 'Poppins-SemiBold',
//     marginBottom: 26,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//     elevation: 2,
//     marginTop: 20,
//   },
//   customerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   customerName: {fontFamily: 'Poppins-SemiBold', fontSize: 16},
//   locationRow: {flexDirection: 'row', marginTop: 6},
//   address: {paddingLeft: 4, flexShrink: 1, color: '#555'},
//   dateTimeBox: {alignItems: 'flex-end'},
//   dateText: {color: '#ED1F24', fontFamily: 'Poppins-SemiBold'},
//   timeText: {fontSize: 12, color: '#333'},
//   updateBtn: {
//     backgroundColor: '#ED1F24',
//     paddingVertical: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   updateBtnText: {color: '#fff', fontFamily: 'Poppins-SemiBold'},
//   actionRow: {flexDirection: 'row', justifyContent: 'space-between'},
//   directionBtn: {
//     backgroundColor: '#424242',
//     padding: 10,
//     borderRadius: 6,
//     flex: 1,
//     marginRight: 5,
//   },
//   contactBtn: {
//     backgroundColor: '#4285F4',
//     padding: 10,
//     borderRadius: 6,
//     flex: 1,
//     marginLeft: 5,
//   },
//   buttonText: {color: '#fff', textAlign: 'center', fontWeight: 'bold'},
//   summaryBox: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 16,
//   },
//   summaryTitle: {fontWeight: 'Poppins-SemiBold', marginBottom: 8},
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 4,
//   },
//   summaryLabel: {fontFamily: 'Poppins-SemiBold'},
//   summaryBold: {fontFamily: 'Poppins-SemiBold'},
//   requestBtn: {
//     backgroundColor: '#FFA500',
//     padding: 16,
//     alignItems: 'center',
//     borderRadius: 6,
//     position: 'absolute',
//     bottom: 20,
//     left: 16,
//     right: 16,
//   },
//   requestText: {
//     color: '#fff',
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 16,
//   },
//   section: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 14,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   sectionTitle: {
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//     fontSize: 15,
//   },
//   rowText: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 6,
//   },
//   leftText: {
//     fontSize: 12,
//     color: '#333',
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },
//   rightText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   leftTextBold: {
//     fontSize: 12,
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },
//   rightTextBold: {
//     fontSize: 12,
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },
//   dottedLine: {
//     borderBottomWidth: 1.5,
//     borderBottomColor: '#999',
//     borderStyle: 'dotted',
//     marginVertical: 8,
//     marginRight: 20,
//     width: '100%',
//   },
// });

// export default NewPayment;
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native'; // ✅ Import hook

const NewPayment = () => {
  const navigation = useNavigation(); // ✅ Initialize navigation

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Customer Details</Text>

        {/* Customer Card */}
        <View style={styles.card}>
          <View style={styles.customerTop}>
            <View style={{flex: 1}}>
              <Text style={styles.customerName}>Sonali K</Text>
              <View style={styles.locationRow}>
                <Icon name="location-pin" size={16} color="#ED1F24" />
                <Text style={styles.address}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do
                </Text>
              </View>
            </View>
            <View style={styles.dateTimeBox}>
              <Text style={styles.dateText}>28-02-2025</Text>
              <Text style={styles.timeText}>12:00 PM</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.updateBtn}>
            <Text style={styles.updateBtnText}>Update Status</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.directionBtn}>
              <Text style={styles.buttonText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}>
              <Image
                source={require('../../assets/icons/contact.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.buttonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurements Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Measurements Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Interior</Text>
            <Text style={styles.rightText}>2000 sq ft</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Exterior</Text>
            <Text style={styles.rightText}>2000 sq ft</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Others</Text>
            <Text style={styles.rightText}>1688 sq ft</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftTextBold}>Total measurement</Text>
            <Text style={styles.rightTextBold}>2000 sq ft</Text>
          </View>
        </View>

        {/* Quote Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quotes Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Quote 1</Text>
            <Text style={styles.rightText}>₹ 56000</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Quote 2</Text>
            <Text style={styles.rightText}>₹ 56000</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryBold}>₹ 20,537</Text>
            <Image
              source={require('../../assets/icons/edit.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.summaryRow}>
            <Text>Amount paid</Text>
            <Text>₹ 4,000</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Amount yet to paid</Text>
            <Text>₹ 6,537</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <TouchableOpacity
        style={styles.requestBtn}
        onPress={() => navigation.navigate('JobOngoingFinal')}>
        <Text style={styles.requestText}>Request Next Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F6F6'},
  scroll: {padding: 16, paddingBottom: 100},
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 26,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    marginTop: 20,
  },
  customerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerName: {fontFamily: 'Poppins-SemiBold', fontSize: 16},
  locationRow: {flexDirection: 'row', marginTop: 6},
  address: {paddingLeft: 4, flexShrink: 1, color: '#555'},
  dateTimeBox: {alignItems: 'flex-end'},
  dateText: {color: '#ED1F24', fontFamily: 'Poppins-SemiBold'},
  timeText: {fontSize: 12, color: '#333'},
  updateBtn: {
    backgroundColor: '#ED1F24',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10,
  },
  updateBtnText: {color: '#fff', fontFamily: 'Poppins-SemiBold'},
  actionRow: {flexDirection: 'row', justifyContent: 'space-between'},
  directionBtn: {
    backgroundColor: '#424242',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
  },
  contactBtn: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {color: '#fff', textAlign: 'center', fontWeight: 'bold'},
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  summaryTitle: {fontWeight: 'Poppins-SemiBold', marginBottom: 8},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {fontFamily: 'Poppins-SemiBold'},
  summaryBold: {fontFamily: 'Poppins-SemiBold'},
  requestBtn: {
    backgroundColor: '#FFA500',
    padding: 16,
    alignItems: 'center',
    borderRadius: 6,
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  requestText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  rowText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  leftText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  rightText: {
    fontSize: 14,
    color: '#333',
  },
  leftTextBold: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  rightTextBold: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  dottedLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 8,
    marginRight: 20,
    width: '100%',
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
});

export default NewPayment;
