import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icons in Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl, shadowUrl });
L.Marker.prototype.options.icon = DefaultIcon;

function FlyTo({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.setView([lat, lon], 10);
  }, [lat, lon]);
  return null;
}

export default function MapView({ user, items, selectedId, onSelect, markerRefs }) {
  const center = [user.lat, user.lon];
  const selectedItem = items.find((i) => i.id === selectedId)
  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>
          Default location
          <br />
          Lat: {user.lat.toFixed(3)} Lon: {user.lon.toFixed(3)}
          <br />
          Radius: {user.radiusKm} km
        </Popup>
      </Marker>
      {items.map((item) => {
        const latitude = item.tender_latitude ?? item.center_municipality_latitude
        const longitude = item.tender_longitude ?? item.center_municipality_longitude
        return (
          <Marker
            key={item.id}
            position={[latitude, longitude]}
            eventHandlers={{ click: () => onSelect(item.id) }}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[item.id] = ref
              }
            }}
          >
            <Popup>
              <div
                style={{
                  fontWeight: selectedId === item.id ? "bold" : "normal",
                }}
              >
                {item.location || "—"}
                <br />
                {item.municipality || "—"}
                <br />
                Distance: {item.distance_km
                  ? item.distance_km.toFixed(1)
                  : "—"}{" "}
                km
                <br />
                Relevancy: {item.relevancy}
              </div>
            </Popup>
          </Marker>
        );
      })}
      <FlyTo
        lat={selectedItem?.tender_latitude ?? selectedItem?.center_municipality_latitude}
        lon={selectedItem?.tender_longitude ?? selectedItem?.center_municipality_longitude}
      />
    </MapContainer>
  );
}
