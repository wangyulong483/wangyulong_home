# 归去来兮 · WYL Home

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![DeepSeek Harness](https://img.shields.io/badge/built%20with-DeepSeek%20Harness-b69cff)](https://github.com/deepseek-ai)

个人主页、机器人实践记录与交互应用集合。站点以 **Vue 3 + Vite** 构建为单页应用，由 **Cloudflare Pages** 托管；生产 API 运行在 Pages Worker 中，角色对话接入 DeepSeek，并支持 SSE 流式输出。

- 线上站点：<https://wangyulong-home.pages.dev/>
- 应用入口：<https://wangyulong-home.pages.dev/applist>
- 源码仓库：<https://github.com/wangyulong483/wangyulong_home>

> 本项目的主要开发与迭代在 **DeepSeek Harness** 的 Agent 工作流中完成（不是 Claude Code）。本 README、`docs/rule.md` 与 `docs/todo.md` 共同描述当前仓库的真实结构和协作方式。

---

## 目录

- [功能模块](#功能模块)
- [设计语言](#设计语言)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [可用脚本](#可用脚本)
- [环境变量与 Secrets](#环境变量与-secrets)
- [部署](#部署)
- [测试](#测试)
- [API 概览](#api-概览)
- [与影对谈](#与影对谈)
- [PGM 地图区域绘制器](#pgm-地图区域绘制器)
- [数据自动化](#数据自动化)
- [贡献指南](#贡献指南)
- [第三方声明与许可](#第三方声明与许可)

---

## 功能模块

| 路由 | 模块 | 能力 | 主要代码 |
|------|------|------|----------|
| `/` | 首页 | 视频开场、滚动叙事、旅途同行者角色档案、构成主义校园海报、世界索引、项目入口 | `frontend/src/pages/Home.vue`、`frontend/src/features/home/` |
| `/about` | 项目档案 | 机器人与视觉项目视频画廊、弹窗播放 | `frontend/src/pages/About.vue` |
| `/applist` | 应用列表 | 统一管理游戏、热点、地图工具、厨厨与对话模块 | `frontend/src/pages/AppList.vue` |
| `/blog` | 个人博客文章 | 简洁文章页骨架，暂无正文；右上 GitHub 图标入口（@wangyulong483） | `frontend/src/pages/Blog.vue` |
| `/game` | 飞机大战 | Canvas 射击游戏，支持键盘与移动端触控 | `frontend/src/pages/Game.vue` |
| `/hot-topics` | 行业热点 | 合肥、安徽及国内机器人 / AI 动态，支持搜索、分类与日期归档 | `frontend/src/pages/HotTopics.vue`、`frontend/public/topics-data/` |
| `/map-zone-painter` | 地图区域绘制器 | 编辑 PGM 地图并导出 ROS2 Nav2 禁行区 / 限速区掩码 | `frontend/src/pages/MapZonePainter.vue`、`frontend/src/features/map-zone-painter/` |
| `/shrine` | ？！厨厨！？ | 雷电将军角色档案、影像、攻略 / Wiki、资讯 | `frontend/src/pages/Shrine.vue`、`frontend/src/features/shrine/` |
| `/dialogue` | 与影对谈 | 独立 AI 对话模块：真实对话时间轴 + ZZZ 式终端 HUD + 构成主义档案画框 + 流式输出 + 生成参数 | `frontend/src/pages/Dialogue.vue`、`frontend/src/features/dialogue/` |

---

## 设计语言

站点骨架来自 **《绝区零》式高对比工业终端**：深色底、细边框、网格、等宽状态标签、切角与硬偏移投影，强调“可扫描、可操作”的档案感。当前版本以这套骨架为主视觉，只把 **苏联至上主义 / 构成主义** 当作档案注脚：几何块面、纸张与印刷色出现在画框、标签和局部色带中，而不是取代 ZZZ 的深色 HUD 与角色影像。

- **三色系统**：薰衣草紫（`#b69cff` / `#c7b5ff` / `#4c1d95`）承接 ZZZ 的角色色，正红（`#e01b2e`）负责冲突与动势，暗金（`#d8b25a` / `#f0cf7a`）负责索引与印刷感；酸性黄（`#eaff57`）只做 HUD 信号色，米白（`#ece4d3`）只作纸面与信息底板。
- **几何解构**：方块、正圆、三角形、斜切色带与粗直线切割；对角线构图；避免写实透视。几何只做局部注脚，不铺满全屏。
- **硬边质感**：大面积平涂、无柔和渐变、无软阴影；只用 1px 硬脊线、硬偏移投影和纸张噪点。
- **页面差异化**：每个页面保留原有功能与信息结构。首页偏“角色档案 + 海报”，厨厨页偏沉浸式资料库，地图工具偏工业工作台，对话页偏纸面编辑台；统一的是配色、字体、边框和动势语言，而不是把所有页面做成同一张海报。
- **交互**：滚动触发、卡片抬升、对角线强调、自定义光标；在 `prefers-reduced-motion` 下收敛动效。

### 字体

| 角色 | 字体 | 用途 |
|------|------|------|
| 展示 / 品牌 | **Smiley Sans Oblique（得意黑）** | 页面主标题、模块名、数字编号、品牌字 |
| 对话正文 | **Zhi Mang Xing（志莽行书）** | “与影对谈”的提问与回答正文，秀丽笔 / 行书质感 |
| 界面正文 | **Geist Variable** | 导航、说明、按钮、长文本 |
| 数据与代码 | **Geist Mono Variable** | UID、日期、参数、状态、代码 |

字体在 `frontend/src/main.js` 中一次引入，角色由 `frontend/src/app/App.vue` 的 `--font-display`、`--font-hand`、`--font-body`、`--font-mono` 统一管理。三款字体均允许网页嵌入，许可证见 [第三方声明与许可](#第三方声明与许可)。

---

## 技术栈

| 范围 | 技术 |
|------|------|
| 前端 | Vue 3.5、Composition API、`<script setup>` |
| 路由 | Vue Router 5、路由级懒加载 |
| 动效与内容 | GSAP + ScrollTrigger、marked、Canvas、SVG |
| 构建 | Vite 8、Node.js 22+ |
| 生产 API | Cloudflare Pages Worker（`frontend/_worker.js`） |
| AI | DeepSeek V4.1 Flash 1017（API 模型标识 `deepseek-flash`，角色对话开启思考链；失败回退 `deepseek-v4-flash` / `deepseek-chat`） |
| 搜索 | Brave Search API（角色聊天按需检索现实世界近况） |
| 模型工具 | GitHub 只读结构化档案（genshin-db、Chat-Haruhi-Suzumiya 角色卡） |
| 本地示例 API | FastAPI、Uvicorn |
| 自动化 | GitHub Actions、Python 3.12 |
| 部署 | Cloudflare Pages、Wrangler 4 |
| 开发协作 | **DeepSeek Harness** |

---

## 系统架构

```text
浏览器
  |
  +-- Vue 3 SPA
  |     +-- 路由级页面与按需加载模块
  |     +-- public/ 静态图片、视频、JSON 数据
  |     `-- localStorage 会话状态
  |
  `-- /api/*
        `-- Cloudflare Pages Worker
              +-- /api/topics              行业热点与归档
              +-- /api/shrine/*            厨厨索引与知识检索
              `-- /api/chat                DeepSeek 角色对话（SSE 流式）

GitHub Actions
  +-- 定时刷新 topics-data/
  `-- 定时刷新 shrine-data/index.json
```

Worker 会优先读取 GitHub `main` 分支中的最新数据，并在回源不可用时回退到 Pages 静态资源。`DEEPSEEK_API_KEY` 只保存在 Cloudflare Secret 中。

---

## 项目结构

```text
vue_blog/
|-- frontend/
|   |-- src/
|   |   |-- app/                         # 应用壳、全局设计令牌、路由
|   |   |-- pages/                       # 路由级页面（薄壳）
|   |   |-- features/
|   |   |   |-- home/                    # 首页主视觉、滚动过渡、角色档案
|   |   |   |-- dialogue/                # 与影对谈：时间轴、纸面线程、流式客户端
|   |   |   |-- map-zone-painter/        # PGM 解析、编辑器与导出逻辑
|   |   |   `-- shrine/                  # 画廊、Wiki、资讯与检索
|   |   `-- shared/                      # 图标、布局、通用组件、自定义光标
|   |-- public/
|   |   |-- shrine-data/                 # 角色内容、知识库、封面与图片
|   |   |-- topics-data/                 # 热点当前数据与日期归档
|   |   |-- third-party-notices/         # 第三方许可证与字体 OFL 文本
|   |   |-- image/ video/ video-covers/  # 站点媒体资源
|   |   `-- _redirects                   # 静态数据优先 + SPA 回退
|   |-- tests/                           # Worker、时间轴、流式、年表与角色检索测试
|   |-- _worker.js                       # 生产 API、知识检索、SSE 与 AI 代理
|   |-- vite.config.js
|   `-- package.json
|-- backend/                             # FastAPI 本地示例服务
|-- docs/
|   |-- rule.md                          # 工作规范与部署规则
|   |-- todo.md                          # 需求方案与实施记录
|   `-- research/                        # 调研取证（交互机制、角色卡与许可证）
|-- scripts/
|   |-- build/copy-frontend.mjs          # 复制 frontend/dist 到根 dist
|   |-- deploy/deploy.sh                 # 构建、提交、推送与部署脚本
|   |-- fetch_topics.py                  # 行业热点聚合
|   |-- fetch_shrine.py                  # 厨厨实时索引聚合
|   |-- validate_topics.py
|   `-- validate_shrine.py
|-- .github/workflows/
|   |-- daily-topics.yml                 # 热点抓取、校验与数据提交
|   `-- shrine-search.yml                # 厨厨索引抓取与校验
|-- package.json                         # 根目录命令入口
```

---

## 快速开始

### 环境要求

- Node.js `>= 22`
- npm `>= 10`
- Python 3.12（仅在本地 FastAPI 或数据抓取脚本时需要）

### 安装与启动

```bash
# 1. 安装前端依赖
npm.cmd --prefix frontend ci

# 2. 启动开发服务器
npm.cmd run dev

# 3. 打开 http://localhost:5173
```

> Windows PowerShell 下请使用 `npm.cmd` / `npx.cmd`，避免 `npm.ps1` 执行策略问题。
> Vite 会把开发环境中的 `/api` 请求代理到 `http://127.0.0.1:8000`。

### 生产构建与预览

```bash
# 根目录构建：安装依赖 -> 构建 frontend/dist -> 复制到根 dist/
npm.cmd run build

# 本地预览（从 frontend 目录运行，避免根目录 dist 干扰）
cd frontend
npx.cmd vite preview --port 4173 --strictPort
```

### FastAPI 示例服务

`backend/` 只提供 `/api/hello` 示例接口；生产环境的热点、厨厨检索和 AI 对话均由 `frontend/_worker.js` 处理。

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 可用脚本

### 根目录

| 命令 | 说明 |
|------|------|
| `npm.cmd run dev` | 启动前端开发服务器 |
| `npm.cmd run build` | 安装前端依赖、构建并复制到根 `dist/` |
| `npm.cmd run preview` | 预览前端构建产物 |
| `npm.cmd run deploy` | 调用 `scripts/deploy/deploy.sh`（需要 bash） |

### `frontend/`

| 命令 | 说明 |
|------|------|
| `npm.cmd run dev` | Vite 开发服务器 |
| `npm.cmd run build` | 构建到 `frontend/dist` |
| `npm.cmd run preview` | 预览构建产物 |
| `npm.cmd run test` | 运行 `frontend/tests/*.test.mjs` |

---

## 环境变量与 Secrets

仓库中不保存任何密钥。生产环境使用 Cloudflare Pages Secret：

| 名称 | 必填 | 用途 |
|------|------|------|
| `DEEPSEEK_API_KEY` | 是 | 角色对话调用 DeepSeek |
| `BRAVE_SEARCH_API_KEY` | 否 | 时效问题的网络搜索；未配置时自动降级到站内知识库 |
| `GITHUB_TOKEN` | 否 | 提升 GitHub 只读档案工具的速率限制 |

配置命令：

```bash
npx.cmd wrangler pages secret put DEEPSEEK_API_KEY --project-name=wangyulong-home
npx.cmd wrangler pages secret put BRAVE_SEARCH_API_KEY --project-name=wangyulong-home
npx.cmd wrangler pages secret put GITHUB_TOKEN --project-name=wangyulong-home
```

> 不要把密钥写入 `.env`、源码、README、截图或提交历史。前端只通过 Pages Worker 访问第三方 API。

---

## 部署

部署细则以 [docs/rule.md](docs/rule.md) 为准。当前采用 **Cloudflare Pages**，存在两种部署通道：

| 通道 | 触发 | 说明 |
|------|------|------|
| Cloudflare Git 集成 | push 到 `main` | Cloudflare 拉取仓库并执行构建；若失败会回退到上一次成功部署 |
| Wrangler 直传 | 手动或脚本 | 直接上传 `frontend/dist`，可跳过 GitHub push |

### 手动部署（推荐用于本地验收）

```bash
# 从仓库根目录构建
npm.cmd run build

# 直传生产环境；--branch=main 必须显式指定
npx.cmd wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main
```

如果只想部署、暂不推送 GitHub，可跳过 `git push`，直接执行上面的 Wrangler 命令。

### 完整发布流程

```bash
npm.cmd run build
git add -A
git commit -m "描述本次改动"
git push origin main
npx.cmd wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main
```

> 必须从**仓库根目录**执行 Wrangler；在 `frontend/` 内执行会把路径解析成 `frontend/frontend/dist`。
> `--branch=main` 不可省略，否则 CI 的 detached HEAD 可能把产物部署到非生产环境。

---

## 测试

测试使用 Node 内置 test runner，不需要额外测试框架：

```bash
npm.cmd --prefix frontend run test
```

当前覆盖：

| 文件 | 覆盖内容 |
|------|----------|
| `frontend/tests/dialogue-timeline.test.mjs` | 空时间轴、只有问候、问答配对、引用计数、连续提问、流式未完成、忽略非对话角色 |
| `frontend/tests/dialogue-stream.test.mjs` | SSE 解析、增量合并、replace 事件、降级路径 |
| `frontend/tests/dialogue-chronicle.test.mjs` | 归档年表与知识库的一致性 |
| `frontend/tests/chat-persona.test.mjs` | 人格提示词、参数与 Worker 输出约束 |

提交前至少运行：

```bash
npm.cmd --prefix frontend run test
npm.cmd run build
```

---

## API 概览

| 接口 | 说明 |
|------|------|
| `GET /api/topics` | 当前行业热点 |
| `GET /api/topics/archive-index` | 热点归档索引 |
| `GET /api/shrine` | 完整厨厨实时索引 |
| `GET /api/shrine/search?type=gallery&q=关键词` | 按类型检索画廊、Wiki 或资讯 |
| `GET /api/shrine/knowledge?q=关键词` | 调试角色知识检索结果 |
| `POST /api/chat` | 角色对话；请求体带 `stream: true` 时返回 SSE |

对话采用分层提示词：世界观、身份、人生观、价值观、声线与称呼（`VOICE_ANCHORS`）、神性回收（`DIVINITY_RECOVERY`）、关系与情绪口吻（`RELATIONSHIP_VOICE`）、对话示例（`FEW_SHOT_EXAMPLES`）、当前心境、记忆、稳定性与回应规则。运行时还会把 allowlist 仓库中的雷电将军角色卡作为“声线参考”注入（只影响语气，不新增事实）。

回答中的事实来源以编号引用展示；资料不足或存在冲突时，角色被要求明确说明不确定性。网络搜索只在问题包含“最新、最近、新闻、版本、复刻、卡池、活动”等时效关键词时触发，且会先抽取干净搜索词，避免上传隐私内容。

---

## 与影对谈

`/dialogue` 把角色对话从厨厨页的 Tab 中独立出来，形成完整页面叙事：

1. **开篇** —— 绝区零式深色 HUD 首屏，右侧嵌入一块「档案画框」：深色终端面板 + 酸性黄角标与 `ARCHIVE PLATE` 状态行，画框内是作者生成的「影 · 先锋主义几何拼贴」：紫、黑、米白与暗金切成硬边三角形、圆弧与十字，保留纸面、套准阴影与档案编号。构成主义被收进画框，只作档案注脚；页面的主视觉仍是 ZZZ 的深色底、网格、等宽标签与硬边 HUD。
2. **对话纪年** —— 横向滚动时间轴，刻度不是设定年表，而是**这一次对话本身**：每条用户提问与影的回答合成一张卡片（问 / 答 / 时间 / 引用数 / 状态），按真实轮次编号，点击可“跳至原文”。外层高度由 JS 按板块数撑开，原生 `position: sticky` 钉住视口，GSAP ScrollTrigger `scrub` 驱动横向位移；窄屏与 `prefers-reduced-motion` 下退化为竖向卡片列表。
3. **对谈** —— 米白纸面面板上的对话线程（方形序号、红色问句、2px 硬脊线）。提问与回答正文使用 Zhi Mang Xing 手写行书字体；右侧展示心境 / 缘分 / 记忆 / 检索状态，以及读取自 SSE `meta.parameters` 的**生成参数**（温度、top_p、max_tokens、频率惩罚、存在惩罚、思考链），来源以学术脚注呈现。

轮次配对的纯函数在 `frontend/src/features/dialogue/composables/useDialogueTimeline.js`（`buildConversationTimeline`）。旧的世界观年表 `frontend/src/features/dialogue/data/chronicle.js` 不再参与页面渲染，仅作为站内 canonical 年表的归档保留，并由 `dialogue-chronicle.test.mjs` 继续保护。

### 对话参数

对话接口支持 SSE 流式输出：请求体带 `stream: true` 时返回 `text/event-stream`，事件序列为 `meta → delta* →（可选 replace）→ done`；不带 `stream` 时保持一次性 JSON 响应。前端在流式不可用时自动降级。

角色对话使用 1017 模型并开启 `thinking`，修订链路保持非思考以稳定复核结果。当前调优值：

| 场景 | max_tokens | temperature | top_p | frequency_penalty | presence_penalty |
|------|------------|-------------|-------|-------------------|------------------|
| 角色对话（思考链开启） | 2400 | 0.9 | 0.95 | 0.25 | 0.2 |
| 稳定性复核 / 修订 | 900 | 0.22 | 0.82 | — | — |

SSE 的 `meta` 事件会把本轮参数随 `parameters` 字段下发，页面右侧「生成参数」据此渲染。

社区角色卡调研与许可证边界记录在 `docs/research/raiden-persona-cards.md`，交互机制取证记录在 `docs/research/nanfu-interaction.md`。

---

## PGM 地图区域绘制器

地图编辑器用于制作 ROS2 Nav2 Costmap Filter 掩码，支持桌面端和触摸设备。

- 导入或拖放 P2/P5 `.pgm`，也可载入演示地图
- 禁行区（Keepout）与限速区（Speed）双图层独立编辑
- 多边形、画笔、擦除、平移、缩放和像素网格
- 顶点选择与删除、撤销 / 重做、透明度与实时统计
- 单独导出两类 PGM 掩码，或打包下载双掩码 ZIP
- ZIP 内附 `SOURCE.txt`，保留上游作者与许可证信息

常用快捷键：

| 按键 | 操作 |
|------|------|
| `B` | 切换画笔 / 多边形模式 |
| `P` | 平移模式 |
| `K` / `G` | 禁行图层 / 限速图层 |
| `Enter` | 填充当前多边形 |
| `Delete` / `Backspace` | 删除选中顶点 |
| `R` / `Esc` | 重置当前多边形 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y` | 重做 |
| `+` / `-` | 缩放 |
| 按住 `Space` 拖动 | 临时平移 |

---

## 数据自动化

| 数据 | 北京时间 | 生成文件 | 主要来源 |
|------|----------|----------|----------|
| 行业热点 | 每天 08:17、20:17 | `topics-data/hot-topics.json` 与日期归档 | 中文聚合 RSS、国内科技媒体、国际机器人 / AI 一手 RSS |
| 厨厨索引 | 每天 02:37、08:37、14:37、20:37 | `shrine-data/index.json` | Bing Web RSS、Bilibili View API、原神 WIKI_BWIKI、Google 新闻 RSS |

热点排序优先考虑合肥、安徽与国内中文信息，同时保留 ROS2、机器人和 AI 的国际一手来源。两类任务都会先运行校验脚本，来源缺失或数据结构无效时不会发布。自动更新工作流只负责更新站内数据并部署网站，不包含邮件发送逻辑。

---

## 贡献指南

1. 先阅读 [docs/rule.md](docs/rule.md) 与 [docs/todo.md](docs/todo.md)，确认当前规范与实施记录。
2. 架构约束：Vue 3 + Vite；页面保持薄壳，业务逻辑放到 `features/`；样式优先复用 `App.vue` 的设计令牌。
3. 不要提交密钥、个人隐私数据或未授权的角色素材。
4. 修改 UI 时同时检查桌面端（1440×900）与移动端（390×844），并验证 `prefers-reduced-motion`。
5. 修改 Worker 或对话逻辑时先补测试；网络搜索失败必须静默降级，不能阻断角色聊天。
6. 提交信息使用清晰的中文描述；PR 请附验证命令与截图（如涉及视觉改动）。

适合继续推进的方向：

- 为 `topics-data`、`shrine-data` 增加 schema 校验与可视化统计；
- 抽取通用按钮、标签、空状态和数据面板组件；
- 为对话时间轴增加“当前阅读轮次”与键盘导航；
- 为地图工具补充导入校验与错误恢复提示；
- 继续压缩首屏媒体体积，完善 Lighthouse 与可访问性检查。

---

## 第三方声明与许可

### 上游代码

PGM 地图区域绘制器基于 Adil NAS 的开源项目 [`Adilnasceng/ros2-map-zone-painter`](https://github.com/Adilnasceng/ros2-map-zone-painter) 进行 Web 端迁移与功能扩展，原项目采用 MIT License。

- 原作者：[Adil NAS](https://github.com/Adilnasceng)
- 上游源码：<https://github.com/Adilnasceng/ros2-map-zone-painter>
- 许可副本：[frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt](frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt)

### 字体

| 字体 | 许可证 | 声明文件 |
|------|--------|----------|
| Geist / Geist Mono | SIL Open Font License 1.1 | [geist-font-OFL-1.1.txt](frontend/public/third-party-notices/geist-font-OFL-1.1.txt) |
| Smiley Sans Oblique（得意黑） | SIL Open Font License 1.1 | [smiley-sans-OFL-1.1.txt](frontend/public/third-party-notices/smiley-sans-OFL-1.1.txt) |
| Zhi Mang Xing（志莽行书） | SIL Open Font License 1.1 | [zhi-mang-xing-OFL-1.1.txt](frontend/public/third-party-notices/zhi-mang-xing-OFL-1.1.txt) |

### 内容与素材

除第三方代码与字体外，站点文案、项目图片、角色资料整理与页面设计版权归作者所有。角色名称、形象与相关素材版权归原权利方所有，本站仅用于个人学习与非商业展示；如需转载或复用，请先确认相应授权。

本仓库目前未附加统一的开源许可证；如需复用代码，请先联系作者。第三方组件继续遵循其各自许可证。

### 开发工具

本项目使用 **DeepSeek Harness** 进行 Agent 协作开发、代码审阅与部署验证。README 与文档中的命令均以当前仓库结构为准。

---

## 项目文档

- [docs/rule.md](docs/rule.md)：开发、构建与部署规范
- [docs/todo.md](docs/todo.md)：需求方案与实施记录
- [docs/research/](docs/research/)：角色卡、交互机制与许可证调研
