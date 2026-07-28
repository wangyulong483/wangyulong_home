import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',              name: 'Home',         component: () => import('@/views/Home.vue') },
  { path: '/about',         name: 'About',        component: () => import('@/views/About.vue') },
  // 应用
  { path: '/applist',       name: 'AppList',      component: () => import('@/views/AppList.vue') },
  { path: '/game',          name: 'Game',         component: () => import('@/views/Game.vue') },
  { path: '/hot-topics',    name: 'HotTopics',    component: () => import('@/views/HotTopics.vue') },
  { path: '/shrine',        name: 'Shrine',       component: () => import('@/views/Shrine.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router
