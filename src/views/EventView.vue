<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { handleError } from '../lib/http'
import { useAuthStore } from '../store/authStore'
import type { Comment } from '../types/comment.types'
import type { Event } from '../types/event.types'

const route = useRoute()
const id = Number(route.params.id)

const authStore = useAuthStore()
const newCommentAuthor = ref('')
const newCommentContent = ref('')

const event = ref<Event | null>(null)
const comments = ref<Comment[]>([])
const errorMessage = ref('')

const allowedPageSize: number[] = [10, 25, 50] as const
const pageSize = ref<number>(allowedPageSize[0])
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

function setPageSize(size: number) {
  if (!allowedPageSize.includes(size)) return
  pageSize.value = size
  offset.value = 0
  loadComments()
}

function nextPage() {
  if (currentPage.value >= totalPages.value) return
  offset.value = currentPage.value * pageSize.value
  loadComments()
}
function prevPage() {
  if (currentPage.value <= 1) return
  offset.value = (currentPage.value - 2) * pageSize.value
  loadComments()
}

async function loadEvent() {
  try {
    const res = await axios.get(`http://localhost:3000/events/${id}`)
    event.value = res.data ?? null
  } catch (error) {
    errorMessage.value = handleError(error)
    setTimeout(() => {
      errorMessage.value = ''
    }, 1500)
  }
}

async function loadComments() {
  try {
    const res = await axios.get(
      `http://localhost:3000/events/comments/${id}?pageSize=${pageSize.value}&offset=${offset.value}`
    )
    comments.value = res.data?.data ?? []
  } catch (error) {
    errorMessage.value = handleError(error)
    setTimeout(() => {
      errorMessage.value = ''
    }, 1500)
  }
}

async function saveComment() {
  try {
    await axios.post(`http://localhost:3000/events/comments/${id}`, {
      authorName: newCommentAuthor.value,
      content: newCommentContent.value,
    })
    newCommentContent.value = ''
    newCommentAuthor.value = ''
    loadComments()
  } catch (error) {
    errorMessage.value = handleError(error)
    setTimeout(() => {
      errorMessage.value = ''
    }, 1500)
  }
}

async function increaseViewCount() {
  try {
    await axios.put(`http://localhost:3000/events/viewed/${id}`, null, {
      withCredentials: true,
    })
    loadEvent()
  } catch (error) {
    errorMessage.value = handleError(error)
    setTimeout(() => {
      errorMessage.value = ''
    }, 1500)
  }
}

onMounted(async () => {
  if (authStore.isLoggedIn) newCommentAuthor.value = authStore.user?.firstName!
  await Promise.all([loadEvent(), loadComments()])
  increaseViewCount()
})
</script>

<template>
  <div class="card w-full bg-base-100 card-xl">
    <div class="card-body">
      <h1 class="card-title text-5xl mb-8">{{ event?.name }}</h1>
      <div class="flex">
        <div class="w-1/2 flex flex-col space-y-1">
          <p>
            <span class="font-semibold">Description:</span>
            {{ event?.description }}
          </p>
          <p>
            <span class="font-semibold">Event date:</span>
            {{ new Date(event?.eventDate!).toLocaleString() }}
          </p>
          <p>
            <span class="font-semibold">Created at:</span>
            {{ new Date(event?.createdAt!).toLocaleString() }}
          </p>
          <p>
            <span class="font-semibold">Author:</span>
            {{ event?.author.firstName }} {{ event?.author.lastName }}
          </p>
          <p>
            <span class="font-semibold">Location:</span> {{ event?.location }}
          </p>
          <p>
            <span class="font-semibold">Category:</span>
            {{ event?.category.name }}
          </p>

          <div class="flex items-center gap-1 text-sm opacity-60">
            <v-icon name="bi-eye-fill" /> {{ event?.views }}
          </div>

          <div class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="tag in event?.tags"
              :key="tag.id"
              class="badge badge-soft badge-warning"
            >
              #{{ tag.name }}
            </span>
          </div>

          <div class="card-actions mt-6">
            <button class="btn btn-info">Register</button>
          </div>
        </div>

        <div class="w-1/2 flex flex-col gap-6">
          <fieldset
            class="fieldset bg-base-200 border-base-300 rounded-box border p-4 flex flex-col gap-4"
          >
            <legend class="fieldset-legend text-2xl">New comment</legend>
            <input
              v-if="authStore.isLoggedIn"
              type="text"
              v-model="newCommentAuthor"
              class="input"
              disabled
            />
            <input
              v-else
              type="text"
              v-model="newCommentAuthor"
              class="input"
              placeholder="Author name"
            />
            <textarea
              v-model="newCommentContent"
              rows="3"
              class="textarea textarea-bordered w-full"
              placeholder="Write here..."
            />
            <button @click="saveComment" class="btn btn-info w-1/6 self-end">
              Save
            </button>
          </fieldset>

          <!-- Comments list -->
          <div class="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="flex flex-col justify-start items-start"
            >
              <fieldset
                class="fieldset bg-base-200 border-base-300 rounded-box border p-4 w-full"
              >
                <legend class="fieldset-legend">
                  <span class="font-semibold">{{ comment.authorName }}</span>
                  • {{ new Date(comment.createdAt).toLocaleString() }}
                </legend>
                <p class="mb-2">{{ comment.content }}</p>
                <div class="flex justify-end gap-2">
                  <v-icon class="cursor-pointer" name="bi-hand-thumbs-up" />
                  {{ comment.likeCount }}
                  <v-icon class="cursor-pointer" name="bi-hand-thumbs-down" />
                  {{ comment.dislikeCount }}
                </div>
              </fieldset>
            </div>
          </div>

          <!-- Pagination -->
          <div class="px-4 py-3">
            <div class="flex items-center justify-center gap-3">
              <button
                class="btn btn-sm"
                @click="prevPage"
                :disabled="currentPage <= 1"
              >
                Prev
              </button>
              <span class="text-sm opacity-80"
                >Page {{ currentPage }} / {{ totalPages }}</span
              >
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
          </div>
        </div>
      </div>

      <!-- Error messages -->
      <ul>
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
    </div>
  </div>
</template>
