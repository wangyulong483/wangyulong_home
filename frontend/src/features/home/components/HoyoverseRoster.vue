<template>
  <section
    id="hoyoverse-roster"
    class="roster-section js-home-reveal"
    :class="`theme-${activeProfile.theme}`"
    :style="themeStyle"
    aria-labelledby="roster-title"
  >
    <div class="roster-grid" aria-hidden="true"></div>
    <span class="roster-chapter" aria-hidden="true">02</span>

    <header class="roster-heading">
      <p class="roster-kicker"><span></span> HOYOVERSE SIGNAL</p>
      <h2 id="roster-title">旅途同行者</h2>
      <p>三个世界，同一份长期在线的热爱。</p>
    </header>

    <div class="profile-stage">
      <Transition name="profile" mode="out-in">
        <div
          id="profile-panel"
          :key="activeProfile.id"
          class="profile-frame"
          role="tabpanel"
          :aria-labelledby="`profile-tab-${activeProfile.id}`"
        >
          <div class="profile-copy">
            <div class="profile-sequence">
              <span>{{ activeNumber }}</span>
              <i></i>
              <span>03</span>
            </div>

            <p class="game-name">{{ activeProfile.game }}</p>
            <h3>{{ activeProfile.character }}</h3>
            <p class="character-name">{{ activeProfile.name }}</p>
            <p class="profile-note">{{ activeProfile.note }}</p>

            <dl class="profile-data">
              <div>
                <dt>WORLD</dt>
                <dd>{{ activeProfile.world }}</dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd><span></span> ONLINE</dd>
              </div>
            </dl>

            <button
              type="button"
              class="uid-command"
              :title="copyLabel"
              :aria-label="`${copyLabel}：${activeProfile.uid}`"
              @click="copyUid"
            >
              <span class="uid-prefix">UID</span>
              <strong>{{ activeProfile.uid }}</strong>
              <AppIcon :icon="copiedId === activeProfile.id ? 'tick' : 'document'" size="16" />
              <span class="copy-state">{{ copyLabel }}</span>
            </button>
          </div>

          <div class="profile-visual" aria-live="polite">
            <span class="visual-code" aria-hidden="true">{{ activeProfile.code }}</span>
            <span class="visual-line line-a" aria-hidden="true"></span>
            <span class="visual-line line-b" aria-hidden="true"></span>
            <img
              :src="activeProfile.image"
              :alt="`${activeProfile.game}角色${activeProfile.character}`"
              :class="`art-${activeProfile.id}`"
              width="1200"
              height="1200"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </Transition>
    </div>

    <div
      class="profile-tabs"
      role="tablist"
      aria-label="切换游戏角色"
      @keydown="onTabKeydown"
    >
      <button
        v-for="(profile, index) in profiles"
        :id="`profile-tab-${profile.id}`"
        :key="profile.id"
        :ref="element => setTabRef(element, index)"
        type="button"
        role="tab"
        :aria-selected="activeIndex === index"
        aria-controls="profile-panel"
        :tabindex="activeIndex === index ? 0 : -1"
        :class="{ active: activeIndex === index }"
        @click="selectProfile(index)"
      >
        <span>0{{ index + 1 }}</span>
        <span class="tab-copy">
          <strong>{{ profile.shortGame }}</strong>
          <small>{{ profile.character }}</small>
        </span>
        <i aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const profiles = [
  {
    id: 'raiden',
    theme: 'genshin',
    game: '原神 / GENSHIN IMPACT',
    shortGame: '原神',
    character: '雷电将军',
    name: 'RAIDEN SHOGUN',
    world: 'TEYVAT / INAZUMA',
    code: 'ETERNITY',
    uid: '523689286',
    note: '于雷鸣之间守望永恒，也在每一次启程中寻找新的答案。',
    image: '/shrine-data/images/image (1).webp',
    accent: '#a78bfa',
    signal: '#e9c46a',
    surface: '#141021',
  },
  {
    id: 'ruan-mei',
    theme: 'starrail',
    game: '崩坏：星穹铁道 / HONKAI: STAR RAIL',
    shortGame: '崩坏：星穹铁道',
    character: '阮梅',
    name: 'RUAN MEI',
    world: 'ASTRAL EXPRESS',
    code: 'SIMULATED UNIVERSE',
    uid: '167855892',
    note: '循着星轨观察生命的回响，在寰宇里保留温柔而克制的好奇。',
    image: '/image/characters/ruan-mei.jpg',
    accent: '#d8b25a',
    signal: '#c4b5fd',
    surface: '#171226',
  },
  {
    id: 'ye-shunguang',
    theme: 'zenless',
    game: '绝区零 / ZENLESS ZONE ZERO',
    shortGame: '绝区零',
    character: '叶瞬光',
    name: 'YE SHUNGUANG',
    world: 'NEW ERIDU',
    code: 'AGENT RECORD',
    uid: '44724183',
    note: '穿过空洞与噪点，在新艾利都的失序日常里保持锋利。',
    image: '/image/characters/ye-shunguang.jpg',
    accent: '#e01b2e',
    signal: '#f0cf7a',
    surface: '#170d12',
  },
]

const activeIndex = ref(0)
const copiedId = ref('')
const tabRefs = []
let copyTimer

const activeProfile = computed(() => profiles[activeIndex.value])
const activeNumber = computed(() => String(activeIndex.value + 1).padStart(2, '0'))
const copyLabel = computed(() => copiedId.value === activeProfile.value.id ? '已复制' : '复制 UID')
const themeStyle = computed(() => ({
  '--roster-accent': activeProfile.value.accent,
  '--roster-signal': activeProfile.value.signal,
  '--roster-surface': activeProfile.value.surface,
}))

function setTabRef(element, index) {
  if (element) tabRefs[index] = element
}

function selectProfile(index, focus = false) {
  activeIndex.value = index
  copiedId.value = ''
  if (focus) tabRefs[index]?.focus()
}

function onTabKeydown(event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

  event.preventDefault()
  if (event.key === 'Home') return selectProfile(0, true)
  if (event.key === 'End') return selectProfile(profiles.length - 1, true)

  const direction = event.key === 'ArrowRight' ? 1 : -1
  selectProfile((activeIndex.value + direction + profiles.length) % profiles.length, true)
}

async function copyUid() {
  window.clearTimeout(copyTimer)
  const profile = activeProfile.value

  try {
    await navigator.clipboard.writeText(profile.uid)
    copiedId.value = profile.id
  } catch {
    copiedId.value = fallbackCopy(profile.uid) ? profile.id : ''
  }

  copyTimer = window.setTimeout(() => { copiedId.value = '' }, 1800)
}

function fallbackCopy(value) {
  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()

  let succeeded = false
  try {
    succeeded = document.execCommand('copy')
  } finally {
    input.remove()
  }
  return succeeded
}

onUnmounted(() => window.clearTimeout(copyTimer))
</script>

<style scoped>
.roster-section {
  position: relative;
  min-height: 820px;
  padding: 88px clamp(28px, 6vw, 96px) 54px;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  background: #0a0714;
  isolation: isolate;
  transition: background 0.45s var(--ease-out);
}

.roster-section::before {
  position: absolute;
  top: 0;
  right: 0;
  z-index: -1;
  width: 58%;
  height: 4px;
  content: '';
  background: var(--roster-accent);
  transform-origin: right;
}

.roster-grid {
  position: absolute;
  inset: 0;
  z-index: -2;
  opacity: 0.5;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 72px 72px;
}

.roster-chapter {
  position: absolute;
  top: 46px;
  right: 5vw;
  z-index: -1;
  color: rgba(255, 255, 255, 0.035);
  font-family: var(--font-display);
  font-size: 190px;
  line-height: 0.8;
}

.roster-heading {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(220px, 0.7fr);
  align-items: end;
  gap: 8px 40px;
  max-width: 1320px;
  margin: 0 auto 26px;
}

.roster-kicker {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--roster-signal);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
}

.roster-kicker span {
  width: 42px;
  height: 2px;
  background: currentColor;
}

.roster-heading h2 {
  color: var(--text-primary);
  font-size: 46px;
  line-height: 1;
}

.roster-heading > p:last-child {
  padding-bottom: 3px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: right;
}

.profile-stage {
  position: relative;
  max-width: 1320px;
  min-height: 530px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--roster-accent) 32%, var(--border));
  border-radius: var(--radius-lg);
  background: var(--roster-surface);
  transition: border-color 0.45s var(--ease-out), background 0.45s var(--ease-out);
}

.profile-frame {
  display: grid;
  grid-template-columns: minmax(310px, 0.82fr) minmax(420px, 1.18fr);
  min-height: 530px;
}

.profile-copy {
  position: relative;
  z-index: 3;
  display: flex;
  padding: 54px 24px 44px clamp(28px, 5vw, 72px);
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(9, 9, 12, 0.84);
}

.profile-sequence {
  display: flex;
  width: 112px;
  align-items: center;
  gap: 9px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
}

.profile-sequence span:first-child { color: var(--roster-signal); }
.profile-sequence i { height: 1px; flex: 1; background: rgba(255, 255, 255, 0.2); }

.game-name {
  margin-top: 48px;
  color: var(--roster-accent);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
}

.profile-copy h3 {
  margin-top: 12px;
  color: #f6f3e9;
  font-size: clamp(42px, 5vw, 72px);
  line-height: 0.95;
}

.character-name {
  margin-top: 10px;
  color: transparent;
  font-family: var(--font-display);
  font-size: clamp(18px, 2.2vw, 28px);
  -webkit-text-stroke: 1px color-mix(in srgb, var(--roster-accent) 68%, #fff);
}

.profile-note {
  max-width: 430px;
  margin-top: 28px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.85;
}

.profile-data {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 430px;
  margin-top: 30px;
  padding-top: 16px;
  gap: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-data dt {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
}

.profile-data dd {
  margin-top: 4px;
  color: #f6f3e9;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
}

.profile-data dd span {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--roster-signal);
  box-shadow: 0 0 9px var(--roster-signal);
}

.uid-command {
  display: grid;
  grid-template-columns: auto 1fr 18px auto;
  width: min(100%, 430px);
  min-height: 48px;
  margin-top: 24px;
  padding: 0 14px;
  align-items: center;
  gap: 12px;
  border: 1px solid color-mix(in srgb, var(--roster-accent) 44%, transparent);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.035);
  color: #f6f3e9;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background 0.22s var(--ease-out), border-color 0.22s var(--ease-out), transform 0.22s var(--ease-out);
}

.uid-command:hover,
.uid-command:focus-visible {
  border-color: var(--roster-signal);
  background: color-mix(in srgb, var(--roster-accent) 12%, transparent);
  outline: none;
  transform: translateY(-2px);
}

.uid-prefix,
.copy-state {
  color: var(--text-tertiary);
  font-size: 8px;
}

.uid-command strong {
  overflow: hidden;
  font-size: 13px;
  text-align: left;
  text-overflow: ellipsis;
}

.uid-command :deep(.app-icon) { color: var(--roster-signal); }

.profile-visual {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: var(--roster-surface);
}

.profile-visual::before {
  position: absolute;
  inset: 9% 8%;
  content: '';
  border: 1px solid color-mix(in srgb, var(--roster-accent) 23%, transparent);
}

.profile-visual img {
  position: absolute;
  z-index: 1;
  max-width: none;
  filter: drop-shadow(0 24px 28px rgba(0, 0, 0, 0.5));
}

.profile-visual .art-raiden {
  right: -13%;
  bottom: -9%;
  width: 126%;
  height: 116%;
  object-fit: contain;
  object-position: center bottom;
}

.profile-visual .art-ruan-mei {
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 64% center;
}

.profile-visual .art-ye-shunguang {
  right: -2%;
  bottom: -25%;
  width: 88%;
  height: 134%;
  object-fit: contain;
  object-position: center bottom;
}

.visual-code {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 2;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--roster-signal) 40%, transparent);
  background: rgba(8, 8, 11, 0.78);
  color: var(--roster-signal);
  font-family: var(--font-mono);
  font-size: 8px;
}

.visual-line {
  position: absolute;
  z-index: 2;
  display: block;
  background: var(--roster-signal);
}

.line-a { top: 10%; left: 5%; width: 70px; height: 2px; }
.line-b { right: 7%; bottom: 8%; width: 2px; height: 58px; }

.theme-zenless .profile-stage,
.theme-zenless .uid-command,
.theme-zenless .visual-code {
  border-radius: 2px;
}

.theme-zenless .profile-visual::before {
  inset: 7%;
  border-width: 2px;
  transform: skewX(-3deg);
}

.profile-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 1320px;
  margin: 12px auto 0;
  gap: 8px;
}

.profile-tabs button {
  position: relative;
  display: grid;
  grid-template-columns: 28px 1fr 36px;
  min-height: 74px;
  padding: 0 16px;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #111115;
  color: var(--text-tertiary);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.25s var(--ease-out), background 0.25s var(--ease-out), color 0.25s var(--ease-out);
}

.profile-tabs button > span:first-child {
  font-family: var(--font-mono);
  font-size: 9px;
}

.tab-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.tab-copy strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-copy small {
  font-family: var(--font-mono);
  font-size: 8px;
}

.profile-tabs i {
  width: 100%;
  height: 2px;
  background: var(--border);
  transform: scaleX(0.35);
  transform-origin: right;
  transition: background 0.25s var(--ease-out), transform 0.3s var(--ease-out);
}

.profile-tabs button:hover,
.profile-tabs button:focus-visible {
  border-color: color-mix(in srgb, var(--roster-accent) 45%, var(--border));
  color: var(--text-primary);
  outline: none;
}

.profile-tabs button.active {
  border-color: var(--roster-accent);
  background: color-mix(in srgb, var(--roster-accent) 11%, #111115);
  color: var(--roster-signal);
}

.profile-tabs button.active i {
  background: var(--roster-signal);
  transform: scaleX(1);
}

.profile-enter-active,
.profile-leave-active {
  transition: opacity 0.24s var(--ease-out), transform 0.34s var(--ease-out);
}

.profile-enter-from { opacity: 0; transform: translateX(22px); }
.profile-leave-to { opacity: 0; transform: translateX(-16px); }

@media (max-width: 900px) {
  .profile-frame { grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr); }
  .profile-copy { padding-left: 32px; }
  .profile-visual .art-ye-shunguang { right: -15%; width: 118%; }
}

@media (max-width: 768px) {
  .roster-section {
    min-height: 0;
    padding: 70px 16px 42px;
  }

  .roster-chapter { top: 48px; right: 10px; font-size: 112px; }

  .roster-heading {
    grid-template-columns: 1fr;
    margin-bottom: 22px;
  }

  .roster-heading h2 { font-size: 36px; }
  .roster-heading > p:last-child { text-align: left; }

  .profile-stage,
  .profile-frame { min-height: 760px; }

  .profile-frame {
    display: flex;
    flex-direction: column-reverse;
  }

  .profile-copy {
    min-height: 390px;
    padding: 30px 20px 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.09);
    border-right: 0;
  }

  .game-name { margin-top: 24px; }
  .profile-copy h3 { font-size: 44px; }
  .profile-note { margin-top: 18px; }
  .profile-data { margin-top: 20px; }
  .uid-command { margin-top: 18px; }

  .profile-visual { min-height: 370px; }
  .profile-visual .art-raiden { right: -9%; bottom: -8%; width: 116%; height: 116%; }
  .profile-visual .art-ruan-mei { object-position: 67% center; }
  .profile-visual .art-ye-shunguang { right: -1%; bottom: -38%; width: 80%; height: 154%; }

  .profile-tabs { grid-template-columns: 1fr; }
  .profile-tabs button { min-height: 58px; }
}

@media (max-width: 420px) {
  .profile-stage,
  .profile-frame { min-height: 730px; }
  .profile-copy { min-height: 390px; }
  .profile-visual { min-height: 340px; }
  .profile-copy h3 { font-size: 38px; }
  .copy-state { display: none; }
  .uid-command { grid-template-columns: auto 1fr 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .profile-enter-active,
  .profile-leave-active,
  .roster-section,
  .profile-stage { transition-duration: 0.01ms; }
}
</style>
