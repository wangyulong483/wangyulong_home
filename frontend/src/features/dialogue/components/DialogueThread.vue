<template>
  <div class="thread">
    <div ref="scrollRef" class="thread-scroll" aria-live="polite">
      <ol class="thread-list">
        <li
          v-for="(message, index) in messages"
          :key="index"
          class="thread-item"
          :class="[message.role, { 'is-highlight': index === highlightIndex }]"
          :data-message-index="index"
        >
          <span class="item-mark" aria-hidden="true">{{ markOf(index, message) }}</span>
          <div class="item-body">
            <div class="item-head">
              <span class="item-sender">{{ senderOf(message) }}</span>
              <span v-if="timeOf(message)" class="item-time">{{ formatTime(timeOf(message)) }}</span>
            </div>

            <p class="item-text">
              {{ message.content }}<span v-if="message.streaming" class="caret" aria-hidden="true"></span>
            </p>

            <div v-if="message.role === 'assistant' && message.sources?.length" class="item-notes">
              <p class="notes-title">
                <span>脚注</span>
                <small v-if="message.knowledgeVersion">知识库 {{ message.knowledgeVersion }}</small>
              </p>
              <ol class="notes-list">
                <li v-for="(source, sourceIndex) in message.sources" :key="source.url + '-' + sourceIndex">
                  <span class="note-index">[{{ sourceIndex + 1 }}]</span>
                  <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}</a>
                  <em>{{ source.source || source.publisher }}</em>
                  <b>{{ sourceTierLabel(source) }}</b>
                </li>
              </ol>
            </div>
          </div>
        </li>
      </ol>

      <p v-if="loading" class="thread-phase">
        <span class="phase-dot" aria-hidden="true"></span>{{ phase || '影正在思量……' }}
      </p>
    </div>

    <div v-if="!hasConversation && prompts.length" class="prompt-block">
      <p class="prompt-title">可以从这些话题开始</p>
      <ul class="prompt-list">
        <li v-for="prompt in prompts" :key="prompt.label">
          <button type="button" :disabled="loading" @click="emit('send', prompt.text)">
            <span>{{ prompt.label }}</span>
            <AppIcon icon="arrow-right" size="11" />
          </button>
        </li>
      </ul>
    </div>

    <form class="composer" @submit.prevent="submit">
      <label class="composer-label" for="dialogue-input">向影说</label>
      <textarea
        id="dialogue-input"
        v-model="draft"
        rows="2"
        maxlength="500"
        placeholder="把此刻所想写下来……"
        :disabled="loading"
        @keydown.enter.exact.prevent="submit"
      ></textarea>
      <div class="composer-foot">
        <span class="composer-count">{{ draft.length }} / 500</span>
        <div class="composer-actions">
          <button v-if="hasConversation" type="button" class="ghost-btn" :disabled="loading" @click="emit('clear')">
            清空这一卷
          </button>
          <button type="submit" class="send-btn" :disabled="!draft.trim() || loading">
            <AppIcon icon="message" size="13" /> 呈上
          </button>
        </div>
      </div>
      <p v-if="connectionError" class="composer-error">{{ connectionError }}</p>
    </form>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import { sourceTierLabel } from '@/features/dialogue/composables/useDialogue.js'

const props = defineProps({
  messages: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  phase: { type: String, default: '' },
  connectionError: { type: String, default: '' },
  prompts: { type: Array, default: () => [] },
  hasConversation: { type: Boolean, default: false },
})

const emit = defineEmits(['send', 'clear'])

const draft = ref('')
const scrollRef = ref(null)
const highlightIndex = ref(-1)
let highlightTimer = null

const CHINESE_MARKS = ['序', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

function markOf(index, message) {
  if (message.role === 'user') return '问'
  return CHINESE_MARKS[index] || String(index)
}

function senderOf(message) {
  if (message.role === 'user') return '旅者'
  return '雷电影 · ' + (message.personaLabel || '御前')
}

function timeOf(message) {
  return message.retrievedAt || message.createdAt || ''
}

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date)
}

function submit() {
  const text = draft.value.trim()
  if (!text || props.loading) return
  draft.value = ''
  emit('send', text)
}

async function scrollToBottom() {
  await nextTick()
  const area = scrollRef.value
  if (area) area.scrollTop = area.scrollHeight
}

/** 从对话纪年跳回某条原文，并短暂标出它 */
async function focusMessage(index) {
  if (typeof index !== 'number' || index < 0) return
  await nextTick()
  const area = scrollRef.value
  if (!area) return
  const target = area.querySelector('[data-message-index="' + index + '"]')
  if (!target) return
  target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  highlightIndex.value = index
  clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => {
    highlightIndex.value = -1
  }, 2400)
}

function focusComposer() {
  const input = document.getElementById('dialogue-input')
  if (input) input.focus()
  scrollToBottom()
}

watch(() => [props.messages.length, props.loading, props.messages.at(-1)?.content], scrollToBottom)

defineExpose({ focusMessage, focusComposer })
</script>

<style scoped>
.thread {
  --paper-bg: #ece4d3;
  --paper-ink: #1b1815;
  --paper-ink-soft: #5c5548;
  --paper-line: rgba(27, 24, 21, 0.2);
  --paper-gold: #b8892f;
  --paper-red: #e01b2e;
  --paper-purple: #5b2bb5;
  --paper-purple-deep: #3b1d78;
  --cream: #f3eee6;
  --ease: cubic-bezier(0.38, 0, 0, 1);
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.thread-scroll {
  height: clamp(360px, 56vh, 640px);
  padding: 26px clamp(18px, 4vw, 40px) 8px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(27, 24, 21, 0.32) transparent;
}

.thread-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 每条消息挂在同一根硬线上，标记为方块 */
.thread-item {
  position: relative;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 15px;
  padding: 0 0 28px;
  scroll-margin-top: 24px;
}

.thread-item::before {
  position: absolute;
  top: 8px;
  bottom: -6px;
  left: 16px;
  width: 2px;
  content: '';
  background: var(--paper-line);
}

.thread-item:last-child::before {
  bottom: 40%;
}

.item-mark {
  position: relative;
  z-index: 1;
  display: grid;
  width: 33px;
  height: 33px;
  place-items: center;
  border: 2px solid var(--paper-ink);
  background: var(--paper-bg);
  color: var(--paper-ink);
  font-family: var(--font-serif);
  font-size: 0.76rem;
}

.thread-item.user .item-mark {
  border-color: var(--paper-red);
  background: var(--paper-red);
  color: var(--cream);
}

.thread-item.assistant .item-mark {
  border-color: var(--paper-purple);
  color: var(--paper-gold);
}

.thread-item.is-highlight .item-mark {
  background: var(--paper-red);
  border-color: var(--paper-red);
  color: var(--cream);
}

.thread-item.is-highlight .item-body {
  background: rgba(139, 92, 246, 0.08);
  box-shadow: -3px 0 0 var(--paper-purple);
}

.item-body {
  min-width: 0;
  padding: 2px 10px 10px 12px;
  transition: background 0.3s var(--ease);
}

.item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.item-sender {
  color: var(--paper-ink-soft);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
}

.thread-item.assistant .item-sender {
  color: var(--paper-purple);
}

.item-time {
  color: rgba(27, 24, 21, 0.4);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  font-variant-numeric: tabular-nums;
}

.item-text {
  margin: 0;
  color: var(--paper-ink);
  font-family: var(--font-hand);
  font-size: 1.18rem;
  font-weight: 400;
  line-height: 1.72;
  letter-spacing: 0.02em;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.thread-item.user .item-text {
  padding-left: 12px;
  border-left: 3px solid var(--paper-red);
  color: #32283c;
}

.caret {
  display: inline-block;
  width: 7px;
  height: 1em;
  margin-left: 3px;
  background: var(--paper-red);
  vertical-align: -0.16em;
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% { opacity: 0; }
}

/* ===== 脚注 ===== */
.item-notes {
  margin-top: 13px;
  padding-top: 10px;
  border-top: 2px solid var(--paper-line);
}

.notes-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 7px;
  color: var(--paper-gold);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
}

.notes-title small {
  color: rgba(27, 24, 21, 0.42);
  font: inherit;
}

.notes-list {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notes-list li {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto auto;
  align-items: baseline;
  gap: 8px;
  font-size: 0.64rem;
  line-height: 1.5;
}

.note-index {
  color: var(--paper-red);
  font-family: var(--font-mono);
}

.notes-list a {
  color: #3d382f;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notes-list a:hover {
  color: var(--paper-red);
  text-decoration: underline;
}

.notes-list em {
  color: rgba(27, 24, 21, 0.48);
  font-style: normal;
  white-space: nowrap;
}

.notes-list b {
  padding: 1px 5px;
  border: 1px solid var(--paper-line);
  color: rgba(27, 24, 21, 0.54);
  font-family: var(--font-mono);
  font-size: 0.52rem;
  font-weight: 400;
  white-space: nowrap;
}

/* ===== 检索中 ===== */
.thread-phase {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 18px 49px;
  color: rgba(27, 24, 21, 0.52);
  font-family: var(--font-mono);
  font-size: 0.6rem;
}

.phase-dot {
  width: 7px;
  height: 7px;
  background: var(--paper-purple);
  animation: phase-pulse 1.4s steps(2) infinite;
}

@keyframes phase-pulse {
  50% { opacity: 0.24; }
}

/* ===== 话题引导 ===== */
.prompt-block {
  padding: 0 clamp(18px, 4vw, 40px) 18px;
  border-top: 2px solid var(--paper-line);
}

.prompt-title {
  margin: 14px 0 8px;
  color: rgba(27, 24, 21, 0.46);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
}

.prompt-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2px 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.prompt-list button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 0;
  border: 0;
  border-bottom: 1px solid transparent;
  background: none;
  color: #3d382f;
  cursor: pointer;
  font: inherit;
  font-size: 0.74rem;
  text-align: left;
  transition: color 0.22s var(--ease), border-color 0.22s var(--ease);
}

.prompt-list button:hover:not(:disabled) {
  border-bottom-color: var(--paper-purple);
  color: var(--paper-purple);
}

.prompt-list button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== 输入区 ===== */
.composer {
  padding: 16px clamp(18px, 4vw, 40px) 20px;
  border-top: 2px solid var(--paper-ink);
}

.composer-label {
  display: block;
  margin-bottom: 8px;
  color: rgba(27, 24, 21, 0.46);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.12em;
}

.composer-label::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  background: var(--paper-purple);
  vertical-align: 1px;
}

.composer textarea {
  width: 100%;
  min-height: 62px;
  max-height: 150px;
  padding: 10px 0 0;
  resize: vertical;
  border: 0;
  background: transparent;
  color: var(--paper-ink);
  font: inherit;
  font-size: 0.84rem;
  line-height: 1.85;
  outline: 0;
}

.composer textarea::placeholder {
  color: rgba(27, 24, 21, 0.32);
}

.composer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--paper-line);
}

.composer-count {
  color: rgba(27, 24, 21, 0.38);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  font-variant-numeric: tabular-nums;
}

.composer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ghost-btn {
  padding: 6px 10px;
  border: 1px solid var(--paper-line);
  background: transparent;
  color: rgba(27, 24, 21, 0.58);
  cursor: pointer;
  font: inherit;
  font-size: 0.66rem;
  transition: border-color 0.2s var(--ease), color 0.2s var(--ease);
}

.ghost-btn:hover:not(:disabled) {
  border-color: var(--paper-purple);
  color: var(--paper-purple);
}

.ghost-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 6px;
  padding: 0 18px;
  border: 2px solid var(--paper-purple-deep);
  background: var(--paper-purple);
  color: var(--cream);
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  box-shadow: 4px 4px 0 var(--paper-red);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), opacity 0.2s var(--ease);
}

.send-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--paper-red);
}

.send-btn:disabled {
  opacity: 0.34;
  cursor: not-allowed;
  box-shadow: none;
}

.composer-error {
  margin: 10px 0 0;
  padding-left: 9px;
  border-left: 3px solid var(--paper-red);
  color: #a2503f;
  font-size: 0.66rem;
}

@media (max-width: 768px) {
  .thread-scroll {
    height: clamp(320px, 58vh, 520px);
    padding: 20px 16px 6px;
  }

  .thread-item {
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 11px;
  }

  .thread-item::before {
    left: 13px;
  }

  .item-mark {
    width: 27px;
    height: 27px;
    font-size: 0.68rem;
  }

  .item-text {
    font-size: 1.08rem;
    line-height: 1.68;
  }

  .notes-list li {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .notes-list em,
  .notes-list b {
    display: none;
  }

  .prompt-block,
  .composer {
    padding-inline: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .caret,
  .phase-dot {
    animation: none;
  }

  .item-body,
  .prompt-list button,
  .ghost-btn,
  .send-btn {
    transition: none;
  }
}
</style>
