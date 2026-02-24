export type Page = 'dashboard' | 'contracts' | 'risks' | 'tasks' | 'reports' | 'thinking';

export type ContractStatus = 'draft' | 'pending' | 'active' | 'completed' | 'terminated';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskType = 'legal' | 'financial' | 'operational' | 'compliance';
export type RiskStatus = 'pending' | 'processing' | 'resolved';
export type TaskType = 'review' | 'approval' | 'sign' | 'archive';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'processing' | 'completed';
export type Department = 'legal' | 'finance' | 'business' | 'tech' | 'admin';

export interface Contract {
  id: string;
  name: string;
  type: string;
  party: string;
  amount: number;
  signedDate: string;
  expiryDate: string;
  status: ContractStatus;
  content: string;
  aiAnalyzed?: boolean;
  riskLevel?: RiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  contractId: string;
  contractName: string;
  type: RiskType;
  level: RiskLevel;
  description: string;
  suggestion: string;
  clause?: string;
  clausePosition?: { start: number; end: number };
  status: RiskStatus;
  assignedTo?: string;
  assignedDepartment?: Department;
  createdAt: string;
  resolvedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  contractId?: string;
  contractName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalContracts: number;
  pendingTasks: number;
  highRisks: number;
  completionRate: number;
}

export interface ContractAnalysisRequest {
  contractName: string;
  contractType: string;
  content: string;
}

export interface RiskAnalysisResult {
  overallRisk: RiskLevel;
  confidence: number;
  thinking: string[];
  risks: Array<{
    type: RiskType;
    level: RiskLevel;
    description: string;
    suggestion: string;
    clause?: string;
    clausePosition?: { start: number; end: number };
  }>;
}

export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'legal', label: '法务部' },
  { value: 'finance', label: '财务部' },
  { value: 'business', label: '业务部' },
  { value: 'tech', label: '技术部' },
  { value: 'admin', label: '行政部' },
];
