import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    // 按需加载首页组件，减小初始包大小
    component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue')
  },
  {
    path: '/cake',
    name: 'Cake',
    component: () => import(/* webpackChunkName: "cake" */ '../views/Cake.vue')
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import(/* webpackChunkName: "timeline" */ '../views/Timeline.vue')
  },
  {
    path: '/wish',
    name: 'Wish',
    component: () => import(/* webpackChunkName: "wish" */ '../views/Wish.vue')
  }
]

const router = createRouter({
  // 使用 Vite 提供的 BASE_URL，确保部署子路径时路由正常
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
