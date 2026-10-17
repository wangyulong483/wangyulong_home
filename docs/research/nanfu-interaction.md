# 南孚国际站（nanfu.global）页面结构 · 时间轴交互 · 动效技术调研

> 目标：为 **Vue 3 + Vite + GSAP** 的个人站复刻该站的「时间轴」与「动态页面」体验提供可直接落地的技术依据。
>
> **重要前提**：`https://www.nanfu.global/` 由阿里云 ESA（`Server: ESA`）保护，首次请求返回 `acw_sc__v2` JS 挑战（响应头 `X-Tengine-Error: denied by http_auto_ratelimit`），**不含真实内容**。本调研没有停留在「被拦截」这一步，而是：
> 1. 在无头环境下执行了挑战脚本中的 `acw_sc__v2` 计算逻辑，取回 Cookie 后成功请求到**真实 HTML（47,001 字节）**；
> 2. 依据真实 HTML 中的资源路径，进一步下载了同域下的 **`index.55.css`（231,809 字节）** 与两个 JS bundle（`index.091b56b9.js` 993,867 字节 / `index.d9c9dbee1.js` 909,628 字节）。
>
> 因此本文中标注为「**高可信**」的结论，全部来自**真实线上产物的源码直读**，不是二手推测。Wayback Machine 在本次调研所在网络下 DNS 被污染/连接超时（`archive.org` → `199.59.149.237`、`web.archive.org` → `31.13.96.194`），未能作为数据来源，详见第 8 节。

---

## 0. 数据来源与取证清单

| 编号 | 来源 | 说明 | 可复现性 |
|---|---|---|---|
| S1 | [https://www.nanfu.global/](https://www.nanfu.global/) | 首页 HTML（47,001 B），需通过 ESA 挑战 | 高（需先解挑战） |
| S2 | [/templates/assets/index.55.css](https://www.nanfu.global/templates/assets/index.55.css) | 全站主样式（231,809 B） | 高 |
| S3 | [/templates/assets/index.091b56b9.js?v=19](https://www.nanfu.global/templates/assets/index.091b56b9.js?v=19) | **`nomodule` 传统包**（993,867 B），时间轴逻辑**两份均为启用状态** | 高 |
| S4 | [/templates/assets/index.d9c9dbee1.js?v=19](https://www.nanfu.global/templates/assets/index.d9c9dbee1.js?v=19) | **`type="module"` 现代包**（909,628 B） | 高 |
| S5 | [/templates/assets/respone.css](https://www.nanfu.global/templates/assets/respone.css) | 466 B，仅极少量兜底 | 高 |
| S6 | [/templates/assets/home/batteryFm/00000.webp?v=2](https://www.nanfu.global/templates/assets/home/batteryFm/00000.webp?v=2) | 电池帧序列首帧（HTTP 206 / `image/webp`） | 高 |
| S7 | [/templates/assets/home/bannerFm/00000.webp?v=2](https://www.nanfu.global/templates/assets/home/bannerFm/00000.webp?v=2) | 首屏帧序列首帧（HTTP 206 / `image/webp`） | 高 |
| S8 | [https://www.nanfu.global/about](https://www.nanfu.global/about) | 关于页 HTML（32,094 B），用于对比（**无 `.process` 时间轴**） | 高 |
| S9 | [UUNN 优势互动官网](https://www.uunn.cn/) | 站点 `<meta name="author">` 与页脚署名 `uunn.cn` 指向的设计公司 | 高 |
| S10 | [UUNN 案例列表 — 南孚电池国际站](https://shuimubio.uunn.com/cases) | 明确列出「南孚电池国际站 / NANFU Global」，服务项「网站设计 / 3D创意」，品牌色 `#E5171E` | 高 |
| S11 | [UUNN `/work` 作品页](https://shuimubio.uunn.com/work) | NANFU Global 作品卡（`nanfu.uunn.cn` 预览链接） | 高 |
| S12 | [UUNN 共享 `app.js`](https://shuimubio.uunn.com/templates/assets/app.js?v=3265992) | 该公司自有模板包（1,071,642 B）：**GSAP 3.11.4 + Lenis 0.2.28 + Three.js r109 + jQuery** | 高 |
| S13 | [UUNN `/work/67` 南孚·数字化](https://shuimubio.uunn.com/work/67) | 注意：这是**另一个交付物**（3D 可视化数字大屏，蓝色调），**不是** nanfu.global 网站 | 高 |
| S14 | [数英 DIGITALING《南孚中文官网VS英文官网，这差别也太大了吧》](https://m.digitaling.com/articles/1315740.html) | 二手设计评论（原文） | 中 |
| S15 | [优网科技 转载同文](https://www.uweb.net.cn/zhishiku/jianzhanliuchengyugongju/23034.html) | 二手转载 | 低（转载） |

---

## 1. 站点结构

### 1.1 顶层骨架

首页的真实 DOM 骨架（来自 S1 直读）：

```
<body>
  <div id="app">
    <header class="fxc">
      <nav class="pcNav fxb pc">      ← 桌面导航：logo + 3 个 navItems + 语言切换(7 语) + 联系按钮
      <nav class="appNav app">        ← 移动导航：logo + 语言选择 + #menu 汉堡
    </header>
    <nav class="menu">                ← 全屏导航遮罩：.items > .content > .lists×4
      <svg class="shape-overlays">    ← 菜单开合用的 SVG 形变遮罩（viewBox="0 0 100 100"）
    <main class="home">
      <div class="row banner" data-vh="2.3">   ← ① 首屏
      <div class='row y1'>                     ← ② 全球足迹（注意：该块属性用单引号）
      <div class="row y9">                     ← ③ 中国市场地位
      <div class="row r5">                     ← ④ ★ 时间轴
      <div class="row r1" data-vh="4">         ← ⑤ 三大能力（sticky 分段）
      <div class="row r2" style="display: none;"> ← ⑥ Our Brands（**内联隐藏**）
      <div class="row y2" data-vh="2">         ← ⑦ 可持续 / 碳中和
      <div class="row r3">                     ← ⑧ Globally Trusted（热点卡片轮播）
    <div class="fixBox">              ← 右下悬浮联系按钮（.go 状态会展开）
    <footer>                          ← ★ top / mid / btm 三层
    <div class="hide">                ← cnzz 统计脚本容器
```

**区块顺序（按 `main.home` 直接子元素实测顺序）**：
`banner → y9 → r5 → r1 → r2 → y2 → r3`，其中 `y1` 使用单引号属性 `<div class='row y1'>` 因此常被自动化脚本漏掉，它的真实位置在 **banner 与 y9 之间**。

> ⚠️ **`row r2`（Our Brands）在线上 HTML 中被内联 `style="display: none;"` 隐藏**。复刻时若以「视觉所见」为准，不应把它算作可见区块。（高可信，S1 直读）

### 1.2 各区块的信息层级

| 区块 | 类名 | 主标题（实测原文） | 信息层级 |
|---|---|---|---|
| ① 首屏 | `.row.banner` | 品牌主张 + `No. 1 / Longest Lasting / Alkaline Battery` | `video#firstMedia` 背景视频 → 滚动后切到 `canvas.bannerCv` 帧序列 → `#fn1` 内 `h1.f-60` 主标题 + 免责声明 `p.f-12` + `#fn2` 内 `h2.f-34` 与 `video` 列表 + `img.cir` 装饰 |
| ② 全球足迹 | `.row.y1` | `Globally Trusted` / `Chosen by consumers in 30+ countries worldwide` | `h2.f-120` → `div.f-36` 副标 → `.tip-table` 图例（Nanfu / Partnerships 两类圆点）→ `.map-box` 世界地图 + 28 个 `r-box`/`b-box` 国家锚点（china、russian、vietnam、uae、turkey、brazil、mexico、korea、japan、pilippine、singapore、malaysia、arabia、poland×2、nigeria、germany、uk、spain、morocco、venezuela、colombia、usa、belgium、denmark、uzbekistan…） |
| ③ 中国地位 | `.row.y9` | `No.1 Battery Brand in China` | `h2.f-96` → `img cmap.png` 中国地图 + 3 个城市节点（Shanghai 全球品牌中心 / Nanping, Fujian 全球研发制造中心 / Shenzhen, Guangdong 产品创新中心）→ `.list` 3 个 `div.f-64` 大数字（`33` 连续领跑年数、`86%` 市占率、`3.1M+` 销售网点）+ `div.f-22` 说明 |
| ④ **时间轴** | `.row.r5` | `Pioneering / the Evolution of / Lasting Power` + `NANFU's 70-year heritage…` | 3 个 `span.letter`（逐行遮罩揭开）→ `h3.f-24` 段落 → **7 个 `.part.history`**（`h4.f-90` 年份 + `p.f-24` 说明）→ `canvas.batteryCv` 电池帧序列。年份：**1954 / 1988 / 1993 / 2002 / 2005 / 2020 / 2023** |
| ⑤ 三大能力 | `.row.r1` | `Relentless Innovation` / `Advanced Manufacturing` / `Uncompromising Quality` | `.tabBox` 3 个 tab → 3 个 `.tabParent` 面板，各含 `small.f-36` 标签 + `h2.f-300` 大数字（`500+` 专利、`No.1` 全球最大单体工厂、`415` 质检点）+ `div.f-20` 说明 |
| ⑥ Our Brands | `.row.r2` | `Our Brands` | **线上隐藏**；3 张卡：NANFU-Alkaline / TRUSVOLT-Lithium Coin / RICHPLUS-Zinc-Carbon |
| ⑦ 可持续 | `.row.y2` | `Powering Tomorrow` | `h2.f-120` + `.list` 2 个 `li`（含 `div.f-30`）+ `.ybg` 圆形裁切背景 + `img.cir`/`img.cir2` |
| ⑧ 全球信赖 | `.row.r3` | `Globally Trusted` + `Chosen by consumers in 30+ countries worldwide` | `h2.f-120` + `p.f-36` → 全幅 `video` 背景（`inMedia` / `loopMedia` 两段，切换逻辑见 §3.7）→ Swiper 热点卡片 `.chunk`（绝对定位 `top/left` 内联，如 `top:57%;left:8%`），每卡含 `backdrop-filter` 玻璃底 `.mask`、`h3.f-28`、`p.f-16` 与**虚线引线 SVG** |

> 注：`.row.y1` 与 `.row.r3` 的主标题原文都是 `Globally Trusted` + 同一句副标题。这看起来是线上内容配置的重复，如实记录。（高可信，S1 直读）

### 1.3 页脚的三层结构（top / mid / btm）

来自 S1 + S2 直读，`#app footer { background-color: #1a1a1a; padding: 1.8rem 1.2rem 0.7rem; }`：

| 层 | 结构 | 关键样式（实测） |
|---|---|---|
| **`.top`** | `a.logo > img` + `ul.items`（3 个 `li`，每 `li` 为「栏目标题 + 3 个链接」） | `align-items:flex-start; margin-bottom:0.8rem;`；`.items{ width:50%; grid-template-columns:repeat(5,auto); justify-content:space-between; padding-top:0.2rem; padding-right:1rem; display:grid }`；`.logo>img{ height:0.57rem }`；栏目标题 `.word_h{margin-bottom:0.2rem}`；链接 `.word-l{ color:rgba(255,255,255,0.5); line-height:0.3rem }`，`:hover{ color:#fff }` |
| **`.mid`** | `ul.items`（4 个 `li`：`i.iconfont.f-20` + `p.f-18`）+ `div.box`（`div.shareBox`×2：订阅表单 + 社交图标） | `align-items:flex-end; padding-bottom:0.6rem;`；`.items` 纵向 flex；`.items>li{ max-width:5.4rem; padding:0.12rem 0 }`；`.box{ width:50%; align-items:flex-start; padding-right:1rem }`；订阅输入 `.inRow{ height:0.54rem; width:3.2rem; background:#f2f2f2; border:none; border-radius:1rem }`；社交圆钮 `.share{ width:0.44rem; height:0.44rem; background:#efefef; border-radius:50%; margin-right:0.12rem; overflow:hidden }`，各平台图标色 `#3c5a99`(FB) / `#000`(X) / `#d81e06`(TikTok) / `#0077b5`(LinkedIn) |
| **`.btm`** | `p.c1` 版权 + `div.c2` + `p.c3` 署名 | `border-top:1px solid rgba(242,242,242,0.15); display:grid; grid-template-columns:50% 2fr 1fr; padding:0.3rem 0 0.6rem;`；`.c1{ color:rgba(239,239,239,0.3) }` `.c2{ color:rgba(239,239,239,0.8) }` `.c3{ color:#efefef; text-align:right }`（c3 实测文本 `Web Designed by uunn.cn`） |

移动端（`@media (orientation: portrait)`）：`.top` 整体 `display:none`，`.mid` 改 `flex-wrap:wrap`、`.items` 变单列 grid、`.btm` 变单列且 `.c3{ text-align:left }`。

---

## 2. ★ 时间轴（`.row.r5`）交互机制 —— 本文重点

### 2.1 一句话结论

南孚的时间轴**不是**竖向 sticky 进度线，也**不是**年份数字滚动。它是一个：

> **「CSS `position:sticky` 钉住 100vh 视口 + JS 按 `.part` 数量动态撑高外层容器 + ScrollTrigger scrub 驱动横向 `translateX` + 7 段帧序列 canvas 沿轨道移动并逐帧播放」的横向滚动叙事**。
>
> 年份高亮**不靠 JS 切 class**，而是靠 **GSAP 改写一个 CSS 自定义属性 `--go`，去 scrub 一段 `animation-play-state: paused` 的 `clip-path` 关键帧**，把「20% 透明度的底字」用遮罩逐行刷成实色。**全站动效几乎不用 `ease` 缓动曲线，而是用 `ease:"none"` + ScrollTrigger 的 `scrub` 平滑量来制造惯性手感**。

### 2.2 DOM 结构（S1 直读，原样归纳）

```html
<div class="row r5">
  <div class="inner" data-vh="1">                 <!-- 100vh，sticky -->
    <div class="bg"><div class="pic full lazy" data-src="/templates/assets/about/d1.jpg"></div></div>
    <div class="pro maxSize">
      <div class="box">
        <div id="r5Scr" class="layer-scr">        <!-- "scroll to explore" + 鼠标滚动图标 -->
          <span class="txt f-14 word_b">scroll to explore</span>
          <span class="mouse"><em class="line"></em></span>
        </div>
      </div>
      <div class="layer-icon"><i class="iconfont f-100 mc">&#xe677;</i></div>
      <img class="cir setImg" src="/templates/assets/pro/circle.svg" alt="">
    </div>

    <div class="group process">                   <!-- ★ 横向轨道 -->
      <div class="part">                          <!-- 1) 标题块 -->
        <div class="col fxs">
          <h2 class="f-80 word_h txt">
            <span data-scroll class="letter" data-go="1" data-note="Pioneering ">Pioneering </span>
            <span data-scroll class="letter" data-go="1" data-note="the Evolution of ">the Evolution of </span>
            <span data-scroll class="letter" data-go="1" data-note="Lasting Power">Lasting Power</span>
          </h2>
        </div>
      </div>
      <div class="part note">                     <!-- 2) 段落块 -->
        <h3 class="f-24 word_r">NANFU's 70-year heritage<br>is built upon engineering the<br>world's longest-lasting power</h3>
      </div>

      <div class="part history">                  <!-- 3..9) 7 个年份节点 -->
        <h4 class="f-90 word_b txt-color">1954</h4>
        <p class="f-24 word_r">Fuzhou Battery was founded…</p>
      </div>
      <!-- ×7：1954 / 1988 / 1993 / 2002 / 2005 / 2020 / 2023 -->

      <div class="frame">                         <!-- ★ 电池帧序列画布 -->
        <canvas class="batteryCv"
                data-path="/templates/assets/home/batteryFm"
                data-count="150"></canvas>
      </div>
    </div>
  </div>
</div>
```

**关键计数（直接决定所有动画时长比例）**：
- `c = |.part| = 9`（1 标题 + 1 段落 + 7 年份）
- `u = |.history| = 7`
- `l = |[data-go]| = 3`

### 2.3 粘性（sticky）策略

**用纯 CSS sticky，不是 GSAP `pin`**（这一点对复刻很重要，CSS sticky 更容易与 Vue 路由/组件卸载共处）：

```css
/* S2 直读，节选 */
.home .r5 { width: 100%; height: 600vh; }                 /* ← 无 JS 兜底值 */
.home .r5 .inner { width: 100%; height: 100vh;
  position: sticky; top: 0; left: 0; overflow: hidden; }   /* ← 粘性窗口 */
.home .r5 .inner .group { display: grid; grid-auto-flow: column; justify-content: start; }
.home .r5 .inner .group .part { height: 100%; width: 100vw; padding-top: 2.05rem; padding-bottom: 2.5rem; }
.home .r5 .inner .group .part.note { width: 50vw; display: flex; justify-content: center; align-items: center; }
.home .r5 .inner .group .history { width: 40vw; flex-direction: column;
  justify-content: flex-end; align-items: flex-start;
  padding-left: 4%; padding-right: 5%; position: relative; }
.home .r5 .inner .group .history:nth-of-type(2n + 1) { height: 50%; padding-bottom: 0.65rem; z-index: 5; }
.home .r5 .inner .group .frame { width: 5rem; height: 1.5rem; margin: auto 0;
  position: absolute; top: 0; bottom: 0; left: calc(50vw - 2.5rem); z-index: 6; }
```

**要点**：
1. 轨道 `.group.process` 用 **CSS Grid + `grid-auto-flow: column`** 天然横向排列，宽度由子项宽度累加。
2. 轨道容器初始**没有**显式宽度；JS 累加各 `.part` 实测宽度后 `gsap.set` 写死宽度（见 §2.4 第 4 步）。
3. 奇数个 `.history`（`nth-of-type(2n+1)`）高度 50%，偶数个 100% → **天然的上下交错（zigzag）节点排布**，不需要 JS 计算。
4. `.frame` 是 `position:absolute` + `margin:auto 0` 垂直居中，`left: calc(50vw - 2.5rem)`（=50vw−250px），画布 500×150px。
5. 外层容器高度由 JS 覆盖（`600vh` 只是无 JS 兜底）：

```js
// S3 直读（index.091b56b9.js，pos≈983082；S4 同类逻辑在 pos≈869253）
jQuery(".r5").css("height", winsize.vh * (c + 0.5));   // 9.5 × 100vh = 950vh
```

### 2.4 ScrollTrigger 编排（S3/S4 直读，逐条）

```js
// 变量名按源码，语义已注释
var value = { value: 0 };
var parts    = process.querySelectorAll(".part");      // c = 9
var history  = process.querySelectorAll(".history");   // u = 7
var goEls    = process.querySelectorAll("[data-go]");   // l = 3
var totalW = 0;

// ── ① 滚动提示 "scroll to explore" 的显隐（toggleClass）
ScrollTrigger.create({
  trigger: document.querySelector("#r5Scr"),
  start: "+=" + vh,
  end:   "+=" + vh * (c + 2),
  toggleActions: "restart pause resume none",
  toggleClass: "on",                                    // → .layer-scr.on { opacity: 0 }
});

// ── ② 逐 [data-go] 元素把 --go 从 0 刷到 1（错峰起点 + scrub 0.9）
goEls.forEach(function (el, i) {
  gsap.timeline({
    scrollTrigger: {
      trigger: process,
      start: "-=" + (-0.1 * vh * i),   // 等价于 +=0.1*vh*i → 第 i 个元素晚 0.1 屏开始
      end:   "+=" + 0.8 * vh,
      scrub: 0.9
    }
  })
  .addLabel("start", 0)
  .to(el, { "--go": 1, ease: "linear" }, "start");
});

// ── ③ 累加宽度 + 横向位移（只在最后一个 .part 上执行一次）
parts.forEach(function (el, i) {
  totalW += el.getBoundingClientRect().width;
  if (i !== c - 1) return;

  gsap.set(process, { width: totalW });

  gsap.timeline({
    scrollTrigger: { trigger: process, start: "+=" + 0.2 * vh,
                     end: "+=" + vh * (c - 1), scrub: 0.8 }
  })
  .addLabel("start", 0)
  .fromTo(process, { x: 0 }, { x: -(totalW - 0.5 * vw), ease: "none" });

  // ── ④ 电池帧序列帧 + 画布横移
  gsap.timeline({
    scrollTrigger: { trigger: process, start: "-=" + vh,
                     end: "+=" + vh * (c + 1), scrub: 0.8,
                     onUpdate: function () { batteryCanvas.upData(parseInt(value.value)); } }
  })
  .addLabel("start", 0)
  .fromTo(frame,
    { opacity: 0, x: -0.5 * vw },
    { opacity: 1, x: -0.25 * vw, duration: 13 / ((88 / 6) * u + 13), ease: "none" }, "start")
  .addLabel("cvStart")
  .to(frame, { x: totalW, ease: "none", duration: (14.5 * u) / (14.5 * u + 13) }, "cvStart")
  .fromTo(value, { value: 0 }, { value: 150 * c, duration: 1, ease: "none" }, "start");
});
```

### 2.5 时间轴参数速查表（照抄即可）

| 参数 | 实测值（源码直读） | 作用 |
|---|---|---|
| 外层高度 | `vh × (c + 0.5)` = **950vh** | 提供横向滚动所需滚动距离；CSS 兜底 600vh |
| 粘性层 | `height:100vh; position:sticky; top:0; overflow:hidden` | 钉住视口 |
| `#r5Scr` 提示 | start `+=1vh`，end `+=1vh×(c+2)`=`+=11vh`，`toggleActions:"restart pause resume none"`，`toggleClass:"on"` | 进入后淡出滚动提示 |
| `--go` 逐元素 | start `+=0.1vh×i`，end `+=0.8vh`，**`scrub: 0.9`**，`ease:"linear"` | 3 行标题按序错峰揭开 |
| 横向位移 | start `+=0.2vh`，end `+=vh×(c−1)`=`+=8vh`，**`scrub: 0.8`**，`x: 0 → −(Σw − 0.5vw)`，`ease:"none"` | 轨道横向滚动 |
| 画布横移 | start `−=1vh`，end `+=vh×(c+1)`=`+=10vh`，**`scrub: 0.8`** | 电池沿轨道从左侧移到最右 |
| 画布入场 duration | `13 / ((88/6) × u + 13)`，u=7 → **≈0.1124**（归一化） | 两段式时间轴的第 1 段占比 |
| 画布横移 duration | `(14.5 × u) / (14.5 × u + 13)`，u=7 → **≈0.8865** | 第 2 段占比（≈1 − 第 1 段） |
| 画布入场位移 | `x: −0.5vw → −0.25vw`，同段 `opacity: 0 → 1` | 从屏幕外滑入到居中偏左 |
| 帧数值域 | `0 → 150 × c` = **0 → 1350** | 驱动 `canvas.upData()` |
| 节点数量 | 9 个 `.part`、7 个 `.history`、3 个 `[data-go]` | 全部由 DOM 数量动态推导 |

> 💡 **可复用洞察**：`13` 与 `14.5` 这两个魔数是把「入场」与「横move」按节点数配平到总时长 1 的权重。`13 + 14.5×u = 总权重`，`入场占比 = 13 / (13 + 14.5u)`。**节点越多，入场占比越小，横移占比越大**——这是一个可以照搬到任意节点数时间轴的配平公式。

### 2.6 年份高亮：`--go` + 暂停关键帧的「伪 scrub」技巧（全站最值得偷的一招）

**底字**是 20% 透明度的文字，**上面盖一层 `::after` 实色同字**，用 `clip-path` 从左到右把实色字刷出来：

```css
/* S2 直读（节选，已保留原值） */
.home .r5 .inner .group .part .col .txt .letter {
  color: rgba(26, 26, 26, 0.2);
  line-height: 1.3;
  display: block;
}
.home .r5 .inner .group .part .col .txt .letter:after {
  content: attr(data-note);       /* ★ 直接复用同名文字，无需复制 DOM */
  width: 100%;
  color: #1a1a1a;
  line-height: 1.3; font-size: inherit; font-family: inherit; font-weight: inherit;
  will-change: transform, opacity;
  animation-name: clip;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-play-state: paused;              /* ★ 动画本身永不自动播放 */
  animation-delay: calc(var(--go) * -1s);    /* ★ 用负延迟把进度「钉」在 --go 上 */
  position: absolute; top: 0; left: 0;
}

@keyframes clip {
  0%  { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }      /* 完全收起 */
  5%  { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }      /* 5% 前不动（缓冲） */
  30% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }  /* 30% 时已全开 */
  to  { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }  /* 之后保持 */
}
```

**原理**：`animation-play-state: paused` 冻结动画，`animation-delay` 取负值等价于「从动画时间轴的第 `--go` 秒开始」；`--go` 由 GSAP 线性 0→1，于是**滚动进度 = 动画进度**。因为 `@keyframes clip` 在 5%→30% 之间就完成全部位移，所以视觉上文字在滚动的头一小段里被「刷」出来，之后定格。

> ⚠️ **实测坑（务必注意）**：全站 CSS **从未声明 `--go` 的初值**（我全文检索 `--go` 只出现在 `animation-delay: calc(var(--go) * -1s)` 这类消费处）。GSAP 对未定义自定义属性做补间时依赖其被解析为空值→按 0 处理。**在 Vue 里复刻时请务必在 CSS 里显式写 `--go: 0;`**，否则某些浏览器/SSR hydration 时机会出现闪一下或首帧错误。（高可信：源码中确实没有声明；中可信：GSAP 的具体容错行为未逐浏览器验证）

**同一个技巧在站内至少复用了 4 处**：

| 用途 | 选择器 | 关键帧 | `animation-timing-function` |
|---|---|---|---|
| 时间轴标题逐行揭开 | `.home .r5 … .letter:after` | `clip` | `linear` |
| 首屏标题开「窗」（遮罩内缩） | `.home .banner .inner>.bg .clip` | `chunkFn`（桌面）/ `chunkFn_app`（移动） | `ease-in-out` |
| 首屏/分屏整页横向擦除 | `.home .r1 .inner .mid .group.tabParent` | `pageFn` | `ease-in-out` |
| 可持续区块圆形裁切展开 | `.home .y2 .ybg` | `ybgscla` / `bgcap` | — |

关键帧实测值：

```css
@keyframes pageFn  { 0% { clip-path: inset(0); } to { clip-path: inset(0 100vw 0 0); } }
@keyframes chunkFn { 0% { clip-path: inset(0); }
                     to { clip-path: inset(1.5rem 55vw 0.9rem 1.2rem round 0.6rem); } }   /* 桌面 */
@keyframes chunkFn_app { 0% { clip-path: inset(0); }
                     to { clip-path: inset(1.6rem 5vw 60% round 0.3rem); } }              /* 竖屏 */
@keyframes bgcap   { 0%,50% { clip-path: circle(29% at 50% 50%); }
                     90%,100% { clip-path: circle(100% at 50% 50%); } }
@keyframes ybgscla { 0% { transform: scale(0.3); } 50%,100% { transform: scale(1); } }
```

### 2.7 帧序列 canvas（`.batteryCv`）—— 「3D 电池」的真相

站内共两个帧序列画布：

| 画布 | `data-path` | `data-count` | 实际帧 URL（已验 HTTP 206 `image/webp`） | 移动端路径 |
|---|---|---|---|---|
| `canvas.bannerCv` | `/templates/assets/home/bannerFm/` | **120** | `…/bannerFm/00000.webp?v=2` … `00119.webp?v=2` | `data-apppath="/templates/assets/home/bannerFm_app/"` |
| `canvas.batteryCv` | `/templates/assets/home/batteryFm` | **150** | `…/batteryFm/00000.webp?v=2` … `00149.webp?v=2` | 无（仅桌面路径） |

**加载器实现（`Sr`/`Tr` 类，S3 直读，pos≈547130–553600）**：

```js
// 帧路径拼接（源码直读）
for (var i = 0; i < this.frameCount; i++)
  list.push(path + "/" + i.toString().padStart(5, "0") + ".webp?v=2");

// 预加载：桌面 new Image(1920,1000)，竖屏 new Image(1080,1700)
// Promise.all(...) 全部完成后 drawFitCoverImage(images[0])

// 画布后备缓冲 = 父元素 getBoundingClientRect() × devicePixelRatio，并在 resize 时重算
// drawFitCoverImage() 手写 object-fit: cover 的裁切数学（coverImg() 返回 sx/sy/sw/sh）
// upData(n)：n 钳制到 [0, frameCount-1] 后 drawFitCoverImage(images[n])
```

**结论（高可信）**：`nanfu.global` 的两个 bundle 中 **`THREE` / `WebGL` / `ShaderMaterial` 出现次数均为 0**，站点**没有引入 Three.js**。视觉上的「3D 电池出场动画」是 **150 张预渲染 WebP 帧序列**，由滚动进度逐帧 seek 出来的。这一点与设计公司自述的服务项「3D建模渲染」一致（S10/S13）——「3D」是**离线渲染**，不是实时 WebGL。

### 2.8 与时间轴并置的「第二时间轴」：`.row.r3` 热点卡片

`.row.r3`（Globally Trusted）用的是另一套类时间轴语言——**背景视频 + 浮动热点卡片 + 虚线引线**：

```css
/* S2 直读 */
.home .r3 .inner .photo .box .chunk { position: absolute; top: 50%; left: 50%; }   /* 实际坐标由内联 style 覆盖 */
.home .r3 .inner .photo .box .chunk > .mask {
  backdrop-filter: blur(0.2rem);
  background-color: rgba(35, 35, 35, 0.6);
  border-radius: 0.24rem;
  transition: background-color 0.5s cubic-bezier(0.38, 0, 0, 1);
  overflow: hidden; }
.home .r3 .inner .photo .box .chunk .msg .topic .lineBox .dot {
  width: 0.3rem; height: 0.3rem;
  background-color: rgba(255, 255, 255, 0.3);
  border: 1px solid #fff; border-radius: 50%; position: absolute; }
.home .r3 .inner .photo .box .chunk .msg .topic .lineBox .dot:after {
  width: 0.1rem; height: 0.1rem; content: ""; background-color: #fff; border-radius: 50%; }
.home .r3 .inner .photo .box .chunk .msg .topic .lineBox .leftLine  { width: 4rem;  display: block; }
.home .r3 .inner .photo .box .chunk .msg .topic .lineBox .rightLine { width: 4.5rem; display: none; }
```

SVG 引线（HTML 直读）：`<path stroke="rgb(255,255,255)" stroke-width="1.5px" stroke-dasharray="1.5, 4.5" fill="none" d="…">`。
`.lineBox.left` / `.lineBox.right` 通过 `display` 切换左/右引线，实现**卡片在圆点左侧或右侧时引线朝外延伸**。

---

## 3. 动态页面 / 动效手法（含实测时长与缓动）

### 3.1 全站缓动与默认值（最重要的两条）

```js
/* S3 直读，pos≈948990 */
gsap.defaults({ duration: 1, ease: "none" });   // ① GSAP 全局默认：1 秒 + 线性
```

```css
/* S2 全文统计 */
/* cubic-bezier(0.38, 0, 0, 1)  → 出现 134 次（唯一的“签名曲线”） */
/* cubic-bezier(0.43, 0.195, 0.02, 1) → 出现 1 次 */
```

**要点**：
- **滚动驱动的补间一律 `ease: "none"`**，手感平滑完全交给 `scrub: 0.8 / 0.9`（GSAP 内置的一阶跟随），因此没有「缓动曲线与滚动速率打架」的问题。
- **CSS 过渡/时间轴补间一律用 `cubic-bezier(0.38, 0, 0, 1)`**（强 ease-out，接近 `expo.out`，可用 `power4.out` 近似）。这是「高雅朴素」观感的核心：位移快出慢停、无回弹、无 overshoot。
- **动画时长分布**（源码里出现的所有值）：GSAP 时间轴 `1.5` / `1.2` / `0.5` / `0.1` / `3.2` / `2`（CountUp）/ `1`；CSS 过渡 `1s` / `1.2s` / `0.8s` / `0.5s` / `0.3s`；CSS 循环动画 `0.7s ease-in-out infinite alternate`（滚动提示图标）。

### 3.2 入场动画：`.alanFn`（ScrollTrigger.batch）

```js
/* S3 直读，pos≈948900 */
gsap.set(".alanFn", { y: 50, opacity: 0 });

ScrollTrigger.batch(".alanFn", {
  onEnter: function (batch) {
    batch.forEach(function (el) {
      if (el.querySelectorAll("[data-text]").length > 0) splitText(el, "in", "fx1"); // 逐字
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 1.5,
        delay: el.dataset.delay || 0,
        ease: "power3.out",
        overwrite: true
      });
      if (el.dataset.pic) {
        gsap.fromTo(el.querySelector(".pic"),
          { scale: 1.2, y: -50 },
          { scale: 1, y: 0, duration: 3.2, delay: el.dataset.delay || 0,
            ease: "power3.out", overwrite: true });
      }
    });
    return false;
  },
  onLeaveBack: function (el) {
    gsap.to(el, { opacity: 0, y: 50, duration: 0.5, overwrite: true });
  },
  start: "80px bottom",
  end: "top top"
});

ScrollTrigger.addEventListener("refreshInit", function () { return gsap.set(".alanFn", { y: 0 }); });
```

| 项目 | 值 |
|---|---|
| 标题入场 | `y: 50 → 0`、`opacity: 0 → 1`，`duration: 1.5`，`ease: "power3.out"`，`delay: data-delay \|\| 0` |
| 配图入场 | `scale: 1.2 → 1`、`y: -50 → 0`，`duration: 3.2`，`ease: "power3.out"` |
| 回滚复位 | `opacity: 0, y: 50`，`duration: 0.5` |
| 触发区间 | `start: "80px bottom"`，`end: "top top"` |
| 逐字/逐行 | 站内有自研 `SplitText`（`data-text` + `data-effect`，构造参数 `{ className: "[data-text]" }`，`data-delay` 用作错峰） |

`data-delay` 在线上 HTML 里的实测取值：`.03`（如 UUNN 自家站点）／nanfu.global 首页未见显式使用（走默认 0）。

`.alanFn` 的初始 CSS：
```css
.alanFn { transform-origin: -50%; perspective: 26.0417vw; backface-visibility: hidden; opacity: 0; }
```

### 3.3 级联入场：`.alanParent_up` / `.alanParent_left` + `.go`（纯 CSS 错峰，零 JS 延时）

这是该站**最巧妙的错峰实现**：**所有子元素用同一段过渡时长，靠 `nth-child` 给不同的起始位移量**，于是「同时开始、不同距离」自然形成瀑布感——完全不需要 `stagger` 参数。

```css
/* S2 直读 */
.alanParent_up .alanChild, .alanParent_up > .letter {
  opacity: 0; transform-origin: 0;
  transition: opacity 1s cubic-bezier(0.38, 0, 0, 1),
              transform 1s cubic-bezier(0.38, 0, 0, 1),
              color 0.3s cubic-bezier(0.38, 0, 0, 1);
}
.alanParent_up .alanChild:nth-child(1), .alanParent_up > .letter:nth-child(1) { transform: translateY(20%); }
.alanParent_up .alanChild:nth-child(2), .alanParent_up > .letter:nth-child(2) { transform: translateY(30%); }
/* … 每个 +10% … */
.alanParent_up .alanChild:nth-child(20), .alanParent_up > .letter:nth-child(20) { transform: translateY(210%); }

.alanParent_up.go .alanChild, .alanParent_up.go > .letter { opacity: 1; transform: translate(0, 0); }

/* 横向变体：位移量 20px 起、每级 +10px；时长 0.8s / 1.2s */
.alanParent_left .alanChild { opacity: 0; transform-origin: 0;
  transition: opacity 0.8s cubic-bezier(0.38, 0, 0, 1),
              transform 1.2s cubic-bezier(0.38, 0, 0, 1),
              color 0.3s cubic-bezier(0.38, 0, 0, 1); }
.alanParent_left .alanChild:nth-child(1)  { transform: translate(20px); }
.alanParent_left .alanChild:nth-child(11) { transform: translate(120px); }
.alanParent_left.go .alanChild { opacity: 1; transform: translate(0, 0); }
```

**触发**（JS 只负责加一个 class）：

```js
/* S3 直读，pos≈949300 */
document.querySelectorAll(".alanGo").forEach(function (el) {
  ScrollTrigger.create({
    trigger: el,
    start: "-=" + 0.9 * vh,
    end: "+=" + 3 * vh,
    toggleActions: "restart pause resume none",
    toggleClass: "go"
  });
});
```

| 变体 | 时长 | 起始位移 | 缓动 |
|---|---|---|---|
| `.alanParent_up`（页脚、列表上浮） | opacity `1s` + transform `1s` + color `0.3s` | `translateY(20% … +10%/级)` | `cubic-bezier(0.38,0,0,1)` |
| `.alanParent_left`（横向左入） | opacity `0.8s` + transform `1.2s` + color `0.3s` | `translate(20px … +10px/级)` | `cubic-bezier(0.38,0,0,1)` |

### 3.4 数字滚动：`.countFn` + CountUp

```js
/* S3 直读，pos≈949400 */
document.querySelectorAll(".countFn").forEach(function (el) {
  var target = el.querySelector(".count");
  if (!target) return;
  var end = parseFloat(target.innerHTML);
  gsap.set(el, { y: 30, rotate: 4, opacity: 0 });
  ScrollTrigger.create({
    trigger: el, start: "80px bottom", end: "top top",
    onEnter: function () {
      new CountUp(target, end, { duration: 2, decimalPlaces: end.toString().split(".").length - 1 }).start();
      gsap.to(el, { y: 0, rotate: 0, opacity: 1, ease: "power1.out", duration: 1.2 });
    },
    onLeaveBack: function () { gsap.to(el, { y: 30, opacity: 0 }); }
  });
});
```

| 项目 | 值 |
|---|---|
| 数字计数 | CountUp.js，`duration: 2` s，`decimalPlaces` 由原始文本小数点位数推导 |
| 容器入场 | `y: 30 → 0`、`rotate: 4deg → 0`、`opacity: 0 → 1`，`ease: "power1.out"`，`duration: 1.2` |
| 触发 | `start: "80px bottom"`，`end: "top top"` |
| 回滚 | `y: 30, opacity: 0`（无时长 → 走全局默认 1s / ease none） |

对应 DOM：`<h2 class="f-300 txt-color word_b"><em class="count">500+</em></h2>`（`.f-300` = 3rem = 300px @1920）。

### 3.5 滚动视差：`[data-scroll="x,y"]`

```js
/* S3 直读，pos≈949100 */
document.querySelectorAll("[data-scroll]").forEach(function (el) {
  var nx = parseInt(el.dataset.scroll.split(",")[0]);
  var ny = parseInt(el.dataset.scroll.split(",")[1]);
  if (portrait) { nx /= 2; ny /= 2; }
  gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: "top-=" + vh,
      end: "+=" + (el.getBoundingClientRect().height + vh),
      scrub: 0.9
    }
  }).fromTo(el, { x: -nx, y: -ny }, { x: nx, y: ny, ease: "none" });
});
```

实测取值形态：`data-scroll="0,80"`、`data-scroll="0,60"`、`data-scroll="0,100"`（UUNN 作品页同款）。**元素从 `(-x,-y)` 漂到 `(+x,+y)`，即往返 2× 偏移量，`scrub: 0.9`，线性。**

> 注意：时间轴里的 `.letter` 也带了裸 `data-scroll`（**无值**），会解析出 `NaN`；这是一个**惰性/无效果的属性残留**，复刻时不要模仿。

### 3.6 其它滚动驱动动效

```js
/* ① 圆形 SVG 装饰持续旋转：scrub 0.9，跨 10 屏缓慢转半圈 */
document.querySelectorAll(".setImg").forEach(function (el) {
  gsap.timeline({ scrollTrigger: { trigger: el, start: "-=" + vh, end: "+=" + 10 * vh, scrub: 0.9 } })
      .addLabel("start", 0)
      .to(el, { rotate: 180 }, "start");
});

/* ② 首屏文案随滚动漂移并淡出：fn1_alan / fn2_alan / fn3_alan（data-speed="x,y"） */
gsap.timeline({ scrollTrigger: { trigger: banner, start: "-=0", end: "+=" + 0.3 * vh, scrub: 0.9 } })
    .fromTo(el, { y: 0, x: 0, opacity: 1 },
                { y: sy, x: sx, opacity: 0, ease: "linear" }, "start");

/* ③ 可持续区块（.y2）的 fn3_alan：触发区间更靠后，用 visibility 切换 */
gsap.timeline({ scrollTrigger: { trigger: y2, start: "+=" + 0.65 * vh, end: "+=" + 0.8 * vh, scrub: 0.9 } })
    .fromTo(el, { y: sy, x: sx, opacity: 1, visibility: "hidden" },
                { y: 0, x: 0, opacity: 1, visibility: "visible", ease: "linear" }, "start");
```

### 3.7 首屏编舞（视频 → 帧序列 → 文字开窗）

```js
/* S3 直读，pos≈958500 起 */
// 载入后 1700ms：导航、悬浮按钮、首屏画布一起激活
setTimeout(function () {
  document.querySelector("header").classList.add("active");
  document.querySelector(".fixBox").classList.add("active");
  jQuery(".bannerCv").addClass("active");       // .bannerCv { opacity: 0 } → .active { opacity: 1 }
}, 1700);
// 载入后 2000ms：文案容器激活 + 首屏入场时间轴开跑
setTimeout(function () {
  firstMv.classList.add("active");
  startIntroTimeline();
}, 2000);

// 滚动驱动：第一屏内把 120 帧走完，同时视频淡出、标题遮罩开窗
gsap.timeline({
  scrollTrigger: { trigger: banner, start: "-=0", end: "+=" + vh, scrub: 0.9 },
  onUpdate: function () { bannerCanvas.upData(parseInt(value.value)); }
})
.addLabel("start", 0)
.fromTo(value, { value: 0 }, { value: 120, ease: "none" }, "start")          // 120 帧
.to(firstMedia.parentElement, { opacity: 0, duration: 0.1 }, "start")        // 视频让位
.to(fn1, { "--go": 1, ease: "linear" }, "start");                            // 标题 chunkFn 开窗
```

- 视频 `onended` → `fadeOut()` 父容器（`n.firstMedia.onended`）。
- **移动端 `data-vh` 才会被 JS 接管**：`portrait` 时 `gsap.set(el,{height: vh × parseFloat(el.dataset.vh)})` 并在 `window.onresize` 重算。桌面端这些高度由 CSS 负责。（**修正一个常见误解**：`data-vh` 不是「桌面端滚动长度配置」，它是竖屏高度覆盖机制。高可信，S3 直读）
- 实测 `data-vh` 取值：`.8`（`nav.menu .items`）、`1`（`.banner .inner`、`.r5 .inner`、`.r1 .tabParent`、`.y2 .incer`、`svg.shape-overlays`）、`2`（`.row.y2`）、`2.3`（`.row.banner`）、`4`（`.row.r1`）。

### 3.8 `.row.r1`：第二个 sticky 分段场景（`data-vh="4"`）

```css
/* S2 直读 */
.home .r1 { width: 100%; height: 420vh; background-color: #1a1a1a; }   /* 深色底 */
.home .r1 .inner { width: 100%; height: 100vh; position: sticky; top: 0; left: 0; overflow: hidden; }
.home .r1 .r1Mk { height: calc(100% - 200vh); width: 100%; margin: auto 0;
                  position: absolute; top: 0; bottom: 0; left: 0; pointer-events: none; }
.home .r1 .inner .tabBox .tab { opacity: 0.2; transition: opacity 0.5s cubic-bezier(0.38, 0, 0, 1); }
.home .r1 .inner .tabBox .tab.on { opacity: 1; }
.home .r1 .inner .mid .group.tabParent {
  will-change: transform, opacity;
  animation-duration: 1s; animation-timing-function: ease-in-out;
  animation-iteration-count: infinite; animation-direction: alternate;
  animation-play-state: paused;
  animation-delay: calc(var(--go) * -1s);
  animation-name: pageFn;                       /* inset(0) → inset(0 100vw 0 0) 横向擦除 */
}
/* 用 nth-of-type 做 3D 层叠：越靠前的面板 z-index 越高（8 → 1） */
.home .r1 .inner .mid .group:nth-of-type(1) { z-index: 8; } … :nth-of-type(8) { z-index: 1; }
```

**机制**：4 屏滚动（420vh / 400vh）里，3 个面板固定在同一个 100vh 窗口，靠 `pageFn` 的 `clip-path` 横向擦除依次揭出下一层；面板 `.alan` 用 `opacity 1s / transform 1s cubic-bezier(0.38,0,0,1)` 做内部级联。tab 点击用 `scrollTo` 精确定位到对应滚动段落：

```js
/* S4 直读（现代包），pos≈869200 附近 */
tabEl.addEventListener("click", function () {
  var top = document.querySelector(".r1").offsetTop;
  scrollTo(top + vh * segs * i);
});
```

### 3.9 菜单 / 导航动效

```js
/* S3 直读，pos≈990600 */
// 关闭：倒序遍历 .appNavList，逐个 opacity → 0, y: -30, duration 0.5, ease "power1.out"
//         最后一个 onComplete 里 gsap.to(menu, { autoAlpha: 0, duration: 0.1 })
// 打开：先加 .is-opened 到 svg.shape-overlays（SVG 形变遮罩），
//         再 gsap.to(menu, { autoAlpha: 1, duration: 0.1 })
```

- 全屏菜单：`<svg class="shape-overlays" viewBox="0 0 100 100" preserveAspectRatio="none">` + `.is-opened` 类切换（SVG path 形变，源码里被注释掉的 `.shape-overlays__path` 提示是一个「形变遮罩」方案）。
- 列表项错峰靠 `setTimeout(…, 600)` + 逐项 `opacity/y` 补间（`duration: 0.5`，`ease: "power1.out"`）。
- 语言切换：`jQuery(langChoose).toggleClass("on")` + CSS。

### 3.10 平滑滚动（Lenis）

- 全站 `window.lenisVersion = "0.2.28"`（S3/S4 直读，Lenis 内部构造时写入）→ **确证使用 Lenis 0.2.28**。
- 站点自有代码在两处直接调用**全局实例** `lenis`：
  ```js
  lenis.stop();    // 打开购买弹窗 #buyPop 时锁定滚动
  lenis.start();   // 关闭弹窗时解锁
  ```
- 由设计公司共享模板包（S12）同样内置 Lenis 0.2.28，可推断这是其模板的标准做法。
- 页面内跳转/锚点用的是封装的 `getTop()` + `scrollTo(pos)` 而不是原生 `scrollIntoView`（配合 Lenis 才能保持平滑）。
- **未能获取**：`new Lenis({...})` 的具体构造参数（`duration` / `easing` / `mouseMultiplier` / `smoothTouch`）——站点代码里对 `lenis` 只做了 `.stop()/.start()` 调用，构造处被压缩合并，无法直读。故 **Lenis 的 lerp/duration 数值：未能获取**（低可信区域，不做猜测）。

### 3.11 `.fixBox` 悬浮按钮展开

```css
#app .fixBox.go { transform: translate(calc(95vw - 3.8rem)); }         /* 移动端：translate(1.2rem) */
#app .fixBox.go .goMsg { border-top-right-radius: 0; border-bottom-right-radius: 0; }
#app .fixBox.go .goMsg .mask  { transition-delay: 0.3s; }
#app .fixBox.go .goMsg .txt   { width: 0; color: #fff; }
#app .fixBox.go .goMsg .iconfont { transition-delay: 0.3s; transform: translate(-0.1rem); color: #fff; }
#app .fixBox.go .goMsg { width: 1rem; background-color: #e60008; }      /* 移动端实测 */
#app .fixBox.go .goMsg:hover { width: 2.8rem; }
#app .fixBox.go .goMsg:hover .txt { width: 10.5em; }
```
触发：`ScrollTrigger.create({ trigger: fixBox, start: "-=0.5vh", end: "+=" + 1000*vh, toggleClass: "go", toggleActions: "restart pause resume none" })`——**`end: +=1000vh` 等于「之后一直保持」**，一个实用小技巧。

---

## 4. 视觉规范

### 4.1 配色（S2 全文十六进制频次统计）

| 色值 | 出现次数 | 判定用途 |
|---|---|---|
| `#fff` | 87 | 反白文字、描边（深色区块 / 页脚 / 玻璃卡） |
| `#000` | 65 | 纯黑底、渐变端点、遮罩基准 |
| **`#e60008`** | 45 | **南孚品牌红**（`.mc` 类强调色、悬浮按钮、圆点、边框） |
| **`#1a1a1a`** | 18 | **主文字色 + 页脚背景色**（`.home .r1` 背景亦为 `#1a1a1a`） |
| `#02a36b` | 14 | 辅助绿 |
| `#FCC800` / `#fcc800` | 14 / 11 | 辅助黄（`border-top: 5px solid #FCC800` 用于高亮条） |
| `#C292AC` | 8 | 辅助（粉紫，产品线） |
| `#789A5C` | 8 | 辅助（橄榄绿，产品线） |
| `#92C8F0` | 8 | 辅助（浅蓝，产品线） |
| `#f0f0f0` / `#efefef` / `#e9e9e9` / `#f2f2f2` / `#EBEBEB` / `#f5f5f5` | 5 / 4 / 5 / 3 / 3 / 3 | 各级浅灰：卡片底、社交圆钮底、输入框底 |
| `#ede8e2` | 5 | 暖灰（优雅中性色） |
| `#e51721` / `#e61721` | 5 / 4 | 品牌红的变体（设计公司作品卡 `data-color="#E5171E"` 与之同族） |
| `#999` / `#c2c2c2` / `#7E7D7C` / `#707070` / `#7e7e7e` / `#dadada` / `#dfdedf` | 少量 | 次级文字 / 分隔线 |

**透明色语义（最常用的几条）**：

| 值 | 用途 |
|---|---|
| `rgba(26, 26, 26, 0.2)` | **时间轴未激活底字**（关键） |
| `rgba(26, 26, 26, 0.5)` / `rgba(26,26,26,0.3)` | 虚线分隔线、次级说明 |
| `rgba(255, 255, 255, 0.5)` | 页脚链接默认色 |
| `rgba(35, 35, 35, 0.6)` | `.r3` 玻璃卡片底 |
| `rgba(242, 242, 242, 0.15)` | 页脚 `.btm` 上分隔线 |
| `rgba(0, 0, 0, 0.5)` / `(0,0,0,0.3)` | 图片上的文字保护遮罩 |
| `rgba(92, 84, 78, 0.3)` / `rgba(93, 77, 66, 0.3)` | 暖色阴影（卡片浮起） |

> **风格判断（与任务描述一致）**：主色只有「近黑 `#1a1a1a` + 白 + 一个高饱和红 `#e60008`」，其余皆为浅灰与极少量低饱和辅助色。**没有霓虹色、没有渐变光晕、没有玻璃拟态滥用**（仅 `.r3` 一处 `backdrop-filter: blur(0.2rem)`）。这是「高雅朴素」的配色依据。

### 4.2 字体与字号层级

```css
/* S2 直读 */
* , :after, :before {
  font-family: Microsoft YaHei, Microsoft JhengHei, Source Han Sans CN,
               PingFang SC, Source Han Serif SC, sans-serif;
}
h1, h2, h3, h4, h5 { font-weight: 100; }                       /* 标题默认极细 */
.word-h, .word_h, .word_b, .word-b { font-weight: 600; }        /* 需要强调时再上 600 */
```

- **全站零 Web 字体**：只用系统字体栈（中文雅黑/思源/苹方 + 西文 sans-serif），另有 `iconfont`（阿里 iconfont）承担图标。**这是「朴素」的第一来源**，也是性能上的取舍。
- 字号体系是 **rem + vw 流体**：
  ```css
  html { font-size: 5.20833vw; }   /* 5.20833vw = 100/19.2 → 1920px 宽时 1rem = 100px */
  @media screen and (orientation: portrait) {
    html { font-size: 55px; }
    .f-30,.f-28,.f-26,.f-24,.f-22,.f-20 { font-size: 16px; }   /* 竖屏正文归一为 16px */
  }
  ```
  **设计基准宽度 = 1920px，`1rem = 100px`，`.f-NN { font-size: 0.NN rem }` 即「NN px @1920」**。这是一个非常清晰、可整体移植的缩放策略。

| 类 | 字号（@1920） | 用途（实测出现位置） |
|---|---|---|
| `.f-300` | **300px**（3rem） | `.r1` 的 `h2.f-300` 大数字（500+ / No.1 / 415），`letter-spacing: -0.03em` |
| `.f-140` / `.f-120` / `.f-100` | **100px**（统一收到 `1rem`） | 各区块主标题（`h2.f-120`）、巨型图标 `i.f-100`；`letter-spacing: -0.03em` |
| `.f-96` | 96px（`.y9` 覆盖） | `No.1 Battery Brand in China` |
| `.f-90` | 90px | **时间轴年份** `h4.f-90`；`letter-spacing: -0.03em` |
| `.f-80` | 80px | 时间轴标题 `h2.f-80` |
| `.f-64` | 64px | `.y9` 统计数字（色 `#E10D08`、`font-weight: 700`） |
| `.f-60` | 60px | 首屏 `h1.f-60` |
| `.f-36` | 36px | 副标题 / tab 文字 |
| `.f-34` | 34px | 首屏 `h2.f-34` |
| `.f-30` / `.f-28` / `.f-24` / `.f-22` | 30 / 28 / 24 / 22px | 卡片标题（`h3.f-28`）、**时间轴说明正文 `p.f-24`**、`h3.f-24` |
| `.f-20` / `.f-18` / `.f-16` / `.f-15` / `.f-14` / `.f-12` | 20 / 18 / 16 / 15 / 14 / 12px | 正文、页脚、`.f-14` 滚动提示、`.f-12` 版权与免责声明 |

**层级规律**：区块主标题 `f-120`（≈100px）→ 区块副标 `f-36` → 卡片标题 `f-28` → 卡片正文 `f-16`；时间轴特殊：标题 `f-80`、年份 `f-90`（**年份比标题更大**，视觉上以年份为主角）、说明 `f-24`。大写数字类（`.word_h`/`.word_b`）统一 `font-weight: 600`，其余标题 `font-weight: 100`。

### 4.3 栅格、留白与容器

```css
/* S2 直读 */
.maxSize { width: 70%; max-width: 78.125vw; margin: auto; }
.max-wid { width: 72%; max-width: 62.5vw;  margin: auto; }
```

- **内容容器**：`.maxSize` = 宽 70%（上限 78.125vw = 1500px @1920）；`.max-wid` = 72%（上限 62.5vw = 1200px）。
- **页面留白**：以 rem 计的固定侧边距，主区块普遍 `padding: 1.4rem 1.2rem 0.9rem`（首屏）/ `padding: 1.8rem 1.2rem 0.7rem`（页脚）；时间轴 `.part` 为 `padding-top: 2.05rem; padding-bottom: 2.5rem`，`.history` 左右 `padding-left: 4%; padding-right: 5%`。
- 断点极少：仅 `@media screen and (orientation: portrait)`、`@media screen and (orientation: landscape)`、`@media screen and (max-width: 992px)` 三条。**主导思路是「用 vw 流体缩放替代断点」**。
- 布局原语（可整体搬运的工具类）：
  ```css
  .fxc { display:flex; justify-content:center; align-items:center; }
  .fxs { display:flex; justify-content:flex-start; align-items:center; }
  .fxb { display:flex; justify-content:space-between; align-items:center; }
  .full{ width:100%; height:100%; position:absolute; top:0; left:0; }
  .maxSize / .max-wid  /* 容器 */
  ```
  间距工具类：`.mt-10 … .mt-90`（`margin-top: 0.1rem … 0.9rem`）。

### 4.4 边框、分隔线、圆角、阴影

**圆角**（S2 统计，18 个不同值）：

| 值 | 次数 | 用途 |
|---|---|---|
| `50%` | 39 | 圆形：社交按钮、圆点、圆形装饰 |
| **`0.24rem`（24px）** | 18 | **主卡片圆角**（`.r3` 玻璃卡、`.proPop` 产品卡） |
| `0.15rem` | 7 | 次级卡片 |
| `1rem`（100px） | 5 | 胶囊形（页脚订阅输入框 `.inRow`） |
| `0.1rem` / `0.12rem` / `0.16rem` / `0.08rem` / `0.18rem` / `0.2rem` | 2–4 | 小元件 |
| `4px` | 3 | 例外的小圆角（少见 px，属遗留） |

**边框 / 分隔线**（走「1px 细线」路线，不用粗边框）：

| 声明 | 用途 |
|---|---|
| `border-top: 1px solid rgba(242, 242, 242, 0.15)` | 页脚 `.btm` 上分隔线（深底上的 15% 白） |
| `border-bottom: 1px dashed rgba(26, 26, 26, 0.5)` | 浅底上的虚线分隔 |
| `border-bottom: 1px solid #EAEAEA` | 浅灰实线分隔 |
| `border-right: 1px dashed rgba(255, 255, 255, 0.5)` | 深底虚线分隔 |
| `border-top: 5px solid #FCC800` | 唯一的粗线，作高亮条 |
| 时间轴引线 SVG | `stroke-width: 1.5px; stroke-dasharray: 1.5, 4.5` |

**阴影**（克制、以暖色为主）：

| 值 | 用途 |
|---|---|
| `0 5px 8px rgba(92, 84, 78, 0.3)` | 卡片浮起（暖灰，出现 6 次，最常用） |
| `0 0.6rem 1.4rem rgba(0, 0, 0, 0.5)` | 浮层（弹窗） |
| `0 0.3rem 1rem rgba(0, 0, 0, 0.3)` | 中号浮层 |
| `0 0.7rem 1.4rem rgba(0, 0, 0, 0.16)` | 轻柔浮起 |
| `0 3.38542vw 4.21875vw 4px rgba(93, 77, 66, 0.3)` | vw 单位的大投影（大屏装饰） |
| `0 0 0.2rem -2px rgba(0, 0, 0, 0.2)` | 细描边式阴影 |

### 4.5 循环指示动画

```css
@keyframes walk { 0% { transform: translate(0.12rem); } to { transform: translate(-0.12rem); } }
@keyframes jump { 0% { transform: translateY(0.05rem); } to { transform: translateY(-0.01rem); } }
.layer-scr .mouse { width:0.22rem; height:0.3rem; border:2px solid #1a1a1a; border-radius:0.09rem; }
.layer-scr .mouse .line { width:2px; height:6px; background-color:#1a1a1a;
                          animation: 0.7s ease-in-out infinite alternate jump; top:4px; }
.home .r5 .inner .pro .layer-icon { animation: 0.7s ease-in-out infinite alternate walk; }
```
滚动提示的「鼠标内滚轮上下轻微跳动」= `0.7s ease-in-out infinite alternate`，位移仅 `6px → 0.4px` 级别，**幅度极小、频率偏快**，是「朴素」而非「炫技」的典型。

---

## 5. 技术栈推断（含证据）

| 技术 | 判定 | 证据（源码直读） | 可信度 |
|---|---|---|---|
| **GSAP 3.11.4** | ✅ 确认 | `bs.version = "3.11.4"`（S3 pos≈641/section），全站 `gsap.to/fromTo/timeline/defaults/set` 调用 | **高** |
| **ScrollTrigger** | ✅ 确认 | `ScrollTrigger.batch`、`ScrollTrigger.create`、`ScrollTrigger.addEventListener("refreshInit")`、`scrollTrigger:` 配置项 | **高** |
| **Lenis 0.2.28** | ✅ 确认使用 | `window.lenisVersion = "0.2.28"`；站点代码调用全局 `lenis.stop()` / `lenis.start()` | **高**（版本）／**中**（构造参数未取到） |
| **Swiper** | ✅ 确认 | `.swiper-wrapper` / `.swiper-slide` / `.swiper-pagination`、`new Swiper(...)`、`cards` effect 源码（`effect:"cards"`, `slideShadows`）、`speed: 700`、`pagination.el` | **高** |
| **jQuery** | ✅ 确认 | `jQuery` / `jquery` 各 8 处、`jQuery.post("/ajax?feedback", …)`、`jQuery(el).css()/.addClass()/.fadeOut()/.serializeArray()` | **高** |
| **CountUp.js** | ✅ 确认（形态） | `new CountUp(target, end, { duration: 2, decimalPlaces })`——构造签名与 CountUp.js 一致 | **高** |
| **自研 SplitText** | ✅ 确认 | 类构造 `{ className: "[data-text]" }`，配合 `data-effect="fx1/fx3"`、`data-split`、`data-delay`；**非** GSAP 官方 SplitText 插件 | **高** |
| **IntersectionObserver** | ⚠️ 存在但非主力 | bundle 中仅 3 处，而 ScrollTrigger 有 27 处 `scrollTrigger` 引用；滚动触发几乎全走 ScrollTrigger | **中高** |
| **ScrollSmoother** | ❌ 基本可排除 | 3 处 `ScrollSmoother` 全部出现在 ScrollTrigger 内部的 `normalizeScroll` 兜底代码里（`ma.core.globals().ScrollSmoother`）；**无 `ScrollSmoother.create()`**。平滑滚动由 Lenis 负责 | **高** |
| **Three.js / WebGL** | ❌ **首页未使用** | nanfu.global 两个 bundle 中 `THREE` = 0、`WebGL` = 0、`ShaderMaterial` = 0；「3D 电池」是 150 帧 WebP 序列 | **高** |
| 框架 | ❌ 非 Vue / React | bundle 中无 `createApp` / `__vue__` / `Vue` / React 标记；HTML 是**服务端直出静态标记 + jQuery 增强** | **高** |
| 构建形态 | 观察 | 同一页面同时挂 `type="module"`（`index.d9c9dbee1.js`）与 `nomodule`（`index.091b56b9.js`）双包；`?v=19` 版本号查询参数 | **高** |
| 验证码 / CDN | 确认 | `Server: ESA`、`X-Tengine-Error: denied by http_auto_ratelimit`、`acw_tc` / `acw_sc__v2` / `cdn_sec_tc` Cookie、`Via: ens-cache11.hk37` | **高** |

### 5.1 一个值得记录的代码状态观察

时间轴那段 ScrollTrigger 编排在 **两个 bundle 里各出现两次**：

| bundle | 第 1 份 | 第 2 份 |
|---|---|---|
| `index.091b56b9.js`（`nomodule` 传统包） | **启用**（pos≈966379–968300） | **启用**（pos≈982630–984600） |
| `index.d9c9dbee1.js`（`type="module"` 现代包） | **启用**（pos≈869253） | **被整段注释**（pos≈886964 起，`// const s = new Qr({ el: ".batteryCv" }); // if (r.process) { …`） |

两处都绑定同一个 `#r5Scr`（首页唯一元素），且都用 `jQuery(".r5").css("height", …)` 覆写高度。**最可能的解释**是开发者调试时留下了一份副本、上线前只在现代包里注释掉。含义：**现代浏览器下时间轴逻辑确实生效**（第 1 份是活的），但传统包里两份都跑，存在重复绑定/重复覆写的风险。（对「机制」结论无影响；对「代码质量」是一个如实记录）

### 5.2 设计方与「3D」的真实含义

- 站点 `<meta name="author" content="https://www.uunn.cn/">`；页脚 `.btm .c3` 文案 `Web Designed by uunn.cn`（S1 直读）。
- **UUNN 优势互动** 的案例列表明确列出「**南孚电池国际站 / NANFU Global**」，服务项「**网站设计 / 3D创意**」，品牌色 `data-color="#E5171E"`（S10 直读）。
- UUNN 自有模板包 `app.js` 直读结果：**GSAP 3.11.4 + Lenis 0.2.28 + Three.js r109（`REVISION = "109"`，`THREE`×540、`WebGL`×198、`ShaderMaterial`×26、`OrbitControls`×22）+ jQuery**（S12 直读）。→ 该公司**具备** Three.js 能力，且与 nanfu.global 共用同一套 GSAP/Lenis 版本，**但 nanfu.global 首页没有打包 Three.js**。
- S13（`/work/67`「南孚·数字化」）描述的是**另一个交付物**：「3D可视化数字大屏」「整体颜色以蓝色为主…搭配以白色3D建模」——**不是** nanfu.global 网站，切勿混淆。
- S14（数英）的定性描述可作为旁证：「英文版中，南孚电池有出场动效」「这酷炫的3D建模，这层层递进的动效，这丝滑的流畅度，最后摆个ending pose，从无到有」——与「帧序列逐帧播放的电池从无到有」在观感上完全吻合。该文标题及论点：中文官网主打「大红底+大白字+大产品」「够大够强够厉害」，英文官网则是分层递进的动效叙事。（**二手来源，中可信**）

---

## 6. 可落地的实现建议（Vue 3 `<script setup>` + GSAP）

> 环境确认：`frontend/package.json` 已有 `gsap ^3.15.0`、`vue ^3.5.38`、`vue-router ^5.1.0`；**没有** `lenis`、`swiper`。字体用的是 `@fontsource-variable/geist`（与南孚的系统字体栈不同，需自行决定是否对齐）。
> 下面 6 条按「性价比」排序，**第 1、2 条是本次调研的核心产出**。

### 6.0 全局前置：GSAP 默认值与统一缓动

```js
// src/animations/gsap-defaults.js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// 对齐南孚：滚动补间全局线性，手感交给 scrub
gsap.defaults({ duration: 1, ease: 'none' })
// 对齐南孚的唯一签名曲线（CSS 侧同名）
export const EASE_SIGNATURE = 'cubic-bezier(0.38, 0, 0, 1)' // ≈ gsap 的 'power4.out'
export const VH = () => window.innerHeight
export const VW = () => window.innerWidth

// 路由切换必须清理，否则 ScrollTrigger 会累积
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill())
}
```

### 6.1 配方一：sticky 横向时间轴 + 帧序列 canvas（核心）

**组件结构**

```
TimelineSection.vue
├─ .tl-root            ← 外层，高度由 JS 按节点数撑到 N × 100vh
│  └─ .tl-sticky       ← position:sticky; top:0; height:100vh; overflow:hidden
│     ├─ .tl-progress  ← 可选：进度线 / 年份刻度，用 --go 或 progress 驱动
│     ├─ .tl-track     ← display:grid; grid-auto-flow:column
│     │  ├─ .tl-part.is-intro   ← 标题（多个 .line，供 --go 逐行揭开）
│     │  ├─ .tl-part.is-note    ← 引言
│     │  ├─ .tl-part.is-node ×N ← 年份 + 说明（交替上下）
│     │  └─ .frame > canvas.seq ← 帧序列画布
```

**关键 CSS（照搬南孚的比例与交替策略）**

```css
.tl-root   { position: relative; width: 100%; height: 600vh; }   /* JS 会覆写 */
.tl-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.tl-track  { display: grid; grid-auto-flow: column; justify-content: start; }

.tl-part          { height: 100%; width: 100vw; padding: 2rem 0 2.5rem; }
.tl-part.is-note  { width: 50vw; display: flex; justify-content: center; align-items: center; }
.tl-part.is-node  { width: 40vw; display: flex; flex-direction: column;
                    justify-content: flex-end; align-items: flex-start;
                    padding-left: 4%; padding-right: 5%; position: relative; }
/* 交错：奇数节点只占下半屏 */
.tl-part.is-node:nth-of-type(2n + 1) { height: 50%; padding-bottom: 0.65rem; z-index: 5; }

.frame { position: absolute; top: 0; bottom: 0; margin: auto 0;
         left: calc(50vw - 2.5rem); width: 5rem; height: 1.5rem; z-index: 6; }
.frame canvas { width: 100%; height: 100%; display: block; }
```

**组合式函数：帧序列加载器（对齐南孚的 `Tr` 类）**

```js
// src/composables/useFrameSequence.js
export function useFrameSequence(canvasRef, { path, count, desktopW = 1920, desktopH = 1000,
                                             portraitW = 1080, portraitH = 1700, ext = 'webp' }) {
  const images = []
  let frame = 0
  const portrait = () => window.matchMedia('(orientation: portrait)').matches

  const src = (i) => `${path}/${String(i).padStart(5, '0')}.${ext}`
  const dpr = () => window.devicePixelRatio || 1

  function resize() {
    const c = canvasRef.value
    if (!c) return
    const r = c.parentElement.getBoundingClientRect()
    c.width = r.width * dpr()
    c.height = r.height * dpr()
    draw(frame)
  }

  // 手写 object-fit: cover 的裁切数学（南孚 drawFitCoverImage / coverImg 同思路）
  function cover(cw, ch, iw, ih) {
    const cr = cw / ch
    if (iw / ih <= cr) { const sw = ih * cr; return { sx: (iw - sw) / 2, sy: 0, sw, sh: ih } }
    const sh = iw / cr; return { sx: 0, sy: (ih - sh) / 2, sw: iw, sh }
  }

  function draw(i) {
    const c = canvasRef.value
    const img = images[Math.max(0, Math.min(count - 1, i))]
    if (!c || !img || !img.complete) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    const { sx, sy, sw, sh } = cover(c.width, c.height, img.naturalWidth, img.naturalHeight)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height)
  }

  async function load() {
    const [w, h] = portrait() ? [portraitW, portraitH] : [desktopW, desktopH]
    const urls = Array.from({ length: count }, (_, i) => src(i))
    await Promise.all(urls.map((u, i) => new Promise((res) => {
      const img = new Image(w, h)
      img.onload = img.onerror = () => res()
      img.src = u
      images[i] = img
    })))
    resize()
  }

  const upData = (n) => { frame = n; draw(n) }
  onMounted(() => { load(); window.addEventListener('resize', resize) })
  onBeforeUnmount(() => window.removeEventListener('resize', resize))

  return { upData, images }
}
```

**组合式函数：横向时间轴编排（对齐南孚 §2.4 全部数值）**

```js
// src/composables/useHorizontalTimeline.js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useHorizontalTimeline({ rootRef, stickyRef, trackRef, frameRef, canvasApi, nodeCount }) {
  let ctx

  onMounted(() => {
    ctx = gsap.context(() => {
      const vh = window.innerHeight, vw = window.innerWidth
      const track  = trackRef.value
      const parts  = track.querySelectorAll('.tl-part')      // c
      const nodes  = track.querySelectorAll('.is-node')      // u
      const goEls  = track.querySelectorAll('[data-go]')     // l
      const c = parts.length, u = nodes.length

      // ① 外层撑高：c + 0.5 屏
      gsap.set(rootRef.value, { height: vh * (c + 0.5) })

      // ② 滚动提示显隐
      ScrollTrigger.create({
        trigger: '.tl-scroll-hint',
        start: `+=${vh}`,
        end: `+=${vh * (c + 2)}`,
        toggleActions: 'restart pause resume none',
        toggleClass: 'on',
      })

      // ③ 逐行标题：scrub --go（错峰起点 +0.1vh*i）
      goEls.forEach((el, i) => {
        gsap.timeline({
          scrollTrigger: { trigger: track, start: `+=${0.1 * vh * i}`, end: `+=${0.8 * vh}`, scrub: 0.9 },
        }).to(el, { '--go': 1, ease: 'linear' })
      })

      // ④ 累加宽度 → 横向位移
      let total = 0
      parts.forEach((el) => { total += el.getBoundingClientRect().width })
      gsap.set(track, { width: total })

      gsap.timeline({
        scrollTrigger: { trigger: track, start: `+=${0.2 * vh}`, end: `+=${vh * (c - 1)}`, scrub: 0.8 },
      }).fromTo(track, { x: 0 }, { x: -(total - 0.5 * vw), ease: 'none' })

      // ⑤ 画布沿轨道移动 + 帧 seek（两段式归一化时长，照搬 13 / 14.5 配平）
      const totalUnits = 14.5 * u + 13
      const dIn   = 13 / totalUnits
      const dMove = (14.5 * u) / totalUnits
      const value = { value: 0 }

      gsap.timeline({
        scrollTrigger: {
          trigger: track, start: `-=${vh}`, end: `+=${vh * (c + 1)}`, scrub: 0.8,
          onUpdate: () => canvasApi?.upData(parseInt(value.value, 10)),
        },
      })
        .fromTo(frameRef.value,
          { opacity: 0, x: -0.5 * vw },
          { opacity: 1, x: -0.25 * vw, duration: dIn, ease: 'none' })
        .addLabel('cvStart')
        .to(frameRef.value, { x: total, ease: 'none', duration: dMove }, 'cvStart')
        .fromTo(value, { value: 0 }, { value: 150 * c, duration: 1, ease: 'none' }, 0)
    }, rootRef.value)

    ScrollTrigger.refresh()
  })

  onBeforeUnmount(() => ctx?.revert())   // ★ 必须，否则热更新/路由切换会残留
}
```

**注意**：`gsap.context(() => {...}, rootRef.value)` 的第一个参数里，选择器字符串会以 root 为作用域，且 `ctx.revert()` 会自动回滚内联样式——这是 Vue 3 里用 GSAP 最省心的清理方式。另外**不要**在 `onMounted` 之前就去 `getBoundingClientRect()`（字体/图片未就绪会拿到错误宽度）；必要时 `await nextTick()` 后再算，或监听 `document.fonts.ready`。

### 6.2 配方二：`--go` 驱动的 CSS 动画 scrub（文字遮罩揭开）

**Vue 组件中的写法**（`data-note` 用同名文字，避免复制 DOM）：

```html
<h2 class="tl-title f-80">
  <span
    v-for="(line, i) in titleLines"
    :key="i"
    class="letter"
    data-go
    :data-note="line"
    :style="{ '--go-index': i }"
  >{{ line }}</span>
</h2>
```

```css
.letter {
  display: block;
  color: rgba(26, 26, 26, 0.2);   /* 底字：20% 透明度 */
  line-height: 1.3;
  position: relative;
  --go: 0;                        /* ★★ 与南孚的唯一差异：显式声明初值，更稳 */
}
.letter::after {
  content: attr(data-note);       /* 复用同名文字，无需额外 DOM */
  position: absolute; inset: 0 auto auto 0;
  width: 100%;
  color: #1a1a1a;                 /* 实色覆盖层 */
  line-height: inherit; font: inherit;
  will-change: transform, opacity;
  animation-name: clipReveal;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-play-state: paused;                    /* 冻结，由 --go scrub */
  animation-delay: calc(var(--go) * -1s);
}
@keyframes clipReveal {
  0%   { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }
  5%   { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }
  30%  { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
  100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
}
/* 字号阶梯内不要用 `font: inherit` 之外的简写覆盖 font-size，否则遮罩层与底字会错位 */
```

> 这个技巧**同样适用于**：整块区域的横向擦除（`inset(0)` → `inset(0 100vw 0 0)`，南孚的 `pageFn`）、圆形裁切展开（`circle(29%)` → `circle(100%)`，南孚的 `bgcap`）、以及首屏「开窗」遮罩（`inset(0)` → `inset(1.5rem 55vw 0.9rem 1.2rem round 0.6rem)`，南孚的 `chunkFn`）。**一个 `--go` + 一个 paused 关键帧，可以表达几乎所有「随滚动裁切揭开」的效果**，且性能远好于逐帧 JS 改 `clip-path`。

### 6.3 配方三：纯 CSS 级联入场（替代 `stagger`）

不要为每一条链接写 JS 延时。南孚的做法是**同一时长 + 递增起始位移**：

```css
.cascade > * {
  opacity: 0;
  transform-origin: 0;
  --step: 10%;                                        /* 每级步长 */
  transform: translateY(calc(10% + var(--i) * var(--step)));
  transition: opacity 1s cubic-bezier(0.38, 0, 0, 1),
              transform 1s cubic-bezier(0.38, 0, 0, 1),
              color 0.3s cubic-bezier(0.38, 0, 0, 1);
}
.cascade.go > * { opacity: 1; transform: translate(0, 0); }

/* 横向变体：位移从 20px 起、每级 +10px；时长 opacity 0.8s / transform 1.2s */
.cascade-x > * {
  opacity: 0; transform-origin: 0;
  transform: translateX(calc(20px + var(--i) * 10px));
  transition: opacity 0.8s cubic-bezier(0.38, 0, 0, 1),
              transform 1.2s cubic-bezier(0.38, 0, 0, 1),
              color 0.3s cubic-bezier(0.38, 0, 0, 1);
}
.cascade-x.go > * { opacity: 1; transform: translate(0, 0); }
```

Vue 侧只需绑定序号，JS 只负责加 `go`：

```html
<ul class="cascade">
  <li v-for="(item, i) in items" :key="item.id" :style="{ '--i': i }">{{ item.text }}</li>
</ul>
```

```js
ScrollTrigger.create({
  trigger: listEl,
  start: `-=${window.innerHeight * 0.9}`,
  end: `+=${window.innerHeight * 3}`,
  toggleActions: 'restart pause resume none',
  toggleClass: 'go',
})
```

> 若项目已有 Tailwind / 手写 nth-child 更方便，也可以直接抄南孚的 `.alanParent_up .alanChild:nth-child(N){ transform: translateY(calc(10% * N + 10%)) }`（N=1→20%，N=20→210%）。**优点：零 JS 延时、零 stagger 计算、天然响应式**。

### 6.4 配方四：`ScrollTrigger.batch` 入场 + 数字滚动

```js
// src/composables/useRevealOnScroll.js —— 对齐南孚 .alanFn
export function useRevealOnScroll(scopeRef) {
  let ctx
  onMounted(() => {
    ctx = gsap.context(() => {
      const HIDE = { y: 50, opacity: 0 }
      gsap.set('.reveal', HIDE)
      gsap.set('.reveal[data-pic] .pic', { scale: 1.2, y: -50 })  // 可选配图视差

      ScrollTrigger.batch('.reveal', {
        onEnter: (batch) => batch.forEach((el) => {
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 1.5,
            delay: Number(el.dataset.delay || 0),
            ease: 'power3.out',
            overwrite: true,
          })
          if (el.dataset.pic) {
            gsap.to(el.querySelector('.pic'), {
              scale: 1, y: 0, duration: 3.2,
              delay: Number(el.dataset.delay || 0), ease: 'power3.out', overwrite: true,
            })
          }
        }),
        onLeaveBack: (batch) => batch.forEach((el) => gsap.to(el, { ...HIDE, duration: 0.5 })),
        start: '80px bottom',
        end: 'top top',
      })
      ScrollTrigger.addEventListener('refreshInit', () => gsap.set('.reveal', { y: 0 }))
    }, scopeRef.value)
  })
  onBeforeUnmount(() => ctx?.revert())
}
```

数字滚动（无 CountUp 依赖时的等价实现，**参数对齐 `duration: 2`**）：

```js
// 用 GSAP 自带的数值补间取代 CountUp.js，少一个依赖
export function countUp(el, end, { duration = 2 } = {}) {
  const dec = (String(end).split('.')[1] || '').length
  const obj = { v: 0 }
  return gsap.to(obj, {
    v: end, duration, ease: 'none',
    onUpdate: () => { el.textContent = obj.v.toFixed(dec) },
  })
}

// 用法（对齐南孚 .countFn：容器 y:30 / rotate:4 / opacity:0 → 0，power1.out，1.2s）
ScrollTrigger.create({
  trigger: boxEl, start: '80px bottom', end: 'top top',
  onEnter: () => {
    countUp(numEl, targetValue, { duration: 2 })
    gsap.to(boxEl, { y: 0, rotate: 0, opacity: 1, ease: 'power1.out', duration: 1.2 })
  },
  onLeaveBack: () => gsap.to(boxEl, { y: 30, opacity: 0 }),
})
```

### 6.5 配方五：通用视差指令（`v-parallax="[x, y]"`）

南孚把视差做成 `data-scroll="x,y"` 声明式属性，值得照搬到 Vue 指令：

```js
// src/directives/parallax.js
import gsap from 'gsap'

export const parallax = {
  mounted(el, binding) {
    const [x = 0, y = 0] = Array.isArray(binding.value) ? binding.value : [0, Number(binding.value) || 0]
    const portrait = window.matchMedia('(orientation: portrait)').matches
    const nx = portrait ? x / 2 : x
    const ny = portrait ? y / 2 : y
    const vh = window.innerHeight

    el._st = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: `top-=${vh}`,
        end: () => `+=${el.getBoundingClientRect().height + window.innerHeight}`,
        scrub: 0.9,
      },
    }).fromTo(el, { x: -nx, y: -ny }, { x: nx, y: ny, ease: 'none' })
  },
  unmounted(el) {
    el._st?.scrollTrigger?.kill()
    el._st?.kill()
  },
}
// 模板：<img v-parallax="[0, 80]" src="…">
```

### 6.6 配方六：Lenis 与 ScrollTrigger 联调 + 组件清理

```js
// src/composables/useSmoothScroll.js
import Lenis from 'lenis'          // 需 npm i lenis（当前项目未安装）
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useSmoothScroll() {
  let lenis, raf
  onMounted(() => {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true })   // ← 南孚的构造参数未能获取，此为自定
    lenis.on('scroll', ScrollTrigger.update)
    raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
  })
  onBeforeUnmount(() => {
    gsap.ticker.remove(raf)
    lenis?.destroy()
  })
  return { lenis }
}
```

**三个必须遵守的清理规则（否则 Vue 路由切换必出 bug）**：
1. 每个动效组合式函数在 `onBeforeUnmount` 里 `ctx.revert()` 或 `ScrollTrigger.getAll().forEach(t => t.kill())`；
2. 帧序列的 canvas 在卸载时不要只是移除 DOM，还要 `images.length = 0` 释放 100+ 张 `Image` 引用；
3. 弹窗/抽屉打开时 `lenis.stop()`、关闭时 `lenis.start()`（南孚同款做法），并同步 `ScrollTrigger.refresh()`。

### 6.7 建议的参数基线（一次性抄完即可开工）

| 项目 | 建议值 | 来源 |
|---|---|---|
| 全局 GSAP 默认 | `{ duration: 1, ease: 'none' }` | 南孚直读 |
| 签名缓动 | `cubic-bezier(0.38, 0, 0, 1)`（≈`power4.out`）/ `power3.out`（入场）/ `power1.out`（数字块） | 南孚直读 |
| 时间轴容器高度 | `100vh × (节点数 + 0.5)` | 南孚直读 |
| 横向位移 scrub | `0.8` | 南孚直读 |
| `--go` 揭示 scrub / 视差 scrub | `0.9` | 南孚直读 |
| 标题入场 | `y 50→0, opacity 0→1, 1.5s, power3.out` | 南孚直读 |
| 配图入场 | `scale 1.2→1, y −50→0, 3.2s, power3.out` | 南孚直读 |
| 回滚复位 | `opacity 0, y 50, 0.5s` | 南孚直读 |
| 数字计数 | `2s`，容器 `y30/rotate4/opacity0 → 0`，`power1.out`，`1.2s` | 南孚直读 |
| 级联上浮 | `opacity 1s` + `transform 1s`，起始 `translateY(20% + 10%/级)` | 南孚直读 |
| 级联左入 | `opacity 0.8s` + `transform 1.2s`，起始 `translateX(20px + 10px/级)` | 南孚直读 |
| 帧序列 | 电池 150 帧 / 首屏 120 帧，`webp`，5 位零填充，桌面 1920×1000、竖屏 1080×1700 | 南孚直读 + URL 实测 |
| 字号基准 | `html{font-size:5.20833vw}`（1920 设计宽，`1rem = 100px`），竖屏 `55px` | 南孚直读 |
| 主卡片圆角 | `0.24rem`（24px @1920） | 南孚直读 |
| 细化分隔线 | `1px solid rgba(242,242,242,0.15)`（深底）/ `1px dashed rgba(26,26,26,0.5)`（浅底） | 南孚直读 |
| 配色 | 近黑 `#1a1a1a`、白 `#fff`、品牌红 `#e60008`、浅灰 `#e9e9e9/#efefef/#f2f2f2` | 南孚直读 |

---

## 7. 可信度分级

### 7.1 高可信（来自真实线上产物源码直读）

| 结论 | 证据位置 |
|---|---|
| 页面区块顺序 = banner → y1 → y9 → r5 → r1 → r2(隐藏) → y2 → r3 | S1 HTML |
| 页脚三层 `top / mid / btm` 的结构与全部关键样式 | S1 + S2 |
| 时间轴是 **CSS sticky + 动态撑高 + ScrollTrigger scrub 横向 `translateX`** | S2 + S3 |
| `.r5` 高度 = `vh × (节点数 + 0.5)`；CSS 兜底 `600vh` | S3 + S2 |
| 时间轴全部 ScrollTrigger 的 `start`/`end`/`scrub`/`delay` 数值 | S3（§2.4/§2.5 逐条抄录） |
| 节点计数 `c=9 / u=7 / l=3` | S1 计数 |
| 年份高亮 = `--go` + `animation-play-state: paused` + `animation-delay: calc(var(--go) * -1s)` scrub `@keyframes clip` | S2 + S3 |
| 两段式归一化时长 `13 / ((88/6)u+13)` 与 `14.5u / (14.5u+13)` | S3 |
| 帧序列 canvas：150 帧（电池）/ 120 帧（首屏），命名 `{path}/00000.webp?v=2` | S1 `data-count` + S3 加载器 + URL 实测 206 |
| 入场参数 `y50/1.5s/power3.out`、配图 `scale1.2/3.2s`、回滚 `0.5s` | S3 |
| 级联入场靠 `nth-child` 递增位移 + 同一时长（20%+10%/级；20px+10px/级） | S2 |
| `cubic-bezier(0.38, 0, 0, 1)` 出现 134 次（唯一签名曲线） | S2 全文统计 |
| `gsap.defaults({ duration: 1, ease: "none" })` | S3 |
| GSAP **3.11.4**、Lenis **0.2.28**、Swiper、jQuery、CountUp 均为在用依赖 | S3/S4 版本串与调用点 |
| **首页未使用 Three.js / WebGL**（`THREE`/`WebGL` 计数为 0） | S3/S4 全文检索 |
| 非 Vue / React，是静态标记 + jQuery 增强 | S3/S4 框架标记检索 |
| 字号体系 `html{font-size:5.20833vw}` + `.f-NN = 0.NN rem`，竖屏 `55px` | S2 |
| 字体栈为纯系统字体（无 Web 字体）+ iconfont | S2 |
| 配色频次表、圆角/边框/阴影清单 | S2 全文统计 |
| 设计方为 UUNN 优势互动，案名「南孚电池国际站 / NANFU Global」，服务「网站设计 / 3D创意」，品牌色 `#E5171E` | S1 meta + 页脚 + S10 |
| `data-vh` 只在竖屏被 JS 接管为高度覆盖 | S3 |
| 时间轴编排在两包内各出现两次，现代包的第二份被整段注释 | S3/S4 对照 |

### 7.2 中可信（推断 / 二手来源）

| 结论 | 依据 | 不确定性 |
|---|---|---|
| Lenis 用于全站平滑滚动（而非仅打包未用） | 站点代码调用全局 `lenis.stop()/start()` | 构造参数与是否覆盖 `wheel` 无法直读 |
| `cubic-bezier(0.38,0,0,1)` ≈ GSAP `power4.out` | 由贝塞尔控制点 `(0.38, 0, 0, 1)` 的形态推断 | 未做逐帧数值比对 |
| 「3D 电池出场动效」= 预渲染帧序列而非实时 3D | 帧序列 + 无 Three.js + 设计公司自述「3D建模渲染」 | 观感层面的一致性推断（S14 旁证） |
| 两包中时间轴重复源自调试残留 | 两份代码高度同构，仅现代包注释 | 无提交历史可查 |
| `.r2`（Our Brands）被隐藏是线上配置问题 | 内联 `style="display:none"` | 可能是多语言/多站点条件渲染 |
| `.row.y1` 与 `.row.r3` 标题重复是内容配置重复 | 两处原文一致 | 可能是刻意呼应 |

### 7.3 低可信（明确标注为「未能获取 / 不做断言」）

- **Wayback Machine 存档内容**：本次网络环境下 `archive.org` / `web.archive.org` DNS 被解析到异常 IP 且连接超时，`https://archive.org/wayback/available?url=nanfu.global` 与 `http://web.archive.org/web/2024id_/https://www.nanfu.global/` 均无法访问。**因此本文没有引用任何存档快照**。若需交叉验证历史版本，请在可访问 archive.org 的网络下重试这两个 URL。
- **Lenis 的构造参数**（`duration` / `easing` / `mouseMultiplier` / `smoothTouch` / `lerp`）：**未能获取**。§6.6 中的 `duration: 1.1` 是我给出的自定义建议值，**不是**南孚的实际值。
- **`--go` 的初值**：CSS 中**未声明**；GSAP 读取未定义自定义属性的具体容错行为**未做跨浏览器验证**。
- **`data-scroll` 的完整取值清单**：时间轴 `.letter` 上的裸 `data-scroll`（无值）会解析出 `NaN`，其意图**未能确认**。
- **Awwwards / FWA 收录页、设计师访谈**：多次检索**未找到** nanfu.global 的收录或访谈。检索到的相关文章只有 S14/S15（数英及其转载）。**不要引用不存在的奖项。**
- **`bannerFm_app/`（竖屏帧序列目录）**：HTML 中声明了 `data-apppath="/templates/assets/home/bannerFm_app/"`，但对该路径下 `00000.webp?v=2` 的直接探测返回了非图片响应（5,112 字节 HTML，疑为挑战页或 404）。目录是否真实存在**未确认**（可能只是需要携带正确 Cookie 的探测方式）。
- **精确的滚动段落像素高度**：`vh` 为运行时值，表内所有 `vh × N` 均为**系数**，不是固定像素。

---

## 8. 方法附录：如何复现本次取证

1. **请求首页**（会拿到挑战页）：
   ```
   GET https://www.nanfu.global/
   → 200，响应头含 Set-Cookie: acw_tc=…; cdn_sec_tc=…，正文为 <script>var arg1='…';…</script>
   ```
2. **执行挑战脚本**：把该 `<script>` 放进一个带最小 `document`/`window` 桩（`document.cookie` 用 setter 捕获、`document.location.reload` 置空）的 JS 运行时里执行，取出写入的 `acw_sc__v2=…`。
3. **带 Cookie 重放**：
   ```
   GET https://www.nanfu.global/
   Cookie: acw_tc=…; cdn_sec_tc=…; acw_sc__v2=…
   → 200，47,001 字节真实 HTML（X-Tengine-Error 消失）
   ```
4. **抓资源**：从 HTML 抽出 `index.55.css`、`index.091b56b9.js`、`index.d9c9dbee1.js`，带上同一 Cookie 下载（`Referer: https://www.nanfu.global/`）。
5. **静态分析**：CSS 用 `([^{}]+)\{([^{}]*)\}` 正则展开全部规则；JS 是压缩产物，按关键词（`process`、`batteryCv`、`r5Scr`、`data-vh`、`data-go`、`alanFn`、`countFn`、`data-scroll`、`lenis`、`version = "`）定位并dump上下文即可读出全部参数。

> **合规声明**：本文只做结构、参数与手法的归纳，未复制受版权保护的文案或成段代码；引用的 CSS 片段均为**参数性关键片段**（曲线、时长、关键帧数值），已标注来源文件。所有图像/视频资源仅做了可用性探测（HTTP 206 响应头），未下载、未再分发。
