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
          v-if="character.cutout"
          :src="character.cutout"
          :alt="character.name"
          class="cutout-img"
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
        </div>

        <p class="char-bio">{{ character.bio }}</p>

        <div class="love-box">
          <span class="love-label">💜 为什么喜欢她</span>
          <p class="love-text">{{ character.whyLove }}</p>
        </div>
      </div>
    </div>

    <!-- ===== 历年生日贺图轮播 ===== -->
    <div class="birthday-carousel" v-if="birthdays.length">
      <div class="carousel-header">
        <h3>🎂 历年生日贺图</h3>
        <div class="carousel-controls">
          <button class="carousel-btn" @click="prevSlide" :disabled="birthdays.length <= 1">◀</button>
          <span class="carousel-year">{{ birthdays[currentSlide]?.year }}</span>
          <button class="carousel-btn" @click="nextSlide" :disabled="birthdays.length <= 1">▶</button>
        </div>
      </div>

      <div class="carousel-viewport">
        <div
          class="carousel-track"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <div
            v-for="(item, idx) in birthdays"
            :key="item.year"
            class="carousel-slide"
          >
            <img
              :src="item.image"
              :alt="`${item.year} 生日贺图`"
              class="birthday-img"
              loading="lazy"
            />
            <span class="birthday-label">{{ item.year }}</span>
          </div>
        </div>
      </div>

      <!-- 指示点 -->
      <div class="carousel-dots" v-if="birthdays.length > 1">
        <button
          v-for="(item, idx) in birthdays"
          :key="item.year"
          class="dot"
          :class="{ active: idx === currentSlide }"
          @click="currentSlide = idx"
          :aria-label="`切换到 ${item.year} 年`"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

/* 自动轮播 */
let autoplayTimer = null

function startAutoplay() {
  stopAutoplay()
  if (birthdays.value.length > 1) {
    autoplayTimer = setInterval(() => {
      nextSlide()
    }, 4000)
  }
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

import { onMounted, onUnmounted, watch } from 'vue'

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

/* ====== 生日贺图轮播 ====== */
.birthday-carousel {
  background: rgba(107, 76, 154, 0.06);
  border: 1px solid rgba(176, 136, 249, 0.12);
  border-radius: 16px;
  padding: 20px 24px;
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.carousel-header h3 {
  margin: 0;
  font-size: 1rem;
  color: rgba(200, 190, 230, 0.8);
  font-weight: 600;
}

.carousel-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.carousel-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(176, 136, 249, 0.2);
  background: rgba(176, 136, 249, 0.08);
  color: rgba(200, 190, 230, 0.6);
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.carousel-btn:hover:not(:disabled) {
  border-color: rgba(176, 136, 249, 0.4);
  color: #B088F9;
  background: rgba(176, 136, 249, 0.15);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-year {
  font-size: 0.9rem;
  font-weight: 700;
  color: #C9A96E;
  min-width: 48px;
  text-align: center;
}

/* 轮播视口 */
.carousel-viewport {
  overflow: hidden;
  border-radius: 10px;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.carousel-slide {
  min-width: 100%;
  position: relative;
}

.birthday-img {
  width: 100%;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  display: block;
  border-radius: 10px;
}

.birthday-label {
  position: absolute;
  bottom: 10px;
  right: 12px;
  font-size: 0.78rem;
  padding: 3px 12px;
  border-radius: 10px;
  background: rgba(13, 13, 26, 0.7);
  color: #C9A96E;
  font-weight: 600;
}

/* 指示点 */
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(176, 136, 249, 0.2);
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.dot.active {
  background: #B088F9;
  box-shadow: 0 0 6px rgba(176, 136, 249, 0.5);
  width: 20px;
  border-radius: 4px;
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
}
</style>
