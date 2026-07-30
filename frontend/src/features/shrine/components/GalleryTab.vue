<template>
  <section class="media-library">
    <header class="library-header">
      <div class="library-heading">
        <p class="section-kicker">CURATED MEDIA / {{ String(allVideos.length).padStart(2, '0') }}</p>
        <h2>厨力影像馆</h2>
        <p class="library-stats">
          {{ allVideos.length }} 部精选作品
          <span aria-hidden="true">/</span>
          {{ formatNum(totalViews) }} 次播放
        </p>
      </div>

      <div class="library-tools">
        <label class="search-box">
          <AppIcon icon="search" size="15" />
          <input v-model.trim="query" type="search" placeholder="搜索标题、作者或标签" aria-label="搜索视频" />
        </label>

        <label class="sort-box">
          <AppIcon icon="8-ui/sort" size="15" />
          <select v-model="sortBy" aria-label="视频排序">
            <option value="curated">精选排序</option>
            <option value="latest">最新发布</option>
            <option value="views">最多播放</option>
            <option value="likes">最多点赞</option>
          </select>
        </label>
      </div>
    </header>

    <div class="category-bar" aria-label="视频分类">
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
      <span>{{ visibleVideos.length }} 项结果</span>
      <button v-if="hasFilters" type="button" class="reset-btn" @click="resetFilters">
        <AppIcon icon="8-ui/cross" size="11" />
        重置
      </button>
    </div>

    <div v-if="visibleVideos.length" class="video-grid">
      <article
        v-for="(video, index) in visibleVideos"
        :key="video.id"
        class="video-card"
        :class="{ official: video.group === '官方' }"
        :style="{ '--card-index': index }"
      >
        <button type="button" class="card-media" @click="openPlayer(video)" :aria-label="`播放 ${video.title}`">
          <img
            v-if="video.thumbnail && !coverErrors[video.id]"
            :src="video.thumbnail"
            :alt="`${video.title} 视频封面`"
            class="card-cover"
            width="1280"
            height="720"
            loading="eager"
            decoding="async"
            @error="coverErrors[video.id] = true"
          />
          <span v-else class="cover-fallback" aria-hidden="true">
            <AppIcon icon="image" size="30" />
          </span>

          <span class="media-shade" aria-hidden="true"></span>
          <span class="play-button" aria-hidden="true">
            <AppIcon icon="9-media/play" size="22" />
          </span>
          <span class="duration-badge">{{ formatDuration(video.duration) }}</span>
          <span v-if="video.group === '官方'" class="official-badge">OFFICIAL</span>
        </button>

        <div class="card-body">
          <div class="card-meta">
            <a
              v-if="video.authorUrl"
              :href="video.authorUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="author-link"
            >{{ video.author }}</a>
            <span v-else>{{ video.author }}</span>
            <time :datetime="video.date">{{ formatDate(video.date) }}</time>
          </div>

          <h3>{{ video.title }}</h3>
          <p class="video-summary">{{ video.summary }}</p>

          <div class="tag-list">
            <span v-for="tag in video.tags" :key="tag" class="video-tag">{{ tag }}</span>
          </div>

          <footer class="card-footer">
            <div class="engagement">
              <span title="播放量"><AppIcon icon="9-media/display" size="13" /> {{ formatNum(video.view) }}</span>
              <span title="点赞量"><AppIcon icon="9-media/like" size="13" /> {{ formatNum(video.like) }}</span>
            </div>
            <a
              :href="biliPage(video.url)"
              target="_blank"
              rel="noopener noreferrer"
              class="source-link"
              :aria-label="`在 B 站查看 ${video.title}`"
              title="前往 B 站"
            >
              <AppIcon icon="8-ui/arrow-up-right" size="15" />
            </a>
          </footer>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <AppIcon icon="search" size="24" />
      <strong>没有匹配的作品</strong>
      <button type="button" @click="resetFilters">清除筛选</button>
    </div>

    <Teleport to="body">
      <div v-if="activeVideo" class="video-modal" @click.self="closePlayer">
        <section class="player-panel" role="dialog" aria-modal="true" :aria-labelledby="`video-title-${activeVideo.id}`">
          <header class="player-header">
            <div>
              <p>{{ activeVideo.group }} / {{ activeVideo.author }}</p>
              <h3 :id="`video-title-${activeVideo.id}`">{{ activeVideo.title }}</h3>
            </div>
            <button type="button" class="close-btn" @click="closePlayer" aria-label="关闭播放器" title="关闭">
              <AppIcon icon="8-ui/cross" size="18" />
            </button>
          </header>

          <div class="player-frame">
            <iframe
              :src="biliEmbed(activeVideo.url)"
              :title="activeVideo.title"
              scrolling="no"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
              referrerpolicy="no-referrer"
            ></iframe>
          </div>

          <footer class="player-footer">
            <p>{{ activeVideo.summary }}</p>
            <a :href="biliPage(activeVideo.url)" target="_blank" rel="noopener noreferrer">
              前往 B 站
              <AppIcon icon="8-ui/arrow-up-right" size="14" />
            </a>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const props = defineProps({
  items: { type: Array, required: true },
  related: { type: Array, default: () => [] }
})

const query = ref('')
const sortBy = ref('curated')
const activeCategory = ref('all')
const activeVideo = ref(null)
const coverErrors = reactive({})

const categoryOrder = ['官方', 'MAD', '音乐', '混剪', 'MMD', 'COS', '展示']

function resolveCategory(item, group) {
  if (group === '官方') return '官方'
  if (item.tags?.includes('MMD')) return 'MMD'
  if (item.tags?.includes('COS')) return 'COS'
  if (item.tags?.includes('混剪')) return '混剪'
  if (item.tags?.some(tag => ['原创曲', '音乐', '生贺', 'CV'].includes(tag))) return '音乐'
  if (item.tags?.includes('MAD')) return 'MAD'
  return '展示'
}

const allVideos = computed(() => {
  const official = props.items
    .filter(item => item.platform === 'bilibili')
    .map((item, index) => ({ ...item, group: '官方', order: index }))
  const creations = props.related
    .filter(item => item.platform === 'bilibili')
    .map((item, index) => ({ ...item, group: '二创', order: official.length + index }))

  return [...official, ...creations].map(item => ({
    ...item,
    category: resolveCategory(item, item.group),
    view: Number(item.view) || 0,
    like: Number(item.like) || 0,
    duration: Number(item.duration) || 0,
    summary: item.summary || `${item.tags?.join(' · ') || '雷电将军'}精选影像。`
  }))
})

const totalViews = computed(() => allVideos.value.reduce((sum, item) => sum + item.view, 0))

const categories = computed(() => {
  const result = [{ key: 'all', label: '全部', count: allVideos.value.length }]
  for (const category of categoryOrder) {
    const count = allVideos.value.filter(item => item.category === category).length
    if (count) result.push({ key: category, label: category, count })
  }
  return result
})

const visibleVideos = computed(() => {
  const keyword = query.value.toLowerCase()
  const filtered = allVideos.value.filter(video => {
    const categoryMatched = activeCategory.value === 'all' || video.category === activeCategory.value
    const searchText = [video.title, video.author, video.summary, ...(video.tags || [])].join(' ').toLowerCase()
    return categoryMatched && (!keyword || searchText.includes(keyword))
  })

  return [...filtered].sort((a, b) => {
    if (sortBy.value === 'latest') return String(b.date).localeCompare(String(a.date))
    if (sortBy.value === 'views') return b.view - a.view
    if (sortBy.value === 'likes') return b.like - a.like
    return a.order - b.order
  })
})

const hasFilters = computed(() => query.value || activeCategory.value !== 'all' || sortBy.value !== 'curated')

function resetFilters() {
  query.value = ''
  activeCategory.value = 'all'
  sortBy.value = 'curated'
}

function formatNum(value) {
  const number = Number(value) || 0
  if (number >= 100000000) return `${(number / 100000000).toFixed(1)}亿`
  if (number >= 10000) return `${(number / 10000).toFixed(number >= 100000 ? 0 : 1)}万`
  return String(number)
}

function formatDuration(seconds) {
  const value = Number(seconds) || 0
  const minutes = Math.floor(value / 60)
  const remainder = value % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function formatDate(value) {
  return String(value || '').replaceAll('-', '.')
}

function biliPage(bvid) {
  return `https://www.bilibili.com/video/${bvid}`
}

function biliEmbed(bvid) {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0&autoplay=1`
}

function openPlayer(video) {
  activeVideo.value = video
  document.body.style.overflow = 'hidden'
}

function closePlayer() {
  activeVideo.value = null
  document.body.style.overflow = ''
}

function onKeydown(event) {
  if (event.key === 'Escape' && activeVideo.value) closePlayer()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.media-library {
  min-width: 0;
}

.library-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding: 6px 0 22px;
  border-bottom: 1px solid var(--border);
}

.section-kicker {
  margin: 0 0 7px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 700;
}

.library-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.45rem;
  line-height: 1.1;
}

.library-stats {
  display: flex;
  gap: 8px;
  margin: 9px 0 0;
  color: var(--text-tertiary);
  font-size: 0.76rem;
}

.library-stats span {
  color: rgba(201, 169, 110, 0.55);
}

.library-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box,
.sort-box {
  display: flex;
  align-items: center;
  min-height: 38px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(12, 12, 17, 0.72);
  color: var(--text-tertiary);
}

.search-box {
  width: min(280px, 34vw);
  gap: 8px;
  padding: 0 11px;
}

.search-box:focus-within,
.sort-box:focus-within {
  border-color: var(--border-hover);
  color: var(--accent);
}

.search-box input,
.sort-box select {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 0.78rem;
}

.search-box input {
  width: 100%;
}

.search-box input::placeholder {
  color: var(--text-tertiary);
}

.sort-box {
  gap: 5px;
  padding: 0 8px 0 10px;
}

.sort-box select {
  cursor: pointer;
}

.sort-box option {
  background: #17171d;
}

.category-bar {
  display: flex;
  gap: 6px;
  padding: 15px 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-bar::-webkit-scrollbar {
  display: none;
}

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
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.category-btn span {
  color: var(--text-tertiary);
  font-size: 0.62rem;
}

.category-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.category-btn.active {
  border-color: var(--signal);
  background: var(--signal);
  color: #0b0b0e;
}

.category-btn.active span {
  color: rgba(11, 11, 14, 0.58);
}

.result-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  margin-bottom: 9px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.65rem;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  border: 0;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.video-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: rgba(17, 16, 22, 0.86);
  box-shadow: var(--shadow-sm);
  animation: card-enter 0.45s both;
  animation-delay: calc(var(--card-index) * 35ms);
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.video-card::before {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  width: 28px;
  height: 2px;
  content: '';
  background: var(--signal);
  transition: width 0.3s;
}

.video-card.official::before {
  background: #C9A96E;
}

.video-card:hover {
  z-index: 1;
  transform: translateY(-3px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow);
}

.video-card:hover::before {
  width: 86px;
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(10px); }
}

.card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: #0a090e;
  color: #fff;
  cursor: pointer;
}

.card-cover,
.cover-fallback {
  width: 100%;
  height: 100%;
  display: block;
}

.card-cover {
  object-fit: cover;
  transition: transform 0.55s var(--ease-out), filter 0.35s;
}

.cover-fallback {
  display: grid;
  place-items: center;
  background: #171420;
  color: var(--text-tertiary);
}

.media-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(5, 4, 10, 0.03) 38%, rgba(5, 4, 10, 0.72));
  transition: background 0.25s;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 50%;
  background: rgba(9, 8, 14, 0.58);
  color: #fff;
  backdrop-filter: blur(8px);
  transition: transform 0.25s, border-color 0.25s, background 0.25s;
}

.video-card:hover .card-cover {
  transform: scale(1.035);
  filter: saturate(1.08);
}

.video-card:hover .play-button {
  transform: translate(-50%, -50%) scale(1.08);
  border-color: var(--signal);
  background: rgba(11, 11, 14, 0.82);
  color: var(--signal);
}

.duration-badge,
.official-badge {
  position: absolute;
  bottom: 8px;
  padding: 3px 6px;
  border-radius: 2px;
  background: rgba(8, 8, 11, 0.82);
  color: #f5f2f8;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
}

.duration-badge { right: 8px; }

.official-badge {
  left: 8px;
  color: #f1d5a5;
}

.card-body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  padding: 14px;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.64rem;
}

.author-link {
  min-width: 0;
  overflow: hidden;
  color: #cfc5eb;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-link:hover {
  color: var(--signal);
}

.video-card h3 {
  display: -webkit-box;
  margin: 10px 0 7px;
  overflow: hidden;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.92rem;
  line-height: 1.45;
  font-weight: 700;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.video-summary {
  display: -webkit-box;
  margin: 0 0 11px;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.73rem;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: auto;
}

.video-tag {
  padding: 2px 6px;
  border: 1px solid rgba(182, 156, 255, 0.2);
  border-radius: 2px;
  background: var(--accent-muted);
  color: #cfc5ec;
  font-family: var(--font-mono);
  font-size: 0.58rem;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 13px;
  padding-top: 10px;
  border-top: 1px solid rgba(246, 243, 233, 0.08);
}

.engagement {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.62rem;
}

.engagement span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.source-link {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-secondary);
}

.source-link:hover {
  border-color: var(--signal);
  color: var(--signal);
}

.empty-state {
  display: grid;
  min-height: 260px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: var(--text-tertiary);
  text-align: center;
}

.empty-state strong {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.empty-state button {
  border: 0;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
}

.video-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(5, 5, 8, 0.88);
  backdrop-filter: blur(14px);
}

.player-panel {
  width: min(1040px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-lg);
  background: #101014;
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.68);
}

.player-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.player-header p {
  margin: 0 0 5px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.63rem;
}

.player-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.45;
}

.close-btn {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: #17171c;
  color: var(--text-secondary);
  cursor: pointer;
}

.close-btn:hover {
  border-color: var(--signal);
  color: var(--signal);
}

.player-frame {
  aspect-ratio: 16 / 9;
  background: #000;
}

.player-frame iframe {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}

.player-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 18px 16px;
}

.player-footer p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.76rem;
  line-height: 1.6;
}

.player-footer a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-decoration: none;
}

@media (max-width: 960px) {
  .library-header {
    align-items: stretch;
    flex-direction: column;
    gap: 18px;
  }

  .library-tools {
    width: 100%;
  }

  .search-box {
    width: auto;
    flex: 1;
  }

  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .library-header {
    padding-bottom: 16px;
  }

  .library-heading h2 {
    font-size: 1.2rem;
  }

  .library-tools {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box,
  .sort-box {
    width: 100%;
    min-height: 42px;
    box-sizing: border-box;
  }

  .sort-box select {
    flex: 1;
  }

  .category-bar {
    margin-right: -12px;
    padding-right: 12px;
  }

  .category-btn {
    min-height: 38px;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .video-card h3 {
    font-size: 0.9rem;
  }

  .video-modal {
    align-items: end;
    padding: 0;
  }

  .player-panel {
    width: 100%;
    max-height: 92vh;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 7px 7px 0 0;
  }

  .player-header {
    padding: 14px;
  }

  .player-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 13px 14px 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .video-card {
    animation: none;
  }

  .video-card,
  .card-cover,
  .play-button {
    transition: none;
  }
}
</style>
