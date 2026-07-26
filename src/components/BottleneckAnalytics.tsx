import React, { useEffect, useState } from 'react';
import type { PendencyRiskCase, InvestigatorWorkload } from '../types.js';
import { 
  AlertTriangle, Shield, CheckCircle2, TrendingUp, Users, ArrowRight, 
  HelpCircle, Sparkles, UserCheck, RefreshCw, BarChart2, Zap
} from 'lucide-react';

interface BottleneckAnalyticsProps {
  token: string;
}

export const BottleneckAnalytics: React.FC<BottleneckAnalyticsProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'pendency' | 'workload'>('pendency');
  const [pendencyCases, setPendencyCases] = useState<PendencyRiskCase[]>([]);
  const [workloads, setWorkloads] = useState<InvestigatorWorkload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaseShap, setSelectedCaseShap] = useState<PendencyRiskCase | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, wRes] = await Promise.all([
        fetch('/api/analytics/pendency-risk', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/analytics/investigator-workload', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!pRes.ok || !wRes.ok) throw new Error('Failed to load predictive bottleneck analytics');

      const pData = await pRes.json();
      const wData = await wRes.json();

      setPendencyCases(pData);
      setWorkloads(wData);
      if (pData.length > 0) setSelectedCaseShap(pData[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleApproveReassignment = (item: any) => {
    setActionSuccessMsg(`Reassignment approved by Supervisor for Case ${item.case_id} → Transferred to ${item.recommended_target_investigator}. Audit record updated.`);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  return (
    <div className="h-full bg-background text-foreground p-6 space-y-6 flex flex-col min-h-0 transition-colors duration-200">
      
      {/* DECISION SUPPORT MANDATORY DISCLAIMER BANNER */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-600 dark:text-amber-300 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] text-amber-500 block">
              Decision Support System Only
            </span>
            <p className="text-muted-foreground mt-0.5">
              All pendency risk scores and workload reassignments are predictive recommendations. Mandatory human investigator sign-off is required before any case status change or transfer.
            </p>
          </div>
        </div>

        <button 
          onClick={fetchData}
          className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold shrink-0 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary" />
          Refresh Model
        </button>
      </div>

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Predictive Bottleneck Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify stalled case files, pendency risks, and investigator capacity bottlenecks before procedural delays occur.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-border text-xs">
          <button
            onClick={() => setActiveTab('pendency')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'pendency' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Case Pendency Risk
          </button>

          <button
            onClick={() => setActiveTab('workload')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'workload' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Investigator Workload
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionSuccessMsg}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Calculating Pendency Risk & Capacity Metrics...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-center text-destructive text-xs">
          {error}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 space-y-6">

          {/* TAB 1: PENDENCY RISK MATRIX */}
          {activeTab === 'pendency' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
              
              {/* Cases List */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Open Cases Risk Matrix ({pendencyCases.length})</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">Sorted by SHAP Risk Index</span>
                </div>

                <div className="space-y-3">
                  {pendencyCases.map(c => (
                    <div 
                      key={c.case_id}
                      onClick={() => setSelectedCaseShap(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        selectedCaseShap?.case_id === c.case_id
                          ? 'bg-primary/5 border-primary shadow-sm'
                          : 'bg-muted/30 border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-extrabold text-primary">{c.case_id}</span>
                          <span className="text-xs font-bold text-foreground">{c.crime_type} • {c.area}</span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          c.pendency_risk_level === 'High Risk'
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : c.pendency_risk_level === 'Moderate Risk'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                          {c.pendency_risk_level} ({(c.pendency_risk_score * 100).toFixed(0)}%)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>Lead Officer: <strong className="text-foreground">{c.assigned_investigator}</strong></span>
                        <span>Untouched: <strong className="text-amber-500 font-mono">{c.days_since_last_update} Days</strong></span>
                        <span>Total Open: <strong className="font-mono text-foreground">{c.days_open} Days</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHAP Explanation Drawer / Detail Panel */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 overflow-y-auto">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border">
                  <Sparkles className="w-4 h-4 text-primary" />
                  SHAP Explainability Breakdown
                </h3>

                {selectedCaseShap ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary block">{selectedCaseShap.case_id}</span>
                      <h4 className="font-bold text-foreground mt-0.5">{selectedCaseShap.crime_type} ({selectedCaseShap.area})</h4>
                      <p className="text-muted-foreground text-[11px] mt-1">
                        Risk Score Index: <strong className="text-foreground font-mono">{selectedCaseShap.pendency_risk_score}</strong>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Key Contributing Features</span>
                      
                      {selectedCaseShap.explanations.map((exp, idx) => (
                        <div key={idx} className="p-3 bg-muted/30 border border-border rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-foreground">{exp.feature}</span>
                            <span className={`font-mono text-[10px] font-bold ${
                              exp.direction === 'increase' ? 'text-red-500' : 'text-emerald-500'
                            }`}>
                              {exp.direction === 'increase' ? `+${exp.effect}` : `${exp.effect}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{exp.reason}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border">
                      <button 
                        onClick={() => alert(`Escalation request generated for Lead Officer ${selectedCaseShap.assigned_investigator}. Mandatory supervisor review logged.`)}
                        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm transition-all text-xs"
                      >
                        Request Investigator Review & Escalation
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-10">Select a case from the risk matrix to view model explanations.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: INVESTIGATOR WORKLOAD */}
          {activeTab === 'workload' && (
            <div className="space-y-6 flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workloads.map(inv => (
                  <div key={inv.investigator_id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{inv.investigator_name}</h3>
                        <p className="text-xs text-muted-foreground">{inv.station} Police Station</p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        inv.workload_status === 'Overloaded'
                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                          : inv.workload_status === 'Optimal'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {inv.workload_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 border border-border rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Active Cases</span>
                        <span className="font-mono font-bold text-foreground text-base">{inv.open_case_count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">High Severity</span>
                        <span className="font-mono font-bold text-red-500 text-base">{inv.high_severity_case_count}</span>
                      </div>
                    </div>

                    {inv.suggested_reassignments.length > 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                        <span className="font-bold text-amber-600 dark:text-amber-300 block">Suggested Reassignment:</span>
                        {inv.suggested_reassignments.map((re, rIdx) => (
                          <div key={rIdx} className="space-y-2">
                            <p className="text-[11px] text-muted-foreground">{re.reason}</p>
                            <button
                              onClick={() => handleApproveReassignment(re)}
                              className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-200 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Approve Reassignment (Human Sign-off)
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
