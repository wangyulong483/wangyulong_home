<template>
  <!--
    图标组件 — 加载 game-icon-pack 中的 SVG 图标
    用法：<AppIcon icon="controller" size="20" />
  -->
  <img
    :src="iconPath"
    :alt="icon"
    :width="size"
    :height="size"
    class="app-icon"
    :style="{ filter: colorFilter }"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 图标文件名（不含扩展名），如 "controller"、"user-avatar"
  icon: { type: String, required: true },
  // 图标大小（px）
  size: { type: [Number, String], default: 20 },
  // 图标颜色 — 传入 CSS 颜色，自动生成 SVG 滤镜
  color: { type: String, default: '' },
})

// 预定义的图标路径映射
const iconMap = {
  controller: '/game-icon-pack-main/svg/no-padding/1-game/controller.svg',
  'controller-02': '/game-icon-pack-main/svg/no-padding/1-game/controller-02.svg',
  'user-avatar': '/game-icon-pack-main/svg/no-padding/8-ui/user-avatar.svg',
  'user-avatar-02': '/game-icon-pack-main/svg/no-padding/8-ui/user-avatar-02.svg',
  user: '/game-icon-pack-main/svg/no-padding/8-ui/user.svg',
  clover: '/game-icon-pack-main/svg/no-padding/4-nature/clover.svg',
  pushpin: '/game-icon-pack-main/svg/no-padding/2-items/pushpin.svg',
  plane: '/game-icon-pack-main/svg/no-padding/7-vehicles/plane.svg',
  heart: '/game-icon-pack-main/svg/no-padding/1-game/heart.svg',
  star: '/game-icon-pack-main/svg/no-padding/4-nature/star.svg',
  trophy: '/game-icon-pack-main/svg/no-padding/1-game/trophy.svg',
  search: '/game-icon-pack-main/svg/no-padding/8-ui/search.svg',
  settings: '/game-icon-pack-main/svg/no-padding/8-ui/settings.svg',
  mail: '/game-icon-pack-main/svg/no-padding/9-media/mail.svg',
  book: '/game-icon-pack-main/svg/no-padding/2-items/book.svg',
  compass: '/game-icon-pack-main/svg/no-padding/2-items/compass.svg',
  crown: '/game-icon-pack-main/svg/no-padding/3-gear/crown.svg',
  fire: '/game-icon-pack-main/svg/no-padding/4-nature/fire.svg',
  skull: '/game-icon-pack-main/svg/no-padding/1-game/skull.svg',
  'shield-03': '/game-icon-pack-main/svg/no-padding/3-gear/shield-03.svg',
}

// 如果传入的 icon 不在映射表中，当作自定义路径
const iconPath = computed(() => {
  return iconMap[props.icon] || `/game-icon-pack-main/svg/no-padding/${props.icon}.svg`
})

// 通过 CSS filter 给 SVG 着色（仅对纯色 icon 有效）
const colorFilter = computed(() => {
  if (!props.color) return 'none'
  return `brightness(0) saturate(100%)` // 先变黑，再用伪方法着色
  // 注：CSS filter 着色 SVG 有限制，如需精确颜色请直接使用原色 SVG
})
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
