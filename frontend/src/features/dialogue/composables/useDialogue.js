/*
  与影对谈 — 对话状态与流式客户端

  后端契约（frontend/_worker.js 的 POST /api/chat）：
  - 请求体带 stream: true 时返回 text/event-stream，事件为 data: <JSON>
    - { type: 'meta',    ... }  生成前的元信息（心境/缘分/来源/工具状态）
    - { type: 'delta',   text } 增量文本
    - { type: 'replace', text } 修订后的完整文本（可选，出现时需要替换已累积内容）
    - { type: 'done',    ... }  与非流式响应完全一致的完整负载
    - { type: 'error',   message }
  - 不带 stream 时保持原有一次性 JSON 行为。

  本文件同时兼容以上两种返回，便于后端未升级或本地代理不支持流式时自动降级。
*/
import { computed, reactive, ref } from 'vue'

const API_BASE = '/api'
const STORAGE_KEY = 'shrine-ei-dialogue-v3'
const HISTORY_LIMIT = 20
const MEMORY_LIMIT = 12

export const DIALOGUE_PROMPTS = [
  { label: '永恒与须臾', text: '经历稻妻的改变后，你现在如何理解永恒与须臾？' },
  { label: '关于姐姐', text: '可以和我说说姐姐雷电真吗？' },
  { label: '武艺切磋', text: '如果要与你切磋武艺，我应该先准备什么？' },
  { label: '团子牛奶', text: '要一起去稻城喝团子牛奶吗？' },
  { label: '眼狩令', text: '眼狩令的事，你后来是怎么想的？' },
  { label: '八重神子', text: '你和八重神子平时是怎么相处的？' },
]

function createSession() {
  return {
    persona: 'shogun',
    personaLabel: '御前',
    emotion: 'composed',
    emotionLabel: '沉静',
    relationship: 'stranger',
    relationshipLabel: '初识',
    trustScore: 0,
    turnCount: 0,
    memory: [],
  }
}

/** 来源标签：区分知识库、GitHub 档案、网络搜索与站内资料 */
export function sourceTierLabel(source) {
  if (source.sourceType === 'knowledge') return '设定'
  if (source.sourceType === 'github') return '档案'
  if (source.sourceType === 'web') return '实时'
  return '站内'
}

function normalizeSources(value) {
  if (!Array.isArray(value)) return []
  return value.filter(source => source && source.url)
}

function normalizeKnowledgeMatches(value) {
  return Array.isArray(value) ? value : []
}

export function useDialogue() {
  const messages = reactive([])
  const session = reactive(createSession())
  const loading = ref(false)
  const input = ref('')
  const connectionError = ref('')
  const phase = ref('')
  const lastToolState = reactive({ web: null, github: null, personaCard: null, model: null, params: null, safety: null })

  const userMessageCount = computed(() => messages.filter(message => message.role === 'user').length)
  const hasConversation = computed(() => userMessageCount.value > 0)

  function resetSession() {
    Object.assign(session, createSession())
  }

  function pushGreeting() {
    messages.push({
      role: 'assistant',
      content: '雷光已静。旅者，既然来到一心净土，便说说你此刻所想吧。',
      personaLabel: '御前',
      createdAt: new Date().toISOString(),
    })
  }

  function initChat() {
    messages.length = 0
    pushGreeting()
  }

  function restoreChat() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (!saved || !Array.isArray(saved.messages)) throw new Error('empty')
      const restored = saved.messages
        .filter(message => message?.role === 'user' || message?.role === 'assistant')
        .filter(message => typeof message.content === 'string' && message.content.trim())
        .slice(-HISTORY_LIMIT)
      if (!restored.length) throw new Error('empty')
      messages.push(...restored)
      if (saved.session && typeof saved.session === 'object') {
        Object.assign(session, saved.session, {
          memory: Array.isArray(saved.session.memory) ? saved.session.memory.slice(-MEMORY_LIMIT) : [],
        })
      }
      if (saved.tools && typeof saved.tools === 'object') Object.assign(lastToolState, saved.tools)
    } catch {
      resetSession()
      initChat()
    }
  }

  function saveChat() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: messages.slice(-HISTORY_LIMIT),
        session: { ...session, memory: session.memory.slice(-MEMORY_LIMIT) },
        tools: { ...lastToolState },
      }))
    } catch {
      // 对话仍可继续；存储不可用时仅失去跨刷新记忆。
    }
  }

  function mergeMemoryUpdates(updates) {
    if (!Array.isArray(updates)) return
    const merged = new Map(session.memory.map(item => [item.key, item]))
    for (const item of updates) {
      if (!item?.key || !item?.value) continue
      merged.set(item.key, { kind: item.kind, key: item.key, value: item.value })
    }
    session.memory = [...merged.values()].slice(-MEMORY_LIMIT)
  }

  function applySession(payload) {
    Object.assign(session, {
      persona: payload.persona || session.persona,
      personaLabel: payload.personaLabel || session.personaLabel,
      emotion: payload.emotion || session.emotion,
      emotionLabel: payload.emotionLabel || session.emotionLabel,
      relationship: payload.relationship || session.relationship,
      relationshipLabel: payload.relationshipLabel || session.relationshipLabel,
      trustScore: Number.isFinite(payload.trustScore) ? payload.trustScore : session.trustScore,
      turnCount: Number.isFinite(payload.turnCount) ? payload.turnCount : session.turnCount,
    })
  }

  function applyToolState(payload) {
    if (payload.webSearch) lastToolState.web = payload.webSearch
    if (payload.githubTool) lastToolState.github = payload.githubTool
    if (payload.personaCard) lastToolState.personaCard = payload.personaCard
    if (payload.model) lastToolState.model = payload.model
    if (payload.parameters) lastToolState.params = payload.parameters
    if (payload.safety) lastToolState.safety = payload.safety
  }

  /** meta / done 中的公共字段写入助手消息 */
  function applyMeta(payload, target) {
    applySession(payload)
    applyToolState(payload)
    if (Array.isArray(payload.sources)) target.sources = normalizeSources(payload.sources)
    if (payload.knowledgeVersion) target.knowledgeVersion = payload.knowledgeVersion
    if (payload.retrievedAt) target.retrievedAt = payload.retrievedAt
    if (Array.isArray(payload.knowledgeMatches)) target.knowledgeMatches = normalizeKnowledgeMatches(payload.knowledgeMatches)
    if (payload.personaLabel) target.personaLabel = payload.personaLabel
  }

  function applyDone(payload, target) {
    applyMeta(payload, target)
    if (typeof payload.content === 'string' && payload.content.trim()) target.content = payload.content
    target.streaming = false
    mergeMemoryUpdates(payload.memoryUpdates)
  }

  /** 解析 SSE 数据块：只识别 data: 行，忽略注释与心跳 */
  function extractEvents(block) {
    const events = []
    for (const line of block.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        events.push(JSON.parse(data))
      } catch {
        // 忽略无法解析的行，避免单个坏块中断整段对话
      }
    }
    return events
  }

  async function consumeStream(body, target) {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let streamError = ''

    const handle = (event) => {
      if (!event || typeof event !== 'object') return
      if (event.type === 'meta') {
        applyMeta(event, target)
        phase.value = ''
      } else if (event.type === 'delta') {
        if (typeof event.text === 'string') target.content += event.text
        phase.value = ''
      } else if (event.type === 'replace') {
        if (typeof event.text === 'string' && event.text.trim()) target.content = event.text
      } else if (event.type === 'done') {
        applyDone(event, target)
      } else if (event.type === 'error') {
        streamError = event.message || '生成中断'
      }
    }

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let index = buffer.indexOf('\n\n')
      while (index !== -1) {
        const block = buffer.slice(0, index)
        buffer = buffer.slice(index + 2)
        for (const event of extractEvents(block)) handle(event)
        index = buffer.indexOf('\n\n')
      }
    }
    if (buffer.trim()) {
      for (const event of extractEvents(buffer)) handle(event)
    }
    if (streamError) throw new Error(streamError)
  }

  async function send(text) {
    const content = (text ?? input.value).trim()
    if (!content || loading.value) return

    input.value = ''
    connectionError.value = ''
    messages.push({ role: 'user', content, createdAt: new Date().toISOString() })
    saveChat()

    const target = reactive({
      role: 'assistant',
      content: '',
      streaming: true,
      personaLabel: session.personaLabel,
      sources: [],
      knowledgeVersion: null,
      retrievedAt: null,
      knowledgeMatches: [],
    })
    messages.push(target)
    loading.value = true
    phase.value = '正在通读一心净土之外的消息……'

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          stream: true,
          messages: messages
            .filter(message => (message.role === 'user' || message.role === 'assistant') && !message.streaming)
            .slice(-HISTORY_LIMIT)
            .map(message => ({ role: message.role, content: message.content })),
          session: {
            persona: session.persona,
            relationship: session.relationship,
            trustScore: session.trustScore,
            turnCount: session.turnCount,
            memory: session.memory,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream') && response.body) {
        await consumeStream(response.body, target)
      } else {
        // 后端未升级或代理不支持流式时的降级路径
        const data = await response.json()
        applyDone(data, target)
      }

      target.streaming = false
      if (!target.content.trim()) {
        target.content = '……（此番未能成句。）'
      }
      saveChat()
    } catch (error) {
      target.streaming = false
      connectionError.value = `连接失败：${error.message}`
      if (!target.content.trim()) {
        target.content = '一心净土的门扉暂未开启……稍后再试吧，旅者。'
      }
      saveChat()
    } finally {
      loading.value = false
      phase.value = ''
    }
  }

  function clearChat() {
    localStorage.removeItem(STORAGE_KEY)
    resetSession()
    Object.assign(lastToolState, { web: null, github: null, personaCard: null, model: null, params: null, safety: null })
    initChat()
    connectionError.value = ''
  }

  return {
    messages,
    session,
    loading,
    input,
    connectionError,
    phase,
    lastToolState,
    userMessageCount,
    hasConversation,
    prompts: DIALOGUE_PROMPTS,
    restoreChat,
    send,
    clearChat,
    sourceTierLabel,
  }
}
