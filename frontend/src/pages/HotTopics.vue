<template>
  <!-- 行业热点 — 机器人 · 传感器 · AI -->
  <div class="hot-topics">
    <!-- 头部 -->
    <div class="header">
      <h1><AppIcon icon="microchip" size="26" /> 行业热点</h1>
      <p class="subtitle">合肥 · 国内机器人 · AI 产业动态，每 12 小时更新</p>
      <div v-if="data" class="freshness-line" :class="`is-${freshnessState}`">
        <span class="freshness-dot"></span>
        <span>{{ freshnessLabel }}</span>
        <span v-if="lastUpdatedLabel" class="updated-at">更新于 {{ lastUpdatedLabel }}</span>
        <span v-if="dataOrigin === 'archive'" class="data-origin">当前展示最近一次真实归档</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="state-wrap">
      <div class="loading-ring"></div>
      <p>正在加载最新热点...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="state-wrap">
      <AppIcon icon="bug" size="22" />
      <p>数据加载失败：{{ error }}</p>
      <button class="btn" @click="fetchTopics(targetDate)">重试</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 工具栏 -->
      <div class="toolbar card">
        <!-- 分类标签 -->
        <div class="category-tabs">
          <button
            v-for="cat in categoryList"
            :key="cat.key"
            :class="['cat-btn', { active: activeCategory === cat.key }]"
            @click="activeCategory = cat.key"
          >
            <AppIcon v-if="cat.icon" :icon="cat.icon" size="14" />
            {{ cat.label }}
          </button>
        </div>

        <div class="scope-filter" aria-label="地区范围">
          <span class="scope-label">关注范围</span>
          <button
            v-for="scope in scopeList"
            :key="scope.key"
            :class="['scope-btn', { active: activeScope === scope.key }]"
            type="button"
            @click="activeScope = scope.key"
          >
            {{ scope.label }}
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <AppIcon icon="search" size="15" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标题、摘要、标签..."
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">&#10005;</button>
        </div>

        <!-- 日期选择器 -->
        <div class="date-picker">
          <button class="btn date-arrow" @click="goToPrevDay" :disabled="!hasPrevDay">
            <AppIcon icon="arrow-left" size="13" /> 前一天
          </button>
          <span class="current-date">
            <AppIcon icon="calendar" size="14" /> {{ displayDate }}
          </span>
          <button class="btn date-arrow" @click="goToNextDay" :disabled="!hasNextDay">
            后一天 <AppIcon icon="arrow-right" size="13" />
          </button>
          <button v-if="!isToday" class="btn btn-primary today-btn" @click="goToToday">回今天</button>
        </div>
      </div>

      <!-- 统计 -->
      <div class="stats-bar">
        <span>共 <strong>{{ filteredItems.length }}</strong> 条热点</span>
        <span v-if="searchQuery" class="stats-filtered">（已筛选）</span>
        <span class="stats-source">来源：{{ sourceCount }} 个信息源</span>
        <span class="stats-chinese">中文：{{ chineseItemCount }} 条</span>
        <span v-if="data?.freshness?.windowHours" class="stats-window">
          时间窗：{{ data.freshness.windowHours }} 小时
        </span>
      </div>

      <!-- 热点列表 -->
      <div v-if="filteredItems.length > 0" class="topic-list">
        <article v-for="item in filteredItems" :key="item.id" class="topic-card card">
          <div class="topic-header">
            <div class="topic-source-line">
              <span class="source-badge" :title="item.sourceFeed || item.source">
                <AppIcon :icon="sourceIcon(item.source)" size="13" />
                {{ item.source }}
              </span>
              <span v-if="item.scope" :class="['scope-badge', `scope-${item.scope}`]">
                {{ scopeLabel(item.scope) }}
              </span>
            </div>
            <span class="topic-date">
              <AppIcon icon="clock" size="11" /> {{ formatDate(item.publishedAt) }}
            </span>
          </div>

          <h3 class="topic-title">
            <a :href="item.url" target="_blank" rel="noopener">
              {{ item.title }}
              <AppIcon icon="link" size="11" class="external-icon" />
            </a>
          </h3>

          <p v-if="item.summary" class="topic-summary">{{ item.summary }}</p>

          <div class="topic-tags">
            <span v-for="tag in item.tags" :key="tag" class="tag" @click="searchQuery = tag">
              {{ tagLabel(tag) }}
            </span>
          </div>
        </article>
      </div>

      <!-- 空结果 -->
      <div v-else class="state-wrap">
        <AppIcon icon="search" size="26" />
        <p v-if="searchQuery">没有找到匹配 "<strong>{{ searchQuery }}</strong>" 的热点</p>
        <p v-else>暂无热点数据</p>
        <button v-if="searchQuery" class="btn" @click="searchQuery = ''">清除搜索</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const FALLBACK_DATA = {
  date: null,
  items: [
  ],
  categories: [
    { key: "ros2", label: "ROS2", icon: "settings" },
    { key: "robot", label: "机器人", icon: "controller" },
    { key: "lidar", label: "激光雷达", icon: "target" },
    { key: "camera", label: "深度相机", icon: "camera" },
    { key: "ai", label: "AI", icon: "microchip" },
    { key: "sensor", label: "传感器", icon: "connection" },
  ],
  total: 0,
  generatedAt: null,
  fallback: true,
}

const data = ref(null)
const loading = ref(true)
const error = ref(null)
const dataOrigin = ref('live')
const targetDate = ref(null)
const archiveDates = ref([])
const activeCategory = ref('')
const searchQuery = ref('')
const activeScope = ref('')

const scopeList = [
  { key: '', label: '全部' },
  { key: 'hefei', label: '合肥 / 安徽' },
  { key: 'china', label: '国内' },
  { key: 'global', label: '国际' },
]

const categoryList = computed(() => {
  const cats = data.value?.categories || []
  return [{ key: '', label: '全部' }, ...cats]
})

const isToday = computed(() => targetDate.value === null || targetDate.value === getTodayStr())

const displayDate = computed(() => {
  if (isToday.value) return ' 今天（' + (targetDate.value || getTodayStr()) + '）'
  return ' ' + targetDate.value
})

const hasPrevDay = computed(() => {
  if (!targetDate.value) return false
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  return idx < archiveDates.value.length - 1
})

const hasNextDay = computed(() => {
  if (!targetDate.value || isToday.value) return false
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  return idx > 0
})

const filteredItems = computed(() => {
  const items = data.value?.items || []
  return items.filter(item => {
    if (activeScope.value && item.scope !== activeScope.value) return false
    if (activeCategory.value && item.category !== activeCategory.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const searchText = [item.title, item.summary, ...(item.tags || []), item.source].join(' ').toLowerCase()
      if (!searchText.includes(q)) return false
    }
    return true
  })
})

const sourceCount = computed(() => {
  const sources = new Set((data.value?.items || []).map(i => i.source))
  return sources.size
})

const chineseItemCount = computed(() => (
  (data.value?.items || []).filter(item => item.language === 'zh').length
))

const freshnessAgeHours = computed(() => {
  if (!data.value?.generatedAt) return Infinity
  const generatedAt = new Date(data.value.generatedAt).getTime()
  if (!Number.isFinite(generatedAt)) return Infinity
  return Math.max(0, (Date.now() - generatedAt) / 3_600_000)
})

const freshnessState = computed(() => {
  if (!isToday.value) return 'archive'
  if (freshnessAgeHours.value <= 13) return 'fresh'
  if (freshnessAgeHours.value <= 26) return 'delayed'
  return 'stale'
})

const freshnessLabel = computed(() => {
  if (!isToday.value) return '历史归档'
  if (freshnessState.value === 'fresh') return '数据已同步'
  if (freshnessState.value === 'delayed') return '数据更新延迟'
  return '数据已过期'
})

const lastUpdatedLabel = computed(() => {
  if (!data.value?.generatedAt) return ''
  const date = new Date(data.value.generatedAt)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date)
})

function getTodayStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return month + '月' + day + '日 ' + hour + ':' + min
}

const TAG_LABELS = {
  ros2: 'ROS2', robot: '机器人', lidar: '激光雷达', camera: '深度相机',
  ai: 'AI', sensor: '传感器', release: '发布', humanoid: '人形',
  navigation: '导航', slam: 'SLAM', detection: '检测', yolo: 'YOLO',
  'depth-camera': '深度相机', 'torque-sensor': '力矩', 'embodied-ai': '具身智能',
  'gaussian-splatting': '3D高斯',
}

function tagLabel(tag) { return TAG_LABELS[tag] || tag }

const SCOPE_LABELS = { hefei: '合肥/安徽', china: '国内', global: '国际' }
function scopeLabel(scope) { return SCOPE_LABELS[scope] || scope }

const SOURCE_ICONS = {
  'ROS Discourse': 'settings', 'IEEE Spectrum': 'document', 'IEEE Spectrum Robotics': 'document',
  'The Robot Report': 'bullhorn', 'arXiv CS.RO': 'paper', 'GitHub Trending': 'code',
  '机器之心': 'microchip', '36氪': 'lightning', '量子位': 'target', 'InfoQ 中国': 'book',
  '少数派': 'star', 'ScienceDaily Robotics': 'document', 'Reddit r/robotics': 'message',
  'TechCrunch': 'share', 'TechCrunch Robotics': 'share', 'ROS 2 GitHub Discussions': 'code',
  'MIT Robotics': 'book', 'Google DeepMind': 'microchip',
  'AWS Robotics Blog': 'cloud-download',
}

function sourceIcon(sourceName) { return SOURCE_ICONS[sourceName] || 'earth' }

function goToPrevDay() {
  if (!targetDate.value || !hasPrevDay.value) return
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  if (idx >= 0 && idx < archiveDates.value.length - 1) fetchTopics(archiveDates.value[idx + 1].date)
}

function goToNextDay() {
  if (!targetDate.value || !hasNextDay.value) return
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  if (idx > 0) fetchTopics(archiveDates.value[idx - 1].date)
}

function goToToday() { fetchTopics(null) }

async function requestJson(url) {
  const requestUrl = new URL(url, window.location.origin)
  requestUrl.searchParams.set('_', Date.now().toString())
  const resp = await fetch(requestUrl, { cache: 'no-store' })
  if (!resp.ok) throw new Error('HTTP ' + resp.status)
  const contentType = resp.headers.get('content-type') || ''
  if (contentType.includes('text/html')) throw new Error('返回了页面而不是 JSON 数据')
  return {
    payload: await resp.json(),
    origin: resp.headers.get('x-topics-origin') || 'static',
  }
}

async function requestTopics(date) {
  const apiUrl = date ? `/api/topics?date=${encodeURIComponent(date)}` : '/api/topics'
  const staticUrl = date
    ? `/topics-data/archive/${encodeURIComponent(date)}.json`
    : '/topics-data/hot-topics.json'

  try {
    return await requestJson(apiUrl)
  } catch {
    return requestJson(staticUrl)
  }
}

async function loadArchiveDates() {
  if (archiveDates.value.length) return archiveDates.value
  try {
    let result
    try {
      result = await requestJson('/api/topics/archive-index')
    } catch {
      result = await requestJson('/topics-data/archive/index.json')
    }
    archiveDates.value = Array.isArray(result.payload) ? result.payload : []
  } catch {
    archiveDates.value = []
  }
  return archiveDates.value
}

async function fetchTopics(date) {
  loading.value = true
  error.value = null
  targetDate.value = date

  try {
    const result = await requestTopics(date)
    if (!Array.isArray(result.payload?.items)) throw new Error('热点数据结构无效')
    data.value = result.payload
    dataOrigin.value = date ? 'archive' : result.origin
  } catch (e) {
    if (!date) {
      const dates = await loadArchiveDates()
      const latestArchive = dates[0]?.date
      if (latestArchive) {
        try {
          const result = await requestTopics(latestArchive)
          data.value = result.payload
          dataOrigin.value = 'archive'
          targetDate.value = latestArchive
        } catch {
          data.value = FALLBACK_DATA
          error.value = '暂时无法获取真实热点数据'
        }
      } else {
        data.value = FALLBACK_DATA
        error.value = '暂时无法获取真实热点数据'
      }
    } else {
      error.value = e.message || '归档数据暂不可用'
    }
  } finally {
    loading.value = false
  }

  await loadArchiveDates()
}

onMounted(() => fetchTopics(null))
</script>

<style scoped>
.hot-topics { max-width: 860px; margin: 0 auto; }

/* -------- 头部 -------- */
.header { text-align: center; padding: 36px 0 24px; }
.header h1 { color: var(--text-primary); font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 700; }
.subtitle { color: var(--text-tertiary); font-size: 0.9rem; margin-top: 6px; }
.freshness-line {
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 7px;
  margin-top: 12px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.68rem;
}
.freshness-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-tertiary); }
.freshness-line.is-fresh .freshness-dot { background: var(--signal); box-shadow: 0 0 9px rgba(234, 255, 87, 0.55); }
.freshness-line.is-delayed .freshness-dot { background: #e8b55d; }
.freshness-line.is-stale .freshness-dot { background: #e66a72; }
.freshness-line.is-archive .freshness-dot { background: var(--accent); }
.updated-at, .data-origin { color: var(--text-tertiary); }
.data-origin { padding-left: 7px; border-left: 1px solid var(--border); }

/* -------- 工具栏 -------- */
.toolbar { margin-bottom: 16px; }

/* 分类标签 */
.category-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.cat-btn {
  padding: 6px 16px; border: 1px solid var(--border); border-radius: 20px;
  background: var(--bg-card); color: var(--text-secondary); font-size: 0.84rem;
  cursor: pointer; transition: all 0.25s; font-family: inherit;
  display: inline-flex; align-items: center; gap: 4px;
}
.cat-btn:hover { border-color: var(--border-hover); color: var(--accent); background: var(--accent-muted); }
.cat-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.scope-filter { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin: -2px 0 14px; }
.scope-label { margin-right: 3px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.68rem; }
.scope-btn { min-height: 30px; padding: 4px 12px; border: 1px solid var(--border); border-radius: 3px; background: var(--bg-input); color: var(--text-secondary); font-family: inherit; font-size: 0.76rem; cursor: pointer; transition: 0.2s ease; }
.scope-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.scope-btn.active { border-color: rgba(234, 255, 87, 0.5); background: var(--signal-muted); color: var(--signal); }

/* 搜索框 */
.search-box { position: relative; margin-bottom: 14px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); opacity: 0.35; pointer-events: none; }
.search-input {
  width: 100%; padding: 10px 16px 10px 40px;
  border: 1px solid var(--border); border-radius: 24px;
  font-size: 0.9rem; background: var(--bg-input); color: var(--text-primary);
  outline: none; transition: border-color 0.3s, box-shadow 0.3s; font-family: inherit;
}
.search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-muted); }
.search-input::placeholder { color: var(--text-tertiary); }
.clear-search { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 1rem; }

/* 日期选择器 */
.date-picker { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.date-arrow { font-size: 0.82rem; }
.date-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
.current-date { display: inline-flex; align-items: center; gap: 4px; font-size: 0.9rem; color: var(--text-primary); font-weight: 600; min-width: 160px; text-align: center; justify-content: center; }
.today-btn { font-size: 0.82rem; }

/* -------- 统计 -------- */
.stats-bar { margin-bottom: 14px; padding: 0 4px; font-size: 0.82rem; color: var(--text-tertiary); }
.stats-filtered { margin-left: 4px; }
.stats-source { margin-left: 12px; opacity: 0.7; }
.stats-chinese { margin-left: 12px; color: var(--signal); opacity: 0.85; }
.stats-window { margin-left: 12px; opacity: 0.7; }

/* -------- 热点列表 -------- */
.topic-list { display: flex; flex-direction: column; gap: 12px; }
.topic-card { padding: 18px 22px; }

.topic-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.topic-source-line { display: flex; align-items: center; min-width: 0; gap: 6px; }
.source-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; background: var(--accent-muted); color: var(--accent); border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
.scope-badge { padding: 2px 7px; border: 1px solid var(--border); border-radius: 3px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.62rem; }
.scope-hefei { border-color: rgba(234, 255, 87, 0.35); color: var(--signal); }
.scope-china { border-color: rgba(102, 217, 255, 0.35); color: #87e3ff; }
.topic-date { display: inline-flex; align-items: center; gap: 3px; font-size: 0.78rem; color: var(--text-tertiary); }

.topic-title { margin: 0 0 8px 0; font-size: 1.02rem; line-height: 1.45; }
.topic-title a { color: var(--text-primary); transition: color 0.2s; }
.topic-title a:hover { color: var(--accent); }
.external-icon { opacity: 0.35; margin-left: 2px; vertical-align: -1px; }

.topic-summary { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.topic-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.topic-tags .tag { cursor: pointer; }

/* 标签颜色变体 */
.tag-ros2   { background: rgba(76, 175, 80, 0.15);  color: #66bb6a; }
.tag-robot  { background: rgba(33, 150, 243, 0.15);  color: #64b5f6; }
.tag-lidar  { background: rgba(255, 152, 0, 0.15);   color: #ffb74d; }
.tag-camera { background: rgba(156, 39, 176, 0.15);  color: #ce93d8; }
.tag-ai     { background: rgba(244, 67, 54, 0.15);   color: #ef9a9a; }
.tag-sensor { background: rgba(0, 150, 136, 0.15);   color: #80cbc4; }

/* -------- 状态页面 -------- */
.state-wrap { text-align: center; padding: 60px 40px; color: var(--text-tertiary); }
.loading-ring { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .hot-topics { padding: 0 8px; }
  .header h1 { font-size: 1.4rem; }
  .header { padding: 24px 0; }
  .subtitle { font-size: 0.85rem; }
  .freshness-line { padding: 0 12px; font-size: 0.62rem; }

  .category-tabs { gap: 6px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; }
  .category-tabs::-webkit-scrollbar { display: none; }
  .cat-btn { padding: 8px 14px; font-size: 0.8rem; white-space: nowrap; flex-shrink: 0; min-height: 40px; }
  .scope-filter { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 3px; scrollbar-width: none; }
  .scope-filter::-webkit-scrollbar { display: none; }
  .scope-label, .scope-btn { flex-shrink: 0; }

  .topic-card { padding: 14px 16px; }
  .topic-title { font-size: 0.93rem; }
  .topic-summary { font-size: 0.84rem; }
  .date-picker { gap: 8px; }
  .current-date { min-width: auto; font-size: 0.85rem; }
}

@media (max-width: 480px) {
  .header h1 { font-size: 1.3rem; }
  .topic-card { padding: 12px 14px; }
  .topic-title { font-size: 0.88rem; }
  .topic-header { align-items: flex-start; gap: 8px; }
  .source-badge { max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .date-picker { gap: 6px; }
  .search-input { padding: 10px 14px 10px 36px; font-size: 0.85rem; }
}
</style>
