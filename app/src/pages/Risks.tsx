import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Circle,
  Send,
  Edit3,
  User,
  Building2,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRisks, useContracts } from '@/hooks/useDataStore';
import { toast } from 'sonner';
import type { Risk, Contract, Department } from '@/types';
import { DEPARTMENTS } from '@/types';
import { cn, getRiskLevelBadgeProps } from '@/lib/utils';


export function Risks() {
  const { risks, refresh, update } = useRisks();
  const { contracts } = useContracts();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [assigningRisk, setAssigningRisk] = useState<Risk | null>(null);
  const [viewingRiskContract, setViewingRiskContract] = useState<Contract | null>(null);
  const [highlightedClause, setHighlightedClause] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [assignForm, setAssignForm] = useState({
    assignedTo: '',
    assignedDepartment: '',
    comment: '',
  });

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      risk.contractName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || risk.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalRisks = risks.length;
  const highRisks = risks.filter((r) => r.level === 'high').length;
  const pendingRisks = risks.filter((r) => r.status !== 'resolved').length;
  const resolvedRisks = risks.filter((r) => r.status === 'resolved').length;

  const handleResolve = (riskId: string) => {
    update(riskId, { status: 'resolved' });
    toast.success('风险已标记为已解决');
  };

  const handleAssign = () => {
    if (assigningRisk) {
      update(assigningRisk.id, {
        assignedTo: assignForm.assignedTo,
        assignedDepartment: assignForm.assignedDepartment as Department,
        status: 'processing',
      });
      setAssigningRisk(null);
      setAssignForm({ assignedTo: '', assignedDepartment: '', comment: '' });
      toast.success('风险已分配');
    }
  };

  const handleViewRiskContract = (risk: Risk) => {
    const contract = contracts.find(c => c.id === risk.contractId);
    if (contract) {
      setViewingRiskContract(contract);
      setHighlightedClause(risk.clause || '');
    }
  };

  useEffect(() => {
    if (viewingRiskContract && highlightedClause) {
      const timer = setTimeout(() => {
        const el = document.getElementById('risk-clause-highlight');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [viewingRiskContract, highlightedClause]);

  const highlightClauseInContent = (content: string, clause: string): React.ReactNode => {
    if (!clause || !content) return content;
    const index = content.indexOf(clause);
    if (index === -1) return content;
    const before = content.substring(0, index);
    const match = content.substring(index, index + clause.length);
    const after = content.substring(index + clause.length);
    return (
      <>
        {before}
        <mark id="risk-clause-highlight" className="bg-yellow-200 px-0.5 rounded">{match}</mark>
        {after}
      </>
    );
  };

  const getLevelBadge = (level: string) => {
    const props = getRiskLevelBadgeProps(level as import('@/types').RiskLevel);
    return <Badge className={props.className}>{props.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      legal: '法律风险',
      financial: '财务风险',
      operational: '运营风险',
      compliance: '合规风险',
    };
    return labels[type] || type;
  };

  const getDepartmentLabel = (dept?: string) => {
    const d = DEPARTMENTS.find((d) => d.value === dept);
    return d?.label || dept;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">风险智能识别</h1>
          <p className="text-muted-foreground mt-1">AI驱动的合同风险扫描与预警</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          刷新
        </Button>
      </div>

      {/* Risk Stats - hover放大效果 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">风险总数</p>
                  <p className="text-2xl font-bold">{totalRisks}</p>
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">高风险</p>
                  <p className="text-2xl font-bold text-red-600">{highRisks}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待处理</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingRisks}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已解决</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedRisks}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索合同或风险描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="风险等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部等级</SelectItem>
                <SelectItem value="high">高风险</SelectItem>
                <SelectItem value="medium">中风险</SelectItem>
                <SelectItem value="low">低风险</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Circle className="w-4 h-4 mr-2" />
                <SelectValue placeholder="处理状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="resolved">已解决</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无风险数据</p>
          </div>
        ) : (
          filteredRisks.map((risk, index) => (
            <motion.div
              key={risk.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'hover:shadow-md transition-shadow cursor-pointer',
                  risk.level === 'high' && 'border-red-200',
                  risk.level === 'medium' && 'border-amber-200',
                  risk.level === 'low' && 'border-green-200'
                )}
                onClick={() => setSelectedRisk(risk)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        risk.level === 'high' && 'bg-red-100',
                        risk.level === 'medium' && 'bg-amber-100',
                        risk.level === 'low' && 'bg-green-100'
                      )}
                    >
                      <AlertTriangle
                        className={cn(
                          'w-5 h-5',
                          risk.level === 'high' && 'text-red-600',
                          risk.level === 'medium' && 'text-amber-600',
                          risk.level === 'low' && 'text-green-600'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getLevelBadge(risk.level)}
                        <Badge variant="outline">{getTypeLabel(risk.type)}</Badge>
                        <span className="text-sm text-muted-foreground">{risk.contractName}</span>
                      </div>
                      <p className="text-foreground mb-2">{risk.description}</p>
                      <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        建议: {risk.suggestion}
                      </p>
                      {risk.assignedTo && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {risk.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {getDepartmentLabel(risk.assignedDepartment)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {risk.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssigningRisk(risk);
                          }}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          分配
                        </Button>
                      )}
                      {risk.status !== 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(risk.id);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          解决
                        </Button>
                      )}
                      {risk.status === 'resolved' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          已解决
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Risk Detail Dialog */}
      <Dialog open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>风险详情</DialogTitle>
          </DialogHeader>
          {selectedRisk && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                {getLevelBadge(selectedRisk.level)}
                <Badge variant="outline">{getTypeLabel(selectedRisk.type)}</Badge>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">所属合同</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{selectedRisk.contractName}</p>
                  <Button size="sm" variant="outline" onClick={() => handleViewRiskContract(selectedRisk)}>
                    <Eye className="w-4 h-4 mr-1" />
                    查看合同全文
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">风险描述</p>
                <p className="text-foreground">{selectedRisk.description}</p>
              </div>

              {selectedRisk.clause && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">相关条款</p>
                  <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <p className="text-sm text-foreground italic">"{selectedRisk.clause}"</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">处理建议</p>
                <p className="text-foreground bg-blue-50 p-3 rounded-lg">{selectedRisk.suggestion}</p>
              </div>

              {selectedRisk.assignedTo && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">处理人：</span>
                    <span>{selectedRisk.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">部门：</span>
                    <span>{getDepartmentLabel(selectedRisk.assignedDepartment)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>
                  <span>创建时间：</span>
                  <span>{new Date(selectedRisk.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedRisk.resolvedAt && (
                  <div>
                    <span>解决时间：</span>
                    <span>{new Date(selectedRisk.resolvedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={!!assigningRisk} onOpenChange={() => setAssigningRisk(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>分配风险处理</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">处理人</label>
              <Input
                value={assignForm.assignedTo}
                onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
                placeholder="请输入处理人姓名"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">责任部门</label>
              <Select
                value={assignForm.assignedDepartment}
                onValueChange={(value) => setAssignForm({ ...assignForm, assignedDepartment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">备注</label>
              <Textarea
                value={assignForm.comment}
                onChange={(e) => setAssignForm({ ...assignForm, comment: e.target.value })}
                placeholder="请输入备注信息"
                className="min-h-[80px] resize-y"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssigningRisk(null)}>
              取消
            </Button>
            <Button onClick={handleAssign} disabled={!assignForm.assignedTo || !assignForm.assignedDepartment}>
              <Send className="w-4 h-4 mr-2" />
              确认分配
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Risk Contract View Dialog */}
      <Dialog open={!!viewingRiskContract} onOpenChange={() => { setViewingRiskContract(null); setHighlightedClause(''); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {viewingRiskContract && (
            <>
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{viewingRiskContract.name}</h3>
                    <p className="text-sm text-muted-foreground">{viewingRiskContract.type}</p>
                  </div>
                </div>
                {highlightedClause && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    已定位到风险条款
                  </Badge>
                )}
              </div>
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                {viewingRiskContract.content ? (
                  <div 
                    ref={contentRef}
                    className="p-6 bg-muted/50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground"
                  >
                    {highlightClauseInContent(viewingRiskContract.content, highlightedClause)}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无合同内容</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
