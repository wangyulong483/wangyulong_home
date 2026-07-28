<template>
  <!--
    canvas-nest.js 经典粒子效果
    亮色主题 → 紫色粒子 / 暗色主题 → 青色粒子
  -->
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  opacity: { type: Number, default: 0.8 },
  count:   { type: Number, default: 100 },
  zIndex:  { type: Number, default: -1 },
})

// 亮色紫 / 暗色青
function currentColor() {
  const t = document.documentElement.getAttribute('data-theme')
  return t === 'light' ? '108,92,231' : '0,210,255'
}

const canvasRef = ref(null)
let ctx = null
let canvasWidth = 0
let canvasHeight = 0
let animationId = null
let particles = []
let allPoints = []
const mousePoint = { x: null, y: null, max: 20000 }
const rand = Math.random

function resize() {
  canvasWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = canvasWidth
    canvas.height = canvasHeight
  }
}

function render() {
  if (!ctx) return

  const color = currentColor()
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  particles.forEach((p, i) => {
    p.x += p.xa
    p.y += p.ya
    p.xa *= p.x > canvasWidth  || p.x < 0 ? -1 : 1
    p.ya *= p.y > canvasHeight || p.y < 0 ? -1 : 1

    // 粒子点
    ctx.fillStyle = `rgba(${color},0.9)`
    ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1)

    // 连线
    for (let j = i + 1; j < allPoints.length; j++) {
      const other = allPoints[j]
      if (other.x === null || other.y === null) continue

      const dx = p.x - other.x
      const dy = p.y - other.y
      const dist = dx * dx + dy * dy

      if (dist < other.max) {
        if (other === mousePoint && dist >= other.max / 2) {
          p.x -= 0.03 * dx
          p.y -= 0.03 * dy
        }
        const ratio = (other.max - dist) / other.max
        ctx.beginPath()
        ctx.lineWidth = ratio / 2
        ctx.strokeStyle = `rgba(${color},${(ratio + 0.2).toFixed(2)})`
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(other.x, other.y)
        ctx.stroke()
      }
    }
  })

  animationId = requestAnimationFrame(render)
}

function onMouseMove(e) { mousePoint.x = e.clientX; mousePoint.y = e.clientY }
function onMouseOut() { mousePoint.x = null; mousePoint.y = null }

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return
  resize()

  particles = []
  for (let i = 0; i < props.count; i++) {
    particles.push({
      x: rand() * canvasWidth,  y: rand() * canvasHeight,
      xa: 2 * rand() - 1,       ya: 2 * rand() - 1,
      max: 6000,
    })
  }
  allPoints = [...particles, mousePoint]

  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseout', onMouseOut)

  setTimeout(() => { animationId = requestAnimationFrame(render) }, 100)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseout', onMouseOut)
  particles = []; allPoints = []
})
</script>

<style scoped>
.particle-canvas {
  position: fixed; top: 0; left: 0;
  z-index: v-bind('props.zIndex');
  opacity: v-bind('props.opacity');
  pointer-events: none;
}
</style>
