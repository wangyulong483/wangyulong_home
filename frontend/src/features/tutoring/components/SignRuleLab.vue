<template>
  <div class="sign-lab">
    <div class="sign-controls">
      <div class="segmented">
        <button :class="{ active: operation === 'multiply' }" @click="operation = 'multiply'">乘法</button>
        <button :class="{ active: operation === 'divide' }" @click="operation = 'divide'">除法</button>
      </div>
      <div class="operand-control">
        <span>第一个数</span>
        <button :class="{ negative: leftSign < 0 }" :aria-label="leftSign < 0 ? '切换为正数' : '切换为负数'" @click="leftSign *= -1">{{ leftSign < 0 ? '−' : '+' }}</button>
        <input v-model.number="leftMagnitude" type="range" min="1" max="9" />
        <strong>{{ left }}</strong>
      </div>
      <div class="operand-control">
        <span>第二个数</span>
        <button :class="{ negative: rightSign < 0 }" :aria-label="rightSign < 0 ? '切换为正数' : '切换为负数'" @click="rightSign *= -1">{{ rightSign < 0 ? '−' : '+' }}</button>
        <input v-model.number="rightMagnitude" type="range" min="1" max="9" />
        <strong>{{ right }}</strong>
      </div>
    </div>

    <div class="sign-stage">
      <div class="operand-block" :class="leftSign < 0 ? 'negative' : 'positive'">
        <span>{{ leftSign < 0 ? '负' : '正' }}</span>
        <strong>{{ Math.abs(left) }}</strong>
      </div>
      <b class="operator">{{ operation === 'multiply' ? '×' : '÷' }}</b>
      <div class="operand-block" :class="rightSign < 0 ? 'negative' : 'positive'">
        <span>{{ rightSign < 0 ? '负' : '正' }}</span>
        <strong>{{ Math.abs(right) }}</strong>
      </div>
      <b class="operator">=</b>
      <div class="result-block" :class="rule === 'same' ? 'positive' : 'negative'">
        <span>{{ rule === 'same' ? '同号得正' : '异号得负' }}</span>
        <strong>{{ answer.text }}</strong>
      </div>
    </div>

    <div class="matrix-heading">
      <span>符号组合矩阵</span>
      <p>切换任意组合，观察两个运算数的符号如何决定结果符号。</p>
    </div>
    <div class="rule-matrix" aria-label="乘除法符号规律">
      <button
        v-for="item in signCases"
        :key="item.label"
        :class="{ active: leftSign === item.left && rightSign === item.right }"
        @click="applySignCase(item)"
      >
        <span>{{ item.left > 0 ? '＋' : '−' }} {{ operationSymbol }} {{ item.right > 0 ? '＋' : '−' }}</span>
        <strong>{{ item.result }}</strong>
        <small>{{ item.label }}</small>
      </button>
    </div>
    <p class="calculation-line">先定符号，再算绝对值：{{ rule === 'same' ? '同号' : '异号' }} → {{ resultSign }}；{{ Math.abs(left) }} {{ operation === 'multiply' ? '×' : '÷' }} {{ Math.abs(right) }} = {{ absoluteAnswer }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { rationalOperation, signRule } from '../lib/rational.js'

const operation = ref('multiply')
const leftSign = ref(-1)
const rightSign = ref(-1)
const leftMagnitude = ref(3)
const rightMagnitude = ref(4)
const signCases = [
  { left: 1, right: 1, result: '＋', label: '正与正' },
  { left: -1, right: -1, result: '＋', label: '负与负' },
  { left: 1, right: -1, result: '−', label: '正与负' },
  { left: -1, right: 1, result: '−', label: '负与正' },
]
const left = computed(() => leftSign.value * leftMagnitude.value)
const right = computed(() => rightSign.value * rightMagnitude.value)
const rule = computed(() => signRule(left.value, right.value))
const answer = computed(() => rationalOperation(left.value, right.value, operation.value))
const absoluteAnswer = computed(() => rationalOperation(Math.abs(left.value), Math.abs(right.value), operation.value).text)
const resultSign = computed(() => rule.value === 'same' ? '正' : '负')
const operationSymbol = computed(() => operation.value === 'multiply' ? '×' : '÷')

function applySignCase(item) {
  leftSign.value = item.left
  rightSign.value = item.right
}
</script>

<style scoped>
.sign-controls { display: grid; grid-template-columns: auto 1fr 1fr; align-items: center; gap: 18px; }
.segmented { display: inline-grid; grid-template-columns: repeat(2,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.segmented button { min-width: 64px; min-height: 36px; border: 0; border-right: 1px solid var(--border); background: transparent; color: var(--text-tertiary); cursor: pointer; font-family: var(--font-mono); font-size: 10px; }
.segmented button:last-child { border-right: 0; }
.segmented button.active { background: var(--signal); color: #0b0b0e; font-weight: 800; }
.operand-control { display: grid; grid-template-columns: auto 32px 1fr 28px; align-items: center; gap: 8px; color: var(--text-tertiary); font-size: 10px; }
.operand-control button { width: 30px; height: 30px; border: 1px solid #4acbff; border-radius: 3px; background: rgba(74,203,255,.08); color: #72d7ff; cursor: pointer; font-size: 18px; }
.operand-control button.negative { border-color: #ff6e83; background: rgba(255,110,131,.08); color: #ff8999; }
.operand-control input { min-width: 0; accent-color: var(--signal); }
.operand-control strong { color: var(--text-primary); font-family: var(--font-mono); text-align: right; }
.sign-stage { display: grid; min-height: 160px; margin-top: 24px; grid-template-columns: minmax(90px,1fr) auto minmax(90px,1fr) auto minmax(130px,1.25fr); align-items: center; gap: 14px; }
.operand-block, .result-block { display: grid; min-height: 112px; padding: 16px; place-items: center; border: 1px solid; border-radius: var(--radius); }
.operand-block span, .result-block span { font-family: var(--font-mono); font-size: 9px; }
.operand-block strong, .result-block strong { font-family: var(--font-display); font-size: 36px; }
.positive { border-color: rgba(74,203,255,.4); background: rgba(74,203,255,.06); color: #72d7ff; }
.negative { border-color: rgba(255,110,131,.4); background: rgba(255,110,131,.06); color: #ff8999; }
.operator { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 24px; font-weight: 400; }
.matrix-heading { display: flex; margin-top: 18px; align-items: center; justify-content: space-between; gap: 12px; }
.matrix-heading span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.matrix-heading p { color: var(--text-tertiary); font-size: 9px; }
.rule-matrix { display: grid; margin-top: 8px; grid-template-columns: repeat(2,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.rule-matrix button { display: grid; min-height: 66px; padding: 9px 13px; grid-template-columns: 1fr auto; align-items: center; border: 0; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: transparent; cursor: pointer; text-align: left; font-family: var(--font-mono); font-size: 10px; }
.rule-matrix button:nth-child(2n) { border-right: 0; }
.rule-matrix button:nth-last-child(-n+2) { border-bottom: 0; }
.rule-matrix button.active { background: var(--signal-muted); box-shadow: inset 2px 0 0 var(--signal); }
.rule-matrix span { color: var(--text-tertiary); }
.rule-matrix strong { color: var(--signal); font-size: 18px; }
.rule-matrix small { grid-column: 1 / -1; color: var(--text-tertiary); font-size: 8px; }
.calculation-line { margin-top: 14px; color: var(--text-secondary); font-size: 11px; line-height: 1.7; }
@media (max-width: 760px) {
  .sign-controls { grid-template-columns: 1fr; }
  .sign-stage { grid-template-columns: 1fr auto 1fr; }
  .sign-stage .operator:nth-of-type(2) { display: none; }
  .result-block { grid-column: 1 / -1; min-height: 82px; }
  .matrix-heading { align-items: flex-start; flex-direction: column; }
}
</style>
