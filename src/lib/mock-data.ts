export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  vendor: string;
  type: 'inflow' | 'outflow';
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface CashFlowDay {
  date: string;
  startingBalance: number;
  inflow: number;
  outflow: number;
  endingBalance: number;
  hasCriticalEvent: boolean;
  criticalEventName?: string;
}

export interface AnomalyAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: string;
}

export interface ScenarioAssumption {
  id: string;
  label: string;
  value: number;
  type: 'currency' | 'percent' | 'count';
}

export interface ScenarioPoint {
  month: string;
  baseRunway: number;
  stressRunway: number;
  growthRunway: number;
}

export interface CapTableMember {
  id: string;
  holder: string;
  type: 'founder' | 'employee-pool' | 'investor' | 'advisor' | 'note';
  shares: number;
  ownershipPct: number;
}

export interface DilutionScenario {
  roundName: string;
  preMoney: number;
  raiseAmount: number;
  optionPoolTopUpPct: number;
  founderOwnershipBeforePct: number;
  founderOwnershipAfterPct: number;
}

export interface ComplianceAlert {
  id: string;
  title: string;
  dueDate: string;
  jurisdiction: string;
  category: 'tax' | 'filing' | 'payroll' | 'r&d';
  severity: 'upcoming' | 'urgent' | 'critical';
  description: string;
}

// 1. Mock Key Metrics
export const mockMetrics = {
  totalCash: 854000,
  monthlyBurn: 125000,
  predictedRunwayMonths: 6.8,
  uncollectedAR: 320000,
  runwayZeroDate: '2026-10-15',
};

// 2. Mock 13-Week Cash Flow Predictor Data
// Demonstrating the "temporal cash flow trap" where payroll + VAT hits before a massive invoice is paid.
export const mockCashFlow: CashFlowDay[] = [
  { date: '2026-03-20', startingBalance: 854000, inflow: 0, outflow: 15000, endingBalance: 839000, hasCriticalEvent: false },
  { date: '2026-03-27', startingBalance: 839000, inflow: 10000, outflow: 75000, endingBalance: 774000, hasCriticalEvent: true, criticalEventName: 'Global Payroll' },
  { date: '2026-04-03', startingBalance: 774000, inflow: 0, outflow: 25000, endingBalance: 749000, hasCriticalEvent: false },
  { date: '2026-04-10', startingBalance: 749000, inflow: 0, outflow: 120000, endingBalance: 629000, hasCriticalEvent: true, criticalEventName: 'AWS + VAT Remittance' },
  { date: '2026-04-17', startingBalance: 629000, inflow: 0, outflow: 75000, endingBalance: 554000, hasCriticalEvent: true, criticalEventName: 'Global Payroll' },
  { date: '2026-04-24', startingBalance: 554000, inflow: 0, outflow: 20000, endingBalance: 534000, hasCriticalEvent: false },
  // Danger zone: massive AR needed here
  { date: '2026-05-01', startingBalance: 534000, inflow: 250000, outflow: 30000, endingBalance: 754000, hasCriticalEvent: true, criticalEventName: 'Enterprise Client Payment Expected' },
  { date: '2026-05-08', startingBalance: 754000, inflow: 0, outflow: 75000, endingBalance: 679000, hasCriticalEvent: true, criticalEventName: 'Global Payroll' },
];

// 3. Mock Accounts Receivable (Delayed Payments)
export const mockInvoices: Invoice[] = [
  { id: 'INV-1042', client: 'Acme Corp', amount: 120000, issueDate: '2026-01-15', dueDate: '2026-03-15', status: 'overdue' },
  { id: 'INV-1043', client: 'Globex Inc', amount: 85000, issueDate: '2026-02-01', dueDate: '2026-04-01', status: 'pending' },
  { id: 'INV-1044', client: 'Initech', amount: 45000, issueDate: '2026-02-15', dueDate: '2026-04-15', status: 'pending' },
  { id: 'INV-1045', client: 'Stark Ind', amount: 70000, issueDate: '2025-12-01', dueDate: '2026-01-31', status: 'overdue' },
];

// 4. Mock AI Alerts
export const mockAlerts: AnomalyAlert[] = [
  {
    id: 'ALT-01',
    severity: 'critical',
    title: 'Liquidity Trap Detected',
    description: 'If Acme Corp ($120k) pays Net-90 instead of Net-60, you will miss the May 8th payroll cycle by $14,000.',
    date: '2026-03-16',
  },
  {
    id: 'ALT-02',
    severity: 'high',
    title: 'Spend Drift: Cloud Infrastructure',
    description: 'AWS Lambda costs are drifting 18% above the 3-month trailing average. Projected $12k overrun this month.',
    date: '2026-03-15',
  },
  {
    id: 'ALT-03',
    severity: 'medium',
    title: 'Accounting Methodology Mismatch',
    description: 'You recorded a $120k upfront booking today, but accrual revenue recognition is only $10k/month. Do not mistake cash for profitability.',
    date: '2026-03-14',
  },
];

// 5. Mock Revenue Data (Cash vs Accrual)
export const mockRevenueData = [
  { month: 'Jan', cashBookings: 250000, accrualRevenue: 40000 },
  { month: 'Feb', cashBookings: 15000, accrualRevenue: 60000 },
  { month: 'Mar', cashBookings: 10000, accrualRevenue: 65000 },
  { month: 'Apr', cashBookings: 120000, accrualRevenue: 75000 },
  { month: 'May', cashBookings: 5000, accrualRevenue: 80000 },
  { month: 'Jun', cashBookings: 200000, accrualRevenue: 95000 },
];

// 6. Mock Scenario Planning Inputs
export const mockScenarioAssumptions: ScenarioAssumption[] = [
  { id: 'SCN-1', label: 'Monthly New MRR', value: 22000, type: 'currency' },
  { id: 'SCN-2', label: 'Monthly Churn', value: 3.2, type: 'percent' },
  { id: 'SCN-3', label: 'Planned Hires (Next 2Q)', value: 3, type: 'count' },
  { id: 'SCN-4', label: 'Average Fully Loaded Cost / Hire', value: 11800, type: 'currency' },
];

export const mockScenarioRunway: ScenarioPoint[] = [
  { month: 'Apr', baseRunway: 6.8, stressRunway: 5.9, growthRunway: 7.1 },
  { month: 'May', baseRunway: 6.5, stressRunway: 5.4, growthRunway: 6.9 },
  { month: 'Jun', baseRunway: 6.1, stressRunway: 5.0, growthRunway: 6.7 },
  { month: 'Jul', baseRunway: 5.9, stressRunway: 4.5, growthRunway: 6.6 },
  { month: 'Aug', baseRunway: 5.6, stressRunway: 4.1, growthRunway: 6.4 },
  { month: 'Sep', baseRunway: 5.3, stressRunway: 3.8, growthRunway: 6.2 },
];

// 7. Mock Cap Table Data
export const mockCapTable: CapTableMember[] = [
  { id: 'CAP-1', holder: 'Moulee (CEO)', type: 'founder', shares: 4800000, ownershipPct: 48 },
  { id: 'CAP-2', holder: 'Co-Founder (CTO)', type: 'founder', shares: 3200000, ownershipPct: 32 },
  { id: 'CAP-3', holder: 'Employee Option Pool', type: 'employee-pool', shares: 1000000, ownershipPct: 10 },
  { id: 'CAP-4', holder: 'Angel Syndicate', type: 'investor', shares: 900000, ownershipPct: 9 },
  { id: 'CAP-5', holder: 'Advisor Grants', type: 'advisor', shares: 100000, ownershipPct: 1 },
];

export const mockDilutionScenario: DilutionScenario = {
  roundName: 'Seed Extension - Proposed',
  preMoney: 12000000,
  raiseAmount: 3000000,
  optionPoolTopUpPct: 3,
  founderOwnershipBeforePct: 80,
  founderOwnershipAfterPct: 64.5,
};

// 8. Mock Compliance Calendar
export const mockComplianceAlerts: ComplianceAlert[] = [
  {
    id: 'CMP-1',
    title: 'Delaware Franchise Tax',
    dueDate: '2026-03-31',
    jurisdiction: 'US - Delaware',
    category: 'tax',
    severity: 'critical',
    description: 'Estimated payment + annual report filing window closes this month.',
  },
  {
    id: 'CMP-2',
    title: 'UK VAT Return (Q1)',
    dueDate: '2026-04-07',
    jurisdiction: 'UK',
    category: 'filing',
    severity: 'urgent',
    description: 'Late filing may trigger penalties and interest charges.',
  },
  {
    id: 'CMP-3',
    title: 'Global Payroll Tax Remittance',
    dueDate: '2026-03-28',
    jurisdiction: 'US + EU',
    category: 'payroll',
    severity: 'urgent',
    description: 'Confirm local withholding obligations before payroll close.',
  },
  {
    id: 'CMP-4',
    title: 'R&D Tax Credit Evidence Checkpoint',
    dueDate: '2026-04-15',
    jurisdiction: 'US Federal',
    category: 'r&d',
    severity: 'upcoming',
    description: 'Tag engineering labor and cloud spend to eligible project codes.',
  },
];
