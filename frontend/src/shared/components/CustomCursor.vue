<template>
  <div
    v-if="enabled"
    ref="cursorRef"
    class="custom-cursor"
    :class="[
      `cursor-mode-${mode}`,
      {
        'is-pressed': pressed,
        'is-hidden': hidden,
        'has-trail': trailEnabled,
      },
    ]"
    aria-hidden="true"
  >
    <span ref="ringRef" class="cursor-ring">
      <span class="cursor-cross cursor-cross-x"></span>
      <span class="cursor-cross cursor-cross-y"></span>
    </span>
    <span ref="dotRef" class="cursor-dot"></span>
    <span ref="labelRef" class="cursor-label">{{ label }}</span>
    <span
      v-for="index in trailCount"
      :key="index"
      ref="trailRefs"
      class="cursor-trail"
    ></span>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const enabled = ref(false)
const hidden = ref(true)
const pressed = ref(false)
const mode = ref('default')
const label = ref('')

const cursorRef = ref(null)
const ringRef = ref(null)
const dotRef = ref(null)
const labelRef = ref(null)
const trailRefs = ref([])

const trailCount = 5
const trailEnabled = computed(() => route.name === 'Shrine' && mode.value !== 'hero')

let raf = 0
let reducedMotion = false
let targetX = 0
let targetY = 0
let ringX = 0
let ringY = 0
let dotX = 0
let dotY = 0
let lastActiveElement = null
let finePointerQuery
let reducedMotionQuery
let trailPoints = Array.from({ length: trailCount }, () => ({ x: 0, y: 0 }))

function syncEnvironment() {
  const hasFinePointer = finePointerQuery?.matches ?? window.matchMedia('(hover: hover) and (pointer: fine)').matches
  reducedMotion = reducedMotionQuery?.matches ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  enabled.value = hasFinePointer
  document.documentElement.classList.toggle('custom-cursor-enabled', hasFinePointer)
  document.documentElement.classList.toggle('custom-cursor-reduced-motion', reducedMotion)

  if (!hasFinePointer) stopLoop()
  else startLoop()
}

function setMode(nextMode, nextLabel = '') {
  mode.value = nextMode
  label.value = nextLabel
}

function resolveCursorTarget(target) {
  if (!(target instanceof Element)) return { mode: 'default', label: '' }

  if (target.closest('.hero-stage')) return { mode: 'hero', label: '' }
  if (target.closest('.map-canvas, .map-stage')) return { mode: 'tool', label: 'DRAW' }
  if (target.closest('iframe, video, .card-media, .video-thumb, [data-cursor="play"]')) return { mode: 'media', label: 'PLAY' }
  if (target.closest('img, [data-cursor="view"]')) return { mode: 'view', label: 'VIEW' }
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return { mode: 'text', label: '' }
  if (target.closest('a, button, label, summary, .card-interactive, [role="button"], [data-cursor="link"]')) {
    return { mode: 'action', label: 'OPEN' }
  }

  return { mode: 'default', label: '' }
}

function updateActiveTarget(target) {
  const activeElement = target instanceof Element ? target : null
  if (activeElement === lastActiveElement) return
  lastActiveElement = activeElement
  const next = resolveCursorTarget(activeElement)
  setMode(next.mode, next.label)
}

function positionElement(element, x, y, offsetX = 0, offsetY = 0) {
  if (!element) return
  element.style.transform = `translate3d(${Math.round(x + offsetX)}px, ${Math.round(y + offsetY)}px, 0)`
}

function renderCursor() {
  if (!enabled.value) return

  if (reducedMotion) {
    ringX = targetX
    ringY = targetY
    dotX = targetX
    dotY = targetY
  } else {
    ringX += (targetX - ringX) * 0.32
    ringY += (targetY - ringY) * 0.32
    dotX += (targetX - dotX) * 0.78
    dotY += (targetY - dotY) * 0.78
  }

  positionElement(ringRef.value, ringX, ringY)
  positionElement(dotRef.value, dotX, dotY)
  positionElement(labelRef.value, ringX, ringY, 18, 16)

  if (trailEnabled.value && !reducedMotion) {
    let followX = targetX
    let followY = targetY
    trailRefs.value.forEach((trail, index) => {
      const point = trailPoints[index]
      point.x += (followX - point.x) * (0.18 - index * 0.018)
      point.y += (followY - point.y) * (0.18 - index * 0.018)
      positionElement(trail, point.x, point.y)
      followX = point.x
      followY = point.y
    })
  }

  raf = window.requestAnimationFrame(renderCursor)
}

function startLoop() {
  if (!raf) raf = window.requestAnimationFrame(renderCursor)
}

function stopLoop() {
  if (raf) window.cancelAnimationFrame(raf)
  raf = 0
}

function onPointerMove(event) {
  targetX = event.clientX
  targetY = event.clientY
  hidden.value = false
  updateActiveTarget(event.target)
}

function onPointerDown() {
  pressed.value = true
}

function onPointerUp() {
  pressed.value = false
}

function onPointerLeave() {
  hidden.value = true
}

function onPointerOver(event) {
  updateActiveTarget(event.target)
}

function onPointerOut(event) {
  if (!event.relatedTarget) {
    hidden.value = true
    return
  }
  updateActiveTarget(event.relatedTarget)
}

watch(() => route.name, async () => {
  await nextTick()
  lastActiveElement = null
  updateActiveTarget(document.elementFromPoint(targetX, targetY))
})

onMounted(() => {
  finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncEnvironment()

  finePointerQuery.addEventListener('change', syncEnvironment)
  reducedMotionQuery.addEventListener('change', syncEnvironment)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
  window.addEventListener('blur', onPointerLeave)
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  document.addEventListener('pointerout', onPointerOut, { passive: true })
})

onUnmounted(() => {
  stopLoop()
  finePointerQuery?.removeEventListener('change', syncEnvironment)
  reducedMotionQuery?.removeEventListener('change', syncEnvironment)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('blur', onPointerLeave)
  document.removeEventListener('pointerover', onPointerOver)
  document.removeEventListener('pointerout', onPointerOut)
  document.documentElement.classList.remove('custom-cursor-enabled', 'custom-cursor-reduced-motion')
})
</script>

<style scoped>
.custom-cursor {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
  mix-blend-mode: normal;
}

.cursor-ring,
.cursor-dot,
.cursor-label,
.cursor-trail {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform, opacity;
}

.cursor-ring {
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  border: 1px solid rgba(182, 156, 255, 0.62);
  border-radius: 50%;
  box-shadow: 0 0 16px rgba(182, 156, 255, 0.15);
  opacity: 0.95;
  transition:
    width 0.18s var(--ease-out),
    height 0.18s var(--ease-out),
    margin 0.18s var(--ease-out),
    border-color 0.18s var(--ease-out),
    border-radius 0.18s var(--ease-out),
    opacity 0.16s var(--ease-out),
    box-shadow 0.18s var(--ease-out);
}

.cursor-dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px rgba(182, 156, 255, 0.88), 0 0 26px rgba(151, 113, 255, 0.32);
  transition:
    width 0.14s var(--ease-out),
    height 0.14s var(--ease-out),
    margin 0.14s var(--ease-out),
    background 0.14s var(--ease-out),
    opacity 0.16s var(--ease-out);
}

.cursor-label {
  min-width: 28px;
  padding: 2px 5px;
  border: 1px solid rgba(234, 255, 87, 0.22);
  border-radius: 2px;
  background: rgba(10, 10, 13, 0.78);
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  opacity: 0;
  transform-origin: left top;
  transition: opacity 0.14s var(--ease-out);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cursor-trail {
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  background: rgba(182, 156, 255, 0.5);
  box-shadow: 0 0 12px rgba(182, 156, 255, 0.28);
  opacity: 0;
}

.has-trail .cursor-trail {
  opacity: 0.5;
}

.cursor-mode-action .cursor-ring,
.cursor-mode-media .cursor-ring {
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border-color: rgba(234, 255, 87, 0.76);
  box-shadow: 0 0 24px rgba(234, 255, 87, 0.18);
}

.cursor-mode-action .cursor-dot,
.cursor-mode-media .cursor-dot {
  background: var(--signal);
  box-shadow: 0 0 10px rgba(234, 255, 87, 0.9), 0 0 24px rgba(234, 255, 87, 0.26);
}

.cursor-mode-view .cursor-ring {
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border-color: rgba(102, 217, 255, 0.72);
  border-radius: 4px;
}

.cursor-mode-view .cursor-dot {
  background: var(--accent-2);
  box-shadow: 0 0 12px rgba(102, 217, 255, 0.72);
}

.cursor-mode-text .cursor-ring {
  width: 2px;
  height: 28px;
  margin: -14px 0 0 -1px;
  border-color: var(--accent);
  border-radius: 1px;
}

.cursor-mode-text .cursor-dot {
  opacity: 0;
}

.cursor-mode-tool .cursor-ring {
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border-color: rgba(234, 255, 87, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(234, 255, 87, 0.12);
}

.cursor-mode-tool .cursor-dot {
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  background: var(--signal);
}

.cursor-cross {
  position: absolute;
  display: none;
  background: var(--signal);
  opacity: 0.68;
}

.cursor-cross-x {
  top: 50%;
  right: -7px;
  left: -7px;
  height: 1px;
}

.cursor-cross-y {
  top: -7px;
  bottom: -7px;
  left: 50%;
  width: 1px;
}

.cursor-mode-tool .cursor-cross {
  display: block;
}

.cursor-mode-action .cursor-label,
.cursor-mode-media .cursor-label,
.cursor-mode-view .cursor-label,
.cursor-mode-tool .cursor-label {
  opacity: 1;
}

.cursor-mode-hero .cursor-ring,
.cursor-mode-hero .cursor-dot,
.cursor-mode-hero .cursor-label,
.is-hidden .cursor-ring,
.is-hidden .cursor-dot,
.is-hidden .cursor-label,
.is-hidden .cursor-trail {
  opacity: 0;
}

.is-pressed .cursor-ring {
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
}

.is-pressed .cursor-dot {
  width: 3px;
  height: 3px;
  margin: -1.5px 0 0 -1.5px;
}

@media (prefers-reduced-motion: reduce) {
  .cursor-ring,
  .cursor-dot,
  .cursor-label,
  .cursor-trail {
    transition: none;
  }

  .cursor-trail {
    display: none;
  }
}
</style>
