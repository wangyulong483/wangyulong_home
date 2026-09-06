结合你网站「暗色终端 + 科幻档案 + 雷电紫/黄绿强调色」的气质，以及你对月之暗面官网光标风格的偏好，我整理了以下参考网站和具体设计建议。

---

## 一、风格参考网站

| 网站 | 光标特点 | 与你网站的契合点 |
|------|---------|---------------|
| **[Moonshot AI 官网](https://www.moonshot.cn/)** | 简洁科技感的自定义光标，偏极简圆点/细环，配合暗色背景 | 品牌气质最接近，暗色高对比 + 克制科技感 |
| **[Kiro Cyberpunk Cursor](https://github.com/kirodotdev/Kiro/issues/6543)** | 6px 紫色发光圆点 + Canvas 粒子拖尾，带 `lerp` 延迟跟随 | 紫色调+粒子拖尾直接匹配你的雷电主题和现有粒子效果 |
| **[FreeFrontend - JavaScript Cursors](https://freefrontend.com/javascript-cursors/)** | 收录大量现代自定义光标：变形跟随、悬停图片揭示、速度旋转 SVG、渐变光晕追踪等 | 可直接找到与你「档案库终端」气质匹配的实现代码 |
| **[Dribbble - Custom Cursor](https://dribbble.com/search/custom-cursor)** | 设计灵感库，有大量暗色主题、科幻风、圆形光标、磁吸按钮的设计稿 | 用于确定光标形态、hover 状态、尺寸比例 |
| **[Sweezy Cursors - Neon Cyberpunk](https://sweezy-cursors.com/cursor/neon-cyberpunk-swords-animated/)** | 霓虹赛博风光标设计，紫/青/蓝发光配色 | 配色参考：紫+青绿的发光组合 |

---

## 二、UI 设计建议（贴合你的网站语言）

### 1. 核心光标形态：「终端瞄准点」

不要做成传统箭头，建议采用 **双层圆环瞄准器** 或 **实心小圆点**，呼应你网站的"终端 UI"和"档案编号"语言：

```
外层：细线圆环（1px stroke）—— 像终端准星
内层：4-6px 实心圆点 —— 精确瞄准点
```

**尺寸参考**：
- 默认状态：外环 24px，内点 6px
- Hover 可交互元素：外环放大到 40px，内点保持 6px，形成"磁吸"感

### 2. 配色方案：雷电档案库

| 状态 | 颜色 | 用途 |
|------|------|------|
| 默认 | `#c084fc`（亮紫）+ 外环 `rgba(192, 132, 252, 0.4)` | 与网站强调色统一 |
| Hover 按钮/链接 | `#a3e635`（雷电黄绿） | 呼应雷电将军主题，提示可交互 |
| 点击 | 内点缩放到 3px，外环收缩到 16px | 给予明确反馈 |
| 文本选择区 | 变成竖线 `I-beam`，颜色保持紫色 | 保持终端编辑器感 |
| 拖拽/画布区域（Map Zone Painter）| 外环变成十字准星 + 坐标读数 | 工具页面的专业感 |

### 3. 动效设计：克制但有质感

参考月之暗面和 Kiro 的实现，建议以下动效：

**A. Lerp 跟随延迟**
```js
// 光标位置用插值跟随，产生"流体"感
cx += (tx - cx) * 0.35;
cy += (ty - cy) * 0.35;
```

**B. 悬停磁吸（Magnetic）**
- 靠近按钮/卡片时，光标被"吸"向元素中心
- 外环放大并变为黄绿色，内点保持紫色
- 用 GSAP 或纯 CSS `transform` 实现，不触发 layout

**C. 微拖尾（可选）**
- 在 Shrine 页面（最强风格化）可开启极淡的紫色粒子拖尾
- 在 Map Zone Painter 等工具页面关闭拖尾，保持精确
- 拖尾用 Canvas 2D，`globalAlpha` 逐渐衰减，避免性能问题

**D. 速度响应**
- 快速移动时，外环可轻微拉伸成椭圆（像终端扫描线）
- 静止 500ms 后，外环恢复正圆

### 4. 状态标签化（呼应你的档案语言）

光标附近可跟随一个极小的状态标签（类似你网站的 ONLINE、WORLD FILE 标签）：

```
默认：        [●]        （无标签）
Hover 链接：  [●]  OPEN  （黄绿色，8px 等宽字体）
Hover 图片：  [●]  VIEW  （紫色）
Hover 视频：  [●]  PLAY  （紫色）
拖拽中：      [+]  MOVE  （灰色）
```

标签用 `position: fixed` 跟随光标右下方 16px，字体用你网站的等宽字体（如 JetBrains Mono / Fira Code）。

### 5. 页面差异化

| 页面 | 光标策略 |
|------|---------|
| **首页 Hero** | 全屏视频区域隐藏自定义光标，恢复系统默认（避免与视频 UI 冲突） |
| **Shrine 资料库** | 完整特效：发光圆点 + 微拖尾 + 状态标签，沉浸感最强 |
| **应用/热点/地图工具** | 简化版：圆点 + 磁吸 hover，无拖尾，保证操作精确 |
| **Map Zone Painter** | 工具准星模式：十字线 + 坐标 tooltip，像专业绘图软件 |

### 6. 性能与可访问性

- **移动端禁用**：检测到 `touch` 设备时完全恢复默认光标
- **`will-change: transform`**：光标元素开启硬件加速
- **`pointer-events: none`**：自定义光标不拦截点击
- **`prefers-reduced-motion`**：尊重用户减少动效偏好，关闭拖尾和 lerp 延迟
- **光标尺寸**：PNG/SVG 光标图片不超过 128×128px（浏览器限制）

---

## 三、Vue 3 实现思路

```vue
<!-- CustomCursor.vue -->
<template>
  <div v-show="!isTouch" class="cursor-wrap">
    <!-- 外环 -->
    <div class="cursor-ring" :style="ringStyle" />
    <!-- 内点 -->
    <div class="cursor-dot" :style="dotStyle" />
    <!-- 状态标签 -->
    <div v-if="label" class="cursor-label">{{ label }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const isTouch = 'ontouchstart' in window
const x = ref(0), y = ref(0)
const targetX = ref(0), targetY = ref(0)
const label = ref('')
const isHovering = ref(false)
const isClicking = ref(false)

let raf

function onMove(e) {
  targetX.value = e.clientX
  targetY.value = e.clientY
}

function loop() {
  // lerp 插值
  x.value += (targetX.value - x.value) * 0.35
  y.value += (targetY.value - y.value) * 0.35
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  if (isTouch) return
  window.addEventListener('mousemove', onMove, { passive: true })
  raf = requestAnimationFrame(loop)
  
  // 监听 hover 状态
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [data-cursor="link"]')) {
      isHovering.value = true
      label.value = 'OPEN'
    } else if (e.target.closest('[data-cursor="view"]')) {
      label.value = 'VIEW'
    }
  })
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
})
</script>

<style scoped>
.cursor-ring {
  position: fixed;
  top: 0; left: 0;
  width: 24px; height: 24px;
  border: 1px solid rgba(192, 132, 252, 0.6);
  border-radius: 50%;
  pointer-events: none;
  will-change: transform;
  transition: width 0.3s, height 0.3s, border-color 0.3s;
}
.cursor-dot {
  position: fixed;
  top: 0; left: 0;
  width: 6px; height: 6px;
  background: #c084fc;
  border-radius: 50%;
  pointer-events: none;
  will-change: transform;
  box-shadow: 0 0 8px #a855f7, 0 0 20px rgba(124, 58, 237, 0.3);
}
.cursor-label {
  position: fixed;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: #a3e635;
  letter-spacing: 0.1em;
  pointer-events: none;
}
</style>
```

---

## 四、一句话设计原则

> **「像一个精准的终端瞄准器，而不是一个花哨的玩具。」**

月之暗面的光标之所以好看，是因为它**克制**——小尺寸、单色调、响应迅速、不抢内容风头。你的雷电档案库风格也适合这种路线：用紫/黄绿双色区分状态，用圆环准星呼应终端感，用极小的状态标签强化档案编号语言，拖尾和发光只在 Shrine 等沉浸页面出现，工具页面保持干净。

如果你已经有了具体的光标 SVG 草图或者想讨论某个页面的特殊交互（比如 Map Zone Painter 的十字准星），可以发出来，我帮你细化实现方案。