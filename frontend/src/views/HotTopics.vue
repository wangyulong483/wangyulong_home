<template>
  <!--
    行业热点组件
    功能：分类筛选 + 关键词搜索 + 日期归档浏览
    数据来源：/data/hot-topics.json（GitHub Actions 每日自动生成）
  -->
  <div class="hot-topics">
    <!-- ===== 头部 — 液态玻璃 ===== -->
    <div class="header liquid-glass">
      <h1><AppIcon icon="microchip" size="28" /> 行业热点</h1>
      <p class="subtitle">机器人 · 传感器 · AI 每日动态</p>
    </div>

    <!-- ===== 加载状态 ===== -->
    <div v-if="loading" class="loading glass-card">
      <AppIcon icon="cloud-download" size="24" />
      <p>正在加载最新热点...</p>
    </div>

    <!-- ===== 错误状态 ===== -->
    <div v-else-if="error" class="error glass-card">
      <AppIcon icon="bug" size="24" />
      <p>数据加载失败：{{ error }}</p>
      <button class="retry-btn" @click="fetchTopics(targetDate)">重试</button>
    </div>

    <!-- ===== 正常内容 ===== -->
    <template v-else>
      <!-- 工具栏：分类筛选 + 搜索 + 日期 -->
      <div class="toolbar glass-card">
        <!-- 分类筛选标签 -->
        <div class="category-tabs">
          <button
            v-for="cat in categoryList"
            :key="cat.key"
            :class="['tab', { active: activeCategory === cat.key }]"
            @click="activeCategory = cat.key"
          >
            <AppIcon v-if="cat.icon" :icon="cat.icon" size="15" />
            {{ cat.label }}
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <AppIcon icon="search" size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标题、摘要、标签..."
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
            ✕
          </button>
        </div>

        <!-- 日期切换器 -->
        <div class="date-picker">
          <button class="date-arrow" @click="goToPrevDay" :disabled="!hasPrevDay">
            <AppIcon icon="arrow-left" size="14" /> 前一天
          </button>
          <span class="current-date">
            <AppIcon icon="calendar" size="15" /> {{ displayDate }}
          </span>
          <button class="date-arrow" @click="goToNextDay" :disabled="!hasNextDay">
            后一天 <AppIcon icon="arrow-right" size="14" />
          </button>
          <button v-if="!isToday" class="today-btn" @click="goToToday">回今天</button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-bar">
        <span>共 <strong>{{ filteredItems.length }}</strong> 条热点</span>
        <span v-if="searchQuery">（已筛选）</span>
        <span class="stats-source">来源：{{ sourceCount }} 个信息源</span>
      </div>

      <!-- 热点列表 -->
      <div v-if="filteredItems.length > 0" class="topic-list">
        <article
          v-for="item in filteredItems"
          :key="item.id"
          class="topic-card glass-card"
        >
          <!-- 头部：来源图标 + 来源名称 + 时间 -->
          <div class="topic-header">
            <span class="source-badge">
              <AppIcon :icon="sourceIcon(item.source)" size="14" />
              {{ item.source }}
            </span>
            <span class="topic-date">
              <AppIcon icon="clock" size="12" /> {{ formatDate(item.publishedAt) }}
            </span>
          </div>

          <!-- 标题 — 可点击跳转原文 -->
          <h3 class="topic-title">
            <a :href="item.url" target="_blank" rel="noopener noreferrer">
              {{ item.title }}
              <AppIcon icon="link" size="12" class="external-icon" />
            </a>
          </h3>

          <!-- 摘要 -->
          <p v-if="item.summary" class="topic-summary">{{ item.summary }}</p>

          <!-- 标签 -->
          <div class="topic-tags">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="tag"
              :class="`tag-${tag}`"
              @click="searchQuery = tag"
            >
              {{ tagLabel(tag) }}
            </span>
          </div>
        </article>
      </div>

      <!-- 空结果 -->
      <div v-else class="empty glass-card">
        <AppIcon icon="search" size="28" />
        <p v-if="searchQuery">没有找到匹配 "<strong>{{ searchQuery }}</strong>" 的热点</p>
        <p v-else>暂无热点数据</p>
        <button v-if="searchQuery" class="retry-btn" @click="searchQuery = ''">清除搜索</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

// ============================================================
// 兜底数据 — Cloudflare Pages SPA fallback 拦截 JSON 时使用
// ============================================================

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

// ============================================================
// 状态
// ============================================================

/** 当前加载的 JSON 数据 */
const data = ref(null)
/** 加载状态 */
const loading = ref(true)
/** 错误信息 */
const error = ref(null)
/** 当前查看的日期（YYYY-MM-DD），null 表示今天 */
const targetDate = ref(null)
/** 归档日期列表 */
const archiveDates = ref([])

// ============================================================
// 筛选 & 搜索
// ============================================================

/** 当前激活的分类筛选（空字符串 = 全部） */
const activeCategory = ref('')
/** 搜索关键词 */
const searchQuery = ref('')

// ============================================================
// 计算属性
// ============================================================

/** 分类列表（"全部" + data 中定义的分类） */
const categoryList = computed(() => {
  const cats = data.value?.categories || []
  return [{ key: '', label: '全部' }, ...cats]
})

/** 今天的日期 */
const isToday = computed(() => {
  return targetDate.value === null || targetDate.value === getTodayStr()
})

/** 显示的日期文本 */
const displayDate = computed(() => {
  if (isToday.value) return `📅 今天（${targetDate.value || getTodayStr()}）`
  return `📅 ${targetDate.value}`
})

/** 是否有前一天的数据 */
const hasPrevDay = computed(() => {
  if (!targetDate.value) return false
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  return idx < archiveDates.value.length - 1
})

/** 是否有后一天的数据 */
const hasNextDay = computed(() => {
  if (!targetDate.value || isToday.value) return false
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  return idx > 0
})

/** 经分类和搜索双重筛选后的热点列表 */
const filteredItems = computed(() => {
  const items = data.value?.items || []
  return items.filter(item => {
    // 分类筛选
    if (activeCategory.value && item.category !== activeCategory.value) return false

    // 关键词搜索（标题、摘要、标签、来源）
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const searchText = [
        item.title,
        item.summary,
        ...(item.tags || []),
        item.source,
      ].join(' ').toLowerCase()
      if (!searchText.includes(q)) return false
    }

    return true
  })
})

/** 不同信息源的数量 */
const sourceCount = computed(() => {
  const sources = new Set((data.value?.items || []).map(i => i.source))
  return sources.size
})

// ============================================================
// 方法
// ============================================================

/** 获取今天的日期字符串 */
function getTodayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

/** 格式化日期为可读形式 */
function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}

/** 标签显示名称映射 */
const TAG_LABELS = {
  ros2: 'ROS2',
  robot: '机器人',
  lidar: '激光雷达',
  camera: '深度相机',
  ai: 'AI',
  sensor: '传感器',
  release: '发布',
  humanoid: '人形',
  navigation: '导航',
  slam: 'SLAM',
  detection: '检测',
  yolo: 'YOLO',
  'depth-camera': '深度相机',
  'torque-sensor': '力矩',
  'embodied-ai': '具身智能',
  'gaussian-splatting': '3D高斯',
}

function tagLabel(tag) {
  return TAG_LABELS[tag] || tag
}

/** 根据来源名称映射到 AppIcon 图标 */
const SOURCE_ICONS = {
  'ROS Discourse': 'settings',
  'IEEE Spectrum': 'document',
  'IEEE Spectrum Robotics': 'document',
  'The Robot Report': 'bullhorn',
  'arXiv CS.RO': 'paper',
  'GitHub Trending': 'code',
  '机器之心': 'microchip',
  'ScienceDaily Robotics': 'document',
  'Reddit r/robotics': 'message',
  'TechCrunch': 'share',
  'TechCrunch Robotics': 'share',
  'ROS 2 GitHub Discussions': 'code',
  'AWS Robotics Blog': 'cloud-download',
}

function sourceIcon(sourceName) {
  return SOURCE_ICONS[sourceName] || 'earth'
}

/** 切换到前一天 */
function goToPrevDay() {
  if (!targetDate.value || !hasPrevDay.value) return
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  if (idx >= 0 && idx < archiveDates.value.length - 1) {
    const prevDate = archiveDates.value[idx + 1].date
    fetchTopics(prevDate)
  }
}

/** 切换到后一天 */
function goToNextDay() {
  if (!targetDate.value || !hasNextDay.value) return
  const idx = archiveDates.value.findIndex(d => d.date === targetDate.value)
  if (idx > 0) {
    const nextDate = archiveDates.value[idx - 1].date
    fetchTopics(nextDate)
  }
}

/** 回到今天 */
function goToToday() {
  fetchTopics(null)
}

/**
 * 加载数据
 * @param {string|null} date — 日期 YYYY-MM-DD，null 表示今天
 */
async function fetchTopics(date) {
  loading.value = true
  error.value = null
  targetDate.value = date

  try {
    let url
    if (date) {
      url = `/topics-data/archive/${date}.json`
    } else {
      url = '/topics-data/hot-topics.json'
    }

    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }

    // 检测 Cloudflare Pages SPA fallback — 返回 HTML 而非 JSON
    const contentType = resp.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('JSON 被 SPA fallback 拦截，使用内嵌数据')
      if (!date) {
        data.value = FALLBACK_DATA
      } else {
        throw new Error('归档数据暂不可用')
      }
    } else {
      data.value = await resp.json()
    }
  } catch (e) {
    console.error('热点数据加载失败:', e)
    // 今天的数据加载失败时，使用内嵌兜底数据
    if (!date) {
      data.value = FALLBACK_DATA
      error.value = null
    } else {
      error.value = e.message
    }
  } finally {
    loading.value = false
  }

  // 同时加载归档索引（仅首次）
  if (archiveDates.value.length === 0) {
    try {
      const resp = await fetch('/topics-data/archive/index.json')
      if (resp.ok) {
        const ct = resp.headers.get('content-type') || ''
        if (!ct.includes('text/html')) {
          archiveDates.value = await resp.json()
        }
      }
    } catch {
      // 归档索引不存在也 ok
    }
  }
}

// ============================================================
// 生命周期
// ============================================================

onMounted(() => {
  fetchTopics(null)
})

// 切换分类时重置搜索（可选，视用户体验决定）
// watch(activeCategory, () => { searchQuery.value = '' })
</script>

<style scoped>
/* ===== 布局 ===== */
.hot-topics {
  max-width: 860px;
  margin: 0 auto;
}

/* ===== 头部 ===== */
.header {
  text-align: center;
  padding: 28px 0;
  margin-bottom: 20px;
}
.header h1 {
  color: #5a4fcf;
  font-size: 2rem;
  position: relative;
  z-index: 2;
}
.subtitle {
  color: #888;
  font-size: 0.95rem;
  margin-top: 6px;
  position: relative;
  z-index: 2;
}

/* ===== 工具栏 ===== */
.toolbar {
  padding: 16px 20px;
  margin-bottom: 16px;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.tab {
  padding: 6px 16px;
  border: 1px solid rgba(90, 79, 207, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.4);
  color: #666;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.tab .app-icon {
  margin-right: 5px;
  vertical-align: -2px;
}
.tab:hover {
  background: rgba(90, 79, 207, 0.1);
  color: #5a4fcf;
}
.tab.active {
  background: #5a4fcf;
  color: #fff;
  border-color: #5a4fcf;
}

/* 搜索框 */
.search-box {
  position: relative;
  margin-bottom: 14px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.35;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid rgba(90, 79, 207, 0.2);
  border-radius: 24px;
  font-size: 0.92rem;
  background: rgba(255, 255, 255, 0.5);
  color: #333;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  font-family: inherit;
}
.search-input:focus {
  border-color: #5a4fcf;
  box-shadow: 0 0 0 3px rgba(90, 79, 207, 0.1);
}
.search-input::placeholder {
  color: #aaa;
}
.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 6px;
}
.clear-search:hover {
  color: #333;
}

/* 日期选择器 */
.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.date-arrow {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 6px 14px;
  border: 1px solid rgba(90, 79, 207, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
  color: #5a4fcf;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.date-arrow:hover:not(:disabled) {
  background: rgba(90, 79, 207, 0.1);
}
.date-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.current-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.92rem;
  color: #444;
  font-weight: 600;
  min-width: 160px;
  text-align: center;
}
.today-btn {
  padding: 6px 14px;
  border: 1px solid #5a4fcf;
  border-radius: 16px;
  background: #5a4fcf;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.25s;
  font-family: inherit;
}
.today-btn:hover {
  opacity: 0.85;
}

/* ===== 状态栏 ===== */
.stats-bar {
  margin-bottom: 14px;
  padding: 0 4px;
  font-size: 0.85rem;
  color: #888;
}
.stats-source {
  margin-left: 12px;
  opacity: 0.7;
}

/* ===== 热点卡片列表 ===== */
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-card {
  padding: 18px 22px;
}

/* 卡片头部：来源 + 时间 */
.topic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: rgba(90, 79, 207, 0.08);
  color: #5a4fcf;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
}
.topic-date {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.8rem;
  color: #aaa;
}

/* 标题 */
.topic-title {
  margin: 0 0 8px 0;
  font-size: 1.05rem;
  line-height: 1.45;
}
.topic-title a {
  color: #333;
  transition: color 0.2s;
}
.topic-title a:hover {
  color: #5a4fcf;
}
.external-icon {
  opacity: 0.35;
  margin-left: 2px;
  vertical-align: -1px;
}

/* 摘要 */
.topic-summary {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.55;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签 */
.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  background: rgba(90, 79, 207, 0.06);
  color: #5a4fcf;
  cursor: pointer;
  transition: background 0.2s;
}
.tag:hover {
  background: rgba(90, 79, 207, 0.15);
}

/* 标签颜色变体 */
.tag-ros2   { background: rgba(76, 175, 80, 0.12);  color: #388e3c; }
.tag-robot  { background: rgba(33, 150, 243, 0.12);  color: #1976d2; }
.tag-lidar  { background: rgba(255, 152, 0, 0.12);   color: #e65100; }
.tag-camera { background: rgba(156, 39, 176, 0.12);  color: #7b1fa2; }
.tag-ai     { background: rgba(244, 67, 54, 0.12);   color: #c62828; }
.tag-sensor { background: rgba(0, 150, 136, 0.12);   color: #00695c; }

/* ===== 状态页面 ===== */
.loading, .error, .empty {
  text-align: center;
  padding: 60px 40px;
  margin: 0 auto;
  max-width: 500px;
}
.loading .app-icon, .error .app-icon, .empty .app-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}
.loading p, .error p, .empty p {
  color: #888;
  font-size: 1rem;
}
.retry-btn {
  margin-top: 14px;
  padding: 8px 24px;
  border: 1px solid #5a4fcf;
  border-radius: 20px;
  background: #fff;
  color: #5a4fcf;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.retry-btn:hover {
  background: #5a4fcf;
  color: #fff;
}

/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  .header h1 { font-size: 1.5rem; }
  .toolbar { padding: 14px; }
  .topic-card { padding: 14px 16px; }
  .topic-title { font-size: 0.95rem; }
  .category-tabs { gap: 6px; }
  .tab { padding: 5px 12px; font-size: 0.82rem; }
}

@media (max-width: 480px) {
  .header h1 { font-size: 1.3rem; }
  .topic-card { padding: 12px; }
  .date-picker { gap: 6px; }
  .date-arrow { padding: 5px 10px; font-size: 0.8rem; }
}
</style>
