import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import User from '../views/User.vue'
import Register from '../views/Register.vue'

// test
import MarkImage from '../views/Home/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/user/login'
  },
  {
    path: '/user',
    component: User,
    children:[
      {
        path:'login',
        component:Login
      },
      {
        path:'register',
        component:Register
      },
      {
        path: '',
        component: Login
      },
    ]
  },

  {
    path: '/home',
    name: 'Home',
    component: Home
  },

  {
    path: '/test',
    component: MarkImage
  }
]

const router = new VueRouter({
  routes
})

export default router
