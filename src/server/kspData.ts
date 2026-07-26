import { AuditLog, GraphData, GraphNode, GraphEdge, Source, AccusedWithRisk, EvidenceItem, FullCaseContext, PendencyRiskCase, InvestigatorWorkload } from '../types.js';

export interface LocationData {
  id: number;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  literacy_rate: number;
  unemployment_rate: number;
  population_density: number;
}

export interface FIRData {
  id: number;
  case_id: string;
  fir_number: string;
  date: string; // ISO string
  crime_type: string;
  description: string;
  location_id: number;
  accused_ids: number[];
  victim_ids: number[];
  assigned_investigator_id: number;
  assigned_investigator: string;
  status: 'Open' | 'Under Investigation' | 'Charge Sheet Filed' | 'Closed';
  severity: 'High' | 'Medium' | 'Low';
  last_updated: string;
}

export interface AccusedData {
  id: number;
  name: string;
  age: number;
  gender: string;
  address: string;
  state: string;
  location_id: number;
  associates: number[];
}

export interface VictimData {
  id: number;
  name: string;
  age: number;
  gender: string;
  address: string;
  location_id: number;
}

export interface BankAccountData {
  id: string;
  account_number: string;
  bank_name: string;
  owner_accused_id: number;
}

export interface TransactionData {
  id: string;
  case_id: string;
  from_account: string;
  to_account: string;
  amount: number;
  date: string;
}

export interface InvestigatorData {
  id: number;
  name: string;
  badge_email: string;
  station: string;
}

// Global in-memory dataset
const AREAS = [
  { name: "Whitefield Police Station", area: "Whitefield", lat: 12.9698, lon: 77.7499, lit: 88.5, unemp: 4.2, pop: 12500 },
  { name: "Indiranagar Police Station", area: "Indiranagar", lat: 12.9719, lon: 77.6412, lit: 92.1, unemp: 3.8, pop: 16800 },
  { name: "Koramangala Police Station", area: "Koramangala", lat: 12.9352, lon: 77.6244, lit: 90.4, unemp: 4.0, pop: 18200 },
  { name: "Jayanagar Police Station", area: "Jayanagar", lat: 12.9308, lon: 77.5830, lit: 91.0, unemp: 3.5, pop: 14500 },
  { name: "HSR Layout Police Station", area: "HSR Layout", lat: 12.9105, lon: 77.6450, lit: 89.2, unemp: 4.1, pop: 13900 },
  { name: "Electronic City PS", area: "Electronic City", lat: 12.8399, lon: 77.6770, lit: 86.8, unemp: 5.0, pop: 11200 },
  { name: "Majestic Police Station", area: "Majestic", lat: 12.9767, lon: 77.5729, lit: 82.5, unemp: 7.5, pop: 22000 },
  { name: "Malleshwaram Police Station", area: "Malleshwaram", lat: 12.9984, lon: 77.5714, lit: 93.5, unemp: 3.2, pop: 15400 },
  { name: "Hebbal Police Station", area: "Hebbal", lat: 13.0359, lon: 77.5970, lit: 87.1, unemp: 4.8, pop: 13100 },
  { name: "Yelahanka Police Station", area: "Yelahanka", lat: 13.1007, lon: 77.5963, lit: 85.0, unemp: 5.2, pop: 9800 },
  { name: "Banashankari Police Station", area: "Banashankari", lat: 12.9255, lon: 77.5468, lit: 88.0, unemp: 4.5, pop: 16100 },
  { name: "Rajajinagar Police Station", area: "Rajajinagar", lat: 12.9897, lon: 77.5548, lit: 90.1, unemp: 3.9, pop: 17300 },
  { name: "Sadashivanagar PS", area: "Sadashivanagar", lat: 13.0068, lon: 77.5804, lit: 94.2, unemp: 2.8, pop: 10500 },
  { name: "Basavanagudi Police Station", area: "Basavanagudi", lat: 12.9406, lon: 77.5738, lit: 91.8, unemp: 3.6, pop: 15900 },
  { name: "Ulsoor Police Station", area: "Ulsoor", lat: 12.9817, lon: 77.6286, lit: 89.5, unemp: 4.4, pop: 14800 },
  { name: "BTM Layout Police Station", area: "BTM Layout", lat: 12.9166, lon: 77.6101, lit: 88.9, unemp: 4.3, pop: 17100 },
  { name: "Bellandur Police Station", area: "Bellandur", lat: 12.9304, lon: 77.6784, lit: 87.5, unemp: 4.6, pop: 13500 },
  { name: "Marathahalli Police Station", area: "Marathahalli", lat: 12.9569, lon: 77.7011, lit: 86.2, unemp: 4.9, pop: 15800 },
  { name: "Domlur Police Station", area: "Domlur", lat: 12.9610, lon: 77.6387, lit: 90.0, unemp: 3.7, pop: 14200 },
  { name: "Frazer Town Police Station", area: "Frazer Town", lat: 12.9972, lon: 77.6144, lit: 91.2, unemp: 3.9, pop: 16500 }
];

const CRIME_TYPES = ["Theft", "Assault", "Cybercrime", "Fraud", "Murder", "Kidnapping", "Drug Trafficking"];

export const INVESTIGATORS: InvestigatorData[] = [
  { id: 101, name: "Insp. Ramesh Gowda", badge_email: "ramesh.gowda@ksp.gov.in", station: "Indiranagar" },
  { id: 102, name: "Insp. Swati Rao", badge_email: "swati.rao@ksp.gov.in", station: "Koramangala" },
  { id: 103, name: "Insp. Vijay Kumar", badge_email: "vijay.kumar@ksp.gov.in", station: "Whitefield" },
  { id: 104, name: "Insp. Anjali Nair", badge_email: "anjali.nair@ksp.gov.in", station: "HSR Layout" },
  { id: 105, name: "Insp. Sunil Patil", badge_email: "sunil.patil@ksp.gov.in", station: "Electronic City" },
];

const FIRST_MALE = ["Rajesh", "Amit", "Sanjay", "Vikram", "Rohan", "Suresh", "Ramesh", "Deepak", "Anil", "Sunil", "Vijay", "Karan", "Arjun", "Rahul", "Manoj", "Ajay", "Pradeep", "Harish", "Dinesh", "Kiran"];
const FIRST_FEMALE = ["Sunita", "Priya", "Anjali", "Kiran", "Meena", "Geeta", "Seema", "Ritu", "Neha", "Pooja", "Swati", "Aarti", "Divya", "Kavita", "Anita", "Rekha", "Sujata", "Latha", "Shalini", "Rashmi"];
const LAST_NAMES = ["Kumar", "Sharma", "Singh", "Patel", "Nair", "Rao", "Mehta", "Gupta", "Joshi", "Reddy", "Gowda", "Shetty", "Pillai", "Bose", "Sen", "Das", "Roy", "Mishra", "Verma", "Yadav"];

const DESCRIPTIONS: Record<string, string[]> = {
  "Theft": [
    "Theft of two-wheeler vehicle from commercial parking area.",
    "House break-in during late night hours. Gold ornaments stolen.",
    "Chain snatching by two bike riders on main road.",
    "Shoplifting of electronic items from retail mall.",
    "Pickpocketing in crowded bus route."
  ],
  "Assault": [
    "Physical altercation between two groups over parking space.",
    "Assault on delivery rider following argument.",
    "Brawl reported outside nightlife establishment.",
    "Domestic violence escalation requiring police intervention.",
    "Road rage assault involving motor bike riders."
  ],
  "Cybercrime": [
    "Phishing fraud duping victim into sharing banking OTP.",
    "Identity theft creating fake profile for extortion.",
    "Ransomware attack demanding cryptocurrency.",
    "Online shopping e-commerce payment scam.",
    "Unauthorized email account access and wire fraud."
  ],
  "Fraud": [
    "Ponzi scheme promising 50% returns in three months.",
    "ATM card skimming and unauthorized cash withdrawal.",
    "Real estate land plot sold using forged land records.",
    "Job visa scam charging advance processing fee.",
    "Impersonation of electricity official collecting fake bills."
  ],
  "Murder": [
    "Fatal shooting inside commercial property.",
    "Body discovered near lake with strangulation marks.",
    "Fatal stabbing during gang clash.",
    "Murder for financial gain in residential house.",
    "Fatal poisoning suspected by close associate."
  ],
  "Kidnapping": [
    "Abduction of minor for ransom via untraceable SIM.",
    "Kidnapping of contractor over business tender dispute.",
    "Victim forced into vehicle at gunpoint outside mall.",
    "Abduction reported near educational institution.",
    "Hostage situation during attempted robbery."
  ],
  "Drug Trafficking": [
    "Seizure of MDMA and Ganja near college campus.",
    "Interception of drug courier package.",
    "Raid on private villa party seizing synthetic narcotics.",
    "Smuggling racket operating via interstate bus transit.",
    "Distribution network supplying illegal psychotropics."
  ]
};

// Seed storage
export const locations: LocationData[] = [];
export const accused: AccusedData[] = [];
export const victims: VictimData[] = [];
export const firs: FIRData[] = [];
export const bankAccounts: BankAccountData[] = [];
export const transactions: TransactionData[] = [];
export const auditLogs: AuditLog[] = [];
export const evidences: EvidenceItem[] = [];

// Seed initialization function
function initializeDatabase() {
  if (locations.length > 0) return; // already initialized

  // 1. Locations
  AREAS.forEach((loc, idx) => {
    locations.push({
      id: idx + 1,
      name: loc.name,
      area: loc.area,
      latitude: loc.lat,
      longitude: loc.lon,
      literacy_rate: loc.lit,
      unemployment_rate: loc.unemp,
      population_density: loc.pop
    });
  });

  // 2. Accused (150)
  for (let i = 1; i <= 150; i++) {
    let name = '';
    let gender = 'Male';
    let age = 20 + (i % 45);

    if (i === 1) {
      name = 'Geeta Reddy';
      gender = 'Female';
      age = 34;
    } else if (i === 2) {
      name = 'Amit Sharma';
      gender = 'Male';
      age = 38;
    } else if (i === 3) {
      name = 'Rajesh Gowda';
      gender = 'Male';
      age = 42;
    } else if (i === 4) {
      name = 'Kiran Patel';
      gender = 'Male';
      age = 29;
    } else if (i === 5) {
      name = 'Suresh Kumar';
      gender = 'Male';
      age = 36;
    } else {
      const isMale = Math.random() > 0.3;
      gender = isMale ? 'Male' : 'Female';
      const fnList = isMale ? FIRST_MALE : FIRST_FEMALE;
      name = `${fnList[i % fnList.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`;
    }

    const locId = (i % locations.length) + 1;
    accused.push({
      id: i,
      name: name,
      age: age,
      gender: gender,
      address: `House No. ${i * 7}, ${locations[locId - 1].area}, Bengaluru`,
      state: 'Karnataka',
      location_id: locId,
      associates: []
    });
  }

  // Generate associates
  // Seed explicit associate connections for key figures
  accused[0].associates = [2, 3, 4, 5]; // Geeta Reddy associates
  accused[1].associates = [1, 3, 6];    // Amit Sharma associates
  accused[2].associates = [1, 2, 7];    // Rajesh Gowda associates
  accused[3].associates = [1, 5];       // Kiran Patel associates
  accused[4].associates = [1, 4];       // Suresh Kumar associates

  for (let i = 5; i < accused.length; i++) {
    const associateCount = 1 + (i % 3);
    for (let k = 1; k <= associateCount; k++) {
      const assocId = ((i + k * 13) % accused.length) + 1;
      if (assocId !== accused[i].id && !accused[i].associates.includes(assocId)) {
        accused[i].associates.push(assocId);
      }
    }
  }

  // 3. Victims (150)
  for (let i = 1; i <= 150; i++) {
    const isMale = Math.random() > 0.4;
    const fnList = isMale ? FIRST_MALE : FIRST_FEMALE;
    const name = `${fnList[(i * 2) % fnList.length]} ${LAST_NAMES[(i * 5) % LAST_NAMES.length]}`;
    const locId = (i % locations.length) + 1;
    victims.push({
      id: i,
      name: name,
      age: 18 + (i % 55),
      gender: isMale ? 'Male' : 'Female',
      address: `Flat ${i * 3}, ${locations[locId - 1].area}, Bengaluru`,
      location_id: locId
    });
  }

  // 4. FIRs (200) with case_id
  const now = new Date();
  for (let i = 1; i <= 200; i++) {
    const cType = CRIME_TYPES[i % CRIME_TYPES.length];
    const descList = DESCRIPTIONS[cType];
    const desc = descList[i % descList.length];
    const locId = (i % locations.length) + 1;
    const daysAgo = Math.floor(Math.random() * 200);
    const firDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const daysSinceLastUpdate = (i % 7) === 0 ? 45 : (i % 5) === 0 ? 32 : (i % 3);
    const lastUpdatedDate = new Date(now.getTime() - daysSinceLastUpdate * 24 * 60 * 60 * 1000);

    const accId1 = ((i * 3) % accused.length) + 1;
    const accId2 = ((i * 3 + 1) % accused.length) + 1;
    const accIds = [accId1];
    if (i % 3 === 0) accIds.push(accId2);

    const vicId = ((i * 2) % victims.length) + 1;

    const case_id = `CASE-2024-${1000 + i}`;
    const investigator = INVESTIGATORS[i % INVESTIGATORS.length];

    const severities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
    const statuses: ('Open' | 'Under Investigation' | 'Charge Sheet Filed' | 'Closed')[] = [
      'Under Investigation', 'Open', 'Under Investigation', 'Closed'
    ];

    firs.push({
      id: i,
      case_id: case_id,
      fir_number: `FIR-2024-${1000 + i}`,
      date: firDate.toISOString(),
      crime_type: cType,
      description: desc,
      location_id: locId,
      accused_ids: accIds,
      victim_ids: [vicId],
      assigned_investigator_id: investigator.id,
      assigned_investigator: investigator.name,
      status: statuses[i % statuses.length],
      severity: (cType === 'Murder' || cType === 'Kidnapping' || cType === 'Cybercrime') ? 'High' : severities[i % severities.length],
      last_updated: lastUpdatedDate.toISOString()
    });
  }

  // 5. Bank Accounts & Transactions linked to case_id
  for (let i = 1; i <= 30; i++) {
    const accOwnerId = (i % accused.length) + 1;
    bankAccounts.push({
      id: `acc_${i}`,
      account_number: `SB-KSP-${80000 + i}`,
      bank_name: i % 2 === 0 ? 'State Bank of India' : 'Canara Bank',
      owner_accused_id: accOwnerId
    });
  }

  for (let i = 1; i <= 40; i++) {
    const fromAcc = bankAccounts[i % bankAccounts.length].id;
    const toAcc = bankAccounts[(i + 3) % bankAccounts.length].id;
    const caseIdLink = `CASE-2024-${1001 + (i % 5)}`;
    transactions.push({
      id: `tx_${i}`,
      case_id: caseIdLink,
      from_account: fromAcc,
      to_account: toAcc,
      amount: 50000 + (i * 12500),
      date: new Date(now.getTime() - (i * 5) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // 6. Seed Evidence items linked to case_id
  for (let i = 1; i <= 40; i++) {
    const caseId = `CASE-2024-${1000 + ((i - 1) % 15) + 1}`;
    const eTypes: ('physical' | 'digital' | 'document' | 'testimony')[] = ['physical', 'digital', 'document', 'testimony'];
    const eType = eTypes[i % eTypes.length];
    
    let desc = `CCTV footage from location cameras for ${caseId}`;
    if (eType === 'physical') desc = `Recovered weapon / stolen item from suspect vehicle`;
    if (eType === 'document') desc = `Bank account statements & forged property deed documents`;
    if (eType === 'testimony') desc = `Eyewitness deposition statement recorded under CrPC Sec 161`;

    const officer = INVESTIGATORS[i % INVESTIGATORS.length];

    evidences.push({
      id: `EVID-${2024}-${8000 + i}`,
      case_id: caseId,
      description: desc,
      evidence_type: eType,
      intake_timestamp: new Date(now.getTime() - (i * 3) * 24 * 60 * 60 * 1000).toISOString(),
      intake_officer_id: officer.id,
      intake_officer_name: officer.name,
      status: i % 4 === 0 ? 'In Forensics' : 'In Custody',
      chain_of_custody_log: [
        {
          timestamp: new Date(now.getTime() - (i * 3) * 24 * 60 * 60 * 1000).toISOString(),
          officer: officer.name,
          action: 'Intake & Logging in Case File',
          location: `${officer.station} Evidence Locker`
        },
        {
          timestamp: new Date(now.getTime() - (i * 2) * 24 * 60 * 60 * 1000).toISOString(),
          officer: officer.name,
          action: 'Transferred for Forensic Verification & Hash Check',
          location: 'KSP Forensic Science Lab (FSL)'
        }
      ]
    });
  }

  // 7. Initial Audit Logs
  auditLogs.push(
    {
      id: 1,
      case_id: 'CASE-2024-1001',
      user_email: 'investigator@ksp.gov.in',
      user_role: 'Investigator',
      query_text: 'Show all theft cases in Indiranagar in the last 6 months',
      sql_ran: "SELECT f.* FROM firs f JOIN locations l ON f.location_id = l.id WHERE f.crime_type = 'Theft' AND l.area = 'Indiranagar' AND f.date >= NOW() - INTERVAL '6 months'",
      cypher_ran: "MATCH (f:FIR)-[:OCCURRED_AT]->(l:Location {area: 'Indiranagar'}) WHERE f.crime_type = 'Theft' RETURN f, l",
      timestamp: new Date(now.getTime() - 3600000 * 2).toISOString()
    },
    {
      id: 2,
      case_id: 'CASE-2024-1002',
      user_email: 'investigator@ksp.gov.in',
      user_role: 'Investigator',
      query_text: 'Who are the known associates of accused Amit Sharma?',
      sql_ran: "SELECT a2.* FROM accused a1 JOIN fir_accused fa1 ON a1.id = fa1.accused_id JOIN fir_accused fa2 ON fa1.fir_id = fa2.fir_id JOIN accused a2 ON fa2.accused_id = a2.id WHERE a1.name LIKE '%Amit Sharma%' AND a2.id != a1.id",
      cypher_ran: "MATCH (a:Accused {name: 'Amit Sharma'})-[:ASSOCIATE_OF]-(assoc:Accused) RETURN a, assoc",
      timestamp: new Date(now.getTime() - 3600000 * 1).toISOString()
    }
  );
}

// Auto run initialization
initializeDatabase();

// --- API Service Methods ---

export function getDashboardStats() {
  const typeCounts: Record<string, number> = {};
  const areaCounts: Record<string, number> = {};
  const monthlyCounts: Record<string, number> = {};

  firs.forEach(f => {
    typeCounts[f.crime_type] = (typeCounts[f.crime_type] || 0) + 1;
    const loc = locations.find(l => l.id === f.location_id);
    if (loc) {
      areaCounts[loc.area] = (areaCounts[loc.area] || 0) + 1;
    }
    const mStr = f.date.substring(0, 7);
    monthlyCounts[mStr] = (monthlyCounts[mStr] || 0) + 1;
  });

  const crimes_by_type = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
  const crimes_by_area = Object.entries(areaCounts).map(([area, count]) => ({ area, count }));
  const sortedMonths = Object.keys(monthlyCounts).sort();
  const crimes_trend = sortedMonths.map(month => ({ month, count: monthlyCounts[month] }));

  return { crimes_by_type, crimes_by_area, crimes_trend };
}

export function getAccusedRiskScore(accusedId: number): { risk_score: number; risk_level: 'Low' | 'Medium' | 'High' } {
  const acc = accused.find(a => a.id === accusedId);
  if (!acc) return { risk_score: 0.2, risk_level: 'Low' };
  const priorFirs = firs.filter(f => f.accused_ids.includes(acc.id)).length;
  let risk_score = 0.2 + (priorFirs * 0.18) + (acc.associates.length * 0.08);
  if (risk_score > 0.95) risk_score = 0.95;
  risk_score = Math.round(risk_score * 100) / 100;

  let risk_level: 'Low' | 'Medium' | 'High' = 'Low';
  if (risk_score >= 0.70) risk_level = 'High';
  else if (risk_score >= 0.45) risk_level = 'Medium';

  return { risk_score, risk_level };
}

export function getAccusedList(): AccusedWithRisk[] {
  return accused.map(acc => {
    const priorFirs = firs.filter(f => f.accused_ids.includes(acc.id)).length;
    let risk_score = 0.2 + (priorFirs * 0.18) + (acc.associates.length * 0.08);
    if (risk_score > 0.95) risk_score = 0.95;
    risk_score = Math.round(risk_score * 100) / 100;

    let risk_level: 'Low' | 'Medium' | 'High' = 'Low';
    if (risk_score >= 0.70) risk_level = 'High';
    else if (risk_score >= 0.45) risk_level = 'Medium';

    return {
      id: acc.id,
      name: acc.name,
      age: acc.age,
      gender: acc.gender,
      address: acc.address,
      state: acc.state,
      num_prior_firs: priorFirs,
      risk_score: risk_score,
      risk_level: risk_level,
      explanations: [
        {
          feature_key: 'num_prior_firs',
          feature: 'Prior FIR Arrest Records',
          value: priorFirs,
          effect: priorFirs * 0.18,
          direction: priorFirs > 1 ? 'increase' : 'decrease',
          reason: priorFirs > 1 ? 'Multiple prior registered offenses elevate recidivism risk' : 'Low historical offense records'
        },
        {
          feature_key: 'associates_count',
          feature: 'Known Crime Network Associates',
          value: acc.associates.length,
          effect: acc.associates.length * 0.08,
          direction: acc.associates.length > 0 ? 'increase' : 'decrease',
          reason: acc.associates.length > 0 ? 'Active co-accused links detected in relational graph' : 'No criminal associates'
        }
      ]
    };
  });
}

export function getHotspots(crime_type?: string, start_date?: string, end_date?: string) {
  let filteredFirs = firs;
  if (crime_type) {
    filteredFirs = filteredFirs.filter(f => f.crime_type.toLowerCase() === crime_type.toLowerCase());
  }
  if (start_date) {
    filteredFirs = filteredFirs.filter(f => f.date >= start_date);
  }
  if (end_date) {
    filteredFirs = filteredFirs.filter(f => f.date <= end_date);
  }

  const points = filteredFirs.map(f => {
    const loc = locations.find(l => l.id === f.location_id) || locations[0];
    return {
      id: f.id,
      fir_number: f.fir_number,
      date: f.date,
      crime_type: f.crime_type,
      description: f.description,
      location_name: loc.name,
      area: loc.area,
      latitude: loc.latitude + ((f.id % 7 - 3) * 0.0015),
      longitude: loc.longitude + ((f.id % 5 - 2) * 0.0015)
    };
  });

  // Spatial cluster hotspots by location
  const clusters: Record<string, any> = {};
  points.forEach(p => {
    if (!clusters[p.area]) {
      clusters[p.area] = {
        cluster_id: Object.keys(clusters).length + 1,
        area: p.area,
        lats: [],
        lons: [],
        points: [],
        typeCounts: {}
      };
    }
    clusters[p.area].lats.push(p.latitude);
    clusters[p.area].lons.push(p.longitude);
    clusters[p.area].points.push(p);
    clusters[p.area].typeCounts[p.crime_type] = (clusters[p.area].typeCounts[p.crime_type] || 0) + 1;
  });

  const hotspots = Object.values(clusters).map((c: any) => ({
    cluster_id: c.cluster_id,
    latitude: c.lats.reduce((a: number, b: number) => a + b, 0) / c.lats.length,
    longitude: c.lons.reduce((a: number, b: number) => a + b, 0) / c.lons.length,
    count: c.points.length,
    crime_types: c.typeCounts,
    points: c.points
  }));

  return { hotspots, points };
}

export function getCrimeForecast(area?: string, crime_type?: string) {
  let filtered = firs;
  if (area) {
    const locIds = locations.filter(l => l.area.toLowerCase() === area.toLowerCase()).map(l => l.id);
    filtered = filtered.filter(f => locIds.includes(f.location_id));
  }
  if (crime_type) {
    filtered = filtered.filter(f => f.crime_type.toLowerCase() === crime_type.toLowerCase());
  }

  const monthlyCounts: Record<string, number> = {};
  filtered.forEach(f => {
    const mStr = f.date.substring(0, 7);
    monthlyCounts[mStr] = (monthlyCounts[mStr] || 0) + 1;
  });

  const history = Object.keys(monthlyCounts).sort().slice(-18).map(m => ({
    month: m,
    count: monthlyCounts[m],
    forecast: null,
    lower: null,
    upper: null,
    is_forecast: false
  }));

  if (history.length > 0) {
    history[history.length - 1].forecast = history[history.length - 1].count;
  }

  const lastMonth = history.length > 0 ? history[history.length - 1].month : '2024-12';
  const [yStr, mStr] = lastMonth.split('-');
  let y = parseInt(yStr);
  let m = parseInt(mStr);

  const forecast = [];
  const avgCount = history.length > 0 ? history.reduce((a, b) => a + (b.count || 0), 0) / history.length : 5;

  for (let i = 1; i <= 3; i++) {
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
    const futureMonth = `${y}-${m < 10 ? '0' + m : m}`;
    const fcVal = Math.round((avgCount * (1 + (i * 0.03))) * 10) / 10;
    forecast.push({
      month: futureMonth,
      count: null,
      forecast: fcVal,
      lower: Math.max(0, Math.round((fcVal * 0.7) * 10) / 10),
      upper: Math.round((fcVal * 1.3) * 10) / 10,
      is_forecast: true
    });
  }

  return {
    history,
    forecast,
    combined: [...history, ...forecast]
  };
}

export function getFinancialLinks(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  bankAccounts.forEach(acc => {
    const owner = accused.find(a => a.id === acc.owner_accused_id);
    nodes.push({
      data: {
        id: acc.id,
        label: `${acc.account_number} (${acc.bank_name})`,
        type: 'BankAccount',
        properties: {
          account_number: acc.account_number,
          bank_name: acc.bank_name,
          owner_name: owner ? owner.name : 'Unknown'
        }
      }
    });

    if (owner) {
      const ownerNodeId = `accused_${owner.id}`;
      if (!nodes.some(n => n.data.id === ownerNodeId)) {
        nodes.push({
          data: {
            id: ownerNodeId,
            label: owner.name,
            type: 'Accused',
            properties: {
              name: owner.name,
              age: owner.age,
              gender: owner.gender,
              address: owner.address
            }
          }
        });
      }
      edges.push({
        data: {
          id: `edge_owned_${acc.id}`,
          source: acc.id,
          target: ownerNodeId,
          type: 'OWNED_BY'
        }
      });
    }
  });

  transactions.forEach(tx => {
    edges.push({
      data: {
        id: tx.id,
        source: tx.from_account,
        target: tx.to_account,
        type: 'TRANSACTED_WITH'
      }
    });
  });

  return { nodes, edges };
}

export function getDemographicCorrelation() {
  const data = locations.map(loc => {
    const crimeCount = firs.filter(f => f.location_id === loc.id).length;
    return {
      location_name: loc.name,
      area: loc.area,
      crime_count: crimeCount,
      literacy_rate: loc.literacy_rate,
      unemployment_rate: loc.unemployment_rate,
      population_density: loc.population_density
    };
  });

  return {
    correlations: {
      literacy_rate: -0.42,
      unemployment_rate: 0.68,
      population_density: 0.54
    },
    data
  };
}

// Structured query search & graph extractor
export function executeStructuredQuery(queryText: string): {
  matchedFirs: FIRData[];
  matchedAccused: AccusedData[];
  matchedLocations: LocationData[];
  graphData: GraphData;
  sources: Source[];
  sqlRan: string;
  cypherRan: string;
} {
  const lowerQuery = queryText.toLowerCase();

  // Normalize Kannada terms to English search terms for database lookup
  let searchTarget = lowerQuery;
  const knMappings: Record<string, string> = {
    'ವೈಟ್‌ಫೀಲ್ಡ್': 'whitefield',
    'ಇಂದಿರಾನಗರ': 'indiranagar',
    'ಕೆಆರ್ ಪುರಂ': 'k.r. puram',
    'ಕೋರಮಂಗಲ': 'koramangala',
    'ಜಯನಗರ': 'jayanagar',
    'ಹೆಬ್ಬಾಳ': 'hebbal',
    'ಕಳ್ಳತನ': 'theft',
    'ಮೋಸ': 'fraud',
    'ವಂಚನೆ': 'fraud',
    'ದರೋಡೆ': 'robbery',
    'ಕೊಲೆ': 'murder',
    'ಸೈಬರ್': 'cybercrime',
    'ಗೀತಾ ರೆಡ್ಡಿ': 'geeta reddy',
    'ಅಮಿತ್ ಶರ್ಮಾ': 'amit sharma',
    'ರಾಜೇಶ್ ಗೌಡ': 'rajesh gowda'
  };

  for (const [knWord, enWord] of Object.entries(knMappings)) {
    if (searchTarget.includes(knWord)) {
      searchTarget += ` ${enWord}`;
    }
  }

  // Find location match
  let locMatch = locations.find(l => searchTarget.includes(l.area.toLowerCase()) || searchTarget.includes(l.name.toLowerCase()));
  let typeMatch = CRIME_TYPES.find(ct => searchTarget.includes(ct.toLowerCase()));
  let accMatch = accused.find(a => searchTarget.includes(a.name.toLowerCase()) || a.name.toLowerCase().split(' ').some(part => part.length > 3 && searchTarget.includes(part)));

  let matchedFirs = firs;
  if (locMatch) {
    matchedFirs = matchedFirs.filter(f => f.location_id === locMatch!.id);
  }
  if (typeMatch) {
    matchedFirs = matchedFirs.filter(f => f.crime_type.toLowerCase() === typeMatch!.toLowerCase());
  }
  if (accMatch) {
    const accFirMatches = firs.filter(f => f.accused_ids.includes(accMatch!.id));
    if (accFirMatches.length > 0) {
      matchedFirs = accFirMatches;
    }
  }

  if (!locMatch && !typeMatch && !accMatch) {
    matchedFirs = firs.slice(0, 10);
  } else {
    matchedFirs = matchedFirs.slice(0, 15);
  }

  // Related Accused
  const accusedSet = new Set<number>();
  matchedFirs.forEach(f => f.accused_ids.forEach(id => accusedSet.add(id)));
  if (accMatch) {
    accusedSet.add(accMatch.id);
    accMatch.associates.forEach(assocId => accusedSet.add(assocId));
  }

  const matchedAccused = accused.filter(a => accusedSet.has(a.id));

  // Related Locations
  const locSet = new Set<number>();
  matchedFirs.forEach(f => locSet.add(f.location_id));
  const matchedLocations = locations.filter(l => locSet.has(l.id));

  // Build Graph Nodes & Edges
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const addNode = (node: GraphNode) => {
    if (!nodes.some(n => n.data.id === node.data.id)) {
      nodes.push(node);
    }
  };

  const addEdge = (edge: GraphEdge) => {
    if (!edges.some(e => e.data.id === edge.data.id)) {
      edges.push(edge);
    }
  };

  // Add Locations
  matchedLocations.forEach(loc => {
    addNode({
      data: {
        id: `loc_${loc.id}`,
        label: loc.area,
        type: 'Location',
        properties: { name: loc.name, area: loc.area }
      }
    });
  });

  // Add Accused
  matchedAccused.forEach(acc => {
    addNode({
      data: {
        id: `accused_${acc.id}`,
        label: acc.name,
        type: 'Accused',
        properties: { name: acc.name, age: acc.age, gender: acc.gender, address: acc.address }
      }
    });
  });

  // Add Accused Associates
  matchedAccused.forEach(acc => {
    const accNodeId = `accused_${acc.id}`;
    acc.associates.forEach(assocId => {
      const assoc = accused.find(a => a.id === assocId);
      if (assoc) {
        const assocNodeId = `accused_${assoc.id}`;
        addNode({
          data: {
            id: assocNodeId,
            label: assoc.name,
            type: 'Accused',
            properties: { name: assoc.name, age: assoc.age, gender: assoc.gender }
          }
        });
        addEdge({
          data: {
            id: `edge_assoc_${Math.min(acc.id, assoc.id)}_${Math.max(acc.id, assoc.id)}`,
            source: accNodeId,
            target: assocNodeId,
            type: 'ASSOCIATE_OF'
          }
        });
      }
    });
  });

  // Add FIRs and connection to Location & Accused
  matchedFirs.forEach(f => {
    const firNodeId = `fir_${f.id}`;
    const loc = locations.find(l => l.id === f.location_id);
    addNode({
      data: {
        id: firNodeId,
        label: f.fir_number,
        type: 'FIR',
        properties: {
          fir_number: f.fir_number,
          crime_type: f.crime_type,
          date: f.date.substring(0, 10),
          description: f.description,
          location: loc ? loc.area : 'Bengaluru'
        }
      }
    });

    if (loc) {
      const locNodeId = `loc_${loc.id}`;
      addNode({
        data: {
          id: locNodeId,
          label: loc.area,
          type: 'Location',
          properties: { name: loc.name, area: loc.area }
        }
      });
      addEdge({
        data: {
          id: `edge_occurred_${f.id}`,
          source: firNodeId,
          target: locNodeId,
          type: 'OCCURRED_AT'
        }
      });
    }

    f.accused_ids.forEach(accId => {
      const acc = accused.find(a => a.id === accId);
      if (acc) {
        const accNodeId = `accused_${acc.id}`;
        addNode({
          data: {
            id: accNodeId,
            label: acc.name,
            type: 'Accused',
            properties: { name: acc.name, age: acc.age, gender: acc.gender }
          }
        });
        addEdge({
          data: {
            id: `edge_accused_${acc.id}_fir_${f.id}`,
            source: accNodeId,
            target: firNodeId,
            type: 'ACCUSED_IN'
          }
        });
      }
    });

    // Add Evidence connected to FIR
    const firEvidences = evidences.filter(e => e.case_id === f.case_id);
    firEvidences.forEach(e => {
      const evidNodeId = `evid_${e.id}`;
      addNode({
        data: {
          id: evidNodeId,
          label: `${e.id}`,
          type: 'Evidence',
          properties: { description: e.description, status: e.status, officer: e.intake_officer_name }
        }
      });
      addEdge({
        data: {
          id: `edge_evid_${e.id}_fir_${f.id}`,
          source: evidNodeId,
          target: firNodeId,
          type: 'EVIDENCE_FOR'
        }
      });
    });
  });

  // Add Bank Accounts & Transactions connected to matchedAccused
  const matchedAccusedIds = new Set(nodes.filter(n => n.data.type === 'Accused').map(n => parseInt(n.data.id.replace('accused_', ''))));
  const userBankAccounts = bankAccounts.filter(b => matchedAccusedIds.has(b.owner_accused_id));

  userBankAccounts.forEach(b => {
    const bankNodeId = `bank_${b.id}`;
    const accNodeId = `accused_${b.owner_accused_id}`;
    addNode({
      data: {
        id: bankNodeId,
        label: `${b.bank_name}\n${b.account_number}`,
        type: 'BankAccount',
        properties: { bank_name: b.bank_name, account_number: b.account_number }
      }
    });
    addEdge({
      data: {
        id: `edge_owned_${b.id}`,
        source: bankNodeId,
        target: accNodeId,
        type: 'OWNED_BY'
      }
    });
  });

  // Transactions between bank accounts
  const bankNodeIds = new Set(nodes.filter(n => n.data.type === 'BankAccount').map(n => n.data.id.replace('bank_', '')));
  const relevantTransactions = transactions.filter(t => bankNodeIds.has(t.from_account) || bankNodeIds.has(t.to_account));

  relevantTransactions.forEach(t => {
    const fromBank = bankAccounts.find(b => b.id === t.from_account);
    const toBank = bankAccounts.find(b => b.id === t.to_account);
    if (fromBank && toBank) {
      const fromNodeId = `bank_${fromBank.id}`;
      const toNodeId = `bank_${toBank.id}`;
      addNode({
        data: {
          id: fromNodeId,
          label: `${fromBank.bank_name}\n${fromBank.account_number}`,
          type: 'BankAccount',
          properties: { bank_name: fromBank.bank_name, account_number: fromBank.account_number }
        }
      });
      addNode({
        data: {
          id: toNodeId,
          label: `${toBank.bank_name}\n${toBank.account_number}`,
          type: 'BankAccount',
          properties: { bank_name: toBank.bank_name, account_number: toBank.account_number }
        }
      });
      addEdge({
        data: {
          id: `edge_tx_${t.id}`,
          source: fromNodeId,
          target: toNodeId,
          type: 'TRANSACTED_WITH'
        }
      });
    }
  });

  // Ensure ALL edges have valid source and target nodes in nodes array
  const validNodeIds = new Set(nodes.map(n => n.data.id));
  const validEdges = edges.filter(e => validNodeIds.has(e.data.source) && validNodeIds.has(e.data.target));

  // Sources for grounding
  const sources: Source[] = [];
  matchedFirs.forEach(f => {
    sources.push({
      database: 'PostgreSQL',
      type: 'FIR',
      id: f.id,
      identifier: f.fir_number
    });
  });
  matchedAccused.forEach(a => {
    sources.push({
      database: 'Neo4j',
      type: 'Accused',
      id: a.id,
      identifier: a.name
    });
  });

  const sqlRan = `SELECT f.id, f.fir_number, f.date, f.crime_type, f.description, l.area 
FROM firs f JOIN locations l ON f.location_id = l.id 
WHERE ${typeMatch ? `f.crime_type = '${typeMatch}'` : '1=1'} 
${locMatch ? `AND l.area = '${locMatch.area}'` : ''} 
ORDER BY f.date DESC LIMIT 15;`;

  const cypherRan = `MATCH (a:Accused)-[r:ACCUSED_IN]->(f:FIR)-[:OCCURRED_AT]->(l:Location) 
WHERE ${typeMatch ? `f.crime_type = '${typeMatch}'` : '1=1'} 
${locMatch ? `AND l.area = '${locMatch.area}'` : ''} 
RETURN a, f, l LIMIT 15;`;

  return {
    matchedFirs,
    matchedAccused,
    matchedLocations,
    graphData: { nodes, edges: validEdges },
    sources,
    sqlRan,
    cypherRan
  };
}

// 1. Full Case Context Query
export function getFullCaseContext(caseIdParam: string): FullCaseContext | null {
  let matchedFir = firs.find(f => 
    f.case_id.toLowerCase() === caseIdParam.toLowerCase() ||
    f.fir_number.toLowerCase() === caseIdParam.toLowerCase() ||
    f.id.toString() === caseIdParam
  );

  if (!matchedFir) return null;

  const caseId = matchedFir.case_id;
  const loc = locations.find(l => l.id === matchedFir!.location_id);
  const accusedList = accused.filter(a => matchedFir!.accused_ids.includes(a.id)).map(a => {
    const risk = getAccusedRiskScore(a.id);
    return {
      id: a.id,
      name: a.name,
      age: a.age,
      gender: a.gender,
      address: a.address,
      risk_score: risk.risk_score,
      risk_level: risk.risk_level
    };
  });

  const victimsList = victims.filter(v => matchedFir!.victim_ids.includes(v.id)).map(v => ({
    id: v.id,
    name: v.name,
    age: v.age,
    gender: v.gender,
    address: v.address
  }));

  const caseEvidence = evidences.filter(e => e.case_id === caseId);

  // Financial links
  const caseTx = transactions.filter(t => t.case_id === caseId);
  const financialLinks = caseTx.map(t => {
    const fromAcc = bankAccounts.find(b => b.id === t.from_account);
    const owner = fromAcc ? accused.find(a => a.id === fromAcc.owner_accused_id) : null;
    return {
      id: t.id,
      from_account: t.from_account,
      to_account: t.to_account,
      amount: t.amount,
      date: t.date,
      owner_name: owner ? owner.name : 'Suspect Entity'
    };
  });

  // Graph data for this case
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  nodes.push({
    data: {
      id: `fir_${matchedFir.id}`,
      label: `${matchedFir.case_id} (${matchedFir.fir_number})`,
      type: 'FIR',
      properties: {
        crime_type: matchedFir.crime_type,
        severity: matchedFir.severity,
        status: matchedFir.status,
        area: loc ? loc.area : 'Bengaluru'
      }
    }
  });

  if (loc) {
    const locId = `loc_${loc.id}`;
    nodes.push({
      data: {
        id: locId,
        label: loc.area,
        type: 'Location',
        properties: { name: loc.name }
      }
    });
    edges.push({
      data: {
        id: `e_loc_${matchedFir.id}`,
        source: `fir_${matchedFir.id}`,
        target: locId,
        type: 'OCCURRED_AT'
      }
    });
  }

  accusedList.forEach(acc => {
    const accNodeId = `accused_${acc.id}`;
    nodes.push({
      data: {
        id: accNodeId,
        label: acc.name,
        type: 'Accused',
        properties: { age: acc.age, risk_level: acc.risk_level }
      }
    });
    edges.push({
      data: {
        id: `e_acc_${acc.id}_${matchedFir.id}`,
        source: accNodeId,
        target: `fir_${matchedFir.id}`,
        type: 'ACCUSED_IN'
      }
    });
  });

  victimsList.forEach(vic => {
    const vicNodeId = `victim_${vic.id}`;
    nodes.push({
      data: {
        id: vicNodeId,
        label: vic.name,
        type: 'Victim',
        properties: { age: vic.age }
      }
    });
    edges.push({
      data: {
        id: `e_vic_${vic.id}_${matchedFir.id}`,
        source: vicNodeId,
        target: `fir_${matchedFir.id}`,
        type: 'VICTIM_OF'
      }
    });
  });

  const caseAudit = auditLogs.filter(a => a.case_id === caseId || a.query_text.includes(caseId) || a.query_text.includes(matchedFir!.fir_number));
  const daysOpen = Math.floor((new Date().getTime() - new Date(matchedFir.date).getTime()) / (1000 * 60 * 60 * 24));

  return {
    case_id: matchedFir.case_id,
    fir: {
      id: matchedFir.id,
      fir_number: matchedFir.fir_number,
      date: matchedFir.date,
      crime_type: matchedFir.crime_type,
      description: matchedFir.description,
      location_name: loc ? loc.name : 'Unknown Station',
      area: loc ? loc.area : 'Bengaluru',
      assigned_investigator: matchedFir.assigned_investigator,
      assigned_investigator_id: matchedFir.assigned_investigator_id,
      days_open: daysOpen,
      status: matchedFir.status,
      severity: matchedFir.severity
    },
    accused: accusedList,
    victims: victimsList,
    evidence: caseEvidence,
    financial_links: financialLinks,
    graph_relationships: { nodes, edges },
    audit_history: caseAudit
  };
}

// 2. Automated Evidence Intake Pipeline
export function addEvidenceIntake(params: {
  case_id: string;
  description: string;
  evidence_type: 'physical' | 'digital' | 'document' | 'testimony';
  intake_officer_id?: number;
  intake_officer_name: string;
  user_email?: string;
}): { success: boolean; evidence?: EvidenceItem; error?: string } {
  if (!params.case_id || !params.description || !params.evidence_type || !params.intake_officer_name) {
    return { success: false, error: 'Incomplete evidence intake submission. Required: case_id, description, evidence_type, intake_officer_name.' };
  }

  const firMatch = firs.find(f => f.case_id.toLowerCase() === params.case_id.toLowerCase() || f.fir_number.toLowerCase() === params.case_id.toLowerCase());
  const canonicalCaseId = firMatch ? firMatch.case_id : params.case_id;

  // Duplicate detection check
  const existingForCase = evidences.filter(e => e.case_id.toLowerCase() === canonicalCaseId.toLowerCase());
  let isDuplicate = false;
  let dupReason = '';

  for (const existing of existingForCase) {
    if (existing.evidence_type === params.evidence_type) {
      const newWords = params.description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const existingDesc = existing.description.toLowerCase();
      const matchCount = newWords.filter(w => existingDesc.includes(w)).length;
      if (matchCount >= 2 || existingDesc === params.description.toLowerCase()) {
        isDuplicate = true;
        dupReason = `Potential duplicate of existing item #${existing.id} ("${existing.description}") logged under ${canonicalCaseId}`;
        break;
      }
    }
  }

  const nowIso = new Date().toISOString();
  const newId = `EVID-2024-${9000 + evidences.length + 1}`;

  const newEvidence: EvidenceItem = {
    id: newId,
    case_id: canonicalCaseId,
    description: params.description,
    evidence_type: params.evidence_type,
    intake_timestamp: nowIso,
    intake_officer_id: params.intake_officer_id || 101,
    intake_officer_name: params.intake_officer_name,
    status: 'In Custody',
    chain_of_custody_log: [
      {
        timestamp: nowIso,
        officer: params.intake_officer_name,
        action: 'Intake & Logging in Case File',
        location: 'Station Evidence Locker'
      }
    ],
    potential_duplicate: isDuplicate,
    duplicate_reason: dupReason || undefined
  };

  evidences.push(newEvidence);

  auditLogs.push({
    id: auditLogs.length + 1,
    case_id: canonicalCaseId,
    user_email: params.user_email || `${params.intake_officer_name.toLowerCase().replace(/[^a-z]/g, '')}@ksp.gov.in`,
    user_role: 'Investigator',
    query_text: `EVIDENCE INTAKE LOGGED: Item #${newId} [${params.evidence_type.toUpperCase()}] for ${canonicalCaseId}. ${isDuplicate ? '[DUPLICATE FLAGGED]' : ''}`,
    sql_ran: `INSERT INTO evidence (id, case_id, description, evidence_type, officer_id, intake_time) VALUES ('${newId}', '${canonicalCaseId}', '${params.description.replace(/'/g, "''")}', '${params.evidence_type}', ${params.intake_officer_id || 101}, NOW());`,
    cypher_ran: `MATCH (c:Case {case_id: '${canonicalCaseId}'}) CREATE (e:Evidence {id: '${newId}', type: '${params.evidence_type}'}) CREATE (c)-[:HAS_EVIDENCE]->(e);`,
    timestamp: nowIso
  });

  return { success: true, evidence: newEvidence };
}

// 3. Predictive Pendency Risk Analytics
export function getPendencyRiskCases(): PendencyRiskCase[] {
  const now = new Date().getTime();
  
  return firs.filter(f => f.status !== 'Closed').map(fir => {
    const daysOpen = Math.floor((now - new Date(fir.date).getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceLastUpdate = Math.floor((now - new Date(fir.last_updated).getTime()) / (1000 * 60 * 60 * 24));
    
    const caseEvidences = evidences.filter(e => e.case_id === fir.case_id);
    const isEvidenceIncomplete = caseEvidences.length < 2;

    let score = 0.2;
    const explanations = [];

    if (daysSinceLastUpdate > 30) {
      score += 0.35;
      explanations.push({
        feature: 'Days Since Last Update',
        effect: 0.35,
        direction: 'increase' as const,
        reason: `Case untouched for ${daysSinceLastUpdate} days (Threshold: >30 days)`
      });
    } else if (daysSinceLastUpdate > 14) {
      score += 0.15;
      explanations.push({
        feature: 'Days Since Last Update',
        effect: 0.15,
        direction: 'increase' as const,
        reason: `No activity recorded for ${daysSinceLastUpdate} days`
      });
    } else {
      explanations.push({
        feature: 'Days Since Last Update',
        effect: -0.1,
        direction: 'decrease' as const,
        reason: `Recently updated (${daysSinceLastUpdate} days ago)`
      });
    }

    if (fir.severity === 'High') {
      score += 0.25;
      explanations.push({
        feature: 'Crime Severity Level',
        effect: 0.25,
        direction: 'increase' as const,
        reason: `High severity offense (${fir.crime_type}) requiring multi-departmental coordination`
      });
    }

    if (isEvidenceIncomplete) {
      score += 0.2;
      explanations.push({
        feature: 'Incomplete Evidence Chain',
        effect: 0.2,
        direction: 'increase' as const,
        reason: `Only ${caseEvidences.length} evidence item(s) logged for ${fir.case_id}`
      });
    } else {
      score -= 0.1;
      explanations.push({
        feature: 'Sufficient Evidence Intake',
        effect: -0.1,
        direction: 'decrease' as const,
        reason: `${caseEvidences.length} evidence items logged in chain of custody`
      });
    }

    if (daysOpen > 90) {
      score += 0.15;
      explanations.push({
        feature: 'Historical Pendency Duration',
        effect: 0.15,
        direction: 'increase' as const,
        reason: `Open for ${daysOpen} days exceeds standard 90-day charge-sheet window`
      });
    }

    score = Math.min(Math.max(score, 0.05), 0.98);

    const level: 'High Risk' | 'Moderate Risk' | 'Low Risk' = 
      score > 0.65 ? 'High Risk' : score > 0.4 ? 'Moderate Risk' : 'Low Risk';

    return {
      case_id: fir.case_id,
      fir_number: fir.fir_number,
      crime_type: fir.crime_type,
      area: locations.find(l => l.id === fir.location_id)?.area || 'Bengaluru',
      assigned_investigator: fir.assigned_investigator,
      days_since_last_update: daysSinceLastUpdate,
      days_open: daysOpen,
      severity: fir.severity,
      evidence_count: caseEvidences.length,
      is_evidence_incomplete: isEvidenceIncomplete,
      pendency_risk_score: parseFloat(score.toFixed(2)),
      pendency_risk_level: level,
      explanations: explanations
    };
  }).sort((a, b) => b.pendency_risk_score - a.pendency_risk_score);
}

// 4. Investigator Workload Analytics
export function getInvestigatorWorkloadAnalytics(): InvestigatorWorkload[] {
  const threshold = 5;

  return INVESTIGATORS.map(inv => {
    const assignedFirs = firs.filter(f => f.assigned_investigator_id === inv.id && f.status !== 'Closed');
    const openCount = assignedFirs.length;
    const highSevCount = assignedFirs.filter(f => f.severity === 'High').length;

    let status: 'Overloaded' | 'Optimal' | 'Underutilized' = 'Optimal';
    if (openCount >= threshold) status = 'Overloaded';
    else if (openCount <= 2) status = 'Underutilized';

    const suggestedReassignments = [];
    if (status === 'Overloaded') {
      const targetInv = INVESTIGATORS.find(other => {
        if (other.id === inv.id) return false;
        const otherOpen = firs.filter(f => f.assigned_investigator_id === other.id && f.status !== 'Closed').length;
        return otherOpen < 3;
      });

      if (targetInv && assignedFirs.length > 0) {
        const caseToTransfer = assignedFirs[0];
        suggestedReassignments.push({
          case_id: caseToTransfer.case_id,
          fir_number: caseToTransfer.fir_number,
          recommended_target_investigator: targetInv.name,
          reason: `${inv.name} holds ${openCount} active cases. Reassigning ${caseToTransfer.case_id} to ${targetInv.name} balances team load.`
        });
      }
    }

    return {
      investigator_id: inv.id,
      investigator_name: inv.name,
      badge_email: inv.badge_email,
      station: inv.station,
      open_case_count: openCount,
      high_severity_case_count: highSevCount,
      workload_status: status,
      suggested_reassignments: suggestedReassignments
    };
  });
}
