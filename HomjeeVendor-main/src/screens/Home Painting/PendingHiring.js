import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const DEFAULT_LEAD = {
  name: 'Sonali K',
  date: '28-06-2025',
  time: '12:00 PM',
  address: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do',
};

const PendingHiring = () => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const navigation = useNavigation();

  const handleStartProject = () => {
    if (!isButtonClicked) {
      setIsButtonClicked(true);
    }
  };

  useEffect(() => {
    let timer;
    if (isButtonClicked) {
      timer = setTimeout(() => {
        navigation.navigate('StartProject');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isButtonClicked]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}></View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>Pending Hiring</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.customerTop}>
            <Text style={styles.customerName}>{DEFAULT_LEAD.name}</Text>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>{DEFAULT_LEAD.date}</Text>
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
            <Text style={styles.addressText}>{DEFAULT_LEAD.address}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.directionBtn}>
              <Text style={styles.buttonText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}>
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
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Interior</Text>
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>₹2000 sq ft</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Exterior</Text>
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>₹2000 sq ft</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Others</Text>
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>₹1688 sq ft</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftTextBold}>Total measurement</Text>
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>₹2000 sq ft</Text>
          </View>
        </View>

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
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>₹ 56000</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.leftText}>Quote 2</Text>
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>₹ 56000</Text>
          </View>
        </View>

        {isButtonClicked && (
          <View style={styles.confirmation}>
            <Text style={styles.confirmationText}>
              Project initiation in progress...
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.startButton,
          isButtonClicked
            ? styles.startButtonClicked
            : styles.startButtonEnabled,
        ]}
        onPress={handleStartProject}
        disabled={isButtonClicked}>
        <Text style={styles.startButtonText}>Start Project</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F6F6'},
  scroll: {padding: 16, paddingBottom: 60},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  banner: {
    backgroundColor: '#FFC107',
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
    width: '130%',
    alignSelf: 'stretch',
    marginLeft: -20,
    marginTop: -20,
    marginBottom: 20,
  },
  bannerText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: -25,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  customerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerName: {fontFamily: 'Poppins-SemiBold', fontSize: 16},
  dateTimeContainer: {alignItems: 'flex-end'},
  dateText: {color: '#ED1F24', fontFamily: 'Poppins-SemiBold'},
  timeText: {color: '#333'},
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  locationIcon: {width: 20, height: 20, marginRight: 5},
  addressText: {fontSize: 13, color: '#666', flexShrink: 1},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  directionBtn: {
    backgroundColor: '#616161',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  contactBtn: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {color: '#fff', fontFamily: 'Poppins-SemiBold'},
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {fontFamily: 'Poppins-SemiBold', fontSize: 15},
  dottedLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#999',
    borderStyle: 'dotted',
    marginVertical: 8,
    marginRight: 20,
    width: '100%',
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
  rightText: {fontSize: 14, color: '#333'},
  leftTextBold: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  rightTextBold: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  startButton: {
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  startButtonEnabled: {
    backgroundColor: '#C8DCC8',
    opacity: 1,
  },
  startButtonClicked: {
    backgroundColor: '#2E7D32',
  },
  startButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  confirmation: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmationText: {
    color: '#2E7D32',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});

export default PendingHiring;
