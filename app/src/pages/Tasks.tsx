import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTasks, useContracts } from '@/hooks/useDataStore';
import { toast } from 'sonner';
import type { Task } from '@/types';
import { cn, getPriorityBadgeProps } from '@/lib/utils';


export function Tasks() {
  const { tasks, refresh, create, update, remove } = useTasks();
  const { contracts } = useContracts();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'review' as 'review' | 'approval' | 'sign' | 'archive',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    dueDate: '',
    contractId: '',
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const processingCount = tasks.filter((t) => t.status === 'processing').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');
  const processingTasks = filteredTasks.filter((t) => t.status === 'processing');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const handleCreate = () => {
    create({
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      contractName: contracts.find((c) => c.id === formData.contractId)?.name,
    });
    setFormData({
      title: '',
      description: '',
      type: 'review',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      contractId: '',
    });
    setIsCreateOpen(false);
    toast.success('任务创建成功');
  };

  const handleUpdate = () => {
    if (editingTask) {
      update(editingTask.id, {
        ...formData,
        contractName: contracts.find((c) => c.id === formData.contractId)?.name,
      });
      setEditingTask(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      remove(id);
      toast.success('任务已删除');
    }
  };

  const handleTaskSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      contractId: task.contractId || '',
    });
  };

  const getPriorityBadge = (priority: string) => {
    const props = getPriorityBadgeProps(priority as import('@/types').TaskPriority);
    return <Badge variant={props.variant}>{props.label}</Badge>;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
          <h1 className="text-2xl font-bold text-foreground">任务协同管理</h1>
          <p className="text-muted-foreground mt-1">跨部门任务分配与进度跟踪</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            新建任务
          </Button>
        </div>
      </div>

      {/* Task Stats - hover放大效果 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">任务总数</p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-muted-foreground" />
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
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
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
                  <p className="text-sm text-muted-foreground">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{processingCount}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
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
                  <p className="text-sm text-muted-foreground">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
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
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="processing">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                待处理
                <Badge variant="secondary">{pendingTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无待处理任务</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group",
                        selectedTasks.has(task.id) && "bg-blue-50 hover:bg-blue-100"
                      )}
                    >
                      <button
                        onClick={() => handleTaskSelect(task.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {selectedTasks.has(task.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground group-hover:text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1 flex-wrap">
                          <span className={cn(
                            "font-medium break-words",
                            selectedTasks.has(task.id) ? "text-blue-700" : "text-foreground"
                          )}>{task.title}</span>
                          <span className="flex-shrink-0">{getPriorityBadge(task.priority)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </span>
                          <span
                            className={cn(
                              'flex items-center gap-1 whitespace-nowrap',
                              isOverdue(task.dueDate) && 'text-red-500 font-medium'
                            )}
                          >
                            <Clock className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom" className="z-50">
                          <DropdownMenuItem onClick={() => openEdit(task)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(task.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Processing Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                进行中
                <Badge variant="secondary">{processingTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无进行中任务</p>
                  </div>
                ) : (
                  processingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group",
                        selectedTasks.has(task.id) && "bg-blue-50 hover:bg-blue-100"
                      )}
                    >
                      <button
                        onClick={() => handleTaskSelect(task.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {selectedTasks.has(task.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-blue-300 group-hover:text-blue-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1 flex-wrap">
                          <span className={cn(
                            "font-medium break-words",
                            selectedTasks.has(task.id) ? "text-blue-700" : "text-foreground"
                          )}>{task.title}</span>
                          <span className="flex-shrink-0">{getPriorityBadge(task.priority)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </span>
                          <span
                            className={cn(
                              'flex items-center gap-1 whitespace-nowrap',
                              isOverdue(task.dueDate) && 'text-red-500 font-medium'
                            )}
                          >
                            <Clock className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom" className="z-50">
                          <DropdownMenuItem onClick={() => openEdit(task)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(task.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                已完成
                <Badge variant="secondary">{completedTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Circle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无已完成任务</p>
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-muted-foreground line-through break-words">
                            {task.title}
                          </span>
                          <Badge variant="outline" className="text-muted-foreground flex-shrink-0">
                            已完成
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-through mb-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </span>
                          {task.completedAt && (
                            <span className="whitespace-nowrap">完成于 {new Date(task.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">任务标题</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入任务标题"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">任务描述</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入任务描述"
                className="min-h-[80px] resize-y"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">任务类型</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Task['type']) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">审核</SelectItem>
                    <SelectItem value="approval">审批</SelectItem>
                    <SelectItem value="sign">签署</SelectItem>
                    <SelectItem value="archive">归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">优先级</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">负责人</label>
              <Input
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="请输入负责人姓名"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">截止日期</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">关联合同</label>
              <Select
                value={formData.contractId}
                onValueChange={(value) => setFormData({ ...formData, contractId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择合同（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无</SelectItem>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={!formData.title || !formData.assignee || !formData.dueDate}>
              创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">任务标题</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">任务描述</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[80px] resize-y"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">任务类型</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Task['type']) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">审核</SelectItem>
                    <SelectItem value="approval">审批</SelectItem>
                    <SelectItem value="sign">签署</SelectItem>
                    <SelectItem value="archive">归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">优先级</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">负责人</label>
              <Input
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">截止日期</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              取消
            </Button>
            <Button onClick={handleUpdate}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
