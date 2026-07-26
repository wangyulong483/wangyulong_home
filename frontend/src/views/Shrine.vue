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
      <p>数据加载失败：{{ loadError }}</p>
      <button class="retry-btn" @click="loadData">重新踏入</button>
    </div>

    <!-- ===== 正常内容 ===== -->
    <template v-else-if="data">
      <!-- 顶部名片横幅 -->
      <div class="top-banner" v-if="data.character.banner">
        <img
          :src="data.character.banner"
          :alt="data.character.name"
          class="banner-img"
        />
        <div class="banner-overlay">
          <h1 class="banner-title">{{ data.character.name }}</h1>
          <p class="banner-subtitle">{{ data.character.title }}</p>
        </div>
      </div>

      <!-- Hero 区 -->
      <div class="shrine-content">
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
          <GalleryTab v-if="activeTab === 'gallery'" :items="data.gallery" :related="data.related || []" />
          <WikiTab    v-if="activeTab === 'wiki'"    :items="data.guides" />
          <NewsTab    v-if="activeTab === 'news'"    :items="data.news" />
          <ChatTab    v-if="activeTab === 'chat'" />
        </div>
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
import ChatTab from '@/components/shrine/ChatTab.vue'

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
    birthday: "6月26日",
    constellation: "天下人座",
    quote: "常道恢弘，鸣神永恒",
    banner: "/shrine-data/images/image (2).png",
    cutout: "/shrine-data/images/image (1).png",
    bio: "雷电将军，真名「雷电影」，魔神名「巴尔泽布」，稻妻的现任雷神。她是极致的武人，稻妻的薙刀术、剑术和各门派的锻刀技术皆出自她手。外表威严冷峻，以「永恒」为信念统治稻妻。",
    whyLove: "第一眼就被她的外形击中——紫色长发、和服铠甲的华丽设计，胸口拔刀的视觉冲击力无与伦比。深入了解后更着迷于她的反差：对外是威严冷峻的雷神，私底下却是个不会做饭、宅在一心净土里的天然呆。这种神性与可爱的巨大反差，让她不止是一尊神明，更是一个鲜活的人。",
    colors: { primary: "#6B4C9A", accent: "#B088F9", gold: "#C9A96E" },
    birthdayIllustrations: [
      { year: 2022, image: "/shrine-data/images/image (3).png" },
      { year: 2023, image: "/shrine-data/images/image (4).png" },
      { year: 2024, image: "/shrine-data/images/image (5).png" },
      { year: 2025, image: "/shrine-data/images/image (6).png" },
      { year: 2026, image: "/shrine-data/images/image (7).png" }
    ]
  },
  gallery: [
    { id: 0, title: "雷电将军角色PV——「噩梦」", platform: "bilibili", platformLabel: "B站", url: "BV1Y3411B7SX", author: "原神", authorUrl: "https://space.bilibili.com/401742377", thumbnail: "", date: "2021-08-23", tags: ["官方", "PV"] },
    { id: 1, title: "雷电将军角色演示——「净土裁断」", platform: "bilibili", platformLabel: "B站", url: "BV1kb4y1m7e7", author: "原神", authorUrl: "https://space.bilibili.com/401742377", thumbnail: "", date: "2021-09-01", tags: ["官方", "角色演示"] },
    { id: 2, title: "拾枝杂谈——「雷电将军：鸣雷寂灭」", platform: "bilibili", platformLabel: "B站", url: "BV1rb4y1m7My", author: "原神", authorUrl: "https://space.bilibili.com/401742377", thumbnail: "", date: "2021-09-01", tags: ["官方", "拾枝杂谈"] }
  ],
  related: [
    { id: 100, title: "雷电将军什么的不干了啦！", platform: "bilibili", platformLabel: "B站", url: "BV1GY411371y", author: "巫兔菌", thumbnail: "", date: "2022-03-12", tags: ["MAD", "翻调"] },
    { id: 101, title: "雷神生贺曲「稻光予梦」/ 原神cv原创曲", platform: "bilibili", platformLabel: "B站", url: "BV1K3411w7uM", author: "超想吃番茄", thumbnail: "", date: "2022-06-26", tags: ["原创曲", "生贺"] },
    { id: 102, title: "你是怎么说服雷电将军陪你拍这个视频的？", platform: "bilibili", platformLabel: "B站", url: "BV1Ad4y1y7sF", author: "莫娜摸鱼专用", thumbnail: "", date: "2022-10-23", tags: ["混剪", "趣味"] },
    { id: 103, title: "【原神MMD】雷神忍不了了", platform: "bilibili", platformLabel: "B站", url: "BV1BC9qY2EXF", author: "sujikan", thumbnail: "", date: "2025-03-03", tags: ["MMD", "Blender"] },
    { id: 104, title: "太上头啦！雷电将军来给你洗脑啦！", platform: "bilibili", platformLabel: "B站", url: "BV1mk4y1Q7WD", author: "柚卡yk", thumbnail: "", date: "2024-01-12", tags: ["MAD", "洗脑"] },
    { id: 105, title: "一心净土【原神/雷电将军原创曲】", platform: "bilibili", platformLabel: "B站", url: "BV19j411E79f", author: "菊花花", thumbnail: "", date: "2023-09-10", tags: ["原创曲", "CV"] },
    { id: 106, title: "不动鸣神，泡影断灭—雷电将军PV演示COS向", platform: "bilibili", platformLabel: "B站", url: "BV1uf4y1T7fh", author: "紫氯氯", thumbnail: "", date: "2021-11-30", tags: ["COS", "PV"] },
    { id: 107, title: "MMD Bon Bon Chocolat - Raiden Ei", platform: "bilibili", platformLabel: "B站", url: "BV1rPW5zJE8K", author: "杯子君721", thumbnail: "", date: "2025-09-19", tags: ["MMD", "舞蹈"] },
    { id: 108, title: "雷电将军：这也是必要的课程吗", platform: "bilibili", platformLabel: "B站", url: "BV1d9Mi6HE5b", author: "烤堇瓜壁纸", thumbnail: "", date: "2026-07-08", tags: ["壁纸", "展示"] }
  ],
  guides: [
    { id: 1, title: "雷电将军配队全面指南", summary: "从雷电国家队到雷九万班，当前版本主流配队推荐与输出手法详解", content: "## 雷电国家队\n\n阵容：雷电将军 + 行秋 + 香菱 + 班尼特\n\n输出手法：雷神E → 班尼特QE → 行秋QE → 香菱QE → 雷神Q站场7秒", source: "NGA", sourceUrl: "https://bbs.nga.cn/", category: "战斗攻略", date: "2026-07-01" },
    { id: 2, title: "雷电将军角色设计考据", summary: "从日本神话、佛教文化与江户历史解读雷电将军的设计原型", content: "## 原型考据\n\n雷电将军的设计原型之一是天之御中主神——日本神话里别天神之首。其手持长矛的形象与雷电将军的薙刀相呼应。\n\n雷电将军使用薙刀与江户时代武家妇女必须学习薙刀术的传统有关。", source: "米游社", sourceUrl: "https://www.miyoushe.com/", category: "角色考据", date: "2026-06-15" }
  ],
  news: [
    { id: 1, title: "雷电将军 6.7版本复刻 — 「一心净土」祈愿开启", summary: "雷电将军于6.7版本下半期（7月21日18:00至8月11日）迎来复刻，同期UP专武「薙草之稻光」。", date: "2026-07-21", tag: "游戏", url: "" },
    { id: 2, title: "雷电将军「一心净土Ver.」1/7手办预售中", summary: "APEX-TOYS × miHoYo 联合出品，高35.7cm，售价1499元，预售至8月27日。初回特典含「梦想一心」武器摆件。", date: "2026-05-27", tag: "周边", url: "https://www.miyoushe.com/ys/article/75539985" },
    { id: 3, title: "Nendoroid 雷电将军 黏土人 出货", summary: "Good Smile Company 出品，含三种表情及配件「梦想一心」「薙草之稻光」「团子牛奶」，2025年6月出货。", date: "2025-06-01", tag: "周边", url: "https://www.goodsmile.com/en/product/21681/Nendoroid+Raiden+Shogun" }
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
  { key: 'gallery', label: '画廊', icon: '' },
  { key: 'wiki',    label: '攻略/Wiki', icon: '' },
  { key: 'news',    label: '资讯动态', icon: '' },
  { key: 'chat',    label: '与影对话', icon: '' },
]

function tabCount(key) {
  if (!data.value) return 0
  const map = { gallery: 'gallery', wiki: 'guides', news: 'news', chat: null }
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
  overflow: hidden;
}

.shrine-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 36px 40px;
}

/* ====== 顶部名片横幅 ====== */
.top-banner {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 0;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
}

.banner-img {
  width: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 4 / 1;
  min-height: 180px;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg,
    rgba(13, 13, 26, 0.3) 0%,
    rgba(13, 13, 26, 0.6) 60%,
    rgba(13, 13, 26, 0.9) 100%
  );
  text-align: center;
}

.banner-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #C9A96E;
  letter-spacing: 0.1em;
  margin: 0;
  text-shadow: 0 0 32px rgba(201, 169, 110, 0.5), 0 2px 8px rgba(0, 0, 0, 0.6);
  animation: banner-glow 3s ease-in-out infinite;
}

@keyframes banner-glow {
  0%, 100% { text-shadow: 0 0 16px rgba(201, 169, 110, 0.3), 0 2px 8px rgba(0, 0, 0, 0.6); }
  50%      { text-shadow: 0 0 40px rgba(201, 169, 110, 0.7), 0 0 64px rgba(176, 136, 249, 0.3), 0 2px 8px rgba(0, 0, 0, 0.6); }
}

.banner-subtitle {
  font-size: 0.85rem;
  color: rgba(200, 190, 230, 0.7);
  margin: 8px 0 0;
  letter-spacing: 0.06em;
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
  .shrine-content {
    padding: 0 16px 24px;
  }

  .top-banner {
    border-radius: 0 0 12px 12px;
  }

  .banner-img {
    min-height: 120px;
  }

  .banner-title {
    font-size: 1.5rem;
  }

  .banner-subtitle {
    font-size: 0.7rem;
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
