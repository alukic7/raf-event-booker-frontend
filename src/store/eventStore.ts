import axios from 'axios'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { handleError } from '../lib/http'
import type { Event } from '../types/event.types'

type ViewMode = 'all' | 'mostViewed' | 'category'

export const useEventStore = defineStore('event', () => {
  const search = ref('')
  const mostViewedEvents = ref<Event[]>([])
  const categoryEvents = ref<Event[]>([])
  const errorMessage = ref<string | null>(null)
  const viewMode = ref<ViewMode>('all')

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  async function loadMostViewed() {
    try {
      const { data } = await axios.get(
        'http://localhost:3000/events/most-viewed'
      )
      mostViewedEvents.value = Array.isArray(data) ? data : []
      errorMessage.value = null
    } catch (err) {
      errorMessage.value = handleError(err)
    }
  }

  async function loadByCategory(id: number) {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/events/category/${id}?pageSize=50&offset=0`
      )
      categoryEvents.value = Array.isArray(data.data) ? data.data : []
      errorMessage.value = null
    } catch (err) {
      errorMessage.value = handleError(err)
    }
  }

  watch(search, () => {
    viewMode.value = 'all'
  })

  return {
    search,
    mostViewedEvents,
    categoryEvents,
    errorMessage,
    viewMode,
    setViewMode,
    loadMostViewed,
    loadByCategory,
  }
})
