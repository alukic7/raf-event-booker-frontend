import { createRouter, createWebHistory } from 'vue-router'
import AdminDashboard from '../views/AdminDashboard.vue'
import Categories from '../views/Categories.vue'
import Dashboard from '../views/Dashboard.vue'
import Events from '../views/Events.vue'
import EventsByTagView from '../views/EventsByTagView.vue'
import EventView from '../views/EventView.vue'
import LoginView from '../views/LoginView.vue'
import Users from '../views/Users.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard, // list of all events
  },
  {
    path: '/event/:id',
    name: 'event',
    component: EventView, // event details and rsvp
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView, // login page
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard, // admin dashboard (conditionally rendered for Admin/Event_creator)
  },
  {
    path: '/admin/users',
    name: 'users',
    component: Users, // users dashboard (Admin only)
  },
  {
    path: '/admin/categories',
    name: 'categories',
    component: Categories, // categories dashboard (Admin and Event_creator only)
  },
  {
    path: '/admin/events',
    name: 'events',
    component: Events, // events dashboard (Admin and Event_creator only)
  },
  {
    path: '/tags/:id',
    name: 'tag-events',
    component: EventsByTagView, // list of events by given tag
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
