import React, { useEffect, useState } from 'react';
import type { AuditLog as AuditLogType } from '../types.js';
import { ShieldCheck, Search, Database, FileText } from 'lucide-react';

interface AuditLogProps {
  token: string;
}

export const AuditLog: React.FC<AuditLogProps> = ({ token }) => {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/audit-logs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to retrieve audit log repository');
        const data = await response.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter(log => 
    log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.query_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-background">
        <div className="flex flex-col items-center gap-3">
          <Database className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Decrypting audit repository...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive p-6 bg-background">
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center max-w-sm">
          <ShieldCheck className="w-10 h-10 text-destructive mx-auto mb-2" />
          <p className="font-semibold text-destructive">Security Clearance Denied</p>
          <p className="text-xs mt-1 text-muted-foreground">{error || 'Supervisor credentials missing.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-foreground p-6 flex flex-col min-h-0 space-y-6 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Supervisor Query Audit Trail
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Immutable audit logs recording all natural-language query executions under IT ACT SEC-66.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by investigator or query text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all text-xs"
          />
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Logs Table */}
        <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col min-h-0 shadow-sm">
          <div className="overflow-x-auto flex-1 min-h-0 scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/60 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider sticky top-0 bg-card">
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Officer Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Natural Language Query</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs text-foreground">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No audit records found matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSelected = selectedLog?.id === log.id;
                    return (
                      <tr 
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`hover:bg-muted/40 transition-colors cursor-pointer ${isSelected ? 'bg-muted/30 font-semibold' : ''}`}
                      >
                        <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground">#{log.id}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(log.timestamp)}</td>
                        <td className="py-3 px-4 font-medium text-foreground">{log.user_email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                            {log.user_role}
                          </span>
                        </td>
                        <td className="py-3 px-4 truncate max-w-[280px]" title={log.query_text}>
                          {log.query_text}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Log Detail Inspector */}
        <div className="w-full lg:w-96 bg-card border border-border rounded-2xl p-5 flex flex-col min-h-0 shadow-sm shrink-0">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-wide text-foreground">Query Execution Inspector</h2>
          </div>

          {!selectedLog ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Database className="w-8 h-8 stroke-[1.5] mb-2 text-primary opacity-60" />
              <p className="text-xs font-semibold text-foreground">Select an Audit Entry</p>
              <p className="text-[11px] text-muted-foreground mt-1">Click any record on the left table to inspect full generated SQL & Cypher statements.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar pr-1 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Audit Record ID</span>
                <span className="font-mono text-sm font-bold text-foreground">#{selectedLog.id}</span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Timestamp</span>
                <span className="font-mono text-xs text-foreground">{formatDate(selectedLog.timestamp)}</span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Officer / User</span>
                <span className="font-semibold text-foreground">{selectedLog.user_email} ({selectedLog.user_role})</span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Natural Language Input</span>
                <div className="p-2.5 bg-muted rounded-xl border border-border text-foreground font-medium text-xs">
                  {selectedLog.query_text}
                </div>
              </div>

              {selectedLog.sql_ran && (
                <div>
                  <span className="text-[10px] font-semibold text-primary uppercase block mb-1">Executed PostgreSQL Statement</span>
                  <pre className="p-2.5 bg-muted rounded-xl border border-border text-foreground font-mono text-[10px] whitespace-pre-wrap overflow-x-auto">
                    {selectedLog.sql_ran}
                  </pre>
                </div>
              )}

              {selectedLog.cypher_ran && (
                <div>
                  <span className="text-[10px] font-semibold text-primary uppercase block mb-1">Executed Neo4j Cypher Statement</span>
                  <pre className="p-2.5 bg-muted rounded-xl border border-border text-foreground font-mono text-[10px] whitespace-pre-wrap overflow-x-auto">
                    {selectedLog.cypher_ran}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
