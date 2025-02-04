import { createRouter, createWebHashHistory } from 'vue-router'
import Main from '@/views/Main.vue'

const routes = [
  {
    path: '/:roll',
    name: 'home',
    component: Main,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
