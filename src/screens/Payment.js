import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';

const Payment = () => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View>
      <Image
        style={{ margin: 10 }}
        source={require('../assets/images/buycoins.png')} // Update path if needed
      />
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Coins to Add</Text>
          <Text style={styles.amountBold}>500</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.amountLabel}>Amount (exclusive Govt. Tax)</Text>
          <Text style={styles.amountPaid}>₹ 4,000</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.amountLabel}>Govt. Tax (18% GST)</Text>
          <Text style={styles.amountDue}>₹ 900</Text>
        </View>
        <View style={styles.dottedLine} />
        <View style={styles.rowBetween}>
          <Text style={styles.amountLabel}>Final Payable Amount</Text>
          <Text style={styles.amountDue}>₹ 5900</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.endBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.endBtnText}>PAY NOW</Text>
      </TouchableOpacity>
      {/* <View style={styles.downborder} /> */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6', padding: 20 },
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#4D4D4D',
    marginBottom: 20,
    marginTop: 10,
  },
  headerBlock: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerName: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#474141' },
  dateText: { color: '#ED1F24', fontSize: 13, fontFamily: 'Poppins-Bold' },
  timeText: { fontSize: 15, color: '#474141', fontFamily: 'Poppins-Bold' },
  descriptionText: {
    marginVertical: 8,
    color: '#575757',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  updateButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginRight: 10,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
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
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactText: { color: '#fff', fontFamily: 'Poppins-SemiBold' },
  packageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  viewDetails: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    top: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    margin: 10,
  },
  packageTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 12,
    color: '#393939',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  location: { flexDirection: 'row', marginBottom: 6 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: { fontFamily: 'Poppins-SemiBold', color: '#615858' },
  amountLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#4D4D4D',
    fontSize: 14,
  },
  amountBold: { fontWeight: 'bold' },
  amountPaid: { fontWeight: '600' },
  amountDue: { color: 'black', fontWeight: 'bold' },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 20,
  },
  addressText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#575757',
    fontSize: 12,
    marginTop: 20,
  },
  map: { width: '100%', height: 122, marginBottom: 30 },
  startBtn: {
    width: '100%',
    backgroundColor: '#119B11',
    padding: 16,
    alignItems: 'center',
    borderRadius: 5,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ✅ Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,

    position: 'relative',
  },

  checkIcon: { width: 48, height: 48 },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  closeIcon: { width: 25, height: 25, color: 'black' },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',

    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F4F4F4',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },

  // ✅ Team Member Modal Styles
  teamModalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  teamModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    textAlign: 'center',
  },
  memberList: { width: '100%', marginBottom: 20 },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  memberImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  memberName: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  memberCheck: {
    width: 20,
    height: 20,

    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
  },
  continueBtn: {
    backgroundColor: '#ED1F24',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  downborder: {
    position: 'relative',
    // bottom: -250,
    left: 110,
    right: 30,
    borderBottomWidth: 7, // Increased thickness for visibility
    borderBottomColor: '#ED1F24', // Set to red as requested
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,
    top: 240,
  },
  // existing styles...
  // Add below at the bottom of your styles:
  otpModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: 45,
    height: 50,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  resendText: {
    alignSelf: 'flex-end',
    color: '#ED1F24',
    fontSize: 12,
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  endBtn: {
    backgroundColor: '#ED1F24',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    // marginHorizontal: 50,
    alignSelf: 'center',
    width: 'auto',
    minWidth: 330,
  },

  endBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
});
export default Payment;
