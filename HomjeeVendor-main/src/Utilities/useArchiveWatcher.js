import { useEffect, useRef } from 'react';
import {
  AppState,
  ToastAndroid,
  Alert,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { API_ENDPOINTS } from '../ApiService/apiConstants';
import { getRequest } from '../ApiService/apiHelper';
import { VENDOR_ARCHIVED_EVENT } from '../ApiService/api';

const POLL_INTERVAL_MS = 60 * 1000;

/**
 * Watches whether the logged-in vendor has been archived by an admin.
 * If archived: clears storage, clears vendor context, navigates to login.
 *
 * Designed to be dropped into any authenticated screen/container. Safe to
 * mount multiple times — each instance only polls when vendorId is present.
 */
export const useArchiveWatcher = ({
  vendorId,
  navigation,
  clearVendorContextData,
}) => {
  const forcedOutRef = useRef(false);

  useEffect(() => {
    if (!vendorId) return undefined;

    let cancelled = false;
    forcedOutRef.current = false;

    const forceLogout = async (reason) => {
      if (forcedOutRef.current || cancelled) return;
      forcedOutRef.current = true;

      try {
        await AsyncStorage.clear();
      } catch (e) {
        // ignore
      }
      try {
        if (typeof clearVendorContextData === 'function') {
          clearVendorContextData();
        }
      } catch (e) {
        // ignore
      }

      const message =
        reason ||
        'Your account has been archived by the administrator. Please contact support.';

      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          message,
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );
      } else {
        Alert.alert('Account archived', message);
      }

      try {
        navigation?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'login' }],
          }),
        );
      } catch (e) {
        // ignore
      }
    };

    const checkArchiveStatus = async () => {
      if (cancelled || forcedOutRef.current) return;
      try {
        const res = await getRequest(
          `${API_ENDPOINTS.ARCHIVE_STATUS}${vendorId}`,
        );
        if (res?.isArchived === true) {
          forceLogout(res?.archiveReason || null);
        }
      } catch (err) {
        // If backend explicitly returns VENDOR_ARCHIVED in any shape, honor it.
        if (err?.code === 'VENDOR_ARCHIVED' || err?.isArchived === true) {
          forceLogout(err?.message || null);
        }
        // Otherwise: network/server error — silently ignore.
      }
    };

    checkArchiveStatus();
    const intervalId = setInterval(checkArchiveStatus, POLL_INTERVAL_MS);

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') checkArchiveStatus();
    });

    // Any API call that returns code=VENDOR_ARCHIVED broadcasts this event.
    const archivedEventSub = DeviceEventEmitter.addListener(
      VENDOR_ARCHIVED_EVENT,
      (payload) => {
        forceLogout(payload?.message || null);
      },
    );

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      appStateSub?.remove?.();
      archivedEventSub?.remove?.();
    };
  }, [vendorId, navigation, clearVendorContextData]);
};

export default useArchiveWatcher;
