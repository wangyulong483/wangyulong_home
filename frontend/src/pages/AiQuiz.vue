<template>
  <div class="ai-quiz-page">
    <header class="header ai-quiz-header">
      <div class="header-copy">
        <router-link class="back-link" to="/applist">
          <AppIcon icon="arrow-left" size="13" /> 应用终端
        </router-link>
        <p class="module-code">MODULE // AI-QUIZ-05</p>
        <h1>AI 应用能力测评</h1>
        <p class="subtitle">LOCAL STATIC QUIZ / SCENARIO JUDGEMENT / NO CERTIFICATION</p>
      </div>
      <div class="header-tags" aria-label="模块标签">
        <span>STATIC</span>
        <span>LOCAL SCORE</span>
        <span>2026-08</span>
      </div>
    </header>

    <main class="quiz-workspace">
      <div v-if="loading" class="loading-panel">题库加载中...</div>
      <div v-else-if="error" class="loading-panel error">{{ error }}</div>
      <QuizIntro
        v-else-if="view === 'intro'"
        :dimensions="dimensions"
        :saved-state="savedState"
        :quiz-version="data?.quizVersion"
        @start="startQuiz"
        @resume="resumeQuiz"
        @clear-progress="clearSavedState"
      />
      <QuizRunner
        v-else-if="view === 'running' && currentQuestion"
        :paper="paper"
        :current-index="currentIndex"
        :answers="answers"
        :dimensions="dimensions"
        :session="session"
        :source-by-id="sourceById"
        @select="selectAnswer"
        @submit="submitCurrent"
        @next="nextQuestion"
        @prev="previousQuestion"
      />
      <QuizResult
        v-else-if="view === 'result' && result"
        :result="result"
        :dimensions="dimensions"
        @restart="restart"
        @start-deep="restart"
        @set-mistake-type="setMistakeType"
      />
    </main>
  </div>
</template>

<script setup>
import AppIcon from '@/shared/components/AppIcon.vue'
import QuizIntro from '@/features/ai-quiz/components/QuizIntro.vue'
import QuizRunner from '@/features/ai-quiz/components/QuizRunner.vue'
import QuizResult from '@/features/ai-quiz/components/QuizResult.vue'
import { useQuiz } from '@/features/ai-quiz/composables/useQuiz.js'

const {
  data,
  loading,
  error,
  view,
  paper,
  currentIndex,
  answers,
  session,
  savedState,
  dimensions,
  currentQuestion,
  result,
  startQuiz,
  resumeQuiz,
  selectAnswer,
  submitCurrent,
  setMistakeType,
  nextQuestion,
  previousQuestion,
  restart,
  clearSavedState,
  sourceById,
} = useQuiz()
</script>

<style scoped>
.ai-quiz-page {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.ai-quiz-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

.header-copy {
  min-width: 0;
}

.back-link {
  display: inline-flex;
  margin-bottom: 20px;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--signal);
}

.module-code {
  margin-bottom: 8px;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 9px;
}

.header-tags {
  display: flex;
  padding-bottom: 5px;
  gap: 6px;
}

.header-tags span {
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
}

.header-tags span:first-child {
  border-color: rgba(234, 255, 87, 0.28);
  color: var(--signal);
}

.quiz-workspace {
  display: grid;
  gap: 18px;
}

.loading-panel {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.loading-panel.error {
  border-color: rgba(255, 105, 105, 0.52);
  color: #ff9a9a;
}

@media (max-width: 640px) {
  .ai-quiz-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .header-tags {
    padding-bottom: 0;
  }
}
</style>
