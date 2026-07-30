<!--
  雷电将军 Hero 区
  透明底抠图立绘 + 角色信息 + 历年生日贺图轮播
-->
<template>
  <div class="raiden-hero">
    <!-- ===== 主视觉：抠图立绘 + 角色信息 ===== -->
    <div class="hero-main">
      <!-- 透明底抠图立绘，悬浮效果 -->
      <div class="hero-visual">
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
      </div>

      <!-- 角色信息 -->
      <div class="hero-info">
        <h1 class="char-name">{{ character.name }}</h1>
        <p class="char-title">{{ character.title }}</p>
        <blockquote class="char-quote">"{{ character.quote }}"</blockquote>

        <div class="char-meta">
          <span class="meta-tag" v-if="character.realName">本名：{{ character.realName }}</span>
          <span class="meta-tag" v-if="character.element">{{ character.element }}元素</span>
          <span class="meta-tag" v-if="character.weapon">{{ character.weapon }}</span>
          <span class="meta-tag" v-if="character.affiliation">{{ character.affiliation }}</span>
          <span class="meta-tag" v-if="character.birthday">生日 {{ character.birthday }}</span>
          <span class="meta-tag" v-if="character.constellation">命之座 {{ character.constellation }}</span>
        </div>

        <p class="char-bio">{{ character.bio }}</p>

        <div class="love-box">
          <span class="love-label">为什么喜欢她</span>
          <p class="love-text">{{ character.whyLove }}</p>
        </div>
      </div>
    </div>

    <!-- ===== 历年生日贺图画廊 ===== -->
    <section class="birthday-gallery" v-if="birthdays.length">
      <div class="carousel-header">
        <div>
          <p class="gallery-kicker">BIRTHDAY ARCHIVE / {{ String(birthdays.length).padStart(2, '0') }}</p>
          <h3>历年生日贺图</h3>
        </div>
        <p class="carousel-progress" aria-live="polite">
          <strong>{{ String(currentSlide + 1).padStart(2, '0') }}</strong>
          <span>/ {{ String(birthdays.length).padStart(2, '0') }}</span>
        </p>
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
                loading="eager"
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
              loading="eager"
              decoding="async"
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

function startAutoplay() {
  stopAutoplay()
  if (birthdays.value.length > 1) {
    autoplayTimer = setInterval(() => {
      nextSlide()
    }, 6000)
  }
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
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
  margin-bottom: 28px;
}

/* ====== 主视觉区 ====== */
.hero-main {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  margin-bottom: 32px;
}

/* ====== 抠图立绘 ====== */
.hero-visual {
  flex-shrink: 0;
}

.cutout-img {
  display: block;
  max-height: 480px;
  width: auto;
  /* 悬浮光晕 */
  filter: drop-shadow(0 0 24px rgba(176, 136, 249, 0.25)) drop-shadow(0 8px 32px rgba(13, 13, 26, 0.4));
  animation: float-cutout 4s ease-in-out infinite;
}

@keyframes float-cutout {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

.cutout-placeholder {
  width: 200px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B088F9;
  background: rgba(107, 76, 154, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(176, 136, 249, 0.15);
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

/* ====== 角色信息 ====== */
.hero-info {
  flex: 1;
  min-width: 0;
  padding-top: 8px;
}

.char-name {
  font-size: 2.2rem;
  font-weight: 700;
  color: #C9A96E;
  margin: 0 0 6px;
  letter-spacing: 0.08em;
  animation: name-glow 3s ease-in-out infinite;
}

@keyframes name-glow {
  0%, 100% { text-shadow: 0 0 8px rgba(201, 169, 110, 0.4); }
  50%      { text-shadow: 0 0 24px rgba(201, 169, 110, 0.8), 0 0 48px rgba(176, 136, 249, 0.3); }
}

.char-title {
  color: rgba(176, 136, 249, 0.8);
  font-size: 0.9rem;
  margin: 0 0 12px;
  letter-spacing: 0.04em;
}

.char-quote {
  margin: 0 0 16px;
  padding: 10px 16px;
  border-left: 3px solid #C9A96E;
  color: rgba(201, 169, 110, 0.85);
  font-style: italic;
  font-size: 0.95rem;
  background: rgba(201, 169, 110, 0.04);
  border-radius: 0 8px 8px 0;
}

.char-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-tag {
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(176, 136, 249, 0.1);
  border: 1px solid rgba(176, 136, 249, 0.2);
  color: rgba(176, 136, 249, 0.85);
}

.char-bio {
  color: rgba(220, 220, 240, 0.8);
  font-size: 0.9rem;
  line-height: 1.8;
  margin: 0 0 16px;
}

.love-box {
  background: rgba(176, 136, 249, 0.06);
  border: 1px solid rgba(176, 136, 249, 0.12);
  border-radius: 12px;
  padding: 14px 18px;
}

.love-label {
  font-size: 0.82rem;
  color: #B088F9;
  font-weight: 600;
}

.love-text {
  color: rgba(200, 190, 230, 0.75);
  font-size: 0.88rem;
  line-height: 1.7;
  margin: 8px 0 0;
}

/* ====== 生日贺图画廊 ====== */
.birthday-gallery {
  padding: 28px 0 4px;
  border-top: 1px solid rgba(176, 136, 249, 0.18);
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 18px;
}

.gallery-kicker {
  margin: 0 0 5px;
  color: rgba(176, 136, 249, 0.58);
  font-size: 0.68rem;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0;
}

.carousel-header h3 {
  margin: 0;
  color: rgba(232, 226, 244, 0.9);
  font-size: 1.12rem;
  line-height: 1.25;
  font-weight: 700;
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
  color: #C9A96E;
  font-size: 1.25rem;
  font-weight: 700;
}

.gallery-layout {
  display: grid;
  grid-template-columns: minmax(0, 620px) minmax(180px, 1fr);
  gap: 18px;
  align-items: stretch;
  max-width: 850px;
  margin: 0 auto;
}

.carousel-viewport {
  position: relative;
  min-width: 0;
  overflow: hidden;
  aspect-ratio: 1;
  border: 1px solid rgba(201, 169, 110, 0.18);
  border-radius: 6px;
  background: #0e0d1b;
  box-shadow: 0 18px 50px rgba(5, 4, 14, 0.32);
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
  color: #f1e4c8;
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
  border: 1px solid rgba(232, 226, 244, 0.24);
  border-radius: 50%;
  background: rgba(9, 8, 20, 0.64);
  color: rgba(245, 240, 250, 0.86);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
}

.carousel-btn--prev { left: 14px; }
.carousel-btn--next { right: 14px; }

.carousel-btn:hover:not(:disabled) {
  border-color: rgba(201, 169, 110, 0.7);
  background: rgba(17, 14, 34, 0.9);
  color: #C9A96E;
  transform: translateY(-50%) scale(1.06);
}

.carousel-btn:focus-visible,
.year-thumb:focus-visible {
  outline: 2px solid #C9A96E;
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
  border: 1px solid rgba(176, 136, 249, 0.12);
  border-radius: 5px;
  background: rgba(22, 19, 40, 0.58);
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
  background: #C9A96E;
  transform: scaleY(0);
  transition: transform 0.25s;
}

.year-thumb:hover,
.year-thumb.active {
  border-color: rgba(201, 169, 110, 0.35);
  background: rgba(40, 31, 62, 0.8);
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
  .hero-main {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .cutout-img {
    max-height: 320px;
  }

  .char-name {
    font-size: 1.6rem;
    text-align: center;
  }

  .char-title, .char-quote, .char-meta {
    text-align: center;
    justify-content: center;
  }

  .birthday-gallery {
    padding-top: 22px;
  }

  .carousel-header {
    align-items: center;
    margin-bottom: 14px;
  }

  .gallery-kicker {
    font-size: 0.62rem;
  }

  .carousel-header h3 {
    font-size: 1rem;
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
    flex: 0 0 88px;
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
  .carousel-track,
  .year-thumb,
  .year-thumb::before,
  .thumb-img,
  .carousel-btn {
    transition: none;
  }
}
</style>
