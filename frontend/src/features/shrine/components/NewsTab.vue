<!--
  资讯动态 Tab
  垂直时间线 + 标签分类
  紫色发光节点，日期 + 标签 + 内容
-->
<template>
  <div class="news-tab">
    <!-- 标签筛选 -->
    <div class="tag-filter" v-if="tags.length > 1">
      <button
        v-for="t in tags"
        :key="t.key"
        class="tag-btn"
        :class="{ active: activeTag === t.key }"
        @click="activeTag = t.key"
      >{{ t.label }} ({{ countByTag(t.key) }})</button>
    </div>

    <!-- 时间线 -->
    <div class="timeline" v-if="filteredItems.length">
      <div
        v-for="(item, idx) in filteredItems"
        :key="item.id"
        class="timeline-item"
      >
        <!-- 时间线节点 -->
        <div class="timeline-node">
          <div class="node-dot"></div>
          <div class="node-line" v-if="idx < filteredItems.length - 1"></div>
        </div>

        <!-- 内容卡片 -->
        <div class="timeline-card">
          <div class="card-top">
            <span class="news-tag" :class="'tag-' + (item.tag || 'default')">
              {{ item.tag || '资讯' }}
            </span>
            <span class="news-date">{{ item.date }}</span>
          </div>
          <h4 class="news-title">
            <a v-if="item.url" :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
            <span v-else>{{ item.title }}</span>
          </h4>
          <p class="news-summary">{{ item.summary }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>还没有最新动态</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true }
})

/* 标签列表 */
const tags = computed(() => {
  const keys = [...new Set(props.items.map(i => i.tag).filter(Boolean))]
  return [{ key: 'all', label: '全部' }, ...keys.map(k => ({ key: k, label: k }))]
})

/* 筛选 */
const activeTag = ref('all')

function countByTag(tag) {
  if (tag === 'all') return props.items.length
  return props.items.filter(i => i.tag === tag).length
}

const filteredItems = computed(() => {
  if (activeTag.value === 'all') return props.items
  return props.items.filter(i => i.tag === activeTag.value)
})
</script>

<style scoped>
/* ====== 标签筛选 ====== */
.tag-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.tag-btn {
  padding: 5px 14px;
  border-radius: 14px;
  border: 1px solid rgba(176, 136, 249, 0.2);
  background: transparent;
  color: rgba(200, 190, 230, 0.7);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.25s;
}

.tag-btn:hover {
  border-color: rgba(176, 136, 249, 0.5);
  color: #B088F9;
}

.tag-btn.active {
  background: rgba(176, 136, 249, 0.15);
  border-color: rgba(176, 136, 249, 0.5);
  color: #B088F9;
  font-weight: 600;
}

/* ====== 时间线 ====== */
.timeline {
  position: relative;
  padding-left: 32px;
}

/* ====== 时间线条目 ====== */
.timeline-item {
  display: flex;
  gap: 20px;
  position: relative;
}

/* ====== 时间线节点 ====== */
.timeline-node {
  position: absolute;
  left: -32px;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #B088F9;
  box-shadow: 0 0 10px rgba(176, 136, 249, 0.5), 0 0 24px rgba(176, 136, 249, 0.2);
  flex-shrink: 0;
  margin-top: 6px;
}

.node-line {
  width: 2px;
  flex: 1;
  min-height: 40px;
  background: linear-gradient(to bottom, rgba(176, 136, 249, 0.3), rgba(176, 136, 249, 0.05));
  margin-top: 6px;
}

/* ====== 内容卡片 ====== */
.timeline-card {
  flex: 1;
  background: rgba(107, 76, 154, 0.06);
  border: 1px solid rgba(176, 136, 249, 0.1);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.timeline-card:hover {
  border-color: rgba(176, 136, 249, 0.3);
  box-shadow: 0 0 16px rgba(176, 136, 249, 0.06);
  transform: translateX(4px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

/* 资讯标签配色 */
.news-tag {
  font-size: 0.68rem;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
}

.tag-皮肤   { background: rgba(212, 136, 238, 0.15); color: #D488EE; }
.tag-周边   { background: rgba(201, 169, 110, 0.15); color: #C9A96E; }
.tag-游戏   { background: rgba(176, 136, 249, 0.15); color: #B088F9; }
.tag-联动   { background: rgba(100, 200, 180, 0.15); color: #64C8B4; }
.tag-default { background: rgba(176, 136, 249, 0.1); color: rgba(176, 136, 249, 0.7); }

.news-date {
  font-size: 0.72rem;
  color: rgba(180, 170, 210, 0.45);
}

.news-title {
  margin: 0 0 8px;
  font-size: 0.92rem;
  font-weight: 600;
}

.news-title a {
  color: rgba(220, 210, 245, 0.9);
  text-decoration: none;
  transition: color 0.2s;
}

.news-title a:hover {
  color: #B088F9;
}

.news-title span {
  color: rgba(220, 210, 245, 0.9);
}

.news-summary {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(200, 190, 230, 0.55);
  line-height: 1.6;
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
  .timeline {
    padding-left: 24px;
  }

  .timeline-node {
    left: -24px;
  }

  .timeline-card:hover {
    transform: none;
  }
}
</style>
