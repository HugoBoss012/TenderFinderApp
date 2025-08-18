import { useEffect, useRef, useState, useCallback } from "react";
import { fetchTenders } from "./api";
import MapView from "./MapView";
import ListView from "./ListView";
import "../styling/App.css";

export default function App() {
  const [data, setData] = useState({
    user: { lat: 52.370216, lon: 4.895168, radiusKm: 50 },
    items: [],
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [q, setQ] = useState("");
  const [radiusKm, setRadiusKm] = useState(50);
  const markerRefs = useRef({})

  const loader = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchTenders({
        lat: data.user.lat,
        lon: data.user.lon,
        radiusKm,
        q,
      });
      setData(res);
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
  }, [radiusKm, q])

  useEffect(() => {
    loader();
  }, [loader]);

  if (!data.user || !data.user.lat || !data.user.lon) {
    return <div>No location data available</div>;
  }

  function handleSelect (itemId) {
    setSelectedId(itemId)
    const marker = markerRefs.current[itemId]
    marker.openPopup()
  }

  return (
    <div className="app-grid">
      <div className="app-list-panel">
        <div className="app-search-row">
          <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <label>
            Radius (km)
            <input
              type="number"
              min={1}
              max={200}
              value={radiusKm}
              onChange={(e) => {
                if (e.target.value === '') {
                  setRadiusKm(null)
                } else {
                  const number = Number(e.target.value)
                  setRadiusKm(number)
                }
              }}
              className="app-radius-input"
            />
          </label>
          {q && <button className="app-clear-btn" onClick={() => setQ("")}>Clear</button>}
          <span className="app-results-count">
            {loading ? "Loading…" : `${data.count} results`}
          </span>
        </div>

        <div className="app-list-content">
          {
            loading
              ? 'Loading...'
              : data.items.length === 0
                ? <div className="app-no-results">No tenders match your filters.</div>
                : <ListView items={data.items} selectedId={selectedId} onSelect={handleSelect} markerRefs={markerRefs} />
          }
        </div>
      </div>

      <div>
        <MapView
          user={data.user}
          items={data.items}
          selectedId={selectedId}
          onSelect={handleSelect}
          markerRefs={markerRefs}
        />
      </div>
    </div>
  );
}
