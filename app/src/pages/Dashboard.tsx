import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  Edit2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useContracts, useRisks, useTasks, useStats } from '@/hooks/useDataStore';
import type { Page, Contract } from '@/types';
import { cn, getContractStatusBadgeProps, getRiskLevelBadgeProps, getPriorityBadgeProps } from '@/lib/utils';

interface DashboardProps {
  onPageChange: (page: Page) => void;
}


export function Dashboard({ onPageChange }: DashboardProps) {
  const { contracts, refresh: refreshContracts } = useContracts();
  const { risks, refresh: refreshRisks } = useRisks();
  const { tasks, refresh: refreshTasks, update: updateTask } = useTasks();
  const { stats, refresh: refreshStats } = useStats();
  
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshContracts();
      refreshRisks();
      refreshTasks();
      refreshStats();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshContracts, refreshRisks, refreshTasks, refreshStats]);

  const handleTaskSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleRiskSelect = (riskId: string) => {
    const newSelected = new Set(selectedRisks);
    if (newSelected.has(riskId)) {
      newSelected.delete(riskId);
    } else {
      newSelected.add(riskId);
    }
    setSelectedRisks(newSelected);
  };

  const handleTaskComplete = (taskId: string) => {
    updateTask(taskId, { status: 'completed' });
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  const thisMonthNew = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return contracts.filter(c => c.createdAt && c.createdAt.startsWith(ym)).length;
  }, [contracts]);

  const todayDueTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === today && t.status !== 'completed').length;
  }, [tasks]);

  const recentContracts = contracts.slice(0, 5);
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 5);
  const highRisks = risks.filter((r) => r.level === 'high' && r.status !== 'resolved').slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">首页仪表盘</h1>
        <p className="text-muted-foreground mt-1">实时掌握合同履约全貌</p>
      </div>

      {/* Stats Cards - hover放大效果 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer" onClick={() => onPageChange('contracts')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">合同总数</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.totalContracts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>本月新增 {thisMonthNew} 份</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer" onClick={() => onPageChange('tasks')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待办任务</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.pendingTasks}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                <span>今日截止 {todayDueTasks} 项</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer" onClick={() => onPageChange('risks')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">高风险合同</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.highRisks}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-600">
                <span>需立即关注</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">任务完成率</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Contracts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">最近合同</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => onPageChange('contracts')}>
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">合同名称</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">合作方</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">金额</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">状态</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">风险</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map((contract) => (
                    <tr 
                      key={contract.id} 
                      className="border-b border-border hover:bg-accent cursor-pointer" 
                      onClick={() => setViewingContract(contract)}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap">{contract.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{contract.party}</td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">¥{contract.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {(() => {
                          const p = getContractStatusBadgeProps(contract.status);
                          return <Badge className={cn('text-xs', p.className)}>{p.label}</Badge>;
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        {contract.riskLevel ? (() => {
                          const p = getRiskLevelBadgeProps(contract.riskLevel!);
                          return <Badge className={cn('text-xs', p.className)}>{p.label}</Badge>;
                        })() : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">待办任务</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => onPageChange('tasks')}>
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无待办任务</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors",
                        selectedTasks.has(task.id) && "bg-blue-50 hover:bg-blue-100"
                      )}
                    >
                      <button
                        onClick={() => handleTaskSelect(task.id)}
                        className="flex-shrink-0"
                      >
                        {selectedTasks.has(task.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium", selectedTasks.has(task.id) && "text-blue-700")}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>截止: {task.dueDate}</span>
                          {(() => {
                            const p = getPriorityBadgeProps(task.priority);
                            return <Badge variant={p.variant} className="text-xs">{p.label}</Badge>;
                          })()}
                        </div>
                      </div>
                      {selectedTasks.has(task.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskComplete(task.id)}
                        >
                          完成
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* High Risks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">高风险预警</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => onPageChange('risks')}>
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {highRisks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无高风险</p>
                  </div>
                ) : (
                  highRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors",
                        selectedRisks.has(risk.id) && "bg-red-50 hover:bg-red-100"
                      )}
                    >
                      <button
                        onClick={() => handleRiskSelect(risk.id)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {selectedRisks.has(risk.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-red-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <p className="font-medium">{risk.contractName}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                        <p className="text-xs text-blue-600 mt-1">建议: {risk.suggestion.substring(0, 50)}...</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 合同详情对话框 */}
      <Dialog open={!!viewingContract} onOpenChange={() => setViewingContract(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-lg">{viewingContract?.name}</span>
                <p className="text-sm text-muted-foreground font-normal">{viewingContract?.type}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {viewingContract && (
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">合作方</p>
                  <p className="font-medium">{viewingContract.party}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">合同金额</p>
                  <p className="font-medium">¥{viewingContract.amount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">签署日期</p>
                  <p className="font-medium">{viewingContract.signedDate}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">到期日期</p>
                  <p className="font-medium">{viewingContract.expiryDate}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">合同状态</p>
                  <div className="mt-1">
                    {(() => {
                      const p = getContractStatusBadgeProps(viewingContract.status);
                      return <Badge className={p.className}>{p.label}</Badge>;
                    })()}
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">风险等级</p>
                  <div className="mt-1">
                    {viewingContract.riskLevel ? (() => {
                      const p = getRiskLevelBadgeProps(viewingContract.riskLevel!);
                      return <Badge className={p.className}>{p.label}</Badge>;
                    })() : (
                      <span className="text-muted-foreground">未分析</span>
                    )}
                  </div>
                </div>
              </div>
              
              {viewingContract.aiAnalyzed && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    已完成AI风险分析
                  </p>
                </div>
              )}
              
              {viewingContract.content && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">合同内容</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => onPageChange('contracts')}
                    >
                      <Edit2 className="w-3 h-3" />
                      去编辑
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg max-h-[300px] overflow-y-auto">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{viewingContract.content}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
