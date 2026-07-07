<template>
  <!--
    关于页面
    液态玻璃头部 + 玻璃卡片视频画廊
  -->
  <div class="about-page">
    <!-- 头部 — 液态玻璃 -->
    <div class="header liquid-glass">
      <h1>关于我</h1>
      <p class="subtitle">这里记录了我的一些项目和学习历程</p>
    </div>

    <!-- 视频画廊 -->
    <div class="video-gallery">
      <h2 class="gallery-title">项目视频展示</h2>
      <div class="video-grid">
        <div
          v-for="(video, index) in videos"
          :key="video.name"
          class="video-card glass-card"
          :style="{ transitionDelay: index * 30 + 'ms' }"
        >
          <video controls :src="video.path" class="video-player" preload="metadata">
            您的浏览器不支持视频播放
          </video>
          <div class="video-title">{{ video.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const videos = ref([
  { name: 'bodytracking', path: '/about_source/BodyTrackingWithoutGesture_20260307_162025.mp4', title: '人体追踪' },
  { name: 'c51', path: '/about_source/C51WaterfallLight_20251227_212532.mp4', title: 'C51 流水灯' },
  { name: 'camai', path: '/about_source/CamAiDemo_20260227_180014.mp4', title: '摄像头 AI Demo' },
  { name: 'camline', path: '/about_source/CamLineFollower_20260223_181804.mp4', title: '摄像头巡线' },
  { name: 'color', path: '/about_source/ColorRecognition_20251124_210606.mp4', title: '颜色识别' },
  { name: 'createmap', path: '/about_source/CreateMap_20251227_113827.mp4', title: '建图' },
  { name: 'radar', path: '/about_source/GetRadar_20251207_213724.mp4', title: '雷达数据获取' },
  { name: 'initcam', path: '/about_source/InitCam_20251114_114250.mp4', title: '摄像头初始化' },
  { name: 'origincar', path: '/about_source/InitOrigincarCam_20260201_220723.mp4', title: '原车摄像头初始化' },
  { name: 'lab', path: '/about_source/LabSecond_20251125_192553.mp4', title: '实验室项目2' },
  { name: 'mediapipe', path: '/about_source/MediapipeServo_20260204_144800.mp4', title: 'MediaPipe 舵机控制' },
  { name: 'nav2', path: '/about_source/Nav2_20251207_124937.mp4', title: 'Nav2 导航' },
  { name: 'radarmap', path: '/about_source/RadarMap_1766658219087_83.mp4', title: '雷达地图' },
  { name: 'remote', path: '/about_source/RemoteRobot_20251215_194318.mp4', title: '远程遥控机器人' },
  { name: 'gazebo', path: '/about_source/RobotGazebo_20251206_180924.mp4', title: 'Gazebo 仿真' },
  { name: 'servo', path: '/about_source/Servo.mp4', title: '舵机控制' },
  { name: 'tryline', path: '/about_source/TryLineFollower_20260220_192435.mp4', title: '巡线测试' },
  { name: 'useradar', path: '/about_source/UseRadar_20251207_221341.mp4', title: '雷达使用' },
  { name: 'yolov5', path: '/about_source/Yolov5Train_20251129_183653.mp4', title: 'YOLOv5 训练' },
  { name: 'firstrun', path: '/about_source/firstRobotRun_20251213_184229.mp4', title: '首次机器人运行' },
])
</script>

<style scoped>
.about-page {
  max-width: 1050px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* -------- 头部 -------- */
.header {
  text-align: center;
  padding: 24px 0;
  margin-bottom: 24px;
}

.header h1 {
  color: #5a4fcf;
  font-size: 2.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-top: 5px;
  position: relative;
  z-index: 2;
}

/* -------- 画廊 -------- */
.gallery-title {
  color: #5a4fcf;
  margin-bottom: 16px;
  padding-left: 4px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* -------- 视频卡片（使用全局 glass-card + 局部增强） -------- */
.video-card {
  padding: 0;
  overflow: hidden;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-6px) scale(1.02);
}

.video-player {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #000;
  display: block;
}

.video-title {
  padding: 12px 16px;
  font-weight: 600;
  color: #333;
  position: relative;
  z-index: 2;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .header { padding: 18px 0 }
  .header h1 { font-size: 1.8rem }
  .video-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px }
}

@media (max-width: 480px) {
  .header h1 { font-size: 1.5rem }
  .subtitle { font-size: 0.9rem }
  .video-grid { grid-template-columns: 1fr; gap: 12px }
}
</style>
