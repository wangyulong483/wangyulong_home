<template>
  <section class="quiz-intro">
    <div class="notice">
      <strong>自测参考，非能力认证</strong>
      <span>{{ versionText }}</span>
      <span>本地判分，不上传答题数据</span>
    </div>

    <div class="audience-grid">
      <button
        v-for="item in audiences"
        :key="item.value"
        type="button"
        class="choice-card"
        :class="{ active: audience === item.value }"
        @click="audience = item.value"
      >
        <AppIcon :icon="item.icon" size="26" />
        <span>{{ item.title }}</span>
        <small>{{ item.subtitle }}</small>
      </button>
    </div>

    <div class="settings-panel">
      <div class="segmented" aria-label="卷型">
        <button type="button" :class="{ active: mode === 'standard' }" @click="mode = 'standard'">标准卷</button>
        <button type="button" :class="{ active: mode === 'deep' }" @click="mode = 'deep'">单维深度</button>
      </div>

      <div v-if="mode === 'deep'" class="dimension-chips" aria-label="深度维度">
        <button
          v-for="dimension in dimensions"
          :key="dimension.id"
          type="button"
          :class="{ active: dimensionId === dimension.id }"
          @click="dimensionId = dimension.id"
        >
          <AppIcon :icon="dimension.icon" size="14" />
          {{ dimension.title }}
        </button>
      </div>

      <div class="intro-actions">
        <button class="btn btn-primary" type="button" @click="emitStart">
          <AppIcon icon="arrow-right" size="14" /> 开始测评
        </button>
        <button v-if="savedState" class="btn" type="button" @click="$emit('resume')">
          <AppIcon icon="refresh" size="14" /> 继续上次
        </button>
        <button v-if="savedState" class="btn ghost" type="button" @click="$emit('clear-progress')">
          <AppIcon icon="trash" size="14" /> 清除进度
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const props = defineProps({
  dimensions: { type: Array, required: true },
  savedState: { type: Object, default: null },
  quizVersion: { type: String, default: '' },
})

const emit = defineEmits(['start', 'resume', 'clear-progress'])

const audience = ref('professional')
const mode = ref('standard')
const dimensionId = ref(props.dimensions[0]?.id || '')

const audiences = [
  {
    value: 'general',
    icon: 'user-avatar',
    title: 'AI 日常应用能力',
    subtitle: '面向所有用户，测测你用 AI 提效的姿势对不对',
  },
  {
    value: 'professional',
    icon: 'microchip',
    title: 'AI 工程构建能力',
    subtitle: '面向开发者/PM，测测你对 Agent、RAG、MCP 的技术判断力',
  },
]

const versionText = computed(() => props.quizVersion ? `题库版本 ${props.quizVersion}` : '题库加载后开始')

watch(() => props.dimensions, next => {
  if (!dimensionId.value && next[0]) dimensionId.value = next[0].id
}, { immediate: true })

function emitStart() {
  emit('start', {
    audience: audience.value,
    mode: mode.value,
    dimensionId: mode.value === 'deep' ? dimensionId.value : '',
  })
}
</script>

<style scoped>
.quiz-intro {
  display: grid;
  gap: 18px;
}

.notice {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(22, 21, 28, 0.72);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.notice strong {
  color: var(--signal);
}

.audience-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.choice-card {
  display: grid;
  min-height: 154px;
  padding: 22px;
  gap: 10px;
  align-content: center;
  justify-items: start;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: 0.22s var(--ease-out);
}

.choice-card:hover,
.choice-card.active {
  border-color: rgba(234, 255, 87, 0.48);
  background: var(--bg-card-hover);
}

.choice-card .app-icon {
  color: var(--signal);
}

.choice-card span {
  font-size: 18px;
  font-weight: 800;
}

.choice-card small {
  color: var(--text-secondary);
  font-size: 12px;
}

.settings-panel {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(22, 21, 28, 0.62);
}

.segmented {
  display: inline-grid;
  width: min(100%, 360px);
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.segmented button,
.dimension-chips button {
  min-height: 40px;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  cursor: pointer;
}

.segmented button.active {
  background: var(--signal);
  color: #0b0b0e;
}

.dimension-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dimension-chips button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 3px;
}

.dimension-chips button.active {
  border-color: var(--signal);
  color: var(--signal);
  background: var(--signal-muted);
}

.intro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ghost {
  color: var(--text-tertiary);
}

@media (max-width: 720px) {
  .audience-grid {
    grid-template-columns: 1fr;
  }

  .choice-card {
    min-height: 132px;
  }
}
</style>
