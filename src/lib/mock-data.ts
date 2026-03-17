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
  totalCash: 86500000,
  monthlyBurn: 12800000,
  predictedRunwayMonths: 6.8,
  uncollectedAR: 32900000,
  runwayZeroDate: '2026-10-15',
};

// 2. Mock 13-Week Cash Flow Predictor Data
// Demonstrating the "temporal cash flow trap" where payroll + GST + vendor renewals hit before collections clear.
export const mockCashFlow: CashFlowDay[] = [
  { date: '2026-03-20', startingBalance: 86500000, inflow: 0, outflow: 2100000, endingBalance: 84400000, hasCriticalEvent: false },
  { date: '2026-03-27', startingBalance: 84400000, inflow: 2500000, outflow: 9800000, endingBalance: 77100000, hasCriticalEvent: true, criticalEventName: 'Payroll + EPF + ESIC' },
  { date: '2026-04-03', startingBalance: 77100000, inflow: 900000, outflow: 3200000, endingBalance: 74800000, hasCriticalEvent: false },
  { date: '2026-04-10', startingBalance: 74800000, inflow: 0, outflow: 14200000, endingBalance: 60600000, hasCriticalEvent: true, criticalEventName: 'GST + AWS + SaaS Renewals' },
  { date: '2026-04-17', startingBalance: 60600000, inflow: 1200000, outflow: 9900000, endingBalance: 51900000, hasCriticalEvent: true, criticalEventName: 'Payroll Cycle' },
  { date: '2026-04-24', startingBalance: 51900000, inflow: 800000, outflow: 4100000, endingBalance: 48600000, hasCriticalEvent: false },
  // Danger zone: delayed enterprise AR can compress runway quickly
  { date: '2026-05-01', startingBalance: 48600000, inflow: 21500000, outflow: 4800000, endingBalance: 65300000, hasCriticalEvent: true, criticalEventName: 'Enterprise Collection Expected' },
  { date: '2026-05-08', startingBalance: 65300000, inflow: 600000, outflow: 9700000, endingBalance: 56200000, hasCriticalEvent: true, criticalEventName: 'Payroll + Vendor Settlements' },
];

// 3. Mock Accounts Receivable (Delayed Payments)
export const mockInvoices: Invoice[] = [
  { id: 'INV-IND-2042', client: 'Reliance Retail Digital', amount: 14600000, issueDate: '2026-01-15', dueDate: '2026-03-15', status: 'overdue' },
  { id: 'INV-IND-2043', client: 'Tata 1mg Marketplace', amount: 9200000, issueDate: '2026-02-01', dueDate: '2026-04-01', status: 'pending' },
  { id: 'INV-IND-2044', client: 'Delhivery Enterprise', amount: 5100000, issueDate: '2026-02-15', dueDate: '2026-04-15', status: 'pending' },
  { id: 'INV-IND-2045', client: 'Lenskart Tech Ops', amount: 4000000, issueDate: '2025-12-01', dueDate: '2026-01-31', status: 'overdue' },
];

// 4. Mock AI Alerts
export const mockAlerts: AnomalyAlert[] = [
  {
    id: 'ALT-01',
    severity: 'critical',
    title: 'Liquidity Trap Detected',
    description: 'If Reliance Retail Digital (₹1.46 crore) slips from Net-45 to Net-75, you may miss the next payroll cycle by approximately ₹18 lakh.',
    date: '2026-03-16',
  },
  {
    id: 'ALT-02',
    severity: 'high',
    title: 'Spend Drift: Cloud Infrastructure',
    description: 'Cloud and observability spend is running 17% above the trailing 3-month average. Projected overrun: ₹9.5 lakh this month.',
    date: '2026-03-15',
  },
  {
    id: 'ALT-03',
    severity: 'medium',
    title: 'Accounting Methodology Mismatch',
    description: 'You recorded an upfront booking of ₹80 lakh, while accrual recognition is ₹8 lakh/month. Avoid treating collections as profit.',
    date: '2026-03-14',
  },
];

// 5. Mock Revenue Data (Cash vs Accrual)
export const mockRevenueData = [
  { month: 'Jan', cashBookings: 18200000, accrualRevenue: 11800000 },
  { month: 'Feb', cashBookings: 5400000, accrualRevenue: 12400000 },
  { month: 'Mar', cashBookings: 7600000, accrualRevenue: 13100000 },
  { month: 'Apr', cashBookings: 21500000, accrualRevenue: 13900000 },
  { month: 'May', cashBookings: 6800000, accrualRevenue: 14700000 },
  { month: 'Jun', cashBookings: 24800000, accrualRevenue: 15600000 },
];

// 6. Mock Scenario Planning Inputs
export const mockScenarioAssumptions: ScenarioAssumption[] = [
  { id: 'SCN-1', label: 'Monthly New MRR (India)', value: 2200000, type: 'currency' },
  { id: 'SCN-2', label: 'Monthly Churn', value: 3.2, type: 'percent' },
  { id: 'SCN-3', label: 'Planned Hires (Next 2Q)', value: 6, type: 'count' },
  { id: 'SCN-4', label: 'Average Fully Loaded Cost / Hire (India)', value: 185000, type: 'currency' },
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
  roundName: 'Pre-Series A - Proposed',
  preMoney: 720000000,
  raiseAmount: 180000000,
  optionPoolTopUpPct: 3,
  founderOwnershipBeforePct: 80,
  founderOwnershipAfterPct: 64.5,
};

// 8. Mock Compliance Calendar
export const mockComplianceAlerts: ComplianceAlert[] = [
  {
    id: 'CMP-1',
    title: 'Advance Tax (Q4) - FY 2025-26',
    dueDate: '2026-03-15',
    jurisdiction: 'India - Income Tax',
    category: 'tax',
    severity: 'critical',
    description: 'Final installment for advance tax should be reconciled with projected PBT to avoid interest under sections 234B/234C.',
  },
  {
    id: 'CMP-2',
    title: 'GSTR-3B + GSTR-1 Filing',
    dueDate: '2026-04-20',
    jurisdiction: 'India - GST',
    category: 'filing',
    severity: 'urgent',
    description: 'Monthly GST liability and invoice-wise outward supplies must match books and e-invoice records.',
  },
  {
    id: 'CMP-3',
    title: 'TDS Deposit + Payroll Challans',
    dueDate: '2026-04-07',
    jurisdiction: 'India - TDS / Payroll',
    category: 'payroll',
    severity: 'urgent',
    description: 'Deposit monthly TDS and reconcile payroll deductions including EPF and ESIC before due date.',
  },
  {
    id: 'CMP-4',
    title: 'DPIIT Startup Recognition Evidence Review',
    dueDate: '2026-04-15',
    jurisdiction: 'India - DPIIT / MCA',
    category: 'r&d',
    severity: 'upcoming',
    description: 'Tag product engineering payroll and cloud usage with project codes for audit-ready innovation claims.',
  },
];
