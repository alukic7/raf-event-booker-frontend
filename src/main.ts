import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  BiCalendarEvent,
  BiPencilSquare,
  BiTrash,
  IoPersonCircleOutline,
  LaUsersSolid,
  MdCategoryOutlined,
} from 'oh-vue-icons/icons'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/authStore'
import './style.css'

addIcons(
  IoPersonCircleOutline,
  BiCalendarEvent,
  MdCategoryOutlined,
  LaUsersSolid,
  BiTrash,
  BiPencilSquare
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const store = useAuthStore()
await store.fetchMe()

app.component('v-icon', OhVueIcon)
app.mount('#app')
