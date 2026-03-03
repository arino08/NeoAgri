/**
 * Scan history persistence using AsyncStorage.
 * All data stays on-device — fully offline.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanRecord } from '../types';

const HISTORY_KEY = '@neoagri_scan_history';
const MAX_HISTORY = 50;

/**
 * Save a scan record to history (prepend to the list).
 */
export async function saveToHistory(scan: ScanRecord): Promise<void> {
  try {
    const existing = await getHistory();
    const updated = [scan, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[NeoAgri] Failed to save history:', error);
  }
}

/**
 * Get all scan history (most recent first).
 */
export async function getHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanRecord[];
  } catch (error) {
    console.error('[NeoAgri] Failed to load history:', error);
    return [];
  }
}

/**
 * Clear all scan history.
 */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('[NeoAgri] Failed to clear history:', error);
  }
}

/**
 * Delete a single scan by ID.
 */
export async function deleteScan(scanId: string): Promise<void> {
  try {
    const existing = await getHistory();
    const filtered = existing.filter((s) => s.id !== scanId);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[NeoAgri] Failed to delete scan:', error);
  }
}

/**
 * Generate a unique ID for a scan.
 */
export function generateScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
