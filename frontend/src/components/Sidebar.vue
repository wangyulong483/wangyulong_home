<template>
  <!-- 侧边栏 — 桌面固定在右侧，移动端滑出覆盖 -->

  <!-- 移动端：遮罩层 -->
  <div v-if="mobileOpen" class="mobile-overlay" @click="close"></div>

  <!-- 移动端：汉堡按钮 -->
  <button class="hamburger" @click="toggle" :class="{ open: mobileOpen }" aria-label="菜单">
    <span></span><span></span><span></span>
  </button>

  <div class="right-box js-sidebar" :class="{ 'mobile-open': mobileOpen }" :style="rightBoxStyle">
      <div class="sidebar">
        <!-- 头像 -->
        <router-link to="/" class="sidebar-avatar" title="返回首页" @click="close">
          <img src="/image/mylog.jpg" alt="头像" />
        </router-link>

        <!-- 导航 -->
        <nav>
          <ul>
            <li><router-link to="/" class="nav-link" @click="close"><AppIcon icon="compass" size="18" /> 首页</router-link></li>
            <li><router-link to="/applist" class="nav-link" @click="close"><AppIcon icon="controller" size="18" /> 应用</router-link></li>
            <li><router-link to="/about" class="nav-link" @click="close"><AppIcon icon="user-avatar" size="18" /> 关于</router-link></li>
          </ul>
        </nav>

        <!-- 底部：主题切换 -->
        <button class="theme-toggle" @click="toggleTheme" :aria-label="isLight ? '切换到暗色模式' : '切换到亮色模式'">
          <svg v-if="isLight" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span class="toggle-label">{{ isLight ? '亮色' : '暗色' }}</span>
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const mobileOpen = ref(false)
const isLight = ref(false)

const isHome = computed(() => router.currentRoute.value?.name === 'Home')

/*
  侧边栏样式：
  - 首页：GSAP ScrollTrigger 控制 .js-sidebar 的 opacity + translateX
          Vue 不插手，返回空对象（style 绑定不生效）
  - 非首页：始终完全可见，CSS transition 处理平滑切换
*/
const rightBoxStyle = computed(() => {
  if (isHome.value) return {} // GSAP 接管
  return { opacity: 1, transform: 'translateX(0)', pointerEvents: 'auto' }
})

function toggle() { mobileOpen.value = !mobileOpen.value }
function close() { mobileOpen.value = false }

watch(() => router.currentRoute.value, close)

function onKey(e) { if (e.key === 'Escape') close() }

function toggleTheme() {
  const html = document.documentElement
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
  html.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
  isLight.value = next === 'light'
}

function syncTheme() {
  isLight.value = document.documentElement.getAttribute('data-theme') === 'light'
}

onMounted(() => {
  syncTheme()
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
/* ====== 汉堡按钮 ====== */
.hamburger {
  display: none;
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 200;
  width: 44px; height: 44px;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  transition: all 0.3s;
  top: max(12px, env(safe-area-inset-top));
  right: max(12px, env(safe-area-inset-right));
}

.hamburger span {
  display: block;
  width: 20px; height: 2px;
  background: var(--accent);
  border-radius: 2px;
  transition: all 0.3s;
}

.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

/* ====== 遮罩 ====== */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 98;
}

/* ====== 侧边栏容器 ====== */
.right-box {
  position: fixed;
  right: 0; top: 0;
  height: 100vh;
  z-index: 99;
}

/* ====== 侧边栏本体 ====== */
.sidebar {
  color: var(--text-primary);
  padding: 10px;
  height: 100%;
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--bg-primary);
  border-left: 1px solid var(--border);
  transition: width 0.35s var(--ease-out);
}

.sidebar:hover { width: 220px; }

/* ====== 头像 ====== */
.sidebar-avatar {
  display: block;
  width: 80px; height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 24px;
  border: 2px solid rgba(108, 92, 231, 0.20);
  box-shadow: 0 0 16px rgba(108, 92, 231, 0.08);
  transition: all 0.35s var(--ease-out);
  cursor: pointer;
  flex-shrink: 0;
}

.sidebar-avatar:hover {
  border-color: rgba(108, 92, 231, 0.50);
  box-shadow: 0 0 24px rgba(108, 92, 231, 0.18);
  transform: scale(1.06);
}

.sidebar-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ====== 导航 ====== */
.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar ul li {
  margin: 8px 0;
  transition: transform 0.3s;
}

.sidebar ul li:hover {
  transform: translateX(-4px);
}

.nav-link {
  position: relative;
  color: var(--text-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius);
  transition: all 0.3s var(--ease-out);
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--accent);
  background: var(--accent-muted);
  padding-left: 18px;
}

.nav-link.router-link-active {
  color: var(--accent);
  background: var(--accent-muted);
  font-weight: 600;
  box-shadow: inset 2px 0 0 var(--accent);
}

/* ====== 主题切换按钮 ====== */
.theme-toggle {
  position: absolute;
  bottom: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s var(--ease-out);
}

.theme-toggle:hover {
  border-color: var(--border-hover);
  color: var(--accent);
  background: var(--bg-card-hover);
}

.toggle-label {
  font-size: 0.72rem;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .hamburger { display: flex; }
  .mobile-overlay { display: block; }

  .right-box {
    transform: translateX(100%);
    transition: transform 0.3s var(--ease-out);
  }

  .right-box.mobile-open { transform: translateX(0); }

  .sidebar {
    width: 240px !important;
    padding-top: max(60px, env(safe-area-inset-top));
    padding-bottom: max(80px, env(safe-area-inset-bottom));
    justify-content: flex-start;
    background: var(--bg-primary);
    border-left: 1px solid var(--border);
  }

  .sidebar:hover { width: 240px !important; }

  .sidebar-avatar { width: 72px; height: 72px; }

  .nav-link {
    padding: 14px 18px;
    font-size: 1rem;
    min-height: 48px;
  }

  .sidebar ul li { margin: 4px 0; }
}
</style>
