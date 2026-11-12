# Push Notifications Setup (New-Lead Alerts with Sound) — #3 / #4

The code for push notifications is fully implemented. To make it **live**, you
must add Firebase credentials (only you can create these — they're tied to your
Google account). Until you do, the app and backend run normally; push simply
stays off (the backend logs `push notifications are DISABLED`).

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** (e.g. "Homjee").
2. Inside the project → **Add app → Android**.
   - **Android package name:** `com.homjeevendor`  *(must match exactly)*
   - Download **`google-services.json`**.
3. Place it at:
   ```
   android/app/google-services.json
   ```

## 2. Backend service-account key

1. Firebase Console → **Project Settings (gear) → Service accounts**.
2. Click **Generate new private key** → downloads a JSON file.
3. Give it to the backend by EITHER (pick one):
   - **Env var (recommended for Render):** set
     `FIREBASE_SERVICE_ACCOUNT_JSON` = the full contents of that JSON (one line), **or**
   - **Env path:** set `FIREBASE_SERVICE_ACCOUNT_PATH` = absolute path to the file, **or**
   - **File:** save it as `serviceAccountKey.json` in the backend project root.

> ⚠️ Never commit the service-account key or `google-services.json` to git.
> Add them to `.gitignore`.

## 3. Install dependencies & rebuild

**Vendor app:**
```bash
cd HomjeeVendor-main
npm install
cd android && ./gradlew clean && cd ..
npx react-native run-android   # a full rebuild is required (native deps + fonts)
```

**Backend:**
```bash
cd Homjee_Backend
npm install        # pulls in firebase-admin
# restart the server
```

## 4. (Optional) Custom alert sound — the "Ola-style" sound

By default it plays the device's **default** notification sound. For a distinct
ringtone-style alert:

1. Add an audio file at `android/app/src/main/res/raw/lead_alert.mp3`
   (short, < 30s; lowercase name, no spaces).
2. In `src/Utilities/notifications.js`, set `const LEAD_SOUND = 'lead_alert';`
3. In the backend `src/services/pushNotification.service.js`, change the android
   `sound: "default"` to `sound: "lead_alert"`.
4. Uninstall + reinstall the app (Android locks channel sound at creation time).

---

## How it works

- **Backend:** when a lead is fanned out, `leadFanout.service.js` calls
  `sendPushToVendors(...)`, which sends an FCM message to every eligible
  vendor's registered device tokens (`vendor.fcmTokens`).
- **App:**
  - On login (`Otp.js`) and on app launch (`Splashscreen.jsx`) the device's FCM
    token is registered via `POST /vendor/register-device-token`.
  - `index.js` handles **background/killed** messages; `App.js` handles
    **foreground** messages — both display on the high-importance `lead-alerts`
    channel so the **sound plays in all states**.
- **#4:** new-lead notifications are **not** shown in the in-app notification
  history (`Notification.js` filters out `LEAD` types) — they arrive only as
  push.

## Quick test

After setup, trigger a new lead (or have admin re-fanout one). The assigned
vendors' phones should buzz + play a sound with a "New Lead Available 🔔"
notification, even with the app closed.
