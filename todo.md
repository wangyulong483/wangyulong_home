按**设计灵感站**、**标杆产品官网**、**中文参考**、**设计系统/规范**四类推荐，

---

## 一、设计灵感站（找整体风格）

| 网站 | 特点 | 适合引用 |
|------|------|---------|
| **Awwwards** | 全球年度最佳网页评选，评审维度全（设计、可用性、创意、内容） | "参考Awwwards年度获奖作品的叙事性滚动布局" |
| **Dribbble** | 设计师社区，UI组件、插画、配色方案极丰富 | "参考Dribbble热门作品的卡片圆角与阴影处理" |
| **Behance** | 完整项目展示，能看到设计思路到落地的全过程 | "参考Behance上完整的品牌视觉系统" |
| **Mobbin** | 收录真实App/网站的截图库，可按组件筛选 | "参考Mobbin上科技类App的导航栏与列表页" |
| **Page Collective** | 专门收集落地页（Landing Page），分类清晰 | "参考Page Collective上SaaS类产品的Hero区设计" |
| **UI8** | 高质量设计模板与资源，偏付费但审美在线 | "参考UI8模板的网格系统与信息层级" |

---

## 二、标杆产品官网（学交互与气质）

这些网站的设计本身就是行业标准，提示词里直接点名效果最好：

| 网站 | 核心设计语言 | 适合场景 |
|------|-------------|---------|
| **Linear.app** | 极简、深色、无装饰、极致的留白与微动效 | 技术工具类、开发者产品、个人博客 |
| **Stripe.com** | 信息架构清晰、渐变插画、文档与营销完美结合 | 产品文档站、技术博客、API介绍页 |
| **Vercel.com** | 科技感、大字号、几何图形、深色模式标杆 | 前端开发者个人站、技术展示页 |
| **Notion.so** | 温和、低饱和、卡片式、信息密度适中 | 内容型博客、知识库、笔记类产品 |
| **Linear/Supabase/Resend** | 新一波"开发者工具美学"：深色底+亮色强调+等宽字体 | 技术类个人品牌、开源项目主页 |
| **Apple.com** | 大图叙事、滚动驱动动画、极致的产品摄影 | 硬件展示、作品集、需要视觉冲击的页面 |
| **GitHub.com** | 功能优先、高密度信息、清晰的标签与筛选 | 开源项目页、文档站、仪表盘 |
| **Framer.com** | 强烈的视觉动效、3D元素、滚动交互丰富 | 创意作品集、前端能力展示页 |

---

## 三、中文优秀参考（中文排版与本土化）

| 网站 | 特点 |
|------|------|
| **阮一峰的网络日志** | 极简、信息密度高、无干扰、中文长文阅读体验好 |
| **少数派 (sspai.com)** | 卡片流、标签系统、图文混排、社区感强 |
| **即刻App网页版** | 信息流设计、轻社交、移动端适配优秀 |
| **语雀/飞书文档** | 中文排版、层级清晰、协作工具的界面逻辑 |
| **哔哩哔哩创作中心** | 复杂信息 dashboard 的本土化设计参考 |

---

## 四、设计系统/规范（学底层规则）

| 资源 | 用途 |
|------|------|
| **Material Design 3 (Google)** | 组件规范、动效曲线、响应式断点标准 |
| **Apple Human Interface Guidelines** | 苹果生态的设计哲学、字体、色彩、交互模式 |
| **Ant Design / Arco Design** | 中后台系统组件规范，适合仪表盘、管理后台 |
| **Tailwind UI** | 实用主义组件库，代码可直接抄，审美不翻车 |
| **Shadcn/ui** | 新兴的无头组件库，结合Radix UI，风格现代简洁 |

---

## 需求

1. 删除生日模块（已完成）
2. UI 全面翻新：极简技术风格，暗色默认主题，科技感视觉
3. 配色方案升级：主色 #6C5CE7 + 辅助 #00D2FF + 暗色背景
4. 字体升级：引入 Geist Sans + Geist Mono（或 Inter），建立清晰字号层级
5. 保留右侧边栏结构，统一暗色风格
6. 暗色/亮色模式无闪烁切换
7. 适度动效：滚动渐显、hover 微交互、页面过渡
8. 移动端适配：320px ~ 超宽屏全覆盖

## 方案

### 一、配色系统

| 角色 | 暗色主题 | 亮色主题 | 用途 |
|------|---------|---------|------|
| 主强调色 | #6C5CE7 | #5B4ED3 | 链接/按钮/激活态/图标高亮 |
| 辅助强调色 | #00D2FF | #009FC4 | hover 状态/次要高亮/装饰 |
| 页面背景 | #0A0A0F | #FAFAFA | body background |
| 卡片/面板背景 | rgba(255,255,255,0.03) | rgba(0,0,0,0.02) | 卡片、容器 |
| 边框 | rgba(255,255,255,0.06) | rgba(0,0,0,0.08) | 卡片边框、分割线 |
| 一级文字 | rgba(255,255,255,0.92) | #1A1A1A | 标题、正文 |
| 二级文字 | rgba(255,255,255,0.55) | #737373 | 摘要、日期、标签 |
| 三级文字 | rgba(255,255,255,0.30) | #A3A3A3 | 水印、占位符 |

所有颜色定义为 CSS 自定义属性，body 切换 `data-theme="dark|light"` 属性。

### 二、字体系统

- **标题**：Geist Sans / Inter（600/700 weight），使用 clamp() 流式字号：
  - H1: clamp(2rem, 5vw, 3.5rem)
  - H2: clamp(1.5rem, 3vw, 2.2rem)
  - H3: 1.25rem
- **正文**：Geist Sans / Inter（400 weight），16px base
- **代码/技术标签**：Geist Mono / JetBrains Mono
- **中文字体回退**：`"PingFang SC", "Microsoft YaHei", sans-serif`
- **引入方式**：Google Fonts CDN 或 @fontsource 自托管

### 三、布局结构

**保留右侧边栏**，桌面端固定，移动端滑出：
- 侧边栏暗色风格：`background: rgba(255,255,255,0.02)` + 微弱右边框
- 导航链接：hover 淡紫微光 + 左侧线指示器
- 头像保留，缩小至 80px

**内容区**：
- 首页：大标题居中 Hero（无玻璃容器）+ 应用卡片网格
- 关于页：视频网格保留，卡片改为暗色边框风格
- Shrine 页：保留暗色主题，适配新配色
- 移除 `.liquid-glass` 和 `.glass-card` 全局样式

### 四、组件改动清单

| 文件 | 改动 |
|------|------|
| `index.html` | 引入字体 CDN；`<head>` 中 inline script 防暗色闪烁 |
| `App.vue` | 删除 glass-card/liquid-glass CSS、SVG 噪声滤镜、背景动画；替换全局 CSS 变量为暗色系统 |
| `Sidebar.vue` | 暗色风格重写：深色背景 + 微光边框 + 左侧激活指示器 + 主题切换按钮 |
| `Carousel.vue` | 暗色主题适配 |
| `ParticleBackground.vue` | 粒子颜色改为 #6C5CE7，密度降低 |
| `Home.vue` | 移除玻璃类名，Hero 增大标题，替换卡片样式 |
| `About.vue` | 移除玻璃类名，视频卡片暗色边框化 |
| `AppList.vue` | 移除玻璃类名，应用卡片暗色科技风 |
| `Game.vue` | 移除玻璃类名，游戏容器暗色适配 |
| `HotTopics.vue` | 移除玻璃类名，搜索框/标签暗色适配 |
| `Shrine.vue` + 子组件 | 微调配色与新的 CSS 变量对齐 |

### 五、暗色模式无闪烁切换

`index.html` 的 `<head>` 最前端加入 inline script：

```html
<script>
  (function() {
    var t = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  })();
</script>
```

- 默认暗色（无 localStorage 记录 = dark）
- 侧边栏底部添加太阳/月亮图标切换按钮
- 切换逻辑：`document.documentElement.setAttribute('data-theme', ...)` + `localStorage.setItem('theme', ...)`

### 六、动效方案

**保留/新增**：
- Intersection Observer 滚动渐显（opacity 0→1 + translateY 20px→0）
- 卡片 hover：border-color 微光 + translateY(-2px)
- 链接 hover：颜色过渡 + 下划线滑入
- `<router-view>` 包裹 `<Transition>` 页面切换淡入淡出

**移除/降级**：
- 移除 liquid-shine 光扫动画
- 移除 SVG 噪声滤镜（#liquid-noise）
- 移除 body 背景色轮播（gradient-flow）
- 粒子背景密度降低、速度减慢

**无障碍**：`@media (prefers-reduced-motion: reduce)` 禁用所有动画

### 七、移动端适配

- 主断点：768px（平板）、480px（手机）
- 侧边栏 ≤768px 滑出式（保留现有逻辑）
- 卡片网格：桌面 3 列 → 平板 2 列 → 手机 1 列
- 安全区适配保留：`env(safe-area-inset-*)`
- 触摸目标最小 44px 保留
- 移动端减弱毛玻璃效果（保留现有规则）

### 八、实施步骤

| 步骤 | 内容 | 涉及文件 |
|------|------|---------|
| 1 | 引入字体 + 定义新配色 CSS 变量系统 | `index.html`, `App.vue` |
| 2 | 暗色模式切换系统（inline script + toggle 组件） | `index.html`, `Sidebar.vue` |
| 3 | 重写 App.vue 全局样式（删除旧玻璃系统，新卡片样式） | `App.vue` |
| 4 | 逐个改造页面：Home → AppList → About → HotTopics → Game | `src/views/*.vue` |
| 5 | 改造 Sidebar 暗色风格 + 主题切换按钮 | `Sidebar.vue` |
| 6 | 适配 Shrine 页（暗色主体，微调配色） | `Shrine.vue` + 子组件 |
| 7 | 动效系统：滚动渐显 + hover 微交互 + 页面过渡 | `App.vue`, 各组件 |
| 8 | 粒子背景降级优化 | `ParticleBackground.vue` |
| 9 | 构建验证 + 移动端测试 | 全项目 |

===============================================================

## 需求

首页沉浸式滚动过渡：全屏视频开场 → 滚动触发 → 视频退出 → 页面组件展开

### 初始状态
- 视频 `position:fixed; z-index:10` 覆盖整个 viewport（最高层）
- 不显示侧边栏、导航、粒子、内容——用户只能看到视频

### 滚动驱动动画
- 全部动画由 `progress = clamp(scrollY / window.innerHeight, 0, 1)` 驱动
- `progress=0` = 页顶（全屏视频）/ `progress=1` = hero 完全滚过

| progress 区间 | 视频 | 侧边栏 | 内容 | body padding | 粒子 |
|--------------|------|--------|------|-------------|------|
| 0.00–0.15 | opacity 1→0.85, scale 1→1.01 | opacity 0, translateX 20px | opacity 0, translateY 40px | 0 | 隐藏 |
| 0.15–0.25 | opacity 0.85→0.5, scale 1.01→1.03, blur 0→5px | — | — | 0 | 渐显 |
| 0.25–0.55 | opacity 0.5→0, scale 1.03→1.05, blur 5→10px | opacity 0→0.8, translateX 20→5px | opacity 0→0.6, translateY 40→15px | 0→100px | 渐显 |
| 0.55–0.80 | opacity 0 | opacity 0.8→1, translateX 5→0 | opacity 0.6→1, translateY 15→0 | 100→200px | 完全可见 |
| 0.80–1.00 | opacity 0 | opacity 1 | opacity 1 | 200px | 完全可见 |

### 动画曲线
- 使用 `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) 映射 progress → 动画值
- 全部通过 inline style 应用，不依赖 CSS transition

### 技术约束
- **不引入新依赖**（无 GSAP / Motion），纯 Vue 3 实现
- `requestAnimationFrame` 驱动 scroll 监听
- CSS `transform` + `opacity` + `filter` （GPU 加速属性）
- video `will-change: transform, opacity, filter`

## 方案

### 一、共享状态：useHeroScroll.js

```js
export const heroProgress = ref(0)  // 0→1，唯一滚动进度

// 各元素动画值（computed，由 heroProgress 派生）
export const videoStyle = computed(() => ({...}))
export const sidebarStyle = computed(() => ({...}))
export const contentStyle = computed(() => ({...}))
export const bodyPadding = computed(() => ...)
```

### 二、组件改动

| 文件 | 改动 |
|------|------|
| `useHeroScroll.js` | heroProgress + 5 个 computed 动画值 |
| `Home.vue` | video 绑定 videoStyle；内容绑定 contentStyle；body bg 透明；scroll→rAF→heroProgress |
| `Sidebar.vue` | 直接绑定 sidebarStyle + bodyPadding；去掉 heroVisible 二元逻辑 |
| `App.vue` | ParticleBackground 绑定 heroProgress 控制显隐 |

### 三、实施步骤

1. 重写 `useHeroScroll.js`
2. 重写 `Home.vue`
3. 重写 `Sidebar.vue`（去掉 v-if Transition，改用 style 绑定）
4. 调整 `App.vue`
5. 构建验证

===============================================================
## 需求

优化首页呈现方式，实现 Apple 产品页风格的滚动驱动渐进式体验：

1. **初始状态**：页面只有全屏视频，连侧边栏都不可见
2. **滚动过程**：视频随下滑逐渐淡出（opacity 1→0）
3. **渐进呈现**：视频淡出后，白色右侧侧边栏出现，其他组件（内容卡片）也渐显出现
4. **视频来源**：使用 `shrine_data/试试_6.mp4`（已存在，56MB）

## 方案

### 参考来源

- **Apple 产品页**（Vision Pro / iPhone）：全屏 Hero 视频 → 滚动驱动视频淡出 → 内容渐进出现
- **21st.dev Video Scroll Hero**：视频固定定位 + CSS Transform + 滚动触发透明度
- **Awwwards Inkwell**：滚动驱动叙事，单页无导航，章节式展开
- **Apple Watch Ultra 页**：导航栏 + 侧边栏在 Hero 之后才出现，给产品最大展示空间

### 核心思路

**复用并增强现有 `useHeroScroll` 机制**，将 `heroScroll`（0→1 的滚动进度）作为所有元素动画的驱动变量：

```
滚动位置 0%（页面顶部）
  → video opacity: 1, sidebar opacity: 0, content opacity: 0
  → body padding-right: 0（视频占满全屏）

滚动位置 0% → 100%（视口高度范围内）
  → video opacity: 1 → 0（线性淡出）
  → sidebar opacity: 0 → 1（video 淡出到 50% 后开始淡入）
  → content opacity: 0 → 1（video 淡出到 70% 后开始淡入）

滚动位置 ≥ 100%（完全滚过 hero）
  → video opacity: 0（完全隐藏）
  → sidebar opacity: 1（完全可见）
  → content opacity: 1（完全可见）
  → body padding-right: 200px（恢复侧边栏空间）
```

### 实施步骤

| 步骤 | 内容 | 涉及文件 |
|------|------|---------|
| 1 | 复制视频文件 `试试_6.mp4` 到 `frontend/public/video/` | 文件操作 |
| 2 | 增强 `useHeroScroll.js` — 导出 `heroOpacity`（video 透明度）和 `sidebarOpacity`（sidebar 透明度）计算属性 | `composables/useHeroScroll.js` |
| 3 | 改造 `Home.vue` — 视频源切换 + video 元素绑定 opacity + 内容卡片绑定渐显动画 + hero 高度改回 100vh | `views/Home.vue` |
| 4 | 改造 `Sidebar.vue` — 使用 `heroScroll` 驱动平滑 opacity 过渡（替代二元 `heroVisible`）+ sidebar 背景白色 | `components/Sidebar.vue` |
| 5 | 调整 `App.vue` — body padding-right 平滑过渡，初始无 padding | `App.vue` |
| 6 | 构建验证 `npm run build` | 全项目 |

### 技术细节

**1. useHeroScroll 增强**：
```js
// 新增计算导出（由 Home.vue 在 scroll handler 中更新）
export const heroScroll = ref(0)      // 0→1，滚动进度（已有）
export const heroVisible = ref(true)  // hero 是否在视口（已有）
export const videoOpacity = ref(1)    // 新增：视频透明度 1→0
export const sidebarOpacity = ref(0)  // 新增：侧边栏透明度 0→1
```

**2. Home.vue 改动**：
- 视频 `src` 改为 `/video/试试_6.mp4`
- 视频容器添加 `:style="{ opacity: videoOpacity }"`
- 内容区卡片添加 `:style="{ opacity: 1 - videoOpacity }"`（视频淡出时内容淡入）
- scroll handler 中计算：`videoOpacity = 1 - heroScroll`，`sidebarOpacity = heroScroll > 0.3 ? (heroScroll - 0.3) / 0.7 : 0`

**3. Sidebar.vue 改动**：
- `.right-box` 的 `opacity` 绑定到 `sidebarOpacity` 而非 `heroVisible`
- sidebar 背景在亮色模式下为白色 `background: #fff`
- 过渡使用 `transition: opacity 0.15s linear`（跟随滚动，无延迟）

**4. App.vue 改动**：
- body `padding-right` 在 sidebar 不可见时为 0，可见时恢复 200px
- 平滑过渡：`transition: padding-right 0.5s ease`

### 关键动画曲线

```
进度变量与 heroScroll 的映射关系（heroScroll: 0=顶部, 1=hero完全滚过）:

videoOpacity    = clamp(0, 1 - heroScroll * 1.3, 1)
                  // heroScroll=0→1, videoOpacity=1→0
                  // 1.3 倍速确保视频在滚到 77% 时已完全透明

sidebarOpacity  = clamp(0, (heroScroll - 0.2) / 0.6, 1)
                  // heroScroll=0.2→0.8, sidebarOpacity=0→1
                  // 视频开始淡出后再出现侧边栏

contentOpacity  = clamp(0, (heroScroll - 0.35) / 0.55, 1)
                  // heroScroll=0.35→0.9, contentOpacity=0→1
                  // 侧边栏出现后再出现内容卡片
```

### 移动端适配

- ≤768px 时 video 替换为静态 poster 图（已有逻辑保留）
- 移动端 sidebar 滑出逻辑保留
- 移动端始终保持 `padding-right: 0`

===============================================================
