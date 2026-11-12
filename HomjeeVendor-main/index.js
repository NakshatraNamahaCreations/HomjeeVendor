/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Background / quit-state FCM handler (#3). Must be registered at the top level
// so the OS can invoke it when the app isn't foregrounded. The backend sends a
// "notification" payload, which Android AUTO-DISPLAYS from the tray (on the
// "lead-alerts-v2" channel with sound) when the app is backgrounded/killed — so
// we must NOT display it again here, or the user gets a duplicate. This handler
// just needs to exist (RNFirebase requires it) and resolve.
// Guarded so the app still launches locally without google-services.json.
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async () => {
    // No-op: FCM auto-displays the notification payload in the background.
  });
} catch (e) {
  console.log('[notif] background handler skipped (Firebase not configured):', e?.message);
}

AppRegistry.registerComponent(appName, () => App);
