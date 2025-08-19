<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { handleError } from '../lib/http'
import type { Event } from '../types/event.types'

const router = useRouter()
const route = useRoute()
const tagId = ref(Number(route.params.id))

const events = ref<Event[]>([])
const errorMessage = ref<string | null>(null)

const allowedPageSize: number[] = [10, 25, 50] as const
const pageSize = ref<number>(allowedPageSize[0])
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const listLoading = ref(false)

function setPageSize(size: number) {
  if (!allowedPageSize.includes(size)) return
  pageSize.value = size
  offset.value = 0
  loadEventsByTag()
}
function nextPage() {
  if (currentPage.value >= totalPages.value || listLoading.value) return
  offset.value = currentPage.value * pageSize.value
  loadEventsByTag()
}
function prevPage() {
  if (currentPage.value <= 1 || listLoading.value) return
  offset.value = (currentPage.value - 2) * pageSize.value
  loadEventsByTag()
}

async function loadEventsByTag() {
  if (listLoading.value) return
  listLoading.value = true
  try {
    const res = await axios.get(
      `http://localhost:3000/events/tag/${tagId.value}?pageSize=${pageSize.value}&offset=${offset.value}`
    )
    events.value = res.data?.data ?? []
    currentPage.value = res.data?.page ?? 1
    totalPages.value = res.data?.pages ?? 1
    errorMessage.value = null
  } catch (error) {
    errorMessage.value = handleError(error)
  } finally {
    listLoading.value = false
  }
}

onMounted(loadEventsByTag)
</script>

<template>
  <div class="grid grid-cols-2 gap-15 m-20 place-items-center">
    <div
      v-for="event in events"
      :key="event.id"
      class="card bg-base-300 w-96 shadow-sm flex"
    >
      <div class="card-body">
        <h2 class="card-title text-2xl">{{ event.name }}</h2>
        <p>{{ event.description.substring(0, 20) }}...</p>
        <div class="card-actions justify-end">
          <button
            class="btn btn-info"
            v-on:click="router.push(`/event/${event.id}`)"
          >
            See more
          </button>
        </div>
      </div>
    </div>
  </div>
  <li class="px-4 py-3">
    <div class="flex items-center justify-center gap-3">
      <button
        class="btn btn-sm"
        @click="prevPage"
        :disabled="currentPage <= 1 || listLoading"
      >
        Prev
      </button>
      <span class="text-sm opacity-80"
        >Page {{ currentPage }} / {{ totalPages }}</span
      >
      <button
        class="btn btn-sm"
        @click="nextPage"
        :disabled="currentPage >= totalPages || listLoading"
      >
        Next
      </button>

      <label class="ml-2 text-sm opacity-70">Per page</label>
      <select
        class="select select-bordered select-sm"
        :value="pageSize"
        :disabled="listLoading"
        @change="
          setPageSize(parseInt(($event.target as HTMLSelectElement).value, 10))
        "
      >
        <option v-for="s in allowedPageSize" :key="s" :value="s">
          {{ s }}
        </option>
      </select>
    </div>
  </li>
</template>
