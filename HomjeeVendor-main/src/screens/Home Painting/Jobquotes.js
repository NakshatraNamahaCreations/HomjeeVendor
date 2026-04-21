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
import Icon from 'react-native-vector-icons/Ionicons';

const Jobquotes = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleEndJob = () => {
    setModalVisible(false);
    alert('Project ended!');
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f2f2f2'}}>
      <Text
        style={{
          backgroundColor: '#FF7F00',
          padding: 10,
          textAlign: 'center',
          color: 'white',
          fontFamily: 'Poppins-SemiBold',
        }}>
        Job Ongoing
      </Text>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.approvalBox}>
          <Text style={styles.amountReduced}>Amount Reduce : ₹ 2,300</Text>
          <Text style={styles.pendingStatus}>
            Status :{' '}
            <Text style={{color: '#FF8C00', fontWeight: 'bold'}}>
              Waiting for admin's approval
            </Text>
          </Text>
        </View>

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
              <Text style={{color: 'white', fontFamily: 'Poppins-SemiBold'}}>
                {' '}
                Directions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}>
              <Image
                source={require('../../assets/icons/contact.png')}
                style={styles.cardIcon}
              />
              <Text style={{color: 'white', fontFamily: 'Poppins-SemiBold'}}>
                {' '}
                Contact
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
            <Text style={styles.label}>Quote 1 Final Quote</Text>
            <Text style={[styles.value, {color: '#ED1F24'}]}>₹ 56000</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quote 2</Text>
            <Text style={styles.value}>₹ 66000</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.endJobBtn}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.endJobText}>END JOB</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={require('../../assets/icons/featured.png')}
              style={{width: 40, height: 40, marginBottom: 10}}
            />
            <Text style={styles.modalTitle}>End the project!</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to end the project.
            </Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleEndJob}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Jobquotes;

const styles = StyleSheet.create({
  container: {padding: 10, paddingBottom: 80},
  approvalBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFA500',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
  },
  amountReduced: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  pendingStatus: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-SemiBold',
  },
  dateText: {
    color: '#ED1F24',
    fontWeight: '600',
  },
  timeText: {
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
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
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
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
  value: {
    color: '#000',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  endJobBtn: {
    backgroundColor: '#ED1F24',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  endJobText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderStyle: 'dashed',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    width: '85%',
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 5,
  },
  modalMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,

    marginBottom: 20,
  },
  confirmBtn: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});
