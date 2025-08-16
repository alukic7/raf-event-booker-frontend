<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleError } from '../lib/http'
import { useAuthStore } from '../store/authStore'

const store = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

const errorMessage = ref<string | null>(null)

async function handleLogin() {
  errorMessage.value = null
  loading.value = true
  try {
    await axios.post(
      'http://localhost:3000/auth/login',
      { email: email.value, password: password.value },
      { withCredentials: true }
    )
    await store.fetchMe()
    router.push('/admin/dashboard')
  } catch (err) {
    errorMessage.value = handleError(err)
    setTimeout(() => {
      errorMessage.value = null
    }, 1500)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-4">
    <input
      v-model="email"
      class="input validator"
      type="email"
      required
      placeholder="johndoe@gmail.com"
    />
    <input
      v-model="password"
      type="password"
      class="input validator"
      required
      placeholder="Password"
      minlength="8"
      title="Length must be at least 8 characters"
    />
    <p class="validator-hint text-sm opacity-70">
      Must be at least 8 characters.
    </p>

    <button v-on:click="handleLogin" class="btn btn-outline btn-info">
      Log in
    </button>

    <div v-if="errorMessage" role="alert" class="alert alert-error mt-2">
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
  </div>
</template>
