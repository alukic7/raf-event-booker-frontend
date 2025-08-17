<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { handleError } from '../lib/http'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/user.types'

const store = useAuthStore()

const users = ref<User[]>([])
const errorMessage = ref<string | null>(null)

const allowedPageSize: number[] = [10, 25, 50] as const
const pageSize = ref<number>(allowedPageSize[0])
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

async function loadUsers() {
  try {
    const res = await axios.get(
      `http://localhost:3000/users?pageSize=${pageSize.value}&offset=${offset.value}`,
      { withCredentials: true }
    )
    users.value = res.data?.data ?? []
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
  loadUsers()
}
function nextPage() {
  if (currentPage.value >= totalPages.value) return
  offset.value = currentPage.value * pageSize.value
  loadUsers()
}
function prevPage() {
  if (currentPage.value <= 1) return
  offset.value = (currentPage.value - 2) * pageSize.value
  loadUsers()
}

const addModal = ref<HTMLDialogElement | null>(null)
const newEmail = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const newFirstName = ref('')
const newLastName = ref('')
const saving = ref(false)

function openAddModal() {
  newEmail.value = ''
  newPassword.value = ''
  newPasswordConfirmation.value = ''
  newFirstName.value = ''
  newLastName.value = ''
  addModal.value?.showModal()
}
function closeAddModal() {
  addModal.value?.close()
}

async function saveUser() {
  if (
    !newEmail.value.trim() ||
    !newPassword.value.trim() ||
    !newPasswordConfirmation.value.trim() ||
    !newFirstName.value.trim() ||
    !newLastName.value.trim()
  ) {
    errorMessage.value = 'All fields are required'
    setTimeout(() => (errorMessage.value = null), 1500)
    closeAddModal()
    return
  }
  if (newPassword.value !== newPasswordConfirmation.value) {
    errorMessage.value = 'Passwords are not matching'
    setTimeout(() => (errorMessage.value = null), 1500)
    closeAddModal()
    return
  }
  saving.value = true
  try {
    await axios.post(
      'http://localhost:3000/users',
      {
        email: newEmail.value,
        password: newPassword.value,
        firstName: newFirstName.value,
        lastName: newLastName.value,
      },
      { withCredentials: true }
    )
    await loadUsers()
    closeAddModal()
  } catch (err) {
    errorMessage.value = handleError(err)
    closeAddModal()
    setTimeout(() => (errorMessage.value = null), 1500)
  } finally {
    saving.value = false
  }
}

const editModal = ref<HTMLDialogElement | null>(null)
const editingId = ref<number | null>(null)
const editEmail = ref('')
const editFirstName = ref('')
const editLastName = ref('')
const savingEdit = ref(false)

function openEditModal(user: User) {
  editingId.value = user.id
  editEmail.value = user.email ?? ''
  editFirstName.value = user.firstName ?? ''
  editLastName.value = user.lastName ?? ''
  editModal.value?.showModal()
}

function closeEditModal() {
  editModal.value?.close()
  editingId.value = null
  editEmail.value = ''
  editFirstName.value = ''
  editLastName.value = ''
}

async function saveEditUser() {
  if (editingId.value == null) {
    closeEditModal()
    return
  }
  if (
    !editEmail.value.trim() ||
    !editFirstName.value.trim() ||
    !editLastName.value.trim()
  ) {
    errorMessage.value = 'All fields are required'
    setTimeout(() => (errorMessage.value = null), 1500)
    closeEditModal()
    return
  }
  savingEdit.value = true
  try {
    await axios.put(
      `http://localhost:3000/users/${editingId.value}`,
      {
        email: editEmail.value,
        firstName: editFirstName.value,
        lastName: editLastName.value,
      },
      { withCredentials: true }
    )
    await loadUsers()
    closeEditModal()
  } catch (err) {
    errorMessage.value = handleError(err)
    closeEditModal()
    setTimeout(() => (errorMessage.value = null), 1500)
  } finally {
    savingEdit.value = false
  }
}

async function changeUserStatus(user: User) {
  if (user.status === 'active') {
    await deactivateUser(user.id)
    user.status = 'inactive'
  } else {
    await activateUser(user.id)
    user.status = 'active'
  }
}

async function activateUser(userId: number) {
  try {
    await axios.put(`http://localhost:3000/users/activate/${userId}`, null, {
      withCredentials: true,
    })
  } catch (error) {
    errorMessage.value = handleError(error)
    setTimeout(() => (errorMessage.value = null), 1500)
  }
}

async function deactivateUser(userId: number) {
  try {
    await axios.put(`http://localhost:3000/users/deactivate/${userId}`, null, {
      withCredentials: true,
    })
  } catch (error) {
    errorMessage.value = handleError(error)
    setTimeout(() => (errorMessage.value = null), 1500)
  }
}

onMounted(loadUsers)
</script>

<template>
  <div
    v-if="store.isLoggedIn && store.isAdmin"
    class="flex justify-center items-center relative"
  >
    <ul class="list bg-base-100 rounded-box w-full max-w-md">
      <li class="p-4 pb-2 text-lg opacity-60 tracking-wide text-center">
        Users
      </li>

      <li class="flex justify-center py-3">
        <button class="btn btn-active btn-info w-1/6" @click="openAddModal">
          Add
        </button>
      </li>

      <li
        v-for="user in users"
        :key="user.id"
        class="flex justify-between items-center px-4 py-2"
      >
        <div>
          <div>{{ user.email }}</div>
          <div class="text-xs uppercase font-semibold opacity-60">
            {{ user.firstName }} {{ user.lastName }}
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <button class="btn btn-square btn-ghost" @click="openEditModal(user)">
            <v-icon name="bi-pencil-square" scale="1" />
          </button>
          <input
            v-if="user.type === 'event_creator'"
            type="checkbox"
            class="toggle toggle-info"
            :checked="user.status === 'active'"
            @change="changeUserStatus(user)"
          />
          <input
            v-else
            type="checkbox"
            class="toggle"
            disabled
            :checked="true"
          />
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
      </transition>
    </ul>

    <dialog ref="addModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-3">Add user</h3>

        <form class="flex flex-col gap-3" @submit.prevent="saveUser">
          <input
            v-model="newEmail"
            type="text"
            class="input input-bordered"
            placeholder="Email"
            required
          />
          <input
            v-model="newFirstName"
            type="text"
            class="input input-bordered"
            placeholder="First name"
            required
          />
          <input
            v-model="newLastName"
            type="text"
            class="input input-bordered"
            placeholder="Last name"
            required
          />
          <input
            v-model="newPassword"
            type="password"
            class="input input-bordered"
            placeholder="Password"
            required
          />
          <input
            v-model="newPasswordConfirmation"
            type="password"
            class="input input-bordered"
            placeholder="Confirm password"
            required
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
        <h3 class="text-lg font-bold mb-3">Edit user</h3>

        <form class="flex flex-col gap-3" @submit.prevent="saveEditUser">
          <input
            v-model="editEmail"
            type="text"
            class="input input-bordered"
            placeholder="Name"
            required
          />
          <input
            v-model="editFirstName"
            type="text"
            class="input input-bordered"
            placeholder="Name"
            required
          />
          <input
            v-model="editLastName"
            type="text"
            class="input input-bordered"
            placeholder="Name"
            required
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
  </div>
</template>
