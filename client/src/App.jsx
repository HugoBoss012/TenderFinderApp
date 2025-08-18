import { useEffect, useRef, useState, useCallback } from "react";
import { fetchTenders } from "./api";
import MapView from "./MapView";
import ListView from "./ListView";

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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh" }}>
      <div style={{ padding: 8, borderRight: "1px solid #eee", display: "flex", flexDirection: "column" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
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
              style={{ width: 80, marginLeft: 6 }}
            />
          </label>
          {q && <button onClick={() => setQ("")}>Clear</button>}
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
            {loading ? "Loading…" : `${data.count} results`}
          </span>
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
          {
            loading
              ? 'Loading...'
              : data.items.length === 0
                ? <div style={{ padding: 12, opacity: 0.7 }}>No tenders match your filters.</div>
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
