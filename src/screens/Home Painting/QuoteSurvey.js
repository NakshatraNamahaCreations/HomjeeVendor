// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ScrollView,
//   Modal,
// } from 'react-native';

// const QuoteSurvey = ({route, navigation}) => {
//   const {lead, measurementSummary} = route.params; // Access the passed parameters
//   const [modalVisible, setModalVisible] = useState(false); // To manage modal visibility
//   const [selectedStatus, setSelectedStatus] = useState(null); // To manage selected status option

//   // Function to handle when "End Job" button is pressed
//   const handleEndJobPress = () => {
//     setModalVisible(true); // Open the modal
//   };

//   // Function to handle confirmation of end job
//   const handleConfirmEndJob = () => {
//     console.log('End job confirmed with status:', selectedStatus);
//     setModalVisible(false); // Close the modal
//     navigation.navigate('OngoingLeadsScreen'); // Navigate to the next screen after confirmation
//   };

//   return (
//     <View style={styles.container}>
//       {/* Back Button */}
//       <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         style={styles.backButton}></TouchableOpacity>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         style={styles.scrollContainer}>
//         {/* Customer Details Section */}
//         <Text style={styles.sectionHeader}>Customer Details</Text>
//         <View style={styles.headerBlock}>
//           <View style={styles.headerTop}>
//             <Text style={styles.customerName}>{lead.name}Sonali K</Text>
//             <View style={{alignItems: 'flex-end'}}>
//               <Text style={styles.dateText}>{lead.date}28-02-2025</Text>
//               <Text style={styles.timeText}>{lead.time}12:00 PM</Text>
//             </View>
//           </View>
//           <View style={{flexDirection: 'row'}}>
//             <Image
//               source={require('../../assets/icons/location.png')}
//               style={{marginTop: 9, marginRight: 5, width: 20, height: 20}}
//             />
//             <Text style={styles.descriptionText}>
//               {lead.address}Lorem ipsum dolor sit amet, consectetur adipiscing
//               elit, sed do
//             </Text>
//           </View>
//           <TouchableOpacity
//             style={styles.updateButton}
//             onPress={() => setModalVisible(true)}>
//             <Text style={styles.updateButtonText}>Update Status</Text>
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

//         {/* Measurement Summary Section */}
//         <View style={styles.section}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               backgroundColor: 'white',
//             }}>
//             <Text style={styles.sectionHeader}>Measurement Summary</Text>
//             <Image
//               source={require('../../assets/icons/arrowredcircle.png')}
//               style={{marginRight: -10, marginTop: -3}}
//             />
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryText}>Interior</Text>
//             <Text style={styles.summaryValue}>2000 sq ft</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryText}>Exterior</Text>
//             <Text style={styles.summaryValue}>12000 sq ft</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryText}>Others</Text>
//             <Text style={styles.summaryValue}>1688 sq ft</Text>
//           </View>
//         </View>

//         {/* Quote Summary Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionHeader}>Quotes Summary</Text>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryText}>Quote 1</Text>
//             <Text style={styles.summaryValue}>₹66,000</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryText}>Quote 2</Text>
//             <Text style={styles.summaryValue}>₹56,000</Text>
//           </View>
//         </View>

//         {/* Job Started Details Section */}
//         <Text style={styles.sectionHeader}>
//           Job Started at : 28-02-2025 12:00 PM
//         </Text>
//         <Text style={styles.sectionText}>
//           {lead.date} {lead.time}
//         </Text>

//         {/* Map */}
//         <Image
//           style={styles.map}
//           source={require('../../assets/images/googlemap.png')}
//           resizeMode="contain"
//         />
//       </ScrollView>

//       {/* End Job Button (Fixed at the bottom) */}
//       <TouchableOpacity style={styles.endButton} onPress={handleEndJobPress}>
//         <Text style={styles.endButtonText}>End Job</Text>
//       </TouchableOpacity>

//       {/* Modal for selecting job status */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Pick One</Text>

//             {/* Radio button options for status */}
//             <TouchableOpacity
//               style={styles.modalOption}
//               onPress={() => setSelectedStatus('Set Remainder')}>
//               <View
//                 style={[
//                   styles.radioButton,
//                   selectedStatus === 'Set Remainder' && styles.selectedRadio,
//                 ]}>
//                 {selectedStatus === 'Set Remainder' && (
//                   <View style={styles.innerCircle} />
//                 )}
//               </View>
//               <Text style={styles.modalOptionText}>Set Remainder</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalOption}
//               onPress={() => setSelectedStatus('Mark Hiring')}>
//               <View
//                 style={[
//                   styles.radioButton,
//                   selectedStatus === 'Mark Hiring' && styles.selectedRadio,
//                 ]}>
//                 {selectedStatus === 'Mark Hiring' && (
//                   <View style={styles.innerCircle} />
//                 )}
//               </View>
//               <Text style={styles.modalOptionText}>Mark Hiring</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalOption}
//               onPress={() => setSelectedStatus('Customer Unreachable')}>
//               <View
//                 style={[
//                   styles.radioButton,
//                   selectedStatus === 'Customer Unreachable' &&
//                     styles.selectedRadio,
//                 ]}>
//                 {selectedStatus === 'Customer Unreachable' && (
//                   <View style={styles.innerCircle} />
//                 )}
//               </View>
//               <Text style={styles.modalOptionText}>Customer Unreachable</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalOption}
//               onPress={() => setSelectedStatus('Customer Denied')}>
//               <View
//                 style={[
//                   styles.radioButton,
//                   selectedStatus === 'Customer Denied' && styles.selectedRadio,
//                 ]}>
//                 {selectedStatus === 'Customer Denied' && (
//                   <View style={styles.innerCircle} />
//                 )}
//               </View>
//               <Text style={styles.modalOptionText}>Customer Denied</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalOption}
//               onPress={() =>
//                 setSelectedStatus('Customer Negotiation going on')
//               }>
//               <View
//                 style={[
//                   styles.radioButton,
//                   selectedStatus === 'Customer Negotiation going on' &&
//                     styles.selectedRadio,
//                 ]}>
//                 {selectedStatus === 'Customer Negotiation going on' && (
//                   <View style={styles.innerCircle} />
//                 )}
//               </View>
//               <Text style={styles.modalOptionText}>
//                 Customer Negotiation going on
//               </Text>
//             </TouchableOpacity>

//             {/* Confirm Button */}
//             <TouchableOpacity
//               style={styles.confirmButton}
//               onPress={handleConfirmEndJob}>
//               <Text style={styles.confirmButtonText}>Confirm</Text>
//             </TouchableOpacity>

//             {/* Close Button */}
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={() => setModalVisible(false)}>
//               <Text style={styles.cancelButtonText}>Cancel</Text>
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
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: 40,
//     paddingLeft: 20,
//   },
//   backIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 10,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000',
//   },
//   scrollContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 100, // To make room for the fixed "End Job" button
//   },
//   customerDetails: {
//     backgroundColor: '#FFFFFF',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   customerName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000',
//     marginTop: 20,
//   },
//   customerDate: {
//     fontSize: 14,
//     color: '#ED1F24',
//     marginTop: 5,
//   },
//   customerAddress: {
//     fontSize: 13,
//     color: '#575757',
//     marginTop: 10,
//   },
//   updateButton: {
//     backgroundColor: '#ED1F24',
//     borderRadius: 6,
//     paddingVertical: 12,
//     marginTop: 15,
//     alignItems: 'center',
//   },
//   updateButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 15,
//   },
//   directionBtn: {
//     backgroundColor: '#616161',
//     padding: 10,
//     borderRadius: 6,
//     flex: 1,
//     marginRight: 8,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     color: 'white',
//   },
//   contactBtn: {
//     backgroundColor: '#4285F4',
//     padding: 10,
//     borderRadius: 6,
//     flex: 1,
//     marginLeft: 8,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     color: 'white',
//   },
//   contactText: {
//     color: '#fff',
//   },
//   section: {
//     backgroundColor: '#FFFFFF',
//     padding: 15,
//     marginBottom: 15,
//     borderRadius: 10,
//     marginTop: 30,
//   },
//   sectionHeader: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#4D4D4D',
//     marginBottom: 10,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   summaryText: {
//     fontSize: 14,
//     color: '#575757',
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '600',
//   },
//   finalQuoteButton: {
//     backgroundColor: '#FF0000',
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   finalQuoteText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   sectionText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   map: {
//     width: '100%',
//     height: 100,
//     marginBottom: 120,
//   },
//   endButton: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: '#ED1F24',
//     paddingVertical: 16,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   endButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 15,
//   },
//   modalOption: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     paddingVertical: 10,
//     alignItems: 'center',
//   },
//   modalOptionText: {
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 10,
//   },
//   radioButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: '#333',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectedRadio: {
//     backgroundColor: '#ED1F24',
//   },
//   innerCircle: {
//     width: 12,
//     height: 12,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//   },
//   confirmButton: {
//     backgroundColor: '#ED1F24',
//     paddingVertical: 10,
//     borderRadius: 6,
//     marginTop: 15,
//     alignItems: 'center',
//   },
//   confirmButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   cancelButton: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#D5D7DA',
//     paddingVertical: 10,
//     borderRadius: 6,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#333',
//     fontSize: 14,
//   },
//   descriptionText: {
//     marginRight: 20,
//   },
//   dateText: {
//     marginTop: -20,
//     fontFamily: 'Poppins-SemiBold',
//   },
// });

// export default QuoteSurvey;
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
} from 'react-native';

const QuoteSurvey = ({route, navigation}) => {
  const {lead, measurementSummary} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Function to handle when "End Job" button is pressed
  const handleEndJobPress = () => {
    setModalVisible(true); // Open the modal
  };

  // Function to handle confirmation of end job
  const handleConfirmEndJob = () => {
    console.log('End job confirmed with status:', selectedStatus);
    setModalVisible(false); // Close the modal

    // Check if the selected status is "Customer Negotiation going on"
    if (selectedStatus === 'Customer Negotiation going on') {
      // Navigate to the "HiredQuote" screen
      navigation.navigate('HiredQuote', {lead, measurementSummary});
    } else {
      // Handle other statuses if necessary
      navigation.navigate('OngoingLeadsScreen'); // Or any other screen
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}></TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}>
        {/* Customer Details Section */}
        <Text style={styles.sectionHeader}>Customer Details</Text>
        <View style={styles.headerBlock}>
          <View style={styles.headerTop}>
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>
              {lead.name}Sonali
            </Text>
            <View style={{alignItems: 'flex-end'}}>
              <Text
                style={{
                  marginTop: -20,
                  fontFamily: 'Poppins-SemiBold',
                  color: 'red',
                }}>
                {lead.date}28-02-2025
              </Text>
              <Text style={styles.timeText}>{lead.time}12:00 PM</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Image
              source={require('../../assets/icons/location.png')}
              style={{marginTop: 9, marginRight: 5, width: 20, height: 20}}
            />
            <Text style={styles.descriptionText}>
              {lead.address}1st floor, Darshan Plaza, Dwaraka Nagar,
              Banashankari 6th Stage 1st Block, .......
            </Text>
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.updateButtonText}>Update Status</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.directionBtn}>
              <Image
                source={require('../../assets/icons/navigation.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.contactText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}>
              <Image
                source={require('../../assets/icons/contact.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurement Summary Section */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: 'white',
            }}>
            <Text style={styles.sectionHeader}>Measurement Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={{marginRight: -10, marginTop: -3}}
            />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Interior</Text>
            <Text style={styles.summaryValue}>2000 sq ft</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Exterior</Text>
            <Text style={styles.summaryValue}>12000 sq ft</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Others</Text>
            <Text style={styles.summaryValue}>1688 sq ft</Text>
          </View>
        </View>

        {/* Quote Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Quotes Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Quote 1</Text>
            <Text style={styles.summaryValue}>₹66,000</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Quote 2</Text>
            <Text style={styles.summaryValue}>₹56,000</Text>
          </View>
        </View>

        {/* Job Started Details Section */}
        <Text style={styles.sectionHeader}>
          Job Started at : 28-02-2025 12:00 PM
        </Text>
        <Text style={styles.sectionText}>
          {lead.date} {lead.time}
        </Text>

        {/* Map */}
        <Image
          style={styles.map}
          source={require('../../assets/images/googlemap.png')}
          resizeMode="contain"
        />
      </ScrollView>

      {/* End Job Button (Fixed at the bottom) */}
      <TouchableOpacity style={styles.endButton} onPress={handleEndJobPress}>
        <Text style={styles.endButtonText}>End Job</Text>
      </TouchableOpacity>

      {/* Modal for selecting job status */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pick One</Text>

            {/* Radio button options for status */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setSelectedStatus('Set Remainder')}>
              <View
                style={[
                  styles.radioButton,
                  selectedStatus === 'Set Remainder' && styles.selectedRadio,
                ]}>
                {selectedStatus === 'Set Remainder' && (
                  <View style={styles.innerCircle} />
                )}
              </View>
              <Text style={styles.modalOptionText}>Set Remainder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setSelectedStatus('Mark Hiring')}>
              <View
                style={[
                  styles.radioButton,
                  selectedStatus === 'Mark Hiring' && styles.selectedRadio,
                ]}>
                {selectedStatus === 'Mark Hiring' && (
                  <View style={styles.innerCircle} />
                )}
              </View>
              <Text style={styles.modalOptionText}>Mark Hiring</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setSelectedStatus('Customer Unreachable')}>
              <View
                style={[
                  styles.radioButton,
                  selectedStatus === 'Customer Unreachable' &&
                    styles.selectedRadio,
                ]}>
                {selectedStatus === 'Customer Unreachable' && (
                  <View style={styles.innerCircle} />
                )}
              </View>
              <Text style={styles.modalOptionText}>Customer Unreachable</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setSelectedStatus('Customer Denied')}>
              <View
                style={[
                  styles.radioButton,
                  selectedStatus === 'Customer Denied' && styles.selectedRadio,
                ]}>
                {selectedStatus === 'Customer Denied' && (
                  <View style={styles.innerCircle} />
                )}
              </View>
              <Text style={styles.modalOptionText}>Customer Denied</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                setSelectedStatus('Customer Negotiation going on')
              }>
              <View
                style={[
                  styles.radioButton,
                  selectedStatus === 'Customer Negotiation going on' &&
                    styles.selectedRadio,
                ]}>
                {selectedStatus === 'Customer Negotiation going on' && (
                  <View style={styles.innerCircle} />
                )}
              </View>
              <Text style={styles.modalOptionText}>
                Customer Negotiation going on
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmEndJob}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
  // Other styles...

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    backgroundColor: '#ED1F24',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D7DA',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingLeft: 20,
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // To make room for the fixed "End Job" button
  },
  customerDetails: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
  },
  customerDate: {
    fontSize: 14,
    color: '#ED1F24',
    marginTop: 5,
  },
  customerAddress: {
    fontSize: 13,
    color: '#575757',
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  directionBtn: {
    backgroundColor: '#616161',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    color: 'white',
  },
  contactBtn: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    color: 'white',
  },
  contactText: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4D4D4D',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryText: {
    fontSize: 14,
    color: '#575757',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  finalQuoteButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  finalQuoteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
  },
  map: {
    width: '100%',
    height: 100,
    marginBottom: 120,
  },
  endButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ED1F24',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 5,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuoteSurvey;
