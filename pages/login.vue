<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await auth.login(email.value, password.value)
  if (success) {
    navigateTo('/dashboard')
  } else {
    alert('Falha no login')
  }
}
</script>


<template>
  <div class="flex flex-col md:flex-row h-auto md:h-screen w-full bg-[#0B1437]">
    <!-- Left: Login Form -->
    <div class="w-full md:w-1/2 text-white flex flex-col justify-between px-6 py-8 min-h-screen md:min-h-0">
      <!-- Top -->
      <p class="max-w-md mx-auto w-full text-sm text-gray-300 mb-6">< Back to homepage</p>
      <div class="max-w-md mx-auto w-full">
        <div class="flex-grow ">
          <h2 class="text-3xl font-bold mb-2">Sign In</h2>
        <p class="text-gray-400 mb-6">Enter your email and password to sign in!</p>
        <button class="w-full flex items-center justify-center gap-2 bg-gray-800 text-sm py-2 rounded-xl mb-4 bg-opacity-40 hover:bg-opacity-85 transition duration-300">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-4 h-4" />
          Sign in with Google
        </button>
        <div class="flex items-center my-4">
          <hr class="flex-grow border-gray-600" />
          <span class="text-xs text-gray-400 px-2">or</span>
          <hr class="flex-grow border-gray-600" />
        </div>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="text-sm block mb-1">Email</label>
            <input v-model="email" type="email" placeholder="mail@example.com"
              class="w-full p-2 bg-transparent border border-gray-600 rounded text-sm focus:outline-none focus:ring focus:ring-indigo-500" />
          </div>
          <div>
            <label class="text-sm block mb-1">Password</label>
            <input v-model="password" type="password" placeholder="Min. 8 characters"
              class="w-full p-2 bg-transparent border border-gray-600 rounded text-sm focus:outline-none focus:ring focus:ring-indigo-500" />
          </div>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="accent-indigo-500" />
              Keep me logged in
            </label>
            <a href="#" class="hover:underline">Forgot password?</a>
          </div>
          <button type="submit" class="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl transition duration-300 text-white font-semibold">
            Sign In
          </button>
        </form>
        <p class="text-xs text-center text-gray-400 mt-4">
          Not registered yet?
          <a href="#" class="font-semibold text-white hover:underline">Create an Account</a>
        </p>
        </div>

      </div>
      <!-- Footer -->
      <p class="text-xs text-center text-gray-500 mt-10">© 2025 Opsync. All Rights Reserved. Made with love by you.</p>
    </div>

    <!-- Right: Visual/Branding -->
    <div class="w-full md:w-1/2 relative bg-gradient-to-br from-purple-600 to-indigo-700 text-white overflow-hidden min-h-[40vh] md:min-h-full rounded-t-[10rem] md:rounded-t-none md:rounded-bl-[10rem]">
      <!-- Branding -->
      <div class="flex flex-col justify-center items-center h-full relative z-10 text-center px-6 py-10">
        <div class="text-6xl font-bold mb-4">🧠</div>
        <h1 class="text-3xl font-semibold mb-2">OpsyncTech</h1>
        <p class="text-sm mb-4 text-gray-200">Learn more about Opsync</p>
        <a href="#" class="text-white underline text-lg">opsynctech.com</a>
      </div>
      <!-- Bottom links -->
      <div class="absolute bottom-4 w-full text-center text-sm text-white space-x-4 hidden md:block">
        <a href="#" class="hover:underline">Marketplace</a>
        <a href="#" class="hover:underline">License</a>
        <a href="#" class="hover:underline">Terms of Use</a>
        <a href="#" class="hover:underline">Blog</a>
      </div>
    </div>
  </div>
</template>
