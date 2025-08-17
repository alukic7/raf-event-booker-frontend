<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useEventStore } from '../store/eventStore'
import AdminBurgerMenu from './AdminBurgerMenu.vue'
import GuestBurgerMenu from './GuestBurgerMenu.vue'

const store = useAuthStore()
const eventStore = useEventStore()
const route = useRoute()

const showSearch = computed(
  () => route.path === '/' || route.path === '/admin/events'
)
</script>

<template>
  <div class="navbar bg-base-100 relative h-16">
    <div class="absolute inset-y-0 left-3 flex items-center">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </div>
        <GuestBurgerMenu v-if="!store.isLoggedIn" />
        <AdminBurgerMenu v-else />
      </div>
    </div>

    <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center">
      <router-link
        to="/"
        @click="eventStore.setViewMode('all')"
        class="btn btn-ghost text-2xl"
      >
        RAF Event Booker
      </router-link>
    </div>

    <div class="absolute inset-y-0 right-3 flex items-center gap-3">
      <template v-if="showSearch">
        <input
          type="text"
          v-model="eventStore.search"
          placeholder="Search event"
          class="input input-bordered w-40 md:w-64"
        />
      </template>

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <v-icon name="io-person-circle-outline" scale="2" />
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
        >
          <li v-if="store.isLoggedIn">
            <span class="text-lg">{{ store.user?.email }}</span>
            <span>{{ store.user?.firstName }} {{ store.user?.lastName }}</span>
            <span>{{ store.user?.type.toUpperCase() }}</span>
          </li>
          <li class="mt-4" v-if="store.isLoggedIn">
            <a class="text-2xl text-red-500" @click="store.logout">Logout</a>
          </li>
          <li v-else>
            <router-link to="/login" class="text-2xl text-info"
              >Log in</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
