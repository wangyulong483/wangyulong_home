import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',              name: 'Home',         component: () => import('@/views/Home.vue') },
  { path: '/about',         name: 'About',        component: () => import('@/views/About.vue') },
  { path: '/birthday',      name: 'Birthday',     component: () => import('@/views/Birthday.vue') },
  { path: '/birthdaylist',  name: 'BirthdayList', component: () => import('@/views/BirthdayList.vue') },
  // 应用
  { path: '/applist',       name: 'AppList',      component: () => import('@/views/AppList.vue') },
  { path: '/game',          name: 'Game',         component: () => import('@/views/Game.vue') },
  { path: '/hot-topics',    name: 'HotTopics',    component: () => import('@/views/HotTopics.vue') },
  { path: '/cooking',       name: 'Cooking',      component: () => import('@/views/Cooking.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
