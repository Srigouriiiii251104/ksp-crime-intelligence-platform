import React, { useEffect, useState } from 'react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Map, ShieldAlert, Activity } from 'lucide-react';

interface ForecastPoint {
  month: string;
  count: number | null;
  forecast: number | null;
  lower: number | null;
  upper: number | null;
  is_forecast: boolean;
}

interface TrendForecastProps {
  token: string;
}

const AREAS = [
  "Whitefield", "Indiranagar", "Koramangala", "Jayanagar", "HSR Layout", 
  "Electronic City", "Majestic", "Malleshwaram", "Hebbal", "Yelahanka", 
  "Banashankari", "Rajajinagar", "Sadashivanagar", "Basavanagudi", "Ulsoor", 
  "BTM Layout", "Bellandur", "Marathahalli", "Domlur", "Frazer Town"
];

const CRIME_TYPES = ["Theft", "Assault", "Cybercrime", "Fraud", "Murder", "Kidnapping", "Drug Trafficking"];

export const TrendForecast: React.FC<TrendForecastProps> = ({ token }) => {
  const [area, setArea] = useState<string>('');
  const [crimeType, setCrimeType] = useState<string>('');
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (area) params.append('area', area);
      if (crimeType) params.append('crime_type', crimeType);

      const response = await fetch(`/api/dashboard/forecast?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch forecasting data');
      const result = await response.json();
      setData(result.combined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [area, crimeType, token]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Crime Rate Predictive Trend Forecasting (Prophet Model)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Historical incident density mapped against future 3-month predictive confidence corridors.
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Police Jurisdictions</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            className="px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Crime Categories</option>
            {CRIME_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
            <Activity className="w-5 h-5 animate-spin text-primary mr-2" />
            <span>Computing time-series trend projections...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-destructive text-xs">
            <ShieldAlert className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: 'currentColor', fontSize: 10 }} />
              <YAxis tick={{ fill: 'currentColor', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              
              {/* Confidence interval area */}
              <Area type="monotone" dataKey="upper" fill="#3b82f6" stroke="none" fillOpacity={0.15} name="Upper Confidence Corridor" />
              <Area type="monotone" dataKey="lower" fill="#3b82f6" stroke="none" fillOpacity={0.15} name="Lower Confidence Corridor" />
              
              {/* Historical Line */}
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Recorded Incidents" />
              
              {/* Forecast Line */}
              <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} name="3-Month Forecast Projection" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
