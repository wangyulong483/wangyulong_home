<template>
  <div class="power-lab">
    <div class="power-controls">
      <label>
        <span>底数 <strong>{{ base }}</strong></span>
        <input v-model.number="base" type="range" min="-5" max="5" />
      </label>
      <label>
        <span>指数 <strong>{{ exponent }}</strong></span>
        <input v-model.number="exponent" type="range" min="0" max="5" />
      </label>
      <label class="group-toggle">
        <input v-model="grouped" type="checkbox" />
        <span>负数底数带括号</span>
      </label>
    </div>

    <div class="power-equation" aria-live="polite">
      <span>{{ expression }}</span>
      <b>=</b>
      <strong>{{ value }}</strong>
    </div>
    <div class="base-scope">
      <span>底数范围</span>
      <strong>{{ baseScope }}</strong>
      <p>{{ base < 0 && !grouped ? '负号位于乘方外，不参与重复相乘。' : '括号内的数整体作为底数参与重复相乘。' }}</p>
    </div>
    <div class="factor-chain">
      <template v-for="(factor, index) in factors" :key="`${factor}-${index}`">
        <span>{{ factor }}</span>
        <b v-if="index < factors.length - 1">×</b>
      </template>
    </div>

    <div class="power-insight">
      <div>
        <span>底数</span>
        <strong>{{ grouped || base >= 0 ? base : Math.abs(base) }}</strong>
        <p>重复相乘的数</p>
      </div>
      <div>
        <span>指数</span>
        <strong>{{ exponent }}</strong>
        <p>相同因数的个数</p>
      </div>
      <div class="insight-rule">
        <span>本题判断</span>
        <strong>{{ insight }}</strong>
        <p>{{ explanation }}</p>
      </div>
    </div>

    <div class="parity-heading">
      <span>(−2)ⁿ 的奇偶规律</span>
      <p>依次切换 n = 1 至 5，可见结果符号随指数奇偶交替变化。</p>
    </div>
    <div class="parity-strip">
      <button v-for="item in parityCases" :key="item.exponent" :class="{ active: base === -2 && grouped && exponent === item.exponent }" @click="applyParity(item.exponent)">
        <span>n = {{ item.exponent }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.exponent % 2 ? '奇次 · 负' : '偶次 · 正' }}</small>
      </button>
    </div>

    <div class="comparison">
      <div><span>负号不属于底数</span><strong>−2⁴ = −16</strong><p>重复因数是 2、2、2、2，最后取相反数。</p></div>
      <div><span>负号属于底数</span><strong>(−2)⁴ = 16</strong><p>重复因数是 (−2)、(−2)、(−2)、(−2)。</p></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { powerFactors, powerValue } from '../lib/rational.js'

const base = ref(-2)
const exponent = ref(4)
const grouped = ref(true)
const parityCases = [1, 2, 3, 4, 5].map(value => ({ exponent: value, value: (-2) ** value }))

watch(base, value => {
  if (value >= 0) grouped.value = true
})

const value = computed(() => powerValue(base.value, exponent.value, grouped.value))
const factors = computed(() => powerFactors(base.value, exponent.value, grouped.value))
const expression = computed(() => {
  const baseText = base.value < 0 && grouped.value ? `(${base.value})` : String(base.value)
  return `${baseText}${toSuperscript(exponent.value)}`
})
const baseScope = computed(() => base.value < 0 && !grouped.value ? String(Math.abs(base.value)) : `(${base.value})`)
const insight = computed(() => {
  if (exponent.value === 0) return '非零数的 0 次幂等于 1'
  if (base.value < 0 && !grouped.value) return '负号不属于底数'
  if (base.value < 0) return exponent.value % 2 === 0 ? '负数的偶次幂为正' : '负数的奇次幂为负'
  return '正数的任何次幂为正'
})
const explanation = computed(() => exponent.value === 0
  ? '这里是乘方的规定，不是“没有数所以等于 0”。'
  : `${factors.value.length} 个相同因数相乘，先辨认底数是否包含负号。`)

function toSuperscript(number) {
  return String(number).replace(/[0-9]/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)])
}

function applyParity(value) {
  base.value = -2
  grouped.value = true
  exponent.value = value
}
</script>

<style scoped>
.power-controls { display: grid; grid-template-columns: 1fr 1fr auto; align-items: end; gap: 20px; }
.power-controls > label:not(.group-toggle) { display: grid; gap: 9px; color: var(--text-secondary); font-size: 10px; }
.power-controls label span { display: flex; justify-content: space-between; }
.power-controls label strong { color: var(--signal); font-family: var(--font-mono); }
.power-controls input[type='range'] { width: 100%; accent-color: var(--signal); }
.group-toggle { display: flex; min-height: 38px; padding: 0 12px; align-items: center; gap: 8px; border: 1px solid var(--border); border-radius: 3px; color: var(--text-secondary); cursor: pointer; font-size: 10px; }
.group-toggle input { accent-color: var(--signal); }
.power-equation { display: flex; min-height: 92px; margin-top: 18px; align-items: center; justify-content: center; gap: 18px; color: var(--text-primary); font-family: var(--font-mono); font-size: clamp(34px,6vw,56px); }
.power-equation b { color: var(--text-tertiary); font-weight: 400; }
.power-equation strong { color: var(--signal); }
.base-scope { display: flex; min-height: 38px; margin: -8px 0 10px; align-items: center; justify-content: center; gap: 9px; color: var(--text-secondary); font-size: 9px; }
.base-scope span { color: #72d7ff; font-family: var(--font-mono); font-size: 8px; }
.base-scope strong { padding: 4px 7px; border: 1px solid rgba(67,200,255,.35); border-radius: 3px; color: var(--text-primary); font-family: var(--font-mono); }
.factor-chain { display: flex; min-height: 58px; padding: 12px; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); font-family: var(--font-mono); }
.factor-chain span { padding: 6px 8px; border: 1px solid rgba(234,255,87,.28); border-radius: 3px; background: var(--signal-muted); color: var(--signal); }
.factor-chain b { color: var(--text-tertiary); font-weight: 400; }
.power-insight { display: grid; margin-top: 16px; grid-template-columns: 1fr 1fr 2fr; border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.power-insight > div { min-height: 100px; padding: 15px; border-right: 1px solid var(--border); }
.power-insight > div:last-child { border-right: 0; }
.power-insight span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.power-insight strong { display: block; margin-top: 8px; color: var(--text-primary); font-size: 16px; }
.power-insight p { margin-top: 5px; color: var(--text-tertiary); font-size: 10px; line-height: 1.5; }
.insight-rule strong { color: var(--signal); }
.parity-heading { display: flex; margin-top: 16px; align-items: center; justify-content: space-between; gap: 12px; }
.parity-heading span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.parity-heading p { color: var(--text-tertiary); font-size: 9px; }
.parity-strip { display: grid; margin-top: 8px; grid-template-columns: repeat(5,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.parity-strip button { min-height: 66px; padding: 8px; border: 0; border-right: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: var(--font-mono); }
.parity-strip button:last-child { border-right: 0; }
.parity-strip button.active { background: var(--signal-muted); box-shadow: inset 0 2px 0 var(--signal); }
.parity-strip span, .parity-strip small { display: block; color: var(--text-tertiary); font-size: 8px; }
.parity-strip strong { display: block; margin: 5px 0; color: var(--text-primary); font-size: 15px; }
.comparison { display: grid; margin-top: 9px; grid-template-columns: repeat(2,1fr); border: 1px solid rgba(255,110,131,.25); border-radius: 3px; overflow: hidden; }
.comparison > div { padding: 15px; border-right: 1px solid rgba(255,110,131,.2); }
.comparison > div:last-child { border-right: 0; }
.comparison span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.comparison strong { display: block; margin-top: 7px; color: #ff8999; font-family: var(--font-mono); font-size: 15px; }
.comparison p { margin-top: 6px; color: var(--text-tertiary); font-size: 10px; }
@media (max-width: 700px) {
  .power-controls { grid-template-columns: 1fr; }
  .power-insight { grid-template-columns: repeat(2,1fr); }
  .power-insight .insight-rule { grid-column: 1 / -1; border-top: 1px solid var(--border); }
  .power-insight > div:nth-child(2) { border-right: 0; }
  .comparison { grid-template-columns: 1fr; }
  .comparison > div { border-right: 0; border-bottom: 1px solid rgba(255,110,131,.2); }
  .parity-heading { align-items: flex-start; flex-direction: column; }
  .parity-strip { grid-template-columns: repeat(5,minmax(58px,1fr)); overflow-x: auto; }
}
</style>
