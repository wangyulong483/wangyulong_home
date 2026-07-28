/*
  共享状态 — Home.vue 写入，Sidebar.vue / App.vue 读取

  heroVisible: 是否在第一页（全屏视频页）
    true  = 第一页，video 全屏，sidebar 隐藏，无 body padding
    false = 第二页，内容页，sidebar 显示，body 有 200px 留白
*/
import { ref } from 'vue'

export const heroVisible = ref(false)
