import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContracts, useRisks, useTasks, useStats } from '@/hooks/useDataStore';
import { toast } from 'sonner';

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#ec4899'];

export function Reports() {
  const { contracts, refresh: refreshContracts } = useContracts();
  const { risks, refresh: refreshRisks } = useRisks();
  const { tasks, refresh: refreshTasks } = useTasks();
  const { stats, refresh: refreshStats } = useStats();

  const refreshAll = () => {
    refreshContracts();
    refreshRisks();
    refreshTasks();
    refreshStats();
  };

  const handleExportReport = () => {
    const reportData = {
      exportTime: new Date().toISOString(),
      summary: {
        totalContracts: contracts.length,
        totalAmount: contracts.reduce((sum, c) => sum + c.amount, 0),
        pendingRisks: risks.filter((r) => r.status !== 'resolved').length,
        completionRate: stats.completionRate,
      },
      contracts: contracts.map(c => ({
        name: c.name, type: c.type, party: c.party, amount: c.amount,
        status: c.status, riskLevel: c.riskLevel || '未分析',
        signedDate: c.signedDate, expiryDate: c.expiryDate,
      })),
      risks: risks.map(r => ({
        contractName: r.contractName, type: r.type, level: r.level,
        description: r.description, status: r.status,
      })),
      tasks: tasks.map(t => ({
        title: t.title, assignee: t.assignee, priority: t.priority,
        status: t.status, dueDate: t.dueDate,
      })),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `合同履约报表_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('报表导出成功');
  };

  const handleExportCSV = () => {
    const statusLabel = (s: string) =>
      s === 'active' ? '履约中' : s === 'pending' ? '待签署' : s === 'completed' ? '已完成' : '草稿';
    const riskLabel = (r?: string) =>
      r === 'high' ? '高' : r === 'medium' ? '中' : r === 'low' ? '低' : '未分析';
    const headers = ['合同名称', '合同类型', '合作方', '金额', '状态', '风险等级', '签署日期', '到期日期'];
    const rows = contracts.map(c => [
      c.name, c.type, c.party, c.amount, statusLabel(c.status),
      riskLabel(c.riskLevel), c.signedDate, c.expiryDate,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `合同列表_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV导出成功');
  };

  const typeDistData = useMemo(() => {
    const dist: Record<string, number> = {};
    contracts.forEach(c => { dist[c.type] = (dist[c.type] || 0) + 1; });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [contracts]);

  const statusDistData = useMemo(() => {
    const labelMap: Record<string, string> = { active: '履约中', pending: '待签署', completed: '已完成', draft: '草稿', terminated: '已终止' };
    const dist: Record<string, number> = {};
    contracts.forEach(c => {
      const label = labelMap[c.status] || c.status;
      dist[label] = (dist[label] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [contracts]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    contracts.forEach(c => {
      if (c.signedDate) {
        const ym = c.signedDate.substring(0, 7);
        months[ym] = (months[ym] || 0) + c.amount;
      }
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: month.replace(/^\d{4}-/, '').replace(/^0/, '') + '月',
        amount: Math.round(amount / 10000),
        raw: amount,
      }));
  }, [contracts]);

  const riskLevelData = useMemo(() => [
    { name: '高风险', value: risks.filter(r => r.level === 'high').length, fill: '#ef4444' },
    { name: '中风险', value: risks.filter(r => r.level === 'medium').length, fill: '#f59e0b' },
    { name: '低风险', value: risks.filter(r => r.level === 'low').length, fill: '#22c55e' },
  ], [risks]);

  const riskTypeData = useMemo(() => {
    const labels: Record<string, string> = { legal: '法律风险', financial: '财务风险', operational: '运营风险', compliance: '合规风险' };
    return Object.entries(labels).map(([key, name]) => ({
      name,
      count: risks.filter(r => r.type === key).length,
    }));
  }, [risks]);

  const taskStatusData = useMemo(() => [
    { name: '待处理', value: tasks.filter(t => t.status === 'pending').length, fill: '#f59e0b' },
    { name: '进行中', value: tasks.filter(t => t.status === 'processing').length, fill: '#6366f1' },
    { name: '已完成', value: tasks.filter(t => t.status === 'completed').length, fill: '#22c55e' },
  ], [tasks]);

  const taskPriorityData = useMemo(() => [
    { name: '高优先级', count: tasks.filter(t => t.priority === 'high').length, fill: '#ef4444' },
    { name: '中优先级', count: tasks.filter(t => t.priority === 'medium').length, fill: '#f59e0b' },
    { name: '低优先级', count: tasks.filter(t => t.priority === 'low').length, fill: '#22c55e' },
  ], [tasks]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">数据分析报告</h1>
          <p className="text-muted-foreground mt-1">合同履约数据的多维度分析</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} className="gap-2">
            <RefreshCw className="w-4 h-4" /> 刷新
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> 导出CSV
          </Button>
          <Button size="sm" onClick={handleExportReport} className="gap-2">
            <Download className="w-4 h-4" /> 导出报表
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '合同总金额', value: `¥${contracts.reduce((s, c) => s + c.amount, 0).toLocaleString()}`, icon: FileText, bg: 'bg-blue-100', fg: 'text-blue-600' },
          { label: '平均合同金额', value: `¥${contracts.length > 0 ? Math.round(contracts.reduce((s, c) => s + c.amount, 0) / contracts.length).toLocaleString() : 0}`, icon: TrendingUp, bg: 'bg-green-100', fg: 'text-green-600' },
          { label: '待处理风险', value: risks.filter(r => r.status !== 'resolved').length.toString(), icon: AlertTriangle, bg: 'bg-red-100', fg: 'text-red-600', valueClass: 'text-red-600' },
          { label: '任务完成率', value: `${stats.completionRate}%`, icon: CheckSquare, bg: 'bg-amber-100', fg: 'text-amber-600', valueClass: 'text-green-600' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.valueClass || ''}`}>{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-6 h-6 ${card.fg}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="contracts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="contracts">合同分析</TabsTrigger>
          <TabsTrigger value="risks">风险分析</TabsTrigger>
          <TabsTrigger value="tasks">任务分析</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">合同类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={typeDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {typeDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">合同状态分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={statusDistData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="数量" radius={[4, 4, 0, 0]}>
                      {statusDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">月度合同金额趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">暂无数据</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis unit="万" />
                    <Tooltip formatter={(value: number) => [`¥${value}万`, '金额']} />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#colorAmount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">风险等级分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={riskLevelData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                      {riskLevelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">风险类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={riskTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" name="数量" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">任务状态分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                      {taskStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">任务优先级分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={taskPriorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="数量" radius={[4, 4, 0, 0]}>
                      {taskPriorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
