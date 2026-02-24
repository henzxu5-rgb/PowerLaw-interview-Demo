# MeFlow智能合同履约监控与风险预警系统 - 技术规范

## 一、组件清单

### shadcn/ui 组件
| 组件名称 | 用途 | 安装命令 |
|----------|------|----------|
| Button | 按钮交互 | npx shadcn add button |
| Card | 卡片容器 | npx shadcn add card |
| Input | 输入框 | npx shadcn add input |
| Select | 下拉选择 | npx shadcn add select |
| Tabs | 标签切换 | npx shadcn add tabs |
| Badge | 状态标签 | npx shadcn add badge |
| Avatar | 用户头像 | npx shadcn add avatar |
| Dialog | 弹窗 | npx shadcn add dialog |
| DropdownMenu | 下拉菜单 | npx shadcn add dropdown-menu |
| Table | 数据表格 | npx shadcn add table |
| Progress | 进度条 | npx shadcn add progress |
| Alert | 警告提示 | npx shadcn add alert |
| Tooltip | 提示工具 | npx shadcn add tooltip |
| Skeleton | 骨架屏 | npx shadcn add skeleton |
| Separator | 分隔线 | npx shadcn add separator |

### 自定义组件
| 组件名称 | 用途 | 位置 |
|----------|------|------|
| StatCard | 统计卡片 | app/components/StatCard.tsx |
| RiskBadge | 风险等级标签 | app/components/RiskBadge.tsx |
| ContractProgress | 合同进度条 | app/components/ContractProgress.tsx |
| RiskAlertCard | 风险预警卡片 | app/components/RiskAlertCard.tsx |
| TaskItem | 任务项 | app/components/TaskItem.tsx |
| AnimatedNumber | 数字动画 | app/components/AnimatedNumber.tsx |
| PageTransition | 页面过渡 | app/components/PageTransition.tsx |

## 二、动画实现方案

| 动画效果 | 实现库 | 实现方式 | 复杂度 |
|----------|--------|----------|--------|
| 页面加载骨架屏 | CSS | 自定义CSS动画 | 低 |
| 数字滚动动画 | Framer Motion | useSpring + useInView | 中 |
| 卡片hover效果 | Tailwind CSS | hover:transform + transition | 低 |
| 页面切换过渡 | Framer Motion | AnimatePresence + motion.div | 中 |
| 滚动触发显示 | Framer Motion | useInView + variants | 中 |
| 图表动画 | Recharts | 内置动画配置 | 低 |
| 列表项依次显示 | Framer Motion | staggerChildren | 中 |
| 进度条动画 | Framer Motion | animate prop | 低 |

## 三、项目文件结构

```
my-app/
├── app/
│   ├── components/           # 公共组件
│   │   ├── StatCard.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── ContractProgress.tsx
│   │   ├── RiskAlertCard.tsx
│   │   ├── TaskItem.tsx
│   │   ├── AnimatedNumber.tsx
│   │   ├── PageTransition.tsx
│   │   └── Navbar.tsx
│   ├── dashboard/            # 首页仪表盘
│   │   └── page.tsx
│   ├── contracts/            # 合同履约跟踪
│   │   └── page.tsx
│   ├── risks/                # 风险预警中心
│   │   └── page.tsx
│   ├── reports/              # 智能分析报告
│   │   └── page.tsx
│   ├── tasks/                # 履约任务管理
│   │   └── page.tsx
│   ├── thinking/             # 我的思考
│   │   └── page.tsx
│   ├── lib/                  # 工具函数
│   │   ├── utils.ts
│   │   └── mockData.ts
│   ├── hooks/                # 自定义hooks
│   │   └── useAnimatedNumber.ts
│   ├── types/                # TypeScript类型
│   │   └── index.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                   # shadcn组件
├── public/
│   └── images/               # 图片资源
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 四、依赖安装

### 核心依赖
```bash
# 动画库
npm install framer-motion

# 图表库
npm install recharts

# 图标库
npm install lucide-react

# 日期处理
npm install date-fns
```

### shadcn组件安装
```bash
npx shadcn add button card input select tabs badge avatar dialog dropdown-menu table progress alert tooltip skeleton separator
```

## 五、路由结构

| 路由 | 页面 | 描述 |
|------|------|------|
| / | 首页仪表盘 | 履约概览、风险预警 |
| /contracts | 合同履约跟踪 | 合同列表、状态跟踪 |
| /risks | 风险预警中心 | 风险识别、处理建议 |
| /reports | 智能分析报告 | 数据分析、趋势预测 |
| /tasks | 履约任务管理 | 任务列表、提醒管理 |
| /thinking | 我的思考 | 产品思考、能力展示 |

## 六、数据结构

### 合同数据
```typescript
interface Contract {
  id: string;
  name: string;
  type: string;
  counterparty: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  progress: number;
  riskLevel: 'high' | 'medium' | 'low' | 'none';
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  description: string;
}
```

### 风险数据
```typescript
interface Risk {
  id: string;
  title: string;
  description: string;
  level: 'high' | 'medium' | 'low';
  contractId: string;
  contractName: string;
  identifiedAt: string;
  aiAnalysis: string;
  suggestion: string;
  status: 'open' | 'processing' | 'resolved' | 'ignored';
}
```

### 任务数据
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  contractId: string;
  contractName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  assignee: string;
}
```

## 七、颜色配置

### Tailwind配置扩展
```typescript
// tailwind.config.ts
colors: {
  brand: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  risk: {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981',
    none: '#6B7280',
  }
}
```

## 八、性能优化策略

1. **组件懒加载**：使用dynamic import
2. **图片优化**：使用next/image
3. **动画性能**：使用transform和opacity
4. **数据缓存**：使用React.memo和useMemo
5. **代码分割**：按路由分割代码

## 九、开发顺序

1. 项目初始化 + 依赖安装
2. 全局样式 + 布局组件
3. 导航栏组件
4. 首页仪表盘
5. 合同履约跟踪
6. 风险预警中心
7. 智能分析报告
8. 履约任务管理
9. 我的思考
10. 动画优化
11. 响应式适配
12. 测试部署
