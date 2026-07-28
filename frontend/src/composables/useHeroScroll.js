/*
  共享滚动状态 — Home.vue 写入，Sidebar.vue / App.vue 读取

  heroScroll:      0 = 页面顶部, 1 = hero 完全滚过
  heroVisible:     hero 是否在视口中
  videoOpacity:    视频透明度 1 → 0（随滚动线性淡出）
  sidebarOpacity:  侧边栏透明度 0 → 1（视频淡出到一定程度后出现）
  contentOpacity:  首页内容区透明度 0 → 1（最后出现）
*/
import { ref } from 'vue'

export const heroScroll = ref(0)
export const heroVisible = ref(true)

// 新增：由 Home.vue 的 scroll handler 计算并写入
export const videoOpacity = ref(1)
export const sidebarOpacity = ref(0)
export const contentOpacity = ref(0)
