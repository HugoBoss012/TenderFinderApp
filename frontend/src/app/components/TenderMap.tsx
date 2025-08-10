'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Tender {
  id: number;
  location: string;
  municipality: string;
  province: string;
  status: string;
  number_of_properties: number;
  distance: number;
  relevancy: number;
  tender_latitude: number;
  tender_longitude: number;
  center_municipality_latitude: number;
  center_municipality_longitude: number;
}

interface TenderMapProps {
  tenders: Tender[];
  userLocation: { lat: number; lng: number };
  selectedTenderIndex: number | null;
  onMarkerClick: (tenderId: number) => void;
}

export default function TenderMap({ tenders, userLocation, selectedTenderIndex, onMarkerClick }: TenderMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map('map').setView([userLocation.lat, userLocation.lng], 8);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background: #ef4444; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20]
      });
      
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup('Your Location (The Hague)')
        .openPopup();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
    markersRef.current = [];

    // Add tender markers
    tenders.forEach((tender, index) => {
      const lat = tender.tender_latitude || tender.center_municipality_latitude;
      const lng = tender.tender_longitude || tender.center_municipality_longitude;
      
      if (lat && lng) {
        const marker = L.marker([lat, lng])
          .addTo(mapRef.current!)
          .bindPopup(`
            <strong>${tender.location}</strong><br>
            ${tender.municipality}<br>
            ${tender.number_of_properties || 'N/A'} properties<br>
            Distance: ${Math.round(tender.distance)}km<br>
            Relevancy: ${tender.relevancy}%
          `);
        
        marker.on('click', () => onMarkerClick(tender.id));
        markersRef.current.push(marker);
      }
    });
  }, [tenders, onMarkerClick]);

  useEffect(() => {
    if (mapRef.current && selectedTenderIndex !== null && markersRef.current[selectedTenderIndex]) {
      const tender = tenders[selectedTenderIndex];
      const lat = tender.tender_latitude || tender.center_municipality_latitude;
      const lng = tender.tender_longitude || tender.center_municipality_longitude;
      
      if (lat && lng) {
        mapRef.current.setView([lat, lng], 12);
        markersRef.current[selectedTenderIndex].openPopup();
      }
    }
  }, [selectedTenderIndex, tenders]);

  return <div id="map" className="h-full w-full" />;
}