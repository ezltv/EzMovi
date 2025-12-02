<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const props = defineProps(['media'])
const emit = defineEmits(['close'])
const videoElement = ref(null)
let player: any = null

// --- GİZLEME MANTIĞI ---
const showControls = ref(true)
let idleTimer: any = null

const resetActivity = () => {
  showControls.value = true
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => { showControls.value = false }, 4000)
}

onMounted(() => {
  window.addEventListener('mousemove', resetActivity)
  window.addEventListener('keydown', resetActivity)
  window.addEventListener('click', resetActivity)
  
  resetActivity()

  if (props.media.type === 'm3u' && videoElement.value) {
    player = videojs(videoElement.value, {
      autoplay: true,
      controls: true,
      fluid: true,
      preload: 'auto',
      html5: { 
        vhs: { overrideNative: false }, // Native player her zaman daha performanslıdır
        nativeAudioTracks: true,
        nativeVideoTracks: true
      },
      sources: [{ src: props.media.url, type: 'application/x-mpegURL' }]
    })
    
    player.on('useractive', () => { showControls.value = true })
    player.on('userinactive', () => { showControls.value = false })
    
    player.on('error', () => { console.log("Player hatası, native fallback devrede.") })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', resetActivity)
  window.removeEventListener('keydown', resetActivity)
  window.removeEventListener('click', resetActivity)
  if (idleTimer) clearTimeout(idleTimer)
  if (player) player.dispose()
})

const embedUrl = computed(() => {
  if (props.media.type === 'movie') return `https://vidsrc.xyz/embed/movie/${props.media.id}`
  else if (props.media.type === 'tv') return `https://vidsrc.xyz/embed/tv/${props.media.id}/1/1`
  return ''
})
</script>

<template>
  <div class="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden">
    
    <div 
      class="absolute top-0 w-full p-4 flex justify-between items-center z-[70] transition-opacity duration-500 bg-black/80 backdrop-blur-md"
      :class="showControls ? 'opacity-100 visible' : 'opacity-0 invisible'"
    >
      <h2 class="text-white font-bold truncate pr-4 text-xl shadow-black drop-shadow-md">
        {{ media.title || media.name }}
      </h2>

      <button 
        @click="emit('close')" 
        class="bg-red-700/90 hover:bg-red-600 text-white p-2 rounded-full shadow-lg border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="media.type === 'm3u'" class="w-full h-full flex items-center justify-center bg-black">
      <video ref="videoElement" class="video-js vjs-default-skin w-full h-full" playsinline></video>
    </div>

    <div v-else class="w-full h-full bg-black">
      <iframe :src="embedUrl" class="w-full h-full border-0" allowfullscreen allow="autoplay; fullscreen"></iframe>
    </div>
    
  </div>
</template>