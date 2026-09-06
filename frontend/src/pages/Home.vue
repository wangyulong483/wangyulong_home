<template>
  <HeroTransition
    video-src="/video/试试_6.mp4"
    poster-src="/video/hero-poster.webp"
    @progress="onProgress"
  >
    <div class="home-world">
      <section class="character-stage js-home-reveal" aria-labelledby="world-title">
        <div class="stage-grid" aria-hidden="true"></div>
        <div class="chapter-index" aria-hidden="true">01</div>

        <div class="intro-copy">
          <p class="section-kicker"><span></span> PERSONAL WORLD / 2026</p>
          <h2 id="world-title">雷鸣之后<br /><em>是我的世界</em></h2>
          <p class="intro-lead">
            这里收录我的机器人实践、代码实验与长期兴趣。
            技术是通往未知的列车，热爱让每一站拥有名字。
          </p>

          <div class="intro-actions">
            <router-link to="/applist" class="command command-primary">
              <AppIcon icon="controller" size="18" />
              进入应用
              <AppIcon icon="arrow-right" size="15" />
            </router-link>
            <router-link to="/about" class="command">
              <AppIcon icon="document" size="17" />
              查看记录
            </router-link>
          </div>

          <dl class="world-stats">
            <div><dt>FOCUS</dt><dd>ROS2 / AI / ROBOTICS</dd></div>
            <div><dt>STATUS</dt><dd><span class="status-dot"></span> CONTINUING</dd></div>
          </dl>
        </div>

        <div class="character-visual">
          <div class="visual-backdrop" aria-hidden="true"></div>
          <img
            src="/shrine-data/images/image (1).webp"
            alt="雷电将军与稻妻城角色立绘"
            width="1200"
            height="1200"
            loading="eager"
            decoding="async"
          />
          <p class="character-label">RAIDEN SHOGUN <span>影</span></p>
          <p class="vertical-type" aria-hidden="true">ELECTRO</p>
        </div>
      </section>

      <section class="portal-section js-home-reveal" aria-labelledby="portal-title">
        <header class="section-heading">
          <div>
            <p class="section-kicker"><span></span> SELECT DESTINATION</p>
            <h2 id="portal-title">世界索引</h2>
          </div>
          <p>选择一个入口，继续浏览。</p>
        </header>

        <div class="portal-grid">
          <router-link
            v-for="(portal, index) in portals"
            :key="portal.to"
            :to="portal.to"
            class="portal-card"
          >
            <img
              :src="portal.image"
              :alt="portal.alt"
              width="1280"
              height="720"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
            <span class="portal-shade" aria-hidden="true"></span>
            <span class="portal-number">0{{ index + 1 }}</span>
            <span class="portal-content">
              <small>{{ portal.eyebrow }}</small>
              <strong>{{ portal.title }}</strong>
              <span>{{ portal.description }}</span>
            </span>
            <span class="portal-arrow" aria-hidden="true"><AppIcon icon="arrow-right" size="18" /></span>
          </router-link>
        </div>
      </section>

      <section class="origin-section js-home-reveal" aria-labelledby="origin-title">
        <img
          src="/image/school.jpg"
          alt="安徽建筑大学校门"
          width="1280"
          height="800"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        />
        <div class="origin-shade" aria-hidden="true"></div>
        <div class="origin-copy">
          <p class="section-kicker light"><span></span> ORIGIN POINT</p>
          <h2 id="origin-title">从校园出发<br />向更远处运行</h2>
          <p>每一个项目都从一次笨拙的尝试开始。保留过程，持续迭代，然后把下一次做得更好。</p>
          <router-link to="/about" class="text-link">打开项目档案 <AppIcon icon="arrow-right" size="14" /></router-link>
        </div>
        <span class="origin-code">AHJZU // HEFEI</span>
      </section>

      <section class="resource-section js-home-reveal" aria-labelledby="resource-title">
        <div class="resource-heading">
          <p class="section-kicker"><span></span> EXTERNAL LINKS</p>
          <h2 id="resource-title">学习信标</h2>
        </div>
        <div class="resource-list">
          <a
            v-for="(resource, index) in resources"
            :key="resource.url"
            :href="resource.url"
            target="_blank"
            rel="noopener"
          >
            <span class="resource-index">0{{ index + 1 }}</span>
            <strong>{{ resource.name }}</strong>
            <span>{{ resource.category }}</span>
            <AppIcon icon="link" size="15" />
          </a>
        </div>
      </section>

      <footer class="home-footer js-home-reveal">
        <strong>MY WEBSITE</strong>
        <span>KEEP LEARNING / KEEP BUILDING</span>
        <span>© 2026 WYL</span>
      </footer>
    </div>
  </HeroTransition>
</template>

<script setup>
import AppIcon from '@/shared/components/AppIcon.vue'
import HeroTransition from '@/features/home/components/HeroTransition.vue'
import { heroProgress } from '@/features/home/composables/useHeroScroll.js'

const portals = [
  {
    to: '/applist',
    title: '应用终端',
    eyebrow: 'APPS / LAB',
    description: '游戏、热点与个人工具入口',
    image: '/video-covers/nav2.jpg',
    alt: 'Nav2 机器人导航项目画面',
  },
  {
    to: '/about',
    title: '项目档案',
    eyebrow: 'PROJECT / LOG',
    description: '机器人与视觉项目视频记录',
    image: '/video-covers/yolov5.jpg',
    alt: 'YOLOv5 视觉训练项目画面',
  },
  {
    to: '/shrine',
    title: '一心净土',
    eyebrow: 'ARCHIVE / ETERNITY',
    description: '雷电将军角色应援与资料库',
    image: '/shrine-data/images/image (2).webp',
    alt: '雷电将军雷元素纹样',
  },
]

const resources = [
  { name: '哔哩哔哩', category: 'VIDEO', url: 'https://www.bilibili.com/' },
  { name: 'CSDN', category: 'CODE', url: 'https://www.csdn.net/' },
  { name: '菜鸟教程', category: 'DOCS', url: 'https://www.runoob.com/' },
  { name: '鱼香 ROS', category: 'ROS2', url: 'https://fishros.org.cn/' },
  { name: '地瓜机器人', category: 'ROBOTICS', url: 'https://forum.d-robotics.cc/' },
]

function onProgress(progress) {
  heroProgress.value = progress
}
</script>

<style scoped>
.home-world {
  overflow: hidden;
  background: var(--bg-primary);
}

.character-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 46%);
  min-height: 86svh;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  isolation: isolate;
}

.stage-grid {
  position: absolute;
  inset: 0;
  z-index: -2;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 72px 72px;
}

.chapter-index {
  position: absolute;
  top: 42px;
  left: 46px;
  color: rgba(255, 255, 255, 0.045);
  font-family: var(--font-display);
  font-size: 180px;
  line-height: 0.8;
}

.intro-copy {
  align-self: center;
  width: min(100%, 720px);
  padding: 100px clamp(40px, 7vw, 110px) 84px;
}

.section-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}

.section-kicker span {
  width: 42px;
  height: 2px;
  background: currentColor;
}

.intro-copy h2 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: var(--text-primary);
  font-size: 64px;
  line-height: 1.02;
  letter-spacing: 0;
}

.intro-copy h2 em {
  color: transparent;
  font-style: normal;
  -webkit-text-stroke: 1px var(--accent);
  text-stroke: 1px var(--accent);
}

.intro-lead {
  max-width: 560px;
  margin-top: 30px;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.9;
}

.intro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 38px;
}

.command {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #15151a;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  transition: transform 0.25s var(--ease-out), border-color 0.25s var(--ease-out), background 0.25s var(--ease-out);
}

.command:hover {
  border-color: var(--accent);
  background: #201d29;
  transform: translateY(-2px);
}

.command-primary {
  border-color: var(--signal);
  background: var(--signal);
  color: #0b0b0e;
}

.command-primary:hover {
  border-color: #f1ff91;
  background: #f1ff91;
}

.world-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 54px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.world-stats div {
  min-width: 0;
}

.world-stats dt {
  margin-bottom: 5px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
}

.world-stats dd {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--signal);
  box-shadow: 0 0 12px var(--signal);
}

.character-visual {
  position: relative;
  min-height: 720px;
  overflow: hidden;
  border-left: 1px solid var(--border);
  background: #121017;
}

.visual-backdrop {
  position: absolute;
  inset: 14% 8% 10%;
  border: 1px solid rgba(182, 156, 255, 0.2);
  border-radius: 50%;
  box-shadow: inset 0 0 90px rgba(151, 113, 255, 0.09), 0 0 90px rgba(151, 113, 255, 0.08);
}

.visual-backdrop::before,
.visual-backdrop::after {
  position: absolute;
  content: '';
  background: var(--signal);
}

.visual-backdrop::before { top: 50%; right: -38px; width: 76px; height: 1px; }
.visual-backdrop::after { bottom: -28px; left: 50%; width: 1px; height: 56px; }

.character-visual img {
  position: absolute;
  right: -8%;
  bottom: -3%;
  width: 114%;
  height: 104%;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5)) saturate(0.9);
}

.character-label {
  position: absolute;
  bottom: 28px;
  left: 28px;
  z-index: 2;
  padding: 9px 12px;
  background: var(--signal);
  color: #0b0b0e;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
}

.character-label span {
  margin-left: 12px;
  font-family: serif;
  font-size: 14px;
}

.vertical-type {
  position: absolute;
  top: 34px;
  right: 18px;
  color: rgba(255, 255, 255, 0.28);
  font-family: var(--font-mono);
  font-size: 9px;
  writing-mode: vertical-rl;
}

.portal-section,
.resource-section {
  padding: 100px clamp(28px, 6vw, 96px);
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 34px;
}

.section-heading .section-kicker,
.resource-heading .section-kicker {
  margin-bottom: 12px;
}

.section-heading h2,
.resource-heading h2 {
  font-size: 46px;
  line-height: 1;
}

.section-heading > p {
  padding-bottom: 4px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.portal-card {
  position: relative;
  min-height: 400px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #15151a;
  isolation: isolate;
}

.portal-card img,
.portal-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.portal-card img {
  z-index: -2;
  object-fit: cover;
  filter: saturate(0.65) contrast(1.06);
  transition: transform 0.65s var(--ease-out), filter 0.45s var(--ease-out);
}

.portal-shade {
  z-index: -1;
  background: linear-gradient(to top, rgba(8, 8, 11, 0.96), rgba(8, 8, 11, 0.1) 72%);
}

.portal-number {
  position: absolute;
  top: 18px;
  left: 18px;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 10px;
}

.portal-content {
  position: absolute;
  right: 22px;
  bottom: 24px;
  left: 22px;
  display: flex;
  flex-direction: column;
}

.portal-content small {
  margin-bottom: 9px;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 9px;
}

.portal-content strong {
  color: #fff;
  font-family: var(--font-display);
  font-size: 26px;
}

.portal-content span {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
}

.portal-arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.34);
  color: #fff;
  transition: background 0.25s var(--ease-out), color 0.25s var(--ease-out), transform 0.25s var(--ease-out);
}

.portal-card:hover img {
  filter: saturate(1) contrast(1.02);
  transform: scale(1.045);
}

.portal-card:hover .portal-arrow {
  background: var(--signal);
  color: #0b0b0e;
  transform: translateX(3px);
}

.origin-section {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  border-block: 1px solid var(--border);
  isolation: isolate;
}

.origin-section > img,
.origin-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.origin-section > img {
  z-index: -2;
  object-fit: cover;
}

.origin-shade {
  z-index: -1;
  background: linear-gradient(90deg, rgba(8, 8, 11, 0.96) 0%, rgba(8, 8, 11, 0.76) 42%, rgba(8, 8, 11, 0.18) 100%);
}

.origin-copy {
  width: min(660px, 70%);
  padding: 110px clamp(28px, 7vw, 110px);
}

.section-kicker.light {
  color: var(--signal);
}

.origin-copy h2 {
  color: #fff;
  font-size: 54px;
  line-height: 1.08;
}

.origin-copy > p:not(.section-kicker) {
  max-width: 520px;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.9;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 32px;
  padding-bottom: 7px;
  border-bottom: 2px solid var(--signal);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}

.origin-code {
  position: absolute;
  right: 26px;
  bottom: 22px;
  color: rgba(255, 255, 255, 0.68);
  font-family: var(--font-mono);
  font-size: 9px;
}

.resource-section {
  display: grid;
  grid-template-columns: minmax(240px, 0.7fr) minmax(0, 1.3fr);
  gap: 8vw;
}

.resource-heading {
  align-self: start;
  position: sticky;
  top: 48px;
}

.resource-list {
  border-top: 1px solid var(--border);
}

.resource-list a {
  display: grid;
  grid-template-columns: 44px minmax(120px, 1fr) 90px 20px;
  align-items: center;
  gap: 14px;
  min-height: 72px;
  padding: 0 12px;
  border-bottom: 1px solid var(--border);
  transition: background 0.25s var(--ease-out), padding 0.25s var(--ease-out);
}

.resource-list a:hover {
  padding-inline: 18px 8px;
  background: var(--signal-muted);
}

.resource-index,
.resource-list a > span:nth-child(3) {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
}

.resource-list strong {
  font-size: 15px;
}

.resource-list a > svg,
.resource-list a :deep(.app-icon) {
  color: var(--accent);
}

.home-footer {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: end;
  gap: 28px;
  min-height: 180px;
  padding: 40px clamp(28px, 6vw, 96px);
  border-top: 1px solid var(--border);
  background: #08080a;
}

.home-footer strong {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 32px;
}

.home-footer span {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
}

@media (max-width: 1080px) {
  .character-stage {
    grid-template-columns: minmax(0, 1fr) minmax(330px, 42%);
  }

  .intro-copy {
    padding-inline: 42px;
  }

  .intro-copy h2 {
    font-size: 52px;
  }

  .portal-card {
    min-height: 340px;
  }
}

@media (max-width: 768px) {
  .character-stage {
    display: flex;
    min-height: 0;
    flex-direction: column-reverse;
  }

  .chapter-index {
    top: auto;
    bottom: 400px;
    left: 16px;
    font-size: 100px;
  }

  .intro-copy {
    width: 100%;
    padding: 58px 20px 64px;
  }

  .intro-copy h2 {
    font-size: 42px;
  }

  .intro-lead {
    font-size: 14px;
  }

  .world-stats {
    gap: 12px;
  }

  .character-visual {
    width: 100%;
    min-height: 62svh;
    border-bottom: 1px solid var(--border);
    border-left: 0;
  }

  .character-visual img {
    right: -11%;
    width: 122%;
  }

  .portal-section,
  .resource-section {
    padding: 72px 16px;
  }

  .section-heading {
    align-items: start;
    flex-direction: column;
  }

  .section-heading h2,
  .resource-heading h2 {
    font-size: 36px;
  }

  .portal-grid {
    grid-template-columns: 1fr;
  }

  .portal-card {
    min-height: 310px;
  }

  .origin-section {
    min-height: 560px;
  }

  .origin-section > img {
    object-position: 62% center;
  }

  .origin-shade {
    background: linear-gradient(0deg, rgba(8, 8, 11, 0.96), rgba(8, 8, 11, 0.62) 70%, rgba(8, 8, 11, 0.28));
  }

  .origin-copy {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 40px 20px 58px;
  }

  .origin-copy h2 {
    font-size: 38px;
  }

  .resource-section {
    grid-template-columns: 1fr;
    gap: 42px;
  }

  .resource-heading {
    position: static;
  }

  .resource-list a {
    grid-template-columns: 32px minmax(0, 1fr) 20px;
  }

  .resource-list a > span:nth-child(3) {
    display: none;
  }

  .home-footer {
    grid-template-columns: 1fr;
    gap: 12px;
    min-height: 160px;
    padding: 32px 18px;
  }
}

@media (max-width: 480px) {
  .intro-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .command {
    justify-content: center;
  }

  .world-stats {
    grid-template-columns: 1fr;
  }

  .character-visual {
    min-height: 560px;
  }
}
</style>
