import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const teamMembers = Array(7).fill({
  id: Math.random().toString(),
  name: 'Suresh C',
  avatar: require('../../assets/images/profile.png'),
});

const StartProject = () => {
  const navigation = useNavigation();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);

  const handleConfirm = () => {
    setConfirmModalVisible(false);
    setTeamModalVisible(true);
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    console.log('OTP Submitted:', otp.join(''));
    setOtpModalVisible(false);
    navigation.navigate('NewPayment');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}></View>
        <View style={styles.hiredBanner}>
          <Text style={styles.hiredText}>Hired</Text>
        </View>

        <Text style={styles.sectionTitle}>Customer Details</Text>

        <View style={styles.card}>
          <View style={styles.customerTop}>
            <View style={{flex: 1}}>
              <Text style={styles.customerName}>Sonali K</Text>
              <View style={styles.locationRow}>
                <Icon name="location-pin" size={16} color="#ED1F24" />
                <Text style={styles.address}>
                  lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
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
              <Image
                source={require('../../assets/icons/navigation.png')}
                style={styles.cardIcon}
              />
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
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={{fontFamily: 'Poppins-SemiBold', marginRight: -110}}>
              ₹ 20,537
            </Text>
            <Image
              source={require('../../assets/icons/edit.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount paid</Text>
            <Text style={styles.summaryValue}>₹ 4,000</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount yet to paid</Text>
            <Text style={styles.summaryValue}>₹ 6,537</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => setConfirmModalVisible(true)}>
        <Text style={styles.startBtnText}>Start Project</Text>
      </TouchableOpacity>

      <Modal transparent visible={confirmModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              onPress={() => setConfirmModalVisible(false)}
              style={styles.modalClose}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>✕</Text>
            </TouchableOpacity>
            <Image
              source={require('../../assets/icons/featured.png')}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Start the project!</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to start the project.
            </Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setConfirmModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={teamModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.teamModalBox}>
            <TouchableOpacity
              onPress={() => setTeamModalVisible(false)}
              style={styles.modalClose}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Team members</Text>
            <FlatList
              data={teamMembers}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.teamItem}>
                  <Image source={item.avatar} style={styles.teamAvatar} />
                  <Text style={styles.teamName}>{item.name}</Text>
                  <Icon name="add-circle" size={22} color="#36C55D" />
                </View>
              )}
              contentContainerStyle={{paddingVertical: 10}}
            />
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                setTeamModalVisible(false);
                setOtpModalVisible(true);
              }}>
              <Text style={styles.confirmText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={otpModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.teamModalBox}>
            <TouchableOpacity
              onPress={() => setOtpModalVisible(false)}
              style={styles.modalClose}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>OTP</Text>
            <Text style={styles.modalMessage}>
              Enter OTP sent to customer's phone
            </Text>
            <View style={{flexDirection: 'row', gap: 10, marginVertical: 20}}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                />
              ))}
            </View>
            <TouchableOpacity>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleOtpSubmit}>
              <Text style={styles.confirmText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F6F6'},
  scroll: {padding: 16, paddingBottom: 100},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  hiredBanner: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
    marginRight: -20,
    marginLeft: -20,
    marginTop: -30,
  },
  hiredText: {color: 'white', fontFamily: 'Poppins-SemiBold'},
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  customerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerName: {fontFamily: 'Poppins-SemiBold', fontSize: 16},
  dateTimeBox: {alignItems: 'flex-end', padding: 4},
  dateText: {color: '#ED1F24', fontFamily: 'Poppins-SemiBold'},
  timeText: {color: '#333', fontSize: 12},
  locationRow: {flexDirection: 'row', alignItems: 'flex-start', marginTop: 6},
  address: {fontSize: 13, color: '#555', flexShrink: 1, paddingLeft: 4},
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
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  summaryLabel: {fontSize: 14, color: '#333', fontFamily: 'Poppins-SemiBold'},
  summaryValue: {fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#000'},
  startBtn: {
    backgroundColor: '#119B11',
    padding: 16,
    alignItems: 'center',
    borderRadius: 6,
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  startBtnText: {color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize: 16},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {position: 'absolute', top: 10, right: 10, zIndex: 1},
  iconCircle: {
    backgroundColor: '#EAF8EB',
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 24,
    width: '80%',
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalMessage: {
    textAlign: 'center',
    color: '#555',
    fontSize: 13,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  confirmBtn: {
    backgroundColor: '#ED1F24',
    paddingVertical: 10,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {color: 'white', fontFamily: 'Poppins-SemiBold'},
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {fontFamily: 'Poppins-SemiBold', color: '#333'},
  teamModalBox: {
    backgroundColor: 'white',
    padding: 20,
    width: '85%',
    borderRadius: 12,
    alignItems: 'center',
    maxHeight: '80%',
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  teamAvatar: {width: 32, height: 32, borderRadius: 16, marginRight: 12},
  teamName: {fontFamily: 'Poppins-SemiBold', flex: 1},
  otpBox: {
    width: 45,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    backgroundColor: '#F9F9F9',
  },
  resendText: {
    alignSelf: 'flex-end',
    color: '#ED1F24',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
    marginRight: -100,
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
});

export default StartProject;
