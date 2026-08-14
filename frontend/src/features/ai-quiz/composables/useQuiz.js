import { computed, onMounted, ref } from 'vue'
import { buildPaper, isAnswerCorrect, scorePaper } from '../lib/scoring.js'
import { QUIZ_UI } from '../config/ui.js'

const STORAGE_KEY = 'ai-quiz-progress-v1'

export function useQuiz() {
  const data = ref(null)
  const loading = ref(true)
  const error = ref('')
  const view = ref('intro')
  const paper = ref([])
  const currentIndex = ref(0)
  const answers = ref([])
  const session = ref(null)
  const savedState = ref(loadSavedState())

  const dimensions = computed(() => data.value?.dimensions || [])
  const sources = computed(() => data.value?.sources || [])
  const currentQuestion = computed(() => paper.value[currentIndex.value])
  const currentAnswer = computed(() => answers.value.find(answer => answer.qId === currentQuestion.value?.id))
  const result = computed(() => {
    if (!session.value) return null
    return scorePaper({
      paper: paper.value,
      answers: answers.value,
      dimensions: dimensions.value,
      audience: session.value.audience,
    })
  })

  onMounted(loadData)

  async function loadData() {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('/ai-quiz-data/questions.json')
      if (!response.ok) throw new Error(`题库加载失败：${response.status}`)
      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '题库加载失败'
    } finally {
      loading.value = false
    }
  }

  function startQuiz(options) {
    const seed = options.seed || Number(new URLSearchParams(window.location.search).get('seed')) || Date.now()
    const count = options.mode === 'deep' ? QUIZ_UI.deepCount : QUIZ_UI.standardCount
    const nextPaper = buildPaper({
      questions: data.value?.questions || [],
      dimensions: dimensions.value,
      audience: options.audience,
      mode: options.mode,
      dimensionId: options.dimensionId,
      count,
      seed,
    })

    session.value = {
      sessionId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      audience: options.audience,
      mode: options.mode,
      dimensionId: options.dimensionId || '',
      seed,
      quizVersion: data.value?.quizVersion,
      startedAt: new Date().toISOString(),
    }
    paper.value = nextPaper
    answers.value = []
    currentIndex.value = 0
    view.value = 'running'
    persist()
  }

  function resumeQuiz() {
    if (!savedState.value || !data.value) return
    session.value = savedState.value.session
    paper.value = (savedState.value.paperIds || [])
      .map(id => data.value.questions.find(question => question.id === id))
      .filter(Boolean)
    answers.value = savedState.value.answers || []
    currentIndex.value = Math.min(savedState.value.currentIndex || 0, Math.max(paper.value.length - 1, 0))
    view.value = savedState.value.view || 'running'
  }

  function selectAnswer(selected) {
    if (!currentQuestion.value) return
    const existing = answers.value.find(answer => answer.qId === currentQuestion.value.id)
    if (existing?.submitted) return
    upsertAnswer({
      qId: currentQuestion.value.id,
      selected: Array.isArray(selected) ? selected : [selected],
      submitted: false,
      isCorrect: false,
      mistakeType: existing?.mistakeType || '',
    })
  }

  function submitCurrent() {
    if (!currentQuestion.value) return
    const existing = answers.value.find(answer => answer.qId === currentQuestion.value.id)
    const selected = existing?.selected || []
    if (!selected.length) return
    upsertAnswer({
      ...existing,
      qId: currentQuestion.value.id,
      selected,
      submitted: true,
      isCorrect: isAnswerCorrect(currentQuestion.value, selected),
    })
    persist()
  }

  function setMistakeType(qId, mistakeType) {
    const existing = answers.value.find(answer => answer.qId === qId)
    if (!existing) return
    upsertAnswer({ ...existing, mistakeType })
    persist()
  }

  function nextQuestion() {
    if (currentIndex.value < paper.value.length - 1) {
      currentIndex.value += 1
      persist()
      return
    }
    finish()
  }

  function previousQuestion() {
    currentIndex.value = Math.max(currentIndex.value - 1, 0)
    persist()
  }

  function finish() {
    view.value = 'result'
    persist()
  }

  function restart() {
    view.value = 'intro'
    session.value = null
    paper.value = []
    answers.value = []
    currentIndex.value = 0
    clearSavedState()
  }

  function clearSavedState() {
    localStorage.removeItem(STORAGE_KEY)
    savedState.value = null
  }

  function sourceById(id) {
    return sources.value.find(source => source.id === id)
  }

  function upsertAnswer(answer) {
    const index = answers.value.findIndex(item => item.qId === answer.qId)
    if (index >= 0) answers.value.splice(index, 1, answer)
    else answers.value.push(answer)
    persist()
  }

  function persist() {
    if (!session.value) return
    const state = {
      session: session.value,
      paperIds: paper.value.map(question => question.id),
      answers: answers.value,
      currentIndex: currentIndex.value,
      view: view.value,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    savedState.value = state
  }

  return {
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
    sources,
    currentQuestion,
    currentAnswer,
    result,
    startQuiz,
    resumeQuiz,
    selectAnswer,
    submitCurrent,
    setMistakeType,
    nextQuestion,
    previousQuestion,
    finish,
    restart,
    clearSavedState,
    sourceById,
  }
}

function loadSavedState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}
