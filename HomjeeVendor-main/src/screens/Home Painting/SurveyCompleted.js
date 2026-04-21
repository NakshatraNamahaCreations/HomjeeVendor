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
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {useNavigation} from '@react-navigation/native'; // Import navigation hook

// // Sample DEFAULT_LEAD object to replace undefined references
// const DEFAULT_LEAD = {
//   name: 'Sonali K',
//   date: '28–02–2025',
//   time: '12:00 PM',
//   address: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do',
// };

// const SurveyCompleted = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const navigation = useNavigation(); // Initialize navigation

//   const options = [
//     'Set Reminder',
//     'Mark Hiring',
//     'Customer Unreachable',
//     'Customer Denied',
//     'Customer Negotiation going on',
//   ];

//   const handleOptionSelect = option => {
//     setSelectedOption(option);
//     if (option === 'Mark Hiring') {
//       // Navigate to PendingHiring page
//       navigation.navigate('PendingHiring');
//       setModalVisible(false); // Close modal after navigation
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scroll}>
//         {/* Header */}
//         <View style={styles.header}></View>

//         {/* Survey Completed Banner */}
//         <View style={styles.banner}>
//           <Text style={styles.bannerText}>Survey Completed</Text>
//         </View>

//         {/* Customer Card */}
//         <View style={styles.card}>
//           <View style={styles.headerTop}>
//             <Text style={styles.customerName}>{DEFAULT_LEAD.name}</Text>
//             <View style={{alignItems: 'flex-end'}}>
//               <Text style={styles.dateText}>{DEFAULT_LEAD.date}</Text>
//               <Text style={styles.timeText}>{DEFAULT_LEAD.time}</Text>
//             </View>
//           </View>
//           <View style={styles.locationRow}>
//             <Image
//               source={require('../../assets/icons/location.png')}
//               style={styles.locationIcon}
//               onError={e =>
//                 console.log('Image load error:', e.nativeEvent.error)
//               }
//             />
//             <Text style={styles.descriptionText}>{DEFAULT_LEAD.address}</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.updateButton}
//             onPress={() => setModalVisible(true)}>
//             <Text style={styles.updateButtonText}>Update Status</Text>
//             <Image
//               source={require('../../assets/icons/interface.png')}
//               style={styles.interfaceIcon}
//               onError={e =>
//                 console.log('Image load error:', e.nativeEvent.error)
//               }
//             />
//           </TouchableOpacity>

//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.directionBtn}>
//               <Image
//                 source={require('../../assets/icons/navigation.png')}
//                 style={styles.cardIcon}
//                 onError={e =>
//                   console.log('Image load error:', e.nativeEvent.error)
//                 }
//               />
//               <Text style={styles.contactText}>Directions</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.contactBtn}>
//               <Image
//                 source={require('../../assets/icons/contact.png')}
//                 style={styles.cardIcon}
//                 onError={e =>
//                   console.log('Image load error:', e.nativeEvent.error)
//                 }
//               />
//               <Text style={styles.contactText}>Contact</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Reminder */}
//         <View style={styles.reminderBox}>
//           <Text style={styles.reminderText}>
//             Reminder set for 29–03–2025 at 5:30pm
//           </Text>
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

//         {/* Quotes Summary */}
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
//       </ScrollView>

//       {/* Modal for Update Status Options */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Pick One</Text>
//               <TouchableOpacity onPress={() => setModalVisible(false)}>
//                 <Text style={styles.closeButton}>×</Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScroll}>
//               {options.map(option => (
//                 <TouchableOpacity
//                   key={option}
//                   style={styles.option}
//                   onPress={() => handleOptionSelect(option)}>
//                   <View style={styles.radioContainer}>
//                     <View
//                       style={[
//                         styles.radioButton,
//                         selectedOption === option && styles.radioButtonSelected,
//                       ]}
//                     />
//                     <Text style={styles.optionText}>{option}</Text>
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#F6F6F6'},
//   scroll: {padding: 16, paddingBottom: 40},

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 18,
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },

//   banner: {
//     backgroundColor: '#4CAF50',
//     padding: 15,
//     alignItems: 'center',
//     borderRadius: 6,
//     marginBottom: 20,
//     width: '130%',
//     alignSelf: 'stretch',
//     marginLeft: -40,
//     marginTop: -30,
//   },
//   bannerText: {
//     color: 'white',
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },

//   card: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   customerName: {
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//     fontSize: 16,
//     marginBottom: 6,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//     flexShrink: 1,
//   },
//   locationIcon: {
//     width: 20,
//     height: 20,
//     marginTop: 2,
//     marginRight: 5,
//   },
//   descriptionText: {
//     fontSize: 13,
//     color: '#666',
//     flexShrink: 1,
//     width: 300,
//     fontFamily: 'Poppins-SemiBold',
//   },
//   dateText: {
//     color: '#ED1F24',
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },
//   timeText: {
//     color: '#333',
//     marginTop: 4,
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },
//   updateButton: {
//     flexDirection: 'row',
//     backgroundColor: '#ED1F24',
//     padding: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   updateButtonText: {
//     color: '#fff',
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//     flex: 1,
//     textAlign: 'center',
//     marginRight: 150,
//   },
//   interfaceIcon: {
//     width: 5,
//     height: 5,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     marginTop: 12,
//     justifyContent: 'space-between',
//     gap: 10,
//   },
//   directionBtn: {
//     flex: 1,
//     backgroundColor: '#616161',
//     padding: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   contactBtn: {
//     flex: 1,
//     backgroundColor: '#4285F4',
//     padding: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   contactText: {
//     color: '#fff',
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//   },
//   cardIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 5,
//   },

//   reminderBox: {
//     borderWidth: 1,
//     borderColor: '#ED1F24',
//     borderRadius: 5,
//     padding: 8,
//     backgroundColor: '#FFF1F1',
//     marginVertical: 12,
//   },
//   reminderText: {
//     color: '#ED1F24',
//     fontSize: 13,
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
//     fontFamily: 'Poppins-SemiBold',
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

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 16,
//     width: '80%',
//     maxHeight: '70%',
//     elevation: 5,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   modalTitle: {
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//     fontSize: 16,
//   },
//   closeButton: {
//     fontSize: 24,
//     color: '#000',
//   },
//   modalScroll: {
//     maxHeight: '90%',
//   },
//   option: {
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   radioContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   radioButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#000',
//     marginRight: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   radioButtonSelected: {
//     width: 20,
//     height: 20,
//     borderRadius: 15,
//     backgroundColor: '#ED1F24',
//   },
//   optionText: {
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//     fontSize: 14,
//   },
//   saveButton: {
//     backgroundColor: '#4CAF50',
//     padding: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontFamily: 'Poppins-SemiBold', // Fallback if Poppins-SemiBold is not linked
//     fontSize: 16,
//   },
// });

// export default SurveyCompleted;
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// Sample DEFAULT_LEAD object to replace undefined references
const DEFAULT_LEAD = {
  name: 'Sonali K',
  date: '28–02–2025',
  time: '12:00 PM',
  address: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do',
};

const SurveyCompleted = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [confirmHiringVisible, setConfirmHiringVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(DEFAULT_LEAD.date));
  const navigation = useNavigation();

  const options = [
    'Set Reminder',
    'Mark Hiring',
    'Customer Unreachable',
    'Customer Denied',
    'Customer Negotiation going on',
  ];

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const currentDate = new Date();
  const [calendarDate, setCalendarDate] = useState(new Date());

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const renderCalendarDays = () => {
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const daysArray = [];

    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isCurrentDate = date.toDateString() === currentDate.toDateString();
      daysArray.push(
        <TouchableOpacity
          key={day}
          style={styles.day}
          onPress={() => {
            setSelectedDate(date);
            setShowCalendar(false);
            navigation.navigate('PendingHiring');
          }}>
          <View
            style={[
              styles.dayCircle,
              isCurrentDate && styles.currentDayCircle,
            ]}>
            <Text style={styles.dayText}>{day}</Text>
          </View>
        </TouchableOpacity>,
      );
    }

    return daysArray;
  };

  const handleOptionSelect = option => {
    setSelectedOption(option);
    if (option === 'Mark Hiring') {
      setModalVisible(false);
      setConfirmHiringVisible(true);
    }
  };

  const handleConfirmHiring = () => {
    setConfirmHiringVisible(false);
    setShowCalendar(true);
  };

  const handlePrevMonth = () => {
    setCalendarDate(
      new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)),
    );
  };

  const handleNextMonth = () => {
    setCalendarDate(
      new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)),
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}></View>

        {/* Survey Completed Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Survey Completed</Text>
        </View>

        {/* Customer Card */}
        <View style={styles.card}>
          <View style={styles.headerTop}>
            <Text style={styles.customerName}>{DEFAULT_LEAD.name}</Text>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-GB').replace(/\//g, '–')}
              </Text>
              <Text style={styles.timeText}>{DEFAULT_LEAD.time}</Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Image
              source={require('../../assets/icons/location.png')}
              style={styles.locationIcon}
              onError={e =>
                console.log('Image load error:', e.nativeEvent.error)
              }
            />
            <Text style={styles.descriptionText}>{DEFAULT_LEAD.address}</Text>
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.updateButtonText}>Update Status</Text>
            <Image
              source={require('../../assets/icons/interface.png')}
              style={styles.interfaceIcon}
              onError={e =>
                console.log('Image load error:', e.nativeEvent.error)
              }
            />
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.directionBtn}>
              <Image
                source={require('../../assets/icons/navigation.png')}
                style={styles.cardIcon}
                onError={e =>
                  console.log('Image load error:', e.nativeEvent.error)
                }
              />
              <Text style={styles.contactText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}>
              <Image
                source={require('../../assets/icons/contact.png')}
                style={styles.cardIcon}
                onError={e =>
                  console.log('Image load error:', e.nativeEvent.error)
                }
              />
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminder */}
        <View style={styles.reminderBox}>
          <Text style={styles.reminderText}>
            Reminder set for 29–03–2025 at 5:30pm
          </Text>
        </View>

        {/* Measurements Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Measurements Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
              onError={e =>
                console.log('Image load error:', e.nativeEvent.error)
              }
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

        {/* Quotes Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quotes Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
              onError={e =>
                console.log('Image load error:', e.nativeEvent.error)
              }
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
      </ScrollView>

      {/* Modal for Update Status Options */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick One</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {options.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.option}
                  onPress={() => handleOptionSelect(option)}>
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedOption === option && styles.radioButtonSelected,
                      ]}
                    />
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal for Mark Hiring */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmHiringVisible}
        onRequestClose={() => setConfirmHiringVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={require('../../assets/icons/featured.png')}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Confirm Hiring</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to mark this as hired?
            </Text>
            <View style={styles.confirmButtonColumn}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {backgroundColor: '#ED1F24', marginTop: -20},
                ]}
                onPress={handleConfirmHiring}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {backgroundColor: 'white', marginTop: 20, borderWidth: 1},
                ]}
                onPress={() => setConfirmHiringVisible(false)}>
                <Text style={{color: 'black'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Calendar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalendar}
        onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <Text style={styles.arrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {calendarDate.toLocaleString('default', {month: 'long'})}{' '}
                {calendarDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dayLabels}>
              {days.map(day => (
                <Text key={day} style={styles.dayLabel}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F6F6'},
  scroll: {padding: 16, paddingBottom: 40},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },

  banner: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 20,
    width: '130%',
    alignSelf: 'stretch',
    marginLeft: -40,
    marginTop: -30,
  },
  bannerText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    flexShrink: 1,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
    marginRight: 5,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    flexShrink: 1,
    width: 300,
    fontFamily: 'Poppins-SemiBold',
  },
  dateText: {
    color: '#ED1F24',
    fontFamily: 'Poppins-SemiBold',
  },
  timeText: {
    color: '#333',
    marginTop: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: '#ED1F24',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    textAlign: 'center',
    marginRight: 150,
  },
  interfaceIcon: {
    width: 5,
    height: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    gap: 10,
  },
  directionBtn: {
    flex: 1,
    backgroundColor: '#616161',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  cardIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  reminderBox: {
    borderWidth: 1,
    borderColor: '#ED1F24',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#FFF1F1',
    marginVertical: 12,
  },
  reminderText: {
    color: '#ED1F24',
    fontSize: 13,
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
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
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
    fontFamily: 'Poppins-SemiBold',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: '90%',
    maxHeight: '70%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  closeButton: {
    fontSize: 24,
    color: '#000',
  },
  modalScroll: {
    maxHeight: '90%',
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: '#ED1F24',
  },
  optionText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  // Confirmation Modal Styles
  confirmText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,

    fontFamily: 'Poppins-Regular',
  },
  confirmButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  // Calendar Modal Styles
  calendarModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  calendarTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  arrow: {
    fontSize: 20,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  day: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentDayCircle: {
    backgroundColor: '#ED1F24',
    borderColor: '#ED1F24',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  emptyDay: {
    width: '14.28%',
    height: 30,
  },
  confirmButtonColumn: {
    width: '100%',
    marginTop: 10,
  },
  confirmButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default SurveyCompleted;
