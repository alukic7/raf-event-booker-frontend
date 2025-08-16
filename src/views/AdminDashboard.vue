<script setup lang="ts">
import { useAuthStore } from '../store/authStore'

const store = useAuthStore()
</script>

<template>
  <div v-if="store.isLoggedIn" class="flex justify-center items-center mt-20">
    <ul class="menu bg-base-200 rounded-box w-56">
      <li>
        <router-link to="/admin/categories">
          <v-icon name="md-category-outlined" scale="1" /> Categories
        </router-link>
      </li>
      <li>
        <router-link to="/admin/events">
          <v-icon name="bi-calendar-event" scale="1" /> Events
        </router-link>
      </li>
      <li v-if="store.isLoggedIn && store.user?.type === 'admin'">
        <router-link to="/admin/users">
          <v-icon name="la-users-solid" scale="1" /> Users
        </router-link>
      </li>
    </ul>
  </div>
</template>
