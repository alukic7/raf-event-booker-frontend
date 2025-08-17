<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleError } from '../lib/http'
import { useEventStore } from '../store/eventStore'
import type { Event } from '../types/event.types'

const eventStore = useEventStore()
const router = useRouter()

const events = ref<Event[]>([])
const errorMessage = ref<string | null>(null)

const allowedPageSize: number[] = [10, 25, 50] as const
const pageSize = ref<number>(allowedPageSize[0])
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const listLoading = ref(false)

const filteredEvents = computed(() => {
  const q = eventStore.search.trim().toLowerCase()
  if (!q) return events.value
  return events.value.filter(
    e =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
  )
})

function setPageSize(size: number) {
  if (!allowedPageSize.includes(size)) return
  pageSize.value = size
  offset.value = 0
  loadEvents()
}
function nextPage() {
  if (currentPage.value >= totalPages.value || listLoading.value) return
  offset.value = currentPage.value * pageSize.value
  loadEvents()
}
function prevPage() {
  if (currentPage.value <= 1 || listLoading.value) return
  offset.value = (currentPage.value - 2) * pageSize.value
  loadEvents()
}

async function loadEvents() {
  if (listLoading.value) return
  listLoading.value = true
  try {
    const res = await axios.get(
      `http://localhost:3000/events?pageSize=${pageSize.value}&offset=${offset.value}`,
      { withCredentials: true }
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

onMounted(loadEvents)
</script>

<template>
  <div
    v-if="eventStore.viewMode === 'all'"
    class="grid grid-cols-2 gap-15 m-20 place-items-center"
  >
    <div
      v-for="event in filteredEvents"
      :key="event.id"
      class="card bg-base-300 w-96 shadow-sm flex"
    >
      <div class="card-body">
        <h2 class="card-title text-2xl">{{ event.name }}</h2>
        <p>{{ event.description.substring(0, 20) }}...</p>
        <p>{{ new Date(event.eventDate).toLocaleString() }}</p>
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

  <div
    v-if="eventStore.viewMode === 'mostViewed'"
    class="grid grid-cols-2 gap-15 m-20 place-items-center"
  >
    <div
      v-for="event in eventStore.mostViewedEvents"
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

  <div
    v-if="eventStore.viewMode === 'category'"
    class="grid grid-cols-2 gap-15 m-20 place-items-center"
  >
    <div
      v-for="event in eventStore.categoryEvents"
      :key="event.id"
      class="card bg-base-300 w-96 shadow-sm flex"
    >
      <div class="card-body">
        <h2 class="card-title text-2xl">{{ event.name }}</h2>
        <p>{{ event.description.substring(0, 20) }}...</p>
        <p>{{ new Date(event.eventDate).toLocaleString() }}</p>
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

  <li
    v-if="eventStore.viewMode === 'all' || eventStore.viewMode === 'category'"
    class="px-4 py-3"
  >
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
