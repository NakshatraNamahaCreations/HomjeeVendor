// Push-notification setup for the vendor app (#3).
//
// Behaviour: when a new lead is fanned out, the backend sends an FCM message.
// Android shows it on the high-importance "lead-alerts" channel, which plays a
// sound (Ola/Uber-style alert) and vibrates — even when the app is in the
// background or killed. When the app is in the FOREGROUND, FCM does NOT show a
// system notification automatically, so we display one ourselves via notifee so
// the sound still plays.
//
// All functions are defensive: if the native Firebase module isn't available
// (e.g. google-services.json not yet added), they log and no-op instead of
// crashing the app.

import {
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { API_BASE_URL, API_ENDPOINTS } from '../ApiService/apiConstants';

// Android locks a channel's sound/importance at creation time, so to change
// the sound we must use a NEW channel id (bump the suffix) — the old channel
// keeps its old settings otherwise. Bump this if you change LEAD_SOUND again.
export const LEAD_CHANNEL_ID = 'lead-alerts-v4';

// Emitted when a new-lead push arrives while the app is open, so the New Leads
// screen can auto-refresh its list.
export const NEW_LEAD_EVENT = 'NEW_LEAD_PUSH';

// Custom urgent (Ola/Uber-style) lead alert — the bundled
// android/app/src/main/res/raw/lead_alert.wav. Must match the backend's
// android.notification.sound. To revert to the device tone, set to 'default'.
const LEAD_SOUND = 'lead_alert';

let channelCreated = false;

// Create the high-importance channel ONCE. Channel settings (sound, vibration,
// importance) are locked in by Android at creation time — changing them later
// requires a new channel id or a reinstall.
export async function ensureLeadChannel() {
  if (Platform.OS !== 'android' || channelCreated) return;
  try {
    await notifee.createChannel({
      id: LEAD_CHANNEL_ID,
      name: 'New Lead Alerts',
      importance: AndroidImportance.HIGH, // heads-up + sound
      visibility: AndroidVisibility.PUBLIC, // show full content on lock screen
      sound: LEAD_SOUND,
      vibration: true,
      vibrationPattern: [300, 500],
    });
    channelCreated = true;
  } catch (e) {
    console.log('[notif] ensureLeadChannel error:', e?.message);
  }
}

// Ask for notification permission (Android 13+ needs the runtime prompt; FCM
// handles iOS). Safe to call on every launch.
export async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
    await messaging().requestPermission();
  } catch (e) {
    console.log('[notif] requestNotificationPermission error:', e?.message);
  }
}

// Display a lead notification locally (used for foreground messages so the
// sound plays while the app is open).
export async function displayLeadNotification(remoteMessage) {
  try {
    await ensureLeadChannel();
    const title =
      remoteMessage?.notification?.title ||
      remoteMessage?.data?.title ||
      'New Lead Available 🔔';
    const body =
      remoteMessage?.notification?.body ||
      remoteMessage?.data?.body ||
      'A new lead is waiting. Open the app to respond.';

    await notifee.displayNotification({
      title,
      body,
      data: remoteMessage?.data || {},
      android: {
        channelId: LEAD_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        importance: AndroidImportance.HIGH,
        sound: LEAD_SOUND,
        // Ola/Uber-style urgency: the sound repeats until the vendor opens or
        // dismisses it, with a strong repeating vibration.
        loopSound: true,
        vibrationPattern: [300, 400, 300, 400, 300, 400],
        pressAction: { id: 'default' },
      },
    });
  } catch (e) {
    console.log('[notif] displayLeadNotification error:', e?.message);
  }
}

// Get the FCM token and register it with the backend for this vendor.
export async function registerFcmToken(vendorId) {
  if (!vendorId) return;
  try {
    await requestNotificationPermission();
    // Required on some iOS/Android setups before getToken resolves.
    await messaging().registerDeviceForRemoteMessages?.();
    const token = await messaging().getToken();
    // TEMP DIAGNOSTIC: print the FCM token so we can send a test push. Remove later.
    console.warn('FCM_TOKEN_START>>>' + token + '<<<FCM_TOKEN_END');
    if (!token) {
      ToastAndroid.show('Push: no FCM token returned', ToastAndroid.LONG);
      return;
    }

    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.REGISTER_DEVICE_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, token }),
      },
    );
    if (res.ok) {
      await AsyncStorage.setItem(`fcmToken:${vendorId}`, token);
      ToastAndroid.show('Push notifications enabled ✓', ToastAndroid.LONG);
    } else {
      ToastAndroid.show('Push: register failed HTTP ' + res.status, ToastAndroid.LONG);
    }
  } catch (e) {
    console.log('[notif] registerFcmToken error:', e?.message);
    // DIAGNOSTIC: surface the failure on-screen so we can see why the FCM
    // token isn't registering. Remove once push is confirmed working.
    ToastAndroid.show('Push setup error: ' + (e?.message || 'unknown'), ToastAndroid.LONG);
  }
}

// Remove this device's token on logout so it stops receiving leads.
export async function unregisterFcmToken(vendorId) {
  try {
    const token = await messaging().getToken();
    if (vendorId && token) {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.REMOVE_DEVICE_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, token }),
      });
    }
    await AsyncStorage.removeItem(`fcmToken:${vendorId}`);
  } catch (e) {
    console.log('[notif] unregisterFcmToken error:', e?.message);
  }
}

// Wire up listeners. Call once from App.js. Returns an unsubscribe fn.
export function setupNotificationListeners() {
  let unsubMessage = () => {};
  let unsubRefresh = () => {};
  try {
    ensureLeadChannel();

    // Foreground messages: FCM won't auto-display, so we do it (plays sound),
    // and tell the New Leads screen to refresh its list.
    unsubMessage = messaging().onMessage(async remoteMessage => {
      await displayLeadNotification(remoteMessage);
      DeviceEventEmitter.emit(NEW_LEAD_EVENT, remoteMessage?.data || {});
    });

    // Token rotation: re-register the new token under the current vendor.
    unsubRefresh = messaging().onTokenRefresh(async token => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const vendorId = userData ? JSON.parse(userData)?._id : null;
        if (vendorId && token) {
          await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.REGISTER_DEVICE_TOKEN}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vendorId, token }),
            },
          );
          await AsyncStorage.setItem(`fcmToken:${vendorId}`, token);
        }
      } catch (e) {
        console.log('[notif] onTokenRefresh error:', e?.message);
      }
    });

    // Tapping a notifee notification in the foreground.
    notifee.onForegroundEvent(({ type }) => {
      if (type === EventType.PRESS) {
        // Navigation on tap can be added here once a navigation ref is wired.
      }
    });
  } catch (e) {
    console.log('[notif] setupNotificationListeners error:', e?.message);
  }

  return () => {
    unsubMessage();
    unsubRefresh();
  };
}
