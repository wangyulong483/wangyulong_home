<template>
  <!-- 侧边栏 — 桌面固定在右侧，移动端滑出覆盖 -->

  <!-- 移动端：遮罩层 -->
  <div v-if="mobileOpen" class="mobile-overlay" @click="close"></div>

  <!-- 移动端：汉堡按钮 -->
  <button
    class="hamburger js-mobile-menu"
    :class="{ open: mobileOpen, 'home-route': isHome }"
    aria-label="菜单"
    @click="toggle"
  >
    <span></span><span></span><span></span>
  </button>

  <div
    class="right-box js-sidebar"
    :class="{ 'mobile-open': mobileOpen, 'home-route': isHome }"
  >
      <div class="sidebar">
        <!-- 头像 -->
        <router-link to="/" class="sidebar-avatar" title="返回首页" @click="close">
          <img src="/image/mylog.jpg" alt="雷电将军头像" />
        </router-link>

        <div class="sidebar-identity">
          <strong>雷电影</strong>
          <span>一心净土</span>
        </div>

        <!-- 导航 -->
        <nav>
          <ul>
            <li><router-link to="/" class="nav-link" @click="close"><AppIcon icon="compass" size="18" /> 首页</router-link></li>
            <li><router-link to="/applist" class="nav-link" @click="close"><AppIcon icon="controller" size="18" /> 应用</router-link></li>
            <li><router-link to="/about" class="nav-link" @click="close"><AppIcon icon="user-avatar" size="18" /> 关于</router-link></li>
          </ul>
        </nav>

      </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/shared/components/AppIcon.vue'

const router = useRouter()
const mobileOpen = ref(false)

const isHome = computed(() => router.currentRoute.value?.name === 'Home')

function toggle() { mobileOpen.value = !mobileOpen.value }
function close() { mobileOpen.value = false }

watch(() => router.currentRoute.value, close)

function onKey(e) { if (e.key === 'Escape') close() }

onMounted(() => {
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
  --bg-card: rgba(20, 20, 24, 0.04);
  --bg-card-hover: rgba(20, 20, 24, 0.07);
  --border: rgba(20, 20, 24, 0.09);
  --text-primary: #1c1c20;
  --text-secondary: #66666e;
  color: var(--text-primary);
  padding: 10px;
  height: 100%;
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-left: 1px solid rgba(20, 20, 24, 0.09);
  box-shadow: -12px 0 36px rgba(10, 10, 15, 0.06);
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

.sidebar-identity {
  display: none;
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

@media (min-width: 769px) {
  .right-box:not(.home-route) {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateX(0) !important;
    pointer-events: auto !important;
  }

  .right-box.home-route {
    opacity: 0;
    visibility: hidden;
    transform: translateX(100%);
    pointer-events: none;
  }
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
    border-color: rgba(176, 136, 249, 0.48);
    border-radius: 8px;
    background: rgba(18, 14, 31, 0.9);
    box-shadow: 0 8px 24px rgba(19, 12, 35, 0.24);
  }
  .hamburger span { background: #b088f9; }
  .hamburger.home-route {
    opacity: 0;
    visibility: hidden;
    transform: translateX(18px);
    pointer-events: none;
  }
  .mobile-overlay { display: block; }

  .right-box {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateX(100%) !important;
    pointer-events: none !important;
    transition: transform 0.3s var(--ease-out);
  }

  .right-box.mobile-open {
    transform: translateX(0) !important;
    pointer-events: auto !important;
  }

  .sidebar {
    width: min(78vw, 288px) !important;
    padding-top: max(60px, env(safe-area-inset-top));
    padding-bottom: max(28px, env(safe-area-inset-bottom));
    justify-content: flex-start;
    background: #ffffff;
    border-left: 1px solid var(--border);
  }

  .sidebar:hover { width: min(78vw, 288px) !important; }

  .sidebar-avatar {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    border-color: rgba(176, 136, 249, 0.5);
    box-shadow: 0 8px 28px rgba(107, 76, 154, 0.18);
  }

  .sidebar-identity {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 22px;
  }

  .sidebar-identity strong {
    color: #2d2141;
    font-size: 1rem;
  }

  .sidebar-identity span {
    margin-top: 2px;
    color: #80649f;
    font-size: 0.72rem;
  }

  .nav-link {
    padding: 14px 18px;
    font-size: 1rem;
    min-height: 48px;
  }

  .sidebar ul li { margin: 4px 0; }
}
</style>
