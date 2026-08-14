<template>
  <div class="radar-layout">
    <svg class="radar" viewBox="0 0 240 240" role="img" aria-label="六维能力雷达">
      <polygon
        v-for="ring in rings"
        :key="ring"
        class="radar-ring"
        :points="polygonPoints(ring)"
      />
      <line
        v-for="point in axisPoints"
        :key="point.id"
        class="radar-axis"
        x1="120"
        y1="120"
        :x2="point.x"
        :y2="point.y"
      />
      <polygon class="radar-score" :points="scorePoints" />
      <circle
        v-for="point in scoreDots"
        :key="point.id"
        class="radar-dot"
        :cx="point.x"
        :cy="point.y"
        r="3"
      />
    </svg>

    <div class="score-bars">
      <div v-for="item in scores" :key="item.id" class="score-row">
        <div class="score-label">
          <span>{{ item.title }}</span>
          <strong>{{ item.score }}%</strong>
        </div>
        <div class="score-track">
          <span :style="{ width: `${item.score}%` }"></span>
        </div>
        <small>本卷 {{ item.total }} 题，样本量有限，仅供参考。</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scores: { type: Array, required: true },
})

const rings = [0.25, 0.5, 0.75, 1]

const axisPoints = computed(() => props.scores.map((item, index) => ({
  ...item,
  ...pointFor(index, props.scores.length, 92),
})))

const scoreDots = computed(() => props.scores.map((item, index) => ({
  ...item,
  ...pointFor(index, props.scores.length, 92 * (item.score / 100)),
})))

const scorePoints = computed(() => scoreDots.value.map(point => `${point.x},${point.y}`).join(' '))

function polygonPoints(scale) {
  return props.scores
    .map((_, index) => {
      const point = pointFor(index, props.scores.length, 92 * scale)
      return `${point.x},${point.y}`
    })
    .join(' ')
}

function pointFor(index, total, radius) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  return {
    x: 120 + Math.cos(angle) * radius,
    y: 120 + Math.sin(angle) * radius,
  }
}
</script>

<style scoped>
.radar-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  align-items: center;
  gap: 22px;
}

.radar {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
}

.radar-ring {
  fill: none;
  stroke: rgba(246, 243, 233, 0.16);
  stroke-width: 1;
}

.radar-axis {
  stroke: rgba(246, 243, 233, 0.12);
  stroke-width: 1;
}

.radar-score {
  fill: rgba(234, 255, 87, 0.18);
  stroke: var(--signal);
  stroke-width: 2;
}

.radar-dot {
  fill: var(--signal);
}

.score-bars {
  display: grid;
  gap: 12px;
}

.score-label {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-primary);
  font-size: 13px;
}

.score-label strong {
  color: var(--signal);
  font-family: var(--font-mono);
}

.score-track {
  height: 8px;
  margin-top: 6px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.04);
}

.score-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--signal));
}

.score-row small {
  display: block;
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 10px;
}

@media (max-width: 760px) {
  .radar-layout {
    grid-template-columns: 1fr;
  }

  .radar {
    justify-self: center;
    max-width: 240px;
  }
}
</style>
