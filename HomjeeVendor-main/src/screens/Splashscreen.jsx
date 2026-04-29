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
      const delay = new Promise(resolve => setTimeout(resolve, 80000));

      const sessionCheck = (async () => {
        const userData = await AsyncStorage.getItem('user');
        const parsedData = userData ? JSON.parse(userData) : null;

        // The vendor document's own _id (same one BottomTab uses).
        // Fallback to the legacy sub-schema id only if the top-level is missing.
        const vendorId = parsedData?._id || parsedData?.vendor?._id;

        // Not logged in — go to login.
        if (!parsedData || !vendorId) {
          navigation.replace('login');
          return;
        }

        // Restore context immediately so BottomTab has data even if the
        // background refresh is slow.
        setVendorDataContext(parsedData);

        try {
          const response = await getRequest(
            `${API_ENDPOINTS.GET_VENDOR_PROFILE}${vendorId}`,
          );

          // 🔒 Archived → force logout. This is the only server state that
          // should kick the vendor out; everything else should keep the
          // session alive.
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
            // Refresh context with the latest profile.
            await AsyncStorage.setItem('user', JSON.stringify(response.vendor));
            setVendorDataContext(response.vendor);
          }

          // Go to the authenticated area regardless of whether the refresh
          // succeeded — we have cached credentials, and useArchiveWatcher
          // will re-check archive status once online.
          navigation.replace('BottomTab');
        } catch (error) {
          // Explicit archive response from backend (403 VENDOR_ARCHIVED).
          if (error?.code === 'VENDOR_ARCHIVED') {
            await AsyncStorage.clear();
            ToastAndroid.show(
              error?.message ||
                'Your account has been archived. Please contact support.',
              ToastAndroid.LONG,
            );
            navigation.replace('login');
            return;
          }

          // Network/server error — do NOT clear storage, stay logged in.
          // The archive watcher will retry once connectivity returns.
          navigation.replace('BottomTab');
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
