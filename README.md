# MY_WEBSITE

个人主页、机器人实践记录与交互应用集合。前端使用 Vue 3 + Vite，部署在 Cloudflare Pages；生产 API 由 Pages Worker 提供，角色对话接入 DeepSeek。

- 线上站点：[wangyulong-home.pages.dev](https://wangyulong-home.pages.dev/)
- 应用入口：[wangyulong-home.pages.dev/applist](https://wangyulong-home.pages.dev/applist)
- 源码仓库：[wangyulong483/wangyulong_home](https://github.com/wangyulong483/wangyulong_home)

## 主要模块

| 路径 | 模块 | 主要能力 |
|------|------|----------|
| `/` | 首页 | 视频开场、滚动过渡、个人世界索引与项目入口 |
| `/about` | 项目档案 | 机器人与视觉项目视频画廊、弹窗播放 |
| `/applist` | 应用列表 | 统一管理游戏、热点、地图工具与兴趣模块 |
| `/game` | 飞机大战 | Canvas 射击游戏，支持键盘和移动端触控 |
| `/hot-topics` | 行业热点 | 合肥、安徽及国内机器人/AI 动态，支持搜索、分类和日期归档 |
| `/map-zone-painter` | 地图区域绘制器 | 编辑 PGM 地图并导出 ROS2 Nav2 禁行区与限速区掩码 |
| `/shrine` | ？！厨厨！？ | 雷电将军角色档案、影像、攻略/Wiki、资讯和“与影对话” |

## 系统架构

```text
浏览器
  |
  +-- Vue 3 SPA
  |     +-- 路由页面与按需加载模块
  |     +-- public/ 静态图片、视频与 JSON 数据
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

Worker 会优先读取 GitHub `main` 分支中的最新数据，并在回源不可用时回退到 Pages 静态资源。`DEEPSEEK_API_KEY` 仅保存在 Cloudflare Secret 中，不写入前端代码或仓库。

## 技术栈

| 范围 | 技术 |
|------|------|
| 前端 | Vue 3.5、Composition API、`<script setup>` |
| 路由 | Vue Router 5、路由级懒加载 |
| 动效与内容 | GSAP、marked、Canvas |
| 构建 | Vite 8、Node.js 22+ |
| 生产 API | Cloudflare Pages Worker |
| AI | DeepSeek V4 Flash 0731（API 模型标识 `deepseek-v4-flash`） |
| 本地示例 API | FastAPI、Uvicorn |
| 自动化 | GitHub Actions、Python 3.12 |
| 部署 | Cloudflare Pages、Wrangler 4 |

## 项目结构

```text
vue_blog/
|-- frontend/
|   |-- src/
|   |   |-- app/                         # 应用壳、全局样式与路由
|   |   |-- pages/                       # 路由级页面
|   |   |-- features/
|   |   |   |-- home/                    # 首页视频与滚动过渡
|   |   |   |-- map-zone-painter/        # PGM 解析、编辑器与导出逻辑
|   |   |   `-- shrine/                  # 画廊、Wiki、资讯、对话与检索
|   |   `-- shared/                      # 图标、布局和通用组件
|   |-- public/
|   |   |-- shrine-data/                 # 角色内容、知识库、封面与图片
|   |   |-- topics-data/                 # 热点当前数据与日期归档
|   |   |-- third-party-notices/         # 第三方许可证和来源声明
|   |   |-- image/ video/ video-covers/  # 站点媒体资源
|   |   `-- _redirects                   # 静态数据优先 + SPA 回退
|   |-- tests/                           # Worker 与角色检索测试
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
|   `-- validate_shrine.py
|-- .github/workflows/
|   |-- deploy.yml                        # main 分支生产部署
|   |-- daily-topics.yml                  # 热点抓取、校验和部署
|   `-- shrine-search.yml                 # 厨厨索引抓取与校验
|-- docs/                                 # 工作规范与方案记录
|-- package.json                          # 根目录命令入口
`-- README.md
```

## 本地开发

### 环境要求

- Node.js `>= 22`
- npm
- Python 3.12（仅 FastAPI 或数据抓取脚本需要）

### 前端

```bash
npm --prefix frontend ci
npm run dev
```

开发地址默认为 `http://localhost:5173`。

### 测试与构建

```bash
# Worker、人物状态与知识检索测试
npm --prefix frontend test

# 生产构建；同时将 frontend/dist 复制到根目录 dist/
npm run build

# 本地预览
npm run preview
```

### FastAPI 示例服务

`backend/` 当前只提供 `/api/hello` 示例接口；生产环境的热点、厨厨检索和 AI 对话均由 `frontend/_worker.js` 处理。

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Vite 会把开发环境中的 `/api` 请求代理到 `http://127.0.0.1:8000`。

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
| `POST /api/chat` | 带人物状态、知识召回、实时来源和引用的角色对话 |

“与影对话”使用分层世界观、身份、人生观和价值观提示，结合语义人物状态、有限的浏览器本地记忆、结构化知识库与实时资料。回答中的事实来源会以编号引用展示；资料不足或存在冲突时，角色被要求明确说明不确定性。

知识检索借鉴以下开源项目的公开设计思想，但未复制其实现代码：

- [SillyTavern](https://github.com/SillyTavern/SillyTavern)：Lorebook 激活、递归扩展和上下文预算
- [RisuAI](https://github.com/kwaroran/Risuai)：近期对话与相关记忆分离
- [MiniSearch](https://github.com/lucaong/minisearch)：BM25/BM25+ 检索思路
- [Chat-Haruhi-Suzumiya](https://github.com/LC1332/Chat-Haruhi-Suzumiya)：角色知识与对话架构参考

具体来源、许可证和事实边界记录在 `frontend/public/shrine-data/knowledge-base.json` 的 `sources` 字段中。

## 部署

部署细则以 [docs/rule.md](docs/rule.md) 为准。Wrangler 命令必须从仓库根目录执行，并显式指定生产分支。

```bash
npm run build
npx wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main
```

包含 Git 提交和推送的完整脚本：

```bash
npm run deploy -- "提交信息"
```

该脚本会执行 `git add -A`、提交、推送和 Wrangler 直传，应在确认工作区内容后使用。`.github/workflows/deploy.yml` 也会在 `main` 更新后构建并发布生产版本。

首次配置 AI Secret：

```bash
npx wrangler pages secret put DEEPSEEK_API_KEY --project-name=wangyulong-home
```

## 第三方开源声明

PGM 地图区域绘制器基于 Adil NAS 的开源项目 [`Adilnasceng/ros2-map-zone-painter`](https://github.com/Adilnasceng/ros2-map-zone-painter) 进行 Web 端迁移与功能扩展，原项目采用 MIT License。

- 原作者：[Adil NAS](https://github.com/Adilnasceng)
- 上游源码：[github.com/Adilnasceng/ros2-map-zone-painter](https://github.com/Adilnasceng/ros2-map-zone-painter)
- 许可副本：[frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt](frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt)

## 项目文档

- [docs/rule.md](docs/rule.md)：开发、构建与部署规范
- [docs/todo.md](docs/todo.md)：需求方案与实施记录
