import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, ChevronDown, ChevronUp, AlertCircle, Sparkles, TrendingUp, TrendingDown, User } from 'lucide-react';
import type { AccusedWithRisk } from '../types.js';

interface AccusedListProps {
  token: string;
}

export const AccusedList: React.FC<AccusedListProps> = ({ token }) => {
  const [accused, setAccused] = useState<AccusedWithRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccusedId, setExpandedAccusedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAccused = async () => {
      try {
        const response = await fetch('/api/accused', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to retrieve offender risk scores');
        const data = await response.json();
        setAccused(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAccused();
  }, [token]);

  const toggleExpand = (id: number) => {
    setExpandedAccusedId(prev => (prev === id ? null : id));
  };

  const filteredAccused = accused.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadgeColor = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'High':
        return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300';
      case 'Medium':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-300';
      case 'Low':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5 justify-center">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Evaluating offender recidivism profiles & SHAP explanations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive p-6 bg-background">
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center max-w-md">
          <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-2" />
          <p className="font-semibold text-destructive">Error Loading Risk Score Module</p>
          <p className="text-xs mt-1 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-foreground p-6 space-y-6 flex flex-col min-h-0 transition-colors duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-foreground">Accused Registry & Behavioral Risk Profiling</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Offender risk profiling computed via XGBoost classification and explained with local SHAP feature values.
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search offender by name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all text-xs"
          />
        </div>
      </div>

      {/* Grid of Accused Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {filteredAccused.map((acc) => {
          const isExpanded = expandedAccusedId === acc.id;
          return (
            <div 
              key={acc.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight">{acc.name}</h3>
                      <p className="text-[10px] text-muted-foreground">Age {acc.age} • {acc.gender}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(acc.risk_level)}`}>
                    {acc.risk_level} Risk
                  </span>
                </div>

                <div className="space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Jurisdiction / Address:</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]" title={acc.address}>{acc.address}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Prior FIR Registrations:</span>
                    <span className="font-bold text-foreground font-mono">{acc.num_prior_firs} FIRs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Recidivism Risk Score:</span>
                    <span className="font-bold font-mono text-primary">{(acc.risk_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Expand SHAP Explanations Button */}
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => toggleExpand(acc.id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-[11px] font-semibold transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    SHAP Model Feature Explanation
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 p-3 bg-muted/30 border border-border rounded-xl space-y-2 text-[10px]">
                    {acc.explanations.map((exp, expIdx) => (
                      <div key={expIdx} className="space-y-1 bg-card p-2 rounded-lg border border-border">
                        <div className="flex items-center justify-between font-semibold text-foreground">
                          <span>{exp.feature}</span>
                          <span className={exp.direction === 'increase' ? 'text-red-500' : 'text-emerald-500'}>
                            {exp.direction === 'increase' ? '+' : '-'}{(Math.abs(exp.effect) * 100).toFixed(0)}%
                          </span>
                        </div>
                        {exp.reason && <p className="text-muted-foreground">{exp.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}
        </div>
      </div>

    </div>
  );
};
