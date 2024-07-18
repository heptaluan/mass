import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import {useCookies} from "@vueuse/integrations/useCookies";


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    component: () => import('@/views/layouts/index.vue'),
    children: [
      {
        path: '/configurations',
        name: 'configurations',
        component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/index.vue'),
        children: [
          {
            path: '',
            name: 'configurations',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/index.vue'),
          },
          {
            path: 'department',
            name: 'department',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/department/departmentManagement.vue'),
          },
          {
            path: 'user',
            name: 'user',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/user/userManagement.vue'),
          },
          {
            path: 'parameter',
            name: 'parameter',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/parameters/parameterManagement.vue'),
          },
          {
            path: 'deepLearning',
            name: 'deepLearning',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/deepLearning/index.vue'),
          },
          {
            path: 'fileStore',
            name: 'fileStore',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/fileStore/index.vue'),
          },
          {
            path: 'pacs',
            name: 'pacs',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/pacs/index.vue'),
          },
          {
            path: 'safe',
            name: 'safe',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/safe/index.vue'),
          },
          {
            path: 'log',
            name: 'log',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/log/index.vue'),
          },
          {
            path: 'authorization',
            name: 'authorization',
            component: () => import(/* webpackChunkName: "about3" */ '@/views/Configurations/authorization/index.vue'),
          },
          // =============================================================
          // =============================================================
          // =============================================================
          {
            path: 'patientList',
            name: 'patientList',
            component: () => import(/* webpackChunkName: "about1" */ '@/views/Configurations/patientList/index.vue')
          },
          {
            path: 'patientDetail/:id',
            name: 'patientDetail',
            component: () => import(/* webpackChunkName: "about1" */ '@/views/Configurations/patientDetail/index.vue')
          },
          {
            path: 'reportList/:id',
            name: 'reportList',
            component: () => import(/* webpackChunkName: "about1" */ '@/views/Configurations/reportList/index.vue')
          },
          {
            path: 'qcList',
            name: 'qcList',
            component: () => import(/* webpackChunkName: "about1" */ '@/views/Configurations/qcList/index.vue')
          },
        ]
      },
    ]
  },
  {
    path: '/login',
    component: Home
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
  // {
  //   path: '/3DViewer',
  //   name: '3DViewer',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/3DViewer.vue')
  // }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = useCookies().get('token')
  if (to.path !== '/login' && !token) {
    next({ path: '/login'})
  } else if (token && to.path === '/login') {
    next({ path: '/studyList'})
  } else if (to.path === '/studyList'&& !to.query.status && from.path.includes('viewports')) {
    // console.log(to.query.status)
    next({ path: '/studyList', query: {status: 'refresh'}})
  } else if (to.path.includes('/configurations') && !to.query.status && from.path.includes('viewports')) {
    // console.log(to.path)
    next({ path: to.path, query: {status: 'refresh'}})
  } else {
    next()
  }
})



export default router


