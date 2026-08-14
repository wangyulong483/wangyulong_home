<template>
  <section class="quiz-runner">
    <div class="top-progress">
      <span>第 {{ currentIndex + 1 }} / {{ paper.length }} 题 · {{ session.audience }} · {{ session.mode }}</span>
      <div class="progress-track">
        <span :style="{ width: `${progress}%` }"></span>
      </div>
    </div>

    <div class="runner-layout">
      <article class="question-card">
        <div class="question-meta">
          <span>{{ dimensionTitle }}</span>
          <span>{{ question.difficulty }}</span>
          <span>{{ question.cognitiveLevel }}</span>
          <span v-if="question.volatility === 'high'" class="stale">高时效</span>
        </div>

        <h2>{{ question.prompt }}</h2>

        <div class="options" :class="`type-${question.type}`">
          <button
            v-for="(option, index) in question.options"
            :key="option"
            type="button"
            :class="optionClass(index)"
            :disabled="answer?.submitted"
            @click="toggleOption(index)"
          >
            <span>{{ optionLabel(index) }}</span>
            <strong>{{ option }}</strong>
          </button>
        </div>

        <div v-if="answer?.submitted" class="feedback" :class="{ correct: answer.isCorrect }">
          <strong>{{ answer.isCorrect ? '回答正确' : '本题答错了' }}</strong>
          <p>{{ question.explanation }}</p>
          <p class="evidence">依据：{{ question.evidence }}</p>
          <div class="sources">
            <a
              v-for="source in sourceList"
              :key="source.id"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ source.title }}
            </a>
          </div>
        </div>

        <div class="question-actions">
          <button class="btn" type="button" :disabled="currentIndex === 0" @click="$emit('prev')">
            <AppIcon icon="arrow-left" size="14" /> 上一题
          </button>
          <button v-if="!answer?.submitted" class="btn btn-primary" type="button" :disabled="!hasSelection" @click="$emit('submit')">
            提交
          </button>
          <button v-else class="btn btn-primary" type="button" @click="$emit('next')">
            {{ currentIndex === paper.length - 1 ? '查看结果' : '下一题' }}
            <AppIcon icon="arrow-right" size="14" />
          </button>
        </div>
      </article>

      <aside class="quiz-aside">
        <strong>维度覆盖</strong>
        <div class="coverage">
          <div v-for="item in coverage" :key="item.id">
            <span>{{ item.title }}</span>
            <small>{{ item.done }}/{{ item.total }}</small>
          </div>
        </div>
        <p>本次测评按题等权计分，结果仅为自测参考。</p>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const props = defineProps({
  paper: { type: Array, required: true },
  currentIndex: { type: Number, required: true },
  answers: { type: Array, required: true },
  dimensions: { type: Array, required: true },
  session: { type: Object, required: true },
  sourceById: { type: Function, required: true },
})

const emit = defineEmits(['select', 'submit', 'next', 'prev'])

const question = computed(() => props.paper[props.currentIndex])
const answer = computed(() => props.answers.find(item => item.qId === question.value?.id))
const selected = computed(() => answer.value?.selected || [])
const hasSelection = computed(() => selected.value.length > 0)
const progress = computed(() => Math.round(((props.currentIndex + 1) / props.paper.length) * 100))
const dimensionTitle = computed(() => props.dimensions.find(item => item.id === question.value?.dimension)?.title || question.value.dimension)
const sourceList = computed(() => (question.value.sourceIds || []).map(props.sourceById).filter(Boolean))

const coverage = computed(() => props.dimensions.map(dimension => {
  const items = props.paper.filter(item => item.dimension === dimension.id)
  const done = items.filter(item => props.answers.find(answerItem => answerItem.qId === item.id)?.submitted).length
  return { id: dimension.id, title: dimension.title, total: items.length, done }
}))

function toggleOption(index) {
  if (question.value.type === 'multiple') {
    const next = selected.value.includes(index)
      ? selected.value.filter(item => item !== index)
      : [...selected.value, index]
    emit('select', next)
    return
  }
  emit('select', [index])
}

function optionClass(index) {
  return {
    selected: selected.value.includes(index),
    submitted: answer.value?.submitted,
    correct: answer.value?.submitted && correctAnswer().includes(index),
    wrong: answer.value?.submitted && selected.value.includes(index) && !correctAnswer().includes(index),
  }
}

function correctAnswer() {
  return Array.isArray(question.value.answer) ? question.value.answer : [question.value.answer]
}

function optionLabel(index) {
  return question.value.type === 'judge' ? ['T', 'F'][index] : String.fromCharCode(65 + index)
}
</script>

<style scoped>
.quiz-runner {
  display: grid;
  gap: 16px;
}

.top-progress {
  display: grid;
  gap: 8px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.04);
}

.progress-track span {
  display: block;
  height: 100%;
  background: var(--signal);
}

.runner-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  align-items: start;
}

.question-card,
.quiz-aside {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
}

.question-card {
  padding: 24px;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.question-meta span {
  padding: 3px 7px;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
}

.question-meta .stale {
  border-color: rgba(234, 255, 87, 0.36);
  color: var(--signal);
}

h2 {
  margin: 0 0 18px;
  font-family: var(--font-body);
  font-size: 20px;
  line-height: 1.55;
}

.options {
  display: grid;
  gap: 10px;
}

.options button {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.035);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.options button span {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.options button strong {
  font-weight: 600;
}

.options button.selected {
  border-color: var(--signal);
  background: var(--signal-muted);
}

.options button.correct {
  border-color: rgba(69, 211, 139, 0.7);
}

.options button.wrong {
  border-color: rgba(255, 105, 105, 0.72);
}

.options button:disabled {
  cursor: default;
}

.feedback {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(255, 105, 105, 0.32);
  border-radius: var(--radius);
  background: rgba(255, 105, 105, 0.08);
}

.feedback.correct {
  border-color: rgba(69, 211, 139, 0.42);
  background: rgba(69, 211, 139, 0.08);
}

.feedback p {
  color: var(--text-secondary);
  font-size: 13px;
}

.feedback .evidence {
  color: var(--text-tertiary);
}

.sources {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sources a {
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 10px;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
}

.quiz-aside {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.quiz-aside strong {
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 11px;
}

.coverage {
  display: grid;
  gap: 8px;
}

.coverage div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 12px;
}

.coverage small,
.quiz-aside p {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
}

@media (max-width: 960px) {
  .runner-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .question-card {
    padding: 16px;
  }

  h2 {
    font-size: 17px;
  }

  .options button {
    grid-template-columns: 32px 1fr;
  }

  .question-actions {
    flex-wrap: wrap;
  }
}
</style>
