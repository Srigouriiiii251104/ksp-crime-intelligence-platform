export interface User {
  id: number;
  email: string;
  name: string;
  role: 'Investigator' | 'Supervisor';
  token: string;
}

export interface Source {
  database: string;
  type: string;
  id: number | string;
  identifier: string;
}

export interface GraphNode {
  data: {
    id: string;
    label: string;
    type: 'FIR' | 'Accused' | 'Victim' | 'Location' | 'BankAccount' | 'Evidence' | 'Transaction';
    properties?: any;
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    type: string;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  sql_ran?: string;
  cypher_ran?: string;
  graph_data?: GraphData;
  timestamp: Date;
}

export interface AuditLog {
  id: number;
  user_email: string;
  user_role: string;
  query_text: string;
  sql_ran: string | null;
  cypher_ran: string | null;
  timestamp: string;
  case_id?: string;
}

export interface ChainOfCustodyEntry {
  timestamp: string;
  officer: string;
  action: string;
  location?: string;
}

export interface EvidenceItem {
  id: string;
  case_id: string;
  description: string;
  evidence_type: 'physical' | 'digital' | 'document' | 'testimony';
  intake_timestamp: string;
  intake_officer_id: number;
  intake_officer_name: string;
  status: 'In Custody' | 'Transferred' | 'In Forensics' | 'Submitted to Court';
  chain_of_custody_log: ChainOfCustodyEntry[];
  potential_duplicate?: boolean;
  duplicate_reason?: string;
}

export interface FullCaseContext {
  case_id: string;
  fir: {
    id: number;
    fir_number: string;
    date: string;
    crime_type: string;
    description: string;
    location_name: string;
    area: string;
    assigned_investigator: string;
    assigned_investigator_id: number;
    days_open: number;
    status: 'Open' | 'Under Investigation' | 'Charge Sheet Filed' | 'Closed';
    severity: 'High' | 'Medium' | 'Low';
  };
  accused: Array<{
    id: number;
    name: string;
    age: number;
    gender: string;
    address: string;
    risk_score: number;
    risk_level: string;
  }>;
  victims: Array<{
    id: number;
    name: string;
    age: number;
    gender: string;
    address: string;
  }>;
  evidence: EvidenceItem[];
  financial_links: Array<{
    id: string;
    from_account: string;
    to_account: string;
    amount: number;
    date: string;
    owner_name: string;
  }>;
  graph_relationships: GraphData;
  audit_history: AuditLog[];
}

export interface PendencyRiskExplanation {
  feature: string;
  effect: number;
  direction: 'increase' | 'decrease';
  reason: string;
}

export interface PendencyRiskCase {
  case_id: string;
  fir_number: string;
  crime_type: string;
  area: string;
  assigned_investigator: string;
  days_since_last_update: number;
  days_open: number;
  severity: 'High' | 'Medium' | 'Low';
  evidence_count: number;
  is_evidence_incomplete: boolean;
  pendency_risk_score: number;
  pendency_risk_level: 'High Risk' | 'Moderate Risk' | 'Low Risk';
  explanations: PendencyRiskExplanation[];
}

export interface InvestigatorWorkload {
  investigator_id: number;
  investigator_name: string;
  badge_email: string;
  station: string;
  open_case_count: number;
  high_severity_case_count: number;
  workload_status: 'Overloaded' | 'Optimal' | 'Underutilized';
  suggested_reassignments?: Array<{
    case_id: string;
    fir_number: string;
    recommended_target_investigator: string;
    reason: string;
  }>;
}

export interface CrimeTypeStat {
  type: string;
  count: number;
}

export interface CrimeAreaStat {
  area: string;
  count: number;
}

export interface CrimeTrendStat {
  month: string;
  count: number;
}

export interface DashboardStats {
  crimes_by_type: CrimeTypeStat[];
  crimes_by_area: CrimeAreaStat[];
  crimes_trend: CrimeTrendStat[];
}

export interface ShapExplanation {
  feature_key: string;
  feature: string;
  value: string | number;
  effect: number;
  direction: 'increase' | 'decrease';
  reason?: string;
}

export interface AccusedWithRisk {
  id: number;
  name: string;
  age: number;
  gender: string;
  address: string;
  state: string;
  num_prior_firs: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  explanations: ShapExplanation[];
}
