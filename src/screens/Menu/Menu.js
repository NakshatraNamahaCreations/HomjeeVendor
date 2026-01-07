import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../Utilities/ThemeContext';
import { useVendorContext } from '../../Utilities/VendorContext';

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem}>
    <View style={styles.menuItemLeft}>
      <Image source={icon} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Image
      source={require('../../assets/icons/arrow.png')}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>
);

const Menu = () => {
  const { deviceTheme } = useThemeColor();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { vendorDataContext } = useVendorContext();

  const handleLogout = () => {
    navigation.navigate('login');
    AsyncStorage.clear();
    ToastAndroid.showWithGravity(
      'Logout Successfully',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Header />
      <ScrollView>
        <View style={{ alignSelf: 'flex-end' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Viewid')}>
            <Text style={styles.viewIdButton}>View ID</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/images/profilemenu.png')}
            style={{ width: 80, height: 80 }}
          />
          <Text style={styles.profileName}>
            {vendorDataContext.vendor?.vendorName} (
            {vendorDataContext.vendor?.serviceType})
          </Text>
          <Text style={styles.status}>Live</Text>
          <Text style={styles.lastActive}>Last Active</Text>
          <Text style={styles.lastActiveTime}>09 Jan 2023 | 5:30 PM</Text>
        </View>
        <View style={{}}>
          <MenuItem
            icon={require('../../assets/icons/profile.png')}
            label="Profile Details"
            onPress={() => navigation.navigate('Profiledetails')}
          />
        </View>

        <MenuItem
          icon={require('../../assets/icons/Financial.png')}
          label="Financial Details"
          onPress={() => navigation.navigate('FinancialDetails')}
        />

        <MenuItem
          icon={require('../../assets/icons/profile.png')}
          label="Team Members"
          onPress={() => navigation.navigate('TeamMember')}
        />

        <MenuItem
          icon={require('../../assets/icons/calender.png')}
          label="Calendar"
          onPress={() => navigation.navigate('Calendar')}
        />

        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.logoutItem}
        >
          <View style={styles.menuItemLeft}>
            <Image
              source={require('../../assets/icons/logout.png')}
              style={styles.menuIcon}
            />
            <Text style={styles.logoutLabel}>Logout</Text>
          </View>
        </TouchableOpacity>
        <Modal
          visible={isModalVisible}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                width: '80%',
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10,
                // margin: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'Poppins-SemiBold',
                  color: 'black',
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                Confirm Logout
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Poppins-Medium',
                  color: 'black',
                  marginBottom: 20,
                }}
              >
                Are you sure want to Logout?
              </Text>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}
              >
                <TouchableOpacity
                  style={{
                    marginHorizontal: 5,
                    marginVertical: 10,
                  }}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Poppins-SemiBold',
                      color: 'black',
                      backgroundColor: '#f0f0f0',
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 5,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    marginHorizontal: 5,
                    marginVertical: 10,
                    backgroundColor: 'red',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 5,
                  }}
                  onPress={handleLogout}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Poppins-SemiBold',
                      color: 'white',
                    }}
                  >
                    Yes! Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  viewIdButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    borderColor: '#9D9D9D',
    color: '#ED1F24',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    margin: 20,
    alignSelf: 'flex-end',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profileName: {
    color: '#000',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    marginTop: 5,
  },
  status: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  lastActive: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#263238',
  },
  lastActiveTime: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#263238',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  logoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ED1F24',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  menuLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#3A3A3A',
    fontSize: 14,
  },
  logoutLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    fontSize: 14,
  },
  arrowIcon: {
    width: 8,
    height: 12,
  },
});

export default Menu;
