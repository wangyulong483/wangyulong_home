const PROFESSIONAL_LEVELS = [
  {
    min: 0,
    max: 39,
    name: '探索者',
    description: '你正在建立对 AI 应用的基础感知。当前阶段的重点是拓宽视野，了解大模型能做什么、在什么条件下会失效。',
  },
  {
    min: 40,
    max: 59,
    name: '使用者',
    description: '你已具备日常调用 AI 工具的基本意识。接下来建议在真实工作流中刻意观察模型的边界与失效模式。',
  },
  {
    min: 60,
    max: 74,
    name: '实践者',
    description: '你能够将 AI 能力对接具体场景，在 Prompt 设计、工具选择或 RAG 搭建中做出初步判断。',
  },
  {
    min: 75,
    max: 89,
    name: '构建者',
    description: '你已具备搭建 AI 应用系统的能力，能在 Agent 编排、MCP 集成或安全评估中做出权衡。',
  },
  {
    min: 90,
    max: 100,
    name: '编排者',
    description: '你对 AI 应用全栈有较为系统的把握，能在模型、工具、安全与评测之间做全局决策。',
  },
]

const GENERAL_LEVELS = [
  { min: 0, max: 39, name: 'AI 新手', description: '刚开始用 AI，主要在摸索。当前重点是建立「AI 会说错话」的认知，学会验证输出。' },
  { min: 40, max: 59, name: 'AI 熟手', description: '能用 AI 完成日常写、译、总结，开始有意识地写提示词。建议学会给 AI 明确的背景与约束。' },
  { min: 60, max: 74, name: 'AI 达人', description: '能把 AI 用得顺手，懂得选对工具、给对上下文。下一步是让 AI 稳定输出你要的结构。' },
  { min: 75, max: 89, name: 'AI 高手', description: '能用 AI 明显提效，并注意隐私与边界。可尝试把 AI 接入自己的工作流。' },
  { min: 90, max: 100, name: 'AI 行家', description: '你已把 AI 融入日常，用得克制又高效。可挑战工程构建能力版，理解这些工具底层怎么运作。' },
]

export function createSeededRandom(seed = Date.now()) {
  let value = Number(seed)
  if (!Number.isFinite(value)) value = hashString(String(seed))
  value = (value >>> 0) || 1
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function buildPaper({ questions, dimensions, audience = 'professional', mode = 'standard', dimensionId = '', count = 20, seed = Date.now() }) {
  const random = createSeededRandom(seed)
  const pool = questions.filter(question => {
    const audienceMatch = Array.isArray(question.audience) && question.audience.includes(audience)
    const dimensionMatch = mode !== 'deep' || question.dimension === dimensionId
    return audienceMatch && dimensionMatch
  })

  if (mode === 'deep') {
    return shuffle(pool, random).slice(0, Math.min(count, pool.length))
  }

  const selected = []
  const selectedIds = new Set()
  const dimensionIds = dimensions.map(dimension => dimension.id)

  for (const id of dimensionIds) {
    const dimensionPool = shuffle(pool.filter(question => question.dimension === id), random)
    for (const question of dimensionPool.slice(0, 2)) addQuestion(question, selected, selectedIds)
  }

  const remaining = shuffle(pool.filter(question => !selectedIds.has(question.id)), random)
  while (selected.length < count && remaining.length) {
    addQuestion(remaining.shift(), selected, selectedIds)
  }

  return shuffle(selected, random).slice(0, Math.min(count, selected.length))
}

export function normalizeSelected(selected) {
  if (selected == null) return []
  return Array.isArray(selected) ? selected.map(Number).sort((a, b) => a - b) : [Number(selected)]
}

export function isAnswerCorrect(question, selected) {
  const normalized = normalizeSelected(selected)
  const answer = Array.isArray(question.answer) ? [...question.answer].sort((a, b) => a - b) : [Number(question.answer)]
  return normalized.length === answer.length && normalized.every((item, index) => item === answer[index])
}

export function scorePaper({ paper, answers, dimensions, audience = 'professional' }) {
  const answerMap = new Map(answers.map(answer => [answer.qId, answer]))
  const graded = paper.map(question => {
    const selected = normalizeSelected(answerMap.get(question.id)?.selected)
    const isCorrect = isAnswerCorrect(question, selected)
    return {
      question,
      selected,
      isCorrect,
      mistakeType: answerMap.get(question.id)?.mistakeType || '',
    }
  })

  const correctCount = graded.filter(item => item.isCorrect).length
  const total = paper.length
  const score = total ? Math.round((correctCount / total) * 100) : 0
  const dimensionScores = dimensions.map(dimension => {
    const items = graded.filter(item => item.question.dimension === dimension.id)
    const correct = items.filter(item => item.isCorrect).length
    return {
      id: dimension.id,
      title: dimension.title,
      total: items.length,
      correct,
      score: items.length ? Math.round((correct / items.length) * 100) : 0,
    }
  })

  return {
    score,
    total,
    correctCount,
    level: getLevel(score, audience),
    dimensionScores,
    wrongAnswers: graded.filter(item => !item.isCorrect),
    profile: buildProfile({ graded, dimensionScores }),
  }
}

export function getLevel(score, audience = 'professional') {
  const levels = audience === 'general' ? GENERAL_LEVELS : PROFESSIONAL_LEVELS
  return levels.find(level => score >= level.min && score <= level.max) || levels[0]
}

function addQuestion(question, selected, selectedIds) {
  if (!question || selectedIds.has(question.id)) return
  selected.push(question)
  selectedIds.add(question.id)
}

function shuffle(items, random) {
  const output = [...items]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[output[index], output[swapIndex]] = [output[swapIndex], output[index]]
  }
  return output
}

function hashString(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function buildProfile({ graded, dimensionScores }) {
  const available = dimensionScores.filter(item => item.total > 0)
  if (!available.length) return '完成一组题目后，这里会生成基于本次答题的能力画像。'

  const sorted = [...available].sort((a, b) => b.score - a.score)
  const strongest = sorted.slice(0, 2).map(item => `「${item.title}」`).join('与')
  const weakest = sorted[sorted.length - 1]
  const wrong = graded.filter(item => !item.isCorrect)
  const mistakeType = mostCommon(wrong.map(item => item.mistakeType).filter(Boolean))
  const suffix = mistakeType ? `，错因以「${mistakeType}」为主` : ''

  if (!wrong.length) {
    return `本次测评中你在多数维度表现稳定，尤其是${strongest}。高分不等于全栈精通，建议通过实际项目继续验证。`
  }

  return `本次测评中，你在${strongest}的相对表现较好；主要失分集中在「${weakest.title}」${suffix}。以上仅为基于 ${graded.length} 题的粗略画像，受抽题随机性影响较大。`
}

function mostCommon(values) {
  const counts = new Map()
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}
