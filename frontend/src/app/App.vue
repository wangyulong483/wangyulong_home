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
  />

  <div class="app-layout">
    <main class="main-content">
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
