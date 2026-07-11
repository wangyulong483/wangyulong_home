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
  background: rgba(30, 30, 50, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
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
  background: #fff;
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
  color: white;
  padding: 10px;
  height: 100%;
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(30, 30, 50, 0.55) !important;
  backdrop-filter: blur(28px) saturate(2) brightness(0.9) !important;
  -webkit-backdrop-filter: blur(28px) saturate(2) brightness(0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 0 !important;
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.15), inset -1px 0 0 rgba(255, 255, 255, 0.08) !important;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.sidebar:hover { width: 200px }

/* ====== 头像 ====== */
.sidebar-avatar {
  display: block;
  width: 100px; height: 100px;
  border-radius: 50%; overflow: hidden;
  margin-bottom: 20px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.4s;
  cursor: pointer;
}

.sidebar-avatar:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.08);
}

.sidebar-avatar img { width: 100%; height: 100%; object-fit: cover }

/* ====== 导航 ====== */
.sidebar ul { list-style: none; padding: 0; margin: 0 }
.sidebar ul li { margin: 20px 0; transition: transform 0.3s }
.sidebar ul li:hover { transform: translateX(-5px) }

.nav-link {
  position: relative;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  display: flex; align-items: center;
  padding: 8px 10px; border-radius: 6px;
  transition: all 0.3s; font-size: 0.95rem;
  white-space: nowrap;
}

.nav-link::after {
  content: ''; position: absolute;
  bottom: 4px; left: 10px;
  width: 0; height: 2px;
  background: rgba(255, 255, 255, 0.6); border-radius: 1px;
  transition: width 0.3s;
}

.nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); padding-left: 15px }
.nav-link:hover::after { width: calc(100% - 20px) }
.nav-link.router-link-active { background: rgba(255,255,255,0.1) }

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
    width: 200px !important;
    padding-top: 60px;
    justify-content: flex-start;
  }

  .sidebar:hover { width: 200px !important }

  .sidebar-avatar { width: 80px; height: 80px }
}
</style>
