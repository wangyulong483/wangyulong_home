# MY_WEBSITE

个人博客与实验应用集合，基于 Vue 3 + Vite 构建，部署于 Cloudflare Pages；FastAPI 后端提供 AI 对话服务。

- 线上地址：[wangyulong-home.pages.dev](https://wangyulong-home.pages.dev/)
- 应用入口：[wangyulong-home.pages.dev/applist](https://wangyulong-home.pages.dev/applist)

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
| 定时任务 | GitHub Actions（每 12 小时抓取行业热点） |

## 项目结构

```
vue_blog/
├── frontend/                     # 前端项目
│   ├── src/
│   │   ├── main.js               # 入口：创建 Vue 应用 → 路由 → 挂载
│   │   ├── app/                  # 应用壳与路由
│   │   │   ├── App.vue
│   │   │   └── router.js
│   │   ├── pages/                # 路由级页面
│   │   ├── features/             # 按业务聚合的组件与逻辑
│   │   │   ├── home/
│   │   │   ├── map-zone-painter/ # PGM 解析、掩码生成与地图绘制工作区
│   │   │   └── shrine/
│   │   └── shared/               # 跨页面复用的基础模块
│   │       ├── components/
│   │       ├── effects/
│   │       └── layout/
│   ├── public/
│   │   ├── game-icon-pack-main/  # SVG 图标库
│   │   ├── image/                # 图片资源
│   │   ├── video/                # 视频资源
│   │   ├── shrine-data/          # 雷电将军应援数据 (JSON + 图片)
│   │   ├── topics-data/          # 行业热点数据 (GitHub Actions 生成)
│   │   ├── third-party-notices/  # 第三方开源许可与来源声明
│   │   └── _redirects            # Cloudflare Pages SPA + 静态 JSON 路由
│   ├── _worker.js                # Cloudflare Pages 边缘 Worker
│   ├── vite.config.js            # Vite 配置（代理 /api → FastAPI）
│   └── package.json
├── backend/                      # 后端项目
│   ├── main.py                   # FastAPI 入口 + CORS + 路由
│   └── requirements.txt
├── data/                         # 不参与构建的原始素材与模型数据
│   └── shrine/
├── scripts/                      # 自动化与维护脚本
│   ├── build/copy-frontend.mjs   # 刷新根目录部署产物
│   ├── deploy/deploy.sh          # Cloudflare Pages 部署
│   ├── fetch_shrine.py           # 厨力研究所实时索引抓取
│   └── fetch_topics.py           # 每日热点抓取脚本
├── docs/                         # 项目规范与方案记录
│   ├── rule.md
│   └── todo.md
├── .github/workflows/            # CI/CD
│   ├── deploy.yml                # 自动部署到 Cloudflare Pages
│   ├── daily-topics.yml          # 每 12 小时抓取行业热点
│   └── shrine-search.yml         # 每 6 小时刷新厨力研究所索引
└── package.json                  # 根命令入口（委托到 frontend/）
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | HELLO WORLD 头部 + 图片轮播 + 格言 + 学习平台链接 |
| `/about` | 关于 | 项目视频展示（B站嵌入），点击缩略图弹窗播放 |
| `/applist` | 应用 | 飞机大战 / 行业热点 / 地图区域绘制器 / 厨力研究所入口 |
| `/game` | 飞机大战 | Canvas 射击游戏 "保卫安建大"，WASD 移动 J 射击 |
| `/hot-topics` | 行业热点 | 合肥与国内机器人 · AI 动态，地区/分类筛选 + 搜索 + 日期归档 |
| `/map-zone-painter` | 地图区域绘制器 | 导入 PGM 地图，绘制并导出 ROS2 Nav2 禁行与限速掩码 |
| `/shrine` | 厨力研究所 | 雷电将军主题模块（影像 / 攻略 Wiki / 资讯 / AI 对话） |

## PGM 地图区域绘制器

地图区域绘制器用于在 ROS2 栅格地图上制作 Nav2 Costmap Filter 掩码，支持桌面端与触摸设备操作。可以直接拖放或选择 P2/P5 格式的 `.pgm` 文件，也可以载入内置演示地图。

### 主要能力

- **双图层编辑**：分别维护禁行区（Keepout）与限速区（Speed），可独立切换、显示和隐藏。
- **多种绘制方式**：多边形填充、区域擦除、可调半径画笔、画笔擦除与画布平移。
- **精细操作**：选择及删除多边形顶点、双击闭合填充、滚轮缩放、像素网格和实时坐标。
- **历史记录**：支持撤销与重做；清空完整图层需要二次确认，减少误操作。
- **预览与统计**：调整掩码透明度，实时显示禁行、限速、重叠像素和多边形顶点数量。
- **ROS2 输出**：单独导出 `keepout_mask.pgm`、`speed_mask.pgm`，或下载包含两份掩码及 `SOURCE.txt` 的 ZIP 包。

### 快捷键

| 按键 | 操作 |
|------|------|
| `B` | 在画笔与多边形模式间切换 |
| `P` | 切换到平移模式 |
| `K` / `G` | 选择禁行图层 / 限速图层 |
| `Enter` | 填充当前多边形 |
| `Delete` / `Backspace` | 删除选中的多边形顶点 |
| `R` / `Esc` | 重置当前多边形 |
| `C` | 擦除当前多边形区域；无可用多边形时清空当前图层 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y` | 重做 |
| `+` / `-` | 放大 / 缩小 |
| 按住 `Space` 拖动 | 临时平移画布 |

## 设计系统

全局 CSS 变量定义在 `App.vue` 中，两种玻璃容器：

- **玻璃卡片 `.glass-card`**：半透明背景 + 毛玻璃模糊 + 悬停抬起
- **液态玻璃 `.liquid-glass`**：加强版毛玻璃，含 SVG 噪声纹理 + 对角线光扫动画
- **应用信号图标**：应用列表统一使用荧光绿色描边、暗色底与悬停辉光，保持工具入口的视觉一致性

支持移动端适配（768px / 480px 断点），含安全区、触摸优化、性能降级。

## 快速开始

环境要求：Node.js 22 或更高版本。

### 前端

```bash
npm --prefix frontend install
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
# 仅构建前端（依赖已安装）
npm --prefix frontend run build

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
npm run deploy -- "提交信息"

# 方式2：跳过 git，直接部署
npm run build && npx wrangler pages deploy frontend/dist --branch=main
```

## 数据流

### 行业热点

```
GitHub Actions（北京时间 08:17 / 20:17）→ fetch_topics.py → 中文聚合 RSS + 国际一手 RSS
  → frontend/public/topics-data/hot-topics.json
  → Cloudflare Pages 静态托管
```

热点优先展示合肥/安徽和国内中文内容，并保留少量国际机器人、ROS2 与 AI 一手信息。支持地区、分类、关键词和日期归档筛选，归档路径为 `/topics-data/archive/YYYY-MM-DD.json`。

### AI 对话

```
ChatTab.vue → POST /api/chat → Cloudflare Tunnel → FastAPI → DeepSeek API
                                                    │
                                                    ├── system prompt (雷电将军角色)
                                                    └── 知识库检索 (角色设定/剧情)
```

### 厨力研究所实时检索

```
GitHub Actions（每 6 小时）→ fetch_shrine.py
  ├── Bing Web RSS → 发现 B站影像候选
  ├── Bilibili View API → 核验作者、封面、播放量与点赞量
  ├── 原神WIKI_BWIKI API → 攻略与角色资料
  └── Google 新闻 RSS → 中文资讯
      ↓
frontend/public/shrine-data/index.json
      ↓
Cloudflare Worker /api/shrine/search → 画廊 / Wiki / 资讯实时检索
                                      → 对话知识检索与逐条引用
```

动态索引中的每条内容必须包含来源名称与原文 URL，`validate_shrine.py` 会在发布前校验来源完整性。B站搜索受限时，系统仍会通过公开 View API 刷新站内精选视频的元数据；“与影对话”会在回复下方显示本轮检索所使用的具体来源。

### SPA + 静态 JSON 共存

`_redirects` 配置让 Cloudflare Pages 优先匹配静态 JSON 文件，其余走 SPA 路由回退。Vue 组件内置 `Content-Type: text/html` 检测，SPA fallback 时使用内嵌兜底数据。

## 第三方开源声明

PGM 地图区域绘制器基于 Adil NAS 的开源项目
[`Adilnasceng/ros2-map-zone-painter`](https://github.com/Adilnasceng/ros2-map-zone-painter)
进行 Web 端功能迁移与交互扩展，原项目采用 MIT License。

- 原作者：[Adil NAS](https://github.com/Adilnasceng)
- 源码：[github.com/Adilnasceng/ros2-map-zone-painter](https://github.com/Adilnasceng/ros2-map-zone-painter)
- 许可副本：[frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt](frontend/public/third-party-notices/ros2-map-zone-painter-LICENSE.txt)
- 本项目导出的双掩码 ZIP 会附带 `SOURCE.txt`，保留原项目来源、作者与许可信息

## 相关文档

- [工作规范](docs/rule.md) — 项目开发流程与技术约定
- [待办事项](docs/todo.md) — 需求记录与方案存档
