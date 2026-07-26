import React, { useEffect, useState } from 'react';
import type { FullCaseContext, EvidenceItem } from '../types.js';
import { 
  Shield, Search, AlertCircle, FileText, Users, DollarSign, Network, 
  Clock, ShieldCheck, Plus, Sparkles, AlertTriangle, CheckCircle2, ScanText, ArrowRight,
  Database
} from 'lucide-react';

interface Case360Props {
  token: string;
}

const SAMPLE_CASES = ['CASE-2024-1001', 'CASE-2024-1002', 'CASE-2024-1003', 'CASE-2024-1004', 'CASE-2024-1005'];

export const Case360: React.FC<Case360Props> = ({ token }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2024-1001');
  const [searchInput, setSearchInput] = useState<string>('');
  const [caseContext, setCaseContext] = useState<FullCaseContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'people' | 'evidence' | 'financial' | 'network' | 'audit'>('overview');

  // Intake modal state
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeDesc, setIntakeDesc] = useState<string>('');
  const [intakeType, setIntakeType] = useState<'physical' | 'digital' | 'document' | 'testimony'>('digital');
  const [intakeOfficer, setIntakeOfficer] = useState<string>('Insp. Ramesh Gowda');
  const [intakeMsg, setIntakeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // OCR modal state
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);

  const fetchFullContext = async (caseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/case/${encodeURIComponent(caseId)}/full-context`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Case file not found');
      }
      const data = await response.json();
      setCaseContext(data);
    } catch (err: any) {
      setError(err.message);
      setCaseContext(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullContext(selectedCaseId);
  }, [selectedCaseId, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedCaseId(searchInput.trim());
    }
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeMsg(null);
    try {
      const response = await fetch('/api/evidence/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          case_id: selectedCaseId,
          description: intakeDesc,
          evidence_type: intakeType,
          intake_officer_name: intakeOfficer
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Evidence intake failed');

      if (resData.evidence?.potential_duplicate) {
        setIntakeMsg({
          type: 'error',
          text: `Logged with Warning: ${resData.evidence.duplicate_reason}`
        });
      } else {
        setIntakeMsg({
          type: 'success',
          text: `Evidence Item #${resData.evidence.id} successfully registered with automated chain-of-custody logging.`
        });
      }

      setIntakeDesc('');
      fetchFullContext(selectedCaseId);
    } catch (err: any) {
      setIntakeMsg({ type: 'error', text: err.message });
    }
  };

  const handleOcrSimulate = async () => {
    setOcrLoading(true);
    try {
      const response = await fetch('/api/evidence/ocr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_text: ocrText,
          file_name: 'Scanned_Seizure_Memo.pdf'
        })
      });
      const data = await response.json();
      setOcrResult(data);
    } catch (err: any) {
      alert('OCR processing error: ' + err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const confirmOcrSave = () => {
    if (!ocrResult) return;
    setIntakeDesc(ocrResult.extracted_description);
    setIntakeType('document');
    setShowOcrModal(false);
    setOcrResult(null);
    setShowIntakeModal(true);
  };

  return (
    <div className="h-full bg-background text-foreground p-6 space-y-6 flex flex-col min-h-0 transition-colors duration-200">
      
      {/* Search & Case Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Case 360° Unified Intelligence Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Canonical case resolution layer linking FIR, Accused, Victims, Evidence, Transactions & Graph relationships.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick case switch pills */}
          <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border text-xs">
            <span className="text-[10px] text-muted-foreground uppercase font-bold px-2">Quick Case:</span>
            {SAMPLE_CASES.map(cId => (
              <button
                key={cId}
                onClick={() => { setSelectedCaseId(cId); setSearchInput(cId); }}
                className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-all text-xs ${
                  selectedCaseId === cId ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cId}
              </button>
            ))}
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Case ID or FIR..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary font-mono"
            />
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Database className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Resolving Unified Case Graph & Data Layer...</p>
        </div>
      ) : error || !caseContext ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
            <p className="font-semibold text-destructive">Case Search Error</p>
            <p className="text-xs mt-1 text-muted-foreground">{error || 'No context found for specified Case ID.'}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          
          {/* Case Master Header Banner */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-extrabold text-primary tracking-wide">{caseContext.case_id}</span>
                <span className="text-xs font-semibold text-muted-foreground font-mono">({caseContext.fir.fir_number})</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  caseContext.fir.severity === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                }`}>
                  {caseContext.fir.severity} Severity
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">
                  {caseContext.fir.status}
                </span>
              </div>

              <h2 className="text-sm font-bold text-foreground">{caseContext.fir.crime_type} • {caseContext.fir.area}</h2>
              <p className="text-xs text-muted-foreground line-clamp-2 max-w-3xl">{caseContext.fir.description}</p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-5 shrink-0 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Assigned Officer</span>
                <span className="font-bold text-foreground">{caseContext.fir.assigned_investigator}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Days Pending</span>
                <span className="font-bold font-mono text-amber-500">{caseContext.fir.days_open} Days</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Evidence Items</span>
                <span className="font-bold font-mono text-primary">{caseContext.evidence.length} Logged</span>
              </div>
            </div>
          </div>

          {/* 360 Tabs Bar */}
          <div className="flex items-center gap-1 bg-card p-1.5 rounded-2xl border border-border shadow-sm overflow-x-auto text-xs shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              FIR Overview
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'people' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              People ({caseContext.accused.length + caseContext.victims.length})
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'evidence' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Evidence & Custody ({caseContext.evidence.length})
            </button>

            <button
              onClick={() => setActiveTab('financial')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'financial' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Financial Trail ({caseContext.financial_links.length})
            </button>

            <button
              onClick={() => setActiveTab('network')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'network' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Network className="w-4 h-4" />
              Graph Network
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'audit' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              Audit Log ({caseContext.audit_history.length})
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 bg-card border border-border rounded-2xl p-6 shadow-sm overflow-y-auto min-h-0 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-primary">FIR Details</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Canonical Case ID:</span>
                        <span className="font-mono font-bold text-foreground">{caseContext.case_id}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Official FIR Number:</span>
                        <span className="font-mono font-bold text-foreground">{caseContext.fir.fir_number}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Incident Date:</span>
                        <span className="font-mono text-foreground">{new Date(caseContext.fir.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Jurisdiction Station:</span>
                        <span className="font-semibold text-foreground">{caseContext.fir.location_name} ({caseContext.fir.area})</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-primary">Investigation Status</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Lead Officer:</span>
                        <span className="font-semibold text-foreground">{caseContext.fir.assigned_investigator}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Current Status:</span>
                        <span className="font-bold text-primary">{caseContext.fir.status}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Offense Severity:</span>
                        <span className="font-bold text-red-500">{caseContext.fir.severity}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Days Under Investigation:</span>
                        <span className="font-mono font-bold text-amber-500">{caseContext.fir.days_open} Days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-primary mb-2">Narrative Description</h3>
                  <p className="text-xs text-foreground leading-relaxed font-normal">{caseContext.fir.description}</p>
                </div>
              </div>
            )}

            {/* PEOPLE TAB */}
            {activeTab === 'people' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Accused / Suspect Entities ({caseContext.accused.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseContext.accused.map(a => (
                      <div key={a.id} className="bg-muted/30 border border-border rounded-2xl p-4 flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{a.name}</h4>
                          <p className="text-xs text-muted-foreground">{a.age} Yrs • {a.gender}</p>
                          <p className="text-xs text-muted-foreground mt-1">{a.address}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-500">
                          {a.risk_level} Recidivism Risk ({(a.risk_score * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Victims / Complainants ({caseContext.victims.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseContext.victims.map(v => (
                      <div key={v.id} className="bg-muted/30 border border-border rounded-2xl p-4">
                        <h4 className="text-sm font-bold text-foreground">{v.name}</h4>
                        <p className="text-xs text-muted-foreground">{v.age} Yrs • {v.gender}</p>
                        <p className="text-xs text-muted-foreground mt-1">{v.address}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EVIDENCE TAB */}
            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Automated Evidence Custody Pipeline
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Immutable chain-of-custody tracking with duplicate cross-reference validation.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowOcrModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-all flex items-center gap-1.5"
                    >
                      <ScanText className="w-3.5 h-3.5 text-primary" />
                      Scan FIR Document (OCR Review)
                    </button>

                    <button
                      onClick={() => setShowIntakeModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Intake New Evidence
                    </button>
                  </div>
                </div>

                {caseContext.evidence.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No evidence items currently logged for this case file.</p>
                ) : (
                  <div className="space-y-4">
                    {caseContext.evidence.map(item => (
                      <div key={item.id} className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-primary">{item.id}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-muted border border-border text-foreground">
                              {item.evidence_type}
                            </span>
                            <span className="text-xs font-semibold text-foreground">{item.description}</span>
                          </div>

                          {item.potential_duplicate ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Duplicate Flagged
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Validated Unique
                            </span>
                          )}
                        </div>

                        {item.duplicate_reason && (
                          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-600 dark:text-amber-300">
                            <strong>Duplicate Warning:</strong> {item.duplicate_reason}
                          </div>
                        )}

                        {/* Chain of Custody Timeline */}
                        <div className="pt-2 border-t border-border/60">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Immutable Chain of Custody History</span>
                          <div className="space-y-2 pl-3 border-l-2 border-primary/40">
                            {item.chain_of_custody_log.map((coc, cocIdx) => (
                              <div key={cocIdx} className="text-xs space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-muted-foreground">{new Date(coc.timestamp).toLocaleString()}</span>
                                  <span className="font-bold text-foreground">{coc.officer}</span>
                                </div>
                                <p className="text-muted-foreground">{coc.action} • <span className="font-medium text-foreground">{coc.location || 'Vault'}</span></p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Financial Transactions & Bank Accounts
                </h3>
                {caseContext.financial_links.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No linked financial transactions recorded for this case.</p>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                    {caseContext.financial_links.map(tx => (
                      <div key={tx.id} className="p-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{tx.owner_name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            From: {tx.from_account} → To: {tx.to_account}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-emerald-500 text-sm">₹{tx.amount.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{new Date(tx.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NETWORK TAB */}
            {activeTab === 'network' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Network className="w-4 h-4" /> Neo4j Graph Relationships
                </h3>
                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Graph Nodes</span>
                      <ul className="space-y-1 text-xs">
                        {caseContext.graph_relationships.nodes.map(n => (
                          <li key={n.data.id} className="p-2 bg-card border border-border rounded-xl flex items-center justify-between">
                            <span className="font-bold text-foreground">{n.data.label}</span>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                              {n.data.type}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Graph Relationships</span>
                      <ul className="space-y-1 text-xs">
                        {caseContext.graph_relationships.edges.map(e => (
                          <li key={e.data.id} className="p-2 bg-card border border-border rounded-xl flex items-center justify-between font-mono text-[11px]">
                            <span>{e.data.source} → {e.data.target}</span>
                            <span className="font-bold text-amber-500">{e.data.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT TAB */}
            {activeTab === 'audit' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Immutable Case Audit Trail
                </h3>
                <div className="space-y-3">
                  {caseContext.audit_history.map(a => (
                    <div key={a.id} className="p-3 bg-muted/30 border border-border rounded-xl text-xs space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span className="font-bold text-foreground">{a.user_email} ({a.user_role})</span>
                        <span className="font-mono">{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="font-medium text-foreground">{a.query_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Intake Evidence Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Log Evidence Intake ({selectedCaseId})
            </h3>

            {intakeMsg && (
              <div className={`p-3 rounded-xl text-xs ${intakeMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                {intakeMsg.text}
              </div>
            )}

            <form onSubmit={handleIntakeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Evidence Category</label>
                <select
                  value={intakeType}
                  onChange={(e: any) => setIntakeType(e.target.value)}
                  className="w-full p-2.5 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="physical">Physical Evidence</option>
                  <option value="digital">Digital Device / CCTV / Hash</option>
                  <option value="document">Documentary Records / Deed</option>
                  <option value="testimony">Deposition / Statement</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Detailed Evidence Description</label>
                <textarea
                  rows={3}
                  value={intakeDesc}
                  onChange={(e) => setIntakeDesc(e.target.value)}
                  placeholder="Enter detailed description of item seized, serial numbers, hash codes..."
                  className="w-full p-2.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Intake Officer Name</label>
                <input
                  type="text"
                  value={intakeOfficer}
                  onChange={(e) => setIntakeOfficer(e.target.value)}
                  className="w-full p-2.5 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowIntakeModal(false); setIntakeMsg(null); }}
                  className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm transition-all"
                >
                  Submit Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OCR Document Review Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ScanText className="w-5 h-5 text-primary" />
              OCR Document Auto-Extraction Review
            </h3>
            <p className="text-xs text-muted-foreground">
              Investigator confirmation required before extracted legal text is saved.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">FIR Document Scan Sample Text</label>
                <textarea
                  rows={3}
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  placeholder="Paste or simulate scanned document text..."
                  className="w-full p-2.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={handleOcrSimulate}
                disabled={ocrLoading}
                className="w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold border border-border flex items-center justify-center gap-2"
              >
                {ocrLoading ? 'Extracting Text...' : 'Run OCR Auto-Extraction'}
              </button>

              {ocrResult && (
                <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Confidence Score:</span>
                    <span className="text-emerald-500">{(ocrResult.ocr_confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p><strong>Extracted Case:</strong> {ocrResult.extracted_case_id}</p>
                  <p><strong>Extracted Text:</strong> {ocrResult.extracted_description}</p>

                  <button
                    type="button"
                    onClick={confirmOcrSave}
                    className="w-full py-2 mt-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Confirm & Send to Intake Review <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowOcrModal(false)}
                  className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
