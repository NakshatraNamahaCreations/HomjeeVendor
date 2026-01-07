import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import { postRequest } from '../ApiService/apiHelper';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ResponseLoader from '../components/ResponseLoader';
import { useVendorContext } from '../Utilities/VendorContext';
import { useThemeColor } from '../Utilities/ThemeContext';

const OTP = () => {
  const { deviceTheme } = useThemeColor();
  const navigation = useNavigation();
  const route = useRoute();
  const phoneNumber = route.params.phoneNumber;
  const otpRes = route.params.otp;
  const { setVendorDataContext } = useVendorContext();
  // console.log('phoneNumber', phoneNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [joinedOtp, setJoinedOTP] = useState(null);
  const [otpValue, setOtpValue] = useState(otpRes);
  const inputs = useRef([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      const joinString = newOtp.join('');
      setJoinedOTP(joinString);
      setOtp(newOtp);
      if (text && index < 3) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval); // cleanup
  }, [timer]);

  const handleVerifyOtp = async () => {
    if (joinedOtp === null) {
      return ToastAndroid.showWithGravity(
        'Please enter OTP',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    }
    setIsLoading(true);
    try {
      const data = { otp: joinedOtp, mobileNumber: phoneNumber };
      const result = await postRequest(API_ENDPOINTS.VERIFY_OTP, data);

      ToastAndroid.showWithGravity(
        result.message || 'OTP verified successfully',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      setTimer(0);
      setOtp(['', '', '', '']);
      if (result.data) {
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        setVendorDataContext(result.data);
        navigation.navigate('BottomTab');
      }
      // await AsyncStorage.setItem('user', JSON.stringify(result.data));
    } catch (error) {
      // alert(error.message || "Invalid OTP");
      setIsModalVisible(true);
      setErrorMessage(error.message);
      // ToastAndroid.showWithGravity(
      //   error.message || 'Fail to verify OTP',
      //   ToastAndroid.LONG,
      //   ToastAndroid.CENTER,
      // );
      // console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('otpValue', otpValue);

  const ResendOTP = async () => {
    setOtp(['', '', '', '']);
    const formData = { mobileNumber: phoneNumber };
    setIsLoading(true);
    try {
      const result = await postRequest(API_ENDPOINTS.RESEND_OTP, formData);

      console.log('OTP Re-sent', result);

      if (result?.otp) {
        setOtpValue(result.otp);
      }
      setTimer(60);
      ToastAndroid.showWithGravity(
        result?.message || 'OTP resent successfully',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } catch (error) {
      console.error('OTP Re-sent Error:', error);

      ToastAndroid.showWithGravity(
        error?.message || 'Failed to resend OTP',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {isLoading && <ResponseLoader />}
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require('../assets/images/logo.png.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Title */}
        <Text style={styles.title}>OTP</Text>
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Enter OTP received on your Phone Number
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'red',
            fontFamily: 'Poppins-Regular',
            textAlign: 'center',
          }}
        >
          {otpValue}
        </Text>

        {/* OTP Inputs */}
        <View style={styles.otpBoxContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={el => (inputs.current[index] = el)} // <-- correct ref usage
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={value}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !value && index > 0) {
                  inputs.current[index - 1]?.focus();
                }
              }}
            />
          ))}
        </View>
        {/* Resend OTP */}
        {/* <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={() => Alert.alert('Resend OTP', 'OTP resent!')}
          >
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </View> */}
        <View style={styles.resendContainer}>
          <TouchableOpacity onPress={timer > 0 ? null : ResendOTP}>
            <Text style={styles.resendText}>
              {timer > 0
                ? `Resend OTP in 0:${timer < 10 ? `0${timer}` : timer}`
                : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={ResendOTP}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity> */}
        </View>
        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOtp}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        {/* <View style={styles.downborder} /> */}
        {/* Back to Login Button */}
        {/* Error Modal */}
      </View>
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
              {/* {errorMessage} */}
              Looks like this OTP in Invalid! Please try again. Kindly enter the
              correct OTP to continue.
            </Text>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Uncommented to ensure full screen coverage
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    // marginTop: 130,
  },
  logo: {
    width: 186,
    height: 56,
    marginBottom: 40,
    marginLeft: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: 'black',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6D6D6D',
    marginBottom: 30,
    // textAlign: 'center', // Fixed to center the subtitle
    fontFamily: 'Poppins-Regular',
    fontWeight: 400,
    letterSpacing: 0,
  },
  otpBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    backgroundColor: '#f5f5f5',
  },
  resendContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#ED1F24',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  submitButton: {
    backgroundColor: '#ED1F24',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    // fontWeight: '600',
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
    bottom: -180,
    left: 90,
    right: 20,
    borderBottomWidth: 5, // Increased thickness for visibility
    borderBottomColor: '#ED1F24', // Set to red as requested
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,

    // Span the full width
  },
});

export default OTP;
