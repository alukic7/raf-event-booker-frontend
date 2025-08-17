<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { handleError } from '../lib/http'
import { useEventStore } from '../store/eventStore'
import type { Category } from '../types/category.types'

const eventStore = useEventStore()

const categories = ref<Category[]>([])
const errorMessage = ref<string | null>(null)

async function loadCategories() {
  try {
    const res = await axios.get(
      'http://localhost:3000/categories?pageSize=50&offset=0'
    )
    categories.value = res.data?.data ?? []
  } catch (error) {
    errorMessage.value = handleError(error)
  }
}

async function showMostViewed() {
  eventStore.setViewMode('mostViewed')
  await eventStore.loadMostViewed()
}

async function showForCategory(id: number) {
  eventStore.setViewMode('category')
  await eventStore.loadByCategory(id)
}

onMounted(loadCategories)
</script>

<template>
  <ul
    tabindex="0"
    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-60 p-2 shadow"
  >
    <li>
      <a class="text-2xl" @click="showMostViewed">The most viewed</a>
    </li>

    <li v-for="category in categories" :key="category.id">
      <a @click="showForCategory(category.id)" class="text-lg">{{
        category.name
      }}</a>
    </li>
  </ul>
</template>
