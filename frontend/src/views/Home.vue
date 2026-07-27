<template>
  <!--
    首页
    包含：液态玻璃头部、图片轮播、格言、玻璃卡片内容区
  -->
  <div class="home-page">
    <!-- 头部 — 液态玻璃 -->
    <div class="header liquid-glass">
      <h1>HELLO WORLD</h1>
    </div>

    <!-- 图片轮播 -->
    <Carousel />

    <!-- 格言区 -->
    <div class="saying-section">
      <hr />
      <p class="saying">
        <b><i>谁终将声震人间，必长久深自缄默；谁终将点燃闪电，必长久如云漂泊</i></b>
      </p>
      <hr />
    </div>

    <!-- 关于网站 — 玻璃卡片 -->
    <div class="content-card glass-card">
      <h3>关于 MY_WEBSITE</h3>
      <ul>
        <li>它记录我的学习，它见证我的成长</li>
        <li>他记录现在的我的无知与浅薄，让未来的我嘲笑自己的狂妄</li>
        <li>也许未来它会用到别的地方</li>
        <li>......</li>
      </ul>
    </div>

    <!-- 学习平台 — 玻璃卡片 -->
    <div class="content-card glass-card">
      <h3>学习平台</h3>
      <ul class="platform-list">
        <li><a href="https://www.bilibili.com/" target="_blank" class="platform-link">哔哩哔哩</a></li>
        <li><a href="https://www.csdn.net/" target="_blank" class="platform-link">CSDN</a></li>
        <li><a href="https://www.runoob.com/" target="_blank" class="platform-link">菜鸟教程</a></li>
        <li><a href="https://fishros.org.cn/" target="_blank" class="platform-link">鱼香 ROS</a></li>
        <li><a href="https://forum.d-robotics.cc/" target="_blank" class="platform-link">地瓜机器人社区</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import Carousel from '@/components/Carousel.vue'
</script>

<style scoped>
.home-page {
  max-width: 800px;
  margin: 0 auto;
}

/* -------- 头部 -------- */
.header {
  text-align: center;
  padding: 20px 0;
  height: 90px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  color: #5a4fcf;
  font-size: 2.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

/* -------- 格言区 -------- */
.saying-section {
  max-width: 700px;
  margin: 20px auto;
  text-align: center;
}

.saying {
  margin: 10px 0;
}

/* -------- 玻璃卡片内容区 -------- */
.content-card {
  max-width: 700px;
  margin: 20px auto;
  padding: 24px 28px;
}

.content-card h3 {
  color: #5a4fcf;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.content-card ul {
  padding-left: 20px;
}

.content-card li {
  margin: 8px 0;
}

/* -------- 学习平台链接 -------- */
.platform-list {
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.platform-link {
  display: inline-block;
  padding: 8px 18px;
  background: rgba(90, 79, 207, 0.08);
  border-radius: 20px;
  color: #5a4fcf;
  transition: all 0.3s ease;
  font-weight: 500;
}

.platform-link:hover {
  background: rgba(90, 79, 207, 0.18);
  transform: translateY(-2px);
  text-decoration: none;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .home-page {
    padding: 0 8px;
  }

  .header { height: 72px; padding: 14px 0; margin-bottom: 14px }
  .header h1 { font-size: 1.8rem }
  .saying { font-size: 0.95rem; padding: 0 10px }
  .content-card { padding: 18px 20px; margin: 14px auto }
  .content-card h3 { font-size: 1.05rem }
  .platform-link { padding: 8px 16px; font-size: 0.9rem; min-height: 44px }
}

@media (max-width: 480px) {
  .header { height: 64px; padding: 10px 0 }
  .header h1 { font-size: 1.5rem }
  .saying { font-size: 0.85rem; padding: 0 8px }
  .saying-section { margin: 14px auto }
  .content-card { padding: 14px 16px; margin: 10px auto }
  .content-card li { font-size: 0.9rem; margin: 6px 0 }
  .platform-link { padding: 6px 14px; font-size: 0.82rem }
}
</style>
