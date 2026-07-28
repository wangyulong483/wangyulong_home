<template>
  <!-- 关于页面 — 项目视频展示 -->
  <div class="about-page">
    <!-- 头部 -->
    <div class="header">
      <h1>关于我</h1>
      <p class="subtitle">这里记录了我的一些项目和学习历程</p>
    </div>

    <!-- 视频画廊 -->
    <div class="video-gallery">
      <h2 class="gallery-title">
        <AppIcon icon="camera" size="20" /> 项目视频展示
        <span class="video-count">（{{ videos.length }} 个）</span>
      </h2>

      <div class="video-grid">
        <div
          v-for="(video, index) in videos"
          :key="index"
          class="video-card card card-interactive"
          :style="{ transitionDelay: index * 30 + 'ms' }"
          @click="openVideo(video)"
        >
          <!-- 缩略图 -->
          <div class="video-thumb">
            <img
              v-if="video.thumb"
              :src="video.thumb"
              :alt="`${video.title} 视频封面`"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="onCoverError(video)"
            />
            <div v-else class="thumb-placeholder" :class="{ 'is-published': video.bvid }">
              <AppIcon :icon="video.bvid ? 'camera' : 'cloud-download'" size="28" />
              <span v-if="!video.bvid">待上传</span>
              <span v-else-if="video.coverState === 'failed'">视频已发布</span>
              <span v-else>封面加载中</span>
            </div>
            <!-- 播放按钮覆盖层 -->
            <div class="play-overlay">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.9)">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </div>
            <!-- 时长标签 -->
            <span v-if="video.duration" class="duration-tag">{{ video.duration }}</span>
          </div>

          <!-- 标题 & 标签 -->
          <div class="video-info">
            <div class="video-title">{{ video.title }}</div>
            <div class="video-tags" v-if="video.tags">
              <span v-for="tag in video.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗播放器 -->
    <Teleport to="body">
      <div v-if="activeVideo" class="modal-overlay" @click.self="closeVideo">
        <div class="modal-content card">
          <button class="modal-close" @click="closeVideo" aria-label="关闭">&#10005;</button>
          <h3 class="modal-title">{{ activeVideo.title }}</h3>

          <div class="player-wrapper">
            <iframe
              v-if="activeVideo.bvid"
              :src="`//player.bilibili.com/player.html?bvid=${activeVideo.bvid}&page=1&autoplay=1`"
              scrolling="no"
              frameborder="no"
              allowfullscreen="true"
              class="bilibili-player"
            ></iframe>
            <div v-else class="player-empty">
              <AppIcon icon="cloud-download" size="32" />
              <p>视频正在上传中...</p>
              <p class="hint">请将视频上传至 B站 并填入 BV 号</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const videos = ref([
  { title: '人体追踪', bvid: '', tags: ['MediaPipe', 'AI'], duration: '', thumb: '' },
  { title: 'C51 流水灯', bvid: '', tags: ['嵌入式', 'C51'], duration: '', thumb: '' },
  { title: '摄像头 AI Demo', bvid: '', tags: ['OpenCV', 'AI'], duration: '', thumb: '' },
  { title: '摄像头巡线', bvid: '', tags: ['OpenCV', '机器人'], duration: '', thumb: '' },
  { title: '颜色识别', bvid: '', tags: ['OpenCV', '视觉'], duration: '', thumb: '' },
  { title: 'SLAM 建图', bvid: '', tags: ['SLAM', 'ROS2'], duration: '', thumb: '' },
  { title: '雷达数据获取', bvid: '', tags: ['激光雷达', 'ROS2'], duration: '', thumb: '' },
  { title: '摄像头初始化', bvid: '', tags: ['相机', '驱动'], duration: '', thumb: '' },
  { title: '原车摄像头初始化', bvid: '', tags: ['相机', '嵌入式'], duration: '', thumb: '' },
  { title: '实验室项目 2', bvid: '', tags: ['ROS2', 'Nav2'], duration: '', thumb: '' },
  { title: 'MediaPipe 舵机控制', bvid: '', tags: ['MediaPipe', '舵机'], duration: '', thumb: '' },
  { title: 'Nav2 导航', bvid: 'BV1dK3T6rEBA', tags: ['ROS2', 'Nav2', '导航'], duration: '', thumb: '/video-covers/nav2.jpg' },
  { title: '雷达地图', bvid: '', tags: ['激光雷达', 'SLAM'], duration: '', thumb: '' },
  { title: '远程遥控机器人', bvid: '', tags: ['ROS2', '遥控'], duration: '', thumb: '' },
  { title: 'Gazebo 仿真', bvid: 'BV1iK3T6rEnc', tags: ['Gazebo', 'ROS2', '仿真'], duration: '', thumb: '/video-covers/gazebo.jpg' },
  { title: '舵机控制', bvid: '', tags: ['舵机', '嵌入式'], duration: '', thumb: '' },
  { title: '巡线测试', bvid: '', tags: ['机器人', '巡线'], duration: '', thumb: '' },
  { title: '雷达使用', bvid: '', tags: ['激光雷达', 'ROS2'], duration: '', thumb: '' },
  { title: 'YOLOv5 训练', bvid: 'BV1h53T6KERN', tags: ['YOLO', 'AI', '训练'], duration: '', thumb: '/video-covers/yolov5.jpg' },
  { title: '首次机器人运行', bvid: '', tags: ['机器人', 'ROS2'], duration: '', thumb: '' },
].map(video => ({
  ...video,
  coverState: video.thumb ? 'ready' : video.bvid ? 'loading' : 'missing',
})))

// 自动获取 B站 视频封面
async function fetchCovers() {
  const needFetch = videos.value.filter(v => v.bvid && !v.thumb)
  if (needFetch.length === 0) return

  const results = await Promise.allSettled(
    needFetch.map(async (video) => {
      const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${video.bvid}`)
      if (!response.ok) throw new Error(`Bilibili API ${response.status}`)

      const data = await response.json()
      const pic = (data?.data?.pic || '').replace('http://', 'https://')
      if (!pic) throw new Error('Bilibili cover is unavailable')
      return { video, pic }
    })
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      result.value.video.thumb = result.value.pic
      result.value.video.coverState = 'ready'
    } else {
      needFetch[index].coverState = 'failed'
    }
  })
}

function onCoverError(video) {
  video.thumb = ''
  video.coverState = 'failed'
}

onMounted(fetchCovers)

// 弹窗播放器
const activeVideo = ref(null)

function openVideo(video) {
  document.body.style.overflow = 'hidden'
  activeVideo.value = video
}

function closeVideo() {
  document.body.style.overflow = ''
  activeVideo.value = null
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeVideo.value) closeVideo()
})
</script>

<style scoped>
.about-page {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* -------- 头部 -------- */
.header {
  text-align: center;
  padding: 36px 0 24px;
}

.header h1 {
  color: var(--text-primary);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-tertiary);
  font-size: 0.95rem;
  margin-top: 6px;
}

/* -------- 画廊标题 -------- */
.gallery-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-left: 4px;
}

.video-count {
  font-size: 0.82rem;
  color: var(--text-tertiary);
  font-weight: 400;
}

/* -------- 缩略图网格 -------- */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.video-card {
  padding: 0;
  overflow: hidden;
}

/* 缩略图容器 */
.video-thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--bg-input);
}

.video-thumb > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.video-card:hover .video-thumb > img {
  transform: scale(1.06);
}

/* 无缩略图占位 */
.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.thumb-placeholder.is-published {
  color: var(--accent);
  background: rgba(108, 92, 231, 0.06);
}

/* 播放覆盖层 */
.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.3s;
}

.video-card:hover .play-overlay {
  opacity: 1;
}

/* 时长标签 */
.duration-tag {
  position: absolute;
  bottom: 6px;
  right: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
}

/* 卡片文本 */
.video-info {
  padding: 12px 14px;
}

.video-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 0.93rem;
  line-height: 1.35;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* -------- 弹窗 -------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.25s ease;
}

.modal-content {
  position: relative;
  width: 90vw;
  max-width: 960px;
  padding: 20px 24px;
  animation: slideUp 0.3s var(--ease-spring);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 2;
}

.modal-close:hover {
  background: var(--accent);
  color: #fff;
}

.modal-title {
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-right: 36px;
  font-size: 1.1rem;
}

.player-wrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  background: #000;
}

.bilibili-player {
  width: 100%;
  height: 100%;
  border: none;
}

.player-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  color: var(--text-tertiary);
}

.player-empty .hint {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

/* ====== 动画 ====== */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .about-page { padding: 0 8px 30px; }
  .header { padding: 24px 0; }
  .header h1 { font-size: 1.6rem; }
  .subtitle { font-size: 0.9rem; }
  .gallery-title { font-size: 1.05rem; }
  .video-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }

  .modal-overlay { align-items: flex-end; }
  .modal-content {
    width: 100vw;
    max-width: 100vw;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: 14px 16px 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    animation: slideUpMobile 0.3s var(--ease-spring);
  }

  @keyframes slideUpMobile {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
}

@media (max-width: 480px) {
  .header h1 { font-size: 1.4rem; }
  .subtitle { font-size: 0.85rem; }
  .video-grid { grid-template-columns: 1fr; gap: 12px; }
  .video-title { font-size: 0.85rem; }
  .video-info { padding: 10px 12px; }
  .modal-title { font-size: 1rem; padding-right: 32px; }
}
</style>
