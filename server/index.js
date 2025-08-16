require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.SERVER_PORT || 4000;
const APP_ORIGIN = process.env.APP_ORIGIN || '*';

app.use(cors({ origin: APP_ORIGIN, credentials: false }));
app.use(express.json());

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function parseNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseDateISO(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0,10);
}

// Simple relevancy score (0..100)
function score({ distanceKm, deadlineISO, nProps, expensive, mid, social }) {
  // nearer (<= 5km => 1, 50km => ~0), more props, sooner deadline
  const prox = Math.max(0, 1 - (distanceKm || 50) / 50);
  let urg = 0.5; // neutral if unknown
  if (deadlineISO) {
    const days = (new Date(deadlineISO) - new Date()) / (1000*60*60*24);
    // 0 days => 1.0, 90 days => 0
    urg = Math.max(0, Math.min(1, 1 - days / 90));
  }
  const props = Math.min(1, (nProps || 0) / 100); // cap at 100
  // Weight expensive > mid > social as a proxy for value if present
  const valueProxy = Math.max(0, (expensive ?? 0)*0.6 + (mid ?? 0)*0.3 + (social ?? 0)*0.1);
  const raw = 0.45*prox + 0.25*urg + 0.2*props + 0.1*valueProxy;
  return Math.round(raw * 100);
}

app.get('/api/tenders', (req, res) => {
  const userLat = parseNum(req.query.lat, 52.370216);   // default Amsterdam
  const userLon = parseNum(req.query.lon, 4.895168);
  const radiusKm = parseNum(req.query.radiusKm, 50);
  const q = String(req.query.q || '').trim().toLowerCase();

  const rows = db.prepare('SELECT * FROM tenders').all();

  const enriched = rows.map(r => {
    const lat = r.tender_latitude;
    const lon = r.tender_longitude;
    const dist = (Number.isFinite(lat) && Number.isFinite(lon)) ? haversine(userLat, userLon, lat, lon) : null;
    const deadlineISO = parseDateISO(r.tender_deadline);
    const sc = score({
      distanceKm: dist,
      deadlineISO,
      nProps: r.number_of_properties,
      expensive: r.expensive_ratio,
      mid: r.midrange_ratio,
      social: r.social_ratio
    });
    return { ...r, distance_km: dist, deadline_iso: deadlineISO, relevancy: sc };
  })
  .filter(r => r.distance_km == null || r.distance_km <= radiusKm)
  .filter(r => !q || (
    (r.municipality || '').toLowerCase().includes(q) ||
    (r.location || '').toLowerCase().includes(q) ||
    (r.status || '').toLowerCase().includes(q) ||
    (r.details || '').toLowerCase().includes(q)
  ));

  // Default sort: relevancy desc
  enriched.sort((a,b) => b.relevancy - a.relevancy);
  res.json({ user: { lat: userLat, lon: userLon, radiusKm }, count: enriched.length, items: enriched });
});

app.get('/api/tenders/:id', (req,res) => {
  const row = db.prepare('SELECT * FROM tenders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.listen(PORT, () => console.log(`API on :${PORT}`));