import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Animated,
  Image,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { getRequest } from '../ApiService/apiHelper';
import { useVendorContext } from '../Utilities/VendorContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';
import { registerFcmToken } from '../Utilities/notifications';

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
    // Background profile refresh. Runs WITHOUT blocking navigation so a slow /
    // cold-starting backend (Render free tier can take 30-50s to wake) never
    // holds the splash hostage. The user is already inside the app on cached
    // credentials by the time this resolves. (#2)
    const refreshProfileInBackground = async vendorId => {
      try {
        const response = await getRequest(
          `${API_ENDPOINTS.GET_VENDOR_PROFILE}${vendorId}`,
        );

        // 🔒 Archived → force logout (the only server state that kicks the
        // vendor out). Handled here so the app boots fast and self-corrects.
        if (response?.vendor?.isArchived === true) {
          await AsyncStorage.clear();
          ToastAndroid.show(
            'Your account has been archived. Please contact support.',
            ToastAndroid.LONG,
          );
          navigation.replace('login');
          return;
        }

        if (response?.vendor) {
          await AsyncStorage.setItem('user', JSON.stringify(response.vendor));
          setVendorDataContext(response.vendor);
        }
      } catch (error) {
        if (error?.code === 'VENDOR_ARCHIVED') {
          await AsyncStorage.clear();
          ToastAndroid.show(
            error?.message ||
              'Your account has been archived. Please contact support.',
            ToastAndroid.LONG,
          );
          navigation.replace('login');
        }
        // Network/server error — stay logged in on cached creds; the archive
        // watcher retries once connectivity returns.
      }
    };

    const checkUserSession = async () => {
      // Minimum splash time so the logo doesn't flash-and-vanish.
      const delay = new Promise(resolve => setTimeout(resolve, 1500));

      const userData = await AsyncStorage.getItem('user');
      const parsedData = userData ? JSON.parse(userData) : null;

      // The vendor document's own _id (same one BottomTab uses). Fallback to
      // the legacy sub-schema id only if the top-level is missing.
      const vendorId = parsedData?._id || parsedData?.vendor?._id;

      if (parsedData && vendorId) {
        // Restore context immediately so BottomTab has data, register for push
        // notifications, and kick off the profile refresh — none of which
        // block the navigation below.
        setVendorDataContext(parsedData);
        registerFcmToken(vendorId);
        refreshProfileInBackground(vendorId);
      }

      // Gate navigation ONLY on the short minimum-splash delay, never on the
      // network. This is what fixes the 30-50s "stuck on splash". (#2)
      await delay;

      if (!parsedData || !vendorId) {
        navigation.replace('login');
      } else {
        navigation.replace('BottomTab');
      }
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
