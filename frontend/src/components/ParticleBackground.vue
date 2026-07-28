<template>
  <canvas ref="canvasRef" class="particle-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  opacity: { type: Number, default: 0.8 },
  count: { type: Number, default: 100 },
  zIndex: { type: Number, default: -1 },
  color: { type: String, default: '45,118,200' },
})

const canvasRef = ref(null)
const mousePoint = { x: null, y: null, max: 20000 }

let ctx
let canvasWidth = 0
let canvasHeight = 0
let pixelRatio = 1
let animationId = null
let startTimer = null
let particles = []
let allPoints = []
let lastTimestamp = null
let running = false
let reducedMotion = false

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  canvasWidth = window.innerWidth || document.documentElement.clientWidth
  canvasHeight = window.innerHeight || document.documentElement.clientHeight
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

  canvas.width = Math.round(canvasWidth * pixelRatio)
  canvas.height = Math.round(canvasHeight * pixelRatio)
  canvas.style.width = `${canvasWidth}px`
  canvas.style.height = `${canvasHeight}px`
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}

function createParticles() {
  const count = Math.max(0, Math.round(props.count))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    xa: 2 * Math.random() - 1,
    ya: 2 * Math.random() - 1,
    max: 6000,
  }))
  allPoints = [...particles, mousePoint]
}

function drawFrame(timestamp = performance.now(), advance = true) {
  if (!ctx) return

  const frameScale = lastTimestamp === null
    ? 1
    : Math.min((timestamp - lastTimestamp) / (1000 / 60), 2)
  lastTimestamp = timestamp

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = `rgba(${props.color},0.9)`

  particles.forEach((particle, index) => {
    if (advance) {
      particle.x += particle.xa * frameScale
      particle.y += particle.ya * frameScale
      particle.xa *= particle.x > canvasWidth || particle.x < 0 ? -1 : 1
      particle.ya *= particle.y > canvasHeight || particle.y < 0 ? -1 : 1
    }

    ctx.fillRect(particle.x - 0.5, particle.y - 0.5, 1, 1)

    for (let otherIndex = index + 1; otherIndex < allPoints.length; otherIndex += 1) {
      const other = allPoints[otherIndex]
      if (other.x === null || other.y === null) continue

      const offsetX = particle.x - other.x
      const offsetY = particle.y - other.y
      const distance = offsetX * offsetX + offsetY * offsetY
      if (distance >= other.max) continue

      if (advance && other === mousePoint && distance >= other.max / 2) {
        particle.x -= 0.03 * offsetX * frameScale
        particle.y -= 0.03 * offsetY * frameScale
      }

      const ratio = (other.max - distance) / other.max
      ctx.beginPath()
      ctx.lineWidth = ratio / 2
      ctx.strokeStyle = `rgba(${props.color},${Math.min(ratio + 0.2, 1)})`
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(other.x, other.y)
      ctx.stroke()
    }
  })
}

function animate(timestamp) {
  if (!running) return
  drawFrame(timestamp, true)
  animationId = requestAnimationFrame(animate)
}

function startAnimation() {
  if (running || reducedMotion) return
  running = true
  lastTimestamp = null
  animationId = requestAnimationFrame(animate)
}

function stopAnimation() {
  running = false
  if (animationId !== null) cancelAnimationFrame(animationId)
  animationId = null
  lastTimestamp = null
}

function rebuildParticles() {
  if (!ctx) return
  createParticles()
  if (reducedMotion) drawFrame(performance.now(), false)
}

function onResize() {
  resizeCanvas()
  rebuildParticles()
}

function onMouseMove(event) {
  mousePoint.x = event.clientX
  mousePoint.y = event.clientY
}

function onMouseLeave(event) {
  if (event.relatedTarget) return
  mousePoint.x = null
  mousePoint.y = null
}

function onVisibilityChange() {
  if (document.hidden) stopAnimation()
  else if (reducedMotion) drawFrame(performance.now(), false)
  else startAnimation()
}

watch(() => props.count, rebuildParticles)

onMounted(() => {
  ctx = canvasRef.value?.getContext('2d', { alpha: true })
  if (!ctx) return

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resizeCanvas()
  createParticles()

  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseout', onMouseLeave, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)

  if (reducedMotion) drawFrame(performance.now(), false)
  else startTimer = window.setTimeout(startAnimation, 100)
})

onUnmounted(() => {
  window.clearTimeout(startTimer)
  stopAnimation()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseout', onMouseLeave)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  particles = []
  allPoints = []
  ctx = null
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: v-bind('props.zIndex');
  display: block;
  opacity: v-bind('props.opacity');
  pointer-events: none;
}
</style>
