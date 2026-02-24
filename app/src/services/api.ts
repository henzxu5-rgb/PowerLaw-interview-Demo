import type {
  Contract,
  Risk,
  Task,
  DashboardStats,
  ContractAnalysisRequest,
  RiskAnalysisResult,
} from '@/types';

// 本地开发用 Vite 代理 /api；线上部署时在 Vercel 等设置 VITE_API_BASE 为后端地址，如 https://xxx.railway.app/api
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries as [string, string][]).toString();
}

// ── Contracts ────────────────────────────────────────────────────────

export interface Annotation {
  id: string;
  contractId: string;
  text: string;
  note: string;
  createdAt: string;
}

export interface TextEdit {
  id: string;
  contractId: string;
  type: 'add' | 'delete';
  text: string;
  position: number;
  createdAt: string;
}

export const contractsApi = {
  list: (params?: { search?: string; status?: string; type?: string }) =>
    request<Contract[]>(`/contracts/${qs(params ?? {})}`),

  get: (id: string) =>
    request<Contract>(`/contracts/${id}`),

  create: (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Contract>('/contracts/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Contract>) =>
    request<Contract>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/contracts/${id}`, { method: 'DELETE' }),
};

// ── Risks ────────────────────────────────────────────────────────────

export const risksApi = {
  list: (params?: { contractId?: string; level?: string; status?: string }) => {
    const query = qs(params ?? {});
    return request<Risk[]>(`/risks/${query}`);
  },

  create: (data: Omit<Risk, 'id' | 'createdAt'>) =>
    request<Risk>('/risks/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Risk>) =>
    request<Risk>(`/risks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/risks/${id}`, { method: 'DELETE' }),
};

// ── Tasks ────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: { status?: string; priority?: string; contractId?: string }) =>
    request<Task[]>(`/tasks/${qs(params ?? {})}`),

  create: (data: Omit<Task, 'id' | 'createdAt'>) =>
    request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

// ── Annotations ──────────────────────────────────────────────────────

export const annotationsApi = {
  list: (contractId: string) =>
    request<Annotation[]>(`/annotations/?contractId=${contractId}`),

  create: (data: Omit<Annotation, 'id' | 'createdAt'>) =>
    request<Annotation>('/annotations/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/annotations/${id}`, { method: 'DELETE' }),
};

// ── TextEdits ────────────────────────────────────────────────────────

export const textEditsApi = {
  list: (contractId: string) =>
    request<TextEdit[]>(`/text-edits/?contractId=${contractId}`),

  create: (data: Omit<TextEdit, 'id' | 'createdAt'>) =>
    request<TextEdit>('/text-edits/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/text-edits/${id}`, { method: 'DELETE' }),
};

// ── Stats ────────────────────────────────────────────────────────────

export const statsApi = {
  dashboard: () => request<DashboardStats>('/stats/dashboard'),
};

// ── AI ───────────────────────────────────────────────────────────────

export const aiApi = {
  analyze: (data: ContractAnalysisRequest) =>
    request<RiskAnalysisResult>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  advice: (data: ContractAnalysisRequest & { riskDescription: string }) =>
    request<{ advice: string }>('/ai/advice', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
