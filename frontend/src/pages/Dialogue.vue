<!--
  与影对谈 — 独立对话模块

  结构（纵向叙事，参考 nanfu.global 的时间轴与动态页面手法）：
  01 开篇   满屏留白 + 一条自上而下的发丝脊线
  02 年表   鸣神纪年：sticky 时期大字 + 进度导轨 + 节点逐个激活
  03 对谈   宣纸面板上的对话线程（对话本身也按时间轴排布）+ 侧栏状态

  原则：高雅朴素。只用发丝线、留白与衬线字，不做霓虹与重装饰。
-->
<template>
  <div class="dialogue-page">
    <!-- ===== 01 开篇 ===== -->
    <section ref="heroRef" class="hero">
      <div class="hero-inner">
        <p class="hero-kicker js-dlg-reveal">PLANE OF EUTHYMIA / DIALOGUE</p>
        <h1 class="hero-title js-dlg-reveal">一心净土</h1>
        <p class="hero-sub js-dlg-reveal">与影对谈</p>
        <p class="hero-quote js-dlg-reveal">浮世景色百千年依旧，人之在世却如白露与泡影。</p>
      </div>

      <div class="hero-spine" aria-hidden="true">
        <span ref="spineRef"></span>
      </div>

      <p class="hero-scroll js-dlg-reveal">SCROLL</p>
    </section>

    <!-- ===== 02 年表 ===== -->
    <DialogueChronicle
      :nodes="chronicleNodes"
      :source="chronicleSource"
      @active="activeEra = $event"
      @skip="scrollToTalk"
    />

    <!-- ===== 03 对谈 ===== -->
    <section id="dialogue-talk" ref="talkRef" class="talk">
      <header class="talk-head">
        <p class="kicker">DIALOGUE / 对谈</p>
        <h2 class="talk-title">与影对谈</h2>
        <p class="talk-lede">
          她并非全知的神明。亲历、听闻与推测，她会分开说；不确定时，她会告诉你她不确定。
        </p>
        <p v-if="activeEra" class="talk-era">你正读到纪年 · {{ activeEra.era }}（{{ activeEra.title }}）</p>
      </header>

      <div class="talk-grid">
        <div class="paper js-dlg-paper">
          <DialogueThread
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

        <DialogueAside :session="session" :tools="lastToolState" />
      </div>
    </section>

    <footer class="talk-foot">
      <span>本模块为同人创作，与米哈游无关</span>
      <span class="foot-sep">/</span>
      <span>角色与设定版权归米哈游所有</span>
      <span class="foot-sep">/</span>
      <span>角色卡仅用于参考说话方式</span>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import DialogueChronicle from '@/features/dialogue/components/DialogueChronicle.vue'
import DialogueThread from '@/features/dialogue/components/DialogueThread.vue'
import DialogueAside from '@/features/dialogue/components/DialogueAside.vue'
import { CHRONICLE_NODES, CHRONICLE_SOURCE } from '@/features/dialogue/data/chronicle.js'
import { useDialogue } from '@/features/dialogue/composables/useDialogue.js'

const chronicleNodes = CHRONICLE_NODES
const chronicleSource = CHRONICLE_SOURCE
const activeEra = ref(null)

const {
  messages, session, loading, connectionError, phase, lastToolState,
  hasConversation, prompts, restoreChat, send, clearChat,
} = useDialogue()

const heroRef = ref(null)
const spineRef = ref(null)
const talkRef = ref(null)

let trigger
let gsapRef
let disposed = false

/** 年表提供「跳至对谈」，直接滚到对谈区，不必滚完时间轴 */
function scrollToTalk() {
  talkRef.value?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
}

function setupHero() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const items = heroRef.value?.querySelectorAll('.js-dlg-reveal')

  if (reduceMotion) {
    items?.forEach(item => { item.style.opacity = '1' })
    if (spineRef.value) spineRef.value.style.transform = 'scaleY(1)'
    return
  }

  // 动态 import 期间组件可能已经卸载，因此每个 await 之后都要重新确认
  import('gsap').then(({ gsap }) => {
    if (disposed) return
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      if (disposed) return
      gsap.registerPlugin(ScrollTrigger)
      gsapRef = gsap

      gsap.fromTo(items, {
        autoAlpha: 0,
        y: 26,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 1.15,
        ease: 'power2.out',
        stagger: 0.16,
        delay: 0.15,
      })

      trigger = ScrollTrigger.create({
        trigger: heroRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          if (spineRef.value) spineRef.value.style.transform = `scaleY(${Math.min(1, 0.12 + self.progress * 1.1)})`
        },
      })
    })
  })
}

onMounted(() => {
  restoreChat()
  setupHero()
})

onUnmounted(() => {
  disposed = true
  trigger?.kill()
  gsapRef = null
})
</script>

<style scoped>
/* 与 nanfu 一致的唯一签名曲线（≈ GSAP power4.out）：无回弹、无炫技 */
.dialogue-page {
  --ease-signature: cubic-bezier(0.38, 0, 0, 1);

  position: relative;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* ===== 01 开篇 ===== */
.hero {
  position: relative;
  display: flex;
  min-height: clamp(560px, 92vh, 940px);
  padding: clamp(96px, 16vh, 180px) clamp(24px, 6vw, 88px) clamp(60px, 10vh, 110px);
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.hero-inner { max-width: 760px; }

.hero-kicker {
  margin: 0 0 18px;
  color: #c9a96e;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.26em;
}

.hero-title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: clamp(2.6rem, 8vw, 5.4rem);
  font-weight: 400;
  letter-spacing: 0.14em;
  line-height: 1.06;
}

.hero-sub {
  margin: 20px 0 0;
  color: var(--text-secondary);
  font-family: var(--font-serif);
  font-size: clamp(0.95rem, 1.8vw, 1.24rem);
  letter-spacing: 0.42em;
}

.hero-quote {
  max-width: 26ch;
  margin: clamp(28px, 5vh, 52px) 0 0;
  padding-left: 16px;
  border-left: 1px solid rgba(201, 169, 110, 0.4);
  color: var(--text-tertiary);
  font-family: var(--font-serif);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  line-height: 2.05;
  text-wrap: pretty;
}

/* 自上而下的发丝脊线 */
.hero-spine {
  position: absolute;
  top: 0;
  right: clamp(24px, 8vw, 120px);
  bottom: 0;
  width: 1px;
  background: rgba(246, 243, 233, 0.07);
}

.hero-spine span {
  display: block;
  height: 100%;
  background: linear-gradient(180deg, rgba(201, 169, 110, 0.1), rgba(201, 169, 110, 0.72));
  transform: scaleY(0.12);
  transform-origin: top center;
  will-change: transform;
}

.hero-scroll {
  position: absolute;
  bottom: clamp(24px, 5vh, 46px);
  left: clamp(24px, 6vw, 88px);
  margin: 0;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.54rem;
  letter-spacing: 0.34em;
}

.hero-scroll::after {
  display: block;
  width: 1px;
  height: 34px;
  margin-top: 10px;
  background: linear-gradient(180deg, rgba(246, 243, 233, 0.32), transparent);
  content: '';
}

/* ===== 03 对谈 ===== */
.talk {
  padding: clamp(64px, 11vh, 148px) clamp(20px, 5vw, 64px) clamp(40px, 7vh, 80px);
  border-top: 1px solid var(--border);
}

.talk-head { max-width: 620px; margin-bottom: clamp(30px, 5vh, 56px); }

.kicker {
  margin: 0 0 10px;
  color: #c9a96e;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.18em;
}

.talk-title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 3.4vw, 2.3rem);
  font-weight: 400;
  letter-spacing: 0.06em;
}

.talk-lede {
  margin: 14px 0 0;
  color: var(--text-tertiary);
  font-size: 0.74rem;
  line-height: 1.85;
}

.talk-era {
  margin: 12px 0 0;
  color: rgba(201, 169, 110, 0.78);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
}

.talk-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(200px, 260px);
  gap: clamp(26px, 4.5vw, 64px);
  align-items: start;
}

/* ===== 宣纸面板 ===== */
.paper {
  --paper-bg: #f2ede3;
  --paper-ink: #33302a;
  --paper-ink-soft: #6b6558;
  --paper-line: rgba(51, 48, 42, 0.14);
  --paper-gold: #9a7736;

  position: relative;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.34);
  background:
    radial-gradient(120% 88% at 10% 0%, rgba(255, 255, 255, 0.72), transparent 58%),
    radial-gradient(100% 70% at 100% 100%, rgba(180, 158, 118, 0.14), transparent 62%),
    var(--paper-bg);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.42);
  color: var(--paper-ink);
}

/* 卷轴上下压边 */
.paper::before,
.paper::after {
  position: absolute;
  right: 0;
  left: 0;
  height: 2px;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(154, 119, 54, 0.42), transparent);
}

.paper::before { top: 0; }
.paper::after { bottom: 0; }

/* ===== 页脚 ===== */
.talk-foot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 22px clamp(20px, 5vw, 64px) 40px;
  border-top: 1px solid var(--border);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.06em;
}

.foot-sep { color: rgba(246, 243, 233, 0.18); }

@media (max-width: 980px) {
  .talk-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero { min-height: 78vh; }
  .hero-sub { letter-spacing: 0.3em; }
  /* 窄屏隐藏发丝脊线，避免与站点汉堡菜单叠在一起 */
  .hero-spine { display: none; }
  .hero-scroll { left: 24px; }
  .talk { padding-inline: 14px; }
  .talk-foot { padding-inline: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .js-dlg-reveal { opacity: 1 !important; }
}
</style>
