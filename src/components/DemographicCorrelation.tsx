import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, AlertTriangle, Activity, ShieldAlert } from 'lucide-react';

interface DemographicCorrelationProps {
  token: string;
}

interface CorrelationData {
  literacy_rate: number;
  unemployment_rate: number;
  population_density: number;
}

export const DemographicCorrelation: React.FC<DemographicCorrelationProps> = ({ token }) => {
  const [correlations, setCorrelations] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCorrelations = async () => {
      try {
        const response = await fetch('/api/demographic-correlation', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to load demographic correlations');
        const result = await response.json();
        setCorrelations(result.correlations);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCorrelations();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-center h-[280px] shadow-sm">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Activity className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">Loading demographic correlations...</span>
        </div>
      </div>
    );
  }

  if (error || !correlations) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-center h-[280px] text-destructive shadow-sm">
        <div className="text-center">
          <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-xs font-semibold">Could not load demographic statistics</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { metric: 'Literacy Rate', value: correlations.literacy_rate, color: '#10b981' },
    { metric: 'Unemployment Rate', value: correlations.unemployment_rate, color: '#ef4444' },
    { metric: 'Population Density', value: correlations.population_density, color: '#f59e0b' }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Socio-Demographic Correlation Index (Pearson r Coefficient)
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Statistical correlation between socio-economic indicators and local crime frequency across Bengaluru.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {chartData.map((item, idx) => (
          <div key={idx} className="bg-muted/40 border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-muted-foreground">{item.metric}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-2xl font-bold font-mono ${item.value > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {item.value > 0 ? `+${item.value}` : item.value}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Pearson r</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
              {item.value > 0.5 
                ? 'Strong positive correlation with incident frequency' 
                : item.value < -0.3 
                  ? 'Moderate inverse correlation with incident frequency'
                  : 'Slight correlation observed'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
