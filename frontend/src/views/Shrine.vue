<!--
  厨厨板块 — 雷电将军角色应援页
  设计主题：「一心净土」暗色雷电风格
  三大模块：二创画廊 / 攻略Wiki / 资讯动态
-->
<template>
  <div class="shrine-page">
    <!-- 雷晶粒子浮动背景 -->
    <ElectroParticles />

    <!-- 三巴纹水印 -->
    <div class="mitsudomoe-watermark" aria-hidden="true">
      <svg viewBox="0 0 200 200" class="watermark-svg">
        <circle cx="100" cy="40" r="30" fill="currentColor" opacity="0.4"/>
        <circle cx="48" cy="140" r="30" fill="currentColor" opacity="0.4"/>
        <circle cx="152" cy="140" r="30" fill="currentColor" opacity="0.4"/>
      </svg>
    </div>

    <!-- ===== 加载状态 ===== -->
    <div v-if="loading" class="loading-state">
      <div class="loading-ring"></div>
      <p>踏入一心净土...</p>
    </div>

    <!-- ===== 错误状态 ===== -->
    <div v-else-if="loadError" class="error-state">
      <p>⚡ 数据加载失败：{{ loadError }}</p>
      <button class="retry-btn" @click="loadData">重新踏入</button>
    </div>

    <!-- ===== 正常内容 ===== -->
    <template v-else-if="data">
      <!-- Hero 区 -->
      <RaidenHero :character="data.character" />

      <!-- Tab 导航 -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count" v-if="tabCount(tab.key)">({{ tabCount(tab.key) }})</span>
          <!-- 雷光下划线 -->
          <span class="tab-underline"></span>
        </button>
      </div>

      <!-- Tab 内容区 -->
      <div class="tab-content">
        <GalleryTab v-if="activeTab === 'gallery'" :items="data.gallery" />
        <WikiTab    v-if="activeTab === 'wiki'"    :items="data.guides" />
        <NewsTab    v-if="activeTab === 'news'"    :items="data.news" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ElectroParticles from '@/components/shrine/ElectroParticles.vue'
import RaidenHero from '@/components/shrine/RaidenHero.vue'
import GalleryTab from '@/components/shrine/GalleryTab.vue'
import WikiTab from '@/components/shrine/WikiTab.vue'
import NewsTab from '@/components/shrine/NewsTab.vue'

// ============================================================
// 兜底数据 — Cloudflare Pages SPA fallback 拦截 JSON 时使用
// ============================================================

const FALLBACK_DATA = {
  character: {
    name: "雷电将军",
    title: "一心净土 · 御建鸣神主尊大御所大人",
    realName: "雷电影",
    element: "雷",
    weapon: "长柄武器",
    affiliation: "稻妻",
    quote: "常道恢弘，鸣神永恒",
    avatar: "/shrine-data/images/avatar.png",
    bio: "雷电将军，真名「雷电影」，魔神名「巴尔泽布」，稻妻的现任雷神。她是极致的武人，稻妻的薙刀术、剑术和各门派的锻刀技术皆出自她手。外表威严冷峻，以「永恒」为信念统治稻妻。",
    whyLove: "初次被她胸口拔刀的名场面震撼，后来了解她的故事——失去至亲、友人的孤独，追求永恒的执念，以及最终与自我和解的成长——彻底沦陷。她是神明，却也是最真实的人。",
    colors: { primary: "#6B4C9A", accent: "#B088F9", gold: "#C9A96E" }
  },
  gallery: [
    { id: 1, title: "【原神】雷电将军角色演示——「净土裁断」", platform: "bilibili", platformLabel: "B站", url: "BV1Yq4y1U7nB", author: "原神", authorUrl: "https://space.bilibili.com/401742377", thumbnail: "", date: "2021-08-31", tags: ["官方", "角色演示"] },
    { id: 2, title: "雷电将军 · 恶曜卜词", platform: "pixiv", platformLabel: "Pixiv", url: "https://www.pixiv.net/artworks/92847219", author: "米游社画师", authorUrl: "", thumbnail: "", date: "2023-09-10", tags: ["插画", "壁纸"] },
    { id: 3, title: "【手书】雷电将军的一心净土", platform: "bilibili", platformLabel: "B站", url: "BV1Fb4y1n7sQ", author: "手书UP主", authorUrl: "", thumbnail: "", date: "2025-01-20", tags: ["手书", "同人动画"] },
    { id: 4, title: "雷电将军cosplay——梦想一心出鞘", platform: "other", platformLabel: "Twitter", url: "https://x.com/search?q=RaidenShogun", author: "海外coser", authorUrl: "", thumbnail: "", date: "2025-06-18", tags: ["cosplay"] },
    { id: 5, title: "【雷电将军】此身即为永恒——雷神传说任务催泪混剪", platform: "bilibili", platformLabel: "B站", url: "BV1jL4y1h7jR", author: "旅行者剪辑", authorUrl: "", thumbnail: "", date: "2024-03-15", tags: ["混剪", "剧情"] }
  ],
  guides: [
    { id: 1, title: "雷电将军配队全面指南", summary: "从雷电国家队到雷九万班，当前版本主流配队推荐与输出手法详解", content: "## 雷电国家队\n\n阵容：雷电将军 + 行秋 + 香菱 + 班尼特\n\n输出手法：雷神E → 班尼特QE → 行秋QE → 香菱QE → 雷神Q站场7秒", source: "NGA", sourceUrl: "https://bbs.nga.cn/", category: "战斗攻略", date: "2026-07-01" },
    { id: 2, title: "雷电将军角色设计考据", summary: "从日本神话、佛教文化与江户历史解读雷电将军的设计原型", content: "## 原型考据\n\n雷电将军的设计原型之一是天之御中主神——日本神话里别天神之首。其手持长矛的形象与雷电将军的薙刀相呼应。\n\n雷电将军使用薙刀与江户时代武家妇女必须学习薙刀术的传统有关。", source: "米游社", sourceUrl: "https://www.miyoushe.com/", category: "角色考据", date: "2026-06-15" }
  ],
  news: [
    { id: 1, title: "雷电将军「影寂天下人」皮肤上线", summary: "雷电将军全新衣装已在商城上架，粉紫色雷电特效+樱花主题", date: "2026-07-15", tag: "皮肤", url: "" },
    { id: 2, title: "雷电将军新手办「一心净土ver.」开启预售", summary: "Good Smile Company 推出雷电将军 1/7 比例手办，售价 32800 日元", date: "2026-07-01", tag: "周边", url: "" },
    { id: 3, title: "雷电将军角色祈愿「华紫樱绯」复刻预告", summary: "据可靠消息，雷电将军将在下个版本迎来复刻，同期 UP 武器「薙草之稻光」", date: "2026-06-20", tag: "游戏", url: "" }
  ]
}

// ============================================================
// 状态
// ============================================================

const data = ref(null)
const loading = ref(true)
const loadError = ref(null)
const activeTab = ref('gallery')

// Tab 定义
const tabs = [
  { key: 'gallery', label: '二创画廊', icon: '⚡' },
  { key: 'wiki',    label: '攻略/Wiki', icon: '📜' },
  { key: 'news',    label: '资讯动态', icon: '📡' },
]

function tabCount(key) {
  if (!data.value) return 0
  const map = { gallery: 'gallery', wiki: 'guides', news: 'news' }
  const arr = data.value[map[key]]
  return arr ? arr.length : 0
}

// ============================================================
// 数据加载（含 SPA fallback 兜底）
// ============================================================

async function loadData() {
  loading.value = true
  loadError.value = null

  try {
    const resp = await fetch('/shrine-data/index.json')

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }

    // 检测 Cloudflare Pages SPA fallback — 返回 HTML 而非 JSON
    const contentType = resp.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('[SHRINE] JSON 被 SPA fallback 拦截，使用内嵌兜底数据')
      data.value = FALLBACK_DATA
    } else {
      data.value = await resp.json()
    }
  } catch (e) {
    console.error('[SHRINE] 数据加载失败:', e)
    // 使用内嵌兜底数据
    data.value = FALLBACK_DATA
    loadError.value = null // 兜底数据即可，不显示错误
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ============================================================ */
/* 页面容器 — 暗色「一心净土」主题 */
/* ============================================================ */

.shrine-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(160deg, #0D0D1A 0%, #141428 40%, #1A1A2E 70%, #0F0F23 100%);
  color: rgba(220, 210, 240, 0.85);
  padding: 40px 36px;
  max-width: 1100px;
  margin: 0 auto;
  overflow: hidden;
}

/* ====== 三巴纹水印 ====== */
.mitsudomoe-watermark {
  position: fixed;
  bottom: -60px;
  right: -40px;
  width: 280px;
  height: 280px;
  pointer-events: none;
  z-index: 0;
  color: #B088F9;
  opacity: 0.025;
}

.watermark-svg {
  width: 100%;
  height: 100%;
  animation: watermark-rotate 60s linear infinite;
}

@keyframes watermark-rotate {
  to { transform: rotate(360deg); }
}

/* ====== 加载状态 ====== */
.loading-state {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  color: rgba(176, 136, 249, 0.6);
}

.loading-ring {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(176, 136, 249, 0.15);
  border-top-color: #B088F9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ====== 错误状态 ====== */
.error-state {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 20px;
  color: rgba(176, 136, 249, 0.5);
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 24px;
  border-radius: 16px;
  border: 1px solid rgba(176, 136, 249, 0.3);
  background: rgba(176, 136, 249, 0.1);
  color: #B088F9;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: rgba(176, 136, 249, 0.2);
  border-color: rgba(176, 136, 249, 0.5);
}

/* ====== Tab 导航 ====== */
.tab-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 4px;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(176, 136, 249, 0.1);
  padding-bottom: 0;
}

.tab-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 22px;
  border: none;
  background: transparent;
  color: rgba(180, 170, 210, 0.5);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 10px 10px 0 0;
}

.tab-btn:hover {
  color: rgba(200, 190, 230, 0.8);
  background: rgba(176, 136, 249, 0.04);
}

.tab-btn.active {
  color: #B088F9;
  font-weight: 600;
  background: rgba(176, 136, 249, 0.06);
}

/* 雷光下划线 */
.tab-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2.5px;
  background: linear-gradient(90deg, transparent, #B088F9, transparent);
  border-radius: 2px;
  transition: width 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.tab-btn.active .tab-underline {
  width: 60%;
}

.tab-icon { font-size: 1rem; }
.tab-count { font-size: 0.72rem; opacity: 0.5; }

/* ====== Tab 内容区 ====== */
.tab-content {
  position: relative;
  z-index: 1;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .shrine-page {
    padding: 20px 16px;
  }

  .tab-bar {
    gap: 0;
  }

  .tab-btn {
    padding: 10px 14px;
    font-size: 0.82rem;
  }

  .tab-label {
    display: none;
  }

  .tab-icon {
    font-size: 1.2rem;
  }
}
</style>
