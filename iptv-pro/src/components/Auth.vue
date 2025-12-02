<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../supabase'

const loading = ref(false)
const email = ref('')
const message = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    message.value = ''
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        // Redirect URL, production'da kendi domainin olacak, şimdilik localhost
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) throw error
    message.value = 'Giriş linki e-postana gönderildi! Lütfen kontrol et.'
  } catch (error: any) {
    message.value = error.error_description || error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md p-8 space-y-8 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-red-600 tracking-tighter">Ez Movi</h1>
      <p class="mt-2 text-gray-400">Devam etmek için giriş yapın</p>
    </div>

    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div>
        <label for="email" class="sr-only">Email adresi</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          v-model="email"
          class="appearance-none rounded-lg relative block w-full px-6 py-4 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-lg transition-colors"
          placeholder="Email adresi"
          tabindex="1"
        />
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-500 disabled:opacity-50 transition-all transform active:scale-95"
          tabindex="2"
        >
          <span v-if="loading">Gönderiliyor...</span>
          <span v-else>Sihirli Link Gönder</span>
        </button>
      </div>

      <div v-if="message" class="text-center text-sm p-4 rounded bg-gray-800" :class="message.includes('kontrol') ? 'text-green-400' : 'text-red-400'">
        {{ message }}
      </div>
    </form>
  </div>
</template>