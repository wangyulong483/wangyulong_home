<template>
  <div class="learning-page">
    <header class="header">
      <div>
        <span class="section-code">LOG / KNOWLEDGE</span>
        <h1>学习记录</h1>
        <p class="header-sub">知识碎片、调试结论与可复用代码。</p>
      </div>
      <span class="record-count">{{ filteredRecords.length.toString().padStart(2, '0') }} 条记录</span>
    </header>

    <nav class="filters" aria-label="按主题筛选学习记录">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :class="{ active: activeCategory === category }"
        @click="activeCategory = category"
      >
        {{ category }}
      </button>
    </nav>

    <div class="record-list">
      <article v-for="record in filteredRecords" :key="record.id" :id="record.id" class="record">
        <aside class="record-meta">
          <time :datetime="record.date">{{ formatDate(record.date) }}</time>
          <span>{{ record.category }}</span>
        </aside>

        <div class="record-body">
          <h2>{{ record.title }}</h2>
          <p class="summary">{{ record.summary }}</p>

          <ul>
            <li v-for="point in record.points" :key="point">{{ point }}</li>
          </ul>

          <LearningCodeBlock
            :code="record.code.value"
            :language="record.code.language"
            :filename="record.code.filename"
          />
        </div>
      </article>
    </div>

    <p v-if="filteredRecords.length === 0" class="empty-state">这个主题还没有记录。</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import LearningCodeBlock from '@/features/learning/components/LearningCodeBlock.vue'
import { learningRecords } from '@/features/learning/data/records.js'

const allCategory = '全部'
const activeCategory = ref(allCategory)
const categories = computed(() => [allCategory, ...new Set(learningRecords.map(record => record.category))])
const filteredRecords = computed(() => {
  if (activeCategory.value === allCategory) return learningRecords
  return learningRecords.filter(record => record.category === activeCategory.value)
})

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00+08:00`))
}
</script>

<style scoped>
.learning-page {
  width: min(100%, 980px);
  margin: 0 auto;
  padding-bottom: 48px;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
}

.section-code,
.record-count {
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 0.7rem;
}

.header h1 { margin-top: 8px; }

.record-count {
  margin-bottom: 4px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.filters {
  display: flex;
  margin: 0 0 18px;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filters::-webkit-scrollbar { display: none; }

.filters button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s var(--ease-out), border-color 0.2s var(--ease-out), background 0.2s var(--ease-out);
}

.filters button:hover {
  color: var(--text-primary);
  background: var(--bg-input);
}

.filters button.active {
  border-color: rgba(234, 255, 87, 0.3);
  background: var(--signal-muted);
  color: var(--signal);
}

.record-list { border-top: 1px solid var(--border); }

.record {
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr);
  gap: 30px;
  padding: 38px 0 42px;
  border-bottom: 1px solid var(--border);
  scroll-margin-top: 24px;
}

.record-meta {
  display: flex;
  padding-top: 6px;
  flex-direction: column;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
}

.record-meta time { color: var(--text-tertiary); }

.record-meta span {
  width: fit-content;
  padding: 2px 6px;
  border-left: 2px solid var(--signal);
  background: var(--signal-muted);
  color: var(--signal);
}

.record-body { min-width: 0; }

.record-body h2 {
  margin: 0 0 12px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1.35rem;
  line-height: 1.35;
}

.summary {
  margin-bottom: 16px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.85;
}

.record-body ul {
  display: grid;
  margin: 0 0 24px;
  padding: 0;
  gap: 8px;
  list-style: none;
}

.record-body li {
  position: relative;
  padding-left: 18px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.7;
}

.record-body li::before {
  position: absolute;
  top: 0.72em;
  left: 0;
  width: 6px;
  height: 2px;
  content: '';
  background: var(--accent);
}

.empty-state {
  padding: 64px 0;
  color: var(--text-tertiary);
  text-align: center;
}

@media (max-width: 700px) {
  .header { align-items: flex-start; flex-direction: column; gap: 8px; }
  .record-count { margin: 0; }
  .record { grid-template-columns: 1fr; gap: 16px; padding: 30px 0 34px; }
  .record-meta { flex-direction: row; align-items: center; }
  .record-body h2 { font-size: 1.18rem; }
}
</style>
