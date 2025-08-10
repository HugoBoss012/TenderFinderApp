'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Dynamically import map component to avoid SSR issues
const TenderMap = dynamic(() => import('../components/TenderMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
});

interface Tender {
  id: number;
  location: string;
  municipality: string;
  province: string;
  status: string;
  details: string;
  number_of_properties: number;
  tender_deadline: string;
  distance: number;
  relevancy: number;
  tender_latitude: number;
  tender_longitude: number;
  center_municipality_latitude: number;
  center_municipality_longitude: number;
}

export default function Home() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [filteredTenders, setFilteredTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    radius: 50,
    status: '',
    minProperties: '',
    search: ''
  });

  const USER_LOCATION = { lat: 52.0705, lng: 4.3007 }; // The Hague

  useEffect(() => {
    fetchTenders();
  }, [filters]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/tenders', {
        params: {
          user_lat: USER_LOCATION.lat,
          user_lng: USER_LOCATION.lng,
          radius: filters.radius,
          status: filters.status || undefined,
          min_properties: filters.minProperties || undefined,
          search: filters.search || undefined
        }
      });
      setTenders(response.data);
      setFilteredTenders(response.data);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTenderClick = (index: number) => {
    setSelectedTender(index);
  };

  const handleMarkerClick = (tenderId: number) => {
    const index = filteredTenders.findIndex(t => t.id === tenderId);
    setSelectedTender(index);
  };

  return (
    <div className="flex h-screen">
      {/* Map Container */}
      <div className="flex-1 relative">
        <TenderMap
          tenders={filteredTenders}
          userLocation={USER_LOCATION}
          selectedTenderIndex={selectedTender}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-blue-900 text-white p-5">
          <h1 className="text-xl font-bold mb-2">Tender Finder</h1>
          <p className="text-blue-200 text-sm">Discover municipal tenders in the Netherlands</p>
        </div>

        {/* Filters */}
        <div className="p-5 border-b border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search tenders..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Radius (km)</label>
              <input
                type="number"
                value={filters.radius}
                onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value) || 50})}
                min="1"
                max="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="Aankondiging van opdracht">Active Tenders</option>
                <option value="Aankondiging gegunde opdracht">Awarded</option>
                <option value="Marktconsultatie">Market Consultation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Min Properties</label>
              <input
                type="number"
                value={filters.minProperties}
                onChange={(e) => setFilters({...filters, minProperties: e.target.value})}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tender List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 text-center text-gray-500">Loading tenders...</div>
          ) : filteredTenders.length === 0 ? (
            <div className="p-5 text-center text-gray-500">No tenders found matching your criteria.</div>
          ) : (
            filteredTenders.map((tender, index) => (
              <div
                key={tender.id}
                onClick={() => handleTenderClick(index)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTender === index ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="font-semibold text-sm text-gray-900 mb-1">{tender.location}</div>
                <div className="text-xs text-gray-600 mb-2">{tender.municipality}, {tender.province}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    tender.status.includes('gegunde') ? 'bg-yellow-100 text-yellow-800' :
                    tender.status.includes('Marktconsultatie') ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {tender.status}
                  </span>
                  {tender.number_of_properties && (
                    <span className="text-gray-600">🏠 {tender.number_of_properties}</span>
                  )}
                  <span className="text-gray-600">📍 {Math.round(tender.distance)}km</span>
                  <span className="bg-blue-500 text-white px-2 py-1 rounded font-semibold">
                    {tender.relevancy}% relevant
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}