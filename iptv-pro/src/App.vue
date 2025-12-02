<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'
import Auth from './components/Auth.vue'
import Home from './components/Home.vue'

const session = ref<Session | null>(null)
const loading = ref(true)

onMounted(() => {
  // 1. Sayfa ilk açıldığında oturum var mı kontrol et
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
    loading.value = false
  })

  // 2. Oturum durumu değişirse (giriş/çıkış) yakala
  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#0f0f0f] text-white font-sans antialiased overflow-hidden select-none">
    
    <div v-if="loading" class="flex items-center justify-center h-screen bg-black">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
    </div>

    <div v-else-if="!session" class="h-screen w-full flex items-center justify-center">
       <Auth />
    </div>

    <div v-else class="h-screen w-full">
       <Home :session="session" />
    </div>

  </div>
</template>