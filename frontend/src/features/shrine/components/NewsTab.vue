<template>
  <section class="news-library">
    <header class="module-header">
      <div>
        <p class="module-kicker">INTELLIGENCE FEED / {{ String(items.length).padStart(2, '0') }}</p>
        <h2>资讯与官方档案</h2>
        <p class="module-meta">版本动态 · 周边信息 · 官方影像档案</p>
      </div>
      <label class="search-box">
        <AppIcon icon="search" size="15" />
        <input v-model.trim="query" type="search" placeholder="搜索资讯或来源" aria-label="搜索资讯" />
      </label>
    </header>

    <div class="tag-bar" aria-label="资讯分类">
      <button
        v-for="tag in tags"
        :key="tag.key"
        type="button"
        class="tag-btn"
        :class="{ active: activeTag === tag.key }"
        @click="activeTag = tag.key"
      >
        {{ tag.label }} <span>{{ tag.count }}</span>
      </button>
    </div>

    <div class="feed-status">
      <span>{{ filteredItems.length }} 条记录</span>
      <span class="source-status"><AppIcon icon="link" size="11" /> 全部标注来源</span>
    </div>

    <div v-if="filteredItems.length" class="news-grid">
      <article v-for="(item, index) in filteredItems" :key="item.id" class="news-card">
        <header class="card-header">
          <span class="record-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="news-tag">{{ item.tag || '资讯' }}</span>
          <time :datetime="item.date">{{ formatDate(item.date) }}</time>
        </header>

        <h3>
          <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
          <span v-else>{{ item.title }}</span>
        </h3>
        <p class="news-summary">{{ item.summary }}</p>

        <p v-if="item.sourceNote" class="source-note">{{ item.sourceNote }}</p>

        <footer class="card-footer">
          <span class="source-label">
            <AppIcon icon="document" size="12" /> 来源 · {{ item.source || '站内整理' }}
          </span>
          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="source-link"
            :aria-label="`查看 ${item.title} 的来源`"
            title="查看来源"
          >
            <AppIcon icon="8-ui/arrow-up-right" size="15" />
          </a>
        </footer>
      </article>
    </div>

    <div v-else class="empty-state">
      <AppIcon icon="search" size="24" />
      <strong>没有匹配的资讯</strong>
      <button type="button" @click="resetFilters">清除筛选</button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const props = defineProps({
  items: { type: Array, required: true }
})

const query = ref('')
const activeTag = ref('all')

const tags = computed(() => {
  const keys = [...new Set(props.items.map(item => item.tag).filter(Boolean))]
  return [
    { key: 'all', label: '全部', count: props.items.length },
    ...keys.map(key => ({ key, label: key, count: props.items.filter(item => item.tag === key).length }))
  ]
})

const filteredItems = computed(() => {
  const keyword = query.value.toLowerCase()
  return props.items
    .filter(item => {
      const tagMatched = activeTag.value === 'all' || item.tag === activeTag.value
      const text = [item.title, item.summary, item.source, item.tag].join(' ').toLowerCase()
      return tagMatched && (!keyword || text.includes(keyword))
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
})

function resetFilters() {
  query.value = ''
  activeTag.value = 'all'
}

function formatDate(value) {
  return String(value || '').replaceAll('-', '.')
}
</script>

<style scoped>
.news-library { min-width: 0; }

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

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(280px, 34vw);
  min-height: 38px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(12, 12, 17, 0.72);
  color: var(--text-tertiary);
}
.search-box:focus-within { border-color: var(--border-hover); color: var(--accent); }
.search-box input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 0.78rem; }
.search-box input::placeholder { color: var(--text-tertiary); }

.tag-bar {
  display: flex;
  gap: 6px;
  padding: 15px 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.tag-bar::-webkit-scrollbar { display: none; }

.tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px;
  flex: 0 0 auto;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: rgba(18, 17, 24, 0.68);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.72rem;
}
.tag-btn span { color: var(--text-tertiary); font-size: 0.62rem; }
.tag-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.tag-btn.active { border-color: var(--signal); background: var(--signal); color: #0b0b0e; }
.tag-btn.active span { color: rgba(11, 11, 14, 0.58); }

.feed-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  margin-bottom: 9px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.65rem;
}
.source-status { display: inline-flex; align-items: center; gap: 5px; color: #9fb76c; }

.news-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }

.news-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 220px;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(17, 16, 22, 0.86);
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.news-card::before { position: absolute; top: 0; left: 0; width: 32px; height: 2px; content: ''; background: var(--signal); transition: width 0.3s; }
.news-card:hover { transform: translateY(-2px); border-color: var(--border-hover); box-shadow: var(--shadow-glow); }
.news-card:hover::before { width: 84px; }

.card-header { display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.62rem; }
.card-header time { margin-left: auto; }
.record-index { color: var(--signal); font-size: 0.76rem; font-weight: 700; }
.news-tag { padding: 2px 6px; border: 1px solid rgba(182, 156, 255, 0.24); border-radius: 2px; background: var(--accent-muted); color: #d7ccf4; }

.news-card h3 { margin: 15px 0 8px; font-family: var(--font-body); font-size: 0.94rem; line-height: 1.5; }
.news-card h3 a, .news-card h3 span { color: var(--text-primary); text-decoration: none; }
.news-card h3 a:hover { color: var(--signal); }
.news-summary { margin: 0; color: var(--text-secondary); font-size: 0.76rem; line-height: 1.7; }
.source-note { margin: 10px 0 0; padding: 8px 9px; border-left: 2px solid #C9A96E; background: rgba(201, 169, 110, 0.05); color: #bcae94; font-size: 0.66rem; line-height: 1.55; }

.card-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(246, 243, 233, 0.08); }
.source-label { display: inline-flex; min-width: 0; align-items: center; gap: 5px; overflow: hidden; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.62rem; text-overflow: ellipsis; white-space: nowrap; }
.source-link { display: grid; width: 28px; height: 28px; flex: 0 0 auto; place-items: center; border: 1px solid var(--border); border-radius: 50%; color: var(--text-secondary); }
.source-link:hover { border-color: var(--signal); color: var(--signal); }

.empty-state { display: grid; min-height: 260px; place-items: center; align-content: center; gap: 10px; color: var(--text-tertiary); }
.empty-state strong { color: var(--text-secondary); font-size: 0.9rem; }
.empty-state button { border: 0; background: transparent; color: var(--accent); cursor: pointer; }

@media (max-width: 720px) {
  .module-header { align-items: stretch; flex-direction: column; gap: 16px; }
  .module-header h2 { font-size: 1.2rem; }
  .search-box { width: 100%; min-height: 42px; box-sizing: border-box; }
  .tag-bar { margin-right: -12px; padding-right: 12px; }
  .tag-btn { min-height: 38px; }
  .news-grid { grid-template-columns: 1fr; }
  .news-card { min-height: 0; padding: 14px; }
}
</style>
