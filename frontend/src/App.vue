<template>
  <!--
    App.vue — 根组件
    包含：隐藏 SVG 噪声滤镜（供液态玻璃使用）+ 页面过渡动画 + 主布局
  -->

  <!-- 隐藏的 SVG 滤镜 — 为液态玻璃提供噪声纹理 -->
  <svg
    style="position: absolute; width: 0; height: 0; pointer-events: none"
    aria-hidden="true"
  >
    <defs>
      <filter id="liquid-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
  </svg>

  <!-- 粒子连线背景 — 在所有页面背后运行 -->
  <ParticleBackground
    color="90,79,207"
    :count="120"
    :opacity="0.7"
    :z-index="-1"
  />

  <div class="app-layout">
    <!--
      主内容区域
      Transition 组件实现页面切换动画
      mode="out-in"：旧页面先离开，新页面再进入（不会重叠）
    -->
    <main class="main-content">
      <!-- 页面路由 — 最简洁可靠的写法 -->
      <router-view />
    </main>

    <!-- 右侧边栏 — 所有页面共享 -->
    <Sidebar />
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ParticleBackground from '@/components/ParticleBackground.vue'
</script>

<!-- ===== 全局样式（非 scoped，作用于所有组件） ===== -->
<style>
/* ---------- CSS 变量（方便统一调色） ---------- */
:root {
  --primary: #5a4fcf;
  --primary-light: #9795f0;
  --glass-bg: rgba(255, 255, 255, 0.15);
  --glass-bg-hover: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: 20px;
  --glass-radius: 16px;
  --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  --glass-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* ---------- 基础重置 ---------- */
* {
  margin: 0;
  box-sizing: border-box;
}

body {
  /* 动态渐变背景 — 浅色淡雅四色轮播 */
  background: linear-gradient(135deg, #f0eeff, #fce4ec, #ede4f4, #fef5f8);
  background-size: 400% 400%;
  animation: gradient-flow 15s ease infinite;
  min-height: 100vh;
  color: #333;
  line-height: 1.6;
  padding-right: 200px;
  font-family: 'Microsoft YaHei', sans-serif;
}

a {
  text-decoration: none;
}

/* ---------- 通用玻璃卡片 ---------- */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  transition:
    background 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-card:hover {
  background: var(--glass-bg-hover);
  box-shadow: var(--glass-shadow-hover);
  transform: translateY(-4px);
}

/* ---------- 液态玻璃（加强版毛玻璃） ---------- */
.liquid-glass {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(28px) saturate(3.5) brightness(1.08) contrast(1.02);
  -webkit-backdrop-filter: blur(28px) saturate(3.5) brightness(1.08) contrast(1.02);
  border: none;
  border-radius: 18px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.35) inset,
    0 -1px 0 rgba(0, 0, 0, 0.04) inset;
  transition:
    background 0.5s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.5s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    backdrop-filter 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 内层光效 — 模拟玻璃折射的角落高光 */
.liquid-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
  /* 噪声纹理遮罩 — 让光线看起来有散斑质感 */
  mask-image: url('#liquid-noise');
  -webkit-mask-image: url('#liquid-noise');
  mask-size: 200px 200px;
  -webkit-mask-size: 200px 200px;
  mix-blend-mode: soft-light;
  background:
    /* ① 左上角镜头光晕 */
    radial-gradient(
      ellipse 65% 45% at 20% 0%,
      rgba(255, 255, 255, 0.45) 0%,
      rgba(255, 255, 255, 0.12) 50%,
      transparent 100%
    ),
    /* ② 底部液体弯月面 */
    linear-gradient(
      to top,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 255, 255, 0.08) 6px,
      transparent 18px
    ),
    /* ③ 对角光扫 — 慢速划过表面 */
    linear-gradient(
      115deg,
      transparent 0%,
      transparent 28%,
      rgba(255, 255, 255, 0.35) 43%,
      rgba(255, 255, 255, 0.55) 50%,
      rgba(255, 255, 255, 0.35) 57%,
      transparent 72%,
      transparent 100%
    );
  background-size: 100% 100%, 100% 100%, 200% 200%;
  animation: liquid-shine 8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.liquid-glass:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.45) inset;
  transform: translateY(-4px) scale(0.995);
  backdrop-filter: blur(28px) saturate(5) brightness(1.15) contrast(1.05);
  -webkit-backdrop-filter: blur(28px) saturate(5) brightness(1.15) contrast(1.05);
}

/* 悬停时冻结光扫动画 */
.liquid-glass:hover::after {
  animation-play-state: paused;
}

/* 确保玻璃内部的内容在伪元素之上 */
.liquid-glass > * {
  position: relative;
  z-index: 2;
}

/* ---------- 关键帧动画 ---------- */

/* 背景渐变流动 */
@keyframes gradient-flow {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 液态玻璃对角线光扫 */
@keyframes liquid-shine {
  0% {
    background-position: 0 0, 0 0, -100% 0;
    opacity: 0.6;
  }
  30% {
    opacity: 1;
  }
  50% {
    background-position: 0 0, 0 0, 0% 0;
    opacity: 1;
  }
  80% {
    opacity: 0.8;
  }
  100% {
    background-position: 0 0, 0 0, 100% 0;
    opacity: 0.6;
  }
}

/* 页面切换：淡入 + 微上移 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ---------- 尊重用户"减少动画"偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  body {
    background: linear-gradient(135deg, #f0eeff, #fce4ec);
  }
}

/* ---------- 移动端：小屏幕适配 ---------- */
@media (max-width: 768px) {
  body {
    padding-right: 0;
    font-size: 15px;
    /* 为刘海屏添加安全区 */
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  /* 移动端减轻毛玻璃效果 — 提升性能 */
  .glass-card, .liquid-glass {
    border-radius: 12px;
    --glass-blur: 10px;
  }

  .glass-card {
    backdrop-filter: blur(10px) saturate(140%) !important;
    -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
  }

  .liquid-glass {
    backdrop-filter: blur(16px) saturate(2) brightness(1.04) !important;
    -webkit-backdrop-filter: blur(16px) saturate(2) brightness(1.04) !important;
  }

  /* 移动端禁用悬停抬起效果（没有hover） */
  .glass-card:hover {
    transform: none;
  }

  .liquid-glass:hover {
    transform: none;
    backdrop-filter: blur(16px) saturate(2) brightness(1.04) !important;
    -webkit-backdrop-filter: blur(16px) saturate(2) brightness(1.04) !important;
  }

  /* 移动端禁用液态玻璃光扫（省电） */
  .liquid-glass::after {
    animation: none;
    opacity: 0.4;
  }

  /* 确保触摸目标足够大 */
  a, button, .tab, .cat-btn, .tag-btn {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 14px;
  }

  h1 { font-size: 1.6rem !important }
  h2 { font-size: 1.2rem !important }
  h3 { font-size: 1.0rem !important }

  .glass-card { padding: 16px !important }
  .liquid-glass { padding: 16px !important }

  /* 极小屏进一步减弱毛玻璃 */
  .glass-card {
    backdrop-filter: blur(8px) saturate(120%) !important;
    -webkit-backdrop-filter: blur(8px) saturate(120%) !important;
  }
}
</style>

<!-- ===== 局部样式 ===== -->
<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
}

/* 移动端主内容区适配 */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .main-content {
    padding: 16px 12px;
    padding-top: calc(16px + env(safe-area-inset-top));
  }
}
</style>
