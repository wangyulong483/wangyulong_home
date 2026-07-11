<template>
  <!--
    粒子连线背景组件（canvas-nest）
    在页面背后渲染动态粒子网络

    使用方式：
      <ParticleBackground color="90,79,207" :count="80" :opacity="0.6" />
  -->
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ==================== Props ====================
const props = defineProps({
  // 粒子连线颜色（RGB 字符串，不含 rgb() 包裹）
  color: { type: String, default: '90,79,207' },
  // 粒子数量
  count: { type: Number, default: 100 },
  // 画布整体透明度
  opacity: { type: Number, default: 0.6 },
  // z-index 层级（应低于页面内容）
  zIndex: { type: Number, default: -1 },
})

// ==================== 状态 ====================
const canvasRef = ref(null)
let ctx = null
let canvasWidth = 0
let canvasHeight = 0
let animationId = null
let particles = []
let allPoints = [] // particles + mouse point
const mousePoint = { x: null, y: null, max: 20000 }

// ==================== 工具函数 ====================
const rand = Math.random

// ==================== 调整画布大小 ====================
function resize() {
  canvasWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = canvasWidth
    canvas.height = canvasHeight
  }
}

// ==================== 动画循环 ====================
function animate() {
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  particles.forEach((p, i) => {
    // 移动粒子
    p.x += p.xa
    p.y += p.ya

    // 边界反弹
    p.xa *= p.x > canvasWidth || p.x < 0 ? -1 : 1
    p.ya *= p.y > canvasHeight || p.y < 0 ? -1 : 1

    // 绘制粒子点（增大到 2px，淡色背景更可见）
    ctx.fillStyle = `rgba(${props.color},0.9)`
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
    ctx.fill()

    // 与后续粒子连线
    for (let j = i + 1; j < allPoints.length; j++) {
      const other = allPoints[j]
      if (other.x === null || other.y === null) continue

      const dx = p.x - other.x
      const dy = p.y - other.y
      const dist = dx * dx + dy * dy

      if (dist < other.max) {
        // 靠近鼠标时轻微排斥
        if (other === mousePoint && dist >= other.max / 2) {
          p.x -= 0.03 * dx
          p.y -= 0.03 * dy
        }

        const ratio = (other.max - dist) / other.max
        ctx.beginPath()
        ctx.lineWidth = ratio * 0.8
        ctx.strokeStyle = `rgba(${props.color},${(ratio * 0.8 + 0.2).toFixed(2)})`
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(other.x, other.y)
        ctx.stroke()
      }
    }
  })

  animationId = requestAnimationFrame(animate)
}

// ==================== 事件处理 ====================
function onMouseMove(e) {
  mousePoint.x = e.clientX
  mousePoint.y = e.clientY
}

function onMouseOut() {
  mousePoint.x = null
  mousePoint.y = null
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 检查用户动画偏好
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return // 尊重用户选择，不启动动画

  ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return

  resize()

  // 初始化粒子
  particles = []
  for (let i = 0; i < props.count; i++) {
    particles.push({
      x: rand() * canvasWidth,
      y: rand() * canvasHeight,
      xa: 2 * rand() - 1,  // -1 ~ 1 的水平速度
      ya: 2 * rand() - 1,  // -1 ~ 1 的垂直速度
      max: 6000,            // 连线距离阈值
    })
  }
  allPoints = [...particles, mousePoint]

  // 绑定事件
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseout', onMouseOut)

  // 启动动画
  setTimeout(() => {
    animationId = requestAnimationFrame(animate)
  }, 100)
})

onUnmounted(() => {
  // 清理：取消动画帧 + 解绑事件
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseout', onMouseOut)

  particles = []
  allPoints = []
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: v-bind('props.zIndex');
  opacity: v-bind('props.opacity');
  pointer-events: none; /* 不拦截鼠标事件，让用户能正常点击页面 */
}
</style>
