# 行业热点组件 — 需求与方案

## 需求

1. 每天自动搜集并展示前一日机器人、ROS2、激光雷达、深度相机、AI、传感器行业的最新动态
2. 完全自动化：无需手动运行任何命令，每天自动更新
3. 纯前端展示：Vue 组件从 JSON 文件读取数据，无需运行中的后端服务器
4. 零成本：利用 GitHub Actions 免费额度 + 现有 Cloudflare Pages 部署
5. 信息来源覆盖：ROS2 官方、机器人行业新闻、arXiv 论文、GitHub 热门项目
6. 用户可以浏览、筛选、搜索热点条目
7. 支持每天的历史记录查看（按日期归档）

## 方案

### 架构概览

```
GitHub Actions (每天 UTC 00:00 自动运行)
  │
  ├─→ Python 脚本抓取 RSS/API
  │     ├─ RSS 源 × 8-10 个（机器人/传感器行业）
  │     ├─ 去重（标题相似度 > 0.8 合并）
  │     └─ 输出 JSON → frontend/public/data/
  │
  ├─→ Git commit + push
  │
  └─→ Cloudflare Pages 自动重新部署
         │
         └─→ Vue 组件 HotTopics.vue 读取 JSON 展示
```

### 目录结构

```
vue_blog/
├── frontend/
│   └── public/data/
│       ├── hot-topics.json          ← 今天的热点（GitHub Actions 生成）
│       └── archive/
│           ├── 2026-07-10.json      ← 每日归档
│           └── ...
├── scripts/
│   ├── fetch_topics.py              ← Python 抓取脚本
│   └── requirements.txt            ← Python 依赖
├── .github/workflows/
│   └── daily-topics.yml            ← 定时任务
└── todo.md
```

### 信息来源（一期 8 个 RSS）

| 来源 | 覆盖领域 | RSS URL |
|------|---------|---------|
| ROS Discourse | ROS2 社区 | https://discourse.ros.org/posts.rss |
| IEEE Spectrum Robotics | 机器人综合 | https://spectrum.ieee.org/feeds/topic/robotics/rss.xml |
| The Robot Report | 机器人产业 | https://www.therobotreport.com/feed/ |
| arXiv CS.RO | 机器人论文 | https://rss.arxiv.org/rss/cs.RO |
| GitHub Trending | 热门开源项目 | API: gh-trending (Python/robotics) |
| 机器之心 | 中国AI/机器人 | https://jiqizhixin.com/rss |
| ROS News | ROS社区动态 | https://www.ros.org/news/rss/ |
| 雷锋网 AI/机器人 | 中国科技 | 爬虫或备用 RSS |

### 数据格式（JSON）

每条热点：
```json
{
  "date": "2026-07-11",
  "items": [
    {
      "id": "md5-hash",
      "title": "ROS 2 Jazzy Jalisco 正式发布",
      "summary": "Open Robotics 宣布 ROS 2 最新 LTS 版本...",
      "source": "ROS Discourse",
      "sourceIcon": "ros",
      "url": "https://discourse.ros.org/...",
      "category": "ros2",
      "tags": ["ros2", "release"],
      "publishedAt": "2026-07-10T14:30:00Z"
    }
  ],
  "categories": [
    { "key": "ros2",     "label": "ROS2",       "icon": "settings" },
    { "key": "robot",    "label": "机器人",      "icon": "controller" },
    { "key": "lidar",    "label": "激光雷达",    "icon": "compass" },
    { "key": "camera",   "label": "深度相机",    "icon": "camera" },
    { "key": "ai",       "label": "AI",         "icon": "fire" },
    { "key": "sensor",   "label": "传感器",      "icon": "pushpin" }
  ]
}
```

### Vue 组件设计（HotTopics.vue）

```
┌──────────────────────────────────────────┐
│  🏭 行业热点                            │
│  机器人 · 传感器 · AI 每日动态          │
│                                          │
│  [全部] [ROS2] [机器人] [激光雷达] ...    │  ← 分类筛选标签
│  🔍 搜索...                              │  ← 关键词搜索
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 📡 ROS2 Jazzy 正式发布           │    │
│  │ ROS Discourse · 2026-07-10       │    │
│  │ 摘要：xxx...                     │    │
│  │ [ros2] [release]                 │    │
│  ├──────────────────────────────────┤    │
│  │ 🤖 人形机器人融资创新高          │    │
│  │ The Robot Report · 2026-07-10    │    │
│  │ ...                              │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ← 7月10日  今天  7月12日 →             │  ← 日期切换
└──────────────────────────────────────────┘
```

### 实施步骤

1. 创建 `scripts/fetch_topics.py` — RSS 抓取 + JSON 生成脚本
2. 创建 `.github/workflows/daily-topics.yml` — 每日定时 GitHub Actions
3. 重写 `frontend/src/views/HotTopics.vue` — 分类筛选 + 搜索 + 日期归档
4. 前端构建时复制 `public/data/` 到 `dist/data/`
5. 首次手动运行脚本，生成初始数据，验证组件展示
6. 激活定时任务，观察首次自动运行

### 技术选型理由

- **GitHub Actions 而非后端服务器**：零成本、零运维、2000分钟/月免费额度
- **Python 脚本而非 Node.js**：feedparser 库成熟稳定，RSS 解析简单可靠
- **JSON 文件而非数据库**：静态文件可直接被 Vue fetch，Cloudflare Pages 直接托管
- **日期归档而非只保留今天**：支持每日回顾，数据累积有历史价值

===============================================================
