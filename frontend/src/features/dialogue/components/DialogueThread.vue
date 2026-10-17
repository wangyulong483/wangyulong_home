<!--
  与影对谈 — 对话线程

  呈现方式：把对话当作一条时间轴来读。
  每条消息挂在同一根发丝脊线上，行首是极小的序号，来源以学术脚注形式收在消息末尾。
-->
<template>
  <div class="thread">
    <div ref="scrollRef" class="thread-scroll" aria-live="polite">
      <ol class="thread-list">
        <li
          v-for="(message, index) in messages"
          :key="index"
          class="thread-item"
          :class="message.role"
        >
          <span class="item-mark" aria-hidden="true">{{ markOf(index, message) }}</span>
          <div class="item-body">
            <div class="item-head">
              <span class="item-sender">{{ senderOf(message) }}</span>
              <span v-if="message.retrievedAt" class="item-time">{{ formatTime(message.retrievedAt) }}</span>
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
                <li v-for="(source, sourceIndex) in message.sources" :key="`${source.url}-${sourceIndex}`">
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

const CHINESE_MARKS = ['序', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

function markOf(index, message) {
  if (message.role === 'user') return '问'
  return CHINESE_MARKS[index] || String(index)
}

function senderOf(message) {
  if (message.role === 'user') return '旅者'
  return `雷电影 · ${message.personaLabel || '御前'}`
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

watch(() => [props.messages.length, props.loading, props.messages.at(-1)?.content], scrollToBottom)

defineExpose({ focus: () => scrollToBottom() })
</script>

<style scoped>
.thread { display: flex; min-height: 0; flex-direction: column; }

.thread-scroll {
  height: clamp(360px, 56vh, 640px);
  padding: 26px clamp(18px, 4vw, 40px) 8px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(51, 48, 42, 0.28) transparent;
}

.thread-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 每条消息挂在同一根发丝脊线上 */
.thread-item {
  position: relative;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 14px;
  padding: 0 0 26px;
}

.thread-item::before {
  position: absolute;
  top: 6px;
  bottom: -4px;
  left: 14px;
  width: 1px;
  content: '';
  background: var(--paper-line, rgba(51, 48, 42, 0.14));
}

.thread-item:last-child::before { bottom: 40%; }

.item-mark {
  position: relative;
  z-index: 1;
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid var(--paper-line, rgba(51, 48, 42, 0.16));
  border-radius: 50%;
  background: var(--paper-bg, #f2ede3);
  color: var(--paper-ink-soft, #6b6558);
  font-family: var(--font-serif);
  font-size: 0.72rem;
}

.thread-item.assistant .item-mark {
  border-color: rgba(176, 141, 79, 0.5);
  color: var(--paper-gold, #9a7736);
}

.item-body { min-width: 0; padding-top: 2px; }

.item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
}

.item-sender {
  color: var(--paper-ink-soft, #6b6558);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.04em;
}

.thread-item.assistant .item-sender { color: var(--paper-gold, #9a7736); }

.item-time {
  color: rgba(51, 48, 42, 0.34);
  font-family: var(--font-mono);
  font-size: 0.56rem;
}

.item-text {
  margin: 0;
  color: var(--paper-ink, #33302a);
  font-size: 0.86rem;
  line-height: 1.95;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.thread-item.user .item-text {
  padding-left: 12px;
  border-left: 2px solid rgba(176, 141, 79, 0.42);
  color: #4a463c;
}

.caret {
  display: inline-block;
  width: 6px;
  height: 1em;
  margin-left: 3px;
  background: var(--paper-gold, #9a7736);
  vertical-align: -0.16em;
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink { 50% { opacity: 0; } }

/* ===== 脚注 ===== */
.item-notes {
  margin-top: 12px;
  padding-top: 9px;
  border-top: 1px solid var(--paper-line, rgba(51, 48, 42, 0.14));
}

.notes-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  color: var(--paper-gold, #9a7736);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.08em;
}

.notes-title small { color: rgba(51, 48, 42, 0.38); font: inherit; }

.notes-list {
  display: grid;
  gap: 4px;
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

.note-index { color: var(--paper-gold, #9a7736); font-family: var(--font-mono); }

.notes-list a {
  color: #4a463c;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notes-list a:hover { color: var(--paper-gold, #9a7736); text-decoration: underline; }

.notes-list em {
  color: rgba(51, 48, 42, 0.46);
  font-style: normal;
  white-space: nowrap;
}

.notes-list b {
  padding: 1px 5px;
  border: 1px solid var(--paper-line, rgba(51, 48, 42, 0.16));
  color: rgba(51, 48, 42, 0.5);
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
  margin: 0 0 18px 44px;
  color: rgba(51, 48, 42, 0.48);
  font-family: var(--font-mono);
  font-size: 0.6rem;
}

.phase-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--paper-gold, #9a7736);
  animation: phase-pulse 1.4s ease-in-out infinite;
}

@keyframes phase-pulse { 50% { opacity: 0.24; transform: scale(0.7); } }

/* ===== 话题引导 ===== */
.prompt-block {
  padding: 0 clamp(18px, 4vw, 40px) 18px;
  border-top: 1px solid var(--paper-line, rgba(51, 48, 42, 0.12));
}

.prompt-title {
  margin: 14px 0 8px;
  color: rgba(51, 48, 42, 0.42);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
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
  color: #4a463c;
  cursor: pointer;
  font: inherit;
  font-size: 0.74rem;
  text-align: left;
  transition: color 0.22s var(--ease-out), border-color 0.22s var(--ease-out);
}

.prompt-list button:hover:not(:disabled) {
  border-bottom-color: rgba(176, 141, 79, 0.5);
  color: var(--paper-gold, #9a7736);
}

.prompt-list button:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== 输入区 ===== */
.composer {
  padding: 16px clamp(18px, 4vw, 40px) 20px;
  border-top: 1px solid var(--paper-line, rgba(51, 48, 42, 0.16));
}

.composer-label {
  display: block;
  margin-bottom: 7px;
  color: rgba(51, 48, 42, 0.42);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
}

.composer textarea {
  width: 100%;
  min-height: 62px;
  max-height: 150px;
  padding: 10px 0 0;
  resize: vertical;
  border: 0;
  border-top: 1px solid transparent;
  background: transparent;
  color: var(--paper-ink, #33302a);
  font: inherit;
  font-size: 0.84rem;
  line-height: 1.85;
  outline: 0;
}

.composer textarea::placeholder { color: rgba(51, 48, 42, 0.3); }

.composer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.composer-count { color: rgba(51, 48, 42, 0.34); font-family: var(--font-mono); font-size: 0.56rem; }

.composer-actions { display: flex; align-items: center; gap: 10px; }

.ghost-btn {
  padding: 6px 10px;
  border: 1px solid var(--paper-line, rgba(51, 48, 42, 0.18));
  background: transparent;
  color: rgba(51, 48, 42, 0.56);
  cursor: pointer;
  font: inherit;
  font-size: 0.66rem;
}

.ghost-btn:hover:not(:disabled) { border-color: rgba(176, 141, 79, 0.5); color: var(--paper-gold, #9a7736); }
.ghost-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.send-btn {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  border: 1px solid var(--paper-gold, #9a7736);
  background: var(--paper-gold, #9a7736);
  color: #fdfbf6;
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  transition: opacity 0.2s var(--ease-out);
}

.send-btn:hover:not(:disabled) { opacity: 0.86; }
.send-btn:disabled { opacity: 0.34; cursor: not-allowed; }

.composer-error {
  margin: 9px 0 0;
  color: #a2503f;
  font-size: 0.66rem;
}

@media (max-width: 768px) {
  .thread-scroll { height: clamp(320px, 58vh, 520px); padding: 20px 16px 6px; }
  .thread-item { grid-template-columns: 26px minmax(0, 1fr); gap: 11px; }
  .thread-item::before { left: 12px; }
  .item-mark { width: 25px; height: 25px; font-size: 0.66rem; }
  .item-text { font-size: 0.82rem; line-height: 1.9; }
  .notes-list li { grid-template-columns: 24px minmax(0, 1fr); }
  .notes-list em, .notes-list b { display: none; }
  .prompt-block, .composer { padding-inline: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .caret, .phase-dot { animation: none; }
}
</style>
