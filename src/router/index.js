import { createRouter, createWebHashHistory } from 'vue-router'
import Main from '@/views/Main.vue'

const routes = [
  {
    path: '/',
    name: 'defaul',
    component: Main,
  },
  {
    path: '/:roll',
    name: 'roll',
    component: Main,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
