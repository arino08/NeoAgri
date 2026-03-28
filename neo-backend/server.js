const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Postgres Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/neoagri'
});

pool.connect().then(() => console.log('[DB] Connected to PostgreSQL')).catch(err => console.error('[DB] Error connecting', err));

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-neoagri';

// Twilio Setup
// In production, we'll actually send the SMS. For dev without strict .env tokens, we can mock if disabled.
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Temporary memory store for OTPs (in production, use Redis)
const otpStore = {};

// --- AUTHENTICATION ---
app.post('/auth/otp/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });

  // Generate a random 4 digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[phone] = otp;
  const messageBody = `Your NeoAgri OTP is ${otp}. Please do not share this with anyone.`;

  try {
    if (twilioClient) {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      console.log(`[AUTH] Sent Twilio OTP ${otp} to ${phone}`);
    } else {
      console.log(`[AUTH-MOCK] Sent OTP ${otp} to ${phone} (Twilio not configured)`);
    }
    res.json({ success: true, message: 'OTP Sent' });
  } catch (err) {
    console.error(`[AUTH] Failed to send OTP: ${err.message}`);
    res.status(500).json({ error: 'Failed to send OTP SMS' });
  }
});

app.post('/auth/otp/verify', async (req, res) => {
  const { phone, otp } = req.body;

  // Validate OTP
  if (!otpStore[phone] || otpStore[phone] !== otp) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // Clear OTP
  delete otpStore[phone];

  try {
    // Upsert farmer in DB
    await pool.query(
      `INSERT INTO farmers (phone) VALUES ($1) ON CONFLICT (phone) DO NOTHING`,
      [phone]
    );

    // Generate Session Token
    const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { phone } });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Middleware for auth
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- DRONE PAYLOAD SYNC ---
app.post('/session/create', authenticateToken, async (req, res) => {
  const { farmId, droneId, flightPath, markers } = req.body;

  try {
    const sessionId = 'S-' + Date.now();
    const phone = req.user.phone;

    console.log(`[DRONE] New session created by ${phone} for Farm: ${farmId}`);
    console.log(`[DRONE] Received ${markers?.length || 0} captures from website_station_backend`);

    // Insert Session
    await pool.query(
      `INSERT INTO drone_sessions (session_id, farmer_phone, farm_id, drone_id) VALUES ($1, $2, $3, $4)`,
      [sessionId, phone, farmId, droneId]
    );

    // Insert Markers
    if (markers && markers.length > 0) {
      for (const m of markers) {
        if (m.type === 'leaf_capture' && m.payload) {
          const { capture_id, latitude, longitude, timestamp_utc, model_result, leaf_image_b64 } = m.payload;

          await pool.query(
            `INSERT INTO drone_markers
             (capture_id, session_id, latitude, longitude, timestamp_utc, disease, confidence, leaf_image_b64, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              capture_id,
              sessionId,
              latitude,
              longitude,
              new Date(timestamp_utc),
              model_result?.disease || '',
              model_result?.confidence || 0,
              leaf_image_b64 || null,
              'unverified'
            ]
          );
        }
      }
    }

    res.json({ success: true, sessionId, capturesProcessed: markers?.length || 0 });
  } catch (err) {
    console.error('[DRONE-ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// --- FETCH MARKERS (For offline pull) ---
app.get('/session/:id/markers', authenticateToken, async (req, res) => {
  const sessionId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT * FROM drone_markers WHERE session_id = $1`,
      [sessionId]
    );

    // Mapping back into the website_station_backend 'leaf_capture' format for the app
    const markers = result.rows.map(row => ({
      type: "leaf_capture",
      payload: {
        capture_id: row.capture_id,
        latitude: row.latitude,
        longitude: row.longitude,
        timestamp_utc: row.timestamp_utc,
        model_result: {
          disease: row.disease,
          confidence: row.confidence
        },
        leaf_image_b64: row.leaf_image_b64,
        status: row.status
      }
    }));

    res.json({ sessionId, markers });
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch markers' });
  }
});

// --- FARMER HISTORY ---
app.get('/farmer/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT session_id, flight_date, farm_id FROM drone_sessions WHERE farmer_phone = $1 ORDER BY flight_date DESC`,
      [req.user.phone]
    );
    res.json({ history: result.rows });
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Optional: Scan Upload endpoint for offline queue sync
app.post('/scan/sync', authenticateToken, async (req, res) => {
  const { scans } = req.body;
  const phone = req.user.phone;
  console.log(`[SYNC] Received ${scans?.length || 0} offline scans from ${phone}`);

  try {
    if (scans && scans.length > 0) {
      for (const s of scans) {
        await pool.query(
          `INSERT INTO manual_scans (scan_id, farmer_phone, timestamp, latitude, longitude, disease, confidence)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (scan_id) DO NOTHING`,
          [
            s.id, // we stored scan.id in SQLite mapped as scan_id here
            phone,
            new Date(s.timestamp),
            s.latitude,
            s.longitude,
            s.disease,
            s.confidence
          ]
        );
      }
    }
    res.json({ success: true, syncedCount: scans?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync scans' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
