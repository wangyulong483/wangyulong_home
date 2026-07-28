<template>
  <canvas ref="canvasRef" class="particle-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  opacity: { type: Number, default: 0.8 },
  count: { type: Number, default: 100 },
  zIndex: { type: Number, default: -1 },
  color: { type: String, default: '108,92,231' },
})

const canvasRef = ref(null)
const mousePoint = { x: null, y: null, max: 20000 }

let ctx
let canvasWidth = 0
let canvasHeight = 0
let pixelRatio = 1
let animationId = null
let startTimer = null
let resizeTimer = null
let particles = []
let lastTimestamp = null
let lastRenderTimestamp = null
let running = false
let reducedMotion = false
let minimumFrameTime = 1000 / 60

const GRID_SIZE = 80
const PARTICLE_DISTANCE = 6000

function deviceProfile() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const lowEnd = (navigator.hardwareConcurrency || 8) <= 4
    || (navigator.deviceMemory || 8) <= 4

  return {
    maxPixelRatio: lowEnd ? 1.25 : isMobile ? 1.5 : 2,
    frameRate: lowEnd ? 30 : 60,
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  canvasWidth = window.innerWidth || document.documentElement.clientWidth
  canvasHeight = window.innerHeight || document.documentElement.clientHeight
  const profile = deviceProfile()
  pixelRatio = Math.min(window.devicePixelRatio || 1, profile.maxPixelRatio)
  minimumFrameTime = (1000 / profile.frameRate) - 0.5

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
    max: PARTICLE_DISTANCE,
  }))
}

function gridKey(column, row) {
  return `${column}:${row}`
}

function drawConnection(first, second, maxDistance) {
  const offsetX = first.x - second.x
  const offsetY = first.y - second.y
  const distance = offsetX * offsetX + offsetY * offsetY
  if (distance >= maxDistance) return null

  const ratio = (maxDistance - distance) / maxDistance
  ctx.beginPath()
  ctx.lineWidth = ratio / 2
  ctx.strokeStyle = `rgba(${props.color},${Math.min(ratio + 0.2, 1)})`
  ctx.moveTo(first.x, first.y)
  ctx.lineTo(second.x, second.y)
  ctx.stroke()
  return { offsetX, offsetY, distance }
}

function drawFrame(timestamp = performance.now(), advance = true) {
  if (!ctx) return

  const frameScale = lastTimestamp === null
    ? 1
    : Math.min((timestamp - lastTimestamp) / (1000 / 60), 2)
  lastTimestamp = timestamp

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = `rgba(${props.color},0.9)`

  const grid = new Map()

  particles.forEach((particle, index) => {
    if (advance) {
      particle.x += particle.xa * frameScale
      particle.y += particle.ya * frameScale
      particle.xa *= particle.x > canvasWidth || particle.x < 0 ? -1 : 1
      particle.ya *= particle.y > canvasHeight || particle.y < 0 ? -1 : 1
    }

    ctx.fillRect(particle.x - 0.5, particle.y - 0.5, 1, 1)

    const column = Math.floor(particle.x / GRID_SIZE)
    const row = Math.floor(particle.y / GRID_SIZE)
    const key = gridKey(column, row)
    const cell = grid.get(key)
    if (cell) cell.push(index)
    else grid.set(key, [index])
  })

  particles.forEach((particle, index) => {
    const column = Math.floor(particle.x / GRID_SIZE)
    const row = Math.floor(particle.y / GRID_SIZE)

    for (let offsetColumn = -1; offsetColumn <= 1; offsetColumn += 1) {
      for (let offsetRow = -1; offsetRow <= 1; offsetRow += 1) {
        const candidates = grid.get(gridKey(column + offsetColumn, row + offsetRow)) || []
        candidates.forEach((otherIndex) => {
          if (otherIndex <= index) return
          drawConnection(particle, particles[otherIndex], PARTICLE_DISTANCE)
        })
      }
    }

    if (mousePoint.x !== null && mousePoint.y !== null) {
      const connection = drawConnection(particle, mousePoint, mousePoint.max)
      if (advance && connection && connection.distance >= mousePoint.max / 2) {
        particle.x -= 0.03 * connection.offsetX * frameScale
        particle.y -= 0.03 * connection.offsetY * frameScale
      }
    }
  })
}

function animate(timestamp) {
  if (!running) return

  if (lastRenderTimestamp !== null && timestamp - lastRenderTimestamp < minimumFrameTime) {
    animationId = requestAnimationFrame(animate)
    return
  }

  lastRenderTimestamp = timestamp
  drawFrame(timestamp, true)
  animationId = requestAnimationFrame(animate)
}

function startAnimation() {
  if (running || reducedMotion) return
  running = true
  lastTimestamp = null
  lastRenderTimestamp = null
  animationId = requestAnimationFrame(animate)
}

function stopAnimation() {
  running = false
  if (animationId !== null) cancelAnimationFrame(animationId)
  animationId = null
  lastTimestamp = null
  lastRenderTimestamp = null
}

function rebuildParticles() {
  if (!ctx) return
  createParticles()
  if (reducedMotion) drawFrame(performance.now(), false)
}

function onResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    resizeCanvas()
    rebuildParticles()
  }, 120)
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
  window.clearTimeout(resizeTimer)
  stopAnimation()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseout', onMouseLeave)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  particles = []
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
