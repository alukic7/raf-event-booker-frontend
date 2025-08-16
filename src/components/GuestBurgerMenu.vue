<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { handleError } from '../lib/http'
import type { Category } from '../types/category.types'

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

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <ul
    tabindex="0"
    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-60 p-2 shadow"
  >
    <li>
      <router-link to="" class="text-2xl">The most viewed</router-link>
    </li>
    <li v-for="category in categories" :key="category.id">
      <a class="text-lg">{{ category.name }}</a>
    </li>
  </ul>
</template>
