<!--
  二创画廊 Tab
  响应式网格展示 B站视频 + Pixiv 插画 + 其他平台作品
  hover 紫色发光边框，来源平台标签
-->
<template>
  <div class="gallery-tab">
    <!-- 平台筛选 -->
    <div class="filter-bar" v-if="platforms.length > 1">
      <button
        v-for="p in platforms"
        :key="p.key"
        class="filter-btn"
        :class="{ active: activePlatform === p.key }"
        @click="activePlatform = p.key"
      >{{ p.label }} ({{ countByPlatform(p.key) }})</button>
    </div>

    <div class="gallery-grid" v-if="filteredItems.length">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="gallery-card"
      >
        <!-- B站视频：iframe 播放器 -->
        <template v-if="item.platform === 'bilibili'">
          <div class="card-media">
            <iframe
              :src="bilibiliEmbed(item.url)"
              class="bili-iframe"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
        </template>

        <!-- Pixiv / 其他平台：卡片 + 外链 -->
        <template v-else>
          <a :href="item.url" target="_blank" rel="noopener" class="card-media card-link">
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              :alt="item.title"
              class="card-thumb"
              loading="lazy"
            />
            <div v-else class="card-thumb-placeholder">
              <span class="ph-icon">{{ platformIcon(item.platform) }}</span>
            </div>
            <div class="visit-overlay">
              <span>前往查看 →</span>
            </div>
          </a>
        </template>

        <!-- 信息栏 -->
        <div class="card-info">
          <div class="card-header">
            <span class="platform-badge" :class="'badge-' + item.platform">
              {{ item.platformLabel || item.platform }}
            </span>
            <span class="card-date">{{ item.date }}</span>
          </div>
          <h4 class="card-title">{{ item.title }}</h4>
          <div class="card-footer">
            <span class="card-author" v-if="item.author">
              by {{ item.author }}
            </span>
            <span class="card-tags" v-if="item.tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">#{{ tag }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>还没有作品，快去收集吧 ⚡</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true }
})

/* 当前选中的平台筛选 */
const activePlatform = ref('all')
const platforms = computed(() => {
  const keys = [...new Set(props.items.map(i => i.platform))]
  return [{ key: 'all', label: '全部' }, ...keys.map(k => ({ key: k, label: props.items.find(i => i.platform === k)?.platformLabel || k }))]
})

function countByPlatform(platform) {
  if (platform === 'all') return props.items.length
  return props.items.filter(i => i.platform === platform).length
}

const filteredItems = computed(() => {
  if (activePlatform.value === 'all') return props.items
  return props.items.filter(i => i.platform === activePlatform.value)
})

/* B站 BV 号 → iframe 嵌入链接 */
function bilibiliEmbed(bvid) {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0&autoplay=0`
}

/* 平台图标 emoji */
function platformIcon(platform) {
  const map = { pixiv: '🎨', twitter: '🐦', lofter: '📝', other: '🔗' }
  return map[platform] || '🔗'
}
</script>

<style scoped>
/* ====== 筛选栏 ====== */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 16px;
  border-radius: 16px;
  border: 1px solid rgba(176, 136, 249, 0.2);
  background: transparent;
  color: rgba(200, 190, 230, 0.7);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.25s;
}

.filter-btn:hover {
  border-color: rgba(176, 136, 249, 0.5);
  color: #B088F9;
}

.filter-btn.active {
  background: rgba(176, 136, 249, 0.15);
  border-color: rgba(176, 136, 249, 0.5);
  color: #B088F9;
  font-weight: 600;
}

/* ====== 画廊网格 ====== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* ====== 卡片 ====== */
.gallery-card {
  background: rgba(107, 76, 154, 0.06);
  border: 1px solid rgba(176, 136, 249, 0.1);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s;
}

.gallery-card:hover {
  border-color: rgba(176, 136, 249, 0.35);
  box-shadow: 0 0 24px rgba(176, 136, 249, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* ====== 媒体区 ====== */
.card-media {
  position: relative;
  background: #000;
}

.bili-iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
}

.card-link {
  display: block;
  text-decoration: none;
}

.card-thumb {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.card-thumb-placeholder {
  width: 100%;
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(107, 76, 154, 0.15);
}

.ph-icon {
  font-size: 2rem;
}

/* 外链覆盖层 */
.visit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13, 13, 26, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.visit-overlay span {
  color: #B088F9;
  font-size: 0.9rem;
  border: 1px solid rgba(176, 136, 249, 0.5);
  padding: 8px 18px;
  border-radius: 20px;
}

.card-link:hover .visit-overlay {
  opacity: 1;
}

/* ====== 信息栏 ====== */
.card-info {
  padding: 14px 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.platform-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}

/* 平台标签配色 */
.badge-bilibili { background: rgba(251, 114, 153, 0.15); color: #FB7299; }
.badge-pixiv    { background: rgba(0, 150, 250, 0.15); color: #0096FA; }
.badge-twitter  { background: rgba(29, 161, 242, 0.15); color: #1DA1F2; }
.badge-lofter   { background: rgba(100, 200, 180, 0.15); color: #64C8B4; }
.badge-other    { background: rgba(176, 136, 249, 0.15); color: #B088F9; }

.card-date {
  font-size: 0.72rem;
  color: rgba(180, 170, 210, 0.5);
}

.card-title {
  margin: 0 0 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(220, 210, 245, 0.9);
  line-height: 1.4;
  /* 两行截断 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.card-author {
  font-size: 0.75rem;
  color: rgba(180, 170, 210, 0.5);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 0.68rem;
  color: rgba(176, 136, 249, 0.5);
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
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
