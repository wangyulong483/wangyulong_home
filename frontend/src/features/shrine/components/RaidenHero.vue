<!--
  雷电将军 Hero 区
  透明底抠图立绘 + 角色信息 + 历年生日贺图轮播
-->
<template>
  <div class="raiden-hero">
    <!-- ===== 角色档案：立绘 + 结构化资料 ===== -->
    <div class="hero-main">
      <figure class="hero-visual">
        <div class="visual-rail" aria-hidden="true">
          <span>SUBJECT / 01</span>
          <span>ELECTRO ARCHON</span>
        </div>
        <img
          v-if="character.cutout && !cutoutError"
          :src="character.cutout"
          :alt="character.name"
          class="cutout-img"
          width="1200"
          height="1200"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          @error="onCutoutError"
        />
        <div v-else class="cutout-placeholder">
          <svg viewBox="0 0 100 100" class="mitsudomoe-svg">
            <circle cx="50" cy="22" r="14" fill="currentColor" opacity="0.5"/>
            <circle cx="26" cy="64" r="14" fill="currentColor" opacity="0.5"/>
            <circle cx="74" cy="64" r="14" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
        <figcaption class="visual-caption">
          <span>稻妻 · 一心净土</span>
          <strong>RAIDEN SHOGUN</strong>
        </figcaption>
      </figure>

      <div class="hero-info">
        <div class="profile-heading">
          <div>
            <p class="profile-kicker">ARCHON PROFILE / 01</p>
            <h2 class="char-name">{{ character.realName || character.name }}</h2>
            <p class="char-title">{{ character.title }}</p>
          </div>
          <span class="profile-state"><i></i> DATA VERIFIED</span>
        </div>

        <blockquote class="char-quote">
          <span>「</span>{{ character.quote }}<span>」</span>
        </blockquote>

        <dl class="char-meta">
          <div v-if="character.realName">
            <dt>TRUE NAME</dt>
            <dd>{{ character.realName }}</dd>
          </div>
          <div v-if="character.element">
            <dt>VISION</dt>
            <dd>{{ character.element }}元素</dd>
          </div>
          <div v-if="character.weapon">
            <dt>WEAPON</dt>
            <dd>{{ character.weapon }}</dd>
          </div>
          <div v-if="character.affiliation">
            <dt>REGION</dt>
            <dd>{{ character.affiliation }}</dd>
          </div>
          <div v-if="character.birthday">
            <dt>BIRTHDAY</dt>
            <dd>{{ character.birthday }}</dd>
          </div>
          <div v-if="character.constellation">
            <dt>CONSTELLATION</dt>
            <dd>{{ character.constellation }}</dd>
          </div>
        </dl>

        <div class="profile-copy">
          <section>
            <p class="copy-label">人物档案</p>
            <p class="char-bio">{{ character.bio }}</p>
          </section>
          <section class="love-section">
            <p class="copy-label"><AppIcon icon="heart" size="12" /> 厨力注释</p>
            <p class="love-text">{{ character.whyLove }}</p>
          </section>
        </div>

        <a
          class="profile-source"
          href="https://space.bilibili.com/401742377"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppIcon icon="link" size="12" />
          资料参照：原神官方角色资料与影像
          <AppIcon icon="arrow-right" size="12" />
        </a>
      </div>
    </div>

    <!-- ===== 历年生日贺图画廊 ===== -->
    <section class="birthday-gallery" v-if="birthdays.length">
      <div class="carousel-header">
        <div>
          <p class="gallery-kicker">BIRTHDAY ARCHIVE / {{ String(birthdays.length).padStart(2, '0') }}</p>
          <h3>历年生日贺图</h3>
          <p class="gallery-summary">按年份检索官方生日纪念视觉，保留原图比例与完整构图。</p>
        </div>
        <div class="archive-meta">
          <a
            href="https://space.bilibili.com/401742377"
            target="_blank"
            rel="noopener noreferrer"
            class="archive-source"
          >
            <AppIcon icon="link" size="11" /> 原神官方
          </a>
          <p class="carousel-progress" aria-live="polite">
            <strong>{{ String(currentSlide + 1).padStart(2, '0') }}</strong>
            <span>/ {{ String(birthdays.length).padStart(2, '0') }}</span>
          </p>
        </div>
      </div>

      <div
        class="gallery-layout"
        @mouseenter="stopAutoplay"
        @mouseleave="startAutoplay"
        @focusin="stopAutoplay"
        @focusout="startAutoplay"
      >
        <div
          class="carousel-viewport"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <figure
              v-for="(item, idx) in birthdays"
              :key="item.year"
              class="carousel-slide"
            >
              <img
                v-if="shouldLoadSlide(idx)"
                :src="item.image"
                :alt="`${item.year} 生日贺图`"
                class="birthday-img"
                width="1600"
                height="1600"
                :loading="idx === currentSlide ? 'eager' : 'lazy'"
                decoding="async"
                :fetchpriority="idx === currentSlide ? 'high' : 'low'"
              />
              <div v-else class="birthday-placeholder" aria-hidden="true"></div>
              <figcaption class="birthday-label">
                <span>{{ item.year }}</span>
                <small>雷电将军生日纪念</small>
              </figcaption>
            </figure>
          </div>

          <button
            class="carousel-btn carousel-btn--prev"
            type="button"
            @click="prevSlide"
            :disabled="birthdays.length <= 1"
            aria-label="上一张生日贺图"
            title="上一张"
          >
            <AppIcon icon="arrow-left" size="18" />
          </button>
          <button
            class="carousel-btn carousel-btn--next"
            type="button"
            @click="nextSlide"
            :disabled="birthdays.length <= 1"
            aria-label="下一张生日贺图"
            title="下一张"
          >
            <AppIcon icon="arrow-right" size="18" />
          </button>
        </div>

        <nav class="birthday-index" aria-label="生日贺图年份">
          <button
            v-for="(item, idx) in birthdays"
            :key="`thumb-${item.year}`"
            type="button"
            class="year-thumb"
            :class="{ active: idx === currentSlide }"
            @click="selectSlide(idx)"
            :aria-current="idx === currentSlide ? 'true' : undefined"
            :aria-label="`查看 ${item.year} 年生日贺图`"
          >
            <img
              :src="item.image"
              alt=""
              class="thumb-img"
              width="160"
              height="160"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
            <span class="thumb-year">{{ item.year }}</span>
            <span class="thumb-index">{{ String(idx + 1).padStart(2, '0') }}</span>
          </button>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

const props = defineProps({
  character: { type: Object, required: true }
})

/* 生日贺图列表 */
const birthdays = computed(() => {
  return props.character.birthdayIllustrations || []
})

/* 图片加载失败 */
const cutoutError = ref(false)
function onCutoutError() {
  cutoutError.value = true
}

/* 轮播状态 */
const currentSlide = ref(0)

function nextSlide() {
  if (birthdays.value.length > 1) {
    currentSlide.value = (currentSlide.value + 1) % birthdays.value.length
  }
}

function prevSlide() {
  if (birthdays.value.length > 1) {
    currentSlide.value = (currentSlide.value - 1 + birthdays.value.length) % birthdays.value.length
  }
}

function selectSlide(index) {
  currentSlide.value = index
  startAutoplay()
}

let touchStartX = 0

function onTouchStart(event) {
  touchStartX = event.changedTouches[0]?.clientX || 0
  stopAutoplay()
}

function onTouchEnd(event) {
  const touchEndX = event.changedTouches[0]?.clientX || 0
  const distance = touchEndX - touchStartX

  if (Math.abs(distance) > 48) {
    distance < 0 ? nextSlide() : prevSlide()
  }
  startAutoplay()
}

function shouldLoadSlide(index) {
  const length = birthdays.value.length
  if (length <= 3) return true
  const distance = Math.abs(index - currentSlide.value)
  return Math.min(distance, length - distance) <= 1
}

/* 自动轮播 */
let autoplayTimer = null

function carouselAutoplayEnabled() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function startAutoplay() {
  stopAutoplay()
  if (birthdays.value.length > 1 && carouselAutoplayEnabled()) {
    autoplayTimer = window.setInterval(() => {
      nextSlide()
    }, 6000)
  }
}

function stopAutoplay() {
  if (autoplayTimer) {
    window.clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(() => startAutoplay())
onUnmounted(() => stopAutoplay())

/* 如果生日贺图数据异步到达，重新启动轮播 */
watch(birthdays, () => {
  currentSlide.value = 0
  startAutoplay()
})
</script>

<style scoped>
.raiden-hero {
  position: relative;
  z-index: 1;
  margin-bottom: 26px;
}

/* ====== 角色档案 ====== */
.hero-main {
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1.18fr);
  min-height: 560px;
  margin: 0 -1px 30px;
  border-right: 1px solid rgba(182, 156, 255, 0.14);
  border-bottom: 1px solid rgba(182, 156, 255, 0.18);
  border-left: 1px solid rgba(182, 156, 255, 0.14);
  background: rgba(14, 13, 19, 0.72);
}

.hero-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 560px;
  margin: 0;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  background:
    linear-gradient(rgba(182, 156, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(182, 156, 255, 0.045) 1px, transparent 1px),
    radial-gradient(circle at 52% 42%, rgba(112, 75, 185, 0.22), transparent 56%),
    #0d0c12;
  background-size: 34px 34px, 34px 34px, auto, auto;
}

.hero-visual::before,
.hero-visual::after {
  position: absolute;
  z-index: 2;
  width: 28px;
  height: 28px;
  pointer-events: none;
  content: '';
}

.hero-visual::before {
  top: 42px;
  left: 14px;
  border-top: 1px solid var(--signal);
  border-left: 1px solid var(--signal);
}

.hero-visual::after {
  right: 14px;
  bottom: 42px;
  border-right: 1px solid rgba(182, 156, 255, 0.7);
  border-bottom: 1px solid rgba(182, 156, 255, 0.7);
}

.visual-rail {
  position: absolute;
  z-index: 3;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  padding: 10px 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(213, 204, 226, 0.42);
  font-family: var(--font-mono);
  font-size: 0.56rem;
}

.cutout-img {
  position: relative;
  z-index: 1;
  display: block;
  width: min(100%, 540px);
  height: auto;
  max-height: 520px;
  object-fit: contain;
  filter: drop-shadow(0 0 28px rgba(176, 136, 249, 0.22)) drop-shadow(0 18px 38px rgba(3, 2, 10, 0.5));
  animation: float-cutout 6s ease-in-out infinite;
}

@keyframes float-cutout {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}

.cutout-placeholder {
  width: 65%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  border: 1px solid rgba(176, 136, 249, 0.14);
  background: rgba(107, 76, 154, 0.08);
}

.mitsudomoe-svg {
  width: 80px;
  height: 80px;
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}

.visual-caption {
  position: absolute;
  z-index: 3;
  right: 15px;
  bottom: 12px;
  left: 15px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  color: rgba(224, 217, 234, 0.55);
  font-family: var(--font-mono);
  font-size: 0.57rem;
}

.visual-caption strong {
  color: rgba(234, 255, 87, 0.72);
  font-size: 0.58rem;
}

.hero-info {
  min-width: 0;
  padding: 34px 34px 28px;
}

.profile-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.profile-kicker {
  margin: 0 0 7px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
}

.char-name {
  margin: 0;
  color: var(--text-primary);
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
}

.char-title {
  margin: 9px 0 0;
  color: var(--text-tertiary);
  font-size: 0.72rem;
  line-height: 1.55;
}

.profile-state {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 6px 8px;
  border: 1px solid rgba(234, 255, 87, 0.28);
  border-radius: 3px;
  color: rgba(234, 255, 87, 0.75);
  font-family: var(--font-mono);
  font-size: 0.53rem;
  font-weight: 700;
}

.profile-state i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--signal);
  box-shadow: 0 0 8px rgba(234, 255, 87, 0.6);
}

.char-quote {
  margin: 24px 0 20px;
  padding: 13px 15px;
  border-left: 2px solid var(--signal);
  background: rgba(234, 255, 87, 0.035);
  color: rgba(235, 229, 241, 0.88);
  font-size: 1rem;
  line-height: 1.45;
  font-style: normal;
  font-weight: 650;
}

.char-quote span {
  color: var(--signal);
}

.char-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0 0 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.char-meta > div {
  min-width: 0;
  padding: 10px 11px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.char-meta dt {
  margin: 0 0 4px;
  color: rgba(182, 156, 255, 0.58);
  font-family: var(--font-mono);
  font-size: 0.5rem;
  font-weight: 700;
}

.char-meta dd {
  margin: 0;
  overflow: hidden;
  color: rgba(240, 236, 244, 0.86);
  font-size: 0.73rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-copy {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 22px;
}

.profile-copy section {
  min-width: 0;
}

.love-section {
  padding-left: 20px;
  border-left: 1px solid rgba(182, 156, 255, 0.16);
}

.copy-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px;
  color: rgba(182, 156, 255, 0.8);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 700;
}

.char-bio,
.love-text {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: rgba(201, 197, 207, 0.74);
  font-size: 0.76rem;
  line-height: 1.75;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
}

.love-text {
  color: rgba(211, 202, 224, 0.72);
}

.profile-source {
  display: flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  margin-top: 20px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  text-decoration: none;
  transition: color 0.2s;
}

.profile-source:hover {
  color: var(--signal);
}

/* ====== 生日贺图画廊 ====== */
.birthday-gallery {
  padding: 26px 0 4px;
  border-top: 1px solid rgba(182, 156, 255, 0.18);
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 16px;
}

.gallery-kicker {
  margin: 0 0 5px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0;
}

.carousel-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.15rem;
  line-height: 1.25;
  font-weight: 800;
}

.gallery-summary {
  margin: 7px 0 0;
  color: var(--text-tertiary);
  font-size: 0.67rem;
  line-height: 1.5;
}

.archive-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.archive-source {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  text-decoration: none;
  transition: color 0.2s;
}

.archive-source:hover {
  color: var(--signal);
}

.carousel-progress {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 0;
  color: rgba(200, 190, 230, 0.42);
  font-size: 0.72rem;
}

.carousel-progress strong {
  color: var(--signal);
  font-size: 1.25rem;
  font-weight: 700;
}

.gallery-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(230px, 0.72fr);
  gap: 12px;
  align-items: stretch;
  width: 100%;
}

.carousel-viewport {
  position: relative;
  min-width: 0;
  overflow: hidden;
  aspect-ratio: 1;
  border: 1px solid rgba(182, 156, 255, 0.18);
  border-radius: 4px;
  background: #0d0c12;
  touch-action: pan-y;
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.carousel-slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.carousel-slide::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 26%;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(8, 7, 18, 0.76));
}

.birthday-img,
.birthday-placeholder {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  display: block;
}

.birthday-img {
  object-fit: cover;
}

.birthday-placeholder {
  background: rgba(13, 13, 26, 0.7);
}

.birthday-label {
  position: absolute;
  z-index: 1;
  left: 20px;
  bottom: 17px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--text-primary);
}

.birthday-label span {
  font-size: 1.35rem;
  line-height: 1;
  font-weight: 700;
}

.birthday-label small {
  color: rgba(236, 229, 245, 0.68);
  font-size: 0.68rem;
}

.carousel-btn {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  transform: translateY(-50%);
  border: 1px solid rgba(232, 226, 244, 0.2);
  border-radius: 3px;
  background: rgba(9, 8, 14, 0.72);
  color: rgba(245, 240, 250, 0.86);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
}

.carousel-btn--prev { left: 14px; }
.carousel-btn--next { right: 14px; }

.carousel-btn:hover:not(:disabled) {
  border-color: var(--signal);
  background: rgba(17, 14, 34, 0.9);
  color: var(--signal);
  transform: translateY(-50%) scale(1.06);
}

.carousel-btn:focus-visible,
.year-thumb:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.birthday-index {
  display: grid;
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 9px;
  min-width: 0;
}

.year-thumb {
  position: relative;
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 0;
  padding: 7px 9px 7px 7px;
  overflow: hidden;
  border: 1px solid rgba(182, 156, 255, 0.12);
  border-radius: 3px;
  background: rgba(18, 17, 24, 0.78);
  color: rgba(218, 210, 232, 0.64);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 0.25s, background 0.25s, color 0.25s;
}

.year-thumb::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--signal);
  transform: scaleY(0);
  transition: transform 0.25s;
}

.year-thumb:hover,
.year-thumb.active {
  border-color: rgba(234, 255, 87, 0.4);
  background: rgba(234, 255, 87, 0.055);
  color: #efe7f6;
}

.year-thumb.active::before {
  transform: scaleY(1);
}

.thumb-img {
  width: 100%;
  aspect-ratio: 1;
  display: block;
  object-fit: cover;
  border-radius: 3px;
  filter: saturate(0.72) brightness(0.76);
  transition: filter 0.25s;
}

.year-thumb:hover .thumb-img,
.year-thumb.active .thumb-img {
  filter: saturate(1) brightness(1);
}

.thumb-year {
  font-size: 0.82rem;
  font-weight: 700;
}

.thumb-index {
  color: rgba(176, 136, 249, 0.38);
  font-size: 0.62rem;
  font-weight: 700;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .raiden-hero {
    margin-bottom: 20px;
  }

  .hero-main {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
    margin-right: 0;
    margin-bottom: 22px;
    margin-left: 0;
    border-right-color: rgba(182, 156, 255, 0.12);
    border-left-color: rgba(182, 156, 255, 0.12);
  }

  .hero-visual {
    min-height: 390px;
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  .cutout-img {
    width: min(100%, 430px);
    max-height: 380px;
  }

  .hero-info {
    padding: 24px 18px 20px;
  }

  .profile-heading {
    gap: 12px;
  }

  .char-name {
    font-size: 1.65rem;
  }

  .profile-state {
    padding: 5px 6px;
    font-size: 0;
  }

  .profile-state i {
    width: 7px;
    height: 7px;
  }

  .char-quote {
    margin: 18px 0 16px;
    font-size: 0.9rem;
  }

  .char-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 18px;
  }

  .char-meta > div {
    padding: 9px 10px;
  }

  .profile-copy {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .love-section {
    padding-top: 15px;
    padding-left: 0;
    border-top: 1px solid rgba(182, 156, 255, 0.14);
    border-left: 0;
  }

  .char-bio,
  .love-text {
    font-size: 0.74rem;
    -webkit-line-clamp: initial;
  }

  .profile-source {
    align-items: flex-start;
    max-width: 100%;
    line-height: 1.5;
  }

  .birthday-gallery {
    padding-top: 20px;
  }

  .carousel-header {
    align-items: center;
    margin-bottom: 14px;
  }

  .gallery-summary {
    max-width: 245px;
  }

  .archive-meta {
    align-items: flex-end;
    flex-direction: column-reverse;
    gap: 5px;
  }

  .archive-source {
    font-size: 0.52rem;
  }

  .carousel-progress strong {
    font-size: 1.05rem;
  }

  .gallery-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    width: 100%;
  }

  .carousel-viewport {
    width: 100%;
  }

  .birthday-label {
    left: 14px;
    bottom: 13px;
  }

  .birthday-label span {
    font-size: 1.1rem;
  }

  .carousel-btn {
    width: 34px;
    height: 34px;
  }

  .carousel-btn--prev { left: 9px; }
  .carousel-btn--next { right: 9px; }

  .birthday-index {
    display: flex;
    gap: 8px;
    padding: 2px 1px 8px;
    overflow-x: auto;
    scrollbar-width: none;
    scroll-snap-type: x proximity;
  }

  .birthday-index::-webkit-scrollbar {
    display: none;
  }

  .year-thumb {
    flex: 0 0 82px;
    grid-template-columns: 1fr;
    gap: 5px;
    padding: 5px 5px 7px;
    scroll-snap-align: start;
    text-align: center;
  }

  .year-thumb::before {
    inset: auto 5px 0;
    width: auto;
    height: 2px;
    transform: scaleX(0);
  }

  .year-thumb.active::before {
    transform: scaleX(1);
  }

  .thumb-year {
    font-size: 0.72rem;
  }

  .thumb-index {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cutout-img,
  .carousel-track,
  .year-thumb,
  .year-thumb::before,
  .thumb-img,
  .carousel-btn {
    transition: none;
  }
}
</style>
