<template>
  <div class="progressive-exercise">
    <div class="exercise-head">
      <div>
        <span>{{ sectionLabel }}</span>
        <strong>{{ title }}</strong>
        <p>{{ description }}</p>
      </div>
      <div class="progress-summary">
        <span>完成 {{ completedCount }} / {{ groups.length }}</span>
        <button class="reset-btn" @click="resetAll">重置全部</button>
      </div>
    </div>

    <div class="exercise-groups">
      <div
        v-for="(group, gi) in groups"
        :key="group.label"
        class="group-card"
        :class="{ done: groupCompleted(gi) }"
      >
        <div class="group-label">
          <span>{{ group.label }}</span>
          <strong>{{ group.title }}</strong>
          <p v-if="group.instruction">{{ group.instruction }}</p>
        </div>

        <div class="question-list">
          <div
            v-for="(question, qi) in group.questions"
            :key="qi"
            class="question-item"
            :class="{
              correct: answers[gi]?.[qi]?.status === 'correct',
              wrong: answers[gi]?.[qi]?.status === 'wrong',
              revealed: answers[gi]?.[qi]?.revealed,
            }"
          >
            <div class="question-row">
              <span class="q-num">{{ gi + 1 }}-{{ qi + 1 }}</span>
              <span class="q-expr">{{ question.expr }}</span>
              <div class="q-actions">
                <input
                  v-if="!answers[gi]?.[qi]?.revealed"
                  v-model="answers[gi][qi].input"
                  type="text"
                  class="answer-input"
                  :class="{ 'has-value': answers[gi]?.[qi]?.input }"
                  :placeholder="question.placeholder || '输入答案'"
                  @keyup.enter="checkAnswer(gi, qi)"
                />
                <button
                  v-if="!answers[gi]?.[qi]?.revealed"
                  class="check-btn"
                  :disabled="!answers[gi]?.[qi]?.input"
                  @click="checkAnswer(gi, qi)"
                >检查</button>
                <button
                  v-if="!answers[gi]?.[qi]?.revealed && !answers[gi]?.[qi]?.input"
                  class="hint-btn"
                  @click="showHint(gi, qi)"
                >提示</button>
              </div>
            </div>

            <div v-if="answers[gi]?.[qi]?.revealed" class="feedback-panel">
              <div class="correct-answer">
                <span>正确答案</span>
                <strong>{{ question.answer }}</strong>
              </div>
              <div v-if="question.steps" class="solution-steps">
                <span>解题步骤</span>
                <ol>
                  <li v-for="step in question.steps" :key="step">{{ step }}</li>
                </ol>
              </div>
              <div v-if="question.rule" class="applied-rule">
                <span>依据</span>
                <p>{{ question.rule }}</p>
              </div>
              <div v-if="question.mistake" class="common-mistake">
                <span>常见误区</span>
                <p>{{ question.mistake }}</p>
              </div>
            </div>

            <div v-if="answers[gi]?.[qi]?.hint && !answers[gi]?.[qi]?.revealed" class="hint-banner">
              💡 {{ answers[gi][qi].hint }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="allCompleted" class="completion-banner">
      <span>✅ 全部完成</span>
      <strong>准确率：{{ accuracy }}%</strong>
      <p>{{ encouragement }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  sectionLabel: { type: String, default: 'EXERCISE' },
  title: { type: String, default: '变式练习' },
  description: { type: String, default: '' },
  groups: { type: Array, default: () => [] },
})

const answers = reactive({})

function initAnswers() {
  props.groups.forEach((group, gi) => {
    if (!answers[gi]) answers[gi] = {}
    group.questions.forEach((_, qi) => {
      if (!answers[gi][qi]) {
        answers[gi][qi] = { input: '', status: null, revealed: false, hint: '' }
      }
    })
  })
}

watch(() => props.groups, initAnswers, { immediate: true, deep: true })

const completedCount = computed(() => {
  let count = 0
  props.groups.forEach((group, gi) => {
    group.questions.forEach((_, qi) => {
      if (answers[gi]?.[qi]?.revealed) count++
    })
  })
  return count
})

const totalCount = computed(() => props.groups.reduce((sum, g) => sum + g.questions.length, 0))

const allCompleted = computed(() => completedCount.value === totalCount.value)

const accuracy = computed(() => {
  let correct = 0
  props.groups.forEach((group, gi) => {
    group.questions.forEach((_, qi) => {
      if (answers[gi]?.[qi]?.status === 'correct') correct++
    })
  })
  return totalCount.value ? Math.round((correct / completedCount.value) * 100) : 0
})

const encouragement = computed(() => {
  const rate = accuracy.value
  if (rate === 100) return '太棒了！全部正确，你对有理数运算已经掌握得很好！'
  if (rate >= 80) return '很好！只有少数错误，注意检查符号和绝对值计算。'
  if (rate >= 60) return '还不错，建议重点复习异号相加和减法转化的法则。'
  return '需要多加练习，特别关注：先定符号，再算绝对值。'
})

function groupCompleted(gi) {
  return props.groups[gi].questions.every((_, qi) => answers[gi]?.[qi]?.revealed)
}

function checkAnswer(gi, qi) {
  const question = props.groups[gi].questions[qi]
  const userAnswer = answers[gi][qi].input.trim()
  const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer]
  const isCorrect = correctAnswers.some(a => normalizeAnswer(userAnswer) === normalizeAnswer(String(a)))
  answers[gi][qi].status = isCorrect ? 'correct' : 'wrong'
  answers[gi][qi].revealed = true
}

function normalizeAnswer(text) {
  return text.replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')').replace(/＋/g, '+').replace(/－/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/＝/g, '=')
}

function showHint(gi, qi) {
  const question = props.groups[gi].questions[qi]
  answers[gi][qi].hint = question.hint || '请先尝试独立思考，再查看提示。'
}

function resetAll() {
  props.groups.forEach((group, gi) => {
    group.questions.forEach((_, qi) => {
      answers[gi][qi] = { input: '', status: null, revealed: false, hint: '' }
    })
  })
}
</script>

<style scoped>
.progressive-exercise { margin: 24px 0; }
.exercise-head { display: flex; padding: 16px 0; align-items: flex-start; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--border); }
.exercise-head > div:first-child span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.exercise-head > div:first-child strong { display: block; margin-top: 5px; color: var(--text-primary); font-size: 18px; }
.exercise-head > div:first-child p { margin-top: 4px; color: var(--text-tertiary); font-size: 10px; }
.progress-summary { display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 9px; white-space: nowrap; }
.reset-btn { min-height: 28px; padding: 0 10px; border: 1px solid var(--border); border-radius: 3px; background: transparent; color: var(--text-tertiary); cursor: pointer; font-family: var(--font-mono); font-size: 9px; }
.reset-btn:hover { border-color: var(--signal); color: var(--signal); }

.group-card { margin-top: 18px; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.group-card.done { border-color: rgba(120,255,160,.2); }
.group-label { padding: 14px 16px 10px; border-bottom: 1px solid var(--border); }
.group-label span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.group-label strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 13px; }
.group-label p { margin-top: 3px; color: var(--text-tertiary); font-size: 9px; }

.question-item { border-bottom: 1px solid rgba(255,255,255,.04); }
.question-item:last-child { border-bottom: 0; }
.question-item.correct { background: rgba(120,255,160,.025); }
.question-item.wrong { background: rgba(255,110,131,.025); }

.question-row { display: grid; min-height: 58px; padding: 10px 16px; grid-template-columns: 42px 1fr auto; align-items: center; gap: 12px; }
.q-num { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 9px; }
.q-expr { color: var(--text-primary); font-family: var(--font-mono); font-size: 15px; min-width: 0; word-break: break-all; }
.q-actions { display: flex; align-items: center; gap: 6px; }

.answer-input {
  width: 100px; min-height: 32px; padding: 0 10px; border: 1px solid var(--border); border-radius: 3px;
  background: rgba(0,0,0,.2); color: var(--text-primary); font-family: var(--font-mono); font-size: 13px;
  outline: none; transition: border-color .12s;
}
.answer-input:focus, .answer-input.has-value { border-color: rgba(234,255,87,.4); }
.correct .answer-input { border-color: rgba(120,255,160,.5); }
.wrong .answer-input { border-color: rgba(255,110,131,.5); }

.check-btn, .hint-btn {
  min-height: 32px; padding: 0 10px; border: 1px solid var(--signal); border-radius: 3px;
  background: transparent; color: var(--signal); cursor: pointer; font-family: var(--font-mono); font-size: 9px;
}
.check-btn:disabled { border-color: var(--border); color: var(--text-tertiary); cursor: not-allowed; }
.hint-btn { border-color: var(--border); color: var(--text-tertiary); }

.feedback-panel { display: grid; padding: 0 16px 14px 70px; grid-template-columns: 1fr 1fr; gap: 8px; }
.correct-answer, .solution-steps, .applied-rule, .common-mistake { padding: 10px 12px; border-radius: 3px; }
.correct-answer { grid-column: 1 / -1; border: 1px solid rgba(120,255,160,.25); background: rgba(120,255,160,.04); }
.correct-answer span, .solution-steps span, .applied-rule span, .common-mistake span { display: block; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 7px; }
.correct-answer strong { display: block; margin-top: 4px; color: #78ffa0; font-family: var(--font-mono); font-size: 16px; }
.solution-steps { border: 1px solid var(--border); background: rgba(255,255,255,.01); }
.solution-steps ol { margin: 6px 0 0; padding-left: 16px; color: var(--text-secondary); font-size: 10px; line-height: 1.7; }
.applied-rule { border-left: 2px solid #43c8ff; background: rgba(67,200,255,.04); }
.applied-rule p { margin-top: 4px; color: var(--text-secondary); font-size: 10px; line-height: 1.5; }
.common-mistake { border-left: 2px solid #ff6e83; background: rgba(255,110,131,.035); }
.common-mistake p { margin-top: 4px; color: var(--text-secondary); font-size: 10px; line-height: 1.5; }

.hint-banner { margin: 0 16px 10px 70px; padding: 8px 12px; border: 1px solid rgba(234,255,87,.18); border-radius: 3px; background: var(--signal-muted); color: var(--signal); font-size: 10px; line-height: 1.5; }

.completion-banner { margin-top: 20px; padding: 20px; border: 1px solid rgba(120,255,160,.3); border-radius: var(--radius); background: rgba(120,255,160,.04); text-align: center; }
.completion-banner span { color: #78ffa0; font-family: var(--font-mono); font-size: 9px; }
.completion-banner strong { display: block; margin-top: 6px; color: var(--text-primary); font-family: var(--font-display); font-size: 28px; }
.completion-banner p { margin-top: 6px; color: var(--text-secondary); font-size: 12px; }

@media (max-width: 680px) {
  .question-row { grid-template-columns: 1fr; gap: 6px; padding: 10px 12px; }
  .q-num { grid-column: 1; }
  .q-actions { width: 100%; }
  .answer-input { width: 100%; flex: 1; }
  .feedback-panel { padding-left: 12px; grid-template-columns: 1fr; }
  .exercise-head { align-items: flex-start; flex-direction: column; }
}
</style>
