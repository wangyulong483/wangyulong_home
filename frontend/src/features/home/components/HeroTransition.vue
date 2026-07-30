<template>
  <div ref="rootRef" class="hero-transition">
    <div ref="spacerRef" class="transition-spacer" aria-hidden="true"></div>

    <div ref="contentRef" class="homepage-base">
      <slot />
    </div>

    <Teleport to="body">
      <div ref="stageRef" class="hero-stage" aria-hidden="true">
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
      </div>
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

let timeline
let resizeTimer
let videoIsPaused = false
let animatedNavigation
let stageIsHidden = false
let lastEmittedProgress = -1

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
  const stage = stageRef.value
  const spacer = spacerRef.value
  const content = contentRef.value
  if (!stage || !spacer || !content) return

  const video = videoRef.value
  const contentItems = rootRef.value.querySelectorAll('.js-home-reveal')
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const characterVisual = isMobile
    ? rootRef.value.querySelector('.js-mobile-character')
    : null
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const navigation = document.querySelector(isMobile ? '.js-mobile-menu' : '.js-sidebar')
  animatedNavigation = navigation

  gsap.set(stage, { autoAlpha: 1, pointerEvents: 'auto' })
  stageIsHidden = false
  lastEmittedProgress = -1
  stage.style.willChange = 'opacity'
  if (video) video.style.willChange = 'opacity, transform'
  gsap.set(video, { autoAlpha: 1, scale: 1 })
  gsap.set(contentItems, { autoAlpha: 0, y: reduceMotion ? 0 : 32 })
  if (characterVisual) {
    gsap.set(characterVisual, {
      autoAlpha: 0,
      y: reduceMotion ? 0 : 18,
      scale: reduceMotion ? 1 : 1.025,
      transformOrigin: '50% 35%',
    })
  }
  if (navigation) {
    gsap.set(navigation, {
      autoAlpha: 0,
      x: reduceMotion ? 0 : (isMobile ? 18 : 72),
      pointerEvents: 'none',
    })
  }

  timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: spacer,
      start: 'top top',
      end: 'bottom top',
      scrub: reduceMotion ? true : 0.2,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        const shouldHideStage = progress >= 0.72
        if (shouldHideStage !== stageIsHidden) {
          stageIsHidden = shouldHideStage
          stage.style.visibility = shouldHideStage ? 'hidden' : 'visible'
          stage.style.willChange = shouldHideStage ? 'auto' : 'opacity'
          if (video) video.style.willChange = shouldHideStage ? 'auto' : 'opacity, transform'
          setVideoPaused(document.hidden || shouldHideStage)
        }

        const crossedParticleThreshold = (lastEmittedProgress <= 0.6) !== (progress <= 0.6)
        if (crossedParticleThreshold || Math.abs(progress - lastEmittedProgress) >= 0.01) {
          lastEmittedProgress = progress
          emit('progress', progress)
        }
      },
    },
  })

  timeline
    .to(video, {
      autoAlpha: 0,
      scale: reduceMotion ? 1 : 1.025,
      duration: reduceMotion ? 0.08 : 0.34,
    }, 0.12)
    .to(stage, { autoAlpha: 0, duration: reduceMotion ? 0.06 : 0.18 }, 0.52)
    .to(contentItems, {
      autoAlpha: 1,
      y: 0,
      duration: reduceMotion ? 0.10 : 0.24,
      stagger: reduceMotion ? 0 : 0.035,
      ease: reduceMotion ? 'none' : 'power2.out',
    }, isMobile ? 0.72 : 0.62)

  if (characterVisual) {
    timeline.to(characterVisual, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: reduceMotion ? 0.10 : 0.24,
      ease: reduceMotion ? 'none' : 'power2.out',
    }, 0.60)
  }

  if (navigation) {
    timeline
      .to(navigation, {
        autoAlpha: 1,
        x: 0,
        duration: reduceMotion ? 0.10 : 0.22,
        ease: reduceMotion ? 'none' : 'power3.out',
      }, isMobile ? 0.76 : 0.72)
      .set(navigation, { pointerEvents: 'auto' }, isMobile ? 0.90 : 0.86)
  }

  timeline.to({}, { duration: 0.06 }, 0.94)
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
  setVideoPaused(document.hidden || progress >= 0.72)
}

function onResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    destroyAnimation()
    setupAnimation()
    ScrollTrigger.refresh()
  }, 160)
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
  height: 100svh;
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
  background: var(--bg-primary);
  will-change: opacity;
}

.hero-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  will-change: opacity, transform;
}

@media (prefers-reduced-motion: reduce) {
  .hero-stage,
  .hero-video {
    will-change: auto;
  }
}
</style>
