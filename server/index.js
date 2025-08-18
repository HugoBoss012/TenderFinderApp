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

// Simple relevancy ranking (0..100)
function ranking({ distanceKm, deadlineISO, nProps, expensive, mid, social }) {
  // Simple ranking: closer, sooner, more properties
  const prox = 1 - Math.min(1, (distanceKm || 50) / 50);
  const urg = deadlineISO ? Math.max(0, 1 - ((new Date(deadlineISO) - new Date()) / (1000*60*60*24*90))) : 0.5;
  const props = Math.min(1, (nProps || 0) / 100);
  const raw = (prox + urg + props) / 3;
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
    const sc = ranking({
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


// Stats endpoint: returns summary statistics about tenders
app.get('/api/stats', (req, res) => {
  const rows = db.prepare('SELECT * FROM tenders').all();
  const total = rows.length;
  const byStatus = {};
  const byMunicipality = {};
  let minDeadline = null, maxDeadline = null;
  rows.forEach(r => {
    // Status count
    const status = r.status || 'Unknown';
    byStatus[status] = (byStatus[status] || 0) + 1;
    // Municipality count
    const mun = r.municipality || 'Unknown';
    byMunicipality[mun] = (byMunicipality[mun] || 0) + 1;
    // Deadlines
    if (r.tender_deadline) {
      const d = new Date(r.tender_deadline);
      if (!minDeadline || d < minDeadline) minDeadline = d;
      if (!maxDeadline || d > maxDeadline) maxDeadline = d;
    }
  });
  res.json({
    total,
    byStatus,
    byMunicipality,
    minDeadline: minDeadline ? minDeadline.toISOString().slice(0,10) : null,
    maxDeadline: maxDeadline ? maxDeadline.toISOString().slice(0,10) : null
  });
});

app.listen(PORT, () => console.log(`API on :${PORT}`));