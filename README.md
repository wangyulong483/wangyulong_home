# MY_WEBSITE

个人博客网站，基于 Vue 3 + Vite 构建，Cloudflare Pages 部署，FastAPI 后端提供 AI 对话服务。

## 架构

```
Cloudflare Pages (前端) ─── Cloudflare Tunnel ─── FastAPI (后端) ─── DeepSeek API
       │                                                    │
       └─ 静态资源 (shrine-data/*, topics-data/*)             └─ 角色扮演 system prompt
                                                              └─ 知识库检索
```

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | Vue 3.5 (Composition API + `<script setup>`) |
| 构建工具 | Vite 8 |
| 路由 | Vue Router 5 (懒加载) |
| Markdown | marked |
| 后端 | FastAPI (Python) |
| AI 模型 | DeepSeek V4 Flash |
| 部署 | Cloudflare Pages + Wrangler |
| 图标 | game-icon-pack (100+ SVG 图标) |
| 定时任务 | GitHub Actions (每日热点抓取) |

## 项目结构

```
vue_blog/
├── frontend/                     # 前端项目
│   ├── src/
│   │   ├── main.js               # 入口：创建 Vue 应用 → 路由 → 挂载
│   │   ├── App.vue               # 根组件：SVG 滤镜 + 粒子背景 + 侧边栏布局
│   │   ├── router/index.js       # 路由配置（8 条路由）
│   │   ├── components/           # 通用组件
│   │   │   ├── AppIcon.vue       # SVG 图标组件
│   │   │   ├── Sidebar.vue       # 侧边导航栏（桌面固定 / 移动端滑出）
│   │   │   ├── Carousel.vue      # 图片轮播（自动播放 + 触摸滑动）
│   │   │   ├── ParticleBackground.vue  # Canvas 粒子连线背景
│   │   │   └── shrine/           # 雷电将军应援页子组件
│   │   │       ├── RaidenHero.vue      # 角色立绘 + 信息 + 生日贺图轮播
│   │   │       ├── GalleryTab.vue      # B站视频画廊（API 拉取封面/播放量）
│   │   │       ├── WikiTab.vue         # 攻略 Wiki 卡片
│   │   │       ├── NewsTab.vue         # 资讯动态列表
│   │   │       ├── ChatTab.vue         # AI 对话 — "与影对话"
│   │   │       └── ElectroParticles.vue # 雷晶粒子浮动背景
│   │   └── views/                # 页面视图
│   │       ├── Home.vue          # 首页
│   │       ├── About.vue         # 关于 — 项目视频展示 + B站弹窗播放
│   │       ├── AppList.vue       # 应用列表
│   │       ├── Game.vue          # 飞机大战 (Canvas 射击游戏)
│   │       ├── HotTopics.vue     # 行业热点 — 分类/搜索/日期归档
│   │       ├── Shrine.vue        # 雷电将军应援页（主容器）
│   │       ├── Birthday.vue      # 生日庆祝页（月亮/蛋糕/气球/彩纸）
│   │       └── BirthdayList.vue  # 生日列表
│   ├── public/
│   │   ├── game-icon-pack-main/  # SVG 图标库
│   │   ├── image/                # 图片资源
│   │   ├── video/                # 视频资源
│   │   ├── shrine-data/          # 雷电将军应援数据 (JSON + 图片)
│   │   ├── topics-data/          # 行业热点数据 (GitHub Actions 生成)
│   │   └── _redirects            # Cloudflare Pages SPA + 静态 JSON 路由
│   ├── _worker.js                # Cloudflare Pages 边缘 Worker
│   ├── vite.config.js            # Vite 配置（代理 /api → FastAPI）
│   └── package.json
├── backend/                      # 后端项目
│   ├── main.py                   # FastAPI 入口 + CORS + 路由
│   └── requirements.txt
├── scripts/                      # 辅助脚本
│   └── fetch_topics.py           # 每日热点抓取脚本
├── .github/workflows/            # CI/CD
│   ├── deploy.yml                # 自动部署到 Cloudflare Pages
│   └── daily-topics.yml          # 每日抓取行业热点
├── package.json                  # 根构建脚本（委托到 frontend/）
├── rule.md                       # 项目工作规范
└── todo.md                       # 待办事项 + 方案记录
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | HELLO WORLD 头部 + 图片轮播 + 格言 + 学习平台链接 |
| `/about` | 关于 | 项目视频展示（B站嵌入），点击缩略图弹窗播放 |
| `/applist` | 应用 | 飞机大战 / 行业热点 / 厨厨 入口 |
| `/game` | 飞机大战 | Canvas 射击游戏 "保卫安建大"，WASD 移动 J 射击 |
| `/hot-topics` | 行业热点 | 机器人 · AI 每日动态，分类筛选 + 搜索 + 日期归档 |
| `/shrine` | 厨厨 | 雷电将军角色应援页（画廊 / Wiki / 资讯 / AI 对话） |
| `/birthday` | 生日 | 邵远熙生日庆祝页（月亮/蛋糕/气球/彩纸动画） |
| `/birthdaylist` | 生日列表 | 猫视频 + 寿星链接 |

## 设计系统

全局 CSS 变量定义在 `App.vue` 中，两种玻璃容器：

- **玻璃卡片 `.glass-card`**：半透明背景 + 毛玻璃模糊 + 悬停抬起
- **液态玻璃 `.liquid-glass`**：加强版毛玻璃，含 SVG 噪声纹理 + 对角线光扫动画

支持移动端适配（768px / 480px 断点），含安全区、触摸优化、性能降级。

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev        # 启动开发服务器 → http://localhost:5173
```

### 后端 (可选，用于 AI 对话功能)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # 启动 API 服务 → http://localhost:8000
```

开发时 Vite 自动将 `/api` 请求代理到 `http://localhost:8000`。

### 构建

```bash
# 仅构建前端
cd frontend && npm run build

# 从根目录构建（供 Cloudflare Pages 使用）
npm run build
```

## 部署

项目通过双通道部署到 Cloudflare Pages：

| 通道 | 触发方式 | 说明 |
|------|---------|------|
| Git 集成 | push → main | Cloudflare 自动拉取、构建、部署 |
| Wrangler 直传 | GitHub Actions | `wrangler pages deploy frontend/dist --branch=main` |

### 本地部署

```bash
# 方式1：使用部署脚本（含 git 提交）
cd frontend && bash deploy.sh "提交信息"

# 方式2：跳过 git，直接部署
npm run build && npx wrangler pages deploy frontend/dist --branch=main
```

## 数据流

### 行业热点

```
GitHub Actions (daily 定时) → fetch_topics.py → RSS/API 抓取
  → frontend/public/topics-data/hot-topics.json
  → Cloudflare Pages 静态托管
```

支持日期归档浏览，`/topics-data/archive/YYYY-MM-DD.json`。

### AI 对话

```
ChatTab.vue → POST /api/chat → Cloudflare Tunnel → FastAPI → DeepSeek API
                                                    │
                                                    ├── system prompt (雷电将军角色)
                                                    └── 知识库检索 (角色设定/剧情)
```

### SPA + 静态 JSON 共存

`_redirects` 配置让 Cloudflare Pages 优先匹配静态 JSON 文件，其余走 SPA 路由回退。Vue 组件内置 `Content-Type: text/html` 检测，SPA fallback 时使用内嵌兜底数据。

## 相关文档

- [工作规范](rule.md) — 项目开发流程与技术约定
- [待办事项](todo.md) — 需求记录与方案存档
