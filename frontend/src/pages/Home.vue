<template>
  <HeroTransition
    video-src="/video/试试_6.mp4"
    poster-src="/video/hero-poster.webp"
    @progress="onProgress"
  >
    <div class="home-world">
      <HoyoverseRoster />

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
            :class="portal.tone ? 'portal-' + portal.tone : null"
          >
            <img
              :src="portal.image"
              :alt="portal.alt"
              :width="portal.imageWidth || 1280"
              :height="portal.imageHeight || 720"
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

      <!-- ===================== 页脚（MD3 层级 + 南孚式结构） ===================== -->
      <footer class="home-footer js-home-reveal">
        <!-- 顶层：品牌锚点（左）+ 站内导航列（右），参考 nanfu.global .top -->
        <div class="footer-top">
          <a class="footer-brand" href="/" aria-label="返回首页 MY WEBSITE">
            <span class="footer-mark">MY WEBSITE</span>
            <span class="footer-tagline">KEEP LEARNING / KEEP BUILDING</span>
          </a>

          <nav class="footer-cols" aria-label="页脚导航">
            <div class="footer-col">
              <a class="footer-heading" href="/">首页</a>
              <a class="footer-link" href="/applist">应用终端</a>
              <a class="footer-link" href="/hot-topics">行业热点</a>
              <a class="footer-link" href="/about">关于我</a>
            </div>

            <div class="footer-col">
              <a class="footer-heading" href="/hot-topics">热点雷达</a>
              <a class="footer-link" href="/shrine">一心净土</a>
              <a class="footer-link" href="/dialogue">与影对谈</a>
              <a class="footer-link" href="/game">互动游戏</a>
              <a class="footer-link" href="/map-zone-painter">地图绘制器</a>
            </div>

            <div class="footer-col">
              <span class="footer-heading footer-heading-static">学习信标</span>
              <a
                v-for="resource in resources"
                :key="resource.url"
                class="footer-link"
                :href="resource.url"
                target="_blank"
                rel="noopener"
              >{{ resource.name }}</a>
            </div>
          </nav>
        </div>

        <!-- 中层：友情链接卡（独立层级，MD3 emphasis） -->
        <div class="footer-friends">
          <span class="footer-heading footer-heading-static">友情链接 / FRIENDS</span>
          <a
            class="friend-link"
            href="https://chuangxin811.pages.dev/"
            target="_blank"
            rel="noopener"
          >电子创新实验室<svg class="friend-link-arrow" aria-hidden="true" viewBox="0 0 12 12" width="10" height="10"><path d="M2 10 L10 2 M4.5 2 H10 V7.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        </div>

        <!-- 底层：版权条（hairline 分隔，参考 nanfu.global .btm） -->
        <div class="footer-bottom">
          <span>© 2026 WYL · 保留所有权利</span>
          <span class="footer-sep">/</span>
          <span>CN / BUILT WITH VUE</span>
        </div>
      </footer>
    </div>
  </HeroTransition>
</template>

<script setup>
import AppIcon from '@/shared/components/AppIcon.vue'
import HeroTransition from '@/features/home/components/HeroTransition.vue'
import HoyoverseRoster from '@/features/home/components/HoyoverseRoster.vue'
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
    to: '/dialogue',
    title: '与影对谈',
    eyebrow: 'DIALOGUE / ARCHIVE',
    description: '把每一次问答，压成一条刻度',
    image: '/image/dialogue-vanguard.webp',
    imageWidth: 800,
    imageHeight: 1200,
    alt: '影 · 先锋主义几何拼贴',
    tone: 'dialogue',
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

.section-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  color: var(--gold-bright);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.section-kicker span {
  width: 42px;
  height: 2px;
  background: currentColor;
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
  filter: saturate(0.62) contrast(1.06) hue-rotate(-8deg);
  transition: transform 0.65s var(--ease-out), filter 0.45s var(--ease-out);
}

.portal-dialogue img {
  object-position: 50% 20%;
  filter: saturate(0.92) contrast(1.06);
}

.portal-shade {
  z-index: -1;
  background: linear-gradient(to top, rgba(8, 5, 16, 0.97), rgba(8, 5, 16, 0.08) 74%);
}

.portal-number {
  position: absolute;
  top: 18px;
  left: 18px;
  padding: 3px 7px;
  background: rgba(12, 8, 24, 0.78);
  color: var(--gold-bright);
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
  transform: scale(1.045);
}

.portal-card:hover {
  border-color: var(--purple);
  box-shadow: 8px 8px 0 rgba(139, 92, 246, 0.28);
}

.portal-card:hover .portal-arrow {
  background: var(--gold-bright);
  color: #12100f;
  transform: translateX(3px);
}

.origin-section {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  border-block: 1px solid var(--border);
  isolation: isolate;
}

.origin-section::before {
  position: absolute;
  inset: 20px;
  z-index: 1;
  content: '';
  border: 1px solid rgba(236, 228, 211, 0.16);
  pointer-events: none;
}

.origin-section::after {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  width: min(22vw, 220px);
  height: 8px;
  content: '';
  background: var(--red);
  pointer-events: none;
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
  filter: saturate(0.78) contrast(1.05) brightness(0.88);
}

.origin-shade {
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(9, 6, 18, 0.97) 0%, rgba(9, 6, 18, 0.8) 42%, rgba(9, 6, 18, 0.24) 100%),
    linear-gradient(0deg, rgba(76, 29, 149, 0.3), transparent 55%);
}

.origin-copy {
  width: min(660px, 70%);
  padding: 110px clamp(28px, 7vw, 110px);
}

.section-kicker.light {
  color: var(--gold-bright);
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
  border-bottom: 2px solid var(--gold);
  color: var(--gold-bright);
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
  background: rgba(139, 92, 246, 0.12);
  box-shadow: inset 3px 0 0 var(--red);
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

/* ============================================================
   页脚 — 参考南孚 nanfu.global 的三层结构（top/mid/btm）
   与 Material Design 3 的排版层级（display / label / body）
   ============================================================ */
.home-footer {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 72px clamp(28px, 6vw, 96px) 36px;
  border-top: 1px solid var(--border);
  background:
    radial-gradient(120% 90% at 85% 0%, rgba(76, 29, 149, 0.34), transparent 58%),
    linear-gradient(0deg, rgba(224, 27, 46, 0.05), transparent 40%),
    #08060f;
}

/* ---------- 顶层：品牌 + 导航列 ---------- */
.footer-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 48px;
  padding-bottom: 56px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-decoration: none;
}

.footer-mark {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: clamp(30px, 3.2vw, 40px);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1;
  transition: color 0.25s var(--ease-out);
}

.footer-brand:hover .footer-mark {
  color: var(--accent);
}

.footer-tagline {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
}

.footer-cols {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  gap: clamp(32px, 5vw, 88px);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 13px;
  min-width: 96px;
}

/* 列标题：MD3 title-small 级别，中性主色 */
.footer-heading {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: var(--weight-semibold);
  letter-spacing: 0.02em;
  text-decoration: none;
  margin-bottom: 5px;
}

.footer-heading-static {
  cursor: default;
}

.footer-heading:not(.footer-heading-static):hover {
  color: var(--accent);
}

/* 常规链接：MD3 body-medium 级别，次级颜色，悬停提亮（南孚 word-l 模式） */
.footer-link {
  color: var(--text-secondary);
  font-size: 13.5px;
  line-height: 1.5;
  text-decoration: none;
  transition: color 0.2s var(--ease-out), transform 0.2s var(--ease-out);
}

.footer-link:hover {
  color: var(--text-primary);
  transform: translateX(3px);
}

/* ---------- 中层：友情链接 ---------- */
.footer-friends {
  display: flex;
  align-items: baseline;
  gap: clamp(18px, 3vw, 40px);
  padding: 22px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.friend-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
  font-size: 16px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: color 0.2s var(--ease-out);
}

.friend-link:hover {
  color: var(--accent-hover);
}

.friend-link-arrow {
  flex: none;
  opacity: 0.55;
  transition: transform 0.25s var(--ease-out), opacity 0.25s var(--ease-out);
}

.friend-link:hover .friend-link-arrow {
  opacity: 1;
  transform: translate(2px, -2px);
}

/* ---------- 底层：版权 hairline 条 ---------- */
.footer-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 22px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.footer-sep {
  color: var(--text-tertiary);
  opacity: 0.5;
}

@media (max-width: 1080px) {
  .portal-card {
    min-height: 340px;
  }
}

@media (max-width: 768px) {
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

  .origin-section::before {
    inset: 12px;
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
    padding: 48px 18px 26px;
  }

  .footer-top {
    flex-direction: column;
    gap: 40px;
    padding-bottom: 36px;
  }

  .footer-cols {
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 28px 44px;
  }

  .footer-friends {
    flex-wrap: wrap;
    gap: 14px;
  }

  .friend-link {
    font-size: 15px;
  }
}

</style>
