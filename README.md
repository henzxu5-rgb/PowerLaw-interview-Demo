# MeFlow - 合同履约管理系统

MeFlow 是一套贯通前后端的合同全流程管理系统，覆盖合同录入、AI 风险分析、风险跟踪、任务管理与统计报表。

## 技术架构

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  React 19 + TypeScript + Tailwind + shadcn/ui    │
└────────────────────┬────────────────────────────┘
                     │  HTTP /api/*
┌────────────────────▼────────────────────────────┐
│              FastAPI (Python)                    │
│  SQLAlchemy ORM  ·  Pydantic Schemas             │
│  Kimi API Proxy  ·  REST API                     │
└────────────────────┬────────────────────────────┘
                     │
              ┌──────▼──────┐
              │   SQLite    │
              └─────────────┘
```

### 前端
- **React 19** + TypeScript 5.9
- **Vite 7** 构建 + HMR
- **Tailwind CSS** + **shadcn/ui** 组件库
- **Recharts** 数据可视化
- **Framer Motion** 动画

### 后端
- **Python FastAPI** REST API
- **SQLAlchemy** ORM + **SQLite** 数据库
- **Pydantic** 请求/响应验证
- **httpx** 异步 HTTP 客户端（Kimi API 代理）

### 部署
- **Docker Compose** 一键部署（前端 Nginx + 后端 uvicorn）

## 快速开始

### 开发模式

1. 配置环境变量

```bash
# 在项目根目录创建 .env
KIMI_API_KEY=your_kimi_api_key
```

2. 启动后端

```bash
cd server
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

3. 启动前端

```bash
cd app
npm install
npm run dev
```

前端开发服务器会自动将 `/api` 请求代理到后端 `localhost:8000`。

### Docker 部署

```bash
docker compose up --build
```

访问 `http://localhost` 即可使用。

## API 文档

后端启动后访问 `http://localhost:8000/docs` 可查看 Swagger 交互式 API 文档。

### 主要端点

| 模块 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 合同 | `/api/contracts/` | GET, POST | 列表/创建 |
| 合同 | `/api/contracts/{id}` | GET, PUT, DELETE | 详情/更新/删除 |
| 风险 | `/api/risks/` | GET, POST | 列表/创建 |
| 风险 | `/api/risks/{id}` | PATCH, DELETE | 更新/删除 |
| 任务 | `/api/tasks/` | GET, POST | 列表/创建 |
| 任务 | `/api/tasks/{id}` | PATCH, DELETE | 更新/删除 |
| 批注 | `/api/annotations/` | GET, POST | 列表/创建 |
| 统计 | `/api/stats/dashboard` | GET | 仪表盘聚合数据 |
| AI | `/api/ai/analyze` | POST | AI 合同风险分析 |
| AI | `/api/ai/advice` | POST | AI 修改建议 |

## 项目结构

```
MeFlow/
├── app/                          # 前端 React 应用
│   ├── src/
│   │   ├── pages/               # 页面组件
│   │   ├── components/ui/       # shadcn/ui 组件
│   │   ├── hooks/               # 自定义 Hooks (API 调用)
│   │   ├── services/            # API 客户端 + AI 服务
│   │   ├── types/               # TypeScript 类型定义
│   │   └── lib/                 # 工具函数
│   ├── vite.config.ts
│   └── package.json
├── server/                       # 后端 FastAPI 应用
│   ├── main.py                  # 应用入口 + CORS + 中间件
│   ├── database.py              # 数据库连接
│   ├── models.py                # SQLAlchemy ORM 模型
│   ├── schemas.py               # Pydantic 模型
│   ├── seed.py                  # 种子数据
│   ├── routers/                 # API 路由
│   │   ├── contracts.py
│   │   ├── risks.py
│   │   ├── tasks.py
│   │   ├── annotations.py
│   │   ├── stats.py
│   │   └── ai.py
│   └── services/
│       └── kimi_service.py      # Kimi API 代理
├── docker-compose.yml
├── nginx.conf
└── .env
```

## 设计决策

- **SQLite**：零配置、单文件数据库，适合 Demo 和中小规模场景，Docker 部署通过 volume 持久化
- **API Key 后端代理**：Kimi API Key 仅存于后端 `.env`，前端不接触任何密钥
- **Hooks 接口不变**：前端 hooks 保持与页面组件相同的调用接口，内部从 localStorage 切换为 REST API，页面组件无需修改
- **级联删除**：删除合同时自动清理关联的风险、任务、批注数据
