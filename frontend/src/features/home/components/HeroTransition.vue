<template>
  <div ref="rootRef" class="hero-transition">
    <div ref="spacerRef" class="transition-spacer" aria-hidden="true"></div>

    <div ref="contentRef" class="homepage-base">
      <slot />
    </div>

    <Teleport to="body">
      <section ref="stageRef" class="hero-stage" aria-label="MY WEBSITE 首页视觉">
        <video
          ref="videoRef"
          class="hero-video"
          :src="videoSrc"
          :poster="posterSrc"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        ></video>
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
            <h1>MY<br /><strong>WEBSITE</strong></h1>
            <div class="hero-statement">
              <p>记录学习、创造与仍在发生的旅程。</p>
              <p class="hero-quote">“谁终将点燃闪电，必长久如云漂泊。”</p>
            </div>
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

function setupAnimation() {
  const root = rootRef.value
  const stage = stageRef.value
  const spacer = spacerRef.value
  const content = contentRef.value
  const video = videoRef.value
  if (!root || !stage || !spacer || !content || !video) return

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const focus = isMobile ? '58% 42%' : '72% 44%'
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
  })
  gsap.set(video, { scale: 1, filter: 'saturate(0.9) contrast(1.05)' })
  gsap.set(content, { autoAlpha: reduceMotion ? 1 : 0.28 })
  gsap.set(contentItems, {
    autoAlpha: reduceMotion ? 1 : 0,
    y: reduceMotion ? 0 : 46,
    clipPath: reduceMotion ? 'none' : 'inset(0 0 18% 0)',
  })
  gsap.set(apertureRef.value, { autoAlpha: 0, scale: 1.35 })
  gsap.set(flashRef.value, { autoAlpha: 0 })

  if (navigation) {
    gsap.set(navigation, {
      autoAlpha: 0,
      x: reduceMotion ? 0 : (isMobile ? 18 : 70),
      pointerEvents: 'none',
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
    .to(video, {
      scale: reduceMotion ? 1 : 1.09,
      filter: 'saturate(0.55) contrast(1.16)',
      duration: reduceMotion ? 0.12 : 0.5,
      ease: 'power2.inOut',
    }, 0.12)
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
    .to(flashRef.value, {
      autoAlpha: reduceMotion ? 0 : 0.78,
      duration: 0.05,
    }, 0.57)
    .to(flashRef.value, {
      autoAlpha: 0,
      duration: 0.13,
    }, 0.62)
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

  timeline.to({}, { duration: 0.08 }, 0.92)
  emit('progress', timeline.scrollTrigger.progress)
}

function destroyAnimation() {
  timeline?.scrollTrigger?.kill()
  timeline?.kill()
  timeline = null

  if (animatedNavigation) {
    gsap.set(animatedNavigation, { clearProps: 'opacity,visibility,transform,pointerEvents' })
    animatedNavigation = null
  }
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
  videoIsPaused = videoRef.value?.paused ?? false
  if (!shouldAutoplay()) setVideoPaused(true)
  setupAnimation()
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', onResize, { passive: true })
})

onUnmounted(() => {
  window.clearTimeout(resizeTimer)
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
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow: hidden;
  background: #09090c;
  color: #f8f4e9;
  isolation: isolate;
}

.hero-video,
.hero-shade,
.transition-flash {
  position: absolute;
  inset: 0;
}

.hero-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.hero-shade {
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(8, 8, 12, 0.82) 0%, rgba(8, 8, 12, 0.28) 48%, rgba(8, 8, 12, 0.12) 100%),
    linear-gradient(0deg, rgba(8, 8, 12, 0.66) 0%, transparent 40%);
}

.transition-flash {
  z-index: 5;
  background: #eaff57;
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
  background: var(--signal);
  color: #0b0b0e;
  font-family: var(--font-display);
}

.hero-coordinate {
  color: rgba(255, 255, 255, 0.56);
}

.hero-copy {
  width: min(680px, 66vw);
  margin-block: auto;
  padding-left: 6vw;
}

.hero-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
}

.hero-kicker span {
  width: 46px;
  height: 2px;
  background: currentColor;
}

.hero-copy h1 {
  margin: 0;
  color: #f8f4e9;
  font-family: var(--font-display);
  font-size: 96px;
  line-height: 0.82;
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 10px 38px rgba(0, 0, 0, 0.34);
}

.hero-copy h1 strong {
  color: transparent;
  -webkit-text-stroke: 2px #f8f4e9;
  text-stroke: 2px #f8f4e9;
}

.hero-statement {
  display: grid;
  grid-template-columns: minmax(160px, 250px) minmax(220px, 1fr);
  gap: 30px;
  margin-top: 34px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  line-height: 1.7;
}

.hero-quote {
  color: rgba(255, 255, 255, 0.9);
  font-family: serif;
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
  color: var(--signal);
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
  background: rgba(255, 255, 255, 0.3);
}

.scroll-line::after {
  position: absolute;
  inset: 0;
  content: '';
  background: var(--signal);
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
  border-color: rgba(255, 255, 255, 0.34);
}

.corner-a { top: 18px; left: 18px; border-top: 1px solid; border-left: 1px solid; }
.corner-b { top: 18px; right: 18px; border-top: 1px solid; border-right: 1px solid; }
.corner-c { bottom: 18px; left: 18px; border-bottom: 1px solid; border-left: 1px solid; }
.corner-d { right: 18px; bottom: 18px; border-right: 1px solid; border-bottom: 1px solid; }

.aperture-guide {
  position: absolute;
  top: 44%;
  left: 72%;
  z-index: 4;
  width: min(34vw, 480px);
  aspect-ratio: 1;
  border: 1px solid rgba(234, 255, 87, 0.72);
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
  background: var(--signal);
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

@media (max-width: 768px) {
  .transition-spacer {
    height: 135svh;
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
    margin-bottom: 17vh;
    padding-left: 0;
  }

  .hero-copy h1 {
    font-size: 54px;
    line-height: 0.86;
  }

  .hero-copy h1 strong {
    -webkit-text-stroke-width: 1px;
  }

  .hero-statement {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 24px;
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
    top: 42%;
    left: 58%;
    width: 48vw;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-line::after {
    animation: none;
  }
}
</style>
