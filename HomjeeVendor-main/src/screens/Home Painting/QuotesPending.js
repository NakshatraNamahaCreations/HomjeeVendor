// import React from 'react';
// import { useNavigation } from '@react-navigation/native';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';

// const QuotesPending = () => {
//   return (
//     <View style={{flex: 1, backgroundColor: '#f2f2f2'}}>
//       <Text
//         style={{
//           backgroundColor: '#008E00',
//           padding: 10,
//           textAlign: 'center',
//           color: 'white',
//           fontFamily: 'Poppins-SemiBold',
//         }}>
//         Hired
//       </Text>
//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Header */}
//         <Text style={{fontFamily: 'Poppins-SemiBold', marginTop: 20}}>
//           Customer Details
//         </Text>
//         {/* Customer Info */}
//         <View style={styles.card}>
//           <View style={styles.rowBetween}>
//             <Text style={styles.customerName}>Sonali K</Text>
//             <View style={{alignItems: 'flex-end'}}>
//               <Text style={styles.dateText}>28-02-2025</Text>
//               <Text style={styles.timeText}>12:00 PM</Text>
//             </View>
//           </View>

//           <View style={styles.addressRow}>
//             <Icon name="location-sharp" size={14} color="#ED1F24" />
//             <Text style={styles.addressText}>
//               Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//             </Text>
//           </View>

//           <TouchableOpacity style={styles.updateStatusBtn}>
//             <Text style={styles.updateStatusText}>Update Status</Text>
//           </TouchableOpacity>

//           <View style={styles.actionsRow}>
//             <TouchableOpacity style={styles.directionBtn}>
//               <Image
//                 source={require('../../assets/icons/navigation.png')}
//                 style={styles.cardIcon}
//               />
//               <Text style={styles.contactText}> Directions</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.contactBtn}>
//               <Image
//                 source={require('../../assets/icons/contact.png')}
//                 style={styles.cardIcon}
//               />
//               <Text style={styles.contactText}> Contact</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Measurements Summary */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.sectionTitle}>Measurements Summary</Text>
//             <Image
//               source={require('../../assets/icons/arrowredcircle.png')}
//               style={{width: 20, height: 20}}
//             />
//           </View>
//           <View style={styles.dottedLine} />
//           {[
//             ['Interior', '2000 sq ft'],
//             ['Exterior', '2000 sq ft'],
//             ['Others', '1688 sq ft'],
//             ['Total measurement', '2000 sq ft'],
//           ].map(([label, value], index) => (
//             <View
//               key={label}
//               style={[
//                 styles.row,
//                 index === 3 && {
//                   borderTopWidth: 1,
//                   marginTop: 10,
//                   paddingTop: 10,
//                 },
//               ]}>
//               <Text style={styles.label}>{label}</Text>
//               <Text style={styles.value}>{value}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Quotes Summary */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.sectionTitle}>Quotes Summary</Text>
//             <Image
//               source={require('../../assets/icons/arrowredcircle.png')}
//               style={{width: 20, height: 20}}
//             />
//           </View>

//           <View style={styles.dottedLine} />
//           <View style={styles.row}>
//             <Text style={styles.label}>Quote 1 </Text>
//             <Text
//               style={{
//                 color: 'red',
//                 marginRight: 150,
//                 fontFamily: 'Poppins-SemiBold',
//               }}>
//               Final Quote
//             </Text>
//             <Text style={{marginLeft: -40, fontFamily: 'Poppins-SemiBold'}}>
//               ₹ 56000
//             </Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Quote 2</Text>
//             <Text style={styles.value}>₹ 86000</Text>
//           </View>
//         </View>

//         {/* Payment Details */}
//         <View style={styles.card}>
//           <View style={styles.row}>
//             <Text style={styles.boldLabel}>Total Amount</Text>
//             <Text style={{marginLeft: 100, fontFamily: 'Poppins-SemiBold'}}>
//               ₹ 20,537
//             </Text>
//             <Image
//               source={require('../../assets/icons/edit.png')}
//               style={{width: 20, height: 20}}
//             />
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Amount paid</Text>
//             <Text style={styles.value}>₹ 4,000</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Amount yet to paid</Text>
//             <Text style={styles.value}>₹ 6,537</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Button */}
//       <TouchableOpacity
//         style={styles.bottomBtn}
//         onPress={() => navigation.navigate('Jobquotes')}>
//         <Text style={styles.bottomBtnText}>Request Next Payment</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default QuotesPending;

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     paddingBottom: 80,
//   },
//   header: {
//     backgroundColor: '#fff',
//     padding: 16,
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   headerTitle: {
//     fontSize: 20,
//     color: '#000',
//     fontFamily: 'Poppins-SemiBold',
//   },
//   hiredBadge: {
//     backgroundColor: '#0EAC15',
//     alignSelf: 'flex-start',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     borderRadius: 4,
//     marginTop: 10,
//   },
//   hiredText: {
//     color: '#fff',
//     fontSize: 12,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 16,
//     marginTop: 15,
//     elevation: 2,
//   },
//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   customerName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   dateText: {
//     color: '#ED1F24',
//     fontFamily: 'Poppins-SemiBold',
//   },
//   timeText: {
//     fontWeight: '600',
//     color: '#000',
//   },
//   addressRow: {
//     flexDirection: 'row',
//     marginTop: 10,
//     gap: 4,
//     alignItems: 'flex-start',
//   },
//   addressText: {
//     flex: 1,
//     color: '#444',
//     fontSize: 13,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   updateStatusBtn: {
//     backgroundColor: '#ED1F24',
//     marginTop: 15,
//     padding: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   updateStatusText: {
//     color: '#fff',
//     fontFamily: 'Poppins-SemiBold',
//   },
//   actionsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 15,
//     gap: 10,
//   },
//   directionBtn: {
//     backgroundColor: '#616161',
//     padding: 10,
//     borderRadius: 6,
//     flex: 1,
//     marginRight: 8,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   contactBtn: {
//     flex: 1,
//     backgroundColor: '#4285F4',
//     borderRadius: 6,
//     alignItems: 'center',
//     padding: 10,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 15,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 6,
//   },
//   label: {
//     color: '#444',
//     fontSize: 14,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   boldLabel: {
//     color: '#000',
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 15,
//   },
//   value: {
//     color: '#000',
//     fontFamily: 'Poppins-SemiBold',
//   },
//   amount: {
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: 16,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   bottomBtn: {
//     backgroundColor: '#FF8C00',
//     padding: 15,
//     borderRadius: 6,
//     alignItems: 'center',
//     position: 'absolute',
//     bottom: 10,
//     left: 10,
//     right: 10,
//   },
//   bottomBtnText: {
//     color: '#fff',

//     fontSize: 16,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   contactText: {
//     color: 'white',
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 14,
//   },
//   dottedLine: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#999',
//     borderStyle: 'dashed',
//   },
// });
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const QuotesPending = () => {
  const navigation = useNavigation();

  return (
    <View style={{flex: 1, backgroundColor: '#f2f2f2'}}>
      {/* Hired Banner */}
      <Text
        style={{
          backgroundColor: '#008E00',
          padding: 10,
          textAlign: 'center',
          color: 'white',
          fontFamily: 'Poppins-SemiBold',
        }}>
        Hired
      </Text>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Section Title */}
        <Text style={{fontFamily: 'Poppins-SemiBold', marginTop: 20}}>
          Customer Details
        </Text>

        {/* Customer Info Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.customerName}>Sonali K</Text>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.dateText}>28-02-2025</Text>
              <Text style={styles.timeText}>12:00 PM</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Icon name="location-sharp" size={14} color="#ED1F24" />
            <Text style={styles.addressText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            </Text>
          </View>

          <TouchableOpacity style={styles.updateStatusBtn}>
            <Text style={styles.updateStatusText}>Update Status</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.directionBtn}>
              <Image
                source={require('../../assets/icons/navigation.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.contactText}> Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}>
              <Image
                source={require('../../assets/icons/contact.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.contactText}> Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurements Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Measurements Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={{width: 20, height: 20}}
            />
          </View>
          <View style={styles.dottedLine} />
          {[
            ['Interior', '2000 sq ft'],
            ['Exterior', '2000 sq ft'],
            ['Others', '1688 sq ft'],
            ['Total measurement', '2000 sq ft'],
          ].map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Quotes Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Quotes Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={{width: 20, height: 20}}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.row}>
            <Text style={styles.label}>Quote 1 </Text>
            <Text
              style={{
                color: 'red',
                marginRight: 150,
                fontFamily: 'Poppins-SemiBold',
              }}>
              Final Quote
            </Text>
            <Text style={{marginLeft: -40, fontFamily: 'Poppins-SemiBold'}}>
              ₹ 56000
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quote 2</Text>
            <Text style={styles.value}>₹ 86000</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.boldLabel}>Total Amount</Text>
            <Text style={{marginLeft: 100, fontFamily: 'Poppins-SemiBold'}}>
              ₹ 20,537
            </Text>
            <Image
              source={require('../../assets/icons/edit.png')}
              style={{width: 20, height: 20}}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount paid</Text>
            <Text style={styles.value}>₹ 4,000</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount yet to paid</Text>
            <Text style={styles.value}>₹ 6,537</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <TouchableOpacity
        style={styles.bottomBtn}
        onPress={() => navigation.navigate('Jobquotes')}>
        <Text style={styles.bottomBtnText}>Request Next Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuotesPending;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 15,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dateText: {
    color: '#ED1F24',
    fontFamily: 'Poppins-SemiBold',
  },
  timeText: {
    fontWeight: '600',
    color: '#000',
  },
  addressRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 4,
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    color: '#444',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  updateStatusBtn: {
    backgroundColor: '#ED1F24',
    marginTop: 15,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateStatusText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  directionBtn: {
    backgroundColor: '#616161',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: '#4285F4',
    borderRadius: 6,
    alignItems: 'center',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    color: '#444',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  boldLabel: {
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  value: {
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  bottomBtn: {
    backgroundColor: '#FF8C00',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  bottomBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  contactText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dashed',
  },
});
