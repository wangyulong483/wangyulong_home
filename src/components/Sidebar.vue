<template>
  <!--
    右侧边栏组件 — 液态玻璃风格
    功能：显示头像 + 导航菜单
  -->
  <div class="right-box">
    <div class="sidebar liquid-glass">
      <!-- 头像区域 — 点击返回首页 -->
      <router-link to="/" class="sidebar-avatar" title="返回首页">
        <img src="/image/mylog.jpg" alt="头像" />
      </router-link>

      <!-- 导航菜单 — 使用 SVG 图标 -->
      <ul>
        <li><router-link to="/" class="nav-link"><AppIcon icon="compass" size="18" /> 首页</router-link></li>
        <li><router-link to="/gamelist" class="nav-link"><AppIcon icon="controller" size="18" /> 游戏</router-link></li>
        <li><router-link to="/about" class="nav-link"><AppIcon icon="user-avatar" size="18" /> 关于</router-link></li>
        <li><router-link to="/birthdaylist" class="nav-link"><AppIcon icon="clover" size="18" /> 生日</router-link></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue'
</script>

<style scoped>
/* -------- 容器 -------- */
.right-box {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
}

/* -------- 液态玻璃侧边栏 -------- */
/* 基础布局 + 暗色玻璃覆盖 */
.sidebar {
  color: white;
  padding: 10px;
  height: 100%;
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 暗色玻璃：深色透明底 + 亮色文字 */
  background: rgba(30, 30, 50, 0.55) !important;
  backdrop-filter: blur(28px) saturate(2) brightness(0.9) !important;
  -webkit-backdrop-filter: blur(28px) saturate(2) brightness(0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 0 !important;
  box-shadow:
    -4px 0 30px rgba(0, 0, 0, 0.15),
    inset -1px 0 0 rgba(255, 255, 255, 0.08) !important;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.sidebar:hover {
  width: 200px;
  background: rgba(30, 30, 50, 0.65) !important;
  backdrop-filter: blur(28px) saturate(3) brightness(0.95) !important;
  -webkit-backdrop-filter: blur(28px) saturate(3) brightness(0.95) !important;
  box-shadow:
    -8px 0 40px rgba(0, 0, 0, 0.25),
    inset -1px 0 0 rgba(255, 255, 255, 0.12) !important;
}

/* -------- 头像 -------- */
.sidebar-avatar {
  display: block;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.sidebar-avatar:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.08);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.sidebar-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* -------- 导航列表 -------- */
.sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar ul li {
  margin: 20px 0;
  transition: transform 0.3s ease;
}

.sidebar ul li:hover {
  transform: translateX(-5px);
}

/* -------- 导航链接 — 下划线动画 -------- */
.nav-link {
  position: relative;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 10px;
  width: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1px;
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.08);
  padding-left: 15px;
}

.nav-link:hover::after {
  width: calc(100% - 20px);
}

/* -------- 小屏幕适配 -------- */
@media (max-width: 768px) {
  .right-box {
    position: static;
    height: auto;
  }

  .sidebar {
    width: 100% !important;
    flex-direction: row;
    padding: 10px 20px;
    border-radius: 0 !important;
    backdrop-filter: blur(15px) saturate(2) brightness(0.9) !important;
  }

  .sidebar:hover {
    width: 100% !important;
  }

  .sidebar-avatar {
    display: none;
  }

  .sidebar ul {
    display: flex;
    gap: 15px;
  }

  .sidebar ul li {
    margin: 0;
  }

  .sidebar ul li:hover {
    transform: translateY(-2px);
  }
}
</style>
