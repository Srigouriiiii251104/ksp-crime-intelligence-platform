import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Calendar, Filter, Activity, MapPin } from 'lucide-react';

interface CrimePoint {
  id: number;
  fir_number: string;
  date: string;
  crime_type: string;
  description: string;
  location_name: string;
  area: string;
  latitude: number;
  longitude: number;
}

interface Hotspot {
  cluster_id: number;
  latitude: number;
  longitude: number;
  count: number;
  crime_types: Record<string, number>;
  points: CrimePoint[];
}

interface MapHotspotsProps {
  token: string;
}

const CRIME_TYPES = ["Theft", "Assault", "Cybercrime", "Fraud", "Murder", "Kidnapping", "Drug Trafficking"];

export const MapHotspots: React.FC<MapHotspotsProps> = ({ token }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const [crimeType, setCrimeType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [data, setData] = useState<{ hotspots: Hotspot[]; points: CrimePoint[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hotspots data from API
  const fetchHotspots = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (crimeType) params.append('crime_type', crimeType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`/api/hotspots?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load spatial hotspot data');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, [crimeType, startDate, endDate, token]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11.5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map markers when data changes
  useEffect(() => {
    if (!mapRef.current || !layersGroupRef.current || !data) return;

    layersGroupRef.current.clearLayers();

    // Render hotspot clusters
    data.hotspots.forEach(hotspot => {
      const radius = Math.min(Math.max(hotspot.count * 8, 20), 50);

      const circle = L.circleMarker([hotspot.latitude, hotspot.longitude], {
        radius: radius,
        fillColor: hotspot.count > 10 ? '#ef4444' : hotspot.count > 5 ? '#f59e0b' : '#3b82f6',
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.5
      });

      const typesList = Object.entries(hotspot.crime_types)
        .map(([type, count]) => `<li><b>${type}:</b> ${count}</li>`)
        .join('');

      circle.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <h4 style="margin: 0 0 6px 0; font-weight: bold; color: #1e293b;">Cluster #${hotspot.cluster_id}</h4>
          <p style="margin: 0 0 4px 0;"><b>Incidents:</b> ${hotspot.count} FIRs</p>
          <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
            ${typesList}
          </ul>
        </div>
      `);

      layersGroupRef.current?.addLayer(circle);
    });

  }, [data]);

  return (
    <div className="h-full bg-background text-foreground p-6 flex flex-col space-y-4">
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            GIS Spatial Hotspot Clustering
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            DBSCAN spatial density analysis identifying high-incident hotspots across Bengaluru jurisdictions.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            className="px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Crime Types</option>
            {CRIME_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden relative shadow-sm min-h-[400px]">
        {loading && (
          <div className="absolute top-4 right-4 z-[1000] bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-md flex items-center gap-2 text-xs">
            <Activity className="w-4 h-4 text-primary animate-spin" />
            <span>Updating Spatial Clustering...</span>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>
    </div>
  );
};
