import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  ToastAndroid,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { getRequest } from '../ApiService/apiHelper';
import { useVendorContext } from '../Utilities/VendorContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';

const SplashScreen = () => {
  const { deviceTheme } = useThemeColor();
  const navigation = useNavigation();
  const { setVendorDataContext } = useVendorContext();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  // console.log('vendorDataContext', vendorDataContext);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const checkUserSession = async () => {
      const delay = new Promise(resolve => setTimeout(resolve, 1500));

      const sessionCheck = (async () => {
        try {
          const userData = await AsyncStorage.getItem('user');
          const parsedData = userData ? JSON.parse(userData) : null;

          const vendorId = parsedData?.vendor?._id;
          if (!vendorId) {
            navigation.replace('login');
            return;
          }

          const response = await getRequest(
            `${API_ENDPOINTS.GET_VENDOR_PROFILE}${vendorId}`,
          );

          if (response?.vendor) {
            setVendorDataContext(response.vendor);
            navigation.replace('BottomTab');
          } else {
            await AsyncStorage.removeItem('user');
            ToastAndroid.show('Session expired', ToastAndroid.LONG);
            navigation.replace('login');
          }
        } catch (error) {
          await AsyncStorage.removeItem('user');
          ToastAndroid.show('Something went wrong', ToastAndroid.LONG);
          navigation.replace('login');
        }
      })();

      await Promise.all([delay, sessionCheck]);
      setLoading(false);
    };

    checkUserSession();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* <Text style={styles.text}>Welcome to Vendor App</Text> */}
        {/* {loading && <ActivityIndicator size="large" color="red" />} */}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
});

export default SplashScreen;
