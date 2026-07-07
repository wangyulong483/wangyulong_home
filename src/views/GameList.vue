<template>
  <!--
    游戏列表页 — 玻璃卡片
  -->
  <div class="game_1 glass-card">
    <router-link to="/game" class="game-link"><AppIcon icon="plane" size="22" /> 飞机大战</router-link>
  </div>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue'
</script>

<style scoped>
.game_1 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 28px;
  margin: 20px auto;
  max-width: 800px;
}

.game-link {
  color: #5a4fcf;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.game-link:hover {
  transform: scale(1.1);
}
</style>
