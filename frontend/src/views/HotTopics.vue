<template>
  <!-- 行业热点 — 机器人 · 传感器 · AI -->
  <div class="hot-topics">
    <!-- 头部 -->
    <div class="header">
      <h1><AppIcon icon="microchip" size="26" /> 行业热点</h1>
      <p class="subtitle">机器人 · 传感器 · AI 每日动态</p>
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
      </div>

      <!-- 热点列表 -->
      <div v-if="filteredItems.length > 0" class="topic-list">
        <article v-for="item in filteredItems" :key="item.id" class="topic-card card">
          <div class="topic-header">
            <span class="source-badge">
              <AppIcon :icon="sourceIcon(item.source)" size="13" />
              {{ item.source }}
            </span>
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
import AppIcon from '@/components/AppIcon.vue'

const FALLBACK_DATA = {
  date: new Date().toISOString().slice(0, 10),
  items: [
    { id: "a1b2c3d4e5f6", title: "ROS 2 Jazzy Jalisco 正式发布 — 全新 LTS 版本带来多项改进", summary: "Open Robotics 宣布 ROS 2 最新 LTS 版本 Jazzy Jalisco 正式发布，支持 Ubuntu 24.04，改进了导航栈、实时性能和 DDS 中间件兼容性。", source: "ROS Discourse", sourceIcon: "ros", url: "https://discourse.openrobotics.org/", category: "ros2", tags: ["ros2", "release"], publishedAt: "2026-07-10T14:30:00Z" },
    { id: "b2c3d4e5f6a1", title: "特斯拉 Optimus 人形机器人进入量产阶段，目标年产 10 万台", summary: "特斯拉在 Q2 财报电话会上宣布 Optimus 人形机器人已进入试量产，2026 年目标产量 5-10 万台。", source: "The Robot Report", sourceIcon: "robot-report", url: "https://www.therobotreport.com/", category: "robot", tags: ["robot", "humanoid"], publishedAt: "2026-07-10T10:15:00Z" },
    { id: "c3d4e5f6a1b2", title: "速腾聚创发布新一代 512 线激光雷达，测距突破 300 米", summary: "速腾聚创发布 RS-LiDAR-M2，512 线束、最远探测距离 300 米，专为 L4 自动驾驶和机器人设计。", source: "机器之心", sourceIcon: "jiqizhixin", url: "https://www.jiqizhixin.com/", category: "lidar", tags: ["lidar", "sensor"], publishedAt: "2026-07-10T09:00:00Z" },
    { id: "d4e5f6a1b2c3", title: "Intel RealSense D457 深度相机：室内外通用，IP65 防护", summary: "Intel 推出 RealSense D457 立体深度相机，首次支持户外强光环境，IP65 防水防尘。", source: "IEEE Spectrum", sourceIcon: "ieee", url: "https://spectrum.ieee.org/", category: "camera", tags: ["camera", "sensor", "depth-camera"], publishedAt: "2026-07-10T08:45:00Z" },
    { id: "e5f6a1b2c3d4", title: "YOLOv12：端到端目标检测新范式，推理速度提升 3 倍", summary: "Ultralytics 发布 YOLOv12，Anchor-Free + Transformer 混合架构，推理速度提升 3 倍。", source: "GitHub Trending", sourceIcon: "github", url: "https://github.com/ultralytics/ultralytics", category: "ai", tags: ["ai", "yolo", "detection"], publishedAt: "2026-07-10T07:20:00Z" },
    { id: "f6a1b2c3d4e5", title: "具身智能赛道融资再创新高：上半年国内突破 200 亿元", summary: "2026 年上半年中国具身智能领域融资超 60 起，总金额突破 200 亿元，宇树科技、银河通用等估值超百亿。", source: "机器之心", sourceIcon: "jiqizhixin", url: "https://www.jiqizhixin.com/", category: "ai", tags: ["ai", "embodied-ai", "robot"], publishedAt: "2026-07-09T16:00:00Z" },
    { id: "a1c2e3f4d5b6", title: "Nav2 发布新版：支持多机器人协同导航与动态障碍物预测", summary: "ROS 2 Navigation2 最新版本新增多机器人协同导航功能，支持动态障碍物轨迹预测与协同避障。", source: "ROS Discourse", sourceIcon: "ros", url: "https://discourse.openrobotics.org/", category: "ros2", tags: ["ros2", "nav2", "navigation"], publishedAt: "2026-07-09T12:10:00Z" },
    { id: "b2d4f6a1c3e5", title: "基于 Gaussian Splatting 的实时 3D 重建：机器人 SLAM 新思路", summary: "arXiv 新论文提出将 3DGS 与 SLAM 结合，实现实时高精度 3D 场景重建，有望替代传统点云地图。", source: "arXiv CS.RO", sourceIcon: "arxiv", url: "https://arxiv.org/", category: "ai", tags: ["ai", "slam", "gaussian-splatting", "camera"], publishedAt: "2026-07-09T08:30:00Z" },
    { id: "c3e5a1b2d4f6", title: "波士顿动力推出全新电驱动 Atlas：更强、更安静、更便宜", summary: "波士顿动力正式推出全电驱动新 Atlas，负载提升 50%，噪音降低 80%，开始接受商业订单。", source: "TechCrunch", sourceIcon: "techcrunch", url: "https://techcrunch.com/", category: "robot", tags: ["robot", "humanoid"], publishedAt: "2026-07-08T15:00:00Z" },
    { id: "d4f6b2c3e5a1", title: "六维力传感器国产替代加速：宇立仪器拿下人形机器人亿元订单", summary: "国内六维力/力矩传感器厂商宇立仪器获得头部人形机器人公司亿元级订单，标志着力传感器进入量产阶段。", source: "机器之心", sourceIcon: "jiqizhixin", url: "https://www.jiqizhixin.com/", category: "sensor", tags: ["sensor", "torque-sensor", "robot"], publishedAt: "2026-07-08T11:30:00Z" },
  ],
  categories: [
    { key: "ros2", label: "ROS2", icon: "settings" },
    { key: "robot", label: "机器人", icon: "controller" },
    { key: "lidar", label: "激光雷达", icon: "target" },
    { key: "camera", label: "深度相机", icon: "camera" },
    { key: "ai", label: "AI", icon: "microchip" },
    { key: "sensor", label: "传感器", icon: "connection" },
  ],
  total: 10,
  generatedAt: new Date().toISOString(),
}

const data = ref(null)
const loading = ref(true)
const error = ref(null)
const targetDate = ref(null)
const archiveDates = ref([])
const activeCategory = ref('')
const searchQuery = ref('')

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

function getTodayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
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

const SOURCE_ICONS = {
  'ROS Discourse': 'settings', 'IEEE Spectrum': 'document', 'IEEE Spectrum Robotics': 'document',
  'The Robot Report': 'bullhorn', 'arXiv CS.RO': 'paper', 'GitHub Trending': 'code',
  '机器之心': 'microchip', '36氪': 'lightning', '量子位': 'target', 'InfoQ 中国': 'book',
  '少数派': 'star', 'ScienceDaily Robotics': 'document', 'Reddit r/robotics': 'message',
  'TechCrunch': 'share', 'TechCrunch Robotics': 'share', 'ROS 2 GitHub Discussions': 'code',
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

async function fetchTopics(date) {
  loading.value = true
  error.value = null
  targetDate.value = date

  try {
    let url = date ? '/topics-data/archive/' + date + '.json' : '/topics-data/hot-topics.json'
    const resp = await fetch(url)
    if (!resp.ok) throw new Error('HTTP ' + resp.status)
    const ct = resp.headers.get('content-type') || ''
    if (ct.includes('text/html')) {
      if (!date) { data.value = FALLBACK_DATA } else { throw new Error('归档数据暂不可用') }
    } else { data.value = await resp.json() }
  } catch (e) {
    if (!date) { data.value = FALLBACK_DATA; error.value = null } else { error.value = e.message }
  } finally { loading.value = false }

  if (archiveDates.value.length === 0) {
    try {
      const resp = await fetch('/topics-data/archive/index.json')
      if (resp.ok && !((resp.headers.get('content-type') || '').includes('text/html'))) {
        archiveDates.value = await resp.json()
      }
    } catch { /* ignore */ }
  }
}

onMounted(() => fetchTopics(null))
</script>

<style scoped>
.hot-topics { max-width: 860px; margin: 0 auto; }

/* -------- 头部 -------- */
.header { text-align: center; padding: 36px 0 24px; }
.header h1 { color: var(--text-primary); font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 700; }
.subtitle { color: var(--text-tertiary); font-size: 0.9rem; margin-top: 6px; }

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

/* -------- 热点列表 -------- */
.topic-list { display: flex; flex-direction: column; gap: 12px; }
.topic-card { padding: 18px 22px; }

.topic-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.source-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; background: var(--accent-muted); color: var(--accent); border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
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

  .category-tabs { gap: 6px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; }
  .category-tabs::-webkit-scrollbar { display: none; }
  .cat-btn { padding: 8px 14px; font-size: 0.8rem; white-space: nowrap; flex-shrink: 0; min-height: 40px; }

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
  .date-picker { gap: 6px; }
  .search-input { padding: 10px 14px 10px 36px; font-size: 0.85rem; }
}
</style>
