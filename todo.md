## 需求

开发"厨厨"板块——**雷电将军单角色应援页（Character Shrine）**，聚合展示雷电将军的二创作品、攻略资料、最新资讯，表达对角色的喜爱。

**角色**：雷电将军（Raiden Shogun / 雷电影），《原神》稻妻统治者，雷元素长柄武器角色。

**核心定位**：
- **策展而非创作**：站长不自己创作二创，而是收集、整理、展示来自 B站、Pixiv 等平台的优秀二创作品
- **单角色专注**：整个板块献给雷电将军
- **三大模块**：二创画廊 + 攻略/Wiki + 资讯动态

## 方案

### 1. 用户确认的设计决策

| 决策项 | 结论 |
|--------|------|
| Hero 区 | 放一张**官方立绘**，用户提供图片放到 `public/shrine-data/images/` |
| 二创来源 | **B站视频** + **Pixiv 插画** + **其他平台**（Twitter/Lofter/NGA 等） |
| 攻略方向 | **战斗攻略**（配队/圣遗物/手法）+ **角色考据**（原型/设计分析）+ **官方资料**（语音/故事/PV 合集） |
| 动画程度 | **适度氛围**：雷晶粒子浮动背景 + 标题呼吸发光 + Tab hover 光效，不搞重特效 |

### 2. 角色视觉风格分析（基于 EXA MCP 搜集）

**配色体系**：

| 颜色 | 色值 | 用途 |
|------|------|------|
| 深紫（主色） | `#6B4C9A` / `#4A2C7A` | 背景、主色调，呼应雷元素+角色发色 |
| 雷光紫（强调色） | `#B088F9` / `#9B6DFF` | 高亮、hover 发光、闪电特效 |
| 金色（点缀） | `#C9A96E` / `#D4AF37` | 标题装饰、重要标识，呼应角色金饰 |
| 赤红（点缀） | `#C0392B` / `#8B1A1A` | 角色蝴蝶结、绳结的颜色，小面积使用 |
| 暗色背景 | `#0D0D1A` / `#1A1A2E` | 深色基底，营造"一心净土"深邃感 |
| 粉紫雷光 | `#D488EE` | 皮肤版雷电特效、柔和渐变用 |

**视觉符号**：
- ⚡ 雷纹 / 闪电纹 —— 雷元素标识
- 🔱 三巴纹（Mitsudomoe）—— 雷电将军家纹，背景水印（CSS 实现，不用图片）
- 🗡️ 梦想一心（太刀）—— 胸口拔刀的名场面
- 💜 雷晶（Electro Crystals）—— 浮动粒子动画元素
- 🌀 一心净土 —— 意识空间，深邃虚无的冥想之境

**角色气质**：威严 × 冷艳 × 神性 × 孤独中的温柔

### 3. 页面整体设计

**氛围定位**：走进雷电将军的「一心净土」—— 深邃、神秘、永恒的冥想空间。

```
┌──────────────────────────────────────────────────────┐
│  背景：暗色基底 #0D0D1A + CSS 浮动雷晶粒子 + 三巴纹水印 │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │  ┌─────────┐                               │      │
│  │  │         │  ⚡ 雷 电 将 军 ⚡              │      │
│  │  │ 官方    │  一心净土·御建鸣神主尊大御所大人 │      │
│  │  │ 立绘    │  "常道恢弘，鸣神永恒"            │      │
│  │  │ (图片)  │                               │      │
│  │  │         │  [角色简介 + 我为什么喜欢她]     │      │
│  │  └─────────┘                               │      │
│  │     紫色发光边框 + 标题呼吸发光动画           │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ⚡ 二创画廊  │  📜 攻略/Wiki  │  📡 资讯动态    │ │
│  │   (雷纹下划线) │                │                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │              Tab 内容区（玻璃拟态卡片）           │ │
│  │  画廊：响应式网格，hover 紫色发光边框             │ │
│  │  攻略：卡片列表，左侧金色竖线 + 分类标签          │ │
│  │  资讯：垂直时间线，紫色发光节点 + 日期标签        │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**动画规划（适度氛围）**：

| 动画 | 实现方式 | 说明 |
|------|---------|------|
| 雷晶粒子浮动 | CSS `@keyframes` + 绝对定位 `<div>` | 3-5 个半透明紫色菱形，缓慢上下浮动，模拟"一心净土"中悬浮的雷晶 |
| 标题呼吸发光 | CSS `text-shadow` 动画 | 标题紫色发光从 60%→100%→60% 循环，3s 周期 |
| 三巴纹水印 | CSS 伪元素 + 低透明度 | 页面角落固定，`opacity: 0.03`，不抢眼 |
| Tab 切换过渡 | CSS `transition` | 内容区淡入 + 雷光下划线滑动 |
| 卡片 hover | CSS `box-shadow` + `transform` | 紫色发光边框 + 轻微上浮 |

### 4. 页面路由

- 新增路由 `/shrine`，name: `Shrine`，Meta title: "厨厨 · 雷电将军"
- Sidebar 导航项：`AppIcon icon="lightning"` + "厨厨"

### 5. 组件结构

```
frontend/src/views/Shrine.vue                  # 主页面：数据加载 + Hero + Tab + 粒子背景
frontend/src/components/shrine/
├── RaidenHero.vue                            # Hero：立绘+角色名+称号+金句+简介
├── GalleryTab.vue                            # 二创画廊：B站视频 + Pixiv 图 + 其他平台链接
├── WikiTab.vue                               # 攻略/Wiki：战斗+考据+官方资料，Markdown 展开
├── NewsTab.vue                               # 资讯动态：垂直时间线
└── ElectroParticles.vue                      # 雷晶粒子浮动背景（CSS only）
frontend/public/shrine-data/
├── index.json                                # 所有内容数据
└── images/
    └── avatar.png                            # 雷电将军立绘（用户提供）
```

### 6. 数据层

`frontend/public/shrine-data/index.json`：

```json
{
  "character": {
    "name": "雷电将军",
    "title": "一心净土 · 御建鸣神主尊大御所大人",
    "realName": "雷电影",
    "element": "雷",
    "weapon": "长柄武器",
    "affiliation": "稻妻",
    "quote": "常道恢弘，鸣神永恒",
    "avatar": "/shrine-data/images/avatar.png",
    "bio": "雷电将军，真名雷电影，稻妻的现任雷神……",
    "whyLove": "喜欢她的威严与温柔并存……",
    "colors": {
      "primary": "#6B4C9A",
      "accent": "#B088F9",
      "gold": "#C9A96E"
    }
  },
  "gallery": [
    {
      "id": 1,
      "title": "作品标题",
      "platform": "bilibili",
      "platformLabel": "B站",
      "url": "BVxxxxxxxxxx",
      "author": "作者名",
      "authorUrl": "作者主页链接",
      "thumbnail": "",
      "date": "2026-07-01",
      "tags": ["手书", "MMD"]
    },
    {
      "id": 2,
      "title": "同人图标题",
      "platform": "pixiv",
      "platformLabel": "Pixiv",
      "url": "https://www.pixiv.net/artworks/xxxxx",
      "author": "画师名",
      "authorUrl": "画师主页",
      "thumbnail": "https://i.pximg.net/...",
      "date": "2026-07-01",
      "tags": ["插画", "壁纸"]
    },
    {
      "id": 3,
      "title": "作品标题",
      "platform": "other",
      "platformLabel": "Twitter",
      "url": "https://x.com/...",
      "author": "作者名",
      "authorUrl": "",
      "thumbnail": "",
      "date": "2026-07-01",
      "tags": ["cosplay"]
    }
  ],
  "guides": [
    {
      "id": 1,
      "title": "雷电将军配队指南",
      "summary": "当前版本雷电将军主流配队推荐",
      "content": "## 雷电国家队\n\n雷电将军 + 行秋 + 香菱 + 班尼特\n\n...（Markdown 正文）",
      "source": "NGA",
      "sourceUrl": "https://bbs.nga.cn/...",
      "category": "战斗攻略",
      "date": "2026-07-01"
    },
    {
      "id": 2,
      "title": "雷电将军角色考据",
      "summary": "从日本神话解读雷电将军的设计原型",
      "content": "## 天之御中主神与妙见菩萨\n\n...（Markdown 正文）",
      "source": "米游社",
      "sourceUrl": "...",
      "category": "角色考据",
      "date": "2026-06-15"
    },
    {
      "id": 3,
      "title": "雷电将军语音合集",
      "summary": "全角色语音文本整理",
      "content": "## 初次见面\n> 我是雷电将军，此身即为永恒……\n\n...（Markdown 正文）",
      "source": "原神 Wiki",
      "sourceUrl": "...",
      "category": "官方资料",
      "date": "2026-05-20"
    }
  ],
  "news": [
    {
      "id": 1,
      "title": "资讯标题",
      "summary": "内容摘要",
      "date": "2026-07-25",
      "tag": "周边",
      "url": "详情链接"
    }
  ]
}
```

**攻略三种分类的视觉区分**：

| 分类 | 图标 | 左边框颜色 |
|------|------|-----------|
| 战斗攻略 | ⚔️ | 金色 `#C9A96E` |
| 角色考据 | 📖 | 紫色 `#B088F9` |
| 官方资料 | 📋 | 粉色 `#D488EE` |

### 7. 技术实现

| 需求 | 方案 | 说明 |
|------|------|------|
| B站视频 | `<iframe>` 嵌入 (复用 About.vue 模式) | `player.bilibili.com/player.html?bvid=...&high_quality=1&danmaku=0` |
| B站封面 | B站 API `api.bilibili.com/x/web-interface/view?bvid=...` | 自动获取 `pic` 字段作为缩略图 |
| Pixiv 插画 | 外链卡片（不嵌原图） | Pixiv 有跨域/防盗链限制，用缩略图卡片 + "在 Pixiv 查看"按钮 |
| 其他平台 | 通用链接卡片 | 显示平台标签 + 标题 + 作者 + 外链按钮 |
| Markdown 渲染 | `marked` 库 | Wiki 攻略正文用 MD 编写，前端 `<div v-html>` 渲染 |
| 数据驱动 | `fetch('/shrine-data/index.json')` | 添加内容只需编辑 JSON |
| SPA 兜底 | JSON 内嵌 5 条兜底数据 | 复用 HotTopics.vue 模式，检测 Content-Type 判断是否被 SPA 拦截 |
| 粒子背景 | CSS only `<div>` + `@keyframes` | 3-5 个菱形伪雷晶，不同延迟/速度浮动 |

### 8. 实施步骤

1. **准备图片**：用户将雷电将军立绘放到 `frontend/public/shrine-data/images/avatar.png`
2. **创建数据文件**：`frontend/public/shrine-data/index.json`，填入初始数据（gallery ≥ 5 条、guides ≥ 2 条、news ≥ 3 条）
3. **安装依赖**：`npm install marked`
4. **创建 ElectroParticles.vue**：CSS 浮动雷晶粒子背景
5. **创建 RaidenHero.vue**：立绘+角色名+称号+金句+简介，紫色发光边框，标题呼吸发光
6. **创建 GalleryTab.vue**：响应式网格，B站/Pixiv/其他平台卡片，hover 雷光边框
7. **创建 WikiTab.vue**：三分类卡片+Markdown 展开，左侧金色/紫色/粉色竖线
8. **创建 NewsTab.vue**：垂直时间线，紫色发光节点
9. **创建 Shrine.vue**：集成所有子组件 + Tab 切换 + 数据加载 + SPA 兜底
10. **配置路由**：router 添加 `/shrine`
11. **更新导航**：Sidebar 添加"厨厨⚡"
12. **构建验证**：`npm run build`
13. **Git 提交**："feat: 新增厨厨板块 — 雷电将军角色应援页"

=====================================================================
