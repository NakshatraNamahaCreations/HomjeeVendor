import axios from "axios";
import { DeviceEventEmitter } from "react-native";
import { API_BASE_URL } from "./apiConstants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// // Optional: auth token interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// 🔒 Detect archived-vendor responses (code: VENDOR_ARCHIVED) from any
// endpoint and broadcast a global event. Authenticated screens listen via
// the useArchiveWatcher hook and force-logout.
export const VENDOR_ARCHIVED_EVENT = "VENDOR_ARCHIVED";

api.interceptors.response.use(
  (response) => {
    const body = response?.data;
    if (body && body.code === "VENDOR_ARCHIVED") {
      DeviceEventEmitter.emit(VENDOR_ARCHIVED_EVENT, body);
    }
    return response;
  },
  (error) => {
    const body = error?.response?.data;
    if (body && body.code === "VENDOR_ARCHIVED") {
      DeviceEventEmitter.emit(VENDOR_ARCHIVED_EVENT, body);
    }
    return Promise.reject(error);
  },
);

export default api;
