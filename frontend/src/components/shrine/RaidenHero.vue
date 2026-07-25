<!--
  雷电将军 Hero 区
  官方立绘 + 角色名 + 称号 + 金句 + 简介
  紫色发光边框，标题呼吸发光动画
-->
<template>
  <div class="raiden-hero">
    <div class="hero-card">
      <!-- 立绘区 -->
      <div class="hero-visual">
        <div class="avatar-frame">
          <img
            v-if="character.avatar && !imgError"
            :src="character.avatar"
            :alt="character.name"
            class="avatar-img"
            @error="imgError = true"
          />
          <!-- 无图片时的占位：三巴纹 -->
          <div v-else class="avatar-placeholder">
            <svg viewBox="0 0 100 100" class="mitsudomoe-svg">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
              <circle cx="50" cy="22" r="14" fill="currentColor" opacity="0.5"/>
              <circle cx="26" cy="64" r="14" fill="currentColor" opacity="0.5"/>
              <circle cx="74" cy="64" r="14" fill="currentColor" opacity="0.5"/>
            </svg>
            <span class="placeholder-text">立绘待添加</span>
          </div>
        </div>
      </div>

      <!-- 信息区 -->
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  character: { type: Object, required: true }
})

/* 图片加载失败时显示占位 */
const imgError = ref(false)
</script>

<style scoped>
.raiden-hero {
  position: relative;
  z-index: 1;
  margin-bottom: 28px;
}

.hero-card {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(107, 76, 154, 0.12), rgba(13, 13, 26, 0.6));
  border: 1px solid rgba(176, 136, 249, 0.25);
  border-radius: 20px;
  padding: 36px;
  /* 紫色发光边框 */
  box-shadow:
    0 0 20px rgba(176, 136, 249, 0.08),
    inset 0 1px 0 rgba(176, 136, 249, 0.06);
  transition: box-shadow 0.5s;
}

.hero-card:hover {
  box-shadow:
    0 0 32px rgba(176, 136, 249, 0.14),
    inset 0 1px 0 rgba(176, 136, 249, 0.1);
}

/* ====== 立绘区 ====== */
.hero-visual {
  flex-shrink: 0;
}

.avatar-frame {
  width: 180px;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(201, 169, 110, 0.3);
  box-shadow: 0 0 24px rgba(176, 136, 249, 0.12);
  background: rgba(13, 13, 26, 0.5);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #B088F9;
}

.mitsudomoe-svg {
  width: 72px;
  height: 72px;
  animation: breathe 3s ease-in-out infinite;
}

.placeholder-text {
  font-size: 0.8rem;
  color: rgba(176, 136, 249, 0.4);
}

/* ====== 信息区 ====== */
.hero-info {
  flex: 1;
  min-width: 0;
}

.char-name {
  font-size: 2.2rem;
  font-weight: 700;
  color: #C9A96E;
  margin: 0 0 6px;
  letter-spacing: 0.08em;
  /* 呼吸发光 */
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

/* ====== 为什么喜欢 ====== */
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

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .hero-card {
    flex-direction: column;
    align-items: center;
    padding: 24px 20px;
    gap: 20px;
  }

  .avatar-frame {
    width: 140px;
    height: 186px;
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
