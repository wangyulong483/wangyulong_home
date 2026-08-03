import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',              name: 'Home',         component: () => import('@/pages/Home.vue') },
  { path: '/about',         name: 'About',        component: () => import('@/pages/About.vue') },
  // 应用
  { path: '/applist',       name: 'AppList',      component: () => import('@/pages/AppList.vue') },
  { path: '/game',          name: 'Game',         component: () => import('@/pages/Game.vue') },
  { path: '/hot-topics',    name: 'HotTopics',    component: () => import('@/pages/HotTopics.vue') },
  { path: '/shrine',        name: 'Shrine',       component: () => import('@/pages/Shrine.vue') },
  { path: '/map-zone-painter', name: 'MapZonePainter', component: () => import('@/pages/MapZonePainter.vue') },
  { path: '/tutoring', name: 'Tutoring', component: () => import('@/pages/Tutoring.vue') },
  { path: '/tutoring/math-7-1/chapter-2', name: 'RationalOperationsLesson', component: () => import('@/pages/RationalOperationsLesson.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router
