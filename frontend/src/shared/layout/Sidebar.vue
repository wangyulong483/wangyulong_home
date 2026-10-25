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

      <router-link to="/" class="sidebar-avatar" title="返回首页" aria-label="返回首页" @click="close">
        <span class="avatar-frame">
          <img
            src="/image/mylog.jpg"
            alt=""
            width="640"
            height="640"
            loading="lazy"
            decoding="async"
          />
          <span class="avatar-ink" aria-hidden="true"></span>
          <span class="avatar-reg" aria-hidden="true"></span>
        </span>
        <span class="avatar-word" aria-hidden="true">01</span>
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
            <router-link to="/blog" class="nav-link" @click="close">
              <span class="nav-code">02</span><AppIcon icon="document" size="18" /><span>博客文章</span>
            </router-link>
          </li>
          <li>
            <router-link to="/dialogue" class="nav-link" @click="close">
              <span class="nav-code">03</span><AppIcon icon="message" size="18" /><span>与影对谈</span>
            </router-link>
          </li>
          <li>
            <router-link to="/about" class="nav-link" @click="close">
              <span class="nav-code">04</span><AppIcon icon="user-avatar" size="18" /><span>关于</span>
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
  border: 1px solid rgba(216, 178, 90, 0.62);
  border-radius: 1px;
  background: rgba(13, 9, 24, 0.94);
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
  border-left: 1px solid rgba(167, 139, 250, 0.26);
  background:
    linear-gradient(180deg, rgba(76, 29, 149, 0.16), transparent 34%),
    rgba(13, 9, 24, 0.97);
  color: var(--text-primary);
  box-shadow: -18px 0 60px rgba(0, 0, 0, 0.44);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.sidebar::before {
  position: absolute;
  top: 0;
  left: -1px;
  width: 3px;
  height: 132px;
  content: '';
  background: linear-gradient(180deg, var(--purple), var(--red) 62%, var(--gold));
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
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
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
  border: 1px solid rgba(216, 178, 90, 0.5);
  border-radius: 0;
  background: #0e0918;
  box-shadow: 9px 9px 0 rgba(139, 92, 246, 0.22);
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
}

.sidebar-avatar:hover {
  border-color: var(--gold-bright);
  box-shadow: 5px 5px 0 var(--red);
  transform: translate(3px, 3px);
}

/* 头像也印在纸上：白底融进米纸，只留她本人 */
.avatar-frame {
  position: absolute;
  inset: 7px;
  overflow: hidden;
  background: linear-gradient(160deg, #f2ebdc, #ded2bb);
  clip-path: polygon(0 0, 100% 0, 100% 84%, 84% 100%, 0 100%);
}

.avatar-frame img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 34%;
  mix-blend-mode: multiply;
  filter: contrast(1.07) saturate(1.08) brightness(1.02);
  transform: scale(1.06);
  transition: transform 0.6s var(--ease-out);
}

.sidebar-avatar:hover .avatar-frame img {
  transform: scale(1.12);
}

.avatar-ink {
  position: absolute;
  inset: 0;
  background: linear-gradient(196deg, rgba(247, 240, 227, 0.34), rgba(167, 139, 250, 0.26) 60%, rgba(76, 29, 149, 0.42));
  mix-blend-mode: multiply;
}

.avatar-frame::after {
  position: absolute;
  inset: 0;
  content: '';
  background-image: radial-gradient(circle at center, rgba(18, 12, 30, 0.75) 0.7px, transparent 1px);
  background-size: 3px 3px;
  mix-blend-mode: multiply;
  opacity: 0.34;
  -webkit-mask-image: linear-gradient(0deg, #000 0 30%, transparent 60%);
  mask-image: linear-gradient(0deg, #000 0 30%, transparent 60%);
}

.avatar-reg {
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 8px;
  height: 8px;
  border-right: 1px solid rgba(18, 16, 15, 0.55);
  border-bottom: 1px solid rgba(18, 16, 15, 0.55);
}

.avatar-word {
  position: absolute;
  top: -7px;
  right: -7px;
  z-index: 3;
  padding: 1px 4px;
  border: 1px solid var(--red);
  background: #ece4d3;
  color: #b3142a;
  font-family: var(--font-serif);
  font-size: 10px;
  line-height: 1.2;
  box-shadow: 3px 3px 0 rgba(224, 27, 46, 0.85);
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
  border-color: rgba(167, 139, 250, 0.36);
  background: rgba(139, 92, 246, 0.12);
  color: var(--text-primary);
  transform: translateX(-3px);
}

.nav-link.router-link-active {
  border-color: rgba(216, 178, 90, 0.38);
  background:
    linear-gradient(90deg, rgba(139, 92, 246, 0.32), rgba(139, 92, 246, 0.06) 72%, transparent);
  color: var(--gold-bright);
  box-shadow: inset 3px 0 0 var(--red);
}

.nav-link.router-link-active::after {
  position: absolute;
  top: 8px;
  right: -19px;
  width: 4px;
  height: 30px;
  content: '';
  background: linear-gradient(180deg, var(--purple-bright), var(--red));
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
