import React, { useEffect, useState } from 'react';
import type { DashboardStats as DashboardStatsType } from '../types.js';
import { TrendForecast } from './TrendForecast.js';
import { DemographicCorrelation } from './DemographicCorrelation.js';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
  Shield, AlertTriangle, MapPin, Activity, Sparkles, TrendingUp 
} from 'lucide-react';

interface DashboardProps {
  token: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to retrieve crime statistics');
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-background">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Loading Crime Analytics Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="h-full flex items-center justify-center text-destructive p-6 bg-background">
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-2" />
          <p className="font-semibold text-destructive">Analytics System Error</p>
          <p className="text-xs mt-1 text-muted-foreground">{error || 'Could not load crime stats.'}</p>
        </div>
      </div>
    );
  }

  const totalCrimes = stats.crimes_by_type.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="h-full bg-background text-foreground p-6 space-y-6 flex flex-col min-h-0 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Karnataka Crime Analytics & Intelligence Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time aggregate crime statistics, jurisdictional breakdown, and predictive forecasting.</p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl text-xs shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground">Total Logged Case Files:</span>
          <span className="font-bold text-foreground font-mono">{totalCrimes} FIRs</span>
        </div>
      </div>

      {/* Analytics Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1 pb-4">
        {/* Top 2 charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Crime Type Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Incidents by Crime Category
            </h2>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-muted px-2 py-0.5 rounded-md">Type Breakdown</span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.crimes_by_type}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {stats.crimes_by_type.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime by Area */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Jurisdictional Area Distribution
            </h2>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-muted px-2 py-0.5 rounded-md">Police Stations</span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.crimes_by_area.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="area" tick={{ fill: 'currentColor', fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: 'currentColor', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.crimes_by_area.slice(0, 8).map((_, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Middle row: Trend Forecast Module */}
      <div className="w-full">
        <TrendForecast token={token} />
      </div>

      {/* Bottom row: Demographic Correlation Module */}
      <div className="w-full">
        <DemographicCorrelation token={token} />
      </div>

      </div>

    </div>
  );
};
