<template>
  <div class="football-lab">
    <div class="lab-intro">
      <span>创设情境 / 足球比赛</span>
      <strong>赢球记为正，输球记为负，不输不赢记为 0</strong>
      <p>通过足球比赛的胜负场景，归纳两个有理数相加的 7 种情形，引出加法法则。</p>
    </div>

    <div class="field-stage">
      <div class="half-field" :class="{ highlight: half === 'first' }" @click="half = 'first'">
        <span>上半场</span>
        <div class="goal-display">
          <button class="goal-btn win" @click.stop="adjustFirst(1)">+</button>
          <strong :class="firstHalf > 0 ? 'win' : firstHalf < 0 ? 'lose' : 'draw'">{{ firstHalf > 0 ? '赢 ' + firstHalf : firstHalf < 0 ? '输 ' + Math.abs(firstHalf) : '平' }}</strong>
          <button class="goal-btn lose" @click.stop="adjustFirst(-1)">−</button>
        </div>
        <small>{{ firstHalf > 0 ? '+' + firstHalf : firstHalf }}</small>
      </div>

      <div class="field-divider">
        <span>VS</span>
        <div class="divider-line"></div>
      </div>

      <div class="half-field" :class="{ highlight: half === 'second' }" @click="half = 'second'">
        <span>下半场</span>
        <div class="goal-display">
          <button class="goal-btn win" @click.stop="adjustSecond(1)">+</button>
          <strong :class="secondHalf > 0 ? 'win' : secondHalf < 0 ? 'lose' : 'draw'">{{ secondHalf > 0 ? '赢 ' + secondHalf : secondHalf < 0 ? '输 ' + Math.abs(secondHalf) : '平' }}</strong>
          <button class="goal-btn lose" @click.stop="adjustSecond(-1)">−</button>
        </div>
        <small>{{ secondHalf > 0 ? '+' + secondHalf : secondHalf }}</small>
      </div>
    </div>

    <div class="equation-band" aria-live="polite">
      <span class="term" :class="firstHalf >= 0 ? 'positive' : 'negative'">({{ firstHalf > 0 ? '+' + firstHalf : firstHalf }})</span>
      <b>+</b>
      <span class="term" :class="secondHalf >= 0 ? 'positive' : 'negative'">({{ secondHalf > 0 ? '+' + secondHalf : secondHalf }})</span>
      <b>=</b>
      <strong :class="fullResult > 0 ? 'win' : fullResult < 0 ? 'lose' : 'draw'">{{ fullResult > 0 ? '+' + fullResult : fullResult }}</strong>
    </div>

    <div class="result-story">
      <span>全场结果</span>
      <strong>{{ storyText }}</strong>
    </div>

    <div class="rule-banner" v-if="showRule">
      <span>观察发现</span>
      <strong>{{ ruleText }}</strong>
      <p>{{ ruleDetail }}</p>
    </div>

    <div class="seven-cases">
      <span>7 种情形的完整列表</span>
      <div class="case-grid">
        <button
          v-for="item in allCases"
          :key="item.label"
          :class="{ active: item.first === firstHalf && item.second === secondHalf }"
          @click="applyCase(item)"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.expr }}</strong>
          <small>{{ item.result }}</small>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const half = ref('first')
const firstHalf = ref(3)
const secondHalf = ref(-2)

const allCases = [
  { label: '① 赢 + 赢', first: 3, second: 2, expr: '(+3)+(+2)', result: '+5', rule: '同号相加，绝对值相加' },
  { label: '② 输 + 输', first: -2, second: -1, expr: '(−2)+(−1)', result: '−3', rule: '同号相加，绝对值相加' },
  { label: '③ 赢 + 输（赢多）', first: 3, second: -2, expr: '(+3)+(−2)', result: '+1', rule: '异号相加，绝对值相减' },
  { label: '④ 输 + 赢（输多）', first: -3, second: 2, expr: '(−3)+(+2)', result: '−1', rule: '异号相加，绝对值相减' },
  { label: '⑤ 赢 + 平', first: 3, second: 0, expr: '(+3)+0', result: '+3', rule: '一个数同 0 相加仍得这个数' },
  { label: '⑥ 输 + 平', first: -2, second: 0, expr: '(−2)+0', result: '−2', rule: '一个数同 0 相加仍得这个数' },
  { label: '⑦ 平 + 平', first: 0, second: 0, expr: '0+0', result: '0', rule: '0+0=0' },
]

const fullResult = computed(() => firstHalf.value + secondHalf.value)

const storyText = computed(() => {
  if (fullResult.value > 0) return `全场共赢 ${fullResult.value} 球`
  if (fullResult.value < 0) return `全场共输 ${Math.abs(fullResult.value)} 球`
  return '全场平局'
})

const showRule = computed(() => firstHalf.value !== 0 || secondHalf.value !== 0)

const ruleText = computed(() => {
  if (firstHalf.value === 0 || secondHalf.value === 0) return '一个数同 0 相加，仍得这个数'
  if (Math.sign(firstHalf.value) === Math.sign(secondHalf.value)) return '同号两数相加，取相同的符号，并把绝对值相加'
  if (firstHalf.value + secondHalf.value === 0) return '互为相反数的两个数相加得 0'
  return '绝对值不相等的异号两数相加，取绝对值较大的加数符号，并用较大的绝对值减去较小的绝对值'
})

const ruleDetail = computed(() => {
  const a = Math.abs(firstHalf.value)
  const b = Math.abs(secondHalf.value)
  if (firstHalf.value === 0 || secondHalf.value === 0) return `|${firstHalf.value}| ${firstHalf.value === 0 ? '不参与' : ''}，结果仍是 ${firstHalf.value + secondHalf.value}`
  if (Math.sign(firstHalf.value) === Math.sign(secondHalf.value)) return `|${firstHalf.value}| + |${secondHalf.value}| = ${a} + ${b} = ${a + b}，符号为 ${firstHalf.value > 0 ? '正' : '负'}`
  if (firstHalf.value + secondHalf.value === 0) return `${firstHalf.value} 与 ${secondHalf.value} 互为相反数，和为 0`
  const bigger = a > b ? firstHalf.value : secondHalf.value
  return `|${Math.abs(bigger)}| − |${Math.abs(bigger === firstHalf.value ? secondHalf.value : firstHalf.value)}| = ${Math.abs(fullResult.value)}，符号取 ${bigger > 0 ? '正' : '负'}`
})

function adjustFirst(delta) {
  const next = firstHalf.value + delta
  if (next >= -5 && next <= 5) firstHalf.value = next
}

function adjustSecond(delta) {
  const next = secondHalf.value + delta
  if (next >= -5 && next <= 5) secondHalf.value = next
}

function applyCase(item) {
  firstHalf.value = item.first
  secondHalf.value = item.second
}
</script>

<style scoped>
.football-lab { min-width: 0; margin: 20px 0; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(255,255,255,.012); overflow: hidden; }
.lab-intro { padding: 18px 20px 14px; border-bottom: 1px solid var(--border); }
.lab-intro span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.lab-intro strong { display: block; margin-top: 6px; color: var(--text-primary); font-size: 16px; }
.lab-intro p { margin-top: 5px; color: var(--text-tertiary); font-size: 10px; line-height: 1.6; }

.field-stage { display: grid; min-height: 180px; grid-template-columns: 1fr auto 1fr; align-items: stretch; }
.half-field { display: grid; padding: 28px 20px; place-items: center; align-content: center; gap: 14px; cursor: pointer; transition: background .15s; }
.half-field:hover { background: rgba(255,255,255,.018); }
.half-field.highlight { background: rgba(234,255,87,.025); }
.half-field > span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }
.half-field > small { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 16px; }
.goal-display { display: flex; align-items: center; gap: 12px; }
.goal-btn { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 50%; background: transparent; cursor: pointer; font-family: var(--font-mono); font-size: 18px; transition: all .12s; }
.goal-btn.win { color: #72d7ff; }
.goal-btn.win:hover { border-color: #43c8ff; background: rgba(67,200,255,.12); }
.goal-btn.lose { color: #ff8999; }
.goal-btn.lose:hover { border-color: #ff6e83; background: rgba(255,110,131,.12); }
.half-field strong { font-family: var(--font-display); font-size: 28px; min-width: 70px; text-align: center; }
.half-field strong.win { color: #72d7ff; }
.half-field strong.lose { color: #ff8999; }
.half-field strong.draw { color: var(--text-tertiary); }

.field-divider { display: grid; width: 60px; place-items: center; align-content: center; gap: 10px; }
.field-divider span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.divider-line { width: 1px; height: 60px; background: var(--border); }

.equation-band { display: flex; min-height: 70px; padding: 14px 20px; align-items: center; justify-content: center; gap: 14px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: linear-gradient(90deg, rgba(67,200,255,.035), rgba(234,255,87,.025)); }
.equation-band b { color: var(--text-tertiary); font-family: var(--font-mono); font-weight: 400; }
.equation-band .term { font-family: var(--font-mono); font-size: 18px; }
.equation-band .term.positive { color: #72d7ff; }
.equation-band .term.negative { color: #ff8999; }
.equation-band strong { font-family: var(--font-display); font-size: 28px; }
.equation-band strong.win { color: #72d7ff; }
.equation-band strong.lose { color: #ff8999; }
.equation-band strong.draw { color: var(--text-tertiary); }

.result-story { display: flex; padding: 12px 20px; align-items: center; gap: 12px; }
.result-story span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.result-story strong { color: var(--text-primary); font-size: 13px; }

.rule-banner { padding: 16px 20px; border-top: 1px solid rgba(234,255,87,.2); border-left: 2px solid var(--signal); background: var(--signal-muted); }
.rule-banner span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.rule-banner strong { display: block; margin-top: 5px; color: var(--text-primary); font-size: 14px; line-height: 1.6; }
.rule-banner p { margin-top: 5px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }

.seven-cases { padding: 14px 20px 18px; border-top: 1px solid var(--border); }
.seven-cases > span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.case-grid { display: grid; margin-top: 10px; grid-template-columns: repeat(4, 1fr); gap: 5px; }
.case-grid button { min-height: 68px; padding: 8px 6px; border: 1px solid var(--border); border-radius: 3px; background: transparent; cursor: pointer; font-family: var(--font-mono); transition: border-color .12s; }
.case-grid button:hover { border-color: rgba(234,255,87,.3); }
.case-grid button.active { border-color: var(--signal); background: var(--signal-muted); }
.case-grid button span { display: block; color: var(--text-tertiary); font-size: 8px; }
.case-grid button strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 12px; }
.case-grid button small { display: block; margin-top: 3px; color: var(--text-tertiary); font-size: 8px; }
.case-grid button:nth-child(-n+2) strong { color: #72d7ff; }
.case-grid button:nth-child(n+3):nth-child(-n+4) strong { color: #ffd372; }

@media (max-width: 720px) {
  .field-stage { grid-template-columns: 1fr; }
  .field-divider { width: 100%; height: 40px; flex-direction: row; }
  .divider-line { width: 60px; height: 1px; }
  .half-field { padding: 20px 14px; }
  .case-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .half-field strong { font-size: 22px; min-width: 50px; }
  .case-grid { grid-template-columns: 1fr; }
}
</style>
