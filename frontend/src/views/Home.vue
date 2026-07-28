<template>
  <HeroTransition
    video-src="/video/试试_6.mp4"
    poster-src="/video/hero-poster.webp"
    @progress="onProgress"
  >
    <div class="page-layout">
      <section class="mobile-character js-mobile-character" aria-labelledby="mobile-character-name">
        <img
          class="mobile-character-image"
          src="/shrine-data/images/image.png"
          alt="雷电将军手持梦想一心的角色立绘"
          width="750"
          height="1899"
          loading="eager"
          decoding="async"
          fetchpriority="low"
        />
        <div class="character-identity">
          <p class="character-en">RAIDEN SHOGUN</p>
          <h1 id="mobile-character-name">雷电将军</h1>
          <p class="character-title">一心净土 · 此世最殊胜威怖的雷霆化身</p>
        </div>
      </section>

      <header class="quote-block js-home-reveal">
        <p class="quote">
          谁终将声震人间，必长久深自缄默<br />
          谁终将点燃闪电，必长久如云漂泊
        </p>
        <p class="quote-author">—— 尼采</p>
      </header>

      <div class="content-card card js-home-reveal">
        <h3>关于 MY_WEBSITE</h3>
        <ul>
          <li>它记录我的学习，它见证我的成长</li>
          <li>它记录现在的我的无知与浅薄，让未来的我嘲笑自己的狂妄</li>
          <li>也许未来它会用到别的地方</li>
          <li>......</li>
        </ul>
      </div>

      <div class="content-card card js-home-reveal">
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
  </HeroTransition>
</template>

<script setup>
import HeroTransition from '@/components/HeroTransition.vue'
import { heroProgress } from '@/composables/useHeroScroll.js'

function onProgress(progress) {
  heroProgress.value = progress
}
</script>

<style scoped>
.page-layout {
  width: min(100%, 760px);
  min-height: 100svh;
  margin: 0 auto;
  padding: 72px 28px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.mobile-character {
  display: none;
}

.quote-block {
  padding: 0 4px 8px;
}

.quote {
  color: var(--text-primary);
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 500;
  line-height: 1.75;
  font-style: italic;
}

.quote-author {
  margin-top: 6px;
  color: var(--text-tertiary);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.8rem;
}

.content-card {
  width: 100%;
}

.content-card h3 {
  margin-bottom: 12px;
  color: var(--accent);
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

.platform-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-left: 0 !important;
  list-style: none;
}

.platform-list li {
  margin: 0;
}

.platform-link {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 8px 16px;
  border: 1px solid rgba(108, 92, 231, 0.15);
  border-radius: 8px;
  background: var(--accent-muted);
  color: var(--accent);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.25s var(--ease-out), border-color 0.25s var(--ease-out), transform 0.25s var(--ease-out);
}

.platform-link:hover {
  border-color: var(--border-hover);
  background: rgba(108, 92, 231, 0.18);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .page-layout {
    width: calc(100% + 24px);
    min-height: 0;
    margin-inline: -12px;
    justify-content: flex-start;
    padding: 0 0 64px;
    gap: 20px;
  }

  .mobile-character {
    position: relative;
    display: block;
    width: 100%;
    height: min(88svh, 820px);
    min-height: 640px;
    overflow: hidden;
    background: #ece8f2;
    isolation: isolate;
  }

  .mobile-character-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center 35%;
  }

  .character-identity {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20px 20px calc(22px + env(safe-area-inset-bottom));
    background: rgba(8, 7, 16, 0.82);
    color: #ffffff;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .character-en {
    margin-bottom: 2px;
    color: #c6b1f2;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 0.68rem;
    font-weight: 600;
  }

  .character-identity h1 {
    margin: 0;
    color: #ffffff;
    font-size: 1.75rem !important;
    font-weight: 700;
    line-height: 1.2;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
  }

  .character-title {
    margin-top: 5px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .quote-block,
  .content-card {
    width: calc(100% - 32px);
    margin-inline: auto;
  }

  .quote-block {
    padding: 28px 4px 10px;
  }

  .quote {
    font-size: 1rem;
    line-height: 1.8;
  }

  .content-card {
    padding: 18px 20px;
    border-radius: 8px;
  }

  .platform-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .platform-link {
    width: 100%;
    min-height: 44px;
    justify-content: center;
    padding-inline: 10px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .mobile-character {
    height: 86svh;
    min-height: 580px;
  }

  .content-card {
    padding: 14px 16px;
  }

  .platform-link {
    font-size: 0.78rem;
  }
}
</style>
