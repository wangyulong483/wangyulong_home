## 需求

1. AI 对话（雷电将军）实现前后端分离
2. FastAPI 后端统一管理 system prompt、知识库、DeepSeek API 调用
3. 移除本地 Ollama 模式，统一使用 DeepSeek API
4. 后端通过 Cloudflare Tunnel 部署到公网
5. 优化项目管理：消除重复代码、统一配置、清晰分层

## 方案

### 一、架构变更

```
当前架构（混乱）：
  ChatTab.vue ─┬─ Ollama localhost (本地模式)
               └─ _worker.js → DeepSeek API (公网模式)

目标架构（清晰）：
  ChatTab.vue ──► Cloudflare Tunnel ──► FastAPI ──► DeepSeek API
       ↑                                    │
       └── GET /shrine-data/*               ├── system_prompt (唯一来源)
           GET /topics-data/*                ├── knowledge_base (唯一来源)
                                             └── 日志 / 错误处理
```

### 二、FastAPI 后端改造

**目录结构**：
```
backend/
├── main.py                    # FastAPI 入口 + CORS + 路由注册
├── config.py                  # pydantic-settings 环境变量管理
├── app/
│   ├── api/
│   │   └── chat.py            # POST /api/chat 对话接口
│   ├── core/
│   │   ├── deepseek_client.py # DeepSeek API 异步客户端（含重试）
│   │   ├── knowledge.py       # 知识库检索
│   │   └── system_prompt.py   # 系统提示词（唯一来源）
│   └── models/
│       └── chat.py            # Pydantic 请求/响应模型
├── requirements.txt           # 依赖（已存在，补充）
└── .env.example               # 环境变量模板
```

**核心 API**：
- `POST /api/chat` — 接收 `{ messages: [{role, content}] }`，注入 system prompt + 知识库，调用 DeepSeek v4 Flash，返回 `{ role: "assistant", content: "..." }`
- `GET /api/health` — 健康检查

**技术细节**：
- httpx.AsyncClient 连接池复用
- SSE 流式响应（可选，第一版先返回完整响应）
- 指数退避重试（3 次，1s/2s/4s）
- `[CHAT]` 前缀结构化日志
- system prompt 和知识库从 `_worker.js` 迁移（删除 3 处重复）

### 三、前端简化

**ChatTab.vue 改动**：
- 删除 Ollama 相关代码（`isLocal`、`model`、`models`、`fetchModels`、`sendLocal`）
- 删除内嵌的 `systemPrompt`（迁移到后端）
- 统一调用 `/api/chat`（配置 API base URL）
- 模式提示改为固定文案「DeepSeek V4 Flash」
- 保留：对话界面、欢迎语、加载动画、消息气泡 UI

**_worker.js 改动**：
- 删除 `/api/chat` 路由处理（API 请求直接穿透到后端 Tunnel）
- 删除 SYSTEM_PROMPT 和 KNOWLEDGE 常量（~200 行）
- 保留静态资源服务

**_redirects 改动**：
- 确认 `/api/*` 规则存在，API 请求到达 Worker 后 fall through 到 Tunnel（需要确认 Pages 配置）

### 四、Cloudflare Tunnel 部署

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Cloudflare  │────▶│  Cloudflare  │────▶│  FastAPI      │
│  Pages       │     │  Tunnel      │     │  localhost:   │
│  (前端)      │     │  (代理 /api) │     │  8000         │
└─────────────┘     └──────────────┘     └───────────────┘
       │                                        │
       └─ 静态资源                               └─ DeepSeek API
          shrine-data/*                             api.deepseek.com
          topics-data/*
```

**步骤**：
1. 安装 `cloudflared`：`winget install cloudflare.cloudflared`（Windows 上 cloudflared 需以服务形式运行）
2. 创建 Tunnel：`cloudflared tunnel create vue-blog-api`
3. 配置 DNS：`cloudflared tunnel route dns vue-blog-api api.wangyulong.top`
4. 写 `~/.cloudflared/config.yml`：
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /root/.cloudflared/<ID>.json
   ingress:
     - hostname: api.wangyulong.top
       service: http://localhost:8000
     - service: http_status:404
   ```
5. 安装为系统服务：`cloudflared service install`
6. 验证：`curl https://api.wangyulong.top/api/health`

**域名**：需要确认是否有可用域名。如果没有或不想用自定义域名，可以：
- Cloudflare Tunnel 免费提供 `*.cfargotunnel.com` 域名
- 或使用已有的 `wangyulong.top` 子域名

### 五、前端 API 地址配置

在 `vite.config.js` 中配置代理（开发环境）：
```js
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8000'  // 开发时代理到本地 FastAPI
  }
}
```

生产环境前端通过 Tunnel 域名调用后端：
- `https://api.wangyulong.top/api/chat`

### 六、实施步骤

| 步骤 | 内容 | 预计改动 |
|------|------|----------|
| 1 | 重构 `backend/`：项目结构 + system_prompt + knowledge + chat API | `backend/` 全部文件 |
| 2 | 简化 `ChatTab.vue`：删除 Ollama 逻辑、统一 API 调用 | `ChatTab.vue` |
| 3 | 清理 `_worker.js`：删除 `/api/chat`、prompt、knowledge | `_worker.js` |
| 4 | 更新 `vite.config.js`：添加开发代理 | `vite.config.js` |
| 5 | 本地联调：前后端一起启动，验证对话功能 | - |
| 6 | 构建验证：`npm run build` | - |
| 7 | Cloudflare Tunnel 部署：安装 cloudflared、创建 Tunnel | - |
| 8 | 生产环境验证 + 提交 git | - |

===============================================================
