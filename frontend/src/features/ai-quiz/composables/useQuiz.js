import { computed, onMounted, ref } from 'vue'
import { buildPaper, isAnswerCorrect, scorePaper } from '../lib/scoring.js'
import { QUIZ_UI } from '../config/ui.js'

const STORAGE_KEY = 'ai-quiz-progress-v1'
const DATA_BASE = '/ai-quiz-data'

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
      const response = await fetch(`${DATA_BASE}/manifest.json`)
      if (!response.ok) throw new Error(`题库索引加载失败：${response.status}`)
      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '题库索引加载失败'
    } finally {
      loading.value = false
    }
  }

  async function startQuiz(options) {
    if (!data.value) return
    const seed = options.seed || Number(new URLSearchParams(window.location.search).get('seed')) || Date.now()
    const count = options.mode === 'deep' ? QUIZ_UI.deepCount : QUIZ_UI.standardCount
    const metaPaper = buildPaper({
      questions: data.value.questions || [],
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

    loading.value = true
    error.value = ''
    try {
      paper.value = await hydratePaper(metaPaper)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '题目加载失败'
      loading.value = false
      return
    }
    answers.value = []
    currentIndex.value = 0
    view.value = 'running'
    loading.value = false
    persist()
  }

  async function resumeQuiz() {
    if (!savedState.value || !data.value) return
    const metaQuestions = (savedState.value.paperIds || [])
      .map(id => data.value.questions.find(question => question.id === id))
      .filter(Boolean)
    if (!metaQuestions.length) return

    session.value = savedState.value.session
    loading.value = true
    error.value = ''
    try {
      paper.value = await hydratePaper(metaQuestions)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '题目加载失败'
      loading.value = false
      return
    }
    answers.value = savedState.value.answers || []
    currentIndex.value = Math.min(savedState.value.currentIndex || 0, Math.max(paper.value.length - 1, 0))
    view.value = savedState.value.view || 'running'
    loading.value = false
  }

  async function hydratePaper(metaQuestions) {
    const files = [...new Set(metaQuestions.map(question => question.file).filter(Boolean))]
    const contentById = new Map()
    await Promise.all(files.map(async file => {
      const chunk = await fetchChunk(file)
      for (const content of chunk.questions || []) contentById.set(content.id, content)
    }))
    return metaQuestions.map(meta => {
      const content = contentById.get(meta.id)
      if (!content) throw new Error(`题目 ${meta.id} 正文缺失`)
      return { ...meta, ...content }
    })
  }

  async function fetchChunk(file) {
    const response = await fetch(`${DATA_BASE}/${file}`)
    if (!response.ok) throw new Error(`题库分片加载失败：${response.status}`)
    return response.json()
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
