<template>
  <section class="chat-module">
    <header class="module-header">
      <div>
        <p class="module-kicker">PLANE OF EUTHYMIA / LIVE</p>
        <h2>一心净土通讯</h2>
        <p class="module-meta">雷电影角色设定对话 · DeepSeek V4 Flash 0731</p>
      </div>
      <span class="status-badge"><i></i> SYSTEM ONLINE</span>
    </header>

    <div class="chat-shell">
      <div class="conversation-panel">
        <div class="chat-toolbar">
          <div class="chat-state">
            <span><AppIcon icon="message" size="14" /> 对话 · {{ userMessageCount }}</span>
            <span>心境 · {{ session.personaLabel }}</span>
            <span>缘分 · {{ session.relationshipLabel }}</span>
          </div>
          <button v-if="messages.length > 1" type="button" class="clear-btn" @click="clearChat">
            <AppIcon icon="8-ui/cross" size="12" /> 清空
          </button>
        </div>

        <div ref="chatArea" class="chat-area" aria-live="polite">
          <div v-if="messages.length <= 1 && !loading" class="welcome-panel">
            <span class="welcome-mark"><AppIcon icon="lightning" size="25" /></span>
            <h3>与影谈谈吧</h3>
            <p>浮世景色百千年依旧，人之在世却如白露与泡影。</p>
            <div class="prompt-list">
              <button v-for="prompt in prompts" :key="prompt.label" type="button" @click="usePrompt(prompt.text)">
                {{ prompt.label }} <AppIcon icon="arrow-right" size="12" />
              </button>
            </div>
          </div>

          <div v-for="(message, index) in messages" :key="index" class="message-row" :class="message.role">
            <span class="message-avatar" aria-hidden="true">
              <AppIcon :icon="message.role === 'assistant' ? 'lightning' : 'user'" size="16" />
            </span>
            <div class="message-content">
              <span class="message-sender">
                {{ message.role === 'assistant' ? `雷电影 · ${message.personaLabel || session.personaLabel}` : '旅者' }}
              </span>
              <p>{{ message.content }}</p>
              <div v-if="message.role === 'assistant' && message.sources?.length" class="response-sources">
                <span>
                  本轮知识与检索来源
                  <small v-if="message.knowledgeVersion">KB {{ message.knowledgeVersion }}</small>
                </span>
                <a
                  v-for="(source, sourceIndex) in message.sources"
                  :key="`${source.url}-${sourceIndex}`"
                  :href="source.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  [{{ sourceIndex + 1 }}] {{ source.title }} · {{ source.source }}
                  <em>{{ source.sourceType === 'knowledge' ? '设定' : '实时' }}</em>
                </a>
              </div>
            </div>
          </div>

          <div v-if="loading" class="message-row assistant">
            <span class="message-avatar" aria-hidden="true"><AppIcon icon="lightning" size="16" /></span>
            <div class="message-content typing" aria-label="正在回复">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="composer">
          <textarea
            v-model="input"
            rows="2"
            maxlength="500"
            placeholder="向雷电影诉说……"
            :disabled="loading"
            @keydown.enter.exact.prevent="sendMsg"
          ></textarea>
          <div class="composer-actions">
            <span>{{ input.length }} / 500</span>
            <button type="button" class="send-btn" :disabled="!input.trim() || loading" @click="sendMsg">
              <AppIcon icon="message" size="15" /> 发送
            </button>
          </div>
          <p v-if="connectionError" class="error-message">{{ connectionError }}</p>
        </div>
      </div>

      <aside class="source-sidebar">
        <div class="source-heading">
          <AppIcon icon="document" size="17" />
          <div>
            <strong>角色设定与实时检索</strong>
            <span>SOURCE INDEX / LIVE</span>
          </div>
        </div>

        <ol class="source-list">
          <li>
            <span>01</span>
            <div><strong>游戏内角色档案与语音</strong><small>角色故事、好感语音、传说任务</small></div>
          </li>
          <li>
            <span>02</span>
            <div>
              <a href="https://www.bilibili.com/video/BV1Y3411B7SX" target="_blank" rel="noopener noreferrer">官方角色PV「噩梦」</a>
              <small>原神官方</small>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <a href="https://www.bilibili.com/video/BV1rb4y1m7My" target="_blank" rel="noopener noreferrer">拾枝杂谈「鸣雷寂灭」</a>
              <small>原神官方</small>
            </div>
          </li>
        </ol>

        <div class="generation-note">
          <strong>生成说明</strong>
          <p>回复由 DeepSeek V4 Flash 0731 根据角色档案、站内知识与本轮检索生成，仅供角色扮演与娱乐，不代表原神官方观点。</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const API_BASE = '/api'
const STORAGE_KEY = 'shrine-ei-dialogue-v2'

const messages = reactive([])
const session = reactive({
  persona: 'shogun',
  personaLabel: '御前',
  emotion: 'composed',
  relationship: 'stranger',
  relationshipLabel: '初识',
  trustScore: 0,
  turnCount: 0,
  memory: []
})
const loading = ref(false)
const input = ref('')
const chatArea = ref(null)
const connectionError = ref('')
const userMessageCount = computed(() => messages.filter(message => message.role === 'user').length)

const prompts = [
  { label: '永恒与须臾', text: '经历稻妻的改变后，你现在如何理解永恒与须臾？' },
  { label: '雷电真', text: '可以和我说说姐姐雷电真吗？' },
  { label: '团子牛奶', text: '要一起去稻妻城喝团子牛奶吗？' },
  { label: '武艺切磋', text: '如果要与你切磋武艺，我应该先准备什么？' }
]

function resetSession() {
  Object.assign(session, {
    persona: 'shogun',
    personaLabel: '御前',
    emotion: 'composed',
    relationship: 'stranger',
    relationshipLabel: '初识',
    trustScore: 0,
    turnCount: 0,
    memory: []
  })
}

function initChat() {
  messages.length = 0
  messages.push({
    role: 'assistant',
    content: '雷光已静。旅者，既然来到一心净土，便说说你此刻所想吧。',
    personaLabel: '御前'
  })
}

function restoreChat() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved || !Array.isArray(saved.messages)) throw new Error('empty')
    const restored = saved.messages
      .filter(message => message?.role === 'user' || message?.role === 'assistant')
      .filter(message => typeof message.content === 'string' && message.content.trim())
      .slice(-20)
    if (!restored.length) throw new Error('empty')
    messages.push(...restored)
    if (saved.session && typeof saved.session === 'object') {
      Object.assign(session, saved.session, {
        memory: Array.isArray(saved.session.memory) ? saved.session.memory.slice(-12) : []
      })
    }
  } catch {
    resetSession()
    initChat()
  }
}

function saveChat() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      messages: messages.slice(-20),
      session: { ...session, memory: session.memory.slice(-12) }
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
  session.memory = [...merged.values()].slice(-12)
}

async function scrollToBottom() {
  await nextTick()
  if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight
}

function usePrompt(value) {
  input.value = value
  sendMsg()
}

async function sendMsg() {
  const text = input.value.trim()
  if (!text || loading.value) return

  input.value = ''
  messages.push({ role: 'user', content: text })
  saveChat()
  await scrollToBottom()
  loading.value = true
  connectionError.value = ''

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages
          .filter(message => message.role === 'user' || message.role === 'assistant')
          .slice(-20)
          .map(message => ({ role: message.role, content: message.content })),
        session: {
          persona: session.persona,
          relationship: session.relationship,
          trustScore: session.trustScore,
          turnCount: session.turnCount,
          memory: session.memory
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    const data = await response.json()
    mergeMemoryUpdates(data.memoryUpdates)
    Object.assign(session, {
      persona: data.persona || session.persona,
      personaLabel: data.personaLabel || session.personaLabel,
      emotion: data.emotion || session.emotion,
      relationship: data.relationship || session.relationship,
      relationshipLabel: data.relationshipLabel || session.relationshipLabel,
      trustScore: Number.isFinite(data.trustScore) ? data.trustScore : session.trustScore,
      turnCount: Number.isFinite(data.turnCount) ? data.turnCount : session.turnCount
    })
    messages.push({
      role: 'assistant',
      content: data.content || '……',
      personaLabel: data.personaLabel || session.personaLabel,
      sources: Array.isArray(data.sources) ? data.sources.filter(source => source.url) : [],
      retrievedAt: data.retrievedAt || null,
      knowledgeVersion: data.knowledgeVersion || null,
      knowledgeMatches: Array.isArray(data.knowledgeMatches) ? data.knowledgeMatches : [],
    })
    saveChat()
  } catch (error) {
    connectionError.value = `连接失败：${error.message}`
    messages.push({ role: 'assistant', content: '一心净土的门扉暂未开启……稍后再试吧，旅者。' })
    saveChat()
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

function clearChat() {
  localStorage.removeItem(STORAGE_KEY)
  resetSession()
  initChat()
  connectionError.value = ''
}

onMounted(restoreChat)
</script>

<style scoped>
.chat-module { min-width: 0; }

.module-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding: 6px 0 22px;
  border-bottom: 1px solid var(--border);
}
.module-kicker { margin: 0 0 7px; color: var(--accent); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 700; }
.module-header h2 { margin: 0; color: var(--text-primary); font-size: 1.45rem; line-height: 1.1; }
.module-meta { margin: 9px 0 0; color: var(--text-tertiary); font-size: 0.76rem; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(234, 255, 87, 0.28);
  border-radius: 3px;
  background: var(--signal-muted);
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
}
.status-badge i { width: 6px; height: 6px; border-radius: 50%; background: var(--signal); box-shadow: 0 0 8px var(--signal); animation: status-pulse 2s infinite; }
@keyframes status-pulse { 50% { opacity: 0.35; } }

.chat-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  min-height: 620px;
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(15, 14, 19, 0.9);
  box-shadow: var(--shadow-md);
}

.conversation-panel { display: flex; min-width: 0; flex-direction: column; }

.chat-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.64rem;
}
.chat-state { display: flex; align-items: center; gap: 10px; min-width: 0; }
.chat-state span { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.chat-state span + span { padding-left: 10px; border-left: 1px solid var(--border); color: #b8aed2; }
.clear-btn { display: inline-flex; align-items: center; gap: 6px; }
.clear-btn { padding: 5px 8px; border: 1px solid var(--border); border-radius: 3px; background: transparent; color: var(--text-tertiary); cursor: pointer; font: inherit; }
.clear-btn:hover { border-color: var(--signal); color: var(--signal); }

.chat-area {
  display: flex;
  height: 430px;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

.welcome-panel { display: grid; min-height: 300px; place-items: center; align-content: center; text-align: center; }
.welcome-mark { display: grid; width: 54px; height: 54px; place-items: center; border: 1px solid rgba(201, 169, 110, 0.35); border-radius: 50%; background: rgba(201, 169, 110, 0.07); color: #C9A96E; }
.welcome-panel h3 { margin: 13px 0 5px; color: var(--text-primary); font-family: var(--font-body); font-size: 1rem; }
.welcome-panel > p { margin: 0; color: var(--text-tertiary); font-size: 0.73rem; }

.prompt-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; width: min(440px, 100%); margin-top: 18px; }
.prompt-list button { display: flex; align-items: center; justify-content: space-between; min-height: 38px; padding: 0 11px; border: 1px solid var(--border); border-radius: 3px; background: rgba(255, 255, 255, 0.025); color: var(--text-secondary); cursor: pointer; font: inherit; font-size: 0.7rem; }
.prompt-list button:hover { border-color: var(--border-hover); background: var(--accent-muted); color: var(--text-primary); }

.message-row { display: flex; align-items: flex-start; gap: 9px; }
.message-row.user { flex-direction: row-reverse; }
.message-avatar { display: grid; width: 30px; height: 30px; flex: 0 0 auto; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: #18171e; color: #C9A96E; }
.message-row.user .message-avatar { color: var(--accent); }

.message-content { max-width: 78%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 3px 7px 7px 7px; background: rgba(27, 24, 36, 0.84); }
.message-row.user .message-content { border-radius: 7px 3px 7px 7px; border-color: rgba(182, 156, 255, 0.3); background: var(--accent-muted); }
.message-sender { display: block; margin-bottom: 4px; color: #C9A96E; font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700; }
.message-row.user .message-sender { color: var(--accent); text-align: right; }
.message-content p { margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.72; white-space: pre-wrap; }
.response-sources { display: grid; gap: 4px; margin-top: 9px; padding-top: 8px; border-top: 1px solid rgba(246, 243, 233, 0.08); }
.response-sources > span { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--signal); font-family: var(--font-mono); font-size: 0.56rem; }
.response-sources > span small { color: var(--text-tertiary); font: inherit; }
.response-sources a { color: #b8aed2; font-size: 0.62rem; line-height: 1.45; text-decoration: none; }
.response-sources a em { margin-left: 5px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.52rem; font-style: normal; }
.response-sources a:hover { color: var(--signal); }

.message-content.typing { display: flex; align-items: center; gap: 5px; min-height: 20px; }
.typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: typing 1.2s infinite; }
.typing span:nth-child(2) { animation-delay: 0.16s; }
.typing span:nth-child(3) { animation-delay: 0.32s; }
@keyframes typing { 50% { transform: translateY(-4px); opacity: 0.4; } }

.composer { padding: 12px; border-top: 1px solid var(--border); background: rgba(9, 9, 12, 0.72); }
.composer textarea { width: 100%; min-height: 58px; max-height: 130px; padding: 10px 11px; resize: vertical; box-sizing: border-box; border: 1px solid var(--border); border-radius: var(--radius); outline: 0; background: rgba(255, 255, 255, 0.035); color: var(--text-primary); font: inherit; font-size: 0.78rem; line-height: 1.55; }
.composer textarea:focus { border-color: var(--border-hover); }
.composer textarea::placeholder { color: var(--text-tertiary); }
.composer-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 7px; }
.composer-actions > span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.58rem; }
.send-btn { display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 0 13px; border: 1px solid var(--signal); border-radius: 3px; background: var(--signal); color: #0b0b0e; cursor: pointer; font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; }
.send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.error-message { margin: 7px 0 0; color: #e08aa2; font-size: 0.66rem; }

.source-sidebar { padding: 16px; border-left: 1px solid var(--border); background: rgba(20, 19, 26, 0.72); }
.source-heading { display: flex; align-items: center; gap: 9px; color: var(--accent); }
.source-heading div { display: flex; flex-direction: column; gap: 2px; }
.source-heading strong { color: var(--text-primary); font-size: 0.78rem; }
.source-heading span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.56rem; }

.source-list { display: grid; gap: 0; margin: 16px 0 0; padding: 0; list-style: none; }
.source-list li { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 8px; padding: 12px 0; border-top: 1px solid rgba(246, 243, 233, 0.08); }
.source-list li > span { color: var(--signal); font-family: var(--font-mono); font-size: 0.6rem; }
.source-list li div { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
.source-list strong, .source-list a { color: var(--text-secondary); font-size: 0.7rem; line-height: 1.4; text-decoration: none; }
.source-list a:hover { color: var(--signal); }
.source-list small { color: var(--text-tertiary); font-size: 0.62rem; line-height: 1.4; }

.generation-note { margin-top: 18px; padding: 11px; border: 1px solid rgba(201, 169, 110, 0.2); border-radius: var(--radius); background: rgba(201, 169, 110, 0.05); }
.generation-note strong { color: #e0c89d; font-size: 0.68rem; }
.generation-note p { margin: 6px 0 0; color: var(--text-tertiary); font-size: 0.62rem; line-height: 1.6; }

@media (max-width: 820px) {
  .module-header { align-items: flex-start; flex-direction: column; gap: 14px; }
  .module-header h2 { font-size: 1.2rem; }
  .chat-shell { grid-template-columns: 1fr; min-height: 0; }
  .source-sidebar { border-top: 1px solid var(--border); border-left: 0; }
  .source-list { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .source-list li { grid-template-columns: 20px minmax(0, 1fr); }
}

@media (max-width: 560px) {
  .chat-toolbar { align-items: flex-start; padding: 9px 10px; }
  .chat-state { align-items: flex-start; flex-direction: column; gap: 5px; }
  .chat-state span + span { padding-left: 0; border-left: 0; }
  .chat-area { height: 390px; padding: 12px; }
  .prompt-list { grid-template-columns: 1fr; }
  .message-content { max-width: 86%; }
  .source-list { grid-template-columns: 1fr; }
  .source-sidebar { padding: 14px; }
  .composer { padding: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .status-badge i, .typing span { animation: none; }
}
</style>
