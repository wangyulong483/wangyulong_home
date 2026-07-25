<template>
  <!-- 侧边栏 — 桌面固定在右侧，移动端滑出覆盖 -->

  <!-- 移动端：遮罩层 -->
  <div v-if="mobileOpen" class="mobile-overlay" @click="close"></div>

  <!-- 移动端：汉堡按钮 -->
  <button class="hamburger" @click="toggle" :class="{ open: mobileOpen }" aria-label="菜单">
    <span></span><span></span><span></span>
  </button>

  <div class="right-box" :class="{ 'mobile-open': mobileOpen }">
    <div class="sidebar liquid-glass">
      <!-- 头像 -->
      <router-link to="/" class="sidebar-avatar" title="返回首页" @click="close">
        <img src="/image/mylog.jpg" alt="头像" />
      </router-link>

      <!-- 导航 -->
      <ul>
        <li><router-link to="/" class="nav-link" @click="close"><AppIcon icon="compass" size="18" /> 首页</router-link></li>
        <li><router-link to="/applist" class="nav-link" @click="close"><AppIcon icon="controller" size="18" /> 应用</router-link></li>
        <li><router-link to="/about" class="nav-link" @click="close"><AppIcon icon="user-avatar" size="18" /> 关于</router-link></li>
        <li><router-link to="/birthdaylist" class="nav-link" @click="close"><AppIcon icon="clover" size="18" /> 生日</router-link></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const mobileOpen = ref(false)

function toggle() { mobileOpen.value = !mobileOpen.value }
function close() { mobileOpen.value = false }

// 路由变化自动关闭
watch(() => router.currentRoute.value, close)

// ESC 关闭
function onKey(e) { if (e.key === 'Escape') close() }

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* ====== 汉堡按钮 ====== */
.hamburger {
  display: none;
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 200;
  width: 40px; height: 40px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(90, 79, 207, 0.12);
  border-radius: 10px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  transition: all 0.3s;
}

.hamburger span {
  display: block;
  width: 20px; height: 2px;
  background: #5a4fcf;
  border-radius: 2px;
  transition: all 0.3s;
}

.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px) }
.hamburger.open span:nth-child(2) { opacity: 0 }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px) }

/* ====== 遮罩 ====== */
.mobile-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 98;
}

/* ====== 侧边栏容器 ====== */
.right-box {
  position: fixed;
  right: 0; top: 0;
  height: 100vh;
  z-index: 99;
}

/* ====== 侧边栏 ====== */
.sidebar {
  color: #333;
  padding: 10px;
  height: 100%;
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(28px) saturate(1.8) brightness(1.05) !important;
  -webkit-backdrop-filter: blur(28px) saturate(1.8) brightness(1.05) !important;
  border: 1px solid rgba(90, 79, 207, 0.08) !important;
  border-radius: 0 !important;
  box-shadow:
    -2px 0 24px rgba(90, 79, 207, 0.06),
    inset -1px 0 0 rgba(90, 79, 207, 0.04) !important;
  transition: width 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.sidebar:hover { width: 210px }

/* ====== 头像 ====== */
.sidebar-avatar {
  display: block;
  width: 100px; height: 100px;
  border-radius: 50%; overflow: hidden;
  margin-bottom: 20px;
  border: 2px solid rgba(90, 79, 207, 0.15);
  box-shadow: 0 2px 16px rgba(90, 79, 207, 0.08);
  transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.sidebar-avatar:hover {
  border-color: rgba(90, 79, 207, 0.4);
  box-shadow: 0 4px 24px rgba(90, 79, 207, 0.15);
  transform: scale(1.06);
}

.sidebar-avatar img { width: 100%; height: 100%; object-fit: cover }

/* ====== 导航 ====== */
.sidebar ul { list-style: none; padding: 0; margin: 0 }
.sidebar ul li { margin: 12px 0; transition: transform 0.3s }
.sidebar ul li:hover { transform: translateX(-4px) }

.nav-link {
  position: relative;
  color: #333;
  text-decoration: none;
  display: flex; align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  font-size: 0.95rem;
  white-space: nowrap;
}

/* 按钮上下像素线 — 默认透明，悬停显示 */
.nav-link::before,
.nav-link::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  height: 1.5px;
  border-radius: 1px;
  background: #5a4fcf;
  opacity: 0;
  transform: scaleX(0.6);
  transition: opacity 0.3s, transform 0.3s;
}

.nav-link::before { top: 2px }
.nav-link::after  { bottom: 2px }

/* 悬停状态 */
.nav-link:hover {
  color: #5a4fcf;
  background: rgba(90, 79, 207, 0.08);
  padding-left: 18px;
}

.nav-link:hover::before,
.nav-link:hover::after {
  opacity: 1;
  transform: scaleX(1);
}

/* 当前激活路由 */
.nav-link.router-link-active {
  color: #5a4fcf;
  background: rgba(90, 79, 207, 0.06);
  font-weight: 600;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .hamburger { display: flex }
  .mobile-overlay { display: block }

  .right-box {
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .right-box.mobile-open { transform: translateX(0) }

  .sidebar {
    width: 210px !important;
    padding-top: 60px;
    justify-content: flex-start;
    background: rgba(255, 255, 255, 0.85) !important;
  }

  .sidebar:hover { width: 210px !important }

  .sidebar-avatar { width: 80px; height: 80px }
}
</style>
