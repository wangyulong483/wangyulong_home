<template>
  <section class="knowledge-library">
    <header class="module-header">
      <div>
        <p class="module-kicker">KNOWLEDGE BASE / {{ String(allItems.length).padStart(2, '0') }}</p>
        <h2>攻略与角色档案</h2>
        <p class="module-meta">战斗养成 · 角色考据 · 官方机制</p>
      </div>
      <label class="search-box">
        <AppIcon icon="search" size="15" />
        <input v-model.trim="query" type="search" placeholder="搜索攻略或正文" aria-label="搜索攻略" />
      </label>
    </header>

    <div class="category-bar" aria-label="攻略分类">
      <button
        v-for="category in categories"
        :key="category.key"
        type="button"
        class="category-btn"
        :class="{ active: activeCategory === category.key }"
        @click="activeCategory = category.key"
      >
        {{ category.label }}
        <span>{{ category.count }}</span>
      </button>
    </div>

    <div class="result-line">
      <span>{{ filteredItems.length }} 篇内容</span>
      <span v-if="searching" class="live-search-state"><i></i> 正在检索 BWIKI</span>
      <span v-else-if="query.length >= 2 && !searchError" class="live-search-state ready"><i></i> 实时检索完成</span>
      <span v-else-if="searchError" class="search-error">{{ searchError }}</span>
      <button v-if="hasFilters" type="button" @click="resetFilters">
        <AppIcon icon="8-ui/cross" size="11" /> 重置
      </button>
    </div>

    <div v-if="filteredItems.length" class="guide-list">
      <article
        v-for="(item, index) in filteredItems"
        :key="item.id"
        class="guide-card"
        :class="[{ expanded: expandedId === item.id }, categoryClass(item.category)]"
      >
        <button type="button" class="guide-summary" @click="toggleExpand(item.id)" :aria-expanded="expandedId === item.id">
          <span class="guide-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="summary-main">
            <span class="summary-top">
              <span class="category-label">{{ item.category }}</span>
              <span>{{ formatDate(item.date) }}</span>
              <span><AppIcon icon="clock" size="11" /> {{ readingTime(item) }} 分钟</span>
            </span>
            <strong>{{ item.title }}</strong>
            <span class="guide-description">{{ item.summary }}</span>
            <span class="source-preview">
              <AppIcon icon="link" size="11" /> 来源 · {{ item.source || '站内整理' }}
            </span>
          </span>
          <span class="expand-control" :class="{ open: expandedId === item.id }">
            <AppIcon icon="arrow-down" size="16" />
          </span>
        </button>

        <div v-if="expandedId === item.id" class="guide-detail">
          <aside class="source-panel">
            <AppIcon icon="document" size="18" />
            <div>
              <strong>资料来源：{{ item.source || '站内整理' }}</strong>
              <p>{{ item.sourceNote || '内容经站内整理，请结合当前游戏版本核对。' }}</p>
            </div>
            <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">
              查看原始来源 <AppIcon icon="8-ui/arrow-up-right" size="13" />
            </a>
          </aside>
          <div class="markdown-body" v-html="renderedContent(item)"></div>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <AppIcon icon="search" size="24" />
      <strong>没有匹配的攻略</strong>
      <button type="button" @click="resetFilters">清除筛选</button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'
import AppIcon from '@/shared/components/AppIcon.vue'
import { useShrineSearch } from '@/features/shrine/composables/useShrineSearch.js'

marked.setOptions({ breaks: true, gfm: true })

const props = defineProps({
  items: { type: Array, required: true },
  liveItems: { type: Array, default: () => [] }
})

const query = ref('')
const activeCategory = ref('all')
const expandedId = ref(null)
const { results: remoteResults, searching, searchError } = useShrineSearch('wiki', query)

const allItems = computed(() => {
  const merged = [...props.liveItems, ...props.items, ...remoteResults.value]
  const seen = new Set()
  return merged.filter(item => {
    const key = item.sourceUrl || String(item.id)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

const categories = computed(() => {
  const keys = [...new Set(allItems.value.map(item => item.category).filter(Boolean))]
  return [
    { key: 'all', label: '全部', count: allItems.value.length },
    ...keys.map(key => ({ key, label: key, count: allItems.value.filter(item => item.category === key).length }))
  ]
})

const filteredItems = computed(() => {
  const keyword = query.value.toLowerCase()
  return allItems.value.filter(item => {
    const categoryMatched = activeCategory.value === 'all' || item.category === activeCategory.value
    const text = [item.title, item.summary, item.content, item.source, item.category].join(' ').toLowerCase()
    return categoryMatched && (!keyword || text.includes(keyword))
  })
})

const hasFilters = computed(() => query.value || activeCategory.value !== 'all')

function resetFilters() {
  query.value = ''
  activeCategory.value = 'all'
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function renderedContent(item) {
  return marked(item.content || '')
}

function readingTime(item) {
  return Math.max(1, Math.ceil(String(item.content || '').length / 500))
}

function formatDate(value) {
  return String(value || '').replaceAll('-', '.')
}

function categoryClass(category) {
  const map = { '战斗攻略': 'combat', '角色考据': 'lore', '官方资料': 'official' }
  return map[category] || 'default'
}
</script>

<style scoped>
.knowledge-library { min-width: 0; }

.module-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding: 6px 0 22px;
  border-bottom: 1px solid var(--border);
}

.module-kicker {
  margin: 0 0 7px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 700;
}

.module-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.45rem;
  line-height: 1.1;
}

.module-meta {
  margin: 9px 0 0;
  color: var(--text-tertiary);
  font-size: 0.76rem;
}

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

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 0.78rem;
}

.search-box input::placeholder { color: var(--text-tertiary); }

.category-bar {
  display: flex;
  gap: 6px;
  padding: 15px 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-bar::-webkit-scrollbar { display: none; }

.category-btn {
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

.category-btn span { color: var(--text-tertiary); font-size: 0.62rem; }
.category-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.category-btn.active { border-color: var(--signal); background: var(--signal); color: #0b0b0e; }
.category-btn.active span { color: rgba(11, 11, 14, 0.58); }

.result-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: space-between;
  min-height: 28px;
  margin-bottom: 9px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.65rem;
}
.live-search-state, .search-error { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; margin-right: 8px; }
.live-search-state { color: var(--signal); }
.live-search-state i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 0 0 7px currentColor; animation: live-pulse 1s infinite; }
.live-search-state.ready i { animation: none; }
.search-error { color: #d09aaa; }
@keyframes live-pulse { 50% { opacity: 0.3; } }

.result-line button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
}

.guide-list { display: grid; gap: 10px; }

.guide-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(17, 16, 22, 0.86);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.guide-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  content: '';
  background: var(--guide-accent, var(--accent));
}

.guide-card.combat { --guide-accent: #C9A96E; }
.guide-card.lore { --guide-accent: var(--accent); }
.guide-card.official { --guide-accent: var(--signal); }
.guide-card:hover, .guide-card.expanded { border-color: var(--border-hover); box-shadow: var(--shadow-glow); }

.guide-summary {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 36px;
  gap: 14px;
  width: 100%;
  padding: 18px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.guide-index {
  color: var(--guide-accent, var(--accent));
  font-family: var(--font-mono);
  font-size: 1.2rem;
  font-weight: 700;
}

.summary-main { display: flex; min-width: 0; flex-direction: column; }

.summary-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.62rem;
}

.summary-top > span { display: inline-flex; align-items: center; gap: 4px; }

.category-label {
  padding: 2px 6px;
  border: 1px solid color-mix(in srgb, var(--guide-accent) 35%, transparent);
  border-radius: 2px;
  color: var(--guide-accent);
}

.summary-main > strong {
  margin: 9px 0 6px;
  color: var(--text-primary);
  font-size: 0.98rem;
  line-height: 1.4;
}

.guide-description { color: var(--text-secondary); font-size: 0.78rem; line-height: 1.65; }

.source-preview {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.62rem;
}

.expand-control {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-tertiary);
  transition: transform 0.25s, color 0.25s, border-color 0.25s;
}

.expand-control.open { transform: rotate(180deg); border-color: var(--guide-accent); color: var(--guide-accent); }

.guide-detail {
  padding: 0 20px 24px 78px;
  border-top: 1px solid rgba(246, 243, 233, 0.08);
}

.source-panel {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  margin: 18px 0 20px;
  padding: 12px;
  border: 1px solid rgba(201, 169, 110, 0.24);
  border-radius: var(--radius);
  background: rgba(201, 169, 110, 0.06);
  color: #C9A96E;
}

.source-panel strong { color: #e7d3ad; font-size: 0.73rem; }
.source-panel p { margin: 4px 0 0; color: var(--text-secondary); font-size: 0.68rem; line-height: 1.55; }
.source-panel a { display: inline-flex; align-items: center; gap: 5px; color: var(--signal); font-family: var(--font-mono); font-size: 0.64rem; text-decoration: none; }

.markdown-body :deep(h1), .markdown-body :deep(h2), .markdown-body :deep(h3) {
  margin: 22px 0 10px;
  color: #e7d3ad;
  font-family: var(--font-body);
}
.markdown-body :deep(h2) { font-size: 1.08rem; }
.markdown-body :deep(h3) { font-size: 0.94rem; }
.markdown-body :deep(p), .markdown-body :deep(li) { color: var(--text-secondary); font-size: 0.8rem; line-height: 1.85; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { padding-left: 22px; }
.markdown-body :deep(strong) { color: var(--text-primary); }
.markdown-body :deep(hr) { margin: 20px 0; border: 0; border-top: 1px solid var(--border); }
.markdown-body :deep(blockquote) { margin: 14px 0; padding: 9px 12px; border-left: 2px solid #C9A96E; background: rgba(201, 169, 110, 0.06); }
.markdown-body :deep(blockquote p) { margin: 0; color: #d6c4a3; }
.markdown-body :deep(table) { width: 100%; margin: 14px 0; border-collapse: collapse; font-size: 0.75rem; }
.markdown-body :deep(th), .markdown-body :deep(td) { padding: 9px 10px; border: 1px solid var(--border); text-align: left; }
.markdown-body :deep(th) { background: var(--accent-muted); color: #d8ccff; }
.markdown-body :deep(td) { color: var(--text-secondary); }

.empty-state { display: grid; min-height: 260px; place-items: center; align-content: center; gap: 10px; color: var(--text-tertiary); }
.empty-state strong { color: var(--text-secondary); font-size: 0.9rem; }
.empty-state button { border: 0; background: transparent; color: var(--accent); cursor: pointer; }

@media (max-width: 720px) {
  .module-header { align-items: stretch; flex-direction: column; gap: 16px; }
  .module-header h2 { font-size: 1.2rem; }
  .search-box { width: 100%; min-height: 42px; box-sizing: border-box; }
  .category-bar { margin-right: -12px; padding-right: 12px; }
  .category-btn { min-height: 38px; }
  .guide-summary { grid-template-columns: 34px minmax(0, 1fr) 30px; gap: 9px; padding: 14px 12px; }
  .guide-index { font-size: 0.92rem; }
  .summary-top { gap: 7px; }
  .summary-main > strong { font-size: 0.9rem; }
  .guide-detail { padding: 0 12px 18px; }
  .source-panel { grid-template-columns: 20px minmax(0, 1fr); }
  .source-panel a { grid-column: 2; }
  .markdown-body { overflow-x: auto; }
}
</style>
