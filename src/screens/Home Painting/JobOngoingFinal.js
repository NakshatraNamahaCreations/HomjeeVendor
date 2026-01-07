import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const JobOngoingFinal = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirm = () => {
    setModalVisible(false);
    // Add your end job logic or navigation here
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>Job Ongoing</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountText}>Amount Reduce : Rs. 2,300</Text>
          <Text style={styles.statusPending}>
            Status : Waiting for admin's approval
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.customerName}>Sonali K</Text>
            <Text style={styles.date}>28-02-2025{''}12:00 PM</Text>
          </View>
          <View style={styles.addressRow}>
            <Icon name="location-pin" size={18} color="#ED1F24" />
            <Text style={styles.address}>
              1st floor, Darshan Plaza, Dwaraka Nagar, Banashankari 6th Stage
              1st Block, ...
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.directionsBtn}>
              <Image
                source={require('../../assets/icons/navigation.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.directionsText}>Directions</Text>
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

        <View style={styles.card}>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.sectionTitle}>Measurements Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.measureRow}>
            <Text style={styles.boldText}>Interior</Text>
            <Text style={styles.boldText}>2000 sq ft</Text>
          </View>
          <View style={styles.measureRow}>
            <Text style={styles.boldText}>Exterior</Text>
            <Text style={styles.boldText}>2000 sq ft</Text>
          </View>
          <View style={styles.measureRow}>
            <Text style={styles.boldText}>Others</Text>
            <Text style={styles.boldText}>1688 sq ft</Text>
          </View>
          <View style={styles.measureRow}>
            <Text style={styles.boldText}>Total measurement</Text>
            <Text style={styles.boldText}>2000 sq ft</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.sectionTitle}>Quote Summary</Text>
            <Image
              source={require('../../assets/icons/arrowredcircle.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.measureRow}>
            <Text style={styles.boldText}>
              Quote 1 <Text style={styles.finalQuote}>Final Quote</Text>
            </Text>
            <Text style={styles.boldText}>₹ 56000</Text>
          </View>
          <View style={styles.measureRow}>
            <Text style={styles.boldText}>Quote 2</Text>
            <Text style={styles.boldText}>₹ 56000</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.endJobBtn}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.endJobText}>END JOB</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setModalVisible(false)}>
              <Text style={{fontSize: 18}}>✕</Text>
            </TouchableOpacity>
            <Image
              source={require('../../assets/icons/featured.png')}
              style={{alignItems: 'flex-start', alignSelf: 'flex-start'}}
            />
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                alignItems: 'flex-start',
                alignSelf: 'flex-start',
              }}>
              End the project!
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                alignItems: 'flex-start',
                alignSelf: 'flex-start',
                marginBottom: 20,
              }}>
              Are you sure you want to end the project.
            </Text>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={handleConfirm}>
              <Text style={styles.modalConfirmText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9F9'},
  content: {padding: 16, paddingBottom: 100},
  statusBar: {
    backgroundColor: '#FF9900',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: -20,
  },
  statusText: {color: '#fff', fontFamily: 'Poppins-SemiBold'},
  amountBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF9900',
    marginBottom: 10,
  },
  amountText: {fontFamily: 'Poppins-SemiBold', fontSize: 14},
  statusPending: {color: '#ED1F24', fontSize: 12, marginTop: 4},
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginVertical: 8,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {fontFamily: 'Poppins-SemiBold', fontSize: 16},
  date: {
    color: '#ED1F24',
    textAlign: 'right',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  addressRow: {flexDirection: 'row', marginTop: 6},
  address: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    fontFamily: 'Poppins-SemiBold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  directionsBtn: {
    flex: 1,
    backgroundColor: '#616161',
    padding: 10,
    borderRadius: 6,
    marginRight: 6,
    flexDirection: 'row',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    marginLeft: 6,
    flexDirection: 'row',
  },
  directionsText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 20,
  },
  contactText: {color: '#fff', fontFamily: 'Poppins-SemiBold', marginLeft: 20},
  sectionTitle: {fontFamily: 'Poppins-SemiBold', marginBottom: 10},
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  boldText: {fontFamily: 'Poppins-SemiBold', fontSize: 14},
  finalQuote: {color: '#ED1F24', fontFamily: 'Poppins-SemiBold'},
  endJobBtn: {
    backgroundColor: '#ED1F24',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  endJobText: {color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize: 16},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalCloseIcon: {position: 'absolute', top: 10, right: 10},
  modalIcon: {width: 50, height: 50, marginBottom: 12},
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'right',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  modalConfirmBtn: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
  },
  modalConfirmText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  modalCancelBtn: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
  },
  modalCancelText: {
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  dottedLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#999',
    borderStyle: 'dashed',
    marginVertical: 8,
    marginRight: 20,
    width: '100%',
  },
});

export default JobOngoingFinal;
