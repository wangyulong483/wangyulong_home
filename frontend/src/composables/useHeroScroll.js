/*
  首页滚动动画 — 单一进度源 heroProgress (0→1) 驱动所有元素动画

  架构：
    Home.vue     → rAF scroll 监听 → 更新 heroProgress
    Home.vue     → 读取 videoStyle / contentStyle
    Sidebar.vue  → 读取 sidebarStyle / bodyPaddingPx
    App.vue      → 读取 showParticles
*/
import { ref, computed } from 'vue'

/* ================================================================
   唯一进度源：0 = 页顶（全屏视频），1 = hero 完全滚过
   ================================================================ */
export const heroProgress = ref(0)

/* ================================================================
   工具函数
   ================================================================ */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

// 将 progress 映射到指定区间内的 0→1 子进度
function range(p, start, end) {
  return clamp((p - start) / (end - start), 0, 1)
}

// ease-out expo 曲线，让动画末尾更柔和
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

/* ================================================================
   视频动画值
   progress 0.00→0.55: opacity 1→0, scale 1→1.05, blur 0→10px
   ================================================================ */
export const videoStyle = computed(() => {
  const p = heroProgress.value
  const t = easeOut(range(p, 0.0, 0.55))
  return {
    opacity: 1 - t,
    transform: `scale(${1 + t * 0.05})`,
    filter: `blur(${t * 10}px)`,
    pointerEvents: p > 0.55 ? 'none' : 'auto',
  }
})

/* ================================================================
   侧边栏动画值
   progress 0.15→0.55: opacity 0→1, translateX 20px→0
   ================================================================ */
export const sidebarStyle = computed(() => {
  const p = heroProgress.value
  const t = easeOut(range(p, 0.15, 0.55))
  return {
    opacity: t,
    transform: `translateX(${(1 - t) * 20}px)`,
    pointerEvents: t > 0.05 ? 'auto' : 'none',
  }
})

/* ================================================================
   内容区动画值
   progress 0.25→0.80: opacity 0→1, translateY 40px→0
   ================================================================ */
export const contentStyle = computed(() => {
  const p = heroProgress.value
  const t = easeOut(range(p, 0.25, 0.80))
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * 40}px)`,
  }
})

/* ================================================================
   body padding-right（px）
   progress 0.15→0.80: 0→200px
   ================================================================ */
export const bodyPaddingPx = computed(() => {
  const p = heroProgress.value
  const t = easeOut(range(p, 0.15, 0.80))
  return Math.round(t * 200)
})

/* ================================================================
   粒子背景显隐
   progress > 0.15 时出现
   ================================================================ */
export const showParticles = computed(() => heroProgress.value > 0.15)
