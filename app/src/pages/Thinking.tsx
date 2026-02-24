import { motion } from 'framer-motion';
import {
  Lightbulb, Target, Zap, Users, Brain, Rocket,
  Code, ShieldCheck, BarChart3, Sparkles, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Thinking() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Demo 思路</h1>
        <p className="text-muted-foreground mt-1">MeFlow 合同履约监控系统的设计理念与技术实现</p>
      </div>

      {/* Core Value */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">核心价值主张</h3>
                <p className="text-muted-foreground leading-relaxed">
                  MeFlow 致力于解决企业合同管理中的核心痛点：合同分散难追踪、履约节点易遗漏、风险识别靠经验、跨部门协作效率低。
                  通过 AI 驱动的智能分析，实现合同全生命周期的数字化管理，让合同管理从"人找事"变为"事找人"。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Alignment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              与幂律智能产品的对标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              本 Demo 的功能设计直接映射幂律智能的核心产品能力，展示我对产品方向的理解：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  product: 'MeCheck',
                  demo: 'AI 智能审查',
                  desc: '基于 LLM 的合同条款自动风险识别，展示思考链推理过程，生成结构化风险报告',
                  cardBg: 'bg-violet-50/50',
                  badgeCls: 'bg-violet-100 text-violet-700',
                },
                {
                  product: 'MeFlow',
                  demo: '履约全流程管理',
                  desc: '合同 CRUD、任务看板、风险分配与跟踪、批注协作、报表导出等全链路覆盖',
                  cardBg: 'bg-blue-50/50',
                  badgeCls: 'bg-blue-100 text-blue-700',
                },
                {
                  product: 'PowerLawGLM',
                  demo: 'Kimi API 集成',
                  desc: '接入大语言模型，实现法律文本理解、风险要素抽取、修改建议生成等 NLP 能力',
                  cardBg: 'bg-green-50/50',
                  badgeCls: 'bg-green-100 text-green-700',
                },
              ].map((item) => (
                <div key={item.product} className={`rounded-lg border p-4 ${item.cardBg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={item.badgeCls}>{item.product}</Badge>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.demo}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Technical Highlights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              技术亮点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Brain,
                  title: 'AI 审查闭环',
                  desc: '从合同文本输入到 LLM 分析、思考链可视化、风险结构化输出、一键入库的完整产品闭环',
                  iconBg: 'bg-violet-100',
                  iconFg: 'text-violet-600',
                },
                {
                  icon: ShieldCheck,
                  title: '风险条款定位',
                  desc: '自动高亮合同中的风险条款位置，点击即可滚动到关键段落，辅助人工复核',
                  iconBg: 'bg-red-100',
                  iconFg: 'text-red-600',
                },
                {
                  icon: BarChart3,
                  title: '数据可视化看板',
                  desc: '基于 Recharts 的多维度数据图表（趋势图、饼图、柱状图），所有数据均动态计算',
                  iconBg: 'bg-blue-100',
                  iconFg: 'text-blue-600',
                },
                {
                  icon: Zap,
                  title: '优雅的降级策略',
                  desc: 'API 调用失败时自动降级为本地模拟分析，保证 Demo 在离线环境下仍可完整演示',
                  iconBg: 'bg-amber-100',
                  iconFg: 'text-amber-600',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-9 h-9 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.iconFg}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: Brain,
            title: '智能风险识别',
            desc: '基于 LLM 自动扫描合同条款，识别法律、财务、运营等多维度风险，并提供专业的修改建议',
            iconBg: 'bg-violet-100',
            iconFg: 'text-violet-600',
          },
          {
            icon: Zap,
            title: '履约自动提醒',
            desc: '自动提取合同关键节点（付款、交付、续约等），生成履约计划，到期前主动预警',
            iconBg: 'bg-green-100',
            iconFg: 'text-green-600',
          },
          {
            icon: Users,
            title: '跨部门协作',
            desc: '打通法务、财务、业务等部门，实现任务分配、进度跟踪、结果反馈的闭环管理',
            iconBg: 'bg-amber-100',
            iconFg: 'text-amber-600',
          },
          {
            icon: Code,
            title: 'Vibe Coding 实践',
            desc: '基于 Cursor + AI 辅助的方式快速构建，展示现代前端开发的高效实践与工具链运用',
            iconBg: 'bg-purple-100',
            iconFg: 'text-purple-600',
          },
          {
            icon: Rocket,
            title: '快速迭代能力',
            desc: '通过组件化设计和模块化数据管理，实现功能的快速迭代和扩展',
            iconBg: 'bg-red-100',
            iconFg: 'text-red-600',
          },
          {
            icon: Target,
            title: '数据驱动决策',
            desc: '提供多维度的数据分析报表，帮助管理者实时掌握合同履约全貌',
            iconBg: 'bg-cyan-100',
            iconFg: 'text-cyan-600',
          },
        ].map((item) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full">
              <CardHeader>
                <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.iconFg}`} />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">技术栈</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                'React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui',
                'Framer Motion', 'Recharts', 'Kimi API (LLM)', 'Lucide Icons', 'localStorage',
              ].map((tech) => (
                <span key={tech} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Future Roadmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">未来规划</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                '接入幂律 PowerLawGLM 法律垂直大模型，提升法律场景专业性',
                '支持合同智能起草与模板库，覆盖合同全生命周期',
                '增加合同版本比对与变更追踪功能',
                '支持多租户和 RBAC 权限管理',
                '接入企业微信/钉钉等 IM 工具的消息推送',
                '构建法律知识图谱，实现关联案例检索',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
