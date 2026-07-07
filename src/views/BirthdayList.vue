<template>
  <!--
    生日列表页 — 玻璃卡片 + 猫视频 + 寿星链接
  -->
  <div class="box_1 glass-card">
    <video src="/video/cat.mp4" controls width="100%"></video>
  </div>
  <div class="birthday_1 glass-card">
    <router-link to="/birthday" class="bd-link"><AppIcon icon="clover" size="20" /> 邵远熙</router-link>
  </div>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue'
</script>

<style scoped>
.box_1 {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

video {
  border-radius: 8px;
}

.birthday_1 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 18px;
  max-width: 800px;
  margin: 20px auto;
}

.bd-link {
  color: #5a4fcf;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.bd-link:hover {
  transform: scale(1.08);
}
</style>
