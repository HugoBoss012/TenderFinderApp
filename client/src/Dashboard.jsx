import React, { useEffect, useState } from 'react';

export default function Dashboard({ api }) {
  const [stats, setStats] = useState(null);
  useEffect(()=>{ fetch(`${api}/api/summary`).then(r=>r.json()).then(setStats); }, [api]);
  if (!stats) return <div>Loading stats…</div>;
  return (
    <div style={{ fontSize: 13, marginBottom: 12 }}>
      <strong>Total tenders:</strong> {stats.total}<br/>
      <strong>Status breakdown:</strong> {stats.byStatus.map(s=>`${s.status}: ${s.c}`).join(', ')}<br/>
      <strong>Provinces:</strong> {stats.byProvince.map(p=>`${p.province||'—'}: ${p.c}`).join(', ')}
    </div>
  );
}