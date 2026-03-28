import * as SQLite from 'expo-sqlite';

let db;

export const initDB = async () => {
  db = await SQLite.openDatabaseAsync('neoagri.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      date_created TEXT,
      total_markers INTEGER,
      sync_status TEXT DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS markers (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      latitude REAL,
      longitude REAL,
      disease TEXT,
      confidence REAL,
      image_b64 TEXT,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY(session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS manual_scans (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      latitude REAL,
      longitude REAL,
      disease TEXT,
      confidence REAL,
      sync_status TEXT DEFAULT 'pending'
    );
  `);
  console.log('[SQLite] Database Initialized');
};

export const getDB = () => db;

// ---- DB Operations ----

export const insertSession = async (session) => {
  if (!db) return;
  await db.runAsync(
    'INSERT OR REPLACE INTO sessions (id, date_created, total_markers, sync_status) VALUES (?, ?, ?, ?)',
    [session.id, session.date_created, session.total_markers, 'synced']
  );
};

export const insertMarkers = async (markers) => {
  if (!db) return;
  for (const marker of markers) {
    const payload = marker.payload || marker;
    await db.runAsync(
      `INSERT OR REPLACE INTO markers (id, session_id, latitude, longitude, disease, confidence, image_b64, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.capture_id,
        marker.session_id || 'unknown',
        payload.latitude,
        payload.longitude,
        payload.model_result?.disease || '',
        payload.model_result?.confidence || 0,
        payload.leaf_image_b64 || '',
        payload.status || 'pending'
      ]
    );
  }
};

export const getOfflineMarkers = async () => {
  if (!db) return [];
  const result = await db.getAllAsync('SELECT * FROM markers WHERE status = ?', ['pending']);
  return result;
};

export const insertManualScan = async (scan) => {
  if (!db) return;
  await db.runAsync(
    `INSERT INTO manual_scans (id, timestamp, latitude, longitude, disease, confidence, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [
      scan.id,
      new Date().toISOString(),
      scan.latitude,
      scan.longitude,
      scan.disease,
      scan.confidence
    ]
  );
};

export const getPendingScans = async () => {
  if (!db) return [];
  return await db.getAllAsync('SELECT * FROM manual_scans WHERE sync_status = ?', ['pending']);
};

export const markScansSynced = async (scanIds) => {
  if (!db || !scanIds.length) return;
  const placeholders = scanIds.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE manual_scans SET sync_status = 'synced' WHERE id IN (${placeholders})`,
    scanIds
  );
};
