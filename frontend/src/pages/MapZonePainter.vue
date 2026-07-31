<template>
  <div class="map-zone-page">
    <header class="header map-header">
      <div class="header-copy">
        <router-link class="back-link" to="/applist">
          <AppIcon icon="arrow-left" size="13" /> 应用终端
        </router-link>
        <p class="module-code">MODULE // ROS2-04</p>
        <h1>地图区域绘制器</h1>
        <p class="subtitle">PGM MAP / KEEPOUT / SPEED FILTER</p>
      </div>
      <div class="header-tags" aria-label="模块格式">
        <span>P2 / P5</span>
        <span>NAV2</span>
        <span>LOCAL TOOL</span>
      </div>
    </header>

    <ZonePainterWorkspace />

    <footer class="source-credit">
      <div class="credit-mark" aria-hidden="true">OSS</div>
      <div class="credit-copy">
        <span class="credit-label">OPEN SOURCE ATTRIBUTION</span>
        <strong>ros2-map-zone-painter</strong>
        <p>基于 Adil NAS 的 MIT 开源项目进行 Web 端功能等价迁移。</p>
      </div>
      <div class="credit-links">
        <a href="https://github.com/Adilnasceng" target="_blank" rel="noopener noreferrer">
          <AppIcon icon="user-avatar" size="14" /> 作者 Adil NAS
        </a>
        <a href="https://github.com/Adilnasceng/ros2-map-zone-painter" target="_blank" rel="noopener noreferrer">
          <AppIcon icon="code" size="14" /> GitHub 源码
        </a>
        <a href="https://github.com/Adilnasceng/ros2-map-zone-painter/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
          <AppIcon icon="document" size="14" /> MIT License
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppIcon from '@/shared/components/AppIcon.vue'
import ZonePainterWorkspace from '@/features/map-zone-painter/components/ZonePainterWorkspace.vue'
</script>

<style scoped>
.map-zone-page {
  width: min(100%, 1240px);
  margin: 0 auto;
}

.map-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

.header-copy { min-width: 0; }
.back-link {
  display: inline-flex;
  margin-bottom: 20px;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
  transition: color 0.2s ease;
}
.back-link:hover { color: var(--signal); }
.module-code { margin-bottom: 8px; color: var(--signal); font-family: var(--font-mono); font-size: 9px; }

.header-tags { display: flex; padding-bottom: 5px; gap: 6px; }
.header-tags span {
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
}
.header-tags span:first-child { border-color: rgba(234, 255, 87, 0.28); color: var(--signal); }

.source-credit {
  display: grid;
  margin-top: 18px;
  padding: 20px 22px;
  grid-template-columns: 58px 1fr auto;
  align-items: center;
  gap: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(18, 18, 23, 0.82);
}
.credit-mark {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid rgba(234, 255, 87, 0.4);
  background: var(--signal-muted);
  color: var(--signal);
  font-family: var(--font-display);
  font-size: 14px;
}
.credit-copy { display: flex; min-width: 0; flex-direction: column; }
.credit-label { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.credit-copy strong { margin-top: 3px; color: var(--text-primary); font-size: 15px; }
.credit-copy p { margin-top: 2px; color: var(--text-tertiary); font-size: 11px; }
.credit-links { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.credit-links a {
  display: inline-flex;
  min-height: 36px;
  padding: 0 10px;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 9px;
  transition: 0.2s ease;
}
.credit-links a:hover { border-color: var(--border-hover); color: var(--text-primary); background: var(--accent-muted); }

@media (max-width: 900px) {
  .source-credit { grid-template-columns: 52px 1fr; }
  .credit-links { grid-column: 1 / -1; justify-content: flex-start; }
}

@media (max-width: 640px) {
  .map-header { align-items: flex-start; flex-direction: column; gap: 12px; }
  .header-tags { padding-bottom: 0; }
  .source-credit { padding: 16px; grid-template-columns: 44px 1fr; gap: 12px; }
  .credit-mark { width: 42px; height: 42px; font-size: 11px; }
  .credit-links { display: grid; grid-template-columns: 1fr; }
}
</style>
