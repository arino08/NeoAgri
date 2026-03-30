// src/services/SyncService.js
import { SQLite } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API CONSTANTS
export const API_URL = 'http://192.168.0.173:3000'; // Replace with PROD or dynamic IP

export const getAuthToken = async () => {
  return await AsyncStorage.getItem('user_token');
};

export const requestOtp = async (phone) => {
  try {
    const res = await fetch(`${API_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await res.json();
  } catch (e) {
    console.error('OTP Send error', e);
    return { success: false };
  }
};

export const verifyOtp = async (phone, otp) => {
  try {
    const res = await fetch(`${API_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (data.token) {
      await AsyncStorage.setItem('user_token', data.token);
      await AsyncStorage.setItem('user_phone', phone);
    }
    return data;
  } catch (e) {
    console.error('OTP Verify error', e);
    return { success: false };
  }
};

export const syncOfflineScans = async (scans) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/scan/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ scans })
    });
    const result = await response.json();
    return result.success;
  } catch (err) {
    console.error('Sync Error', err);
    return false;
  }
};

export const fetchDroneMarkers = async (sessionId) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/session/${sessionId}/markers`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await response.json();
    return result.markers || [];
  } catch (err) {
    console.error('Fetch Markers Error', err);
    return [];
  }
};
