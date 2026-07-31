<template>
  <div v-if="mobileOpen" class="mobile-overlay" @click="close"></div>

  <button
    class="hamburger js-mobile-menu"
    :class="{ open: mobileOpen, 'home-route': isHome }"
    :aria-label="mobileOpen ? '关闭菜单' : '打开菜单'"
    @click="toggle"
  >
    <span></span><span></span><span></span>
  </button>

  <aside
    class="right-box js-sidebar"
    :class="{ 'mobile-open': mobileOpen, 'home-route': isHome }"
  >
    <div class="sidebar">
      <header class="rail-head">
        <strong>WYL</strong>
        <span>WORLD // 01</span>
      </header>

      <router-link to="/" class="sidebar-avatar" title="返回首页" @click="close">
        <img src="/image/mylog.jpg" alt="雷电将军头像" />
        <span aria-hidden="true">HOME</span>
      </router-link>

      <div class="sidebar-identity">
        <strong>归去来兮</strong>
        <span>一心净土 / ETERNITY</span>
      </div>

      <nav aria-label="主导航">
        <ul>
          <li>
            <router-link to="/" class="nav-link" @click="close">
              <span class="nav-code">00</span><AppIcon icon="compass" size="18" /><span>首页</span>
            </router-link>
          </li>
          <li>
            <router-link to="/applist" class="nav-link" @click="close">
              <span class="nav-code">01</span><AppIcon icon="controller" size="18" /><span>应用</span>
            </router-link>
          </li>
          <li>
            <router-link to="/about" class="nav-link" @click="close">
              <span class="nav-code">02</span><AppIcon icon="user-avatar" size="18" /><span>关于</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <footer class="rail-foot">
        <span><i></i> SYSTEM ONLINE</span>
        <small>CN / 2026</small>
      </footer>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/shared/components/AppIcon.vue'

const router = useRouter()
const mobileOpen = ref(false)
const isHome = computed(() => router.currentRoute.value?.name === 'Home')

function toggle() { mobileOpen.value = !mobileOpen.value }
function close() { mobileOpen.value = false }
function onKey(event) { if (event.key === 'Escape') close() }

watch(() => router.currentRoute.value, close)

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.hamburger {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  right: max(12px, env(safe-area-inset-right));
  z-index: 200;
  display: none;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 1px solid rgba(234, 255, 87, 0.56);
  border-radius: 3px;
  background: rgba(10, 10, 13, 0.92);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.34);
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--signal);
  transition: transform 0.28s var(--ease-out), opacity 0.2s var(--ease-out);
}

.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 98;
  display: none;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.right-box {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 99;
  height: 100svh;
}

.sidebar {
  position: relative;
  display: flex;
  width: 200px;
  height: 100%;
  padding: 24px 18px 20px;
  flex-direction: column;
  align-items: stretch;
  border-left: 1px solid rgba(246, 243, 233, 0.13);
  background: rgba(12, 12, 15, 0.96);
  color: var(--text-primary);
  box-shadow: -18px 0 60px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.sidebar::before {
  position: absolute;
  top: 0;
  left: -1px;
  width: 2px;
  height: 92px;
  content: '';
  background: var(--signal);
}

.rail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
}

.rail-head strong {
  color: var(--signal);
  font-family: var(--font-display);
  font-size: 18px;
}

.rail-head span {
  color: var(--text-tertiary);
  font-size: 8px;
}

.sidebar-avatar {
  position: relative;
  display: block;
  width: 96px;
  height: 96px;
  margin: 54px auto 16px;
  overflow: hidden;
  border: 1px solid rgba(182, 156, 255, 0.48);
  border-radius: 4px;
  background: #17151d;
  box-shadow: 12px 12px 0 rgba(182, 156, 255, 0.1);
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
}

.sidebar-avatar::before,
.sidebar-avatar::after {
  position: absolute;
  z-index: 2;
  content: '';
  background: var(--signal);
}

.sidebar-avatar::before { top: 8px; left: 0; width: 18px; height: 2px; }
.sidebar-avatar::after { top: 0; left: 8px; width: 2px; height: 18px; }

.sidebar-avatar:hover {
  border-color: var(--signal);
  box-shadow: 7px 7px 0 rgba(234, 255, 87, 0.16);
  transform: translate(2px, 2px);
}

.sidebar-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: saturate(0.76) contrast(1.06);
}

.sidebar-avatar > span {
  position: absolute;
  right: 4px;
  bottom: 4px;
  padding: 2px 4px;
  background: #0b0b0e;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 7px;
}

.sidebar-identity {
  display: flex;
  margin-bottom: 36px;
  flex-direction: column;
  align-items: center;
}

.sidebar-identity strong {
  color: var(--text-primary);
  font-size: 15px;
}

.sidebar-identity span {
  margin-top: 3px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
}

.sidebar ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar li {
  margin: 4px 0;
}

.nav-link {
  position: relative;
  display: grid;
  grid-template-columns: 24px 20px 1fr;
  min-height: 46px;
  padding: 0 10px;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  color: var(--text-secondary);
  font-size: 13px;
  transition: color 0.24s var(--ease-out), border-color 0.24s var(--ease-out), background 0.24s var(--ease-out), transform 0.24s var(--ease-out);
}

.nav-code {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
}

.nav-link:hover {
  border-color: rgba(182, 156, 255, 0.28);
  background: var(--accent-muted);
  color: var(--text-primary);
  transform: translateX(-3px);
}

.nav-link.router-link-active {
  border-color: rgba(234, 255, 87, 0.3);
  background: var(--signal-muted);
  color: var(--signal);
}

.nav-link.router-link-active::after {
  position: absolute;
  top: 8px;
  right: -19px;
  width: 3px;
  height: 30px;
  content: '';
  background: var(--signal);
}

.rail-foot {
  display: flex;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  flex-direction: column;
  gap: 5px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
}

.rail-foot span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--signal);
}

.rail-foot i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
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

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .hamburger.home-route {
    opacity: 0;
    visibility: hidden;
    transform: translateX(18px);
    pointer-events: none;
  }

  .mobile-overlay {
    display: block;
  }

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
    width: min(82vw, 310px);
    padding-top: max(24px, env(safe-area-inset-top));
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }

  .sidebar-avatar {
    margin-top: 46px;
  }

  .nav-link {
    min-height: 50px;
    padding-inline: 14px;
    font-size: 14px;
  }
}
</style>
