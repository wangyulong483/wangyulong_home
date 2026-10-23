<template>
  <section
    ref="rootRef"
    class="tl-root"
    :style="rootStyle"
    aria-label="你与影的对话纪年"
  >
    <div class="tl-sticky">
      <div class="tl-grain" aria-hidden="true"></div>
      <div class="deco-wedge" aria-hidden="true"></div>
      <div class="deco-square" aria-hidden="true"></div>
      <div class="deco-circle" aria-hidden="true"></div>

      <header class="tl-head">
        <div class="tl-head-main">
          <p class="tl-kicker">CHRONICLE OF DIALOGUE / 对话纪年</p>
          <p class="tl-lede">这一轴只记你与影说过的话，不替稻妻编年。</p>
        </div>
        <div class="tl-head-meta">
          <p class="tl-counter" aria-live="polite">
            <span class="tl-counter-now">{{ activeMark }}</span>
            <span class="tl-counter-slash">/</span>
            <span class="tl-counter-total">{{ total }}</span>
          </p>
          <p class="tl-counter-label">ROUNDS 轮</p>
          <a class="tl-skip" href="#dialogue-talk" @click.prevent="emit('skip')">跳至对谈 ↓</a>
        </div>
      </header>

      <div class="tl-rail" aria-hidden="true">
        <span ref="progressRef" class="tl-rail-fill"></span>
        <span class="tl-rail-tick tick-a"></span>
        <span class="tl-rail-tick tick-b"></span>
        <span class="tl-rail-tick tick-c"></span>
        <span class="tl-rail-hint">SCROLL →</span>
      </div>

      <div ref="trackRef" class="tl-track">
        <div class="tl-thread" aria-hidden="true"></div>

        <div class="tl-part is-intro">
          <div class="intro-inner">
            <p class="intro-label"><span class="intro-label-sq"></span>ДИАЛОГ · 对话档案</p>
            <h2 class="intro-title">
              <span class="letter" data-go="0">对话</span>
              <span class="letter is-red" data-go="1">纪年</span>
            </h2>
            <p class="intro-note">
              稻妻的往事留在别处。这条轴上只有你与影已经交换过的话——每一次发问，都会在这里压出一个刻度。
            </p>
            <p v-if="greeting" class="intro-quiet">「{{ greeting.text }}」</p>
            <dl class="intro-stats">
              <div>
                <dt>问</dt>
                <dd>{{ pad(stats.rounds) }}</dd>
              </div>
              <div>
                <dt>答</dt>
                <dd>{{ pad(stats.answered) }}</dd>
              </div>
              <div>
                <dt>引</dt>
                <dd>{{ pad(stats.sources) }}</dd>
              </div>
            </dl>
            <button class="intro-cta" type="button" @click="emit('skip')">
              {{ stats.rounds ? '继续对谈' : '落笔第一问' }}
              <span aria-hidden="true">↓</span>
            </button>
          </div>

          <div class="intro-art" aria-hidden="true">
            <div class="art-frame">
              <div class="art-square"></div>
              <div class="art-circle"></div>
              <div class="art-wedge"></div>
              <div class="art-bar"></div>
              <div class="art-cross"></div>
            </div>
            <p class="art-caption">ФОРМА · 1923</p>
          </div>
        </div>

        <div
          v-for="(node, index) in nodes"
          :key="node.id"
          class="tl-part is-node"
          :class="{ 'is-odd': index % 2 === 1, 'is-active': index === activeIndex }"
        >
          <button
            type="button"
            class="node-card"
            :aria-current="index === activeIndex ? 'true' : undefined"
            :aria-label="'第 ' + node.mark + ' 轮：' + node.question"
            @click="handleNode(node, index)"
          >
            <span class="node-head">
              <span class="node-no">{{ node.mark }}</span>
              <span class="node-state">{{ node.statusLabel }}</span>
            </span>
            <span class="node-q"><span class="node-tag">问</span>{{ node.question }}</span>
            <span class="node-a"><span class="node-tag is-answer">答</span>{{ node.answer }}</span>
            <span class="node-foot">
              <span class="node-time">{{ node.timeLabel || '——:——' }}</span>
              <span v-if="node.sources" class="node-src">引 {{ node.sources }}</span>
              <span class="node-jump">跳至原文 →</span>
            </span>
          </button>
        </div>

        <div class="tl-part is-outro">
          <p class="outro-mark" aria-hidden="true">∎</p>
          <h3 class="outro-title">此卷仍在书写</h3>
          <p class="outro-note">你说的下一句话，会成为这条轴上新的刻度。</p>
          <button class="outro-cta" type="button" @click="emit('skip')">回到对谈 →</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  greeting: { type: Object, default: null },
  stats: { type: Object, default: () => ({ rounds: 0, answered: 0, sources: 0 }) },
})

const emit = defineEmits(['active', 'skip', 'jump'])

const rootRef = ref(null)
const trackRef = ref(null)
const progressRef = ref(null)
const activeIndex = ref(-1)
const rootStyle = ref({})
const desktop = ref(false)

let gsapRef = null
let ScrollTriggerRef = null
let ctx = null
let travelTween = null
let disposed = false
let resizeTimer = null
let reinitTimer = null

const total = computed(() => pad(props.nodes.length))
const activeMark = computed(() => (activeIndex.value >= 0 ? pad(activeIndex.value + 1) : '00'))
const screens = computed(() => Math.min(4.6, 1.8 + props.nodes.length * 0.5))

function pad(value) {
  return String(value ?? 0).padStart(2, '0')
}

function prefersReduced() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setRootHeight() {
  if (typeof window === 'undefined') return
  if (desktop.value) {
    rootStyle.value = { height: Math.round(window.innerHeight * screens.value) + 'px' }
  } else {
    rootStyle.value = {}
  }
}

function travelDistance() {
  const track = trackRef.value
  const sticky = rootRef.value && rootRef.value.querySelector('.tl-sticky')
  if (!track || !sticky) return 0
  return Math.max(0, track.scrollWidth - sticky.clientWidth)
}

function setActive(index) {
  if (index === activeIndex.value) return
  activeIndex.value = index
  emit('active', index >= 0 ? props.nodes[index] : null)
}

function syncActive(progress) {
  const track = trackRef.value
  const sticky = rootRef.value && rootRef.value.querySelector('.tl-sticky')
  if (!track || !sticky) return
  const parts = Array.from(track.querySelectorAll('.is-node'))
  if (!parts.length) return
  const offset = progress * travelDistance() + sticky.clientWidth * 0.5
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  parts.forEach((part, index) => {
    const center = part.offsetLeft + part.offsetWidth / 2
    const distance = Math.abs(center - offset)
    if (distance < bestDistance) {
      bestDistance = distance
      best = index
    }
  })
  setActive(best)
}

function setupTimeline() {
  if (!rootRef.value || !trackRef.value || !gsapRef || !ScrollTriggerRef) return

  ctx = gsapRef.context(() => {
    travelTween = gsapRef.to(trackRef.value, {
      x: () => -travelDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.value,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * Math.max(0.4, screens.value - 1)),
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (progressRef.value) {
            progressRef.value.style.transform = 'scaleX(' + self.progress + ')'
          }
          syncActive(self.progress)
        },
      },
    })

    const intro = rootRef.value.querySelector('.is-intro')
    if (intro) {
      intro.querySelectorAll('.letter').forEach((el, index) => {
        gsapRef.to(el, {
          '--go': 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.value,
            start: 'top+=' + (30 + index * 26) + ' 88%',
            end: 'top+=' + (30 + index * 26) + ' 46%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
      })
    }
  })

  setActive(props.nodes.length ? 0 : -1)
  if (progressRef.value) progressRef.value.style.transform = 'scaleX(0)'
}

function teardown() {
  if (ctx) {
    ctx.revert()
    ctx = null
  }
  travelTween = null
}

async function restartTimeline() {
  await nextTick()
  if (disposed || !rootRef.value) return
  teardown()
  desktop.value = window.innerWidth > 860 && !prefersReduced()
  setRootHeight()
  if (!desktop.value) {
    if (activeIndex.value !== -1) {
      activeIndex.value = -1
      emit('active', null)
    }
    return
  }
  setupTimeline()
  if (ScrollTriggerRef) ScrollTriggerRef.refresh()
}

function handleNode(node, index) {
  activeIndex.value = index
  emit('active', node)
  emit('jump', node)
}

function handleResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (disposed) return
    const next = window.innerWidth > 860 && !prefersReduced()
    if (next !== desktop.value) {
      restartTimeline()
      return
    }
    setRootHeight()
    if (desktop.value && ScrollTriggerRef) ScrollTriggerRef.refresh()
  }, 180)
}

async function boot() {
  const gsapModule = await import('gsap')
  const scrollModule = await import('gsap/ScrollTrigger')
  if (disposed) return
  gsapRef = gsapModule.default || gsapModule
  ScrollTriggerRef = scrollModule.ScrollTrigger || scrollModule.default
  gsapRef.registerPlugin(ScrollTriggerRef)

  desktop.value = window.innerWidth > 860 && !prefersReduced()
  setRootHeight()
  if (desktop.value) setupTimeline()
  if (ScrollTriggerRef) ScrollTriggerRef.refresh()

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!disposed && ScrollTriggerRef) ScrollTriggerRef.refresh()
    })
  }
}

watch(
  () => props.nodes.length,
  () => {
    clearTimeout(reinitTimer)
    reinitTimer = setTimeout(() => {
      restartTimeline()
    }, 140)
  }
)

onMounted(() => {
  boot()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  disposed = true
  clearTimeout(resizeTimer)
  clearTimeout(reinitTimer)
  window.removeEventListener('resize', handleResize)
  teardown()
})
</script>

<style scoped>
.tl-root {
  --red: #c8102e;
  --red-deep: #9e0b23;
  --ink: #12100e;
  --paper: #ece4d3;
  --paper-deep: #ddd1b8;
  --gold: #a67c2e;
  --cream: #f6f3e9;
  --muted: #b8b1a3;
  --rule: rgba(246, 243, 233, 0.18);
  --ease-signature: cubic-bezier(0.38, 0, 0, 1);
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  position: relative;
  overflow: clip;
  background: var(--ink);
  border-top: 2px solid var(--cream);
  border-bottom: 2px solid var(--cream);
  color: var(--cream);
  isolation: isolate;
}

.tl-sticky {
  position: relative;
  height: auto;
  overflow: hidden;
}

.tl-grain {
  position: absolute;
  inset: 0;
  z-index: 9;
  background-image: var(--grain);
  opacity: 0.09;
  mix-blend-mode: screen;
  pointer-events: none;
}

.deco-wedge,
.deco-square,
.deco-circle,
.tl-thread,
.tl-rail {
  display: none;
}

/* ---------- 头部 ---------- */
.tl-head {
  position: relative;
  z-index: 8;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 30px 20px 4px;
}

.tl-kicker {
  margin: 0;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.tl-kicker::before {
  content: '';
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 9px;
  background: var(--red);
  vertical-align: 1px;
}

.tl-lede {
  margin: 10px 0 0;
  max-width: 30ch;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.8;
  letter-spacing: 0.04em;
}

.tl-head-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.tl-counter {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.tl-counter-now {
  color: var(--red);
}

.tl-counter-slash {
  color: var(--gold);
}

.tl-counter-total {
  color: var(--cream);
}

.tl-counter-label {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.54rem;
  letter-spacing: 0.2em;
}

.tl-skip {
  margin-top: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--red);
  color: var(--cream);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-decoration: none;
  transition: color 0.2s var(--ease-signature);
}

.tl-skip:hover {
  color: var(--gold);
}

/* ---------- 轨道（移动端为纵列） ---------- */
.tl-track {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  padding-bottom: 34px;
}

.tl-part {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  width: 100%;
  padding: 0 18px;
}

/* ---------- 开篇 ---------- */
.is-intro {
  padding-top: 26px;
  padding-bottom: 26px;
}

.intro-inner {
  max-width: 580px;
}

.intro-label {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 20px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.intro-label-sq {
  width: 9px;
  height: 9px;
  background: var(--red);
}

.intro-title {
  display: flex;
  flex-direction: column;
  margin: 0;
  color: var(--cream);
  font-family: var(--font-serif);
  font-size: clamp(3.2rem, 16vw, 5.4rem);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: 0.12em;
}

.letter {
  --go: 0;
  display: block;
  clip-path: inset(0 calc((1 - var(--go)) * 100%) 0 0);
}

.letter.is-red {
  color: var(--red);
}

.intro-note {
  max-width: 34ch;
  margin: 22px 0 0;
  color: var(--muted);
  font-size: 0.86rem;
  line-height: 1.95;
  letter-spacing: 0.04em;
}

.intro-quiet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 18px 0 0;
  padding-left: 12px;
  border-left: 3px solid var(--gold);
  color: #d6cec0;
  font-size: 0.78rem;
  line-height: 1.8;
}

.intro-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 26px 0 24px;
}

.intro-stats div {
  min-width: 52px;
  padding-top: 8px;
  border-top: 2px solid var(--cream);
}

.intro-stats dt {
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 0.54rem;
  letter-spacing: 0.2em;
}

.intro-stats dd {
  margin: 2px 0 0;
  color: var(--cream);
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.intro-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border: 2px solid var(--red);
  background: var(--red);
  color: var(--cream);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  cursor: pointer;
  box-shadow: 6px 6px 0 var(--cream);
  transition: transform 0.28s var(--ease-signature), box-shadow 0.28s var(--ease-signature);
}

.intro-cta:hover {
  transform: translate(-3px, -3px);
  box-shadow: 10px 10px 0 var(--cream);
}

.intro-cta:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--cream);
}

.intro-art {
  display: none;
}

/* ---------- 节点卡 ---------- */
.is-node {
  padding-top: 3px;
  padding-bottom: 20px;
}

.node-card {
  --card-bg: var(--paper);
  --card-ink: #1b1815;
  --card-muted: #5c5548;
  --card-rule: rgba(27, 24, 21, 0.22);
  position: relative;
  display: block;
  width: 100%;
  padding: 18px 20px 16px;
  border: 2px solid var(--ink);
  background: var(--card-bg);
  color: var(--card-ink);
  text-align: left;
  font: inherit;
  cursor: pointer;
  box-shadow: 8px 8px 0 var(--red);
  transition: transform 0.32s var(--ease-signature), box-shadow 0.32s var(--ease-signature);
}

.is-odd .node-card {
  --card-bg: var(--ink);
  --card-ink: var(--paper);
  --card-muted: #b9b0a0;
  --card-rule: rgba(236, 228, 211, 0.28);
  border-color: var(--paper);
  box-shadow: 8px 8px 0 var(--red-deep);
}

.node-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top: 44px solid var(--red);
  border-left: 44px solid transparent;
}

.node-card::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 5px;
  background: var(--red);
}

.node-card:hover,
.is-active .node-card {
  transform: translate(-4px, -4px);
  box-shadow: 12px 12px 0 var(--red);
}

.is-odd .node-card:hover,
.is-odd.is-active .node-card {
  box-shadow: 12px 12px 0 var(--red-deep);
}

.node-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-right: 28px;
}

.node-no {
  color: var(--red);
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 0.85;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}

.is-odd .node-no {
  color: var(--gold);
}

.node-state {
  flex: 0 0 auto;
  margin-top: 3px;
  padding: 3px 7px;
  border: 1px solid var(--card-rule);
  color: var(--card-muted);
  font-family: var(--font-mono);
  font-size: 0.54rem;
  letter-spacing: 0.16em;
  white-space: nowrap;
}

.node-q {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 14px 0 11px;
  color: var(--card-ink);
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.65;
  letter-spacing: 0.02em;
}

.node-a {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-top: 11px;
  border-top: 1px dashed var(--card-rule);
  color: var(--card-muted);
  font-size: 0.78rem;
  line-height: 1.8;
}

.node-tag {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 5px;
  background: var(--red);
  color: var(--cream);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  font-style: normal;
  letter-spacing: 0.08em;
  vertical-align: 1px;
}

.node-tag.is-answer {
  background: var(--ink);
  color: var(--paper);
}

.is-odd .node-tag.is-answer {
  background: var(--paper);
  color: var(--ink);
}

.node-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 2px solid var(--card-rule);
  color: var(--card-muted);
  font-family: var(--font-mono);
  font-size: 0.54rem;
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
}

.node-jump {
  color: var(--red);
  letter-spacing: 0.1em;
}

.is-odd .node-jump {
  color: var(--gold);
}

/* ---------- 收尾 ---------- */
.is-outro {
  padding-top: 26px;
  padding-bottom: 40px;
  border-top: 2px solid var(--rule);
}

.outro-mark {
  margin: 0 0 14px;
  color: var(--red);
  font-size: 1.6rem;
  line-height: 1;
}

.outro-title {
  margin: 0;
  color: var(--cream);
  font-family: var(--font-serif);
  font-size: 1.5rem;
  letter-spacing: 0.1em;
}

.outro-note {
  max-width: 30ch;
  margin: 12px 0 20px;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.9;
}

.outro-cta {
  padding: 11px 20px;
  border: 2px solid var(--cream);
  background: transparent;
  color: var(--cream);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  cursor: pointer;
  transition: background 0.24s var(--ease-signature), color 0.24s var(--ease-signature);
}

.outro-cta:hover {
  background: var(--cream);
  color: var(--ink);
}

/* ---------- 桌面：横向 sticky ---------- */
@media (min-width: 861px) and (prefers-reduced-motion: no-preference) {
  .tl-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }

  .tl-track {
    flex-direction: row;
    align-items: center;
    width: max-content;
    min-width: 100%;
    height: 100%;
    padding: 0 8vw 0 7vw;
  }

  .tl-thread {
    display: block;
    position: absolute;
    top: 50%;
    right: 0;
    left: 7vw;
    z-index: 0;
    height: 2px;
    background: var(--rule);
  }

  .tl-part {
    display: flex;
    align-items: center;
    width: auto;
    height: 100%;
    padding: 76px 0 64px;
  }

  .is-intro {
    width: min(66vw, 760px);
    padding-right: 4vw;
    padding-left: 0;
  }

  .intro-inner {
    max-width: 460px;
  }

  .intro-title {
    font-size: clamp(3.8rem, 6.4vw, 5.8rem);
  }

  .intro-art {
    display: block;
    position: relative;
    flex: 0 0 auto;
    width: clamp(190px, 17vw, 260px);
    margin-left: auto;
    align-self: center;
  }

  .art-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    border: 2px solid var(--paper);
    background: var(--paper);
    box-shadow: 12px 12px 0 var(--red);
    transform: rotate(-2deg);
  }

  .art-square {
    position: absolute;
    top: 12%;
    left: 11%;
    width: 42%;
    aspect-ratio: 1;
    background: var(--ink);
  }

  .art-circle {
    position: absolute;
    top: 15%;
    right: 10%;
    width: 30%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--red);
  }

  .art-wedge {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 46%;
    background: var(--red);
    clip-path: polygon(0 100%, 100% 18%, 100% 100%);
  }

  .art-bar {
    position: absolute;
    right: 14%;
    bottom: 0;
    width: 10%;
    height: 62%;
    background: var(--gold);
  }

  .art-cross {
    position: absolute;
    top: 56%;
    left: 14%;
    width: 22%;
    aspect-ratio: 1;
    border: 2px solid var(--ink);
    border-radius: 50%;
  }

  .art-caption {
    margin: 16px 0 0;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.52rem;
    letter-spacing: 0.26em;
  }

  .is-node {
    width: clamp(380px, 38vw, 580px);
    justify-content: center;
    padding-top: 70px;
    padding-bottom: 74px;
  }

  .node-card {
    width: clamp(300px, 28vw, 420px);
    padding: 22px 24px 18px;
  }

  .is-outro {
    width: 38vw;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 70px 6vw 74px 3vw;
    border-top: 0;
    border-left: 2px solid var(--rule);
  }

  .tl-head {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    padding: 28px 4vw 0;
    pointer-events: none;
  }

  .tl-skip {
    pointer-events: auto;
  }

  .tl-head-meta {
    align-items: flex-end;
  }

  .tl-counter {
    font-size: 2rem;
  }

  .tl-rail {
    display: block;
    position: absolute;
    right: 4vw;
    bottom: 32px;
    left: 7vw;
    z-index: 8;
    height: 2px;
    background: rgba(246, 243, 233, 0.2);
  }

  .tl-rail-fill {
    position: absolute;
    inset: 0;
    background: var(--red);
    transform: scaleX(0);
    transform-origin: left center;
  }

  .tl-rail-tick {
    position: absolute;
    top: -4px;
    width: 2px;
    height: 10px;
    background: var(--cream);
  }

  .tick-a {
    left: 25%;
  }

  .tick-b {
    left: 50%;
  }

  .tick-c {
    left: 75%;
  }

  .tl-rail-hint {
    position: absolute;
    top: -26px;
    right: 0;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.52rem;
    letter-spacing: 0.24em;
  }

  .deco-wedge {
    display: block;
    position: absolute;
    bottom: 6vh;
    left: -10vw;
    z-index: 0;
    width: 52vw;
    height: 130px;
    background: var(--red);
    transform: rotate(-13deg);
  }

  .deco-square {
    display: block;
    position: absolute;
    top: 13vh;
    right: 3vw;
    z-index: 0;
    width: 17vw;
    max-width: 240px;
    aspect-ratio: 1;
    border: 2px solid rgba(246, 243, 233, 0.18);
    transform: rotate(12deg);
  }

  .deco-circle {
    display: block;
    position: absolute;
    right: 17vw;
    bottom: 13vh;
    z-index: 0;
    width: 84px;
    height: 84px;
    border: 2px solid var(--gold);
    border-radius: 50%;
    opacity: 0.7;
  }
}

@media (max-width: 860px) {
  .letter {
    --go: 1;
    clip-path: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter {
    --go: 1;
    clip-path: none;
  }

  .node-card,
  .intro-cta,
  .outro-cta,
  .tl-skip {
    transition: none;
  }
}
</style>
