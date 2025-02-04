import { createRouter, createWebHashHistory } from 'vue-router'
import App from '@/App.vue'

const routes = [
  {
    path: '/game/:roll',
    name: 'game',
    component: App,
  },
  {
    path: '/',
    name: 'home',
    component: App,
  },
  {
    path: '/app/',
    name: 'app',
    component: App,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
