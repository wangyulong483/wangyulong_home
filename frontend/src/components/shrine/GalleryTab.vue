<!--
  画廊 Tab
  B站视频卡片：封面 + 播放量 + 点赞数 + 点击播放
  官方精选（置顶）+ 热门推荐（JSON 数据）
  封面和播放量通过 B站 view API 客户端拉取
-->
<template>
  <div class="gallery-tab">

    <!-- ===== 官方精选 ===== -->
    <div class="section-label">官方精选</div>
    <div class="gallery-grid" v-if="pinnedItems.length">
      <div v-for="item in pinnedItems" :key="'p-' + item.id" class="gallery-card">
        <div class="card-media" @click="play(item.id)">
          <img v-if="getCover(item)" :src="getCover(item)" :alt="item.title" class="card-thumb" loading="lazy" />
          <div v-else class="card-thumb-placeholder"><span class="ph-text">B站视频</span></div>
          <div v-if="!playingMap[item.id]" class="play-overlay">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="rgba(255,255,255,0.85)">
              <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
              <polygon points="9,7 9,17 18,12" fill="rgba(255,255,255,0.9)"/>
            </svg>
          </div>
          <iframe v-if="playingMap[item.id]" :src="biliEmbed(item.url)" class="bili-iframe" allowfullscreen referrerpolicy="no-referrer"></iframe>
        </div>
        <div class="card-info">
          <div class="card-header">
            <span class="platform-badge badge-bilibili">B站</span>
            <span class="card-date">{{ item.date }}</span>
          </div>
          <h4 class="card-title">{{ item.title }}</h4>
          <div class="card-footer">
            <span class="card-author" v-if="item.author">by {{ item.author }}</span>
            <span class="card-stats">
              <span class="stat" v-if="getStat(item, 'view')" :title="'播放 ' + formatNum(getStat(item, 'view'))">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ formatNum(getStat(item, 'view')) }}
              </span>
              <span class="stat" v-if="getStat(item, 'like')" :title="'点赞 ' + formatNum(getStat(item, 'like'))">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                {{ formatNum(getStat(item, 'like')) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 热门推荐 ===== -->
    <div class="section-label" v-if="relatedItems.length">热门推荐</div>
    <div class="gallery-grid" v-if="relatedItems.length">
      <div v-for="item in relatedItems" :key="'r-' + item.id" class="gallery-card">
        <div class="card-media" @click="play(item.id)">
          <img v-if="getCover(item)" :src="getCover(item)" :alt="item.title" class="card-thumb" loading="lazy" />
          <div v-else class="card-thumb-placeholder"><span class="ph-text">B站视频</span></div>
          <div v-if="!playingMap[item.id]" class="play-overlay">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="rgba(255,255,255,0.85)">
              <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
              <polygon points="9,7 9,17 18,12" fill="rgba(255,255,255,0.9)"/>
            </svg>
          </div>
          <iframe v-if="playingMap[item.id]" :src="biliEmbed(item.url)" class="bili-iframe" allowfullscreen referrerpolicy="no-referrer"></iframe>
        </div>
        <div class="card-info">
          <div class="card-header">
            <span class="platform-badge badge-bilibili">B站</span>
            <span class="card-date">{{ item.date }}</span>
          </div>
          <h4 class="card-title">{{ item.title }}</h4>
          <div class="card-footer">
            <span class="card-author" v-if="item.author">by {{ item.author }}</span>
            <span class="card-stats">
              <span class="stat" v-if="getStat(item, 'view')" :title="'播放 ' + formatNum(getStat(item, 'view'))">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ formatNum(getStat(item, 'view')) }}
              </span>
              <span class="stat" v-if="getStat(item, 'like')" :title="'点赞 ' + formatNum(getStat(item, 'like'))">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                {{ formatNum(getStat(item, 'like')) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!pinnedItems.length && !relatedItems.length" class="empty-state">
      <p>还没有作品</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  related: { type: Array, default: () => [] }
})

const pinnedItems = computed(() => props.items.filter(i => i.platform === 'bilibili'))
const relatedItems = computed(() => props.related.filter(i => i.platform === 'bilibili'))

/* 所有需要拉取的 BV 号 */
const allItems = computed(() => [...pinnedItems.value, ...relatedItems.value])

/* ===== B站 iframe 嵌入 ===== */
function biliEmbed(bvid) {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0&autoplay=0&poster=1`
}

const playingMap = reactive({})
function play(id) { playingMap[id] = true }

/* ===== 通过 view API 批量拉取封面+播放量+点赞 ===== */
const statCache = reactive({})

async function fetchInfo(bvid) {
  if (statCache[bvid]) return
  try {
    const resp = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)
    if (!resp.ok) return
    const json = await resp.json()
    if (json.code === 0 && json.data) {
      const d = json.data
      statCache[bvid] = {
        pic: d.pic || '',
        view: d.stat?.view || 0,
        like: d.stat?.like || 0,
      }
    }
  } catch { /* 静默 */ }
}

function getCover(item) {
  return item.thumbnail || statCache[item.url]?.pic || ''
}

function getStat(item, key) {
  return statCache[item.url]?.[key] || 0
}

function formatNum(n) {
  if (!n) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

onMounted(async () => {
  /* 批量拉取，每次最多并发 6 个避免限流 */
  const batch = allItems.value.map(i => i.url)
  for (let i = 0; i < batch.length; i += 6) {
    await Promise.all(batch.slice(i, i + 6).map(bvid => fetchInfo(bvid)))
  }
})
</script>

<style scoped>
/* ===== 分区标签 ===== */
.section-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(200, 190, 230, 0.7);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(176, 136, 249, 0.12);
}

.section-label:not(:first-child) { margin-top: 36px; }

/* ===== 画廊网格 ===== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* ===== 卡片 ===== */
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

/* ===== 媒体区 ===== */
.card-media { position: relative; background: #000; cursor: pointer; }

.bili-iframe { width: 100%; aspect-ratio: 16 / 9; border: none; }

.card-thumb { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }

.card-thumb-placeholder {
  width: 100%; aspect-ratio: 16 / 9;
  display: flex; align-items: center; justify-content: center;
  background: rgba(107, 76, 154, 0.15);
}

.ph-text { color: rgba(176, 136, 249, 0.35); font-size: 0.9rem; }

.play-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  transition: background 0.3s;
}

.play-overlay:hover { background: rgba(0, 0, 0, 0.5); }

/* ===== 信息栏 ===== */
.card-info { padding: 14px 16px; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

.platform-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 8px; font-weight: 600; }
.badge-bilibili { background: rgba(251, 114, 153, 0.15); color: #FB7299; }

.card-date { font-size: 0.72rem; color: rgba(180, 170, 210, 0.5); }

.card-title {
  margin: 0 0 10px; font-size: 0.9rem; font-weight: 600;
  color: rgba(220, 210, 245, 0.9); line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.card-footer { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; }
.card-author { font-size: 0.75rem; color: rgba(180, 170, 210, 0.5); }

/* ===== 数据统计 ===== */
.card-stats { display: flex; gap: 12px; align-items: center; }

.stat { display: flex; align-items: center; gap: 3px; font-size: 0.72rem; color: rgba(180, 170, 210, 0.5); }
.stat svg { opacity: 0.5; flex-shrink: 0; }

/* ===== 空状态 ===== */
.empty-state { text-align: center; padding: 60px 20px; color: rgba(176, 136, 249, 0.35); font-size: 0.95rem; }

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: 1fr; }
}
</style>
