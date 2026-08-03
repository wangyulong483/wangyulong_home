<template>
  <div class="example-reveal">
    <div class="reveal-toolbar">
      <div>
        <span>EXAMPLE LIBRARY / 典型例题解析</span>
        <strong>覆盖规则、完整步骤、常见误区与变式思考</strong>
      </div>
      <div class="reveal-count">已展开 {{ revealedCount }} / {{ questions.length }}</div>
      <button @click="revealAll">完整展开</button>
      <button class="quiet" @click="resetReveal">重置演示</button>
    </div>

    <div class="question-list">
      <article v-for="(question, index) in questions" :key="question.prompt" :class="{ revealed: openQuestions[index] }">
        <div class="question-head">
          <span>{{ String(index + 1).padStart(2, '0') }} · {{ question.topic }}</span>
          <strong>{{ question.prompt }}</strong>
          <button @click="toggleQuestion(index)">{{ openQuestions[index] ? '收起解析' : '展开解析' }}</button>
        </div>
        <div v-if="openQuestions[index]" class="answer-panel">
          <div class="answer-main">
            <span>正确演算</span>
            <strong>{{ question.answer }}</strong>
            <ol>
              <li v-for="step in question.steps" :key="step">{{ step }}</li>
            </ol>
          </div>
          <div class="mistake-block">
            <span>常见误答</span>
            <strong>{{ question.mistake }}</strong>
            <p>{{ question.errorReason }}</p>
          </div>
          <div class="follow-up">
            <span>变式思考</span>
            <p>{{ question.followUp }}</p>
          </div>
        </div>
      </article>
    </div>

    <div class="observation-note">
      <span>计算检查清单</span>
      <strong>符号、绝对值、运算顺序缺一不可</strong>
      <p>第一遍检查负号、括号和底数范围；第二遍检查绝对值计算；第三遍检查同级运算是否从左到右，以及减法是否正确转化为加法。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'

const questions = [
  {
    topic: '异号相加', prompt: '−8 + 3 = ?', answer: '−8 + 3 = −5', mistake: '5 或 −11',
    steps: ['先比较绝对值：8 > 3。', '绝对值相减：8 − 3 = 5。', '结果跟绝对值较大的 −8 同号，所以是 −5。'],
    errorReason: '把“异号相加”误做成绝对值相加，或丢掉结果符号。', followUp: '不用口诀，在数轴上从 −8 出发，应向哪边移动几格？',
  },
  {
    topic: '减去负数', prompt: '6 − (−4) = ?', answer: '6 − (−4) = 6 + 4 = 10', mistake: '2 或 −10',
    steps: ['把减法转成加法。', '−4 的相反数是 4。', '计算 6 + 4 = 10。'],
    errorReason: '只看见两个负号，却没有说明“减去一个数等于加上它的相反数”。', followUp: '如果把 −4 改成 −7，结果相对 6 会变大还是变小？',
  },
  {
    topic: '同号相乘', prompt: '(−3) × (−5) = ?', answer: '(−3) × (−5) = 15', mistake: '−15',
    steps: ['先判断符号：两个因数同号，积为正。', '再算绝对值：3 × 5 = 15。'],
    errorReason: '把“有负数”直接判断成负结果，没有比较两个因数的符号。', followUp: '只改变其中一个因数的符号，积会怎样变化？',
  },
  {
    topic: '异号相除', prompt: '(−24) ÷ 6 = ?', answer: '(−24) ÷ 6 = −4', mistake: '4 或 −18',
    steps: ['先判断符号：负数与正数异号，商为负。', '再算绝对值：24 ÷ 6 = 4。'],
    errorReason: '符号判断和绝对值计算没有分开，或把除法看成减法。', followUp: '如果除数也改成负数，商的符号为什么会改变？',
  },
  {
    topic: '乘方括号', prompt: '−2⁴ 与 (−2)⁴ 各是多少？', answer: '−2⁴ = −16；(−2)⁴ = 16', mistake: '两者都等于 16',
    steps: ['−2⁴ 的底数是 2，负号在乘方外。', '(−2)⁴ 的底数是 −2，共有四个负因数。', '偶数个负因数相乘，结果为正。'],
    errorReason: '忽略括号，误把两个式子的底数都看成 −2。', followUp: '若指数改成 3，两个式子的结果是否仍然不同？',
  },
  {
    topic: '混合运算', prompt: '(−2)³ + 18 ÷ (−3) = ?', answer: '= −8 + (−6) = −14', mistake: '−2、14 或 −26',
    steps: ['先算乘方：(−2)³ = −8。', '同时可算除法：18 ÷ (−3) = −6。', '最后同号相加：−8 + (−6) = −14。'],
    errorReason: '从左到右直接算，或除法符号判断错误。', followUp: '第一步为什么可以同时算乘方与除法？最后一步属于哪类加法？',
  },
  {
    topic: '运算律巧算', prompt: '(−3) + 5 + (−2) + 8 = ?', answer: '[(−3) + (−2)] + (5 + 8) = −5 + 13 = 8', mistake: '−18 或 4',
    steps: ['运用加法交换律，把两个负数放在一起。', '运用加法结合律，分别计算 −5 和 13。', '异号相加得到 8。'],
    errorReason: '交换加数位置时丢掉负号，或把结合律误当成可以改变加数。', followUp: '若把最后的 8 改成 −8，怎样分组计算更简洁？',
  },
  {
    topic: '实际应用', prompt: '某地早晨 5℃，夜间降低 8℃，夜间温度是多少？', answer: '5 + (−8) = −3℃', mistake: '13℃ 或 3℃',
    steps: ['规定升高为正，降低为负。', '把“降低 8℃”表示为 −8℃。', '计算 5 + (−8) = −3。'],
    errorReason: '只计算变化量的绝对值，没有把“降低”转换成负数。', followUp: '若第二天又升高 6℃，温度将变成多少？',
  },
  {
    topic: '科学记数法', prompt: '用科学记数法表示 6 100 000。', answer: '6 100 000 = 6.1 × 10⁶', mistake: '61 × 10⁵ 或 6.1 × 10⁵',
    steps: ['把小数点移动到第一个非零数字之后，得到 6.1。', '小数点向左移动了 6 位，所以指数是 6。', '检查系数满足 1 ≤ |6.1| < 10。'],
    errorReason: '系数没有限制在绝对值大于等于 1 且小于 10，或指数少数一位。', followUp: '把 61 000 000 写成科学记数法时，系数不变还是指数不变？',
  },
  {
    topic: '近似数', prompt: '2.496 精确到百分位。', answer: '2.496 ≈ 2.50', mistake: '2.49 或 2.5',
    steps: ['百分位上的数字是 9。', '观察后一位千分位：6 ≥ 5，因此百分位进 1。', '进位后得到 2.50，末尾 0 表示精确到百分位。'],
    errorReason: '四舍五入时看错数位，或删除了表示精确程度的末尾 0。', followUp: '2.50 与 2.5 数值相等，为什么作为近似数时意义不同？',
  },
]

const openQuestions = reactive({})
const revealedCount = computed(() => questions.reduce((count, _, index) => count + (openQuestions[index] ? 1 : 0), 0))

function toggleQuestion(index) {
  openQuestions[index] = !openQuestions[index]
}

function revealAll() {
  questions.forEach((_, index) => { openQuestions[index] = true })
}

function resetReveal() {
  Object.keys(openQuestions).forEach(key => delete openQuestions[key])
}
</script>

<style scoped>
.example-reveal { margin-top: 24px; }
.reveal-toolbar { display: flex; min-height: 58px; padding: 12px 14px; align-items: center; gap: 9px; border: 1px solid var(--border); border-radius: 3px; }
.reveal-toolbar > div:first-child { margin-right: auto; }
.reveal-toolbar span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.reveal-toolbar strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 11px; }
.reveal-count { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 9px; }
.reveal-toolbar button, .question-head button { min-height: 32px; padding: 0 10px; border: 1px solid var(--signal); border-radius: 3px; background: transparent; color: var(--signal); cursor: pointer; font-family: var(--font-mono); font-size: 9px; white-space: nowrap; }
.reveal-toolbar button.quiet { border-color: var(--border); color: var(--text-tertiary); }
.question-list { margin-top: 10px; border-top: 1px solid var(--border); }
.question-list article { border-bottom: 1px solid var(--border); }
.question-list article.revealed { background: rgba(234,255,87,.018); }
.question-head { display: grid; min-height: 74px; padding: 13px 0; grid-template-columns: 100px 1fr auto; align-items: center; gap: 14px; }
.question-head > span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.question-head > strong { color: var(--text-primary); font-family: var(--font-mono); font-size: 18px; }
.question-head button { border-color: var(--border); color: var(--text-secondary); }
.revealed .question-head button { border-color: var(--signal); color: var(--signal); }
.answer-panel { display: grid; padding: 0 0 16px 114px; grid-template-columns: 1.3fr 1fr; gap: 10px; animation: reveal .2s ease; }
.answer-main, .mistake-block, .follow-up { padding: 14px; border: 1px solid var(--border); border-radius: 3px; }
.answer-main { grid-row: span 2; border-color: rgba(234,255,87,.28); background: var(--signal-muted); }
.answer-panel span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 8px; }
.answer-main > strong { display: block; margin-top: 8px; color: var(--signal); font-family: var(--font-mono); font-size: 18px; }
.answer-main ol { margin: 11px 0 0; padding-left: 17px; color: var(--text-secondary); font-size: 10px; line-height: 1.8; }
.mistake-block { border-color: rgba(255,110,131,.25); background: rgba(255,110,131,.035); }
.mistake-block strong { display: block; margin-top: 6px; color: #ff8999; font-family: var(--font-mono); font-size: 15px; }
.mistake-block p, .follow-up p { margin-top: 5px; color: var(--text-secondary); font-size: 9px; line-height: 1.6; }
.follow-up { border-left: 2px solid #43c8ff; }
.observation-note { margin-top: 16px; padding: 16px; border-left: 2px solid var(--signal); background: var(--signal-muted); }
.observation-note span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.observation-note strong { display: block; margin-top: 5px; color: var(--text-primary); font-size: 12px; }
.observation-note p { margin-top: 5px; color: var(--text-secondary); font-size: 10px; line-height: 1.65; }
@keyframes reveal { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (max-width: 700px) {
  .reveal-toolbar { align-items: flex-start; flex-wrap: wrap; }
  .reveal-toolbar > div:first-child { width: 100%; }
  .reveal-count { margin-right: auto; align-self: center; }
  .question-head { grid-template-columns: 1fr auto; }
  .question-head > span { grid-column: 1 / -1; }
  .question-head > strong { min-width: 0; font-size: 14px; }
  .answer-panel { padding-left: 0; grid-template-columns: 1fr; }
  .answer-main { grid-row: auto; }
}
</style>
