<template>
  <section class="quiz-result">
    <div class="result-head">
      <div>
        <p class="eyebrow">SELF CHECK RESULT</p>
        <h2>{{ result.score }}</h2>
        <small>本次测评共 {{ result.total }} 题，按题等权计分。得分仅为自测参考。</small>
      </div>
      <div class="level-panel">
        <strong>{{ result.level.name }}</strong>
        <span>以上仅为本次自测参考，不构成能力认证。</span>
        <p>{{ result.level.description }}</p>
      </div>
    </div>

    <div class="stale-banner">
      本测评基于 2026 年 8 月的技术现状与事实锚点。AI 领域协议与安全威胁更新较快，建议 3 个月后复测。
    </div>

    <article class="result-section">
      <h3>能力画像</h3>
      <p>{{ result.profile }}</p>
    </article>

    <article class="result-section">
      <h3>六维得分</h3>
      <RadarChart :scores="result.dimensionScores" />
    </article>

    <article class="result-section">
      <h3>学习建议</h3>
      <div class="advice-grid">
        <div v-for="dimension in weakDimensions" :key="dimension.id">
          <strong>{{ dimension.title }}</strong>
          <p>{{ dimension.advice }}</p>
        </div>
      </div>
    </article>

    <article v-if="result.wrongAnswers.length" class="result-section">
      <h3>错题本</h3>
      <div class="wrong-list">
        <div v-for="item in result.wrongAnswers" :key="item.question.id" class="wrong-item">
          <strong>{{ item.question.prompt }}</strong>
          <p>{{ item.question.explanation }}</p>
          <label>
            错因自标
            <select :value="item.mistakeType" @change="$emit('set-mistake-type', item.question.id, $event.target.value)">
              <option value="">暂不标记</option>
              <option v-for="type in mistakeTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </label>
        </div>
      </div>
    </article>

    <div class="result-actions">
      <button class="btn btn-primary" type="button" @click="$emit('restart')">
        <AppIcon icon="refresh" size="14" /> 重新开始
      </button>
      <button class="btn" type="button" @click="$emit('start-deep')">
        <AppIcon icon="target" size="14" /> 单维深度复测
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import RadarChart from './RadarChart.vue'
import { MISTAKE_TYPES } from '../config/ui.js'

const props = defineProps({
  result: { type: Object, required: true },
  dimensions: { type: Array, required: true },
})

defineEmits(['restart', 'start-deep', 'set-mistake-type'])

const mistakeTypes = MISTAKE_TYPES

const weakDimensions = computed(() => {
  const ids = [...props.result.dimensionScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(item => item.id)
  return ids.map(id => props.dimensions.find(dimension => dimension.id === id)).filter(Boolean)
})
</script>

<style scoped>
.quiz-result {
  display: grid;
  gap: 16px;
}

.result-head {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  align-items: stretch;
}

.result-head > div,
.result-section,
.stale-banner {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
}

.result-head > div {
  padding: 18px;
}

.eyebrow {
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 10px;
}

.result-head h2 {
  margin: 8px 0;
  color: var(--signal);
  font-size: 76px;
  line-height: 1;
}

.result-head small,
.level-panel span {
  color: var(--text-tertiary);
  font-size: 11px;
}

.level-panel strong {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 28px;
}

.level-panel p,
.result-section p {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.stale-banner {
  padding: 12px 14px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.result-section {
  padding: 18px;
}

.result-section h3 {
  margin: 0 0 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--signal);
}

.advice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.advice-grid div,
.wrong-item {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.035);
}

.advice-grid strong,
.wrong-item strong {
  color: var(--text-primary);
  font-size: 13px;
}

.wrong-list {
  display: grid;
  gap: 10px;
}

.wrong-item label {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
}

.wrong-item select {
  min-height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #17171c;
  color: var(--text-primary);
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 820px) {
  .result-head,
  .advice-grid {
    grid-template-columns: 1fr;
  }
}
</style>
