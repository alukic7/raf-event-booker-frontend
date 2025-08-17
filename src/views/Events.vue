<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { handleError } from '../lib/http'
import { useAuthStore } from '../store/authStore'
import { useEventStore } from '../store/eventStore'
import type { Category } from '../types/category.types'
import type { Event } from '../types/event.types'
import type { Tag } from '../types/tag.types'

const store = useAuthStore()

const events = ref<Event[]>([])
const categories = ref<Category[]>([])
const errorMessage = ref<string | null>(null)

const allowedPageSize: number[] = [10, 25, 50] as const
const pageSize = ref<number>(allowedPageSize[0])
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const listLoading = ref(false)

const eventStore = useEventStore()

const filteredEvents = computed(() => {
  const q = eventStore.search.trim().toLowerCase()
  if (!q) return events.value
  return events.value.filter(
    e =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
  )
})

async function loadEvents() {
  if (listLoading.value) return
  listLoading.value = true
  try {
    const res = await axios.get(
      `http://localhost:3000/events?pageSize=${pageSize.value}&offset=${offset.value}`
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

const addModal = ref<HTMLDialogElement | null>(null)
const newName = ref('')
const newDescription = ref('')
const newEventDate = ref('')
const newLocation = ref('')
const newTags = ref('')
const newCategoryId = ref<number>(0)
const newMaxParticipants = ref<number | null>(null)
const saving = ref(false)

function openAddModal() {
  newName.value = ''
  newDescription.value = ''
  newEventDate.value = ''
  newLocation.value = ''
  newTags.value = ''
  newCategoryId.value = 0
  newMaxParticipants.value = null
  addModal.value?.showModal()
}
function closeAddModal() {
  addModal.value?.close()
}

async function saveEvent() {
  const name = newName.value.trim()
  const description = newDescription.value.trim()
  const location = newLocation.value.trim()
  const tags = (newTags.value ?? '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.toLowerCase())

  const date = new Date(newEventDate.value)

  if (
    !name ||
    !description ||
    !newEventDate.value ||
    Number.isNaN(date.getTime()) ||
    !location ||
    !newCategoryId.value ||
    tags.length === 0
  ) {
    errorMessage.value = 'All fields are required'
    return
  }

  const maxParticipants =
    newMaxParticipants.value == null || Number.isNaN(newMaxParticipants.value)
      ? null
      : newMaxParticipants.value

  saving.value = true
  try {
    await axios.post(
      'http://localhost:3000/events',
      {
        name,
        description,
        location,
        eventDate: date.toISOString(),
        categoryId: newCategoryId.value,
        tags,
        maxParticipants,
      },
      { withCredentials: true }
    )
    await loadEvents()
    closeAddModal()
  } catch (err) {
    errorMessage.value = handleError(err)
  } finally {
    saving.value = false
  }
}

const editModal = ref<HTMLDialogElement | null>(null)
const editId = ref<number | null>(null)
const editName = ref('')
const editDescription = ref('')
const editEventDate = ref('')
const editLocation = ref('')
const editTags = ref('')
const editCategoryId = ref<number>(0)
const editMaxParticipants = ref<number | null>(null)
const savingEdit = ref(false)
const categoriesLoading = ref(false)

async function fetchEventById(id: number) {
  const { data } = await axios.get(`http://localhost:3000/events/${id}`, {
    withCredentials: true,
  })
  return data
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

async function openEditModal(eFromList: Event) {
  if (!categories.value.length) await loadCategories()

  const e = await fetchEventById(eFromList.id)

  editId.value = e.id
  editName.value = e.name ?? ''
  editDescription.value = e.description ?? ''
  editEventDate.value = toDatetimeLocal(e.eventDate)
  editLocation.value = e.location ?? ''

  editCategoryId.value = Number(e.category?.id ?? 0)

  const tagNames = (e.tags ?? []).map((t: Tag) => t?.name).filter(Boolean)
  editTags.value = tagNames.join(', ')

  editMaxParticipants.value = e.maxParticipants ?? null

  editModal.value?.showModal()
}

function closeEditModal() {
  editModal.value?.close()
  editId.value = null
  editName.value = ''
  editDescription.value = ''
  editEventDate.value = ''
  editLocation.value = ''
  editTags.value = ''
  editCategoryId.value = 0
  editMaxParticipants.value = null
}

async function saveEditEvent() {
  if (editId.value == null) return

  const name = editName.value.trim()
  const description = editDescription.value.trim()
  const location = editLocation.value.trim()
  const date = new Date(editEventDate.value)
  const tags = (editTags.value ?? '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.toLowerCase())

  if (
    !name ||
    !description ||
    !editEventDate.value ||
    Number.isNaN(date.getTime()) ||
    !location ||
    !editCategoryId.value ||
    tags.length === 0
  ) {
    errorMessage.value = 'All fields are required'
    return
  }

  const maxParticipants =
    editMaxParticipants.value == null || Number.isNaN(editMaxParticipants.value)
      ? null
      : editMaxParticipants.value

  savingEdit.value = true
  try {
    await axios.put(
      `http://localhost:3000/events/${editId.value}`,
      {
        name,
        description,
        location,
        eventDate: date.toISOString(),
        categoryId: editCategoryId.value,
        tags,
        maxParticipants,
      },
      { withCredentials: true }
    )
    await loadEvents()
    closeEditModal()
  } catch (err) {
    errorMessage.value = handleError(err)
  } finally {
    savingEdit.value = false
  }
}

const deleteModal = ref<HTMLDialogElement | null>(null)
const deleteId = ref<number | null>(null)
const deleteName = ref('')
const deleting = ref(false)

function openDeleteModal(ev: any) {
  deleteId.value = ev.id
  deleteName.value = ev.name ?? ''
  deleteModal.value?.showModal()
}
function closeDeleteModal() {
  deleteModal.value?.close()
  deleteId.value = null
  deleteName.value = ''
}
async function confirmDeleteEvent() {
  if (deleteId.value == null) {
    errorMessage.value = 'Id is required'
    return
  }
  deleting.value = true
  try {
    await axios.delete(`http://localhost:3000/events/${deleteId.value}`, {
      withCredentials: true,
    })
    await loadEvents()
    closeDeleteModal()
  } catch (err) {
    errorMessage.value = handleError(err)
  } finally {
    deleting.value = false
  }
}

async function loadCategories() {
  categoriesLoading.value = true
  try {
    const res = await axios.get(
      `http://localhost:3000/categories?pageSize=50&offset=0`
    )
    categories.value = res.data?.data ?? []
    errorMessage.value = null
  } catch (error) {
    errorMessage.value = handleError(error)
  } finally {
    categoriesLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadEvents()])
})
</script>

<template>
  <div
    v-if="store.isLoggedIn"
    class="flex justify-center items-center relative"
  >
    <ul class="list bg-base-100 rounded-box w-full max-w-md">
      <li class="p-4 pb-2 text-lg opacity-60 tracking-wide text-center">
        Events
      </li>

      <li class="flex justify-center py-3">
        <button class="btn btn-active btn-info w-1/6" @click="openAddModal">
          Add
        </button>
      </li>

      <li
        v-for="event in filteredEvents"
        :key="event.id"
        class="flex justify-between items-center px-4 py-2"
      >
        <div>
          <div class="link link-hover">
            <router-link :to="`/event/${event.id}`">
              {{ event.name }}
            </router-link>
          </div>
          <div class="text-xs uppercase font-semibold opacity-60">
            {{ event.author.firstName }} {{ event.author.lastName }}
            {{ new Date(event.createdAt).toLocaleString() }}
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class="btn btn-square btn-ghost"
            @click="openEditModal(event)"
          >
            <v-icon name="bi-pencil-square" scale="1" />
          </button>
          <button
            class="btn btn-square btn-ghost"
            @click="openDeleteModal(event)"
          >
            <v-icon name="bi-trash" scale="1" />
          </button>
        </div>
      </li>

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
              setPageSize(
                parseInt(($event.target as HTMLSelectElement).value, 10)
              )
            "
          >
            <option v-for="s in allowedPageSize" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
      </li>

      <transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <li v-if="errorMessage" class="px-4 pb-4">
          <div role="alert" class="alert alert-error">
            <span>{{ errorMessage }}</span>
          </div>
        </li>
      </transition>
    </ul>

    <dialog ref="addModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-3">Add event</h3>

        <form class="flex flex-col gap-3" @submit.prevent="saveEvent">
          <input
            v-model="newName"
            type="text"
            class="input input-bordered"
            placeholder="Name"
            required
          />
          <textarea
            v-model="newDescription"
            class="textarea textarea-bordered"
            placeholder="Description"
            rows="3"
          />
          <input
            v-model="newEventDate"
            type="datetime-local"
            class="input input-bordered"
            placeholder="Event date"
            required
          />
          <input
            v-model="newLocation"
            type="text"
            class="input input-bordered"
            placeholder="Location"
            required
          />

          <select class="select" v-model.number="newCategoryId" required>
            <option disabled :value="0">Pick a category</option>
            <option v-for="c in categories" :key="c.id" :value="Number(c.id)">
              {{ c.name }}
            </option>
          </select>

          <textarea
            v-model="newTags"
            class="textarea textarea-bordered"
            placeholder="Tags"
            rows="3"
          />
          <input
            v-model.number="newMaxParticipants"
            type="number"
            min="1"
            class="input input-bordered"
            placeholder="Max participants (optional)"
          />

          <div class="modal-action">
            <button type="button" class="btn" @click="closeAddModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span
                v-if="saving"
                class="loading loading-spinner loading-sm mr-2"
              />Save
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <dialog ref="editModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-3">Edit event</h3>

        <form class="flex flex-col gap-3" @submit.prevent="saveEditEvent">
          <input
            v-model="editName"
            type="text"
            class="input input-bordered"
            placeholder="Name"
            required
          />
          <textarea
            v-model="editDescription"
            class="textarea textarea-bordered"
            placeholder="Description"
            rows="3"
          />
          <input
            v-model="editEventDate"
            type="datetime-local"
            class="input input-bordered"
            placeholder="Event date"
            required
          />
          <input
            v-model="editLocation"
            type="text"
            class="input input-bordered"
            placeholder="Location"
            required
          />

          <select class="select" v-model.number="editCategoryId" required>
            <option disabled :value="0">Pick a category</option>
            <option v-for="c in categories" :key="c.id" :value="Number(c.id)">
              {{ c.name }}
            </option>
          </select>

          <textarea
            v-model="editTags"
            class="textarea textarea-bordered"
            placeholder="Tags"
            rows="3"
          />
          <input
            v-model.number="editMaxParticipants"
            type="number"
            min="1"
            class="input input-bordered"
            placeholder="Max participants (optional)"
          />

          <div class="modal-action">
            <button type="button" class="btn" @click="closeEditModal">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="savingEdit"
            >
              <span
                v-if="savingEdit"
                class="loading loading-spinner loading-sm mr-2"
              />Save
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <dialog ref="deleteModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold text-red-500">Delete event</h3>
        <p class="py-4">
          Are you sure you want to delete <strong>{{ deleteName }}</strong
          >?
        </p>
        <div class="modal-action">
          <button type="button" class="btn" @click="closeDeleteModal">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-error"
            :disabled="deleting"
            @click="confirmDeleteEvent"
          >
            <span
              v-if="deleting"
              class="loading loading-spinner loading-sm mr-2"
            />Delete
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>
