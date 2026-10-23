<template>
  <div ref="rootRef" class="hero-transition">
    <div ref="spacerRef" class="transition-spacer" aria-hidden="true"></div>

    <div ref="contentRef" class="homepage-base">
      <slot />
    </div>

    <Teleport to="body">
      <section ref="stageRef" class="hero-stage" aria-label="MY WEBSITE 首页视觉">
        <div class="hero-art-field" aria-hidden="true">
          <span class="ha-grid"></span>

          <!-- 纸：海报贴在纸上的那层底 -->
          <span class="ha-paper"></span>

          <!-- 印版：影的视频被裁切成一张印刷胶片 -->
          <div class="ha-plate">
            <div class="hp-zoom">
              <div class="hp-window">
                <video
                  ref="videoRef"
                  class="hero-video"
                  :src="videoSrc"
                  :poster="posterSrc"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="metadata"
                  disablepictureinpicture
                  aria-hidden="true"
                ></video>
                <span class="hp-glow"></span>
                <span class="hp-shade"></span>
                <span class="hp-band"></span>
                <span class="hp-square"></span>
                <span class="hp-halftone"></span>
                <span class="hp-scan"></span>
                <span class="hp-grain"></span>
                <span class="hp-spine">影　/　RAIDEN SHOGUN</span>
                <span class="hp-reg reg-tl"></span>
                <span class="hp-reg reg-br"></span>
              </div>
              <span class="hp-caption">PLATE 01　·　影　·　25FPS　·　2026</span>
            </div>
          </div>

          <!-- 版面其他色块 -->
          <span class="ha-tie"></span>
          <span class="ha-wedge"></span>
          <span class="ha-bar"></span>
          <span class="ha-ring"></span>
          <span class="ha-rule rule-a"></span>
          <span class="ha-code">СУПРЕМАТИЗМ · 1923</span>
        </div>

        <div class="hero-shade" aria-hidden="true"></div>
        <div ref="flashRef" class="transition-flash" aria-hidden="true"></div>

        <div class="hero-frame" aria-hidden="true">
          <span class="frame-corner corner-a"></span>
          <span class="frame-corner corner-b"></span>
          <span class="frame-corner corner-c"></span>
          <span class="frame-corner corner-d"></span>
        </div>

        <div class="hero-interface">
          <header class="hero-topbar">
            <div class="hero-brand">
              <span class="brand-mark">WYL</span>
              <span>PERSONAL ARCHIVE</span>
            </div>
            <div class="hero-coordinate">31.8206 N / 117.2272 E</div>
          </header>

          <div class="hero-copy">
            <p class="hero-kicker"><span></span> WORLD FILE // 001</p>
            <div class="hero-title-row">
              <h1>MY<br /><strong>WEBSITE</strong></h1>
              <span class="hero-seal" aria-hidden="true">影</span>
            </div>
            <div class="hero-statement">
              <p>记录学习、创造与仍在发生的旅程。</p>
              <p class="hero-quote">“谁终将点燃闪电，必长久如云漂泊。”</p>
            </div>

            <router-link to="/about" class="hero-personnel" aria-label="查看关于我">
              <span class="personnel-photo">
                <img src="/image/mylog.jpg" alt="王雨龙的头像" width="640" height="640" />
              </span>
              <span class="personnel-meta">
                <b>PERSONNEL // 001</b>
                <span>王雨龙 · 归去来兮</span>
              </span>
            </router-link>
          </div>

          <div class="hero-status">
            <span>ONLINE</span>
            <span>2026 / CN</span>
          </div>

          <div class="scroll-cue" aria-hidden="true">
            <span class="scroll-line"></span>
            <span>SCROLL TO ENTER</span>
          </div>
        </div>

        <div ref="apertureRef" class="aperture-guide" aria-hidden="true">
          <span></span>
        </div>
      </section>
    </Teleport>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

defineProps({
  videoSrc: { type: String, default: '/video/试试_6.mp4' },
  posterSrc: { type: String, default: '/video/hero-poster.webp' },
})

const emit = defineEmits(['progress'])

const rootRef = ref(null)
const spacerRef = ref(null)
const contentRef = ref(null)
const stageRef = ref(null)
const videoRef = ref(null)
const flashRef = ref(null)
const apertureRef = ref(null)

let timeline
let resizeTimer
let animatedNavigation
let lastEmittedProgress = -1
let videoIsPaused = false
let stageIsHidden = false

function shouldAutoplay() {
  const connection = navigator.connection || {}
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !connection.saveData
    && !['slow-2g', '2g'].includes(connection.effectiveType)
}

function setVideoPaused(paused) {
  const video = videoRef.value
  if (!video || paused === videoIsPaused) return

  videoIsPaused = paused
  if (paused) video.pause()
  else if (shouldAutoplay()) video.play().catch(() => {})
}

function tuneVideo() {
  const video = videoRef.value
  if (!video) return
  // 海报化的胶片节奏：略慢放，让画面读起来像一格一格的印刷品，而不是网页背景。
  try { video.playbackRate = 0.85 } catch { /* ignore */ }
}

function setupAnimation() {
  const root = rootRef.value
  const stage = stageRef.value
  const spacer = spacerRef.value
  const content = contentRef.value
  const video = videoRef.value
  if (!root || !stage || !spacer || !content || !video) return

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // 光圈落在她脸上：桌面版印版在右侧偏中，移动版印版铺在上屏。
  const focus = isMobile ? '50% 30%' : '66% 32%'
  const contentItems = root.querySelectorAll('.js-home-reveal')
  const navigation = document.querySelector(isMobile ? '.js-mobile-menu' : '.js-sidebar')
  animatedNavigation = navigation

  stageIsHidden = false
  lastEmittedProgress = -1
  stage.style.visibility = 'visible'
  gsap.set(stage, {
    autoAlpha: 1,
    clipPath: `circle(150% at ${focus})`,
    pointerEvents: 'auto',
    willChange: 'clip-path, opacity',
  })
  gsap.set('.hero-art-field', { scale: 1, x: 0, y: 0, willChange: 'transform' })
  gsap.set('.hp-zoom', { scale: 1, x: 0, y: 0, willChange: 'transform' })
  gsap.set('.hp-band', { scaleY: 1, transformOrigin: 'top center' })
  gsap.set('.hp-square', { scale: 1, transformOrigin: 'top left' })
  gsap.set(content, { autoAlpha: reduceMotion ? 1 : 0.28 })
  gsap.set(contentItems, {
    autoAlpha: reduceMotion ? 1 : 0,
    y: reduceMotion ? 0 : 46,
    clipPath: reduceMotion ? 'none' : 'inset(0 0 18% 0)',
    willChange: reduceMotion ? 'auto' : 'transform, opacity',
  })
  gsap.set(apertureRef.value, { autoAlpha: 0, scale: 1.35 })
  gsap.set(flashRef.value, { autoAlpha: 0 })

  if (navigation) {
    gsap.set(navigation, {
      autoAlpha: 0,
      x: reduceMotion ? 0 : (isMobile ? 18 : 70),
      pointerEvents: 'none',
      willChange: reduceMotion ? 'auto' : 'transform, opacity',
    })
  }

  timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: spacer,
      start: 'top top',
      end: 'bottom top',
      scrub: reduceMotion ? true : 0.55,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        const shouldHideStage = progress >= 0.84
        if (shouldHideStage !== stageIsHidden) {
          stageIsHidden = shouldHideStage
          stage.style.visibility = shouldHideStage ? 'hidden' : 'visible'
          setVideoPaused(document.hidden || shouldHideStage)
        }

        if (Math.abs(progress - lastEmittedProgress) >= 0.008 || progress === 0 || progress === 1) {
          lastEmittedProgress = progress
          emit('progress', progress)
        }
      },
    },
  })

  timeline
    // 第一格：文案退场，印版开始承重
    .to('.hero-copy', {
      autoAlpha: 0,
      y: reduceMotion ? 0 : -42,
      duration: reduceMotion ? 0.08 : 0.18,
      ease: 'power2.in',
    }, 0.08)
    .to('.hero-topbar, .hero-status, .scroll-cue', {
      autoAlpha: 0,
      duration: reduceMotion ? 0.06 : 0.14,
    }, 0.08)
    // 第二格：色块自行生长，画面被“上墨”
    .to('.hp-band', { scaleY: reduceMotion ? 1 : 2.4, duration: 0.34 }, 0.1)
    .to('.hp-square', { scale: reduceMotion ? 1 : 1.9, duration: 0.34 }, 0.1)
    .to('.hp-zoom', {
      scale: reduceMotion ? 1 : 1.045,
      x: reduceMotion ? 0 : -22,
      y: reduceMotion ? 0 : -10,
      duration: reduceMotion ? 0.12 : 0.5,
      ease: 'power2.inOut',
    }, 0.12)
    .to('.hero-art-field', {
      scale: reduceMotion ? 1 : 1.05,
      x: reduceMotion ? 0 : -22,
      y: reduceMotion ? 0 : -10,
      duration: reduceMotion ? 0.12 : 0.5,
      ease: 'power2.inOut',
    }, 0.12)
    // 第三格：取景光圈
    .to(apertureRef.value, {
      autoAlpha: reduceMotion ? 0 : 1,
      scale: 1,
      duration: 0.24,
      ease: 'power2.out',
    }, 0.22)
    .to(stage, {
      clipPath: `circle(${reduceMotion ? '100%' : (isMobile ? '24%' : '17%')} at ${focus})`,
      duration: reduceMotion ? 0.16 : 0.42,
      ease: 'power3.inOut',
    }, 0.2)
    .to(content, {
      autoAlpha: 1,
      duration: 0.2,
    }, 0.32)
    // 第四格：纸张曝光
    .to(flashRef.value, {
      autoAlpha: reduceMotion ? 0 : 0.72,
      duration: 0.05,
    }, 0.57)
    .to(flashRef.value, {
      autoAlpha: 0,
      duration: 0.13,
    }, 0.62)
    // 第五格：收束成一点
    .to(stage, {
      clipPath: `circle(0% at ${focus})`,
      duration: reduceMotion ? 0.12 : 0.2,
      ease: 'power3.in',
    }, 0.62)
    .to(apertureRef.value, {
      autoAlpha: 0,
      scale: 0.75,
      duration: 0.14,
    }, 0.62)
    .to(contentItems, {
      autoAlpha: 1,
      y: 0,
      clipPath: 'inset(0 0 0% 0)',
      duration: reduceMotion ? 0.1 : 0.24,
      stagger: reduceMotion ? 0 : 0.025,
      ease: 'power3.out',
    }, 0.66)

  if (navigation) {
    timeline
      .to(navigation, {
        autoAlpha: 1,
        x: 0,
        duration: reduceMotion ? 0.1 : 0.22,
        ease: 'power3.out',
      }, 0.7)
      .set(navigation, { pointerEvents: 'auto' }, 0.82)
  }

  const animatedTargets = [stage, video, apertureRef.value, flashRef.value, ...contentItems].filter(Boolean)

  timeline
    .to({}, { duration: 0.08 }, 0.92)
    .set(animatedTargets, { willChange: 'auto' }, 0.92)
  emit('progress', timeline.scrollTrigger.progress)
}

function destroyAnimation() {
  timeline?.scrollTrigger?.kill()
  timeline?.kill()
  timeline = null

  if (animatedNavigation) {
    gsap.set(animatedNavigation, { clearProps: 'opacity,visibility,transform,pointerEvents,willChange' })
    animatedNavigation = null
  }

  const clearTargets = [
    stageRef.value,
    videoRef.value,
    contentRef.value,
    apertureRef.value,
    flashRef.value,
    ...(rootRef.value?.querySelectorAll('.js-home-reveal') || []),
  ].filter(Boolean)
  if (clearTargets.length) gsap.set(clearTargets, { clearProps: 'willChange' })
  gsap.set('.hp-zoom, .hero-art-field', { clearProps: 'willChange' })
}

function onVisibilityChange() {
  const progress = timeline?.scrollTrigger?.progress || 0
  setVideoPaused(document.hidden || progress >= 0.84)
}

function onResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    destroyAnimation()
    setupAnimation()
    ScrollTrigger.refresh()
  }, 180)
}

onMounted(async () => {
  await nextTick()
  tuneVideo()
  videoRef.value?.addEventListener('loadedmetadata', tuneVideo, { once: true })
  videoIsPaused = videoRef.value?.paused ?? false
  if (!shouldAutoplay()) setVideoPaused(true)
  setupAnimation()
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', onResize, { passive: true })
})

onUnmounted(() => {
  window.clearTimeout(resizeTimer)
  const video = videoRef.value
  if (video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
  }
  destroyAnimation()
  emit('progress', 0)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', onResize)
})
</script>
<style scoped>
.hero-transition {
  position: relative;
}

.transition-spacer {
  height: 180svh;
}

.homepage-base {
  position: relative;
  z-index: 1;
  min-height: 100svh;
  background: var(--bg-primary);
}

.hero-stage {
  --bone: #ece4d3;
  --ink: #0a0714;
  --plate-cut: polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%);

  position: fixed;
  inset: 0;
  z-index: 100;
  overflow: hidden;
  background: #0a0714;
  color: #f8f4e9;
  isolation: isolate;
}

.hero-art-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(ellipse 62% 54% at 68% 36%, rgba(139, 92, 246, 0.14), transparent 64%),
    radial-gradient(ellipse 44% 44% at 10% 82%, rgba(224, 27, 46, 0.07), transparent 72%),
    linear-gradient(128deg, #0b0712 0%, #120c1e 50%, #07040c 100%);
}

.ha-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(216, 199, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(216, 199, 255, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  -webkit-mask-image: linear-gradient(115deg, transparent 0 26%, #000 62%, #000 100%);
  mask-image: linear-gradient(115deg, transparent 0 26%, #000 62%, #000 100%);
}

/* ---------- 纸：海报贴上去的那张纸 ---------- */
.ha-paper {
  position: absolute;
  top: 8%;
  left: 48.5%;
  z-index: 0;
  width: min(23.5vw, 360px);
  height: min(76vh, 690px);
  background: var(--bone);
  transform: rotate(-4.2deg);
  box-shadow: 12px 12px 0 rgba(4, 2, 10, 0.55);
}

/* ---------- 印版：视频 ---------- */
.ha-plate {
  position: absolute;
  top: 12%;
  left: 53%;
  z-index: 2;
  height: min(70vh, 640px);
  width: auto;
  aspect-ratio: 3 / 4;
  transform: rotate(-1.6deg);
  animation: plate-breathe 11s ease-in-out infinite alternate;
}

.hp-zoom {
  position: absolute;
  inset: 0;
}

/* 硬边投影：两层实心偏移、0 模糊，构成主义的硬边界 */
.hp-zoom::before,
.hp-zoom::after {
  position: absolute;
  inset: 0;
  content: '';
  clip-path: var(--plate-cut);
}

.hp-zoom::before {
  z-index: 0;
  background: var(--red);
  transform: translate(10px, 11px);
}

.hp-zoom::after {
  z-index: 0;
  background: rgba(4, 2, 10, 0.62);
  transform: translate(20px, 23px);
}

.hp-window {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  clip-path: var(--plate-cut);
  background: #100a1c;
  isolation: isolate;
  outline: 2px solid var(--ink);
  outline-offset: -2px;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: 58% 26%;
  /* 保留影像本身的颜色，只做轻微印刷校正 */
  filter: saturate(1.02) contrast(1.06) brightness(1.03);
  transform: scale(1.02);
}

.hp-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 40% 30% at 58% 26%, rgba(240, 207, 122, 0.3), transparent 72%);
  mix-blend-mode: screen;
  opacity: 0.5;
}

.hp-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(0deg, rgba(8, 4, 18, 0.58) 0 6%, transparent 6.2%),
    linear-gradient(90deg, rgba(8, 4, 18, 0.36) 0 4%, transparent 4.2%);
}

/* 色块遮罩：直接盖在画面上，像拼贴剪进去的纸 */
.hp-band {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 9%;
  background: var(--red);
  box-shadow: 0 2px 0 rgba(236, 228, 211, 0.55);
}

.hp-square {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 20%;
  height: 14%;
  background: var(--ink);
  clip-path: polygon(0 100%, 0 0, 55% 0, 100% 100%);
}

/* 网点：下半身化进印刷网屏 */
.hp-halftone {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at center, rgba(9, 5, 18, 0.92) 0.85px, transparent 1.15px);
  background-size: 4px 4px;
  mix-blend-mode: soft-light;
  opacity: 0.16;
  -webkit-mask-image: linear-gradient(0deg, #000 0 24%, transparent 46%);
  mask-image: linear-gradient(0deg, #000 0 24%, transparent 46%);
}

/* 扫描线：让静止的海报保留视频的心跳 */
.hp-scan {
  position: absolute;
  top: -26%;
  left: 0;
  width: 100%;
  height: 26%;
  background: linear-gradient(180deg, transparent, rgba(240, 207, 122, 0.42), transparent);
  mix-blend-mode: screen;
  opacity: 0.3;
  animation: plate-scan 7.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.hp-grain {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='.6'/%3E%3C/svg%3E");
}

.hp-spine {
  position: absolute;
  top: 15%;
  left: 10px;
  color: rgba(236, 228, 211, 0.78);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.24em;
  writing-mode: vertical-rl;
}

/* 套准十字：印厂语言 */
.hp-reg {
  position: absolute;
  z-index: 3;
  width: 13px;
  height: 13px;
  border-top: 1px solid rgba(236, 228, 211, 0.7);
  border-left: 1px solid rgba(236, 228, 211, 0.7);
}

.reg-tl { top: 16px; left: 16px; }
.reg-br {
  right: 16px;
  bottom: 16px;
  border: 0;
  border-right: 1px solid rgba(236, 228, 211, 0.7);
  border-bottom: 1px solid rgba(236, 228, 211, 0.7);
}

.hp-caption {
  position: absolute;
  top: calc(100% + 16px);
  left: 0;
  display: inline-block;
  padding: 3px 6px;
  background: rgba(9, 5, 18, 0.72);
  color: rgba(236, 228, 211, 0.72);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  white-space: nowrap;
  border-left: 2px solid var(--gold);
}

/* ---------- 版面其余元素 ---------- */
.ha-tie {
  position: absolute;
  top: 47.5%;
  left: 0;
  z-index: 1;
  width: 55%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(236, 228, 211, 0.28) 22%, rgba(236, 228, 211, 0.28));
}

.ha-wedge {
  position: absolute;
  bottom: -14%;
  left: -8%;
  z-index: 1;
  width: 74vw;
  height: 26vh;
  background: #cf1b2d;
  transform: rotate(-11deg);
  transform-origin: left center;
}

.ha-bar {
  position: absolute;
  top: 21%;
  right: 6.5%;
  z-index: 1;
  width: 13px;
  height: 33vh;
  background: var(--gold);
  transform: rotate(-1.6deg);
}

.ha-ring {
  position: absolute;
  right: 12%;
  bottom: 17%;
  z-index: 1;
  width: min(15vh, 150px);
  aspect-ratio: 1;
  border: 1px solid rgba(216, 178, 90, 0.66);
  border-radius: 50%;
}

.ha-rule {
  position: absolute;
  z-index: 1;
  height: 2px;
  background: rgba(236, 228, 211, 0.5);
  transform-origin: left center;
}

.rule-a {
  top: 72%;
  left: 4%;
  width: 33vw;
  transform: rotate(-19deg);
}

.ha-code {
  position: absolute;
  top: 11%;
  right: 2.6%;
  z-index: 2;
  color: rgba(236, 228, 211, 0.45);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.32em;
  writing-mode: vertical-rl;
}

@keyframes plate-scan {
  0% { transform: translateY(0); opacity: 0; }
  12% { opacity: 0.7; }
  70% { opacity: 0.5; }
  100% { transform: translateY(500%); opacity: 0; }
}

@keyframes plate-breathe {
  from { transform: rotate(-1.6deg) translate3d(0, -5px, 0); }
  to { transform: rotate(-1.6deg) translate3d(0, 7px, 0); }
}

.hero-stage::after {
  position: absolute;
  inset: 0;
  z-index: 2;
  content: '';
  pointer-events: none;
  opacity: 0.18;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
}

.hero-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(97deg, rgba(8, 5, 16, 0.9) 0 39%, rgba(8, 5, 16, 0.5) 39.2% 52%, rgba(8, 5, 16, 0.08) 52.2% 100%),
    linear-gradient(0deg, rgba(8, 5, 16, 0.78) 0 12%, transparent 12.2%);
}

.transition-flash {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: var(--bone);
  pointer-events: none;
}

.hero-interface,
.hero-frame {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.hero-interface {
  display: flex;
  flex-direction: column;
  padding: 34px 42px 30px;
}

.hero-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 26px;
  place-items: center;
  background: var(--gold-bright);
  color: #12100f;
  font-family: var(--font-display);
}

.hero-coordinate {
  color: rgba(236, 228, 211, 0.5);
}

.hero-copy {
  width: min(720px, 60vw);
  margin-block: auto;
  padding-left: 5.5vw;
}

.hero-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  color: var(--gold-bright);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-kicker span {
  width: 46px;
  height: 2px;
  background: currentColor;
}

.hero-title-row {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 18px;
}

.hero-copy h1 {
  margin: 0;
  color: #f8f4e9;
  font-family: var(--font-display);
  font-size: 96px;
  line-height: 0.82;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero-copy h1 strong {
  color: #f8f4e9;
  -webkit-text-stroke: 0;
  text-stroke: 0;
}

/* 印章：她的名字本身也是版面里的一个色块 */
.hero-seal {
  display: grid;
  width: 62px;
  height: 62px;
  margin-bottom: 6px;
  place-items: center;
  border: 2px solid var(--red);
  background: var(--bone);
  color: #b3142a;
  font-family: var(--font-serif);
  font-size: 34px;
  line-height: 1;
  transform: rotate(-3deg);
  box-shadow: 6px 6px 0 rgba(224, 27, 46, 0.9);
}

.hero-statement {
  display: grid;
  grid-template-columns: minmax(160px, 250px) minmax(200px, 1fr);
  gap: 30px;
  margin-top: 34px;
  padding-top: 18px;
  border-top: 1px solid rgba(236, 228, 211, 0.26);
  color: rgba(255, 255, 255, 0.74);
  font-size: 13px;
  line-height: 1.7;
}

.hero-quote {
  color: rgba(236, 228, 211, 0.92);
  font-family: var(--font-serif);
}

/* 人物档案卡：头像不再躲在右侧栏里 */
.hero-personnel {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
  padding: 6px 14px 6px 6px;
  border: 1px solid rgba(236, 228, 211, 0.24);
  border-left: 3px solid var(--red);
  background: rgba(236, 228, 211, 0.05);
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.hero-personnel:hover {
  border-color: rgba(216, 178, 90, 0.6);
  background: rgba(236, 228, 211, 0.09);
}

.personnel-photo {
  position: relative;
  display: block;
  flex: none;
  width: 56px;
  height: 56px;
  padding: 3px;
  background: var(--bone);
  box-shadow: 4px 4px 0 var(--red);
}

.personnel-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.95) contrast(1.04);
}

.personnel-photo::after {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 6px;
  height: 6px;
  content: '';
  border-radius: 50%;
  background: var(--gold-bright);
  box-shadow: 0 0 0 2px var(--ink);
}

.personnel-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.personnel-meta b {
  color: var(--gold-bright);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.personnel-meta span {
  color: var(--bone);
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.06em;
}

.hero-status {
  position: absolute;
  right: 42px;
  bottom: 30px;
  display: flex;
  gap: 18px;
  font-family: var(--font-mono);
  font-size: 10px;
}

.hero-status span:first-child {
  color: var(--gold-bright);
}

.scroll-cue {
  position: absolute;
  bottom: 30px;
  left: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
}

.scroll-line {
  position: relative;
  width: 64px;
  height: 1px;
  overflow: hidden;
  background: rgba(236, 228, 211, 0.3);
}

.scroll-line::after {
  position: absolute;
  inset: 0;
  content: '';
  background: var(--gold-bright);
  animation: scan 1.8s ease-in-out infinite;
}

.hero-frame {
  z-index: 2;
  pointer-events: none;
}

.frame-corner {
  position: absolute;
  width: 34px;
  height: 34px;
  border-color: rgba(236, 228, 211, 0.28);
}

.corner-a { top: 18px; left: 18px; border-top: 1px solid; border-left: 1px solid; }
.corner-b { top: 18px; right: 18px; border-top: 1px solid; border-right: 1px solid; }
.corner-c { bottom: 18px; left: 18px; border-bottom: 1px solid; border-left: 1px solid; }
.corner-d { right: 18px; bottom: 18px; border-right: 1px solid; border-bottom: 1px solid; }

.aperture-guide {
  position: absolute;
  top: 32%;
  left: 66%;
  z-index: 4;
  width: min(34vw, 480px);
  aspect-ratio: 1;
  border: 1px solid rgba(236, 228, 211, 0.6);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.aperture-guide::before,
.aperture-guide::after,
.aperture-guide span::before,
.aperture-guide span::after {
  position: absolute;
  content: '';
  background: var(--gold-bright);
}

.aperture-guide::before { top: 50%; left: -18px; width: 36px; height: 1px; }
.aperture-guide::after { top: 50%; right: -18px; width: 36px; height: 1px; }
.aperture-guide span::before { top: -18px; left: 50%; width: 1px; height: 36px; }
.aperture-guide span::after { bottom: -18px; left: 50%; width: 1px; height: 36px; }

@keyframes scan {
  from { transform: translateX(-100%); }
  55%, 100% { transform: translateX(100%); }
}

@media (min-width: 1440px) {
  .hero-copy h1 { font-size: 112px; }
}

@media (max-width: 1100px) {
  .hero-copy h1 { font-size: 78px; }
  .ha-plate { left: 52%; height: min(58vh, 520px); }
  .ha-paper { left: 46%; width: 26vw; }
}

@media (max-width: 768px) {
  .transition-spacer {
    height: 135svh;
  }

  .ha-paper {
    top: 6%;
    left: 12%;
    width: 56vw;
    height: 42vh;
    transform: rotate(-5deg);
  }

  .ha-plate {
    top: 9%;
    left: 50%;
    height: 47vh;
    transform: translateX(-38%) rotate(-1.6deg);
    animation: none;
  }

  .ha-tie,
  .rule-a {
    display: none;
  }

  .ha-wedge {
    bottom: 21%;
    left: -18%;
    width: 112vw;
    height: 13vh;
    transform: rotate(-7deg);
  }

  .ha-bar {
    top: 12%;
    right: 5%;
    width: 10px;
    height: 16vh;
  }

  .ha-ring {
    right: 6%;
    bottom: 27%;
    width: 15vh;
  }

  .ha-code {
    display: none;
  }

  .hp-caption {
    display: none;
  }

  .hero-shade {
    background:
      linear-gradient(0deg, rgba(8, 5, 16, 0.97) 0 44%, rgba(8, 5, 16, 0.62) 44.2% 62%, rgba(8, 5, 16, 0.2) 62.2% 100%);
  }

  .hero-interface {
    padding: 22px 20px 24px;
  }

  .hero-coordinate {
    display: none;
  }

  .hero-copy {
    width: 100%;
    margin-top: auto;
    margin-bottom: 9vh;
    padding-left: 0;
  }

  .hero-copy h1 {
    font-size: 54px;
    line-height: 0.86;
  }

  .hero-personnel {
    gap: 10px;
    margin-top: 16px;
    padding: 4px 10px 4px 4px;
  }

  .personnel-photo {
    width: 46px;
    height: 46px;
    box-shadow: 3px 3px 0 var(--red);
  }

  .personnel-meta b {
    font-size: 9px;
    letter-spacing: 0.12em;
  }

  .personnel-meta span {
    font-size: 12px;
  }

  .hero-copy h1 strong {
    -webkit-text-stroke-width: 0;
  }

  .hero-seal {
    width: 42px;
    height: 42px;
    margin-bottom: 2px;
    font-size: 23px;
    box-shadow: 4px 4px 0 rgba(224, 27, 46, 0.9);
  }

  .hero-statement {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 22px;
    font-size: 11px;
  }

  .hero-quote {
    display: none;
  }

  .scroll-cue {
    bottom: 24px;
    left: 20px;
  }

  .hero-status {
    right: 20px;
    bottom: 24px;
  }

  .hero-status span:last-child {
    display: none;
  }

  .aperture-guide {
    top: 30%;
    left: 50%;
    width: 58vw;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-line::after,
  .hp-scan,
  .ha-plate {
    animation: none;
  }
}
</style>
