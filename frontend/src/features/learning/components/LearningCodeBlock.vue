<template>
  <section class="code-block" :aria-label="`${languageLabel} 代码示例`">
    <header class="code-head">
      <span class="file-name">{{ filename }}</span>
      <div class="code-actions">
        <span class="language">{{ languageLabel }}</span>
        <button
          type="button"
          class="copy-button"
          :class="{ copied: copyState === 'copied' }"
          :title="copyLabel"
          :aria-label="copyLabel"
          @click="copyCode"
        >
          <AppIcon :icon="copyState === 'copied' ? 'tick' : 'document'" size="15" />
          <span>{{ copyLabel }}</span>
        </button>
      </div>
    </header>

    <div class="code-scroll" tabindex="0">
      <ol class="code-lines">
        <li v-for="(line, index) in lines" :key="index">
          <code v-html="line || ' '"></code>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import AppIcon from '@/shared/components/AppIcon.vue'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)

const props = defineProps({
  code: { type: String, required: true },
  language: { type: String, default: 'text' },
  filename: { type: String, default: 'snippet' },
})

const languageNames = {
  bash: 'Shell',
  javascript: 'JavaScript',
  python: 'Python',
}

const copyState = ref('idle')
const lines = computed(() => {
  const source = props.code.replace(/\n$/, '')
  const highlighted = hljs.getLanguage(props.language)
    ? hljs.highlight(source, { language: props.language })
    : hljs.highlightAuto(source)
  return highlighted.value.split('\n')
})
const languageLabel = computed(() => languageNames[props.language] || props.language)
const copyLabel = computed(() => {
  if (copyState.value === 'copied') return '已复制'
  if (copyState.value === 'failed') return '复制失败'
  return '复制'
})

let resetTimer

async function copyCode() {
  window.clearTimeout(resetTimer)

  try {
    await navigator.clipboard.writeText(props.code)
    copyState.value = 'copied'
  } catch {
    copyState.value = fallbackCopy(props.code) ? 'copied' : 'failed'
  }

  resetTimer = window.setTimeout(() => { copyState.value = 'idle' }, 1800)
}

function fallbackCopy(value) {
  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()

  let succeeded = false
  try {
    succeeded = document.execCommand('copy')
  } finally {
    input.remove()
  }
  return succeeded
}

onUnmounted(() => window.clearTimeout(resetTimer))
</script>

<style scoped>
.code-block {
  overflow: hidden;
  border: 1px solid rgba(246, 243, 233, 0.12);
  border-radius: var(--radius-lg);
  background: #0d0d11;
  color: #e8e5dc;
}

.code-head {
  display: flex;
  min-height: 44px;
  padding: 0 10px 0 16px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(246, 243, 233, 0.1);
  background: #15151a;
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.file-name {
  overflow: hidden;
  color: #d2ced8;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.language {
  color: #7f7a88;
  text-transform: uppercase;
}

.copy-button {
  display: inline-flex;
  min-width: 68px;
  min-height: 32px;
  padding: 0 9px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgba(246, 243, 233, 0.13);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.04);
  color: #aaa5b2;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s var(--ease-out), color 0.2s var(--ease-out), background 0.2s var(--ease-out);
}

.copy-button:hover,
.copy-button:focus-visible {
  border-color: rgba(234, 255, 87, 0.52);
  background: rgba(234, 255, 87, 0.07);
  color: var(--signal);
  outline: none;
}

.copy-button.copied {
  color: #75e0b3;
  border-color: rgba(117, 224, 179, 0.42);
}

.code-scroll {
  max-width: 100%;
  overflow: auto;
  scrollbar-color: rgba(182, 156, 255, 0.34) transparent;
  scrollbar-width: thin;
}

.code-scroll:focus-visible {
  outline: 2px solid rgba(234, 255, 87, 0.48);
  outline-offset: -2px;
}

.code-lines {
  width: max-content;
  min-width: 100%;
  margin: 0;
  padding: 16px 24px 18px 54px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.75;
}

.code-lines li {
  min-height: 1.75em;
  padding-left: 18px;
  color: #817c8a;
}

.code-lines code {
  display: block;
  padding-left: 4px;
  color: #e8e5dc;
  white-space: pre;
}

.code-lines :deep(.hljs-keyword),
.code-lines :deep(.hljs-selector-tag),
.code-lines :deep(.hljs-literal) { color: #c9a6ff; }

.code-lines :deep(.hljs-string),
.code-lines :deep(.hljs-attr) { color: #d9e883; }

.code-lines :deep(.hljs-title),
.code-lines :deep(.hljs-built_in),
.code-lines :deep(.hljs-function) { color: #77d8ff; }

.code-lines :deep(.hljs-number),
.code-lines :deep(.hljs-variable),
.code-lines :deep(.hljs-params) { color: #f0bd8c; }

.code-lines :deep(.hljs-comment) {
  color: #77737f;
  font-style: italic;
}

@media (max-width: 560px) {
  .code-head { padding-left: 12px; }
  .language { display: none; }
  .code-lines { padding: 14px 18px 16px 46px; font-size: 0.75rem; }
  .code-lines li { padding-left: 12px; }
}
</style>
