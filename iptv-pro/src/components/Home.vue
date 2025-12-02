<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from '../supabase'
import LiveTV from './LiveTV.vue'
import Cinema from './Cinema.vue'
import Player from './Player.vue'

const props = defineProps(['session'])

// Sekme Yönetimi
const activeTab = ref<'tv' | 'cinema'>('tv')
const isPlayerOpen = ref(false)
const currentMedia = ref<any>(null)
const isFullscreen = ref(false)

// UI Gizleme Mantığı (YENİ)
const showUI = ref(true)
let idleTimer: any = null

// Aktivite Algılayıcı (Mouse, Dokunma, Kumanda)
const resetActivity = () => {
  // UI'ı göster
  showUI.value = true
  
  // Eski sayacı temizle
  if (idleTimer) clearTimeout(idleTimer)
  
  // Sadece Tam Ekrandaysak yeni sayaç başlat
  if (isFullscreen.value) {
    idleTimer = setTimeout(() => {
      showUI.value = false
    }, 3000) // 3 saniye hareketsizlikte gizle
  }
}

// Tam Ekran Değişirse Sayacı Yönet
watch(isFullscreen, (newValue) => {
  if (newValue) {
    resetActivity() // Başlat
  } else {
    showUI.value = true // Normale dön
    if (idleTimer) clearTimeout(idleTimer)
  }
})

// Olay Dinleyicileri (Mouse, Klavye, Dokunma)
onMounted(() => {
  window.addEventListener('mousemove', resetActivity)
  window.addEventListener('keydown', resetActivity)
  window.addEventListener('touchstart', resetActivity)
  window.addEventListener('click', resetActivity)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', resetActivity)
  window.removeEventListener('keydown', resetActivity)
  window.removeEventListener('touchstart', resetActivity)
  window.removeEventListener('click', resetActivity)
  if (idleTimer) clearTimeout(idleTimer)
})

// Player Açma
const handlePlay = (mediaInfo: any) => {
  currentMedia.value = mediaInfo
  isPlayerOpen.value = true
}

// Çıkış Yap
const handleLogout = async () => {
  if(confirm('EzMovi\'den çıkış yapılsın mı?')) {
    await supabase.auth.signOut()
    window.location.reload()
  }
}

// Tam Ekran / TV Modu
const toggleFullscreen = async () => {
  const elem = document.documentElement
  try {
    if (!document.fullscreenElement) {
      await elem.requestFullscreen()
      isFullscreen.value = true
      // @ts-ignore
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape').catch(() => {})
      }
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (err) {
    console.error("Hata:", err)
  }
}
</script>

<template>
  <div class="h-screen w-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden relative">
    
    <Player v-if="isPlayerOpen" :media="currentMedia" @close="isPlayerOpen = false" />

    <header 
      class="shrink-0 p-3 bg-[#1a1a1a]/90 backdrop-blur-md flex justify-between items-center shadow-md border-b border-gray-800 z-40 transition-transform duration-500 ease-in-out absolute w-full top-0"
      :class="(isFullscreen && !showUI) ? '-translate-y-full' : 'translate-y-0'"
    >
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 bg-gradient-to-br from-red-800 to-red-600 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg transform -skew-x-6 border border-white/20">
          Ez
        </div>
        <h1 class="text-2xl font-bold tracking-tighter hidden md:block">
          <span class="text-white">Ez</span><span class="text-red-600">Movi</span>
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <button @click="toggleFullscreen" class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300">
          <svg v-if="!isFullscreen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <button @click="handleLogout" class="p-2 text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>
    </header>

    <main 
      class="flex-1 overflow-y-auto bg-[#0f0f0f] w-full pt-[70px] pb-[80px]"
      @scroll="resetActivity"
    >
      <KeepAlive>
        <LiveTV v-if="activeTab === 'tv'" :session="session" @play="handlePlay" />
        <Cinema v-else-if="activeTab === 'cinema'" @play="handlePlay" />
      </KeepAlive>
    </main>

    <nav 
      class="shrink-0 bg-[#151515]/90 backdrop-blur-md border-t border-gray-800 flex justify-around p-2 pb-safe z-40 transition-transform duration-500 ease-in-out absolute w-full bottom-0"
      :class="(isFullscreen && !showUI) ? 'translate-y-full' : 'translate-y-0'"
    >
      <button 
        @click="activeTab = 'tv'"
        :class="activeTab === 'tv' ? 'text-red-500 bg-red-500/10' : 'text-gray-500 hover:bg-gray-800'"
        class="flex-1 max-w-[120px] py-2 rounded-lg flex flex-col items-center transition-all"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        <span class="text-xs font-bold">CANLI TV</span>
      </button>

      <button 
        @click="activeTab = 'cinema'"
        :class="activeTab === 'cinema' ? 'text-red-500 bg-red-500/10' : 'text-gray-500 hover:bg-gray-800'"
        class="flex-1 max-w-[120px] py-2 rounded-lg flex flex-col items-center transition-all"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
        <span class="text-xs font-bold">SİNEMA</span>
      </button>
    </nav>
    
  </div>
</template>

<style>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>