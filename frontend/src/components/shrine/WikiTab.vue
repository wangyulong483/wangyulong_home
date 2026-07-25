<!--
  攻略/Wiki Tab
  三分类卡片（战斗攻略 / 角色考据 / 官方资料）
  左侧彩色竖线区分分类，Markdown 展开详情
-->
<template>
  <div class="wiki-tab">
    <!-- 分类筛选 -->
    <div class="category-filter" v-if="categories.length > 1">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="cat-btn"
        :class="{ active: activeCat === cat.key }"
        @click="activeCat = cat.key"
      >
        <span class="cat-icon">{{ cat.icon }}</span>
        {{ cat.label }}
        <span class="cat-count">({{ countByCat(cat.key) }})</span>
      </button>
    </div>

    <!-- 攻略列表 -->
    <div class="wiki-list" v-if="filteredItems.length">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="wiki-card"
        :class="{ expanded: expandedId === item.id }"
        :style="{ '--accent-color': categoryColor(item.category) }"
      >
        <!-- 收起状态：摘要卡片 -->
        <div class="wiki-summary" @click="toggleExpand(item.id)">
          <div class="accent-bar"></div>
          <div class="summary-content">
            <div class="summary-header">
              <span class="wiki-cat-tag">{{ item.category }}</span>
              <span class="wiki-date">{{ item.date }}</span>
            </div>
            <h4 class="wiki-title">{{ item.title }}</h4>
            <p class="wiki-desc">{{ item.summary }}</p>
            <div class="wiki-meta">
              <span class="wiki-source" v-if="item.source">
                来源：{{ item.source }}
                <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener" class="source-link">🔗</a>
              </span>
              <span class="expand-hint">{{ expandedId === item.id ? '点击收起 ▲' : '点击展开 ▼' }}</span>
            </div>
          </div>
        </div>

        <!-- 展开状态：Markdown 正文 -->
        <div class="wiki-detail" v-if="expandedId === item.id" v-html="renderedContent(item)">
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>还没有攻略内容 📜</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'

/* marked 安全配置 */
marked.setOptions({
  breaks: true,
  gfm: true,
})

const props = defineProps({
  items: { type: Array, required: true }
})

/* 分类列表 */
const categories = computed(() => {
  const keys = [...new Set(props.items.map(i => i.category))]
  return [{ key: 'all', label: '全部', icon: '📚' },
    ...keys.map(k => ({ key: k, label: k, icon: catIcon(k) }))]
})

function catIcon(cat) {
  const map = { '战斗攻略': '⚔️', '角色考据': '📖', '官方资料': '📋' }
  return map[cat] || '📄'
}

function categoryColor(cat) {
  const map = { '战斗攻略': '#C9A96E', '角色考据': '#B088F9', '官方资料': '#D488EE' }
  return map[cat] || '#B088F9'
}

/* 筛选 */
const activeCat = ref('all')

function countByCat(cat) {
  if (cat === 'all') return props.items.length
  return props.items.filter(i => i.category === cat).length
}

const filteredItems = computed(() => {
  if (activeCat.value === 'all') return props.items
  return props.items.filter(i => i.category === activeCat.value)
})

/* 展开/收起 */
const expandedId = ref(null)

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

/* Markdown 渲染 */
function renderedContent(item) {
  return marked(item.content || '')
}
</script>

<style scoped>
/* ====== 分类筛选 ====== */
.category-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border-radius: 16px;
  border: 1px solid rgba(176, 136, 249, 0.2);
  background: transparent;
  color: rgba(200, 190, 230, 0.7);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.25s;
}

.cat-btn:hover {
  border-color: rgba(176, 136, 249, 0.5);
  color: #B088F9;
}

.cat-btn.active {
  background: rgba(176, 136, 249, 0.15);
  border-color: rgba(176, 136, 249, 0.5);
  color: #B088F9;
  font-weight: 600;
}

.cat-icon { font-size: 0.9rem; }
.cat-count { font-size: 0.72rem; opacity: 0.6; }

/* ====== 攻略列表 ====== */
.wiki-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ====== 攻略卡片 ====== */
.wiki-card {
  background: rgba(107, 76, 154, 0.06);
  border: 1px solid rgba(176, 136, 249, 0.1);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s;
}

.wiki-card:hover {
  border-color: rgba(176, 136, 249, 0.25);
}

.wiki-card.expanded {
  border-color: rgba(176, 136, 249, 0.3);
  box-shadow: 0 0 16px rgba(176, 136, 249, 0.06);
}

/* 收起状态 */
.wiki-summary {
  display: flex;
  cursor: pointer;
  user-select: none;
}

/* 左侧彩色竖线 */
.accent-bar {
  width: 4px;
  flex-shrink: 0;
  background: var(--accent-color, #B088F9);
  border-radius: 2px 0 0 2px;
  transition: width 0.3s;
}

.wiki-card:hover .accent-bar {
  width: 6px;
}

.summary-content {
  flex: 1;
  padding: 16px 20px;
  min-width: 0;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.wiki-cat-tag {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(176, 136, 249, 0.12);
  color: rgba(176, 136, 249, 0.8);
}

.wiki-date {
  font-size: 0.72rem;
  color: rgba(180, 170, 210, 0.45);
}

.wiki-title {
  margin: 0 0 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(220, 210, 245, 0.9);
}

.wiki-desc {
  margin: 0 0 10px;
  font-size: 0.84rem;
  color: rgba(200, 190, 230, 0.6);
  line-height: 1.5;
}

.wiki-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wiki-source {
  font-size: 0.72rem;
  color: rgba(180, 170, 210, 0.4);
}

.source-link {
  text-decoration: none;
  font-size: 0.7rem;
}

.expand-hint {
  font-size: 0.7rem;
  color: rgba(176, 136, 249, 0.35);
}

/* 展开：Markdown 正文 */
.wiki-detail {
  padding: 0 20px 20px 24px;
  border-top: 1px solid rgba(176, 136, 249, 0.1);
}

/* Markdown 样式 */
.wiki-detail :deep(h1),
.wiki-detail :deep(h2),
.wiki-detail :deep(h3) {
  color: #C9A96E;
  margin: 20px 0 10px;
}

.wiki-detail :deep(h2) { font-size: 1.1rem; }
.wiki-detail :deep(h3) { font-size: 0.95rem; }

.wiki-detail :deep(p) {
  color: rgba(200, 190, 230, 0.7);
  font-size: 0.86rem;
  line-height: 1.8;
  margin: 0 0 10px;
}

.wiki-detail :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 0.82rem;
}

.wiki-detail :deep(th) {
  background: rgba(176, 136, 249, 0.12);
  color: #B088F9;
  padding: 8px 12px;
  text-align: left;
  border: 1px solid rgba(176, 136, 249, 0.15);
}

.wiki-detail :deep(td) {
  padding: 6px 12px;
  border: 1px solid rgba(176, 136, 249, 0.1);
  color: rgba(200, 190, 230, 0.65);
}

.wiki-detail :deep(blockquote) {
  border-left: 3px solid rgba(201, 169, 110, 0.4);
  padding: 6px 14px;
  margin: 10px 0;
  background: rgba(201, 169, 110, 0.04);
  color: rgba(201, 169, 110, 0.7);
  border-radius: 0 6px 6px 0;
}

.wiki-detail :deep(code) {
  background: rgba(176, 136, 249, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #D488EE;
}

.wiki-detail :deep(hr) {
  border: none;
  border-top: 1px solid rgba(176, 136, 249, 0.15);
  margin: 16px 0;
}

.wiki-detail :deep(strong) {
  color: rgba(220, 210, 245, 0.9);
}

.wiki-detail :deep(ul),
.wiki-detail :deep(ol) {
  color: rgba(200, 190, 230, 0.7);
  font-size: 0.86rem;
  line-height: 1.8;
  padding-left: 20px;
}

/* ====== 空状态 ====== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(176, 136, 249, 0.35);
  font-size: 0.95rem;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .wiki-summary { flex-direction: column; }
  .accent-bar { width: 100%; height: 4px; border-radius: 2px 2px 0 0; }
  .wiki-card:hover .accent-bar { width: 100%; height: 6px; }
}
</style>
