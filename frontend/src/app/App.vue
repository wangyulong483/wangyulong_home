<template>
  <!--
    App.vue — 根组件
    布局：粒子背景 + 主内容区 + 右侧边栏
  -->
  <ParticleBackground
    v-if="particlesVisible"
    :count="particleCount"
    :opacity="particleOpacity"
    :z-index="-1"
    color="134,104,255"
  />

  <div class="app-layout">
    <main class="main-content" :class="{ 'home-content': route.name === 'Home' }">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <Sidebar />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/shared/layout/Sidebar.vue'
import ParticleBackground from '@/shared/effects/ParticleBackground.vue'
import { showParticles } from '@/features/home/composables/useHeroScroll.js'

const route = useRoute()
const isMobile = ref(false)

let mobileQuery

function syncMobileViewport(event) {
  isMobile.value = event.matches
}

// 首页在视频退出后显示粒子；非首页始终显示
const particlesVisible = computed(() => {
  if (route.name === 'Home') return showParticles.value
  return true
})

const particleCount = computed(() => isMobile.value ? 32 : 84)
const particleOpacity = computed(() => isMobile.value ? 0.45 : 0.8)

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 768px)')
  isMobile.value = mobileQuery.matches
  mobileQuery.addEventListener('change', syncMobileViewport)
})

onUnmounted(() => {
  mobileQuery?.removeEventListener('change', syncMobileViewport)
})
</script>

<!-- ===== 全局样式 ===== -->
<style>
/* ============================================================
   CSS 变量 — 固定亮色主题
   ============================================================ */

:root {
  /* 主色 */
  --accent: #5B4ED3;
  --accent-hover: #6C5CE7;
  --accent-glow: rgba(91, 78, 211, 0.14);
  --accent-muted: rgba(91, 78, 211, 0.09);

  /* 辅助强调色 */
  --accent-2: #2D76C8;
  --accent-2-glow: rgba(45, 118, 200, 0.16);

  /* 背景 */
  --bg-primary: #FAFAFA;
  --bg-card: rgba(255, 255, 255, 0.72);
  --bg-card-hover: #FFFFFF;
  --bg-input: rgba(20, 20, 24, 0.04);

  /* 边框 */
  --border: rgba(20, 20, 24, 0.09);
  --border-hover: rgba(91, 78, 211, 0.35);

  /* 文字 */
  --text-primary: #1A1A1E;
  --text-secondary: #66666E;
  --text-tertiary: #9A9AA2;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(20, 20, 24, 0.06);
  --shadow-md: 0 8px 24px rgba(20, 20, 24, 0.08);
  --shadow-glow: 0 0 24px var(--accent-glow);

  /* 页面滚动条 */
  --scrollbar-thumb: rgba(108, 92, 231, 0.32);
  --scrollbar-thumb-hover: rgba(108, 92, 231, 0.54);
  --scrollbar-thumb-active: rgba(91, 78, 211, 0.72);

  /* 圆角 */
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 16px;

  /* 过渡 */
  --ease-out: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ============================================================
   基础重置
   ============================================================ */

* {
  margin: 0;
  box-sizing: border-box;
}

html {
  overflow-x: hidden; /* 防止 video + padding 产生横向滚动条 */
}

/* 桌面端保留原生滚动能力，仅弱化轨道并统一品牌视觉 */
@media (hover: hover) and (pointer: fine) {
  html {
    scrollbar-color: var(--scrollbar-thumb) transparent;
    scrollbar-width: thin;
  }

  @supports selector(::-webkit-scrollbar) {
    html {
      scrollbar-color: auto;
      scrollbar-width: auto;
    }

    html::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    html::-webkit-scrollbar-track,
    html::-webkit-scrollbar-corner {
      background: transparent;
    }

    html::-webkit-scrollbar-thumb {
      min-height: 56px;
      border: 3px solid transparent;
      border-radius: 999px;
      background-color: var(--scrollbar-thumb);
      background-clip: content-box;
    }

    html::-webkit-scrollbar-thumb:hover {
      background-color: var(--scrollbar-thumb-hover);
    }

    html::-webkit-scrollbar-thumb:active {
      background-color: var(--scrollbar-thumb-active);
    }

    html::-webkit-scrollbar-button {
      display: none;
      width: 0;
      height: 0;
    }
  }
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  padding-right: 200px;
  font-family: 'Segoe UI Variable', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  /*
    首页 padding-right 由 GSAP ScrollTrigger 动画驱动（0→200px）
    不设 padding-right transition，避免与 GSAP 的 60fps 更新冲突
    主题切换的 background/color transition 保留
  */
  transition: background 0.3s var(--ease-out), color 0.3s var(--ease-out);
}

a {
  text-decoration: none;
  color: inherit;
}

/* ============================================================
   通用卡片样式
   ============================================================ */

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  transition:
    background 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    transform 0.4s var(--ease-spring);
}

.card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}

.card.card-interactive {
  cursor: pointer;
}

/* ============================================================
   页面切换动画
   ============================================================ */

.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ============================================================
   滚动渐显动画（Intersection Observer 驱动）
   ============================================================ */

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ============================================================
   通用按钮
   ============================================================ */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s var(--ease-out);
}

.btn:hover {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
  color: var(--accent);
}

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.btn-primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  color: #fff;
}

/* ============================================================
   通用标签
   ============================================================ */

.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-family: 'Cascadia Code', 'Cascadia Mono', Consolas, monospace;
  background: var(--accent-muted);
  color: var(--accent);
  border: 1px solid rgba(108, 92, 231, 0.15);
}

/* ============================================================
   尊重用户"减少动画"偏好
   ============================================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .reveal {
    opacity: 1;
    transform: none;
  }
}

/* ============================================================
   移动端：小屏幕适配
   ============================================================ */

@media (max-width: 768px) {
  body {
    padding-right: 0;
    font-size: 15px;
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  .card {
    border-radius: var(--radius);
    padding: 16px 18px;
  }

  .card:hover {
    transform: none;
  }

  a, button, .btn {
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 14px;
  }

  h1 { font-size: 1.6rem !important; }
  h2 { font-size: 1.2rem !important; }
  h3 { font-size: 1.0rem !important; }

  .card {
    padding: 14px 16px;
  }
}
</style>

<!-- ===== 2026 visual system: fantasy atmosphere + high-contrast utility UI ===== -->
<style>
:root {
  --accent: #b69cff;
  --accent-hover: #c7b5ff;
  --accent-glow: rgba(151, 113, 255, 0.28);
  --accent-muted: rgba(151, 113, 255, 0.12);
  --accent-2: #66d9ff;
  --accent-2-glow: rgba(102, 217, 255, 0.18);
  --signal: #eaff57;
  --signal-muted: rgba(234, 255, 87, 0.12);
  --warm: #f1d5a5;

  --bg-primary: #0b0b0e;
  --bg-elevated: #131318;
  --bg-card: rgba(22, 21, 28, 0.86);
  --bg-card-hover: #1b1922;
  --bg-input: rgba(255, 255, 255, 0.055);

  --border: rgba(246, 243, 233, 0.13);
  --border-hover: rgba(182, 156, 255, 0.58);
  --text-primary: #f6f3e9;
  --text-secondary: #b8b4bf;
  --text-tertiary: #77737f;

  --shadow-sm: 0 1px 0 rgba(255, 255, 255, 0.04);
  --shadow-md: 0 18px 50px rgba(0, 0, 0, 0.32);
  --shadow-glow: 0 0 0 1px rgba(182, 156, 255, 0.12), 0 18px 54px rgba(86, 56, 160, 0.18);
  --scrollbar-thumb: rgba(182, 156, 255, 0.34);
  --scrollbar-thumb-hover: rgba(234, 255, 87, 0.62);
  --scrollbar-thumb-active: #eaff57;

  --radius-sm: 3px;
  --radius: 5px;
  --radius-lg: 7px;
  --font-display: 'Arial Black', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  --font-body: 'Segoe UI Variable', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'Cascadia Code', 'Cascadia Mono', Consolas, monospace;
}

html {
  background: var(--bg-primary);
  color-scheme: dark;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
  letter-spacing: 0;
}

body::before {
  position: fixed;
  inset: 0;
  z-index: -2;
  content: '';
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
}

::selection {
  background: var(--signal);
  color: #0b0b0e;
}

h1,
h2,
h3,
.display-type {
  font-family: var(--font-display);
  letter-spacing: 0;
  text-wrap: balance;
}

.card {
  position: relative;
  overflow: hidden;
  border-color: var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 2px;
  content: '';
  background: var(--signal);
  transition: width 0.35s var(--ease-out);
}

.card:hover::before {
  width: 92px;
}

.card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow);
}

.btn {
  min-height: 40px;
  border-radius: var(--radius);
  background: #17171c;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: 0;
}

.btn-primary {
  border-color: var(--signal);
  background: var(--signal);
  color: #0b0b0e;
}

.btn-primary:hover {
  border-color: #f2ff91;
  background: #f2ff91;
  color: #0b0b0e;
}

.tag {
  border-color: rgba(182, 156, 255, 0.26);
  border-radius: 2px;
  background: var(--accent-muted);
  color: #d8ccff;
  font-family: var(--font-mono);
  letter-spacing: 0;
}

.main-content:not(.home-content) {
  width: min(100%, 1440px);
  margin-inline: auto;
  padding: 36px clamp(20px, 4vw, 64px) 72px;
}

.main-content.home-content {
  padding: 0;
}

.main-content .header {
  position: relative;
  margin-bottom: 26px;
  padding: 24px 0 26px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.main-content .header::after {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: min(180px, 38%);
  height: 2px;
  content: '';
  background: var(--signal);
}

.main-content .header h1 {
  color: var(--text-primary);
  font-size: 56px;
  line-height: 0.95;
  letter-spacing: 0;
  text-transform: uppercase;
}

.main-content .header .subtitle,
.main-content .header .header-sub {
  max-width: 620px;
  margin-top: 12px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.82rem;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.28s var(--ease-out), transform 0.36s var(--ease-out), clip-path 0.42s var(--ease-out);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(18px);
  clip-path: inset(0 0 8% 0);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  clip-path: inset(8% 0 0 0);
}

@media (max-width: 768px) {
  body::before {
    background-size: 44px 44px;
  }

  .main-content:not(.home-content) {
    padding: 18px 14px 56px;
  }

  .main-content.home-content {
    padding: 0;
  }

  .main-content .header {
    padding-top: 56px;
  }

  .main-content .header h1 {
    font-size: 38px !important;
  }
}

@media (min-width: 1440px) {
  .main-content .header h1 {
    font-size: 68px;
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
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

}
</style>
