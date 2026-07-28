/*
  首页滚动动画 — 共享状态

  动画逻辑已移交 HeroTransition.vue（GSAP ScrollTrigger 封装在组件内）。
  本文件只保留跨组件共享的响应式状态：

    heroProgress   — 滚动进度 0→1，由 HeroTransition emit，Home.vue 更新
    showParticles  — 粒子背景显隐，供 App.vue 读取
*/
import { ref, computed } from 'vue'

export const heroProgress = ref(0)
export const showParticles = computed(() => heroProgress.value > 0.15)
