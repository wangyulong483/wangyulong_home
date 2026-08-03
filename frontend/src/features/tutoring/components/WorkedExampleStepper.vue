<template>
  <div class="worked-example">
    <div class="example-toolbar">
      <div>
        <span>STEP-BY-STEP / 分步演算</span>
        <strong>按运算层级逐步化简，保留每一步计算依据</strong>
      </div>
      <div class="example-tabs" aria-label="选择混合运算例题">
        <button
          v-for="(example, index) in examples"
          :key="example.expression"
          :class="{ active: activeExample === index }"
          @click="selectExample(index)"
        >例 {{ index + 1 }}</button>
      </div>
    </div>

    <div class="expression-stage">
      <span>原式</span>
      <strong>{{ current.expression }}</strong>
      <p>{{ current.prompt }}</p>
    </div>

    <ol class="step-list">
      <li
        v-for="(step, index) in current.steps"
        :key="step.expression"
        :class="{ visible: index < visibleSteps, current: index === visibleSteps - 1 }"
      >
        <span>0{{ index + 1 }}</span>
        <div>
          <small>{{ step.rule }}</small>
          <strong>{{ index < visibleSteps ? step.expression : '本步暂未展开' }}</strong>
          <p v-if="index < visibleSteps">{{ step.reason }}</p>
        </div>
      </li>
    </ol>

    <div class="step-actions">
      <button :disabled="visibleSteps >= current.steps.length" @click="visibleSteps++">展开下一步</button>
      <button @click="visibleSteps = current.steps.length">完整展开</button>
      <button class="quiet" @click="visibleSteps = 0">重置演算</button>
      <p><span>结论</span>{{ current.takeaway }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const examples = [
  {
    expression: '(−2)³ + 18 ÷ (−3)',
    prompt: '乘方与除法处于同一高层级，可分别计算，再处理最后的加法。',
    takeaway: '乘方和除法分别完成后，最后处理异号相加。',
    steps: [
      { rule: '乘方', expression: '= −8 + 18 ÷ (−3)', reason: '(−2) 是底数，奇次幂为负。' },
      { rule: '除法', expression: '= −8 + (−6)', reason: '异号相除得负，18 ÷ 3 = 6。' },
      { rule: '加法', expression: '= −14', reason: '两个负数相加，绝对值相加并保留负号。' },
    ],
  },
  {
    expression: '−2⁴ − 3 × (−2)',
    prompt: '先辨认乘方的底数，再分别完成乘方与乘法，最后将减法转化为加法。',
    takeaway: '没有括号时负号不属于底数；同级结果再进行减法。',
    steps: [
      { rule: '乘方', expression: '= −16 − 3 × (−2)', reason: '−2⁴ 表示 −(2⁴)，结果是 −16。' },
      { rule: '乘法', expression: '= −16 − (−6)', reason: '正负相乘得负。' },
      { rule: '减法', expression: '= −16 + 6 = −10', reason: '减去负数，转化为加上它的相反数。' },
    ],
  },
  {
    expression: '24 ÷ (−2)² − 7',
    prompt: '括号把 −2 整体确定为底数，偶次幂为正，再依次完成除法与减法。',
    takeaway: '括号内负数整体作底数，偶次幂为正。',
    steps: [
      { rule: '乘方', expression: '= 24 ÷ 4 − 7', reason: '(−2)² = 4。' },
      { rule: '除法', expression: '= 6 − 7', reason: '24 ÷ 4 = 6。' },
      { rule: '减法', expression: '= −1', reason: '6 比 7 小 1，所以结果为 −1。' },
    ],
  },
]

const activeExample = ref(0)
const visibleSteps = ref(0)
const current = computed(() => examples[activeExample.value])

function selectExample(index) {
  activeExample.value = index
  visibleSteps.value = 0
}
</script>

<style scoped>
.worked-example { margin: 22px 0; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(255,255,255,.012); overflow: hidden; }
.example-toolbar { display: flex; min-height: 66px; padding: 13px 16px; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--border); }
.example-toolbar span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.example-toolbar strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 12px; }
.example-tabs { display: flex; gap: 5px; }
.example-tabs button, .step-actions button { min-height: 32px; padding: 0 11px; border: 1px solid var(--border); border-radius: 3px; background: transparent; color: var(--text-secondary); cursor: pointer; font-family: var(--font-mono); font-size: 9px; }
.example-tabs button.active { border-color: var(--signal); background: var(--signal); color: #0b0b0e; font-weight: 800; }
.expression-stage { display: grid; min-height: 122px; padding: 20px; place-items: center; align-content: center; gap: 7px; background: linear-gradient(90deg, rgba(67,200,255,.035), rgba(234,255,87,.035)); text-align: center; }
.expression-stage span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.expression-stage strong { color: var(--text-primary); font-family: var(--font-mono); font-size: clamp(24px,4vw,40px); }
.expression-stage p { color: var(--text-secondary); font-size: 10px; }
.step-list { margin: 0; padding: 0; list-style: none; }
.step-list li { display: grid; min-height: 86px; padding: 14px 18px; grid-template-columns: 38px 1fr; align-items: center; border-top: 1px solid var(--border); opacity: .34; }
.step-list li.visible { opacity: 1; }
.step-list li.current { border-left: 2px solid var(--signal); background: var(--signal-muted); }
.step-list > li > span { color: var(--signal); font-family: var(--font-mono); font-size: 9px; }
.step-list small { display: block; color: #72d7ff; font-family: var(--font-mono); font-size: 8px; }
.step-list strong { display: block; margin-top: 5px; color: var(--text-primary); font-family: var(--font-mono); font-size: 18px; }
.step-list p { margin-top: 4px; color: var(--text-tertiary); font-size: 9px; }
.step-actions { display: flex; padding: 13px 16px; flex-wrap: wrap; align-items: center; gap: 7px; border-top: 1px solid var(--border); }
.step-actions button:first-child { border-color: var(--signal); color: var(--signal); }
.step-actions button:disabled { cursor: not-allowed; opacity: .35; }
.step-actions button.quiet { color: var(--text-tertiary); }
.step-actions p { margin-left: auto; color: var(--text-secondary); font-size: 9px; }
.step-actions p span { margin-right: 7px; color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
@media (max-width: 680px) {
  .example-toolbar { align-items: flex-start; flex-direction: column; }
  .example-tabs { width: 100%; }
  .example-tabs button { flex: 1; }
  .step-actions p { width: 100%; margin-left: 0; line-height: 1.6; }
}
</style>
