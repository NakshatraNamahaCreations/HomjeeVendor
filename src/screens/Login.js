import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ToastAndroid,
  Modal,
  StatusBar,
} from 'react-native';
import React, { useState } from 'react';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { postRequest } from '../ApiService/apiHelper';
import { useNavigation } from '@react-navigation/native';
import ResponseLoader from '../components/ResponseLoader';
import { useThemeColor } from '../Utilities/ThemeContext';

const Login = () => {
  const { deviceTheme } = useThemeColor();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const validatePhoneNumber = () => {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    if (!cleanedNumber) {
      Alert.alert('Error', 'Phone number cannot be empty');
      return false;
    }

    if (!/^\d+$/.test(cleanedNumber)) {
      Alert.alert('Error', 'Phone number must contain digits only');
      return false;
    }

    if (cleanedNumber.length < 10) {
      Alert.alert('Error', 'Phone number must be at least 10 digits');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validatePhoneNumber()) return;

    setIsLoading(true); // Start loader

    try {
      const formData = {
        mobileNumber: phoneNumber,
      };

      const result = await postRequest(
        API_ENDPOINTS.LOGIN_WITH_MOBILE,
        formData,
      );
      console.log('otp res', result);
      ToastAndroid.showWithGravity(
        result.message || 'OTP Sent',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      setPhoneNumber('');
      navigation.navigate('otp', {
        phoneNumber: phoneNumber,
        otp: result.otp,
      });
    } catch (error) {
      console.log('Login failed:', error?.message);
      setIsModalVisible(true);
      // ToastAndroid.showWithGravity(
      //   error?.message || 'Failed to send OTP',
      //   ToastAndroid.LONG,
      //   ToastAndroid.CENTER,
      // );
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectCountry = country => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setShowCountryPicker(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {isLoading && <ResponseLoader />}
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require('../assets/images/logo.png.png')}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>LOGIN</Text>
        <Text style={styles.subtitle}>Enter your phone number to proceed</Text>

        <View style={styles.phoneInputContainer}>
          <TouchableOpacity
            style={styles.countryPickerButton}
            onPress={() => setShowCountryPicker(true)}
          >
            <CountryPicker
              countryCode={countryCode}
              withFlag
              withCallingCode
              withFilter
              onSelect={onSelectCountry}
              visible={showCountryPicker}
              containerButtonStyle={styles.flagButton}
            />
            <View style={styles.dropdownDot} />
            <Text style={styles.codeText}>+{callingCode}</Text>
          </TouchableOpacity>
          <View style={styles.dropdownDot} />
          <TextInput
            style={styles.textInput}
            placeholder="Phone Number"
            placeholderTextColor="#cdcdcd"
            value={phoneNumber}
            onChangeText={text => {
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 10) {
                setPhoneNumber(cleaned);
              }
            }}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.downborder} /> */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              style={styles.errorImage}
              source={require('../assets/images/error.png.png')} // Fixed double extension
              resizeMode="contain"
            />

            <Text style={styles.modalTitle}>Oops!</Text>

            <Text style={styles.modalSubtitle}>
              Looks like this user NOT registered!
            </Text>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: 186,
    height: 56,
  },
  title: {
    fontSize: 22,
    color: 'black',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6D6D6D',
    marginBottom: 30,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  phoneInputContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#868686',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 0.8,
    borderColor: '#ddd',
  },
  flagButton: {
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  codeText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Regular',
    marginHorizontal: 5,
  },
  dropdownDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 0,
  },
  loginButton: {
    backgroundColor: '#ED1F24',
    paddingVertical: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  errorImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 25,
    fontFamily: 'Poppins',
    fontStyle: 'italic',
    fontWeight: 700,
    color: '#ED1F24',
    marginBottom: 10,
    letterSpacing: 0,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#373737',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0,
  },
  modalCloseButton: {
    backgroundColor: '#FF3333',
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'bold',
  },
  downborder: {
    position: 'relative',
    left: 118,
    right: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#ED1F24',
    width: '35%',
    justifyContent: 'center',
    borderRadius: 20,
    bottom: 10,
  },
});

export default Login;
