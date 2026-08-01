<template>
  <!--
    图标组件 — 加载 game-icon-pack 中的 SVG 图标
    用法：<AppIcon icon="controller" size="20" />
  -->
  <span
    class="app-icon"
    role="img"
    :aria-label="icon"
    :style="{
      width: iconSize,
      height: iconSize,
      color: color || 'currentColor',
      '--icon-url': `url(${iconPath})`,
    }"
  ></span>
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

// 预定义的图标路径映射（game-icon-pack SVG 图标）
const iconMap = {
  // 1-game
  controller: '/game-icon-pack-main/svg/no-padding/1-game/controller.svg',
  'controller-02': '/game-icon-pack-main/svg/no-padding/1-game/controller-02.svg',
  heart: '/game-icon-pack-main/svg/no-padding/1-game/heart.svg',
  trophy: '/game-icon-pack-main/svg/no-padding/1-game/trophy.svg',
  skull: '/game-icon-pack-main/svg/no-padding/1-game/skull.svg',
  // 2-items — 物品
  pushpin: '/game-icon-pack-main/svg/no-padding/2-items/pushpin.svg',
  book: '/game-icon-pack-main/svg/no-padding/2-items/book.svg',
  compass: '/game-icon-pack-main/svg/no-padding/2-items/compass.svg',
  bullhorn: '/game-icon-pack-main/svg/no-padding/2-items/bullhorn.svg',
  binoculars: '/game-icon-pack-main/svg/no-padding/2-items/binoculars.svg',
  wrench: '/game-icon-pack-main/svg/no-padding/2-items/wrench.svg',
  magnet: '/game-icon-pack-main/svg/no-padding/2-items/magnet.svg',
  'tool-kit': '/game-icon-pack-main/svg/no-padding/2-items/tool-kit.svg',
  // 3-gear — 装备
  crown: '/game-icon-pack-main/svg/no-padding/3-gear/crown.svg',
  'shield-03': '/game-icon-pack-main/svg/no-padding/3-gear/shield-03.svg',
  // 4-nature — 自然
  clover: '/game-icon-pack-main/svg/no-padding/4-nature/clover.svg',
  star: '/game-icon-pack-main/svg/no-padding/4-nature/star.svg',
  fire: '/game-icon-pack-main/svg/no-padding/4-nature/fire.svg',
  lightning: '/game-icon-pack-main/svg/no-padding/4-nature/lightning.svg',
  // 6-buildings — 建筑/标记
  target: '/game-icon-pack-main/svg/no-padding/6-buildings/target.svg',
  'target-02': '/game-icon-pack-main/svg/no-padding/6-buildings/target-02.svg',
  // 5-food — 食物/餐具
  tableware: '/game-icon-pack-main/svg/no-padding/5-food/tableware.svg',
  // 7-vehicles — 载具
  plane: '/game-icon-pack-main/svg/no-padding/7-vehicles/plane.svg',
  rocket: '/game-icon-pack-main/svg/no-padding/7-vehicles/rocket.svg',
  // 8-ui — 用户界面
  'user-avatar': '/game-icon-pack-main/svg/no-padding/8-ui/user-avatar.svg',
  'user-avatar-02': '/game-icon-pack-main/svg/no-padding/8-ui/user-avatar-02.svg',
  user: '/game-icon-pack-main/svg/no-padding/8-ui/user.svg',
  search: '/game-icon-pack-main/svg/no-padding/8-ui/search.svg',
  settings: '/game-icon-pack-main/svg/no-padding/8-ui/settings.svg',
  'arrow-left': '/game-icon-pack-main/svg/no-padding/8-ui/arrow-left.svg',
  'arrow-right': '/game-icon-pack-main/svg/no-padding/8-ui/arrow-right.svg',
  'arrow-down': '/game-icon-pack-main/svg/no-padding/8-ui/arrow-down.svg',
  // 9-media — 媒体/通讯/科技
  mail: '/game-icon-pack-main/svg/no-padding/9-media/mail.svg',
  camera: '/game-icon-pack-main/svg/no-padding/9-media/camera.svg',
  microchip: '/game-icon-pack-main/svg/no-padding/9-media/microchip.svg',
  'wi-fi': '/game-icon-pack-main/svg/no-padding/9-media/wi-fi.svg',
  calendar: '/game-icon-pack-main/svg/no-padding/9-media/calendar.svg',
  clock: '/game-icon-pack-main/svg/no-padding/9-media/clock.svg',
  document: '/game-icon-pack-main/svg/no-padding/9-media/document.svg',
  paper: '/game-icon-pack-main/svg/no-padding/9-media/paper.svg',
  code: '/game-icon-pack-main/svg/no-padding/9-media/code.svg',
  message: '/game-icon-pack-main/svg/no-padding/9-media/message.svg',
  share: '/game-icon-pack-main/svg/no-padding/9-media/share.svg',
  link: '/game-icon-pack-main/svg/no-padding/9-media/link.svg',
  'link-02': '/game-icon-pack-main/svg/no-padding/9-media/link-02.svg',
  tag: '/game-icon-pack-main/svg/no-padding/9-media/tag.svg',
  earth: '/game-icon-pack-main/svg/no-padding/9-media/earth.svg',
  'cloud-download': '/game-icon-pack-main/svg/no-padding/9-media/cloud-download.svg',
  upload: '/game-icon-pack-main/svg/no-padding/9-media/upload.svg',
  download: '/game-icon-pack-main/svg/no-padding/9-media/download.svg',
  trash: '/game-icon-pack-main/svg/no-padding/9-media/trash.svg',
  folder: '/game-icon-pack-main/svg/no-padding/9-media/folder.svg',
  connection: '/game-icon-pack-main/svg/no-padding/9-media/connection.svg',
  image: '/game-icon-pack-main/svg/no-padding/9-media/image.svg',
  bug: '/game-icon-pack-main/svg/no-padding/9-media/bug.svg',
  // 10-editing — 地图绘制工具
  brush: '/game-icon-pack-main/svg/no-padding/10-editing/brush.svg',
  eraser: '/game-icon-pack-main/svg/no-padding/10-editing/eraser.svg',
  fill: '/game-icon-pack-main/svg/no-padding/10-editing/fill.svg',
  select: '/game-icon-pack-main/svg/no-padding/10-editing/select.svg',
  undo: '/game-icon-pack-main/svg/no-padding/10-editing/undo.svg',
  redo: '/game-icon-pack-main/svg/no-padding/10-editing/redo.svg',
  palette: '/game-icon-pack-main/svg/no-padding/10-editing/palette.svg',
  'cursor-move': '/game-icon-pack-main/svg/no-padding/10-editing/cursor-move.svg',
  // 通用工具图标
  map: '/game-icon-pack-main/svg/no-padding/2-items/map.svg',
  save: '/game-icon-pack-main/svg/no-padding/8-ui/save.svg',
  refresh: '/game-icon-pack-main/svg/no-padding/8-ui/refresh.svg',
  grid: '/game-icon-pack-main/svg/no-padding/8-ui/grid.svg',
  'zoom-in': '/game-icon-pack-main/svg/no-padding/8-ui/zoom-in.svg',
  'zoom-out': '/game-icon-pack-main/svg/no-padding/8-ui/zoom-out.svg',
  visible: '/game-icon-pack-main/svg/no-padding/8-ui/visible.svg',
  invisible: '/game-icon-pack-main/svg/no-padding/8-ui/invisible.svg',
  plus: '/game-icon-pack-main/svg/no-padding/11-symbols/plus.svg',
  minus: '/game-icon-pack-main/svg/no-padding/11-symbols/minus.svg',
}

// 如果传入的 icon 不在映射表中，当作自定义路径（相对于 svg/no-padding/）
const iconPath = computed(() => {
  return iconMap[props.icon] || `/game-icon-pack-main/svg/no-padding/${props.icon}.svg`
})

const iconSize = computed(() => {
  const value = String(props.size)
  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value
})
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask-image: var(--icon-url);
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-image: var(--icon-url);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
</style>
