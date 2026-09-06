<!--
  雷晶粒子浮动背景
  模拟"一心净土"中悬浮的雷晶碎片，纯 CSS 动画
  3-5 个半透明紫色菱形，不同速度/延迟上下浮动
-->
<template>
  <div class="electro-particles" aria-hidden="true">
    <span v-for="i in 5" :key="i" class="crystal" :style="crystalStyle(i)"></span>
  </div>
</template>

<script setup>
/* 为每个粒子生成随机的尺寸、位置、动画参数 */
function crystalStyle(i) {
  const seed = i * 73 // 伪随机种子
  const size = 6 + (seed % 14)                // 6-20px
  const left = 5 + (seed * 7) % 90            // 5%-95%
  const delay = (seed * 0.37) % 6             // 0-6s
  const duration = 6 + (seed * 0.53) % 8      // 6-14s
  const opacity = 0.04 + (seed * 0.007) % 0.06 // 0.04-0.10
  return {
    width: size + 'px',
    height: size + 'px',
    left: left + '%',
    animationDelay: delay + 's',
    animationDuration: duration + 's',
    opacity: opacity,
  }
}
</script>

<style scoped>
.electro-particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
  contain: layout paint;
}

.crystal {
  position: absolute;
  bottom: -10%;
  background: #B088F9;
  /* 菱形：旋转45度的正方形 */
  transform: rotate(45deg);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(176, 136, 249, 0.3);
  animation: float-up linear infinite;
  will-change: transform, opacity;
}

@keyframes float-up {
  0% {
    transform: rotate(45deg) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: var(--crystal-opacity, 0.06);
  }
  90% {
    opacity: var(--crystal-opacity, 0.06);
  }
  100% {
    transform: rotate(45deg) translateY(-110vh);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .crystal {
    animation: none;
    opacity: 0;
  }
}
</style>
