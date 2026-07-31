<template>
  <section class="painter-shell" aria-label="ROS2 地图区域绘制器">
    <div class="tool-rail">
      <div class="file-tools tool-group">
        <label class="tool-command primary-command" title="导入 P2 或 P5 格式 PGM 地图">
          <AppIcon icon="upload" size="16" />
          <span>导入 PGM</span>
          <input ref="fileInput" type="file" accept=".pgm,image/x-portable-graymap" @change="onFileInput" />
        </label>
        <button class="icon-command" type="button" title="载入演示地图" @click="loadDemoMap">
          <AppIcon icon="map" size="17" />
        </button>
      </div>

      <div class="segmented" aria-label="绘制模式">
        <button :class="{ active: mode === 'polygon' }" type="button" @click="setMode('polygon')">
          <AppIcon icon="select" size="15" /> 多边形
        </button>
        <button :class="{ active: mode === 'brush' }" type="button" @click="setMode('brush')">
          <AppIcon icon="brush" size="15" /> 画笔
        </button>
      </div>

      <div class="segmented layer-switch" aria-label="掩码图层">
        <button :class="{ active: activeLayer === 'keepout' }" type="button" @click="activeLayer = 'keepout'">
          <i class="swatch keepout"></i> 禁行
        </button>
        <button :class="{ active: activeLayer === 'speed' }" type="button" @click="activeLayer = 'speed'">
          <i class="swatch speed"></i> 限速
        </button>
      </div>

      <label v-if="mode === 'brush'" class="brush-control">
        <span>笔刷</span>
        <input v-model.number="brushSize" type="range" min="1" max="50" step="1" />
        <output>{{ brushSize }} px</output>
      </label>

      <div class="history-tools tool-group">
        <button class="icon-command" type="button" title="撤销" :disabled="!canUndo" @click="undo">
          <AppIcon icon="undo" size="17" />
        </button>
        <button class="icon-command" type="button" title="重做" :disabled="!canRedo" @click="redo">
          <AppIcon icon="redo" size="17" />
        </button>
        <button
          v-if="mode === 'polygon'"
          class="icon-command"
          type="button"
          title="填充当前多边形"
          :disabled="points.length < 3"
          @click="fillCurrentPolygon(1)"
        >
          <AppIcon icon="fill" size="17" />
        </button>
        <button class="icon-command danger-command" type="button" title="清除当前图层" @click="clearActiveLayer">
          <AppIcon icon="trash" size="17" />
        </button>
      </div>

      <div class="view-tools tool-group">
        <button class="icon-command" type="button" title="缩小" @click="zoomAtCenter(1 / 1.25)">
          <AppIcon icon="zoom-out" size="17" />
        </button>
        <button class="zoom-readout" type="button" title="适配地图到画布" @click="fitView">
          {{ Math.round(view.scale * 100) }}%
        </button>
        <button class="icon-command" type="button" title="放大" @click="zoomAtCenter(1.25)">
          <AppIcon icon="zoom-in" size="17" />
        </button>
        <button class="icon-command" type="button" title="显示或隐藏像素网格" :class="{ selected: showGrid }" @click="toggleGrid">
          <AppIcon icon="grid" size="17" />
        </button>
      </div>
    </div>

    <div v-if="notice" class="notice" :class="notice.type" role="status">
      <AppIcon :icon="notice.type === 'error' ? 'bug' : 'target'" size="15" />
      <span>{{ notice.text }}</span>
      <button type="button" aria-label="关闭提示" @click="notice = null">×</button>
    </div>

    <div
      ref="stage"
      class="map-stage"
      :class="[`mode-${mode}`, `layer-${activeLayer}`, { 'is-panning': pointer.action === 'pan' }]"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <canvas
        ref="canvas"
        class="map-canvas"
        tabindex="0"
        aria-label="地图绘制画布"
        @contextmenu.prevent
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerLeave"
        @wheel.prevent="onWheel"
      ></canvas>

      <div class="stage-status top-status" aria-hidden="true">
        <span><i :class="activeLayer"></i>{{ activeLayer === 'keepout' ? 'KEEPOUT' : 'SPEED' }}</span>
        <span>{{ mode.toUpperCase() }}</span>
        <span>{{ mapInfo.width }} × {{ mapInfo.height }}</span>
      </div>
      <div class="stage-status coordinate-status" aria-hidden="true">
        X {{ cursorWorld?.x ?? '--' }} / Y {{ cursorWorld?.y ?? '--' }}
      </div>
      <div v-if="isDraggingFile" class="drop-target">
        <AppIcon icon="upload" size="28" />
        <strong>PGM</strong>
      </div>
    </div>

    <div class="status-strip">
      <div class="map-identity">
        <span>MAP SOURCE</span>
        <strong>{{ fileName }}</strong>
        <small>{{ mapInfo.format }} / {{ mapInfo.maxValue }} LEVEL</small>
      </div>
      <div class="pixel-metrics">
        <span><i class="swatch keepout"></i><strong>{{ formatNumber(maskStats.keepout) }}</strong> 禁行像素</span>
        <span><i class="swatch speed"></i><strong>{{ formatNumber(maskStats.speed) }}</strong> 限速像素</span>
        <span><strong>{{ formatNumber(maskStats.overlap) }}</strong> 重叠</span>
        <span v-if="points.length"><strong>{{ points.length }}</strong> 顶点</span>
      </div>
    </div>

    <div class="export-dock">
      <div class="export-copy">
        <span>ROS2 NAV2 / COSTMAP FILTER</span>
        <strong>双掩码输出</strong>
      </div>
      <div class="export-actions">
        <button class="export-button keepout-export" type="button" @click="exportMask('keepout')">
          <AppIcon icon="download" size="17" />
          <span>keepout_mask.pgm</span>
          <small>BLACK / 0</small>
        </button>
        <button class="export-button speed-export" type="button" @click="exportMask('speed')">
          <AppIcon icon="download" size="17" />
          <span>speed_mask.pgm</span>
          <small>GRAY / 128</small>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, shallowRef } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import {
  buildMaskOutputs,
  createDemoMap,
  encodePgm,
  fillPolygon,
  paintCircle,
  paintLine,
  parsePgm,
} from '@/features/map-zone-painter/lib/pgm.js'

const canvas = ref(null)
const stage = ref(null)
const fileInput = ref(null)
const mapInfo = shallowRef(createDemoMap())
const keepMask = shallowRef(new Uint8Array(mapInfo.value.width * mapInfo.value.height))
const speedMask = shallowRef(new Uint8Array(mapInfo.value.width * mapInfo.value.height))
const fileName = ref('demo_warehouse.pgm')
const mode = ref('polygon')
const activeLayer = ref('keepout')
const brushSize = ref(8)
const points = reactive([])
const selectedPoint = ref(-1)
const showGrid = ref(false)
const cursorWorld = ref(null)
const notice = ref(null)
const isDraggingFile = ref(false)
const revision = ref(0)
const history = reactive([])
const future = reactive([])
const view = reactive({ scale: 1, offsetX: 0, offsetY: 0, width: 900, height: 600, dpr: 1 })
const pointer = reactive({ action: '', id: null, lastScreen: null, lastWorld: null, before: null })

const canUndo = computed(() => points.length > 0 || history.length > 0)
const canRedo = computed(() => future.length > 0)
const activeMask = computed(() => activeLayer.value === 'keepout' ? keepMask.value : speedMask.value)
const maskStats = computed(() => {
  revision.value
  let keepout = 0
  let speed = 0
  let overlap = 0
  for (let index = 0; index < keepMask.value.length; index += 1) {
    if (keepMask.value[index]) keepout += 1
    if (speedMask.value[index]) speed += 1
    if (keepMask.value[index] && speedMask.value[index]) overlap += 1
  }
  return { keepout, speed, overlap }
})

let resizeObserver
let baseCanvas
let previewCanvas
let previewRevision = -1
let renderFrame = 0
let noticeTimer = 0
let spacePressed = false

function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function showNotice(text, type = 'success') {
  notice.value = { text, type }
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = null }, 3200)
}

function createSnapshot() {
  return { keepout: keepMask.value.slice(), speed: speedMask.value.slice() }
}

function restoreSnapshot(snapshot) {
  keepMask.value = snapshot.keepout.slice()
  speedMask.value = snapshot.speed.slice()
  revision.value += 1
  previewRevision = -1
  scheduleRender()
}

function commitSnapshot(snapshot) {
  history.push(snapshot)
  if (history.length > 24) history.shift()
  future.splice(0)
  revision.value += 1
  previewRevision = -1
  scheduleRender()
}

function undo() {
  if (points.length) {
    points.pop()
    selectedPoint.value = Math.min(selectedPoint.value, points.length - 1)
    scheduleRender()
    return
  }
  const snapshot = history.pop()
  if (!snapshot) return
  future.push(createSnapshot())
  restoreSnapshot(snapshot)
}

function redo() {
  const snapshot = future.pop()
  if (!snapshot) return
  history.push(createSnapshot())
  restoreSnapshot(snapshot)
}

function resetPolygon() {
  points.splice(0)
  selectedPoint.value = -1
  scheduleRender()
}

function setMode(nextMode) {
  mode.value = nextMode
  pointer.action = ''
  selectedPoint.value = -1
  scheduleRender()
}

function clearActiveLayer() {
  const mask = activeMask.value
  if (!mask.some(Boolean)) {
    resetPolygon()
    return
  }
  const before = createSnapshot()
  mask.fill(0)
  resetPolygon()
  commitSnapshot(before)
  showNotice(`${activeLayer.value === 'keepout' ? '禁行' : '限速'}图层已清空`)
}

function fillCurrentPolygon(value = 1) {
  if (points.length < 3) return
  const before = createSnapshot()
  fillPolygon(activeMask.value, mapInfo.value.width, mapInfo.value.height, points, value)
  resetPolygon()
  commitSnapshot(before)
}

function clearPolygonArea() {
  if (points.length < 3) return
  fillCurrentPolygon(0)
}

function buildBaseCanvas() {
  baseCanvas = document.createElement('canvas')
  baseCanvas.width = mapInfo.value.width
  baseCanvas.height = mapInfo.value.height
  const context = baseCanvas.getContext('2d')
  const image = context.createImageData(mapInfo.value.width, mapInfo.value.height)
  for (let index = 0; index < mapInfo.value.pixels.length; index += 1) {
    const value = mapInfo.value.pixels[index]
    const offset = index * 4
    image.data[offset] = value
    image.data[offset + 1] = value
    image.data[offset + 2] = value
    image.data[offset + 3] = 255
  }
  context.putImageData(image, 0, 0)
  previewCanvas = document.createElement('canvas')
  previewCanvas.width = mapInfo.value.width
  previewCanvas.height = mapInfo.value.height
  previewRevision = -1
}

function refreshPreview() {
  if (previewRevision === revision.value) return
  const context = previewCanvas.getContext('2d')
  context.drawImage(baseCanvas, 0, 0)
  const image = context.getImageData(0, 0, mapInfo.value.width, mapInfo.value.height)
  for (let index = 0; index < mapInfo.value.pixels.length; index += 1) {
    const offset = index * 4
    if (speedMask.value[index]) {
      image.data[offset] = 48
      image.data[offset + 1] = 174
      image.data[offset + 2] = 222
    }
    if (keepMask.value[index]) {
      image.data[offset] = 230
      image.data[offset + 1] = 71
      image.data[offset + 2] = 93
    }
  }
  context.putImageData(image, 0, 0)
  previewRevision = revision.value
}

function scheduleRender() {
  if (renderFrame) return
  renderFrame = window.requestAnimationFrame(() => {
    renderFrame = 0
    drawCanvas()
  })
}

function drawCanvas() {
  if (!canvas.value || !previewCanvas) return
  refreshPreview()
  const context = canvas.value.getContext('2d')
  context.setTransform(view.dpr, 0, 0, view.dpr, 0, 0)
  context.clearRect(0, 0, view.width, view.height)
  context.fillStyle = '#0a0a0d'
  context.fillRect(0, 0, view.width, view.height)

  context.save()
  context.translate(view.offsetX, view.offsetY)
  context.scale(view.scale, view.scale)
  context.imageSmoothingEnabled = false
  context.drawImage(previewCanvas, 0, 0)

  if (showGrid.value && view.scale >= 4) {
    context.lineWidth = 1 / view.scale
    context.strokeStyle = 'rgba(234, 255, 87, 0.18)'
    context.beginPath()
    for (let x = 0; x <= mapInfo.value.width; x += 1) {
      context.moveTo(x, 0)
      context.lineTo(x, mapInfo.value.height)
    }
    for (let y = 0; y <= mapInfo.value.height; y += 1) {
      context.moveTo(0, y)
      context.lineTo(mapInfo.value.width, y)
    }
    context.stroke()
  }
  context.restore()

  if (mode.value === 'polygon' && points.length) drawPolygon(context)
}

function drawPolygon(context) {
  const color = activeLayer.value === 'keepout' ? '#ff6b7d' : '#66d9ff'
  context.save()
  context.lineWidth = 2
  context.strokeStyle = color
  context.fillStyle = color
  context.shadowColor = color
  context.shadowBlur = 8
  context.beginPath()
  points.forEach((point, index) => {
    const screen = worldToScreen(point)
    if (index === 0) context.moveTo(screen.x, screen.y)
    else context.lineTo(screen.x, screen.y)
  })
  if (points.length > 2) context.closePath()
  context.stroke()
  context.shadowBlur = 0
  points.forEach((point, index) => {
    const screen = worldToScreen(point)
    context.beginPath()
    context.arc(screen.x, screen.y, index === selectedPoint.value ? 7 : 5, 0, Math.PI * 2)
    context.fillStyle = index === selectedPoint.value ? '#eaff57' : color
    context.fill()
    context.lineWidth = 2
    context.strokeStyle = '#0b0b0e'
    context.stroke()
  })
  context.restore()
}

function fitView() {
  const padding = Math.min(42, view.width * 0.06)
  view.scale = Math.max(0.05, Math.min(20,
    Math.min(
      (view.width - padding * 2) / mapInfo.value.width,
      (view.height - padding * 2) / mapInfo.value.height,
    ),
  ))
  view.offsetX = (view.width - mapInfo.value.width * view.scale) / 2
  view.offsetY = (view.height - mapInfo.value.height * view.scale) / 2
  scheduleRender()
}

function zoomAt(screenX, screenY, factor) {
  const nextScale = Math.max(0.05, Math.min(20, view.scale * factor))
  const worldX = (screenX - view.offsetX) / view.scale
  const worldY = (screenY - view.offsetY) / view.scale
  view.offsetX = screenX - worldX * nextScale
  view.offsetY = screenY - worldY * nextScale
  view.scale = nextScale
  scheduleRender()
}

function zoomAtCenter(factor) {
  zoomAt(view.width / 2, view.height / 2, factor)
}

function toggleGrid() {
  showGrid.value = !showGrid.value
  scheduleRender()
}

function screenFromEvent(event) {
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (view.width / rect.width),
    y: (event.clientY - rect.top) * (view.height / rect.height),
  }
}

function screenToWorld(screen, clamp = false) {
  const point = {
    x: Math.round((screen.x - view.offsetX) / view.scale),
    y: Math.round((screen.y - view.offsetY) / view.scale),
  }
  if (clamp) {
    point.x = Math.max(0, Math.min(mapInfo.value.width - 1, point.x))
    point.y = Math.max(0, Math.min(mapInfo.value.height - 1, point.y))
  }
  return point
}

function worldToScreen(point) {
  return { x: point.x * view.scale + view.offsetX, y: point.y * view.scale + view.offsetY }
}

function isInsideMap(point) {
  return point.x >= 0 && point.y >= 0 && point.x < mapInfo.value.width && point.y < mapInfo.value.height
}

function nearestPoint(screen) {
  let result = -1
  let nearestDistance = 11
  points.forEach((point, index) => {
    const candidate = worldToScreen(point)
    const distance = Math.hypot(candidate.x - screen.x, candidate.y - screen.y)
    if (distance < nearestDistance) {
      nearestDistance = distance
      result = index
    }
  })
  return result
}

function onPointerDown(event) {
  if (!canvas.value) return
  event.preventDefault()
  canvas.value.focus({ preventScroll: true })
  canvas.value.setPointerCapture(event.pointerId)
  const screen = screenFromEvent(event)
  const world = screenToWorld(screen)
  pointer.id = event.pointerId
  pointer.lastScreen = screen
  pointer.lastWorld = world

  const wantsPan = event.button === 1 || (spacePressed && event.button === 0)
    || (mode.value === 'polygon' && event.button === 2)
  if (wantsPan) {
    pointer.action = 'pan'
    return
  }

  if (mode.value === 'brush' && (event.button === 0 || event.button === 2)) {
    if (!isInsideMap(world)) return
    pointer.action = event.button === 2 ? 'erase' : 'paint'
    pointer.before = createSnapshot()
    paintCircle(
      activeMask.value,
      mapInfo.value.width,
      mapInfo.value.height,
      world.x,
      world.y,
      brushSize.value,
      event.button === 2 ? 0 : 1,
    )
    previewRevision = -1
    scheduleRender()
    return
  }

  if (mode.value === 'polygon' && event.button === 0) {
    const index = nearestPoint(screen)
    if (index >= 0) {
      selectedPoint.value = index
      pointer.action = 'move-point'
    } else if (isInsideMap(world)) {
      points.push(world)
      selectedPoint.value = points.length - 1
      pointer.action = 'new-point'
      scheduleRender()
    }
  }
}

function onPointerMove(event) {
  const screen = screenFromEvent(event)
  const world = screenToWorld(screen)
  cursorWorld.value = isInsideMap(world) ? world : null
  if (pointer.id !== event.pointerId || !pointer.action) return

  if (pointer.action === 'pan') {
    view.offsetX += screen.x - pointer.lastScreen.x
    view.offsetY += screen.y - pointer.lastScreen.y
  } else if (pointer.action === 'move-point' && selectedPoint.value >= 0) {
    points[selectedPoint.value] = screenToWorld(screen, true)
  } else if (pointer.action === 'paint' || pointer.action === 'erase') {
    const target = screenToWorld(screen, true)
    paintLine(
      activeMask.value,
      mapInfo.value.width,
      mapInfo.value.height,
      pointer.lastWorld,
      target,
      brushSize.value,
      pointer.action === 'erase' ? 0 : 1,
    )
    pointer.lastWorld = target
    previewRevision = -1
  }
  pointer.lastScreen = screen
  scheduleRender()
}

function onPointerUp(event) {
  if (pointer.id !== event.pointerId) return
  if ((pointer.action === 'paint' || pointer.action === 'erase') && pointer.before) {
    commitSnapshot(pointer.before)
  }
  pointer.action = ''
  pointer.id = null
  pointer.before = null
  pointer.lastScreen = null
  pointer.lastWorld = null
  if (canvas.value?.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
}

function onPointerLeave() {
  cursorWorld.value = null
}

function onWheel(event) {
  const screen = screenFromEvent(event)
  zoomAt(screen.x, screen.y, event.deltaY < 0 ? 1.25 : 1 / 1.25)
}

async function loadMap(nextMap, nextName) {
  mapInfo.value = nextMap
  fileName.value = nextName
  keepMask.value = new Uint8Array(nextMap.width * nextMap.height)
  speedMask.value = new Uint8Array(nextMap.width * nextMap.height)
  history.splice(0)
  future.splice(0)
  resetPolygon()
  revision.value += 1
  await nextTick()
  buildBaseCanvas()
  fitView()
}

async function loadFile(file) {
  if (!file) return
  try {
    const parsed = parsePgm(await file.arrayBuffer())
    await loadMap(parsed, file.name)
    showNotice(`已载入 ${parsed.width} × ${parsed.height} 地图`)
  } catch (error) {
    showNotice(error.message || 'PGM 文件读取失败', 'error')
  }
}

function onFileInput(event) {
  loadFile(event.target.files?.[0])
  event.target.value = ''
}

function onDrop(event) {
  isDraggingFile.value = false
  loadFile(event.dataTransfer?.files?.[0])
}

function loadDemoMap() {
  loadMap(createDemoMap(), 'demo_warehouse.pgm')
  showNotice('演示地图已重置')
}

function downloadBytes(bytes, outputName) {
  const blob = new Blob([bytes], { type: 'image/x-portable-graymap' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = outputName
  anchor.click()
  URL.revokeObjectURL(url)
}

function exportMask(type) {
  const output = buildMaskOutputs(mapInfo.value.pixels, keepMask.value, speedMask.value)
  const baseName = fileName.value.replace(/\.pgm$/i, '').replace(/[^\w.-]+/g, '_') || 'map'
  const pixels = type === 'keepout' ? output.keepout : output.speed
  const outputName = `${baseName}_${type === 'keepout' ? 'keepout_mask' : 'speed_mask'}.pgm`
  downloadBytes(
    encodePgm(
      mapInfo.value.width,
      mapInfo.value.height,
      pixels,
      'Adapted from Adilnasceng/ros2-map-zone-painter (MIT)',
    ),
    outputName,
  )
  showNotice(`${outputName} 已生成`)
}

function onKeyDown(event) {
  if (event.target instanceof HTMLInputElement) return
  if (event.code === 'Space') {
    spacePressed = true
    event.preventDefault()
    return
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault()
    if (event.shiftKey) redo()
    else undo()
    return
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
    event.preventDefault()
    redo()
    return
  }

  const key = event.key.toLowerCase()
  if (key === 'b') setMode(mode.value === 'brush' ? 'polygon' : 'brush')
  else if (key === 'k') activeLayer.value = 'keepout'
  else if (key === 'g') activeLayer.value = 'speed'
  else if (key === 'u') undo()
  else if (key === 'c') mode.value === 'polygon' && points.length >= 3 ? clearPolygonArea() : clearActiveLayer()
  else if (key === 'r' || key === 'escape') resetPolygon()
  else if (event.key === 'Enter') fillCurrentPolygon(1)
  else if (['+', '=', ']'].includes(event.key)) zoomAtCenter(1.25)
  else if (['-', '_', '['].includes(event.key)) zoomAtCenter(1 / 1.25)
}

function onKeyUp(event) {
  if (event.code === 'Space') spacePressed = false
}

function resizeCanvas() {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  view.width = Math.max(320, rect.width)
  view.height = Math.max(360, rect.height)
  view.dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.value.width = Math.round(view.width * view.dpr)
  canvas.value.height = Math.round(view.height * view.dpr)
  fitView()
}

onMounted(() => {
  buildBaseCanvas()
  resizeObserver = new ResizeObserver(resizeCanvas)
  resizeObserver.observe(canvas.value)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  stage.value.addEventListener('dragenter', () => { isDraggingFile.value = true })
  stage.value.addEventListener('dragleave', event => {
    if (!stage.value.contains(event.relatedTarget)) isDraggingFile.value = false
  })
  resizeCanvas()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.clearTimeout(noticeTimer)
  if (renderFrame) window.cancelAnimationFrame(renderFrame)
})
</script>

<style scoped>
.painter-shell {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(14, 14, 18, 0.94);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.34);
}

.tool-rail {
  display: flex;
  min-height: 68px;
  padding: 12px 14px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  background: #121217;
}

.tool-group,
.segmented {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.file-tools,
.history-tools,
.view-tools {
  padding-right: 10px;
  border-right: 1px solid var(--border);
}

.tool-command,
.icon-command,
.segmented button,
.zoom-readout {
  display: inline-flex;
  min-width: 38px;
  min-height: 38px;
  padding: 0 10px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: #19191f;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: 0.2s ease;
}

.tool-command:hover,
.icon-command:hover,
.segmented button:hover,
.zoom-readout:hover,
.icon-command.selected {
  border-color: var(--border-hover);
  color: var(--text-primary);
  background: #23212a;
}

.icon-command:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.primary-command {
  border-color: rgba(234, 255, 87, 0.56);
  background: var(--signal);
  color: #0b0b0e;
  font-weight: 800;
}

.primary-command:hover { background: #f1ff8c; color: #0b0b0e; }
.primary-command input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.danger-command:hover { border-color: rgba(255, 107, 125, 0.62); color: #ff6b7d; }

.segmented { padding: 3px; border: 1px solid var(--border); border-radius: 4px; background: #0d0d11; }
.segmented button { min-height: 32px; border-color: transparent; background: transparent; }
.segmented button.active { border-color: rgba(182, 156, 255, 0.4); background: var(--accent-muted); color: #d8ccff; }
.layer-switch button.active:first-child { border-color: rgba(255, 107, 125, 0.48); color: #ff8a99; }
.layer-switch button.active:last-child { border-color: rgba(102, 217, 255, 0.48); color: #87e3ff; }

.swatch { display: inline-block; width: 8px; height: 8px; border-radius: 1px; }
.swatch.keepout { background: #e6475d; box-shadow: 0 0 8px rgba(230, 71, 93, 0.45); }
.swatch.speed { background: #30aede; box-shadow: 0 0 8px rgba(48, 174, 222, 0.45); }

.brush-control {
  display: grid;
  min-width: 150px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
}
.brush-control input { width: 100%; accent-color: var(--signal); }
.brush-control output { width: 34px; color: var(--text-secondary); }
.view-tools { margin-left: auto; padding-right: 0; border-right: 0; }
.zoom-readout { min-width: 54px; color: var(--signal); }

.notice {
  display: flex;
  min-height: 38px;
  padding: 8px 14px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(234, 255, 87, 0.22);
  background: rgba(234, 255, 87, 0.08);
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 11px;
}
.notice.error { border-color: rgba(255, 107, 125, 0.26); background: rgba(255, 107, 125, 0.09); color: #ff8a99; }
.notice button { margin-left: auto; border: 0; background: none; color: currentColor; cursor: pointer; font-size: 18px; }

.map-stage { position: relative; overflow: hidden; background: #09090c; }
.map-stage::before {
  position: absolute;
  inset: 0;
  z-index: 1;
  content: '';
  pointer-events: none;
  background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 36px 36px;
}
.map-canvas { display: block; width: 100%; height: clamp(460px, 62vh, 720px); outline: none; touch-action: none; cursor: crosshair; }
.mode-brush .map-canvas { cursor: url('/game-icon-pack-main/svg/no-padding/10-editing/brush.svg') 4 28, crosshair; }
.map-stage.is-panning .map-canvas { cursor: grabbing; }
.map-canvas:focus-visible { box-shadow: inset 0 0 0 2px rgba(234, 255, 87, 0.45); }

.stage-status {
  position: absolute;
  z-index: 2;
  display: flex;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 9px;
}
.top-status { top: 14px; left: 14px; gap: 1px; }
.top-status span { display: flex; padding: 5px 8px; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.12); background: rgba(9,9,12,0.82); color: var(--text-secondary); }
.top-status i { width: 6px; height: 6px; background: #e6475d; }
.top-status i.speed { background: #30aede; }
.coordinate-status { right: 14px; bottom: 14px; padding: 5px 8px; border: 1px solid rgba(255,255,255,0.12); background: rgba(9,9,12,0.82); color: var(--signal); }
.drop-target { position: absolute; inset: 20px; z-index: 4; display: flex; align-items: center; justify-content: center; gap: 12px; border: 2px dashed var(--signal); background: rgba(11,11,14,0.86); color: var(--signal); }

.status-strip {
  display: flex;
  min-height: 64px;
  padding: 11px 16px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid var(--border);
  background: #111116;
}
.map-identity { display: grid; grid-template-columns: auto auto; align-items: center; gap: 0 10px; }
.map-identity span, .map-identity small { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.map-identity strong { overflow: hidden; max-width: 260px; color: var(--text-primary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.map-identity small { grid-column: 2; }
.pixel-metrics { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px 16px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 9px; }
.pixel-metrics span { display: inline-flex; align-items: center; gap: 5px; }
.pixel-metrics strong { color: var(--text-primary); font-size: 11px; }

.export-dock { display: flex; min-height: 86px; padding: 14px 16px; align-items: center; justify-content: space-between; gap: 18px; border-top: 1px solid var(--border); background: #17171d; }
.export-copy { display: flex; flex-direction: column; }
.export-copy span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.export-copy strong { margin-top: 3px; font-size: 15px; }
.export-actions { display: flex; gap: 8px; }
.export-button { display: grid; min-width: 196px; min-height: 52px; padding: 8px 12px; grid-template-columns: 22px 1fr; align-items: center; border: 1px solid var(--border); border-radius: 3px; background: #0e0e12; color: var(--text-primary); text-align: left; cursor: pointer; transition: 0.2s ease; }
.export-button :deep(.app-icon) { grid-row: 1 / 3; }
.export-button span { font-family: var(--font-mono); font-size: 10px; }
.export-button small { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.keepout-export:hover { border-color: rgba(255, 107, 125, 0.6); color: #ff8a99; }
.speed-export:hover { border-color: rgba(102, 217, 255, 0.6); color: #87e3ff; }

@media (max-width: 1100px) {
  .tool-rail { flex-wrap: wrap; }
  .view-tools { margin-left: 0; }
  .map-canvas { height: clamp(440px, 58vh, 620px); }
}

@media (max-width: 720px) {
  .tool-rail {
    display: grid;
    padding: 10px;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 7px;
  }
  .file-tools, .history-tools, .view-tools { padding-right: 0; border-right: 0; }
  .file-tools, .brush-control, .history-tools, .view-tools { grid-column: 1 / -1; }
  .file-tools { display: grid; width: 100%; grid-template-columns: 1fr 40px; }
  .primary-command { flex: 1; }
  .segmented { width: 100%; min-width: 0; }
  .segmented button { flex: 1; padding-inline: 7px; }
  .history-tools, .view-tools { width: 100%; justify-content: flex-start; }
  .history-tools .danger-command { margin-left: auto; }
  .view-tools .icon-command:last-child { margin-left: auto; }
  .brush-control { width: 100%; }
  .map-canvas { height: 450px; }
  .status-strip, .export-dock { align-items: stretch; flex-direction: column; }
  .pixel-metrics { justify-content: flex-start; }
  .export-actions { display: grid; grid-template-columns: 1fr; }
  .export-button { width: 100%; min-width: 0; }
  .top-status span:nth-child(3) { display: none; }
}
</style>
