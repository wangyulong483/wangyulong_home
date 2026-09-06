# MY_WEBSITE

个人主页、机器人实践记录与交互应用集合。项目是一个 Vue 3 + Vite 单页应用，部署在 Cloudflare Pages；生产 API 由 Cloudflare Pages Worker 提供，角色对话接入 DeepSeek。

- 线上站点：[wangyulong-home.pages.dev](https://wangyulong-home.pages.dev/)
- 应用入口：[wangyulong-home.pages.dev/applist](https://wangyulong-home.pages.dev/applist)
- 源码仓库：[wangyulong483/wangyulong_home](https://github.com/wangyulong483/wangyulong_home)

## 给 Claude Code 的快速上下文

如果后续使用 Claude Code 优化本项目，请先阅读：

1. [docs/rule.md](docs/rule.md)：开发、构建、提交和部署规则。
2. [docs/todo.md](docs/todo.md)：需求方案、设计参考与历史实施记录。
3. 本 README 的「项目结构」「模块说明」「优化建议」部分。

关键约束：

- 不要把 `DEEPSEEK_API_KEY` 或任何密钥写入仓库；生产密钥只放 Cloudflare Secret。
- 角色聊天网络搜索使用 `BRAVE_SEARCH_API_KEY`，同样只放 Cloudflare Secret；未配置时会自动降级为站内知识库。
- 前端新增能力优先保持纯静态；除非明确要求，不要改 `frontend/_worker.js`。
- 修改后至少运行 `npm.cmd --prefix frontend run test` 和 `npm.cmd run build`。
- 部署必须从仓库根目录执行，Wrangler 必须显式加 `--branch=main`。
- Windows PowerShell 下优先使用 `npm.cmd`、`npx.cmd`，避免 `npm.ps1` 执行策略问题。
- 如果要部署，按 [docs/rule.md](docs/rule.md) 走：构建、提交、推送、Wrangler 直传。

推荐给 Claude Code 的任务描述模板：

```text
请先阅读 README.md、docs/rule.md、docs/todo.md，理解项目结构和部署规则。
目标：<写清楚要优化的模块或问题>。
要求：保持现有 Vue 3 + Vite 架构，不泄露密钥，不破坏 Cloudflare Pages 部署。
完成后运行 npm.cmd --prefix frontend run test 和 npm.cmd run build，并说明改动文件、验证结果和剩余风险。
```

## 主要模块

| 路径 | 模块 | 主要能力 | 关键文件 |
|------|------|----------|----------|
| `/` | 首页 | 视频开场、滚动过渡、个人世界索引与项目入口 | `frontend/src/pages/Home.vue`、`frontend/src/features/home/` |
| `/about` | 项目档案 | 机器人与视觉项目视频画廊、弹窗播放 | `frontend/src/pages/About.vue` |
| `/applist` | 应用列表 | 统一管理游戏、热点、地图工具、厨厨模块和测评模块 | `frontend/src/pages/AppList.vue` |
| `/game` | 飞机大战 | Canvas 射击游戏，支持键盘和移动端触控 | `frontend/src/pages/Game.vue` |
| `/hot-topics` | 行业热点 | 合肥、安徽及国内机器人/AI 动态，支持搜索、分类和日期归档 | `frontend/src/pages/HotTopics.vue`、`frontend/public/topics-data/` |
| `/map-zone-painter` | 地图区域绘制器 | 编辑 PGM 地图并导出 ROS2 Nav2 禁行区与限速区掩码 | `frontend/src/pages/MapZonePainter.vue`、`frontend/src/features/map-zone-painter/` |
| `/shrine` | ？！厨厨！？ | 雷电将军角色档案、影像、攻略/Wiki、资讯和“与影对话” | `frontend/src/pages/Shrine.vue`、`frontend/src/features/shrine/`、`frontend/public/shrine-data/` |
| `/ai-quiz` | AI 应用能力测评 | 纯静态场景判断测评，本地组卷、判分、雷达画像、错题复盘和学习建议 | `frontend/src/pages/AiQuiz.vue`、`frontend/src/features/ai-quiz/`、`frontend/public/ai-quiz-data/`（manifest + questions/ 分片） |

## UI 与交互风格

网站当前采用「暗色终端 + 科幻档案 + 雷电紫/黄绿强调色」的统一视觉系统。基础界面使用高对比深色背景、细边框、网格纹理、等宽状态标签和紧凑工具面板；首页与 Shrine 页面保留更强的沉浸感，应用与地图工具页面则偏向可扫描、可操作的工作台风格。

全站桌面端启用自定义光标组件：

- 组件：`frontend/src/shared/components/CustomCursor.vue`
- 接入点：`frontend/src/app/App.vue`
- 默认形态：紫色圆点 + 细圆环，像终端瞄准点。
- 交互状态：链接/按钮显示黄绿色 `OPEN`，图片显示 `VIEW`，视频封面显示 `PLAY`，地图绘制区显示十字准星 `DRAW`。
- 页面差异：Shrine 页面启用轻微拖尾；首页全屏视频区域恢复系统光标，避免干扰首屏视频体验。
- 可访问性：触摸设备自动禁用；`prefers-reduced-motion` 下取消拖尾和延迟跟随。

近期媒体与动效性能处理：

- 首页 Hero 视频使用 `preload="metadata"`，组件卸载时暂停并释放视频资源。
- 首页、侧栏、画廊和生日图等图片补充尺寸、懒加载与 `fetchpriority`。
- 页面切换与卡片强调线尽量使用 `opacity` / `transform`，避免不必要的 layout/paint。
- Map Zone Painter 的拖拽监听在组件卸载时会正确移除。

## 系统架构

```text
浏览器
  |
  +-- Vue 3 SPA
  |     +-- 路由级页面和按需加载模块
  |     +-- public/ 静态图片、视频、JSON 数据
  |     `-- localStorage 会话状态
  |
  `-- /api/*
        `-- Cloudflare Pages Worker
              +-- /api/topics              行业热点与归档
              +-- /api/shrine/*            厨厨索引与知识检索
              `-- /api/chat                DeepSeek 角色对话

GitHub Actions
  +-- 定时刷新 topics-data/
  +-- 定时刷新 shrine-data/index.json
  `-- 构建并直传 Cloudflare Pages
```

Worker 会优先读取 GitHub `main` 分支中的最新数据，并在回源不可用时回退到 Pages 静态资源。`DEEPSEEK_API_KEY` 只保存在 Cloudflare Secret 中。

## 技术栈

| 范围 | 技术 |
|------|------|
| 前端 | Vue 3.5、Composition API、`<script setup>` |
| 路由 | Vue Router 5、路由级懒加载 |
| 动效与内容 | GSAP、marked、Canvas、SVG |
| 构建 | Vite 8、Node.js 22+ |
| 生产 API | Cloudflare Pages Worker |
| AI | DeepSeek V4 Flash 0731（API 模型标识 `deepseek-v4-flash`） |
| 搜索 | Brave Search API（角色聊天按需检索现实世界近况） |
| 本地示例 API | FastAPI、Uvicorn |
| 自动化 | GitHub Actions、Python 3.12 |
| 部署 | Cloudflare Pages、Wrangler 4 |

## 项目结构

```text
vue_blog/
|-- frontend/
|   |-- src/
|   |   |-- app/                         # 应用壳、全局样式、路由
|   |   |-- pages/                       # 路由级页面
|   |   |-- features/
|   |   |   |-- home/                    # 首页视频与滚动过渡
|   |   |   |-- ai-quiz/                 # AI 能力测评：组卷、判分、组件
|   |   |   |-- map-zone-painter/        # PGM 解析、编辑器与导出逻辑
|   |   |   `-- shrine/                  # 画廊、Wiki、资讯、对话与检索
|   |   `-- shared/                      # 图标、布局、通用组件、自定义光标
|   |-- public/
|   |   |-- ai-quiz-data/                # AI 测评题库：manifest 索引 + questions/ 分片
|   |   |-- shrine-data/                 # 角色内容、知识库、封面与图片
|   |   |-- topics-data/                 # 热点当前数据与日期归档
|   |   |-- third-party-notices/         # 第三方许可证和来源声明
|   |   |-- image/ video/ video-covers/  # 站点媒体资源
|   |   `-- _redirects                   # 静态数据优先 + SPA 回退
|   |-- tests/                           # Worker、角色检索、测评判分测试
|   |-- _worker.js                       # 生产 API、知识检索与 AI 代理
|   |-- vite.config.js
|   `-- package.json
|-- backend/                              # FastAPI 本地示例服务
|-- scripts/
|   |-- build/copy-frontend.mjs           # 复制 frontend/dist 到根 dist
|   |-- deploy/deploy.sh                  # 构建、提交、推送和部署
|   |-- fetch_topics.py                   # 行业热点聚合
|   |-- fetch_shrine.py                   # 厨厨实时索引聚合
|   |-- validate_topics.py
|   |-- validate_shrine.py
|   `-- validate_quiz.py                  # AI 测评题库校验（manifest + 分片）
|-- .github/workflows/
|   |-- deploy.yml                        # main 分支生产部署
|   |-- daily-topics.yml                  # 热点抓取、校验和部署
|   `-- shrine-search.yml                 # 厨厨索引抓取与校验
|-- docs/
|   |-- rule.md                           # 工作规范与部署规则
|   |-- todo.md                           # 需求方案与实施记录
|   `-- data.md                           # 临时题库/素材输入区
|-- package.json                          # 根目录命令入口
`-- README.md
```

## 本地开发

### 环境要求

- Node.js `>= 22`
- npm
- Python 3.12（仅 FastAPI 或数据抓取脚本需要）

### 常用命令

```bash
# 安装前端依赖
npm.cmd --prefix frontend ci

# 启动前端开发服务
npm.cmd run dev

# 前端测试
npm.cmd --prefix frontend run test

# 根目录生产构建；会安装前端依赖、构建 frontend/dist、复制到根 dist/
npm.cmd run build

# 本地预览
npm.cmd run preview
```

开发地址默认是 `http://localhost:5173`。Vite 会把开发环境中的 `/api` 请求代理到 `http://127.0.0.1:8000`。

### FastAPI 示例服务

`backend/` 当前只提供 `/api/hello` 示例接口；生产环境的热点、厨厨检索和 AI 对话均由 `frontend/_worker.js` 处理。

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## AI 应用能力测评

测评模块是纯静态实现，不依赖 Worker，不调用 LLM API。

- 入口：`/ai-quiz`
- 页面：`frontend/src/pages/AiQuiz.vue`
- 组件：`frontend/src/features/ai-quiz/components/`
- 状态：`frontend/src/features/ai-quiz/composables/useQuiz.js`
- 组卷与判分：`frontend/src/features/ai-quiz/lib/scoring.js`
- 题库索引：`frontend/public/ai-quiz-data/manifest.json`
- 题目正文分片：`frontend/public/ai-quiz-data/questions/{general,professional,shared}/`
- 测试：`frontend/tests/quiz-scoring.test.mjs`

当前题型：

- `single`：单选
- `multiple`：多选，全对才得分
- `judge`：判断题，`answer: 0` 表示正确，`answer: 1` 表示错误

题库字段要点：

- `dimension` 六选一：`model-basics`、`prompt-context`、`rag`、`agent`、`tools-skills-mcp`、`eval-safety`
- `audience` 可为 `["general"]`、`["professional"]` 或 `["general", "professional"]`
- `sourceIds` 必须引用 `manifest.json` 顶部 `sources[]` 中已有的 `id`
- 新题优先写成场景判断题，不要写纯定义题

题库分片结构（`manifest.json` 只存索引元数据，正文按受众分片）：

- `manifest.json`：`dimensions`、`sources` + `questions[]` 元数据（`id`/`dimension`/`audience`/`difficulty`/`cognitiveLevel`/`volatility`/`tags`/`sourceIds`/`file`），不含题干正文
- `questions/{general,professional,shared}/*.json`：题目正文（`type`/`prompt`/`options`/`answer`/`explanation`/`evidence`），每片 ≤100 题
- 前端组卷只在索引元数据上做，选中后再按 `file` 懒加载正文分片

扩展题库推荐流程：

1. 把新题或素材先整理到 `docs/todo.md` 的需求/方案记录中，或直接写入对应题库分片。
2. 按 `audience` 写入对应分片 `questions/{general,professional,shared}/NNN.json`（正文），并在 `manifest.json` 的 `questions` 里登记元数据与 `file` 指针。
3. 检查 `id` 唯一、`sourceIds` 有效、答案下标正确。
4. 运行 `python scripts/validate_quiz.py`、`npm.cmd --prefix frontend run test` 和 `npm.cmd run build`。

## 实时数据与 API

### 自动更新

| 数据 | 北京时间 | 生成文件 | 主要来源 |
|------|----------|----------|----------|
| 行业热点 | 每天 08:17、20:17 | `topics-data/hot-topics.json` 与日期归档 | 中文聚合 RSS、国内科技媒体、国际机器人/AI 一手 RSS |
| 厨厨索引 | 每天 02:37、08:37、14:37、20:37 | `shrine-data/index.json` | Bing Web RSS、Bilibili View API、原神 WIKI_BWIKI、Google 新闻 RSS |

热点排序优先考虑合肥、安徽与国内中文信息，同时保留 ROS2、机器人和 AI 的国际一手来源。两类任务都会先运行校验脚本，来源缺失或数据结构无效时不会发布。

### Worker 接口

| 接口 | 说明 |
|------|------|
| `GET /api/topics` | 当前行业热点 |
| `GET /api/topics/archive-index` | 热点归档索引 |
| `GET /api/shrine` | 完整厨厨实时索引 |
| `GET /api/shrine/search?type=gallery&q=关键词` | 按类型检索画廊、Wiki 或资讯 |
| `GET /api/shrine/knowledge?q=关键词` | 调试角色知识检索结果 |
| `POST /api/chat` | 带人物状态、知识召回、站内实时来源、可选网络搜索和引用的角色对话 |

“与影对话”使用分层世界观、身份、人生观和价值观提示，结合语义人物状态、有限的浏览器本地记忆、结构化知识库、站内实时资料与可选网络搜索。回答中的事实来源会以编号引用展示；资料不足或存在冲突时，角色被要求明确说明不确定性。

网络搜索只在用户问题包含“最新、最近、新闻、版本、复刻、卡池、活动”等时效关键词时触发。Worker 会先抽取相对干净的搜索词，避免把用户明确要求记住的个人信息、密钥或隐私内容发给搜索服务。未配置 `BRAVE_SEARCH_API_KEY` 或搜索失败时，聊天接口不会报错，会自动回退到本地知识库和站内资料。

知识检索借鉴以下开源项目的公开设计思想，但未复制其实现代码：

- [SillyTavern](https://github.com/SillyTavern/SillyTavern)：Lorebook 激活、递归扩展和上下文预算
- [RisuAI](https://github.com/kwaroran/Risuai)：近期对话与相关记忆分离
- [MiniSearch](https://github.com/lucaong/minisearch)：BM25/BM25+ 检索思路
- [Chat-Haruhi-Suzumiya](https://github.com/LC1332/Chat-Haruhi-Suzumiya)：角色知识与对话架构参考

具体来源、许可证和事实边界记录在 `frontend/public/shrine-data/knowledge-base.json` 的 `sources` 字段中。

## PGM 地图区域绘制器

地图编辑器用于制作 ROS2 Nav2 Costmap Filter 掩码，支持桌面端和触摸设备。

- 导入或拖放 P2/P5 `.pgm`，也可载入演示地图
- 禁行区（Keepout）与限速区（Speed）双图层独立编辑
- 多边形、画笔、擦除、平移、缩放和像素网格
- 顶点选择与删除、撤销/重做、透明度和实时统计
- 单独导出两类 PGM 掩码，或打包下载双掩码 ZIP
- ZIP 内附 `SOURCE.txt`，保留上游项目作者与许可证信息

常用快捷键：

| 按键 | 操作 |
|------|------|
| `B` | 切换画笔/多边形模式 |
| `P` | 平移模式 |
| `K` / `G` | 禁行图层 / 限速图层 |
| `Enter` | 填充当前多边形 |
| `Delete` / `Backspace` | 删除选中顶点 |
| `R` / `Esc` | 重置当前多边形 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y` | 重做 |
| `+` / `-` | 缩放 |
| 按住 `Space` 拖动 | 临时平移 |

## 部署

部署细则以 [docs/rule.md](docs/rule.md) 为准。

核心原则：

- 从仓库根目录运行命令。
- 根目录 `npm.cmd run build` 必须成功。
- Wrangler 部署必须显式指定 `--branch=main`。
- `npm run deploy` 脚本依赖 `bash`；在 Windows/WSL 不可用时，可按规则手动执行等价步骤。

```bash
npm.cmd run build
git add -A
git commit -m "提交信息"
git push origin main
npx.cmd wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main
```

首次配置 AI Secret：

```bash
npx.cmd wrangler pages secret put DEEPSEEK_API_KEY --project-name=wangyulong-home
npx.cmd wrangler pages secret put BRAVE_SEARCH_API_KEY --project-name=wangyulong-home
```

## 优化建议

适合交给 Claude Code 的优先级：

1. **AI 测评体验优化**
   - 为 `questions.json` 增加独立校验脚本。
   - 增加题库统计命令，输出 general/professional 的维度、难度、题型分布。
   - 优化结果页文案和错因标注体验。
   - 增加开放题占位，但保持本地不自动判分。

2. **前端可维护性**
   - 拆分过长页面组件，保持 `pages/` 为薄壳，业务逻辑放 `features/`。
   - 抽取通用按钮、标签、空状态和数据面板组件。
   - 检查移动端小屏布局，避免文本溢出和按钮挤压。
   - 自定义光标继续保持轻量：不要给工具页增加拖尾或复杂磁吸，优先保证精确操作。

3. **数据可靠性**
   - 给 `topics-data`、`shrine-data`、`ai-quiz-data` 增加 schema 校验。
   - 静态 JSON 路径如被 SPA 回退吞掉，优先检查 `frontend/public/_redirects`。
   - 高时效题目按 `volatility` 定期复查。

4. **Worker 与 AI 对话**
   - 不要在前端暴露密钥。
   - 修改 `_worker.js` 前先补测试。
   - 保持知识引用、事实边界和不确定性说明。
   - 网络搜索只用于时效问题，搜索失败必须静默降级，不能阻断角色聊天。

5. **部署与 CI**
   - 确保根目录 `package.json` 的 `build` 在 Cloudflare Git 集成中可运行。
   - 如果 Git 集成构建失败，Cloudflare 可能回退到上一次成功部署。
   - Wrangler 直传和 Git 集成会形成双通道部署，需保持二者产物一致。

## 第三方开源声明

PGM 地图区域绘制器基于 Adil NAS 的开源项目 [`Adilnasceng/ros2-map-zone-painter`](https://github.com/Adilnasceng/ros2-map-zone-painter) 进行 Web 端迁移与功能扩展，原项目采用 MIT License。

- 原作者：[Adil NAS](https://github.com/Adilnasceng)
- 上游源码：[github.com/Adilnasceng/ros2-map-zone-painter](https://github.com/Adilnasceng/ros2-map-zone-painter)
- 许可副本：[frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt](frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt)

## 项目文档

- [docs/rule.md](docs/rule.md)：开发、构建与部署规范
- [docs/todo.md](docs/todo.md)：需求方案与实施记录
