import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ContractStatus, RiskLevel, TaskPriority, RiskStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskLevelBadgeProps(level: RiskLevel) {
  const map: Record<RiskLevel, { label: string; className: string }> = {
    high:   { label: '高风险', className: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: '中风险', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    low:    { label: '低风险', className: 'bg-green-100 text-green-700 border-green-200' },
  }
  return map[level] ?? { label: level, className: '' }
}

export function getContractStatusBadgeProps(status: ContractStatus) {
  const map: Record<ContractStatus, { label: string; className: string }> = {
    active:     { label: '履约中', className: 'bg-green-100 text-green-700 border-green-200' },
    pending:    { label: '待签署', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    draft:      { label: '草稿',   className: 'bg-gray-100 text-gray-700 border-gray-200' },
    completed:  { label: '已完成', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    terminated: { label: '已终止', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  return map[status] ?? { label: status, className: '' }
}

export function getPriorityBadgeProps(priority: TaskPriority) {
  const map: Record<TaskPriority, { label: string; variant: 'destructive' | 'secondary' | 'outline' }> = {
    high:   { label: '高', variant: 'destructive' },
    medium: { label: '中', variant: 'secondary' },
    low:    { label: '低', variant: 'outline' },
  }
  return map[priority] ?? { label: priority, variant: 'outline' as const }
}

export function getRiskStatusBadgeProps(status: RiskStatus) {
  const map: Record<RiskStatus, { label: string; className: string }> = {
    pending:    { label: '待处理', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    processing: { label: '处理中', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    resolved:   { label: '已解决', className: 'bg-green-100 text-green-700 border-green-200' },
  }
  return map[status] ?? { label: status, className: '' }
}
