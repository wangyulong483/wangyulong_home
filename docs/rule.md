# 工作规范

## 基本流程

1. **用户提需求** → AI 使用 EXA MCP 搜集方案
2. **AI 写方案** → 写入 `docs/todo.md` 的 `======` 分隔线之间，包含"需求"和"方案"两部分
3. **用户审核** → 用户阅读方案，提出修改意见，AI 完善方案
4. **用户确认** → 用户说"按方案执行"或类似指令
5. **AI 执行** → 按方案的步骤逐一实现，完成后构建验证

## docs/todo.md 格式

```
## 需求
<用户的需求描述，分点列出>

## 方案
<技术方案、架构设计、实施步骤>

===============================================================
```

`======` 是每条 todo 的分隔线。

## 执行原则

- 方案需用户确认后才可执行代码修改
- 涉及文件操作前先确认当前状态
- 修改完成后必须构建验证（`npm run build`）
- 完成每一步后提交 git（有意义的中文 commit message）
- 使用 EXA MCP 搜索最新技术方案，不凭记忆猜测
- **UI / 样式变更**：先用 `askuser` 确认方案再动手，避免反复修改
- **小改动免方案**：图标修正、数据更新（如 BV 号）、样式微调等简单修改可跳过 `docs/todo.md` 流程直接执行
- **本地部署免提交**：只想部署不想提交 git 时，直接用 `npm run build && npx wrangler pages deploy frontend/dist --branch=main`（从项目根目录运行），跳过 `deploy.sh` 的 git 步骤

## 技术约束

- 前端：Vue 3 + Vite，`<script setup>` 语法
- 后端：FastAPI（Python）
- 部署：Cloudflare Pages（前端）+ 待定（后端）
- 代码风格：
  - 前端：简洁、有中文注释、适合 Vue3 初学者理解
  - 后端（Python）：禁用 emoji，日志用 `[TAG]` 格式（如 `[OK]`、`[WARN]`、`[FETCH]`），保持严肃专业

## Cloudflare Pages 部署

### 部署架构

项目使用双通道部署，两者会竞速：

| 通道 | 触发方式 | 说明 |
|------|---------|------|
| **Git 集成** | push → main 自动触发 | Cloudflare 从仓库拉取代码，运行构建命令，部署输出目录 |
| **Wrangler 直传** | GitHub Actions `deploy.yml` | `wrangler pages deploy frontend/dist --branch=main` |

**关键点**：
- Git 集成需要仓库**根目录**有 `package.json` 和可运行的 `build` 脚本
- Git 集成在 Cloudflare 仪表盘配置构建命令和输出目录，不在代码仓库中
- 如果 Git 集成构建失败，Cloudflare 会**回退到上一次成功部署**，导致 wrangler 部署被覆盖
- 因此必须确保 Git 集成构建成功，或禁用它仅用 wrangler

### 部署命令

```bash
# ✅ 正确 — 从项目根目录 vue_blog/ 运行
cd vue_blog
npx wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main

# ❌ 错误 — 从 frontend/ 里运行，路径变成 frontend/frontend/dist
cd frontend
npx wrangler pages deploy dist --project-name=wangyulong-home --branch=main
```

- `--branch=main` **必须加**：CI 环境（GitHub Actions）中 git 处于 detached HEAD 状态，不加此标志会部署到 `HEAD` 环境而非生产环境 → 网站不会更新
- 本地部署用 `npm run deploy -- "提交信息"`（从项目根目录运行）
- wrangler OAuth 登录过期时运行 `npx wrangler login` 重新认证

### GitHub Actions 部署注意事项

1. `wrangler-action@v3` 的 `workingDirectory` 默认为仓库根目录，`command` 中的路径相对于根目录
2. `npm run build` 的 `working-directory: frontend`，产物在 `frontend/dist/`
3. 根目录 `package.json` 的 `build` 脚本通过 `npm --prefix frontend` 委托到前端
4. `_redirects` 文件放在 `frontend/public/`（Vite 自动复制到 `dist/`），Cloudflare 解析后处理 SPA 路由

### SPA + 静态 JSON 共存

Cloudflare Pages 开启 SPA 模式后，所有未匹配静态文件的路由都会返回 `index.html`。要同时提供静态 JSON 文件：

1. 在 `frontend/public/_redirects` 中添加：
   ```
   /topics-data/* /topics-data/:splat 200
   /* /index.html 200
   ```
   第一条规则优先匹配，让 `/topics-data/` 下的文件直接返回

2. Vue 组件做兜底：检测 `Content-Type: text/html` 时使用内嵌数据

### 前端数据目录

- 数据文件：`frontend/public/topics-data/`（Vite 自动复制到 `dist/topics-data/`）
- 今天的热点：`topics-data/hot-topics.json`
- 历史归档：`topics-data/archive/YYYY-MM-DD.json`
- 归档索引：`topics-data/archive/index.json`
- 注意：不要用 `/data/` 路径，可能与 Cloudflare 内置路由冲突
