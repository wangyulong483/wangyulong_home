<template>
  <!-- 行业热点 — 占位页面，下一轮开发 -->
  <div class="hot-topics">
    <div class="header liquid-glass">
      <h1>行业热点</h1>
      <p class="subtitle">机器人 & AI 行业前沿动态</p>
    </div>
    <div class="placeholder glass-card">
      <AppIcon icon="compass" size="48" />
      <p>即将上线，敬请期待...</p>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue'
</script>

<style scoped>
.hot-topics { max-width: 800px; margin: 0 auto }
.header { text-align: center; padding: 24px 0; margin-bottom: 24px }
.header h1 { color: #5a4fcf; font-size: 2.2rem; position: relative; z-index: 2 }
.subtitle { color: #666; font-size: 1rem; margin-top: 6px; position: relative; z-index: 2 }
.placeholder { text-align: center; padding: 60px 40px; margin: 0 auto; max-width: 500px }
.placeholder p { margin-top: 20px; color: #999; font-size: 1.1rem }
</style>
