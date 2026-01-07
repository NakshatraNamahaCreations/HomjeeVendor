import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
} from 'react-native';

const HiredQuote = ({route, navigation}) => {
  const {lead, measurementSummary} = route.params; // Access the passed parameters
  const [modalVisible, setModalVisible] = useState(false); // For modal visibility

  // Function to handle when "Start Project" button is pressed
  const handleStartProjectPress = () => {
    setModalVisible(true); // Open the modal
  };

  // Function to handle project start confirmation
  const handleConfirmStartProject = () => {
    setModalVisible(false); // Close the modal
    navigation.navigate('NextProject'); // Navigate to the next page after confirming
  };

  // Function to handle cancel action for project start
  const handleCancelStartProject = () => {
    setModalVisible(false); // Close the modal without action
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hired</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Customer Details Section */}
        <Text style={styles.sectionHeader}>Customer Details</Text>
        <View style={styles.headerBlock}>
          <View style={styles.headerTop}>
            <Text style={styles.customerName}>{lead.name}Sonali K</Text>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.dateText}>{lead.date}28-02-2025</Text>
              <Text style={styles.timeText}>{lead.time}12:00 PM</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Image
              source={require('../../assets/icons/location.png')}
              style={{marginTop: 9, marginRight: 5, width: 20, height: 20}}
            />
            <Text style={styles.descriptionText}>
              {lead.address}Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do
            </Text>
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.updateButtonText}>Update Status</Text>
          </TouchableOpacity>
        </View>
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

        {/* Measurement Summary Section */}

        {/* Payment Details Section */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total Amount</Text>
            <Text style={styles.summaryValue}>₹ 30,000{lead.totalAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Amount paid</Text>
            <Text style={styles.summaryValue}>₹4,000 {lead.amountPaid}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Amount yet to pay</Text>
            <Text style={styles.summaryValue}>
              ₹ 5,000{lead.amountRemaining}
            </Text>
          </View>
        </View>

        {/* Start Project Button */}
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleStartProjectPress}>
          <Text style={styles.requestButtonText}>Start Project</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for confirming project start */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelStartProject}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Start the project!</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to start the project?
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmStartProject}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelStartProject}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    fontFamily: 'Poppins-SemiBold',
    color: '#4D4D4D',
    marginBottom: 10,
    marginTop: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#575757',
    fontFamily: 'Poppins-SemiBold',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
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
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#474141',
  },
  dateText: {
    fontSize: 14,
    color: '#ED1F24',
  },
  timeText: {
    fontSize: 14,
    color: '#474141',
  },
  descriptionText: {
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
  contactText: {
    color: '#fff',
  },
  requestButton: {
    backgroundColor: '#119B11',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },

  confirmButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 10,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  confirmButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D7DA',
    paddingVertical: 10,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default HiredQuote;
