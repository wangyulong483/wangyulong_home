<!--
  鸣神纪年 — 横向滚动时间轴

  机制对齐 nanfu.global（据 docs/research/nanfu-interaction.md 的线上源码直读结论）：
  1. 外层高度由 JS 按「板块数」撑开（vh × (parts + 0.5)，线上为 950vh），CSS 里留 600vh 兜底；
     真正钉住视口的是原生 `position: sticky`，不是 GSAP 的 pin。
  2. 横向位移由 ScrollTrigger 的 scrub 驱动 `x`，缓动一律 `ease: 'none'`，手感全部交给 `scrub: 0.8`。
  3. 大字揭开不用 JS 改 clip-path，而是 GSAP 只写一个 CSS 变量 `--go`（0→1，linear），
     去 scrub 一段 `animation-play-state: paused` 的关键帧 —— 滚动进度即动画进度。
     注意：nanfu 从未声明 `--go` 初值，这里按调研建议显式写成 0，避免首帧闪烁。
  4. 移动端与 prefers-reduced-motion 下完全退化为竖向静态列表，不做横向位移。

  与 nanfu 的差异（有意为之）：
  - 这里没有帧序列画布（本站没有预渲染素材），脊线只用 1px 发丝线 + 节点刻度。
  - 顶部提供「跳至对谈」，避免用户被迫滚完 950vh 才能聊天。
-->
<template>
  <section ref="rootRef" class="tl-root" :style="rootStyle">
    <div class="tl-sticky">
      <header class="tl-head">
        <div class="tl-head-copy">
          <p class="tl-kicker">CHRONICLE / 鸣神纪年</p>
          <p class="tl-lede">{{ source.detail }}</p>
        </div>
        <div class="tl-head-meta">
          <p class="tl-counter">
            <span>{{ String(activeIndex + 1).padStart(2, '0') }}</span>
            <i>/</i>
            <span>{{ String(nodes.length).padStart(2, '0') }}</span>
          </p>
          <a class="tl-skip" href="#dialogue-talk" @click.prevent="emit('skip')">跳至对谈 ↓</a>
        </div>
      </header>

      <div class="tl-progress" aria-hidden="true"><span ref="progressRef"></span></div>

      <div ref="trackRef" class="tl-track">
        <!-- 引子板块 -->
        <div class="tl-part is-intro">
          <h2 class="intro-title">
            <span
              v-for="(line, index) in introLines"
              :key="line"
              class="letter"
              :data-go="index"
              :data-note="line"
            >{{ line }}</span>
          </h2>
          <p class="intro-note">站在此刻回望，她走过的每一段都指向同一个问题：什么才值得被留住。</p>
        </div>

        <!-- 时间轴节点 -->
        <article
          v-for="(node, index) in nodes"
          :key="node.id"
          class="tl-part is-node"
          :class="{ 'is-odd': index % 2 === 1, 'is-active': index === activeIndex }"
          :data-index="index"
        >
          <span class="node-dot" aria-hidden="true"></span>
          <span class="node-connector" aria-hidden="true"></span>
          <div class="node-body">
            <p class="node-era letter" :data-go="introLines.length + index" :data-note="node.era">{{ node.era }}</p>
            <p class="node-era-note"><span class="node-mark">{{ node.mark }}</span>{{ node.eraNote }}</p>
            <h3 class="node-title">{{ node.title }}</h3>
            <p class="node-summary">{{ node.summary }}</p>
            <p class="node-them">{{ node.them }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  nodes: { type: Array, required: true },
  source: { type: Object, required: true },
})

const emit = defineEmits(['active', 'skip'])

const INTRO_LINES = ['鸣神纪年', '她走过的时间']

const rootRef = ref(null)
const trackRef = ref(null)
const progressRef = ref(null)
const activeIndex = ref(0)
const rootStyle = ref({})

const introLines = INTRO_LINES
const partCount = computed(() => props.nodes.length + 1)

let ctx
let travelTween
let resizeTimer
let desktop = false
let disposed = false

/** 时间轴实际可见宽度：主内容区扣掉右侧栏，不能用 window.innerWidth */
function viewportWidth() {
  const sticky = rootRef.value?.querySelector('.tl-sticky')
  return sticky?.clientWidth || window.innerWidth
}

/** 横向需要的总位移：让最后一个节点也完整落在视口内，并留一点尾部余量 */
function travelDistance() {
  const track = trackRef.value
  if (!track) return 0
  const width = viewportWidth()
  return Math.max(0, track.scrollWidth - width + width * 0.1)
}

/** 视口中心落在哪个节点上：按板块的实际位置换算，而不是按进度均分 */
function resolveActiveIndex(progress) {
  const track = trackRef.value
  if (!track) return
  const width = viewportWidth()
  const viewportCenter = progress * travelDistance() + width / 2
  const parts = track.querySelectorAll('.is-node')
  let nearest = 0
  let distance = Infinity
  parts.forEach((part, index) => {
    const center = part.offsetLeft + part.offsetWidth / 2
    const current = Math.abs(center - viewportCenter)
    if (current < distance) {
      distance = current
      nearest = index
    }
  })
  if (nearest !== activeIndex.value) {
    activeIndex.value = nearest
    emit('active', props.nodes[nearest])
  }
}

function setRootHeight() {
  const height = Math.round(window.innerHeight * (partCount.value + 0.5))
  rootStyle.value = { height: `${height}px` }
}

async function setupTimeline() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  // 动态 import 期间组件可能已卸载，这里必须重新确认
  if (disposed || !rootRef.value || !trackRef.value) return
  gsap.registerPlugin(ScrollTrigger)

  // 对齐 nanfu：滚动补间线性，手感交给 scrub
  gsap.defaults({ duration: 1, ease: 'none' })

  const root = rootRef.value
  const track = trackRef.value
  const nodeParts = track.querySelectorAll('.is-node')

  ctx = gsap.context(() => {
    // 横向位移：start 顶到视口，end 走完 (parts - 1) 屏的滚动距离
    travelTween = gsap.to(track, {
      x: () => -travelDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${window.innerHeight * (partCount.value + 0.5 - 1)}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressRef.value) progressRef.value.style.transform = `scaleX(${self.progress})`
          resolveActiveIndex(self.progress)
        },
      },
    })

    // 大字揭开：GSAP 只写 --go，动画本体交给 paused 关键帧
    // 引子标题行沿用 nanfu 的错峰节奏（start 递增 0.1vh × i、区间 0.8vh、scrub 0.9），
    // 但触发锚点放在视口偏下处，让标题在板块「进入视口时」就被刷出来，而不是等吸顶之后。
    const vh = window.innerHeight
    INTRO_LINES.forEach((_, index) => {
      const target = root.querySelector(`.letter[data-go="${index}"]`)
      if (!target) return
      gsap.to(target, {
        '--go': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: () => `top+=${vh * 0.1 * index} 72%`,
          end: () => `top+=${vh * 0.7} 14%`,
          scrub: 0.9,
        },
      })
    })

    // 节点时期大字：随节点自身进入视口揭开（横向容器内需 containerAnimation）
    nodeParts.forEach((part, index) => {
      const target = part.querySelector('.letter')
      if (!target) return
      gsap.to(target, {
        '--go': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: part,
          containerAnimation: travelTween,
          start: 'left 88%',
          end: 'left 52%',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      })
      part.dataset.order = String(index)
    })
  }, root)
}

function teardown() {
  ctx?.revert()
  ctx = null
  travelTween = null
}

function handleResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setRootHeight()
    const shouldBeDesktop = window.innerWidth > 860
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (shouldBeDesktop !== desktop) {
      teardown()
      desktop = shouldBeDesktop
      if (desktop) setupTimeline()
    }
  }, 180)
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  desktop = window.innerWidth > 860 && !reduceMotion
  setRootHeight()
  if (desktop) setupTimeline()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  disposed = true
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', handleResize)
  teardown()
})
</script>

<style scoped>
/* 统一签名曲线：nanfu 全站只用这一条（≈ GSAP power4.out），这是「朴素无回弹」的根因 */
.tl-root {
  --ease-signature: cubic-bezier(0.38, 0, 0, 1);
  --gold: #c9a96e;

  position: relative;
  /* CSS 兜底高度；JS 会按板块数覆写为 vh × (parts + 0.5) */
  height: 600vh;
  border-top: 1px solid var(--border);
}

.tl-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* ===== 顶部信息条 ===== */
.tl-head {
  position: absolute;
  z-index: 8;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
  padding: clamp(22px, 4vh, 40px) clamp(20px, 5vw, 64px) 0;
}

.tl-kicker {
  margin: 0 0 8px;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.2em;
}

.tl-lede {
  max-width: 46ch;
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.68rem;
  line-height: 1.8;
}

.tl-head-meta {
  display: flex;
  align-items: center;
  gap: clamp(14px, 2.4vw, 30px);
  flex: 0 0 auto;
}

.tl-counter {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
}

.tl-counter i { color: rgba(246, 243, 233, 0.24); font-style: normal; }
.tl-counter span:last-child { color: var(--text-tertiary); }

.tl-skip {
  padding: 6px 10px;
  border: 1px solid var(--border);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  text-decoration: none;
  transition: border-color 0.3s var(--ease-signature), color 0.3s var(--ease-signature);
}

.tl-skip:hover { border-color: rgba(201, 169, 110, 0.6); color: var(--gold); }

.tl-progress {
  position: absolute;
  z-index: 8;
  right: clamp(20px, 5vw, 64px);
  bottom: clamp(22px, 4vh, 40px);
  left: clamp(20px, 5vw, 64px);
  height: 1px;
  background: rgba(246, 243, 233, 0.1);
}

.tl-progress span {
  display: block;
  height: 100%;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left center;
}

/* ===== 横向轨道 ===== */
.tl-track {
  position: relative;
  display: grid;
  height: 100%;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  align-items: stretch;
  will-change: transform;
}

/* 中央脊线 */
.tl-track::before {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  content: '';
  background: linear-gradient(
    90deg,
    rgba(201, 169, 110, 0.22),
    rgba(246, 243, 233, 0.16) 30%,
    rgba(246, 243, 233, 0.16) 70%,
    rgba(201, 169, 110, 0.22)
  );
}

.tl-part { position: relative; height: 100%; }

/* ===== 引子板块 ===== */
.tl-part.is-intro {
  display: flex;
  width: 62vw;
  padding: 0 clamp(20px, 5vw, 64px);
  flex-direction: column;
  justify-content: center;
}

.intro-title {
  display: grid;
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 6.4vw, 4.4rem);
  font-weight: 400;
  letter-spacing: 0.1em;
  line-height: 1.28;
}

.intro-note {
  max-width: 34ch;
  margin: clamp(22px, 4vh, 40px) 0 0;
  padding-left: 15px;
  border-left: 1px solid rgba(201, 169, 110, 0.4);
  color: var(--text-tertiary);
  font-size: 0.76rem;
  line-height: 1.95;
}

/* ===== 大字揭开：--go + paused 关键帧 ===== */
.letter {
  position: relative;
  display: block;
  --go: 0; /* ★ nanfu 未声明此初值，这里显式声明以避免首帧闪烁 */
  color: rgba(246, 243, 233, 0.18);
}

.letter::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  content: attr(data-note);
  color: var(--text-primary);
  line-height: inherit;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  will-change: clip-path;
  animation-name: clip-reveal;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-play-state: paused;
  animation-delay: calc(var(--go) * -1s);
}

@keyframes clip-reveal {
  0% { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }
  5% { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }
  30% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
  100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
}

/* ===== 节点板块（交替上下） ===== */
.tl-part.is-node {
  display: flex;
  width: 38vw;
  /* 右侧留出比左侧更大的间距：节点半入视口时，文字不会被内容区边界硬切 */
  padding: 0 clamp(56px, 8vw, 132px) 0 clamp(18px, 3vw, 42px);
  flex-direction: column;
  justify-content: flex-end;
}

.tl-part.is-node.is-odd { justify-content: flex-start; }

.node-dot {
  position: absolute;
  top: calc(50% - 2px);
  left: clamp(18px, 3vw, 42px);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--bg-primary);
  box-shadow: inset 0 0 0 1px rgba(246, 243, 233, 0.34);
  transition: background 0.5s var(--ease-signature), box-shadow 0.5s var(--ease-signature);
}

.tl-part.is-node.is-active .node-dot {
  background: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.16);
}

.node-connector {
  position: absolute;
  left: calc(clamp(18px, 3vw, 42px) + 2px);
  width: 1px;
  height: 5vh;
  background: linear-gradient(180deg, rgba(201, 169, 110, 0.44), rgba(201, 169, 110, 0.08));
}

.tl-part.is-node .node-connector { top: 50%; }
.tl-part.is-node.is-odd .node-connector {
  top: auto;
  bottom: 50%;
  background: linear-gradient(0deg, rgba(201, 169, 110, 0.44), rgba(201, 169, 110, 0.08));
}

.node-body {
  padding: 0 0 clamp(66px, 9vh, 118px) clamp(20px, 2.4vw, 32px);
  opacity: 0.46;
  transition: opacity 0.6s var(--ease-signature);
}

/* 上半屏节点要避开吸顶信息条，下半屏节点要避开底部进度线 */
.tl-part.is-node.is-odd .node-body {
  padding: clamp(126px, 18vh, 186px) 0 0 clamp(20px, 2.4vw, 32px);
}

.tl-part.is-node.is-active .node-body { opacity: 1; }

.node-era {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 2.6vw, 2.1rem);
  letter-spacing: 0.1em;
}

.node-era-note {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 9px 0 0;
  color: var(--text-tertiary);
  font-size: 0.64rem;
  letter-spacing: 0.08em;
}

.node-mark {
  color: rgba(201, 169, 110, 0.6);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.2em;
}

.node-title {
  margin: 14px 0 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.node-summary {
  max-width: 36ch;
  margin: 11px 0 0;
  color: var(--text-secondary);
  font-size: 0.76rem;
  line-height: 1.9;
}

.node-them {
  max-width: 36ch;
  margin: 10px 0 0;
  padding-left: 12px;
  border-left: 1px solid rgba(201, 169, 110, 0.3);
  color: var(--text-tertiary);
  font-size: 0.7rem;
  line-height: 1.78;
}

/* ===== 移动端 / 窄屏：退化为竖向静态列表 ===== */
@media (max-width: 860px) {
  .tl-root { height: auto !important; }

  .tl-sticky {
    position: static;
    height: auto;
    overflow: visible;
  }

  .tl-head {
    position: static;
    padding: 28px 16px 0;
    flex-direction: column;
    gap: 12px;
  }

  .tl-head-meta { width: 100%; justify-content: space-between; }
  .tl-progress { display: none; }

  .tl-track {
    display: block;
    padding: 26px 16px 48px;
    transform: none !important;
  }

  .tl-track::before { display: none; }

  .tl-part { width: auto !important; height: auto; padding: 0; }

  .tl-part.is-intro { margin-bottom: 34px; }
  .intro-title { font-size: 2rem; }

  .tl-part.is-node {
    display: block;
    padding: 0 0 30px 22px;
    border-left: 1px solid rgba(246, 243, 233, 0.12);
  }

  .tl-part.is-node .node-dot { top: 9px; left: -3px; }
  .node-connector { display: none; }

  /* 窄屏不跑 ScrollTrigger，--go 永远停在 0；这里直接让大字显示实色，不留下暗底字 */
  .letter { color: var(--text-primary); }
  .letter::after { display: none; }

  .node-body,
  .tl-part.is-node.is-odd .node-body { padding: 0; opacity: 1; }

  .node-summary, .node-them { max-width: none; }
}

/* 关闭动画偏好：所有大字直接显示实色 */
@media (prefers-reduced-motion: reduce) {
  .tl-root { height: auto !important; }
  .tl-sticky { position: static; height: auto; overflow: visible; }
  .tl-head { position: static; }
  .tl-track { display: block; transform: none !important; }
  .tl-track::before { display: none; }
  .tl-part, .tl-part.is-intro, .tl-part.is-node { width: auto !important; height: auto; padding-inline: 16px; }
  .tl-part.is-node { padding-bottom: 30px; }
  .tl-part.is-node .node-dot { top: 9px; }
  .node-body, .tl-part.is-node.is-odd .node-body { padding: 0; opacity: 1; }
  .letter::after { animation: none; clip-path: none; display: none; }
  .letter { color: var(--text-primary); }
  .node-summary, .node-them { max-width: none; }
}
</style>
