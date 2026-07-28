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

优化首页移动端适配，在保留“全屏视频 → 视频淡出 → 首页出现”的滚动过渡基础上，让移动端完成态更突出雷电将军人物主题。

- 移动端首屏视频仍然只展示人物视频，不出现菜单、文字或卡片
- 视频完全淡出后，先呈现清晰、完整的人物主视觉，再进入首页文字和功能内容
- 使用雷电将军专属的雷紫、电光白和少量金色建立统一视觉识别
- 保证 360px、390px、430px 等常见手机宽度下无横向溢出、文字遮挡和控件重叠
- 桌面端现有布局与过渡效果保持不变

## 方案

### 视觉方向

采用“人物海报 → 角色宣言 → 首页内容”的移动端叙事。研究参考表明，人物主题站点应先用角色本身建立第一视觉信号，再让角色专属色贯穿导航与内容；滚动动画仅使用 `opacity` 和 `transform`，避免移动端掉帧。

1. **人物主视觉**
   - 复用 `frontend/public/shrine-data/images/image.png`（750×1899，约 500 KB）作为移动端竖版人物海报
   - 在视频转场完成后的第一屏全宽展示，使用稳定的 `min-height`、`aspect-ratio` 与 `object-position` 保证面部和主体不被裁掉
   - 人物区不放进卡片，保持沉浸式、无边框的完整画面

2. **角色身份层**
   - 在人物图底部加入克制的身份信息：`雷电将军 / RAIDEN SHOGUN / 一心净土`
   - 文字使用高对比纯色与轻量阴影，不覆盖人物面部
   - 人物图与下方名言之间使用深色实体过渡，不使用装饰性渐变或光斑

3. **移动端内容层级**
   - 人物主视觉后依次显示尼采名言、“关于 MY_WEBSITE”和“学习平台”
   - 卡片改为更紧凑的移动端间距，学习平台链接使用两列/自适应网格，保证触控区域至少 44px
   - 粒子背景降低密度和透明度，避免抢人物主体

4. **移动端导航**
   - 汉堡按钮改为雷紫高对比样式，并在视频完全退出后出现
   - 抽屉顶部补充人物头像与 `雷电影` 身份信息，白色抽屉保持清晰可读
   - 保留现有打开、关闭、Esc 和路由跳转行为

### 动画与性能

- `HeroTransition.vue` 为移动端人物区增加独立的错峰入场节点，视频归零后再淡入人物主视觉
- 图片使用 `loading="eager"`、固定尺寸和 `object-fit`，避免布局偏移
- 不使用 12.8 MB 的透明立绘 `image (1).png`，控制移动端首屏资源体积
- 尊重 `prefers-reduced-motion`，减少动画时只保留直接淡入

### 涉及文件

| 文件 | 改动 |
|------|------|
| `frontend/src/views/Home.vue` | 增加移动端人物主视觉与响应式内容布局 |
| `frontend/src/components/HeroTransition.vue` | 调整移动端人物区的入场顺序 |
| `frontend/src/components/Sidebar.vue` | 优化移动端菜单按钮和人物身份区 |
| `frontend/src/App.vue` | 降低移动端粒子密度（如需） |

### 验证

1. 执行 `npm run build`，确认 Vue/Vite 编译通过
2. 使用 360×800、390×844、430×932 三种移动视口检查首屏、过渡中段、人物完成态和内容区
3. 检查视频与海报资源响应、页面横向溢出、菜单开合和路由返回顶部
4. 桌面 1440×900 回归检查，确保现有布局不变

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

## 需求

首页沉浸式滚动效果重构：修正 DOM 架构层面的根本问题，实现 Apple 产品页级别的两阶段滚动叙事。

### 当前实现的核心问题（DOM 架构错误）

```
现有结构：
  Video (fixed z-100)
  Hero Text (z-101)
  Content Cards (z-1, 正常流)
  
问题：视频和内容在 z 轴上简单堆叠，滚动时就像"视频背景 + 普通页面往下滚"
```

这不是调 CSS 能解决的问题。需要**推翻重建动画架构**。

### 目标体验

参考 Apple MacBook Pro / Vision Pro 产品页：

```
Stage 1 (首屏):     全屏视频独占，无导航、无侧边栏
Stage 2 (过渡区):   200-300vh 的滚动空间，视频退出 + 内容登场
Stage 3 (正常页):   完整首页，导航/内容/侧边栏全部就位
```

## 方案

### 研究总结：我们学到的 5 个关键教训

从 Apple、Stripe、Linear、Vercel、Zentry 的实际分析中提炼：

| # | 教训 | 来源 | 在我们的项目中如何应用 |
|---|------|------|----------------------|
| 1 | **Hold Phase** — 动画不是一路 fade 到底，而是 entry→hold→exit 三段式 | Apple 产品页 | 视频前 15% 的 scroll 保持不变（让用户看清），之后才开始退出 |
| 2 | **Staggered Reveal** — 每个元素有独立的时间窗口，错峰出现 | Stripe 首页 | 标题→描述→卡片→侧边栏，间隔 10-15% progress |
| 3 | **Scroll Room** — 用 300-500vh 的 spacer 制造滚动距离 | Apple/Zentry | 过渡区高度设为 250vh，而不是 100vh |
| 4 | **z-index 舞台模型** — 不是"视频背景+内容"，而是"视频舞台 → 幕布拉开 → 内容登场" | 所有参考站 | VideoLayer (fixed z-100) → TransitionSpacer → MainStage (z-1) |
| 5 | **ScrollTrigger scrub** — 动画精确绑定到滚动位置，可双向播放 | Awwwards 获奖站 | 使用 GSAP ScrollTrigger + scrub:true |

### 新 DOM 架构

```
Home.vue
│
├── <div class="hero-stage">          ← fixed, z-index: 100, 覆盖全屏
│   ├── <video class="hero-video">    ← 全屏视频
│   ├── <div class="hero-overlay">    ← 渐变遮罩
│   └── <div class="hero-text">       ← 尼采名言 + 滚动提示
│
├── <div class="transition-spacer">   ← height: 250vh, 不可见
│                                         作用是制造滚动距离
│
├── <div class="main-stage">          ← position: relative, z-index: 1
│   ├── <div class="content-card">    ← 关于 MY_WEBSITE
│   ├── <div class="content-card">    ← 学习平台
│   └── ...
│
└── (Sidebar 在 App.vue 中，fixed z-99)
```

**关键区别**：
- 旧架构：video (z-100) + content (z-1) 直接堆叠，滚动就露出下面的 content
- 新架构：hero-stage 和 main-stage 之间有一个 **250vh 的 spacer**，视频在 spacer 滚动期间慢慢退出，内容在 spacer 后半段慢慢出现

### GSAP ScrollTrigger 动画时间线

```
scrollProgress:  0 (过渡区顶部) → 1 (过渡区底部，scrollY=250vh)

═══════════════════════════════════════════════════════════
阶段 1: HOLD (progress 0.00 → 0.12)
═══════════════════════════════════════════════════════════
  视频:   opacity 1, scale 1, blur 0
  内容:   全部隐藏
  侧边栏: 全部隐藏
  body:   padding-right 0
  
  视觉效果：视频保持完整显示，让用户沉浸 3-5 秒的滚动距离

═══════════════════════════════════════════════════════════
阶段 2: VIDEO EXIT (progress 0.12 → 0.48)
═══════════════════════════════════════════════════════════
  视频:   opacity 1 → 0
          scale 1 → 1.12 (镜头拉远感)
          blur 0 → 8px
          brightness 1 → 0.4 (变暗，电影转场感)
  
  hero文字: opacity 1 → 0, translateY 0 → -30px (先于视频离去)

═══════════════════════════════════════════════════════════
阶段 3: CONTENT ENTRANCE (progress 0.35 → 0.80)
═══════════════════════════════════════════════════════════
  用 stagger 错峰出现:
  
  0.35→0.55:  第一个卡片 (关于MY_WEBSITE)
              opacity 0→1, translateY 60px→0
  
  0.48→0.68:  第二个卡片 (学习平台)  
              opacity 0→1, translateY 60px→0
  
  0.40→0.65:  侧边栏
              opacity 0→1, translateX 80px→0
              body padding-right 0→200px

═══════════════════════════════════════════════════════════
阶段 4: COMPLETE (progress 0.80 → 1.00)
═══════════════════════════════════════════════════════════
  所有元素就位，video pointer-events: none
  用户继续正常滚动浏览
```

### 动画曲线

不使用线性插值，使用以下 easing：

```js
// 视频退出：ease-in-out，先慢后快再慢
const videoEase = 'power2.inOut'

// 内容进入：ease-out，快速出现然后减速到达终点
const contentEase = 'power3.out'

// 侧边栏：ease-out expo，丝滑滑入
const sidebarEase = 'expo.out'
```

### 解决横向滚动条问题

当前 `body { padding-right: 200px }` + `video { width: 100vw }` 导致 100vw 不包含 padding，产生横向溢出。

修复方案：
```css
body {
  padding-right: 0;           /* 初始无 padding */
  overflow-x: hidden;          /* 防止横向溢出 */
}
.hero-video {
  width: 100%;                /* 不用 100vw */
  left: 0; right: 0;          /* 跟随 body padding 自适应 */
}
/* padding-right 在动画后期才过渡到 200px */
```

### 技术选型：GSAP ScrollTrigger

引入 GSAP 的理由（基于研究结论）：

| 需求 | 纯 Vue/rAF 方案 | GSAP ScrollTrigger |
|------|----------------|-------------------|
| 视频 scrub 到滚动 | 手动 map scrollY → 属性 | `scrub: true` 一行搞定 |
| Hold phase | 手动分段 if/else | `timeline` 自然支持 |
| Stagger 错峰 | 手动写多个 computed | `stagger` 属性 |
| 双向滚动回放 | 计算式天然支持 | 内置支持 |
| pin 固定元素 | 手动切换 position | `pin: true` |
| 性能 | 需要自己调优 | GSAP 已优化 10+ 年 |

包大小：GSAP + ScrollTrigger ≈ 30KB gzipped，对首页加载影响可接受。

### 组件改动清单

| 文件 | 改动类型 | 内容 |
|------|---------|------|
| `frontend/package.json` | 新增依赖 | `npm install gsap` |
| `frontend/src/views/Home.vue` | **重写** | 新 DOM 结构（hero-stage + spacer + main-stage），GSAP ScrollTrigger 动画 |
| `frontend/src/composables/useHeroScroll.js` | **重写** | 简化为 GSAP 动画状态管理，废弃旧的 computed 驱动方式 |
| `frontend/src/components/Sidebar.vue` | 修改 | 使用 GSAP 动画替代 inline style 绑定，侧边栏从右侧滑入 |
| `frontend/src/App.vue` | 修改 | body padding-right 过渡由 GSAP 驱动，移除旧的 CSS transition |

### 实施步骤

| 步骤 | 内容 | 涉及文件 |
|------|------|---------|
| 1 | 安装 GSAP | `frontend/package.json` |
| 2 | 重写 `useHeroScroll.js` — GSAP timeline + ScrollTrigger | `composables/useHeroScroll.js` |
| 3 | 重写 `Home.vue` — 新 DOM 架构 | `views/Home.vue` |
| 4 | 修改 `Sidebar.vue` — GSAP 驱动的入场动画 | `components/Sidebar.vue` |
| 5 | 修改 `App.vue` — body padding + overflow-x 修复 | `App.vue` |
| 6 | 移动端适配 — ≤768px 降级为静态图 | `Home.vue` |
| 7 | `npm run build` 构建验证 | 全项目 |

===============================================================

## 需求

彻底重做首页过渡：参考 nanfu.global 的环形开合转场，实现"全屏视频舞台 → 圆形虹膜关闭 → 首页内容绽放"的滚动叙事。

### 新交互流程

```
初始状态（scroll=0）              转场中（scroll 0→200vh）        最终状态（scroll≥200vh）
┌────────────────────┐           ┌────────────────────┐        ┌──────┬──────────────┐
│ Video Fullscreen   │           │ ╭─clip-path缩小─╮  │        │Video │ 名言          │
│                    │     →     │ │ Video          │  │   →   │      │ 关于MY_WEBSITE│
│ 名言（左侧，不挡人）│           │ ╰────────────────╯  │        │      │ 学习平台      │
│                    │           │  内容从中心绽放     │        └──────┴──────┬───────┘
└────────────────────┘           └────────────────────┘                     │Sidebar│
                                                                           └───────┘
```

### 核心改动

1. **环形虹膜转场**：Hero mask 使用 `clip-path: circle(100% → 0%)`，从中心收缩消失，露出下方首页
2. **名言平滑飞入**：名言从视频左侧 → 飞到内容区上方（FLIP 动画）
3. **视频位置切换**：全屏视频消失 → 首页左列出现缩略视频
4. **侧边栏 + 卡片**：stagger 淡入

## 方案

### DOM 架构

```
Home.vue
├── .homepage-base（正常流，始终存在，初始被 hero-mask 遮挡）
│   ├── .page-layout
│   │   ├── .video-col     → video（最终位置，初始隐藏）
│   │   └── .content-col   → 名言目标位 + 内容卡片
│   └── Sidebar（App.vue）
│
├── .hero-mask（fixed 全屏，z-100，clip-path: circle）
│   └── <video> 全屏
│
├── .hero-quote（fixed，初始在视频左侧）
│   └── 名言 → GSAP FLIP 飞入 .content-col 目标位
│
└── .transition-spacer（200vh）
```

### 动画时间线（GSAP ScrollTrigger + scrub）

```
progress 0→1，对应 spacer 200vh 滚动区间

0.00→0.10  HOLD：      视频全屏 + 名言在左侧
0.10→0.55  IRIS CLOSE： clip-path: circle(100%) → circle(0%)
                        名言 FLIP：从视频左侧飞向内容区上方
0.40→0.65  CARDS：      内容卡片 stagger 淡入（opacity + translateY）
0.45→0.70  SIDEBAR：    侧边栏滑入 + body padding 过渡
0.55→1.00  COMPLETE：   全部就位，正常浏览
```

### 技术选型

- `clip-path: circle()` 虹膜遮罩（GPU 加速，性能最优）
- GSAP ScrollTrigger + scrub 驱动
- 名言使用 FLIP 动画（JS 计算初始/目标位置，GSAP tween translate）

### 实施步骤

| 步骤 | 内容 |
|------|------|
| 1 | 重写 HeroTransition.vue → 改为 iris 架构 |
| 2 | 重写 Home.vue → 新布局（video左 + content右） |
| 3 | 更新 useHeroScroll.js |
| 4 | 构建验证 |

===============================================================
