<template>
  <!-- 应用列表页 -->
  <div class="app-list">
    <div class="header">
      <h1>应用</h1>
      <p class="header-sub">工具 · 游戏 · 实验</p>
    </div>

    <div class="app-grid">
      <router-link to="/game" class="app-card card card-interactive">
        <span class="app-icon-wrap">
          <AppIcon icon="rocket" size="28" />
        </span>
        <span class="app-name">飞机大战</span>
        <span class="app-desc">Canvas 射击游戏</span>
      </router-link>

      <router-link to="/hot-topics" class="app-card card card-interactive">
        <span class="app-icon-wrap">
          <AppIcon icon="bullhorn" size="28" />
        </span>
        <span class="app-name">行业热点</span>
        <span class="app-desc">机器人 & AI 前沿动态</span>
      </router-link>

      <router-link to="/map-zone-painter" class="app-card card card-interactive">
        <span class="app-icon-wrap">
          <AppIcon icon="map" size="28" />
        </span>
        <span class="app-name">地图区域绘制器</span>
        <span class="app-desc">ROS2 · PGM · Nav2 Mask</span>
      </router-link>

      <router-link to="/shrine" class="app-card card card-interactive">
        <span class="app-icon-wrap">
          <AppIcon icon="lightning" size="28" />
        </span>
        <span class="app-name">？！厨厨！？</span>
        <span class="app-desc">雷电将军 · 影像 / 攻略 / 对话</span>
      </router-link>

    </div>
  </div>
</template>

<script setup>
import AppIcon from '@/shared/components/AppIcon.vue'
</script>

<style scoped>
.app-list {
  max-width: 860px;
  margin: 0 auto;
}

/* -------- 头部 -------- */
.header {
  text-align: center;
  padding: 36px 0;
}

.header h1 {
  color: var(--text-primary);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: 0;
}

.header-sub {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin-top: 6px;
}

/* -------- 卡片网格 -------- */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
  padding: 0 4px;
}

.app-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 20px;
  text-align: center;
  text-decoration: none;
  color: var(--text-primary);
}

.app-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  color: var(--signal);
  background: var(--signal-muted);
  border: 1px solid rgba(234, 255, 87, 0.24);
  margin-bottom: 4px;
  transition: all 0.3s var(--ease-out);
}

.app-card:hover .app-icon-wrap {
  background: rgba(234, 255, 87, 0.18);
  border-color: rgba(234, 255, 87, 0.58);
  box-shadow: 0 0 18px rgba(234, 255, 87, 0.18);
}

.app-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.app-desc {
  font-size: 0.82rem;
  color: var(--text-tertiary);
  font-family: 'Cascadia Code', 'Cascadia Mono', Consolas, monospace;
}

@media (max-width: 768px) {
  .app-list { padding: 0 8px; }
  .app-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
  .app-card { padding: 24px 16px; min-height: 130px; }
  .header { padding: 24px 0; }
}

@media (max-width: 480px) {
  .app-grid { grid-template-columns: 1fr; }
  .header h1 { font-size: 1.6rem; }
  .app-card { padding: 20px 16px; min-height: auto; flex-direction: row; gap: 14px; text-align: left; }
  .app-icon-wrap { width: 44px; height: 44px; margin-bottom: 0; flex-shrink: 0; }
}
</style>
