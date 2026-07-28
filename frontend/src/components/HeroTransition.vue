<template>
  <!--
    HeroTransition — 环形虹膜转场（参考 nanfu.global）

    三层架构：
      Layer 1 .homepage-base → 首页内容（始终存在，初始被遮挡）
      Layer 2 .hero-mask     → 全屏视频 + clip-path: circle（虹膜遮罩）
      Layer 3 .hero-quote    → 名言（fixed，FLIP 飞入目标位）

    滚动叙事：
      scroll 0→10%   HOLD      视频全屏 + 名言在左侧
      scroll 10→55%  IRIS      clip-path: circle(100%→0%) + 名言飞入
      scroll 40→70%  ENTRANCE  卡片 + 侧边栏 错峰淡入
      scroll 70→100% COMPLETE  全部就位
  -->
  <div class="hero-transition">
    <!-- ================================================================
         Layer 1: 首页内容（正常流，始终存在）
         被 hero-mask 遮挡，iris 收缩后逐渐可见
         ================================================================ -->
    <div class="homepage-base">
      <slot />
    </div>

    <!-- ================================================================
         Layer 2: 虹膜遮罩（fixed 全屏，clip-path: circle）
         这是转场的核心 —— 圆形遮罩从全屏收缩到 0
         ================================================================ -->
    <div class="hero-mask" ref="heroMaskRef">
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
      <div class="hero-overlay"></div>
    </div>

    <!-- ================================================================
         Layer 3: 名言（fixed，独立于遮罩之外 —— 不被 clip-path 裁剪）
         GSAP FLIP 动画：从视频左侧飞入内容区上方
         ================================================================ -->
    <div class="hero-quote js-hero-quote" ref="quoteRef">
      <slot name="hero-text" />
    </div>

    <!-- 滚动提示箭头 -->
    <div class="scroll-hint">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </div>

    <!-- ================================================================
         过渡 Spacer（200vh）
         GSAP ScrollTrigger 在此区间驱动 clip-path + FLIP + stagger
         ================================================================ -->
    <div class="transition-spacer"></div>
  </div>
</template>

<script setup>
/*
  HeroTransition — 封装全部转场逻辑
  参考：nanfu.global 环形开合 + GSAP ScrollTrigger scrub
*/
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  videoSrc: { type: String, default: '/video/试试_6.mp4' },
  posterSrc: { type: String, default: '/video/hero-poster.webp' },
})

const emit = defineEmits(['progress'])

const videoRef = ref(null)
const heroMaskRef = ref(null)
const quoteRef = ref(null)

let tl = null

/* ================================================================
   视频播放策略
   ================================================================ */
function shouldPlay() {
  if (window.matchMedia('(max-width: 768px)').matches) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const conn = navigator.connection || {}
  if (conn.saveData) return false
  if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return false
  return true
}

/* ================================================================
   名言 FLIP：计算初始→目标位置
   ================================================================ */
function computeQuoteFLIP() {
  const quoteEl = quoteRef.value
  const destEl = document.querySelector('.js-quote-dest')
  const homepageBase = document.querySelector('.homepage-base')

  if (!quoteEl || !destEl || !homepageBase) return { dx: 0, dy: 0 }

  const start = quoteEl.getBoundingClientRect()
  const hp = homepageBase.getBoundingClientRect()
  const dest = destEl.getBoundingClientRect()

  // 目标位置（过渡完成时 homepage 顶部对齐视口顶部）
  const targetTop = dest.top - hp.top
  const targetLeft = dest.left - hp.left

  return {
    dx: targetLeft - start.left,
    dy: targetTop - start.top,
  }
}

/* ================================================================
   创建 GSAP 动画
   ================================================================ */
function setupAnimation() {
  const maskEl = heroMaskRef.value
  const quoteEl = quoteRef.value
  const destEl = document.querySelector('.js-quote-dest')
  if (!maskEl) return

  // --- 计算名言 FLIP 参数 ---
  const { dx, dy } = computeQuoteFLIP()

  /* ---------- Timeline ---------- */
  tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.transition-spacer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: (self) => {
        emit('progress', self.progress)
        // 名言显隐：虹膜关闭到 55% 后，hero-quote 隐藏，dest-quote 显示
        if (quoteEl) {
          quoteEl.style.opacity = self.progress > 0.50 ? '0' : ''
        }
        if (destEl) {
          destEl.style.opacity = self.progress > 0.50 ? '1' : '0'
        }
      },
    },
  })

  /* ---------- IRIS CLOSE (0.10→0.55) ---------- */
  // 圆形遮罩从全屏收缩到 0（从中心消失）
  tl.fromTo(
    maskEl,
    { clipPath: 'circle(100% at 50% 50%)' },
    { clipPath: 'circle(0% at 50% 50%)', duration: 0.45, ease: 'power2.inOut' },
    0.10,
  )

  /* ---------- 名言 FLIP 飞入 (0.15→0.55) ---------- */
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
    tl.fromTo(
      quoteEl,
      { x: 0, y: 0 },
      { x: dx, y: dy, duration: 0.40, ease: 'power3.out' },
      0.15,
    )
  }

  /* ---------- 滚动提示消失 (0.03→0.10) ---------- */
  tl.to('.scroll-hint', { opacity: 0, duration: 0.07 }, 0.03)

  /* ---------- 内容卡片 stagger 淡入 (0.40→0.65) ---------- */
  tl.fromTo(
    '.content-card',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.12, stagger: 0.08, ease: 'power3.out' },
    0.40,
  )

  /* ---------- 侧边栏滑入 (0.45→0.70) ---------- */
  tl.fromTo(
    '.js-sidebar',
    { opacity: 0, x: 60 },
    { opacity: 1, x: 0, duration: 0.25, ease: 'expo.out' },
    0.45,
  )

  /* ---------- body padding (0.45→0.70) ---------- */
  tl.to('body', { paddingRight: '200px', duration: 0.25, ease: 'expo.out' }, 0.45)

  /* ---------- 补齐到 1.0 ---------- */
  tl.to({}, { duration: 0.30 }, 0.70)
}

function destroyAnimation() {
  if (tl) { tl.kill(); tl = null }
  ScrollTrigger.getAll().forEach((st) => st.kill())
}

function onVisibility() {
  const v = videoRef.value
  if (!v) return
  document.hidden ? v.pause() : (shouldPlay() && v.play().catch(() => {}))
}

/* ================================================================
   生命周期
   ================================================================ */
onMounted(() => {
  if (!shouldPlay()) {
    videoRef.value?.remove()
  }
  // 等 DOM 完整渲染后计算 FLIP 并启动动画
  requestAnimationFrame(() => {
    setupAnimation()
  })
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  destroyAnimation()
  document.body.style.paddingRight = ''
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
/* ================================================================
   Layer 1: 首页内容
   ================================================================ */

.homepage-base {
  position: relative;
  z-index: 1;
  /* 内容由 slot 提供，这里只设最小高度和背景 */
  min-height: 100vh;
  background: var(--bg-primary);
}

/* ================================================================
   Layer 2: 虹膜遮罩（fixed 全屏）
   ================================================================ */

.hero-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  /* clip-path 初始 = circle(100%)，GSAP 驱动收缩 */
  clip-path: circle(100% at 50% 50%);
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(10, 10, 15, 0.4) 0%,
      rgba(10, 10, 15, 0.15) 35%,
      rgba(10, 10, 15, 0.25) 60%,
      rgba(10, 10, 15, 0.75) 85%,
      rgba(10, 10, 15, 0.95) 100%
    );
  z-index: 0;
  pointer-events: none;
}

/* ================================================================
   Layer 3: 名言（fixed，初始在视频左侧）
   不被 clip-path 裁剪，GSAP FLIP 飞入目标位
   ================================================================ */

.hero-quote {
  position: fixed;
  z-index: 101;
  left: 5vw;
  top: 45vh;
  transform: translateY(-50%);
  max-width: 380px;
  pointer-events: none;
}

/* ================================================================
   滚动提示
   ================================================================ */

.scroll-hint {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 102;
  color: rgba(255, 255, 255, 0.4);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.4; }
  50%      { transform: translateX(-50%) translateY(8px); opacity: 0.75; }
}

/* ================================================================
   过渡 Spacer
   ================================================================ */

.transition-spacer {
  height: 200vh;
}

/* ================================================================
   亮色主题
   ================================================================ */

[data-theme='light'] .hero-overlay {
  background:
    linear-gradient(
      180deg,
      rgba(250, 250, 250, 0.3) 0%,
      rgba(250, 250, 250, 0.1) 35%,
      rgba(250, 250, 250, 0.2) 60%,
      rgba(250, 250, 250, 0.7) 85%,
      rgba(250, 250, 250, 0.95) 100%
    );
}

/* ================================================================
   移动端降级
   ================================================================ */

@media (max-width: 768px) {
  .hero-mask {
    position: relative;
    height: 100svh;
    clip-path: none !important;
    background: #0a0a0f;
  }

  .hero-video { display: none; }

  .hero-quote {
    position: absolute;
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    text-align: center;
    max-width: 90vw;
  }

  .transition-spacer { height: 60vh; }
}
</style>
