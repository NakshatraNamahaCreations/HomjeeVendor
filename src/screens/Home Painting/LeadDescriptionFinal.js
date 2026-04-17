// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Modal,
// } from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome'; // Back arrow

// // Default lead data
// const DEFAULT_LEAD = {
//   name: 'Sonali',
//   category: 'Deep Cleaning',
//   address:
//     '1st floor, Darshan Plaza, Dwaraka Nagar, Banashankari 6th Stage 1st Block',
//   date: '28-02-2025',
//   time: '12:00 PM',
// };

// const LeadDescriptionFinal = () => {
//   const navigation = useNavigation();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [secondModalVisible, setSecondModalVisible] = useState(false);

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Header with back arrow and title */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}></TouchableOpacity>
//           <Text style={styles.headerTitle}>Customer Details</Text>
//         </View>

//         {/* Customer Details */}
//         <View style={styles.headerBlock}>
//           <View style={styles.headerTop}>
//             <Text style={styles.customerName}>{DEFAULT_LEAD.name}</Text>
//             <View style={{alignItems: 'flex-end'}}>
//               <Text style={styles.dateText}>{DEFAULT_LEAD.date}</Text>
//               <Text style={styles.timeText}>{DEFAULT_LEAD.time}</Text>
//             </View>
//           </View>
//           <View style={{flexDirection: 'row'}}>
//             <Image
//               source={require('../../assets/icons/location.png')}
//               style={{marginTop: 9, marginRight: 5, width: 20, height: 20}}
//             />
//             <Text style={styles.descriptionText}>{DEFAULT_LEAD.address}</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.updateButton}
//             onPress={() => {
//               setModalVisible(false);
//               setSecondModalVisible(true);
//             }}>
//             <Text style={styles.updateButtonText}>Update Status</Text>
//             <Image
//               source={require('../../assets/icons/interface.png')}
//               style={{top: 8, marginLeft: 150}}
//             />
//           </TouchableOpacity>

//           <View style={styles.buttonRow}>
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
//         <View style={styles.summarySection}>
//           <View style={styles.iconTextRow}>
//             <Text style={styles.sectionTitle}>Measurements Summary</Text>
//             <Image
//               source={require('../../assets/icons/arrowredcircle.png')}
//               style={styles.icon}
//             />
//           </View>
//           <View style={styles.dottedLine} />
//           <View style={styles.measurementRow}>
//             <Text style={styles.measurementLabel}>Interior</Text>
//             <Text style={styles.measurementValue}>2000 sq ft</Text>
//           </View>
//           <View style={styles.measurementRow}>
//             <Text style={styles.measurementLabel}>Exterior</Text>
//             <Text style={styles.measurementValue}>2000 sq ft</Text>
//           </View>
//           <View style={styles.measurementRow}>
//             <Text style={styles.measurementLabel}>Others</Text>
//             <Text style={styles.measurementValue}>1658 sq ft</Text>
//           </View>
//           <View style={styles.dottedLine} />
//           <View style={styles.measurementRow}>
//             <Text style={styles.measurementLabel}>Total Measurement</Text>
//             <Text style={styles.measurementValue}>2000 sq ft</Text>
//           </View>
//         </View>

//         {/* Quotes Summary */}
//         <View style={styles.summarySection}>
//           <View style={styles.iconTextRow}>
//             <Text style={styles.sectionTitle}>Quotes Summary</Text>
//             <Image
//               source={require('../../assets/icons/arrowredcircle.png')}
//               style={styles.icon}
//             />
//           </View>
//           <View style={styles.dottedLine} />
//           <View style={styles.quoteRow}>
//             <Text style={styles.quoteLabel}>Quote 1</Text>
//             <Text style={styles.quoteStatus}>Final Quote</Text>
//             <Text style={styles.quoteAmount}>₹ 56000</Text>
//           </View>
//           <View style={styles.quoteRow}>
//             <Text style={styles.quoteLabel}>Quote 2</Text>
//             <Text style={styles.quoteAmount}>₹ 60000</Text>
//           </View>
//           <View style={styles.dottedLine} />
//         </View>

//         {/* Job Started Section */}
//         <View style={styles.jobStartedSection}>
//           <Text style={styles.jobStartedText}>
//             Job Started at: 28-02-2025 12:00 PM
//           </Text>
//         </View>
//         <View style={styles.dottedLine} />

//         {/* Map */}
//         <Image
//           style={styles.map}
//           source={require('../../assets/images/googlemap.png')}
//           resizeMode="contain"
//         />
//       </ScrollView>

//       {/* End Job Button */}
//       <TouchableOpacity
//         style={styles.endJobButton}
//         onPress={() => navigation.navigate('SurveyCompleted')}>
//         <Text style={styles.endJobText}>End Job</Text>
//       </TouchableOpacity>

//       {/* Modal for Update Status */}
//       <Modal
//         transparent={true}
//         animationType="fade"
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Update Status</Text>
//             <Text style={styles.modalMessage}>
//               Do you want to update the status of this job?
//             </Text>

//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={() => setModalVisible(false)}>
//               <Text style={styles.modalButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F6F6F6',
//   },
//   scrollContent: {
//     padding: 10,
//     flexGrow: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 15,
//     fontFamily: 'Poppins-SemiBold',
//     marginLeft: 10,
//   },
//   headerBlock: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 10,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 5},
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   customerName: {fontSize: 16, fontFamily: 'Poppins-SemiBold'},
//   dateText: {
//     color: '#ED1F24',
//     fontSize: 13,
//     fontFamily: 'Poppins-SemiBold',
//     marginTop: -20,
//   },
//   timeText: {fontSize: 15, color: '#474141'},
//   descriptionText: {
//     marginVertical: 8,
//     color: '#575757',
//     fontSize: 13,
//     fontFamily: 'Poppins-Bold',
//   },
//   updateButton: {
//     backgroundColor: '#ED1F24',
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   updateButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontFamily: 'Poppins-Bold',
//     marginRight: 40,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   directionBtn: {
//     backgroundColor: '#616161',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   contactBtn: {
//     backgroundColor: '#4285F4',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   cardIcon: {
//     width: 20,
//     height: 20,
//   },
//   contactText: {
//     fontSize: 14,
//     color: '#fff',
//     marginLeft: 10,
//   },
//   summarySection: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontFamily: 'Poppins-SemiBold',
//     marginBottom: 10,
//   },
//   iconTextRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   icon: {
//     width: 20,
//     height: 20,
//     marginRight: 10,
//   },
//   measurementLabel: {
//     fontSize: 12,
//     fontWeight: '500',
//     flex: 1,
//     lineHeight: 30,
//   },
//   measurementValue: {
//     fontSize: 12,
//     fontFamily: 'Poppins-SemiBold',
//     color: '#555',
//     flex: 1,
//     textAlign: 'right',
//     marginTop: -20,
//   },
//   quoteLabel: {
//     fontSize: 12,
//     fontFamily: 'Poppins-SemiBold',
//     flex: 1,
//   },
//   quoteStatus: {
//     fontSize: 12,
//     fontFamily: 'Poppins-SemiBold',
//     color: '#FF4C4C',
//     flex: 1,
//     textAlign: 'center',
//     marginTop: -20,
//     marginRight: 120,
//   },
//   quoteAmount: {
//     fontSize: 12,
//     fontFamily: 'Poppins-SemiBold',
//     color: '#333',
//     flex: 1,
//     textAlign: 'right',
//     marginTop: -20,
//   },
//   dottedLine: {
//     borderBottomWidth: 1,
//     borderBottomColor: 'black',
//     borderStyle: 'dashed',
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   jobStartedSection: {
//     marginBottom: 20,
//     padding: 10,

//     borderRadius: 8,
//   },
//   jobStartedText: {
//     fontSize: 15,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   map: {
//     width: '100%',
//     height: 200,
//     marginBottom: 50,
//     marginTop: -30,
//   },
//   endJobButton: {
//     backgroundColor: '#ED1F24',
//     paddingVertical: 14,
//     alignItems: 'center',
//     borderRadius: 10,
//     position: 'absolute',
//     bottom: 20,
//     left: 10,
//     right: 10,
//   },
//   endJobText: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: '700',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: 300,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   modalMessage: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   modalButton: {
//     backgroundColor: '#ED1F24',
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 5,
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// export default LeadDescriptionFinal;
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Back arrow

// Default lead data
const DEFAULT_LEAD = {
  name: 'Sonali',
  category: 'Deep Cleaning',
  address:
    '1st floor, Darshan Plaza, Dwaraka Nagar, Banashankari 6th Stage 1st Block',
  date: '28-02-2025',
  time: '12:00 PM',
};

const LeadDescriptionFinal = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back arrow and title */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}></TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Details</Text>
        </View>

        {/* Customer Details */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTop}>
            <Text style={styles.customerName}>{DEFAULT_LEAD.name}</Text>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.dateText}>{DEFAULT_LEAD.date}</Text>
              <Text style={styles.timeText}>{DEFAULT_LEAD.time}</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Image
              source={require('../../assets/icons/location.png')}
              style={{marginTop: 9, marginRight: 5, width: 20, height: 20}}
            />
            <Text style={styles.descriptionText}>{DEFAULT_LEAD.address}</Text>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, {opacity: 0.4}]}
            disabled>
            <Text style={styles.updateButtonText}>Update Status</Text>
            <Image
              source={require('../../assets/icons/interface.png')}
              style={{top: 8, marginLeft: 150}}
            />
          </TouchableOpacity>

          <View style={styles.buttonRow}>
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
        <View style={styles.summarySection}>
          <View style={styles.iconTextRow}>
            <Text style={styles.sectionTitle}>Measurements Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Interior</Text>
            <Text style={styles.measurementValue}>2000 sq ft</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Exterior</Text>
            <Text style={styles.measurementValue}>2000 sq ft</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Others</Text>
            <Text style={styles.measurementValue}>1658 sq ft</Text>
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Total Measurement</Text>
            <Text style={styles.measurementValue}>2000 sq ft</Text>
          </View>
        </View>

        {/* Quotes Summary */}
        <View style={styles.summarySection}>
          <View style={styles.iconTextRow}>
            <Text style={styles.sectionTitle}>Quotes Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Quote 1</Text>
            <Text style={styles.quoteStatus}>Final Quote</Text>
            <Text style={styles.quoteAmount}>₹ 56000</Text>
          </View>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Quote 2</Text>
            <Text style={styles.quoteAmount}>₹ 60000</Text>
          </View>
          <View style={styles.dottedLine} />
        </View>

        {/* Job Started Section */}
        <View style={styles.jobStartedSection}>
          <Text style={styles.jobStartedText}>
            Job Started at: 28-02-2025 12:00 PM
          </Text>
        </View>
        <View style={styles.dottedLine} />

        {/* Map */}
        <Image
          style={styles.map}
          source={require('../../assets/images/googlemap.png')}
          resizeMode="contain"
        />
      </ScrollView>

      {/* End Job Button */}
      <TouchableOpacity
        style={styles.endJobButton}
        onPress={() => navigation.navigate('SurveyCompleted')}>
        <Text style={styles.endJobText}>End Job</Text>
      </TouchableOpacity>

      {/* Modal for Update Status */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <Text style={styles.modalMessage}>
              Do you want to update the status of this job?
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  scrollContent: {
    padding: 10,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 10,
  },
  headerBlock: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  customerName: {fontSize: 16, fontFamily: 'Poppins-SemiBold'},
  dateText: {
    color: '#ED1F24',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    marginTop: -20,
  },
  timeText: {fontSize: 15, color: '#474141'},
  descriptionText: {
    marginVertical: 8,
    color: '#575757',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  updateButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    marginRight: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionBtn: {
    backgroundColor: '#616161',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  contactBtn: {
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  cardIcon: {
    width: 20,
    height: 20,
  },
  contactText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 10,
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  iconTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  measurementLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 30,
  },
  measurementValue: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#555',
    flex: 1,
    textAlign: 'right',
    marginTop: -20,
  },
  quoteLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  quoteStatus: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FF4C4C',
    flex: 1,
    textAlign: 'center',
    marginTop: -20,
    marginRight: 120,
  },
  quoteAmount: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginTop: -20,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderStyle: 'dashed',
    marginTop: 10,
    marginBottom: 10,
  },
  jobStartedSection: {
    marginBottom: 20,
    padding: 10,

    borderRadius: 8,
  },
  jobStartedText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  map: {
    width: '100%',
    height: 200,
    marginBottom: 50,
    marginTop: -30,
  },
  endJobButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  endJobText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
export default LeadDescriptionFinal;
