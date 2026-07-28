<template>
  <!--
    首页 — 环形虹膜转场

    HeroTransition 包裹三层：
      Layer 1  #default    → 首页内容（video左 + content右）
      Layer 2  hero-mask   → 全屏视频 + clip-path circle 虹膜
      Layer 3  #hero-text  → 名言（fixed，FLIP 飞入 Layer1 的 .quote-dest）

    滚动叙事：
      0→200vh：虹膜从中心收缩关闭 → 名言飞入内容区 → 卡片 + 侧边栏登场
      200vh+：正常首页浏览
  -->
  <HeroTransition
    video-src="/video/试试_6.mp4"
    poster-src="/video/hero-poster.webp"
    @progress="onProgress"
  >
    <!-- ====== Layer 3（displayed in hero-quote slot）：视频左侧的名言 ====== -->
    <template #hero-text>
      <p class="hero-saying">
        谁终将声震人间，必长久深自缄默<br />
        谁终将点燃闪电，必长久如云漂泊
      </p>
      <p class="hero-author">—— 尼采</p>
    </template>

    <!-- ====== Layer 1（homepage-base slot）：真正的首页内容 ====== -->
    <div class="page-layout">
      <!-- 左列：视频缩略 -->
      <div class="video-col">
        <video
          class="thumb-video"
          src="/video/试试_6.mp4"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        ></video>
      </div>

      <!-- 右列：名言目标位 + 内容卡片 -->
      <div class="content-col">
        <!-- 名言飞入的目标位置 -->
        <div class="quote-destination js-quote-dest">
          <p class="dest-saying">
            谁终将声震人间，必长久深自缄默<br />
            谁终将点燃闪电，必长久如云漂泊
          </p>
          <p class="dest-author">—— 尼采</p>
        </div>

        <div class="content-card card">
          <h3>关于 MY_WEBSITE</h3>
          <ul>
            <li>它记录我的学习，它见证我的成长</li>
            <li>它记录现在的我的无知与浅薄，让未来的我嘲笑自己的狂妄</li>
            <li>也许未来它会用到别的地方</li>
            <li>......</li>
          </ul>
        </div>

        <div class="content-card card">
          <h3>学习平台</h3>
          <ul class="platform-list">
            <li><a href="https://www.bilibili.com/" target="_blank" class="platform-link" rel="noopener">哔哩哔哩</a></li>
            <li><a href="https://www.csdn.net/" target="_blank" class="platform-link" rel="noopener">CSDN</a></li>
            <li><a href="https://www.runoob.com/" target="_blank" class="platform-link" rel="noopener">菜鸟教程</a></li>
            <li><a href="https://fishros.org.cn/" target="_blank" class="platform-link" rel="noopener">鱼香 ROS</a></li>
            <li><a href="https://forum.d-robotics.cc/" target="_blank" class="platform-link" rel="noopener">地瓜机器人社区</a></li>
          </ul>
        </div>
      </div>
    </div>
  </HeroTransition>
</template>

<script setup>
import HeroTransition from '@/components/HeroTransition.vue'
import { heroProgress } from '@/composables/useHeroScroll.js'

function onProgress(p) {
  heroProgress.value = p
}
</script>

<style scoped>
/* ================================================================
   Layer 3：视频上的名言（初始位置在视频左侧）
   ================================================================ */

.hero-saying {
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(1.1rem, 2.2vw, 1.5rem);
  font-weight: 500;
  line-height: 1.8;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  margin: 0 0 10px;
  font-style: italic;
}

.hero-author {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.8rem;
  margin: 0;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

/* ================================================================
   Layer 1：首页布局（video 左 + content 右）
   ================================================================ */

.page-layout {
  display: flex;
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 40px 80px 20px;
  min-height: 100vh;
  align-items: flex-start;
}

/* --- 左列：视频 --- */
.video-col {
  flex: 0 0 320px;
  position: sticky;
  top: 80px;
}

.thumb-video {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  aspect-ratio: 16 / 10;
  display: block;
  border: 1px solid var(--border);
}

/* --- 右列：名言 + 卡片 --- */
.content-col {
  flex: 1;
  min-width: 0;
}

/* --- 名言目标位（初始隐藏，转场后由 GSAP onUpdate 显示） --- */
.quote-destination {
  margin-bottom: 28px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dest-saying {
  color: var(--text-primary);
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: 0.02em;
  margin: 0 0 6px;
  font-style: italic;
}

.dest-author {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  margin: 0;
}

/* --- 内容卡片 --- */
.content-card {
  max-width: 100%;
}

.content-card h3 {
  color: var(--accent);
  margin-bottom: 12px;
  font-size: 1.15rem;
  font-weight: 600;
}

.content-card ul {
  padding-left: 20px;
}

.content-card li {
  margin: 8px 0;
  color: var(--text-secondary);
}

/* --- 平台链接 --- */
.platform-list {
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.platform-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  background: var(--accent-muted);
  border: 1px solid rgba(108, 92, 231, 0.15);
  border-radius: 20px;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 500;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  transition: all 0.25s var(--ease-out);
}

.platform-link:hover {
  background: rgba(108, 92, 231, 0.18);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

/* ================================================================
   亮色主题
   ================================================================ */

[data-theme='light'] .hero-saying {
  color: rgba(30, 30, 30, 0.92);
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}

[data-theme='light'] .hero-author {
  color: rgba(50, 50, 50, 0.5);
}

/* ================================================================
   移动端
   ================================================================ */

@media (max-width: 768px) {
  .hero-saying { font-size: 0.95rem; line-height: 1.6; }

  .page-layout {
    flex-direction: column;
    padding: 40px 16px;
    gap: 24px;
  }

  .video-col {
    flex: none;
    position: static;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .dest-saying { font-size: 0.95rem; }
  .content-card { padding: 18px 20px; }
  .content-card h3 { font-size: 1.05rem; }
  .platform-link { padding: 8px 16px; font-size: 0.82rem; min-height: 44px; }
}

@media (max-width: 480px) {
  .hero-saying { font-size: 0.85rem; padding: 0 8px; }
  .page-layout { padding: 30px 12px; }
  .content-card { padding: 14px 16px; }
  .platform-link { padding: 6px 14px; font-size: 0.8rem; }
}
</style>
