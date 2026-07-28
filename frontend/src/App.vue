<template>
  <!--
    App.vue — 根组件
    布局：粒子背景 + 主内容区 + 右侧边栏
  -->
  <ParticleBackground v-if="showParticles" :count="100" :opacity="0.8" :z-index="-1" />

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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import ParticleBackground from '@/components/ParticleBackground.vue'
import { heroVisible } from '@/composables/useHeroScroll.js'

const route = useRoute()

// 首页第一页（全屏视频）不显示粒子背景
const showParticles = computed(() => {
  if (route.name === 'Home') return !heroVisible.value
  return true
})
</script>

<!-- ===== 全局样式 ===== -->
<style>
/* ============================================================
   CSS 变量 — 暗色主题（默认）+ 亮色主题
   ============================================================ */

:root {
  /* 主色 */
  --accent: #6C5CE7;
  --accent-hover: #7D6FF0;
  --accent-glow: rgba(108, 92, 231, 0.25);
  --accent-muted: rgba(108, 92, 231, 0.10);

  /* 辅助强调色 */
  --accent-2: #00D2FF;
  --accent-2-glow: rgba(0, 210, 255, 0.20);

  /* 背景 */
  --bg-primary: #0A0A0F;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.06);
  --bg-input: rgba(255, 255, 255, 0.06);

  /* 边框 */
  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(108, 92, 231, 0.30);

  /* 文字 */
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-tertiary: rgba(255, 255, 255, 0.30);

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 24px var(--accent-glow);

  /* 圆角 */
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 16px;

  /* 过渡 */
  --ease-out: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 亮色主题 */
[data-theme="light"] {
  --bg-primary: #FAFAFA;
  --bg-card: rgba(0, 0, 0, 0.02);
  --bg-card-hover: rgba(0, 0, 0, 0.05);
  --bg-input: rgba(0, 0, 0, 0.04);

  --border: rgba(0, 0, 0, 0.08);
  --border-hover: rgba(91, 78, 211, 0.35);

  --text-primary: #1A1A1A;
  --text-secondary: #737373;
  --text-tertiary: #A3A3A3;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 0 24px rgba(91, 78, 211, 0.12);
}

/* ============================================================
   基础重置
   ============================================================ */

* {
  margin: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  padding-right: 200px;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.3s var(--ease-out), color 0.3s var(--ease-out), padding-right 0.35s ease;
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
  font-family: 'JetBrains Mono', 'Courier New', monospace;
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
