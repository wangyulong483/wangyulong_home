<template>
  <div class="number-line-lab">
    <div class="preset-row">
      <span>典型算式</span>
      <button v-for="preset in presets" :key="preset.label" :class="{ active: isPresetActive(preset) }" @click="applyPreset(preset)">{{ preset.label }}</button>
    </div>
    <div class="context-row">
      <span>情境</span>
      <button v-for="item in contexts" :key="item.id" :class="{ active: context === item.id }" @click="context = item.id">{{ item.label }}</button>
      <p>{{ contextSentence }}</p>
    </div>
    <div class="lab-controls">
      <div class="segmented" aria-label="选择加法或减法">
        <button :class="{ active: operation === 'add' }" @click="operation = 'add'">加法</button>
        <button :class="{ active: operation === 'subtract' }" @click="operation = 'subtract'">减法</button>
      </div>
      <label>
        <span>第一个数 <strong>{{ formatValue(first) }}</strong></span>
        <input v-model.number="first" type="range" min="-5" max="5" step="0.25" />
      </label>
      <label>
        <span>{{ operation === 'add' ? '加数' : '减数' }} <strong>{{ formatValue(second) }}</strong></span>
        <input v-model.number="second" type="range" min="-5" max="5" step="0.25" />
      </label>
    </div>

    <div class="equation" aria-live="polite">
      <span>{{ formatTerm(first) }}</span>
      <b>{{ operation === 'add' ? '+' : '−' }}</b>
      <span>{{ formatTerm(second) }}</span>
      <b>=</b>
      <strong>{{ formatValue(result) }}</strong>
    </div>
    <div v-if="operation === 'subtract'" class="transform-line">
      <span>减法转化</span>
      <strong>{{ formatTerm(first) }} − {{ formatTerm(second) }} = {{ formatTerm(first) }} + {{ formatTerm(-second) }}</strong>
    </div>

    <svg class="number-line" viewBox="0 0 760 220" role="img" :aria-label="numberLineDescription">
      <defs>
        <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#43c8ff" />
        </marker>
        <marker id="arrow-signal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#eaff57" />
        </marker>
      </defs>

      <line x1="44" y1="142" x2="716" y2="142" class="axis" />
      <g v-for="tick in ticks" :key="tick">
        <line :x1="toX(tick)" y1="136" :x2="toX(tick)" y2="148" :class="['tick', { major: tick % 5 === 0 }]" />
        <text v-if="tick % 5 === 0" :x="toX(tick)" y="169" text-anchor="middle">{{ tick }}</text>
      </g>

      <path :d="firstArc" class="arc first-arc" marker-end="url(#arrow-cyan)" />
      <path :d="secondArc" class="arc second-arc" marker-end="url(#arrow-signal)" />
      <circle :cx="toX(first)" cy="142" r="7" class="point first-point" />
      <circle :cx="toX(result)" cy="142" r="8" class="point result-point" />
      <text :x="toX(first)" y="201" text-anchor="middle" class="point-label first-label">起点 {{ formatValue(first) }}</text>
      <text :x="toX(result)" y="116" text-anchor="middle" class="point-label result-label">结果 {{ formatValue(result) }}</text>
    </svg>

    <div class="reasoning-strip">
      <span><i class="cyan"></i>先从 0 走到 {{ formatValue(first) }}</span>
      <span><i class="signal"></i>{{ movementSentence }}</span>
      <strong>{{ ruleSentence }}</strong>
    </div>
    <div class="legend-row">
      <span><i class="origin"></i>0 到起点</span>
      <span><i class="movement"></i>实际位移</span>
      <span><i class="destination"></i>最终位置</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatRational } from '../lib/rational.js'

const operation = ref('add')
const first = ref(-1.5)
const second = ref(2.25)
const displayMode = ref('decimal')
const context = ref('temperature')
const presets = [
  { label: '−1.5 + 2.25', operation: 'add', first: -1.5, second: 2.25, mode: 'decimal' },
  { label: '3/4 + (−5/4)', operation: 'add', first: 0.75, second: -1.25, mode: 'fraction' },
  { label: '−2.5 − 1.75', operation: 'subtract', first: -2.5, second: 1.75, mode: 'decimal' },
  { label: '5/2 − (−3/4)', operation: 'subtract', first: 2.5, second: -0.75, mode: 'fraction' },
]
const contexts = [
  { id: 'temperature', label: '温度升降' },
  { id: 'altitude', label: '海拔变化' },
  { id: 'balance', label: '收支变化' },
]
const ticks = Array.from({ length: 41 }, (_, index) => -10 + index * 0.5)
const result = computed(() => Number((operation.value === 'add' ? first.value + second.value : first.value - second.value).toFixed(10)))
const displacement = computed(() => operation.value === 'add' ? second.value : -second.value)
const contextSentence = computed(() => {
  const move = displacement.value
  if (context.value === 'altitude') return `起点海拔 ${formatValue(first.value)} m，${move >= 0 ? '上升' : '下降'} ${formatValue(Math.abs(move))} m，到达 ${formatValue(result.value)} m。`
  if (context.value === 'balance') return `当前结余 ${formatValue(first.value)} 元，发生 ${move >= 0 ? '收入' : '支出'} ${formatValue(Math.abs(move))} 元，结余变为 ${formatValue(result.value)} 元。`
  return `当前温度 ${formatValue(first.value)}℃，${move >= 0 ? '升高' : '降低'} ${formatValue(Math.abs(move))}℃，变为 ${formatValue(result.value)}℃。`
})

function applyPreset(preset) {
  operation.value = preset.operation
  first.value = preset.first
  second.value = preset.second
  displayMode.value = preset.mode
}

function isPresetActive(preset) {
  return operation.value === preset.operation && first.value === preset.first && second.value === preset.second
}

function toX(value) {
  return 44 + ((value + 10) / 20) * 672
}

function arcPath(start, end, height) {
  const x1 = toX(start)
  const x2 = toX(end)
  const middle = (x1 + x2) / 2
  return `M ${x1} 136 Q ${middle} ${height} ${x2} 136`
}

function formatTerm(value) {
  const text = formatValue(value)
  return value < 0 ? `(${text})` : text
}

function formatValue(value) {
  return displayMode.value === 'fraction' ? formatRational(value, 1) : String(Number(value.toFixed(10)))
}

const firstArc = computed(() => arcPath(0, first.value, 70))
const secondArc = computed(() => arcPath(first.value, result.value, 34))
const movementSentence = computed(() => {
  const direction = displacement.value >= 0 ? '向右' : '向左'
  return `${direction}移动 ${formatValue(Math.abs(displacement.value))} 个单位`
})
const ruleSentence = computed(() => operation.value === 'add'
  ? `加上 ${formatValue(second.value)}，就是${second.value >= 0 ? '向右' : '向左'}移动。`
  : `减去 ${formatValue(second.value)}，等于加上 ${formatValue(-second.value)}。`)
const numberLineDescription = computed(() => `${formatValue(first.value)} ${operation.value === 'add' ? '加' : '减'} ${formatValue(second.value)} 等于 ${formatValue(result.value)}。${movementSentence.value}。`)
</script>

<style scoped>
.number-line-lab { min-width: 0; }
.preset-row, .context-row { display: flex; min-height: 42px; padding: 7px 0; align-items: center; flex-wrap: wrap; gap: 6px; border-bottom: 1px solid var(--border); }
.preset-row > span, .context-row > span { width: 58px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.preset-row button, .context-row button { min-height: 28px; padding: 0 9px; border: 1px solid var(--border); border-radius: 3px; background: transparent; color: var(--text-secondary); cursor: pointer; font-family: var(--font-mono); font-size: 9px; }
.preset-row button.active, .context-row button.active { border-color: var(--signal); background: var(--signal-muted); color: var(--signal); }
.context-row p { margin-left: auto; color: var(--text-secondary); font-size: 9px; }
.lab-controls { display: grid; grid-template-columns: auto 1fr 1fr; align-items: end; gap: 18px; }
.lab-controls { padding-top: 17px; }
.segmented { display: inline-grid; grid-template-columns: repeat(2,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.segmented button { min-width: 64px; min-height: 36px; border: 0; border-right: 1px solid var(--border); background: transparent; color: var(--text-tertiary); cursor: pointer; font-family: var(--font-mono); font-size: 10px; }
.segmented button:last-child { border-right: 0; }
.segmented button.active { background: var(--signal); color: #0b0b0e; font-weight: 800; }
.lab-controls label { display: grid; gap: 8px; color: var(--text-secondary); font-size: 11px; }
.lab-controls label span { display: flex; justify-content: space-between; }
.lab-controls label strong { color: var(--signal); font-family: var(--font-mono); }
input[type='range'] { width: 100%; accent-color: var(--signal); }
.equation { display: flex; min-height: 64px; margin-top: 22px; align-items: baseline; justify-content: center; gap: 15px; color: var(--text-primary); font-family: var(--font-mono); font-size: clamp(24px,4vw,38px); }
.equation b { color: var(--text-tertiary); font-weight: 400; }
.equation strong { color: var(--signal); font-size: 1.35em; }
.transform-line { display: flex; min-height: 34px; margin: -7px 0 8px; align-items: center; justify-content: center; gap: 10px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
.transform-line span { color: #72d7ff; font-size: 8px; }
.transform-line strong { color: var(--text-primary); }
.number-line { display: block; width: 100%; height: auto; min-height: 210px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: rgba(255,255,255,.015); }
.axis { stroke: rgba(255,255,255,.38); stroke-width: 2; }
.tick { stroke: rgba(255,255,255,.22); stroke-width: 1; }
.tick.major { stroke: rgba(255,255,255,.5); stroke-width: 2; }
text { fill: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }
.arc { fill: none; stroke-width: 3; }
.first-arc { stroke: #43c8ff; }
.second-arc { stroke: var(--signal); }
.point { stroke-width: 3; }
.first-point { fill: #0c161b; stroke: #43c8ff; }
.result-point { fill: #11140b; stroke: var(--signal); }
.point-label { font-size: 11px; font-weight: 700; }
.first-label { fill: #70d5ff; }
.result-label { fill: var(--signal); }
.reasoning-strip { display: flex; padding-top: 14px; flex-wrap: wrap; align-items: center; gap: 10px 20px; color: var(--text-secondary); font-size: 11px; }
.reasoning-strip span { display: inline-flex; align-items: center; gap: 6px; }
.reasoning-strip i { width: 8px; height: 8px; border-radius: 50%; }
.reasoning-strip .cyan { background: #43c8ff; }
.reasoning-strip .signal { background: var(--signal); }
.reasoning-strip strong { margin-left: auto; color: var(--text-primary); font-size: 11px; }
.legend-row { display: flex; margin-top: 10px; flex-wrap: wrap; gap: 14px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.legend-row span { display: inline-flex; align-items: center; gap: 5px; }
.legend-row i { width: 14px; height: 3px; }
.legend-row .origin { background: #43c8ff; }
.legend-row .movement { background: var(--signal); }
.legend-row .destination { width: 8px; height: 8px; border: 2px solid var(--signal); border-radius: 50%; }
@media (max-width: 720px) {
  .lab-controls { grid-template-columns: 1fr; align-items: stretch; }
  .number-line { min-height: 170px; }
  .reasoning-strip strong { width: 100%; margin-left: 0; }
  .context-row p { width: 100%; margin-left: 64px; line-height: 1.5; }
}
</style>
