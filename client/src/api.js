const API = import.meta.env.VITE_API || 'http://localhost:4000';

export async function fetchTenders({ lat, lon, radiusKm, q }={}) {
  const params = new URLSearchParams();
  if (lat) params.set('lat', lat);
  if (lon) params.set('lon', lon);
  if (radiusKm) params.set('radiusKm', radiusKm);
  if (q) params.set('q', q);
  const res = await fetch(`${API}/api/tenders?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
}