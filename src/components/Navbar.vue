<script setup lang="ts">
import { useAuthStore } from '../store/authStore'
import AdminBurgerMenu from './AdminBurgerMenu.vue'
import GuestBurgerMenu from './GuestBurgerMenu.vue'

const store = useAuthStore()
</script>

<template>
  <div class="navbar bg-base-100 relative">
    <div class="navbar-start">
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
        <AdminBurgerMenu v-if="store.isLoggedIn" />
      </div>
    </div>
    <div class="absolute left-1/2 transform -translate-x-1/2">
      <router-link to="/" class="btn btn-ghost text-2xl">
        RAF Event Booker
      </router-link>
    </div>
    <div class="navbar-end">
      <input
        type="text"
        placeholder="Search"
        class="input input-bordered w-24 md:w-auto mr-4"
      />
    </div>
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <v-icon name="io-person-circle-outline" scale="2" />
        </div>
      </div>
      <ul
        tabindex="0"
        class="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
      >
        <li v-if="store.isLoggedIn">
          <span class="text-lg">{{ store.user?.email }}</span>
          <span>{{ store.user?.firstName }} {{ store.user?.lastName }}</span>
          <span>{{ store.user?.type.toUpperCase() }}</span>
        </li>
        <li class="mt-4" v-if="store.isLoggedIn">
          <a class="text-2xl text-red-500" v-on:click="store.logout">Logout</a>
        </li>
        <li v-if="!store.isLoggedIn">
          <router-link to="/login" class="text-2xl text-info"
            >Log in</router-link
          >
        </li>
      </ul>
    </div>
  </div>
</template>
