// /src/store/authStore.ts
import axios from 'axios'
import { defineStore } from 'pinia'
import router from '../router'
import type { User } from '../types/user.types'

export const useAuthStore = defineStore('authStore', {
  state: (): { user: User | null } => ({
    user: null,
  }),
  getters: {
    isLoggedIn: s => !!s.user,
    isAdmin: s => s.user?.type === 'admin',
  },
  actions: {
    async fetchMe() {
      try {
        const res = await axios.get('http://localhost:3000/auth/me', {
          withCredentials: true,
        })
        if (res.status === 200) this.user = res.data
      } catch {
        this.user = null
      }
    },
    async logout() {
      try {
        await axios.put('http://localhost:3000/auth/logout', null, {
          withCredentials: true,
        })
        router.push('/')
      } finally {
        this.user = null
      }
    },
  },
})
