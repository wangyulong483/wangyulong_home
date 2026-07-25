<template>
  <!-- 应用列表页 -->
  <div class="app-list">
    <div class="header liquid-glass">
      <h1>应用</h1>
    </div>

    <div class="app-grid">
      <router-link to="/game" class="app-card glass-card">
        <AppIcon icon="rocket" size="32" />
        <span class="app-name">飞机大战</span>
        <span class="app-desc">Canvas 射击游戏</span>
      </router-link>

      <router-link to="/hot-topics" class="app-card glass-card">
        <AppIcon icon="bullhorn" size="32" />
        <span class="app-name">行业热点</span>
        <span class="app-desc">机器人 & AI 前沿动态</span>
      </router-link>

      <router-link to="/shrine" class="app-card glass-card">
        <AppIcon icon="lightning" size="32" />
        <span class="app-name">？！厨厨！？</span>
        <span class="app-desc">雷电将军 · 角色应援页</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue'
</script>

<style scoped>
.app-list { max-width: 800px; margin: 0 auto }
.header { text-align: center; padding: 24px 0; margin-bottom: 24px }
.header h1 { color: #5a4fcf; font-size: 2.2rem; position: relative; z-index: 2 }

.app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; padding: 0 10px }

.app-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 28px 20px; text-align: center; text-decoration: none;
}
.app-name { font-size: 1.15rem; font-weight: 700; color: #5a4fcf }
.app-desc { font-size: 0.85rem; color: #999 }

@media (max-width: 480px) {
  .app-grid { grid-template-columns: 1fr }
  .header h1 { font-size: 1.6rem }
}
</style>
