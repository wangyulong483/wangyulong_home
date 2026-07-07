import { createRouter, createWebHistory } from 'vue-router'

// 懒加载：每个页面只在被访问时才加载，提升首屏速度
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
  },
  {
    path: '/birthday',
    name: 'Birthday',
    component: () => import('@/views/Birthday.vue'),
  },
  {
    path: '/birthdaylist',
    name: 'BirthdayList',
    component: () => import('@/views/BirthdayList.vue'),
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/Game.vue'),
  },
  {
    path: '/gamelist',
    name: 'GameList',
    component: () => import('@/views/GameList.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
