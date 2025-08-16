import React, { useEffect, useState } from 'react';
import { fetchTenders } from './api';
import MapView from './MapView';
import ListView from './ListView';
import Dashboard from './Dashboard';

export default function App() {
  const [data, setData] = useState({ user: { lat: 52.370216, lon: 4.895168, radiusKm: 50 }, items: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [q, setQ] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);

  const loader = async () => {
    setLoading(true);
    const res = await fetchTenders({ lat: data.user.lat, lon: data.user.lon, radiusKm, q });
    setData(res);
    setLoading(false);
  };

  useEffect(() => { loader(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { loader(); /* eslint-disable-next-line */ }, [q, radiusKm]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh' }}>
      <div style={{ padding: 8, borderRight: '1px solid #eee' }}>
        <Dashboard api={import.meta.env.VITE_API || 'http://localhost:4000'} />
        <div style={{ display:'flex', gap: 8, marginBottom: 8, alignItems:'center' }}>
          <input placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <label>Radius (km)
            <input type="number" min={1} max={200} value={radiusKm} onChange={(e)=>setRadiusKm(Number(e.target.value)||50)} style={{ width: 80, marginLeft: 6 }} />
          </label>
          {q && <button onClick={()=>setQ('')}>Clear</button>}
          <span style={{ marginLeft:'auto', fontSize:12, opacity:0.7 }}>{loading ? 'Loading…' : `${data.count} results`}</span>
        </div>
        {data.items.length === 0 && !loading ? (
          <div style={{ padding: 12, opacity: 0.7 }}>No tenders match your filters.</div>
        ) : (
          <ListView items={data.items} selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </div>
      <div>
        <MapView user={data.user} items={data.items} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}