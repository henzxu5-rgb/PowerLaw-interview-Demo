import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Eye, Edit, Trash2, Plus, Search, X, Maximize2, Minimize2, 
  MessageSquare, AlertTriangle, FileText, Sparkles, Brain,
  CheckCircle2, Loader2, Save, ShieldCheck, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useContracts, useContract, useRisks, useAnnotations } from '@/hooks/useDataStore';
import { analyzeContractRisk } from '@/services/kimiApi';
import { risksApi, contractsApi } from '@/services/api';
import { toast } from 'sonner';
import { getContractStatusBadgeProps, getRiskLevelBadgeProps } from '@/lib/utils';
import type { Contract, ContractStatus, RiskAnalysisResult, RiskLevel } from '@/types';

const StatusBadge = ({ status }: { status: string }) => {
  const props = getContractStatusBadgeProps(status as ContractStatus);
  return <Badge className={props.className}>{props.label}</Badge>;
};

const RiskLevelBadge = ({ level }: { level: string }) => {
  const props = getRiskLevelBadgeProps(level as RiskLevel);
  return <Badge className={props.className}>{props.label}</Badge>;
};

// 合同查看器组件
interface ContractViewerProps {
  contractId: string;
  onClose: () => void;
}

const ContractViewer = ({ contractId, onClose }: ContractViewerProps) => {
  const { contract } = useContract(contractId);
  const { risks } = useRisks(contractId);
  const { annotations, create: createAnnotation, remove: deleteAnnotation } = useAnnotations(contractId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // 处理文本选择
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  }, []);

  // 添加批注
  const handleAddAnnotation = () => {
    if (selectedText && annotationNote.trim()) {
      createAnnotation({
        id: Date.now().toString(),
        contractId,
        text: selectedText,
        note: annotationNote.trim(),
        createdAt: new Date().toISOString(),
      });
      setAnnotationNote('');
      setShowAnnotationDialog(false);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    }
  };

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!contract) return null;

  const contentClass = isFullscreen 
    ? 'sm:max-w-none max-w-none w-screen h-screen rounded-none top-0 left-0 translate-x-0 translate-y-0' 
    : 'w-[90vw] sm:max-w-6xl h-[85vh]';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${contentClass} overflow-hidden flex flex-col`} showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl font-semibold">{contract.name}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? '退出全屏' : '全屏'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                合同全文
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                风险 ({risks.length})
              </TabsTrigger>
              <TabsTrigger value="annotations" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                批注 ({annotations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 overflow-auto mt-4">
              <div className="flex gap-4 h-full min-h-0">
                {/* 合同内容区域 */}
                <div className="flex-1 min-w-0 bg-muted/50 rounded-lg p-6 overflow-auto">
                  <div 
                    ref={contentRef}
                    onMouseUp={handleTextSelection}
                    className="bg-card rounded-lg p-8 shadow-sm"
                  >
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground">{contract.content}</pre>
                  </div>
                  
                  {/* 选中文字后的批注按钮 */}
                  {selectedText && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-card shadow-lg rounded-lg p-3 flex items-center gap-3 border">
                      <span className="text-sm text-muted-foreground max-w-xs truncate">
                        已选择: &quot;{selectedText.substring(0, 30)}{selectedText.length > 30 ? '...' : ''}&quot;
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => setShowAnnotationDialog(true)}
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        添加批注
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedText('');
                          window.getSelection()?.removeAllRanges();
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  )}
                </div>

                {/* 右侧信息栏 */}
                <div className="w-72 flex-shrink-0 space-y-4 overflow-auto">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-3">合同信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">合同类型</span>
                        <span>{contract.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">签约方</span>
                        <span>{contract.party}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">合同金额</span>
                        <span>¥{contract.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">签署日期</span>
                        <span>{contract.signedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">到期日期</span>
                        <span>{contract.expiryDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">状态</span>
                        <StatusBadge status={contract.status} />
                      </div>
                    </div>
                  </div>

                  {/* 最新风险 */}
                  {risks.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3">最新风险</h4>
                      <div className="space-y-2">
                        {risks.slice(0, 3).map(risk => (
                          <div key={risk.id} className="bg-card rounded p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{risk.type}</span>
                              <RiskLevelBadge level={risk.level} />
                            </div>
                            <p className="text-muted-foreground text-xs line-clamp-2">{risk.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                {risks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>暂无风险记录</p>
                  </div>
                ) : (
                  risks.map(risk => (
                    <div key={risk.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{risk.type}</h4>
                        <div className="flex items-center gap-2">
                          <RiskLevelBadge level={risk.level} />
                          <span className="text-sm text-muted-foreground">{new Date(risk.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-foreground">{risk.description}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="annotations" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                {annotations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>暂无批注</p>
                    <p className="text-sm mt-2">在合同全文中选中文本即可添加批注</p>
                  </div>
                ) : (
                  annotations.map(annotation => (
                    <div key={annotation.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(annotation.createdAt).toLocaleString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteAnnotation(annotation.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-2">
                        <p className="text-sm text-foreground italic">&quot;{annotation.text}&quot;</p>
                      </div>
                      <p className="text-foreground">{annotation.note}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 批注对话框 */}
        <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加批注</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <p className="text-sm text-foreground italic">&quot;{selectedText}&quot;</p>
              </div>
              <Textarea
                placeholder="请输入批注内容..."
                value={annotationNote}
                onChange={(e) => setAnnotationNote(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAnnotationDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleAddAnnotation} disabled={!annotationNote.trim()}>
                  保存批注
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

// 合同表单组件
interface ContractFormProps {
  contract?: Contract;
  onSubmit: (contract: Contract) => void;
  onCancel: () => void;
}

const ContractForm = ({ contract, onSubmit, onCancel }: ContractFormProps) => {
  const [formData, setFormData] = useState<Partial<Contract>>(
    contract || {
      status: 'pending',
      content: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    onSubmit({
      id: contract?.id || Date.now().toString(),
      name: formData.name || '',
      type: formData.type || '',
      party: formData.party || '',
      amount: formData.amount || 0,
      signedDate: formData.signedDate || '',
      expiryDate: formData.expiryDate || '',
      status: (formData.status as Contract['status']) || 'pending',
      content: formData.content || '',
      createdAt: contract?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">合同名称</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入合同名称"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">合同类型</label>
          <Input
            value={formData.type || ''}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="如：采购合同、服务合同"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">签约方</label>
          <Input
            value={formData.party || ''}
            onChange={(e) => setFormData({ ...formData, party: e.target.value })}
            placeholder="请输入签约方名称"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">合同金额</label>
          <Input
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            placeholder="请输入合同金额"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">签署日期</label>
          <Input
            type="date"
            value={formData.signedDate || ''}
            onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">到期日期</label>
          <Input
            type="date"
            value={formData.expiryDate || ''}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">合同内容</label>
        <Textarea
          value={formData.content || ''}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="请输入合同全文内容"
          rows={10}
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {contract ? '保存修改' : '创建合同'}
        </Button>
      </div>
    </form>
  );
};

// AI 分析弹窗组件
interface AIAnalysisDialogProps {
  contract: Contract;
  onClose: () => void;
  onSaved: () => void;
}

const AIAnalysisDialog = ({ contract, onClose, onSaved }: AIAnalysisDialogProps) => {
  const [phase, setPhase] = useState<'analyzing' | 'done' | 'error'>('analyzing');
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [displayedSteps, setDisplayedSteps] = useState<string[]>([]);
  const [result, setResult] = useState<RiskAnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await analyzeContractRisk({
          contractName: contract.name,
          contractType: contract.type,
          content: contract.content || '',
        });
        if (cancelled) return;
        setThinkingSteps(res.thinking);
        setResult(res);
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, [contract]);

  useEffect(() => {
    if (thinkingSteps.length === 0) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < thinkingSteps.length) {
        setDisplayedSteps(prev => [...prev, thinkingSteps[i]]);
        i++;
      } else {
        clearInterval(timer);
        setPhase('done');
      }
    }, 600);
    return () => clearInterval(timer);
  }, [thinkingSteps]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [displayedSteps, phase]);

  const handleSave = async () => {
    if (!result) return;
    for (let idx = 0; idx < result.risks.length; idx++) {
      const r = result.risks[idx];
      await risksApi.create({
        contractId: contract.id,
        contractName: contract.name,
        type: r.type,
        level: r.level,
        description: r.description,
        suggestion: r.suggestion,
        clause: r.clause,
        clausePosition: r.clausePosition,
        status: 'pending',
      });
    }
    await contractsApi.update(contract.id, {
      aiAnalyzed: true,
      riskLevel: result.overallRisk,
    });
    setSaved(true);
    onSaved();
    toast.success(`已识别 ${result.risks.length} 个风险并保存`);
  };

  const levelColor: Record<RiskLevel, string> = {
    high: 'text-red-600',
    medium: 'text-amber-600',
    low: 'text-green-600',
  };

  const levelBg: Record<RiskLevel, string> = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-green-50 border-green-200',
  };

  const levelLabel: Record<RiskLevel, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  };

  const typeLabel: Record<string, string> = {
    legal: '法律风险',
    financial: '财务风险',
    operational: '运营风险',
    compliance: '合规风险',
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            AI 智能合同审查
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="text-sm text-muted-foreground px-1 pt-2">
          正在审查: <span className="font-medium text-foreground">{contract.name}</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
          {/* Thinking Chain */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-violet-500" />
              AI 推理过程
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <AnimatePresence>
                {displayedSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{step}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {phase === 'analyzing' && (
                <div className="flex items-center gap-2 text-sm text-violet-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>分析中...</span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {phase === 'done' && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Overall Risk */}
              <div className={`rounded-lg border p-4 ${levelBg[result.overallRisk]}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${levelColor[result.overallRisk]}`} />
                    <span className="font-medium">综合风险评级</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${levelColor[result.overallRisk]} border`}>
                      {levelLabel[result.overallRisk]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      置信度 {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk List */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  识别到 {result.risks.length} 个风险点
                </div>
                {result.risks.map((risk, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-lg border p-4 ${levelBg[risk.level]}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={levelColor[risk.level]}>
                        {levelLabel[risk.level]}
                      </Badge>
                      <Badge variant="outline">{typeLabel[risk.type] || risk.type}</Badge>
                    </div>
                    <p className="text-sm text-foreground mb-2">{risk.description}</p>
                    {risk.clause && (
                      <div className="bg-white/60 border-l-4 border-amber-400 p-2 mb-2 rounded-r">
                        <p className="text-xs text-muted-foreground italic">"{risk.clause}"</p>
                      </div>
                    )}
                    <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      建议: {risk.suggestion}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>关闭</Button>
                <Button
                  onClick={handleSave}
                  disabled={saved}
                  className="gap-2"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      已保存
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      保存风险记录
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {phase === 'error' && (
            <div className="text-center py-8 text-red-500">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
              <p>分析过程中发生错误，请稍后重试</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// 主页面组件
const Contracts = () => {
  const { contracts, loading, create, update, remove, refresh } = useContracts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContractId, setViewingContractId] = useState<string | null>(null);
  const [analyzingContract, setAnalyzingContract] = useState<Contract | null>(null);

  const contractTypes = [...new Set(contracts.map(c => c.type))];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === '' || 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // 处理创建/编辑
  const handleSubmit = (contract: Contract) => {
    if (editingContract) {
      update(contract);
    } else {
      create(contract);
    }
    setShowForm(false);
    setEditingContract(null);
  };

  // 处理删除
  const handleDelete = (id: string) => {
    if (confirm('确定要删除此合同吗？')) {
      remove(id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="rounded-lg border bg-card">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-[25%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[12%]" />
                <Skeleton className="h-4 w-[10%]" />
                <Skeleton className="h-4 w-[8%]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">合同管理</h1>
          <p className="text-muted-foreground mt-1">管理所有合同，跟踪履约情况</p>
        </div>
        <Button onClick={() => { setEditingContract(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          新增合同
        </Button>
      </div>

      {/* 搜索与筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索合同名称、签约方或类型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="合同状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">履约中</SelectItem>
                <SelectItem value="pending">待签署</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="terminated">已终止</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="合同类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {contractTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 合同列表 */}
      <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[22%]">合同名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[10%]">类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[14%]">签约方</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[12%]">金额</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[16%]">有效期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[8%]">状态</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-[18%]">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  暂无合同数据
                </td>
              </tr>
            ) : (
              filteredContracts.map(contract => (
                <tr key={contract.id} className="hover:bg-accent">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{contract.name}</span>
                      {contract.aiAnalyzed && (
                        <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs gap-1 whitespace-nowrap flex-shrink-0">
                          <Sparkles className="w-3 h-3" />
                          AI已审查
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{contract.type}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{contract.party}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    ¥{contract.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm whitespace-nowrap">
                    {contract.signedDate} ~ {contract.expiryDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAnalyzingContract(contract)}
                        title="AI 智能审查"
                        className="relative"
                      >
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        {contract.aiAnalyzed && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingContractId(contract.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingContract(contract); setShowForm(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(contract.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 合同表单对话框 */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingContract ? '编辑合同' : '新增合同'}</DialogTitle>
          </DialogHeader>
          <ContractForm
            contract={editingContract || undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingContract(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* 合同查看器 */}
      {viewingContractId && (
        <ContractViewer
          contractId={viewingContractId}
          onClose={() => setViewingContractId(null)}
        />
      )}

      {/* AI 分析弹窗 */}
      {analyzingContract && (
        <AIAnalysisDialog
          contract={analyzingContract}
          onClose={() => setAnalyzingContract(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};

export default Contracts;
