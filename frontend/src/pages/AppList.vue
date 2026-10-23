<template>
  <!-- 应用列表页 -->
  <div class="app-list">
    <div class="header">
      <p class="header-index"><span></span>APP TERMINAL / 模块索引</p>
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
        <span class="app-desc">雷电将军 · 影像 / 攻略 / 资讯</span>
      </router-link>

      <router-link to="/dialogue" class="app-card card card-interactive">
        <span class="app-icon-wrap">
          <AppIcon icon="message" size="28" />
        </span>
        <span class="app-name">与影对谈</span>
        <span class="app-desc">对话纪年 · 角色对话</span>
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
  position: relative;
  text-align: center;
  padding: 40px 0 34px;
}

.header-index {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 12px;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.18em;
}

.header-index span {
  width: 9px;
  height: 9px;
  background: var(--red);
  transform: rotate(45deg);
}

.header h1 {
  position: relative;
  display: inline-block;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.4vw, 3rem);
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.04em;
}

.header h1::after {
  content: '';
  position: absolute;
  left: 4%;
  right: -14%;
  bottom: 6px;
  height: 3px;
  background: linear-gradient(90deg, var(--purple) 0 62%, var(--red) 62% 82%, var(--gold) 82% 100%);
  opacity: 0.85;
}

.header-sub {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin-top: 8px;
}

/* -------- 卡片网格 -------- */
.app-grid {
  display: grid;
  counter-reset: app-index;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
  padding: 0 4px;
}

.app-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 38px 20px 32px;
  overflow: hidden;
  text-align: center;
  text-decoration: none;
  color: var(--text-primary);
}

.app-card::before {
  counter-increment: app-index;
  content: '0' counter(app-index);
  position: absolute;
  top: 12px;
  left: 14px;
  width: auto;
  height: auto;
  border: 0;
  background: none;
  transform: none;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.12em;
}

.app-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: auto;
  left: 0;
  width: 42%;
  height: 3px;
  border: 0;
  background: linear-gradient(90deg, var(--purple), var(--red));
  opacity: 1;
  transform: none;
  transition: width 0.32s var(--ease-out);
}

.app-card:hover::after { width: 100%; }
.app-card:hover::before { transform: none; }

.app-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  color: var(--purple-bright);
  background: var(--accent-muted);
  border: 1px solid rgba(216, 178, 90, 0.42);
  margin-bottom: 4px;
  transition: all 0.3s var(--ease-out);
}

.app-icon-wrap::after {
  content: '';
  position: absolute;
  inset: auto -5px -5px auto;
  width: 11px;
  height: 11px;
  background: var(--red);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.app-card:hover .app-icon-wrap {
  background: rgba(139, 92, 246, 0.22);
  border-color: var(--gold);
  color: var(--gold-bright);
  box-shadow: 5px 5px 0 var(--red);
}

.app-name {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 1.18rem;
  font-weight: 400;
  letter-spacing: 0.03em;
}

.app-desc {
  font-size: 0.82rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
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
