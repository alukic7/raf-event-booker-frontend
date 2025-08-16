<script setup lang="ts">
import { useAuthStore } from '../store/authStore'

const store = useAuthStore()
</script>

<template>
  <ul
    tabindex="0"
    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-60 p-2 shadow"
  >
    <li>
      <router-link to="/admin/categories" class="text-xl"
        >Categories</router-link
      >
    </li>
    <li>
      <router-link to="/admin/events" class="text-xl">Events</router-link>
    </li>
    <li>
      <router-link
        v-if="store.isLoggedIn && store.user?.type === 'admin'"
        to="/admin/users"
        class="text-xl"
        >Users</router-link
      >
    </li>
  </ul>
</template>
