import React, { useEffect, useRef } from 'react';
import './ListView.css';


export default function ListView({ items, selectedId, onSelect }) {
  const refs = useRef({});
  useEffect(() => {
    if (selectedId && refs.current[selectedId]) {
      refs.current[selectedId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId]);

  return (
    <div className="listview-container">
      <table className="listview-table">
        <thead>
          <tr>
            <th align="left">Relevancy</th>
            <th align="left">Location</th>
            <th align="left">Municipality</th>
            <th align="left">Deadline</th>
            <th align="left">Published</th>
            <th align="left">Status</th>
            <th align="left">#Props</th>
            <th align="left">Distance (km)</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.id}
              ref={el => refs.current[item.id] = el}
              onClick={() => onSelect(item.id)}
              className={selectedId === item.id ? 'selected' : ''}
            >
              <td>{item.relevancy}</td>
              <td>{item.location || '—'}</td>
              <td>{item.municipality || '—'}</td>
              <td>{item.deadline_iso || '—'}</td>
              <td>{item.publication_date || '—'}</td>
              <td>{item.status || '—'}</td>
              <td>{item.number_of_properties ?? '—'}</td>
              <td>{item.distance_km ? item.distance_km.toFixed(1) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}