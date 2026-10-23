<template>
  <div class="dialogue-page">
    <section ref="heroRef" class="hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="hero-kicker js-dlg-reveal">
            <span class="hero-index">01</span>
            <span>PLANE OF EUTHYMIA / ДИАЛОГ</span>
          </p>
          <h1 class="hero-title js-dlg-reveal">一心净土</h1>
          <p class="hero-sub js-dlg-reveal">与影对谈</p>
          <p class="hero-quote js-dlg-reveal">
            「永恒并非静止。它只是把每一瞬，<br />
            都压成了可被记住的形状。」
          </p>
          <p class="hero-lede js-dlg-reveal">
            与雷电影隔案而坐。发问、沉默、追问都可以；她记得你们说过的话，也记得自己曾如何回答。
          </p>
          <div class="hero-actions js-dlg-reveal">
            <a class="hero-cta" href="#dialogue-talk" @click.prevent="scrollToTalk">
              进入对谈 <span aria-hidden="true">↓</span>
            </a>
            <span class="hero-count">已落 {{ pad(roundCount) }} 轮</span>
          </div>
        </div>

        <div class="hero-art js-dlg-reveal" aria-hidden="true">
          <div ref="posterRef" class="poster">
            <div class="poster-square"></div>
            <div class="poster-circle"></div>
            <div class="poster-wedge"></div>
            <div class="poster-bar"></div>
            <div class="poster-line line-a"></div>
            <div class="poster-line line-b"></div>
            <div class="poster-cross"></div>
            <p class="poster-label">ЭЙ · 1923</p>
            <p class="poster-caption">雷电影 / 一心净土</p>
          </div>
          <p class="poster-note">SUPREMATISM · 构成</p>
        </div>
      </div>

      <div class="hero-ruler" aria-hidden="true"><span ref="spineRef"></span></div>

      <a class="hero-scroll js-dlg-reveal" href="#dialogue-chronicle" @click.prevent="scrollToTimeline">
        <span>SCROLL</span>
        <i aria-hidden="true"></i>
      </a>
    </section>

    <div id="dialogue-chronicle">
      <DialogueTimeline
        :nodes="timeline.nodes"
        :greeting="timeline.greeting"
        :stats="timeline.stats"
        @active="activeRound = $event"
        @skip="scrollToTalk"
        @jump="jumpToMessage"
      />
    </div>

    <section id="dialogue-talk" ref="talkRef" class="talk">
      <header class="talk-head js-dlg-reveal">
        <p class="talk-kicker">DIALOGUE / 对谈</p>
        <h2 class="talk-title">与影对谈</h2>
        <p class="talk-lede">她坐在纸的另一侧。你说的话会留在这条轴上，而不是被风带走。</p>
        <p class="talk-era">
          <span>对话纪年</span>
          <template v-if="eraRound">
            {{ activeRound ? '第 ' + eraRound.mark + ' 轮' : '共 ' + pad(roundCount) + ' 轮' }} · {{ eraRound.statusLabel }} · {{ eraRound.timeLabel || '——:——' }}
          </template>
          <template v-else>{{ roundCount ? '未选中轮次' : '尚未落笔' }}</template>
        </p>
      </header>

      <div class="talk-grid">
        <div class="paper">
          <span class="paper-grain" aria-hidden="true"></span>
          <span class="paper-flag" aria-hidden="true"></span>
          <DialogueThread
            ref="threadRef"
            :messages="messages"
            :loading="loading"
            :phase="phase"
            :connection-error="connectionError"
            :prompts="prompts"
            :has-conversation="hasConversation"
            @send="send"
            @clear="clearChat"
          />
        </div>

        <DialogueAside class="js-dlg-reveal" :session="session" :tools="lastToolState" />
      </div>

      <footer class="talk-foot js-dlg-reveal">
        <span>ARCHIVE 01</span>
        <span>共 {{ pad(roundCount) }} 轮问答</span>
        <span>模型 {{ lastToolState.model || 'DEEPSEEK' }}</span>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DialogueAside from '@/features/dialogue/components/DialogueAside.vue'
import DialogueThread from '@/features/dialogue/components/DialogueThread.vue'
import DialogueTimeline from '@/features/dialogue/components/DialogueTimeline.vue'
import { useDialogue } from '@/features/dialogue/composables/useDialogue.js'
import { buildConversationTimeline } from '@/features/dialogue/composables/useDialogueTimeline.js'

const {
  messages,
  session,
  loading,
  connectionError,
  phase,
  lastToolState,
  hasConversation,
  prompts,
  restoreChat,
  send,
  clearChat,
} = useDialogue()

const heroRef = ref(null)
const posterRef = ref(null)
const spineRef = ref(null)
const talkRef = ref(null)
const threadRef = ref(null)
const activeRound = ref(null)

const timeline = computed(() => buildConversationTimeline(messages))
const roundCount = computed(() => timeline.value.stats.rounds)
const eraRound = computed(() => activeRound.value || timeline.value.nodes[timeline.value.nodes.length - 1] || null)

let heroCtx = null
let posterMove = null
let jumpTimer = null
let disposed = false

function pad(value) {
  return String(value ?? 0).padStart(2, '0')
}

function prefersReduced() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToId(id) {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' })
}

function scrollToTalk() {
  scrollToId('dialogue-talk')
}

function scrollToTimeline() {
  scrollToId('dialogue-chronicle')
}

function jumpToMessage(node) {
  scrollToTalk()
  clearTimeout(jumpTimer)
  jumpTimer = setTimeout(() => {
    if (!disposed) threadRef.value?.focusMessage(node.userIndex)
  }, 420)
}

function bindPoster() {
  const hero = heroRef.value
  const poster = posterRef.value
  if (!hero || !poster || prefersReduced()) return
  posterMove = event => {
    const rect = hero.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    poster.style.setProperty('--px', (x * 16).toFixed(1) + 'px')
    poster.style.setProperty('--py', (y * 16).toFixed(1) + 'px')
  }
  hero.addEventListener('pointermove', posterMove)
}

async function setupHero() {
  if (prefersReduced()) return

  const gsapModule = await import('gsap')
  const scrollModule = await import('gsap/ScrollTrigger')
  if (disposed) return

  const gsap = gsapModule.default || gsapModule
  const ScrollTrigger = scrollModule.ScrollTrigger || scrollModule.default
  gsap.registerPlugin(ScrollTrigger)

  heroCtx = gsap.context(() => {
    gsap.from('.js-dlg-reveal', {
      autoAlpha: 0,
      y: 28,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
    })

    if (spineRef.value) {
      gsap.to(spineRef.value, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.value,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
    }

    if (talkRef.value) {
      talkRef.value.querySelectorAll('.js-dlg-reveal').forEach(element => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 22,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        })
      })
    }
  }, heroRef.value)

  bindPoster()
}

onMounted(() => {
  restoreChat()
  setupHero()
})

onUnmounted(() => {
  disposed = true
  clearTimeout(jumpTimer)
  if (posterMove && heroRef.value) heroRef.value.removeEventListener('pointermove', posterMove)
  if (heroCtx) {
    heroCtx.revert()
    heroCtx = null
  }
})
</script>

<style scoped>
.dialogue-page {
  --purple: #8b5cf6;
  --purple-bright: #a78bfa;
  --purple-deep: #4c1d95;
  --red: #e01b2e;
  --red-deep: #9d0f20;
  --ink: #140c24;
  --paper: #ece4d3;
  --paper-deep: #ddd1b8;
  --gold: #d8b25a;
  --cream: #f3eee6;
  --muted: #b6adc9;
  --rule: rgba(216, 199, 255, 0.18);
  --ease-signature: cubic-bezier(0.38, 0, 0, 1);
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  position: relative;
  color: var(--cream);
}

/* ================= 开篇 ================= */
.hero {
  --hero-pad: clamp(20px, 5vw, 58px);
  position: relative;
  display: flex;
  min-height: clamp(620px, 88vh, 900px);
  align-items: center;
  padding: clamp(70px, 11vh, 120px) var(--hero-pad) clamp(80px, 11vh, 130px);
  overflow: hidden;
  isolation: isolate;
}

.hero::before {
  position: absolute;
  top: 45%;
  right: -18%;
  z-index: 0;
  width: 64%;
  height: clamp(70px, 10vh, 118px);
  border-top: 3px solid var(--gold);
  border-bottom: 10px solid var(--red);
  background: var(--purple-deep);
  content: '';
  transform: rotate(-8deg);
}

.hero::after {
  position: absolute;
  bottom: -14%;
  left: -7%;
  z-index: 0;
  width: 34vw;
  max-width: 440px;
  aspect-ratio: 1;
  border: 2px solid rgba(167, 139, 250, 0.34);
  content: '';
  transform: rotate(14deg);
}

.hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
  gap: clamp(30px, 6vw, 80px);
  align-items: center;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.hero-copy {
  max-width: 620px;
}

.hero-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.hero-index {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 2px solid var(--cream);
  color: var(--cream);
  font-size: 0.56rem;
  letter-spacing: 0.06em;
}

.hero-title {
  margin: 28px 0 0;
  color: var(--cream);
  font-family: var(--font-display);
  font-size: clamp(3.2rem, 7.4vw, 6rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.08em;
}

.hero-title::after {
  display: inline-block;
  width: 0.12em;
  height: 0.12em;
  margin-left: 0.16em;
  background: var(--red);
  content: '';
  vertical-align: 0.14em;
}

.hero-sub {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 20px 0 0;
  color: var(--gold);
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 1.8vw, 1.4rem);
  letter-spacing: 0.36em;
}

.hero-sub::before {
  width: 44px;
  height: 3px;
  background: var(--red);
  content: '';
}

.hero-quote {
  margin: 30px 0 0;
  padding-left: 16px;
  border-left: 3px solid var(--purple);
  color: var(--muted);
  font-family: var(--font-serif);
  font-size: 0.9rem;
  line-height: 2.05;
  letter-spacing: 0.04em;
}

.hero-lede {
  max-width: 36ch;
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.95;
  letter-spacing: 0.03em;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 22px;
  margin-top: 32px;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border: 2px solid var(--purple);
  background: var(--purple);
  color: var(--cream);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-decoration: none;
  box-shadow: 7px 7px 0 var(--gold);
  transition: transform 0.28s var(--ease-signature), box-shadow 0.28s var(--ease-signature);
}

.hero-cta:hover {
  border-color: var(--red);
  background: var(--red);
  transform: translate(-3px, -3px);
  box-shadow: 11px 11px 0 var(--gold);
}

.hero-cta:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--gold);
}

.hero-count {
  padding-left: 13px;
  border-left: 2px solid var(--red);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
}

/* ---------- 海报 ---------- */
.hero-art {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
}

.poster {
  --px: 0px;
  --py: 0px;
  position: relative;
  width: clamp(250px, 27vw, 356px);
  aspect-ratio: 3 / 4;
  border: 2px solid var(--ink);
  background: var(--paper);
  box-shadow: 16px 16px 0 var(--purple-deep), 26px 26px 0 var(--red);
  transform: translate3d(var(--px), var(--py), 0) rotate(-1.5deg);
  transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
  will-change: transform;
}

.poster::after {
  position: absolute;
  inset: 0;
  z-index: 6;
  background-image: var(--grain);
  content: '';
  opacity: 0.16;
  mix-blend-mode: multiply;
  pointer-events: none;
}

.poster-square {
  position: absolute;
  top: 17%;
  left: 12%;
  z-index: 3;
  width: 38%;
  aspect-ratio: 1;
  background: var(--ink);
}

.poster-circle {
  position: absolute;
  top: 18%;
  right: 10%;
  z-index: 2;
  width: 27%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--purple);
}

.poster-wedge {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 34%;
  background: var(--red);
  clip-path: polygon(0 100%, 0 24%, 58% 100%);
}

.poster-bar {
  position: absolute;
  right: 17%;
  bottom: 0;
  z-index: 3;
  width: 9%;
  height: 54%;
  background: var(--gold);
}

.poster-line {
  position: absolute;
  z-index: 3;
  height: 2px;
  background: var(--ink);
}

.line-a {
  top: 56%;
  left: 7%;
  width: 72%;
  transform: rotate(-32deg);
}

.line-b {
  top: 49%;
  right: 5%;
  width: 46%;
  transform: rotate(58deg);
}

.poster-cross {
  position: absolute;
  top: 63%;
  left: 15%;
  z-index: 3;
  width: 21%;
  aspect-ratio: 1;
  border: 2px solid var(--ink);
  border-radius: 50%;
}

.poster-label {
  position: absolute;
  top: 4%;
  left: 6%;
  z-index: 4;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 0.46rem;
  letter-spacing: 0.22em;
}

.poster-caption {
  position: absolute;
  bottom: 3%;
  left: 6%;
  z-index: 4;
  margin: 0;
  color: var(--cream);
  font-family: var(--font-mono);
  font-size: 0.44rem;
  letter-spacing: 0.14em;
}

.poster-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 30px 0 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.52rem;
  letter-spacing: 0.26em;
}

.poster-note::before {
  width: 26px;
  height: 2px;
  background: var(--purple-bright);
  content: '';
}

/* ---------- 竖向标尺 ---------- */
.hero-ruler {
  position: absolute;
  top: 0;
  right: clamp(10px, 2vw, 26px);
  bottom: 0;
  width: 2px;
  background: rgba(246, 243, 233, 0.12);
}

.hero-ruler span {
  display: block;
  width: 2px;
  height: 100%;
  background: var(--purple);
  transform: scaleY(0.12);
  transform-origin: top center;
}

.hero-scroll {
  position: absolute;
  bottom: 26px;
  left: clamp(20px, 5vw, 58px);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.26em;
  text-decoration: none;
}

.hero-scroll i {
  width: 46px;
  height: 2px;
  background: var(--purple-bright);
}

/* ================= 对谈 ================= */
.talk {
  position: relative;
  isolation: isolate;
  padding: clamp(64px, 9vh, 108px) 0 clamp(36px, 6vh, 64px);
}

.talk::before {
  position: absolute;
  top: 6%;
  right: -9%;
  z-index: 0;
  width: clamp(200px, 24vw, 360px);
  aspect-ratio: 1;
  background: var(--purple-deep);
  content: '';
  opacity: 0.72;
  transform: rotate(38deg);
  pointer-events: none;
}

.talk::after {
  position: absolute;
  bottom: 3%;
  left: -12%;
  z-index: 0;
  width: min(38vw, 460px);
  height: 18px;
  background: var(--red);
  content: '';
  transform: rotate(-14deg);
  pointer-events: none;
}

.talk > * {
  position: relative;
  z-index: 1;
}

.talk-head {
  max-width: 720px;
  margin-bottom: clamp(28px, 5vh, 48px);
  padding-left: 22px;
  border-left: 6px solid var(--purple);
}

.talk-kicker {
  margin: 0;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.talk-title {
  margin: 12px 0 0;
  color: var(--cream);
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4.2vw, 3.4rem);
  font-weight: 400;
  letter-spacing: 0.07em;
}

.talk-lede {
  max-width: 40ch;
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.9;
}

.talk-era {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
}

.talk-era span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--red);
  letter-spacing: 0.16em;
}

.talk-era span::before {
  width: 7px;
  height: 7px;
  background: var(--red);
  content: '';
}

.talk-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 268px;
  gap: clamp(28px, 4vw, 52px);
  align-items: start;
}

/* ---------- 宣纸面板 ---------- */
.paper {
  position: relative;
  overflow: hidden;
  border: 2px solid var(--ink);
  background: var(--paper);
  color: #1b1815;
  box-shadow: 12px 12px 0 var(--purple-deep), 20px 20px 0 var(--red), 0 0 0 1px rgba(216, 199, 255, 0.16);
}

.paper::before {
  position: absolute;
  inset: 0 auto 0 0;
  z-index: 4;
  width: 7px;
  background: var(--purple);
  content: '';
}

.paper-grain {
  position: absolute;
  inset: 0;
  z-index: 5;
  background-image: var(--grain);
  opacity: 0.12;
  mix-blend-mode: multiply;
  pointer-events: none;
}

.paper-flag {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  width: 78px;
  height: 9px;
  background: var(--ink);
}

.talk-foot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin-top: clamp(30px, 5vh, 46px);
  padding-top: 14px;
  border-top: 2px solid var(--rule);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.14em;
}

.talk-foot span + span::before {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 10px;
  background: var(--red);
  content: '';
  vertical-align: 1px;
}

/* ================= 响应式 ================= */
@media (max-width: 1080px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr) minmax(230px, 0.62fr);
  }

  .poster {
    width: clamp(210px, 24vw, 280px);
  }

  .talk-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .talk :deep(.aside) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 34px;
  }
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
    padding-top: 56px;
    padding-bottom: 90px;
  }

  .hero::before {
    display: none;
  }

  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 44px;
  }

  .hero-art {
    order: -1;
    align-items: flex-start;
    width: 100%;
  }

  .poster {
    width: min(62vw, 280px);
    box-shadow: 10px 10px 0 var(--purple-deep), 18px 18px 0 var(--red);
  }

  .poster-note {
    margin-top: 22px;
  }

  .hero-ruler {
    display: none;
  }

  .hero-scroll {
    position: static;
    align-self: flex-start;
    margin-top: 36px;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: clamp(2.9rem, 15vw, 4.2rem);
  }

  .hero-quote {
    font-size: 0.84rem;
  }

  .hero-actions {
    gap: 16px;
  }

  .talk {
    padding-top: 54px;
  }

  .talk-head {
    padding-left: 15px;
    border-left-width: 5px;
  }

  .paper {
    box-shadow: 8px 8px 0 var(--purple-deep), 14px 14px 0 var(--red);
  }

  .talk :deep(.aside) {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .js-dlg-reveal {
    opacity: 1 !important;
    visibility: visible !important;
  }

  .hero-ruler span {
    transform: scaleY(1);
  }

  .poster {
    transform: rotate(-1.5deg);
    transition: none;
  }

  .hero-cta {
    transition: none;
  }
}
</style>
