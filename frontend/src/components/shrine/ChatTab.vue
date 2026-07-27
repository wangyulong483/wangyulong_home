<!--
  AI 对话 Tab — 与影对话
  后端: FastAPI /api/chat → DeepSeek V4 Flash
-->
<template>
  <div class="chat-tab">
    <!-- 模式提示 -->
    <div class="local-notice">
      <span class="notice-dot"></span>
      DeepSeek V4 Flash · 雷电将军角色扮演
    </div>

    <!-- 工具栏 -->
    <div class="chat-toolbar">
      <span class="toolbar-label">一心净土</span>
      <button class="clear-btn" @click="clearChat" v-if="messages.length > 1">清空对话</button>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-area" ref="chatArea">
      <!-- 欢迎语 -->
      <div v-if="messages.length <= 1 && !loading" class="welcome-msg">
        <p>踏入一心净土，与影对话</p>
        <p class="welcome-hint">她正静坐冥想，轻叩心扉即可唤醒</p>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="msg-row"
        :class="msg.role"
      >
        <div class="msg-avatar">
          <template v-if="msg.role === 'assistant'">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A96E" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </template>
          <template v-else>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="rgba(200,190,230,0.5)" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          </template>
        </div>
        <div class="msg-bubble" :class="msg.role">
          <span class="msg-sender">{{ msg.role === 'assistant' ? '影' : '你' }}</span>
          <div class="msg-text">{{ msg.content }}</div>
        </div>
      </div>

      <!-- 加载动画 -->
      <div v-if="loading" class="msg-row assistant">
        <div class="msg-avatar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C9A96E" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div class="msg-bubble assistant typing">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="chat-input-area">
      <div class="input-row">
        <input
          v-model="input"
          class="chat-input"
          placeholder="向雷电将军诉说..."
          @keyup.enter="sendMsg"
          :disabled="loading"
        />
        <button
          class="send-btn"
          @click="sendMsg"
          :disabled="!input.trim() || loading"
        >
          发送
        </button>
      </div>
      <p class="input-hint" v-if="connectionError">
        {{ connectionError }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'

/* ===== API 配置 ===== */
// 开发环境走 Vite 代理，生产环境走 Cloudflare Tunnel
const API_BASE = window.location.hostname === 'localhost'
  ? '/api'
  : 'https://perception-geographical-iron-all.trycloudflare.com/api'

/* ===== 对话状态 ===== */
const messages = reactive([])
const loading = ref(false)
const input = ref('')
const chatArea = ref(null)
const connectionError = ref('')

/* ===== 初始化 ===== */
function initChat() {
  messages.length = 0
  messages.push({
    role: 'assistant',
    content: '此身即为永恒。旅者，汝踏入一心净土，所为何事？'
  })
}

/* ===== 滚动到底部 ===== */
async function scrollToBottom() {
  await nextTick()
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight
  }
}

/* ===== 发送消息 ===== */
async function sendMsg() {
  const text = input.value.trim()
  if (!text || loading.value) return

  input.value = ''
  messages.push({ role: 'user', content: text })
  await scrollToBottom()

  loading.value = true
  connectionError.value = ''

  try {
    const resp = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
          role: m.role,
          content: m.content
        }))
      })
    })

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}))
      throw new Error(errData.detail || `HTTP ${resp.status}`)
    }

    const data = await resp.json()
    messages.push({ role: 'assistant', content: data.content || '...' })
  } catch (e) {
    connectionError.value = '连接失败：' + e.message
    messages.push({ role: 'assistant', content: '一心净土的门扉暂未开启…稍后再试吧，旅者。' })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

/* ===== 清空对话 ===== */
function clearChat() {
  initChat()
  connectionError.value = ''
}

/* ===== 生命周期 ===== */
onMounted(() => {
  initChat()
})
</script>

<style scoped>
.chat-tab {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 400px);
  min-height: 480px;
}

/* ===== 模式提示 ===== */
.local-notice {
  font-size: 0.72rem;
  color: rgba(201, 169, 110, 0.5);
  text-align: center;
  padding: 8px;
  margin-bottom: 12px;
  background: rgba(201, 169, 110, 0.04);
  border: 1px solid rgba(201, 169, 110, 0.1);
  border-radius: 8px;
}

.notice-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #C9A96E;
  margin-right: 6px;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* ===== 工具栏 ===== */
.chat-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-label {
  font-size: 0.78rem;
  color: rgba(200, 190, 230, 0.35);
  letter-spacing: 0.08em;
}

.clear-btn {
  background: rgba(107, 76, 154, 0.1);
  border: 1px solid rgba(176, 136, 249, 0.15);
  color: rgba(200, 190, 230, 0.5);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: #B088F9;
  border-color: rgba(176, 136, 249, 0.35);
}

/* ===== 聊天区域 ===== */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chat-area::-webkit-scrollbar { width: 4px; }
.chat-area::-webkit-scrollbar-track { background: transparent; }
.chat-area::-webkit-scrollbar-thumb { background: rgba(176, 136, 249, 0.15); border-radius: 2px; }

/* ===== 欢迎语 ===== */
.welcome-msg {
  text-align: center;
  padding: 60px 20px;
  color: rgba(200, 190, 230, 0.35);
}

.welcome-msg p { margin: 8px 0; font-size: 0.9rem; }

.welcome-hint { font-size: 0.78rem; opacity: 0.6; }

/* ===== 消息行 ===== */
.msg-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.msg-row.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(107, 76, 154, 0.1);
  border: 1px solid rgba(176, 136, 249, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ===== 气泡 ===== */
.msg-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
}

.msg-bubble.assistant {
  background: rgba(107, 76, 154, 0.1);
  border: 1px solid rgba(176, 136, 249, 0.12);
  border-radius: 4px 16px 16px 16px;
}

.msg-bubble.user {
  background: rgba(90, 79, 207, 0.18);
  border: 1px solid rgba(176, 136, 249, 0.2);
  border-radius: 16px 4px 16px 16px;
}

.msg-sender {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.msg-bubble.assistant .msg-sender { color: #C9A96E; }
.msg-bubble.user .msg-sender { color: rgba(180, 170, 220, 0.5); }

.msg-text {
  font-size: 0.86rem;
  line-height: 1.7;
  color: rgba(220, 210, 240, 0.85);
  white-space: pre-wrap;
}

/* ===== 打字动画 ===== */
.msg-bubble.typing {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 16px;
}

.typing-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(176, 136, 249, 0.4);
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
  40% { transform: translateY(-6px); opacity: 1; }
}

/* ===== 输入区 ===== */
.chat-input-area {
  margin-top: 16px;
  border-top: 1px solid rgba(176, 136, 249, 0.1);
  padding-top: 14px;
}

.input-row {
  display: flex;
  gap: 10px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 20px;
  border: 1px solid rgba(176, 136, 249, 0.2);
  background: rgba(107, 76, 154, 0.08);
  color: rgba(220, 210, 240, 0.85);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.3s;
}

.chat-input:focus {
  border-color: rgba(176, 136, 249, 0.5);
}

.chat-input::placeholder {
  color: rgba(180, 170, 210, 0.3);
}

.send-btn {
  padding: 12px 22px;
  border-radius: 20px;
  border: 1px solid rgba(176, 136, 249, 0.25);
  background: rgba(176, 136, 249, 0.12);
  color: #B088F9;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  background: rgba(176, 136, 249, 0.22);
  border-color: rgba(176, 136, 249, 0.5);
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.7rem;
  color: rgba(212, 136, 238, 0.45);
  margin: 8px 4px 0;
  line-height: 1.5;
}

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .chat-tab {
    height: calc(100vh - 300px);
    min-height: 400px;
  }

  .msg-bubble {
    max-width: 85%;
  }
}
</style>
