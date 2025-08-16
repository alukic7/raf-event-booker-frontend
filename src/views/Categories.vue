<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { handleError } from '../lib/http'
import { useAuthStore } from '../store/authStore'
import type { Category } from '../types/category.types'

const store = useAuthStore()

const categories = ref<Category[]>([])
const errorMessage = ref<string | null>(null)

const allowedPageSize: number[] = [10, 25, 50] as const
const pageSize = ref<number>(allowedPageSize[0])
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

async function loadCategories() {
  try {
    const res = await axios.get(
      `http://localhost:3000/categories?pageSize=${pageSize.value}&offset=${offset.value}`
    )
    categories.value = res.data?.data ?? []
    currentPage.value = res.data.page ?? 1
    totalPages.value = res.data.pages ?? 1
    errorMessage.value = null
  } catch (error) {
    errorMessage.value = handleError(error)
    setTimeout(() => (errorMessage.value = null), 1500)
  }
}

function setPageSize(size: number) {
  if (!allowedPageSize.includes(size)) return
  pageSize.value = size
  offset.value = 0
  loadCategories()
}
function nextPage() {
  if (currentPage.value >= totalPages.value) return
  offset.value = currentPage.value * pageSize.value
  loadCategories()
}
function prevPage() {
  if (currentPage.value <= 1) return
  offset.value = (currentPage.value - 2) * pageSize.value
  loadCategories()
}

const addModal = ref<HTMLDialogElement | null>(null)
const newName = ref('')
const newDescription = ref('')
const saving = ref(false)

function openAddModal() {
  newName.value = ''
  newDescription.value = ''
  addModal.value?.showModal()
}
function closeAddModal() {
  addModal.value?.close()
}

async function saveCategory() {
  if (!newName.value.trim()) {
    errorMessage.value = 'Name is required'
    setTimeout(() => (errorMessage.value = null), 1500)
    return
  }
  saving.value = true
  try {
    await axios.post(
      'http://localhost:3000/categories',
      { name: newName.value.trim(), description: newDescription.value.trim() },
      { withCredentials: true }
    )
    await loadCategories()
    closeAddModal()
  } catch (err) {
    errorMessage.value = handleError(err)
  } finally {
    saving.value = false
  }
}

const editModal = ref<HTMLDialogElement | null>(null)
const editingId = ref<number | null>(null)
const editName = ref('')
const editDescription = ref('')
const savingEdit = ref(false)

function openEditModal(cat: Category) {
  editingId.value = cat.id
  editName.value = cat.name ?? ''
  editDescription.value = cat.description ?? ''
  editModal.value?.showModal()
}

function closeEditModal() {
  editModal.value?.close()
  editingId.value = null
  editName.value = ''
  editDescription.value = ''
}

async function saveEditCategory() {
  if (editingId.value == null) return
  if (!editName.value.trim()) {
    errorMessage.value = 'Name is required'
    setTimeout(() => (errorMessage.value = null), 1500)
    return
  }
  savingEdit.value = true
  try {
    await axios.put(
      `http://localhost:3000/categories/${editingId.value}`,
      {
        name: editName.value.trim(),
        description: editDescription.value.trim(),
      },
      { withCredentials: true }
    )
    await loadCategories()
    closeEditModal()
  } catch (err) {
    errorMessage.value = handleError(err)
  } finally {
    savingEdit.value = false
  }
}

const deleteModal = ref<HTMLDialogElement | null>(null)
const deletingId = ref<number | null>(null)
const deletingName = ref('')
const deleting = ref(false)

function openDeleteModal(cat: Category) {
  deletingId.value = cat.id
  deletingName.value = cat.name ?? ''
  deleteModal.value?.showModal()
}

function closeDeleteModal() {
  if (deleteModal.value) {
    deleteModal.value.close()
  }
  deletingId.value = null
  deletingName.value = ''
}

async function confirmDeleteCategory() {
  if (deletingId.value == null) return
  deleting.value = true
  try {
    await axios.delete(`http://localhost:3000/categories/${deletingId.value}`, {
      withCredentials: true,
    })
    await loadCategories()
    closeDeleteModal()
  } catch (err) {
    errorMessage.value = handleError(err)
  } finally {
    deleting.value = false
  }
}

onMounted(loadCategories)
</script>

<template>
  <div
    v-if="store.isLoggedIn"
    class="flex justify-center items-center relative"
  >
    <ul class="list bg-base-100 rounded-box w-full max-w-md">
      <li class="p-4 pb-2 text-lg opacity-60 tracking-wide text-center">
        Categories
      </li>

      <li class="flex justify-center py-3">
        <button class="btn btn-active btn-info w-1/6" @click="openAddModal">
          Add
        </button>
      </li>

      <li
        v-for="category in categories"
        :key="category.id"
        class="flex justify-between items-center px-4 py-2"
      >
        <div>
          <div>{{ category.name }}</div>
          <div class="text-xs uppercase font-semibold opacity-60">
            {{ category.description }}
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class="btn btn-square btn-ghost"
            @click="openEditModal(category)"
          >
            <v-icon name="bi-pencil-square" scale="1" />
          </button>
          <button
            class="btn btn-square btn-ghost"
            @click="openDeleteModal(category)"
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
            :disabled="currentPage <= 1"
          >
            Prev
          </button>

          <span class="text-sm opacity-80">
            Page {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            class="btn btn-sm"
            @click="nextPage"
            :disabled="currentPage >= totalPages"
          >
            Next
          </button>

          <label class="ml-2 text-sm opacity-70">Per page</label>
          <select
            class="select select-bordered select-sm"
            :value="pageSize"
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

      <li v-if="errorMessage" class="px-4 pb-4">
        <div role="alert" class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </li>
    </ul>

    <dialog ref="addModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-3">Add Category</h3>

        <form class="flex flex-col gap-3" @submit.prevent="saveCategory">
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
          <div class="modal-action">
            <button type="button" class="btn" @click="closeAddModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span
                v-if="saving"
                class="loading loading-spinner loading-sm mr-2"
              />
              Save
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <dialog ref="editModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-3">Edit Category</h3>

        <form class="flex flex-col gap-3" @submit.prevent="saveEditCategory">
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
              />
              Save
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <dialog ref="deleteModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold text-red-500">Delete Category</h3>
        <p class="py-4">
          Are you sure you want to delete
          <strong>{{ deletingName }}</strong
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
            @click="confirmDeleteCategory"
          >
            <span
              v-if="deleting"
              class="loading loading-spinner loading-sm mr-2"
            />
            Delete
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>
