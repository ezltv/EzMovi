<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const props = defineProps(['media'])
const emit = defineEmits(['close'])
const videoElement = ref(null)
let player: any = null

// --- GİZLEME MANTIĞI (YADİGAR DOSTU) ---
const showControls = ref(true)
let idleTimer: any = null

const resetActivity = () => {
  showControls.value = true
  if (idleTimer) clearTimeout(idleTimer)
  
  // TV'de kumanda ile işlem yapmak yavaş olabilir, süreyi 5 saniye yaptık
  idleTimer = setTimeout(() => {
    showControls.value = false
  }, 5000)
}

onMounted(() => {
  // Olay Dinleyicileri (Kumanda, Mouse, Dokunmatik)
  window.addEventListener('mousemove', resetActivity)
  window.addEventListener('keydown', resetActivity)
  window.addEventListener('click', resetActivity)
  window.addEventListener('touchstart', resetActivity)
  
  resetActivity()

  // CANLI TV PLAYER (M3U)
  if (props.media.type === 'm3u' && videoElement.value) {
    player = videojs(videoElement.value, {
      autoplay: true,
      controls: true,
      fluid: true,
      preload: 'auto', // Eski cihazlarda önbellekleme hayat kurtarır
      html5: { 
        vhs: { 
          // ÖNEMLİ: Eski TV tarayıcıları bazen kendi oynatıcılarıyla (Native)
          // daha iyi performans verir. JS motorunu yormamak için bunu false yapıyoruz.
          overrideNative: false 
        },
        nativeAudioTracks: true,
        nativeVideoTracks: true
      },
      sources: [{ src: props.media.url, type: 'application/x-mpegURL' }]
    })
    
    // Video.js kendi aktivitesini bildirirse arayüzü göster
    player.on('useractive', () => { showControls.value = true })
    player.on('userinactive', () => { showControls.value = false })
    
    // Hata yakalama
    player.on('error', () => {
      console.log("Player hatası, native fallback devrede.")
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', resetActivity)
  window.removeEventListener('keydown', resetActivity)
  window.removeEventListener('click', resetActivity)
  window.removeEventListener('touchstart', resetActivity)
  if (idleTimer) clearTimeout(idleTimer)
  if (player) player.dispose()
})

// --- LİNK OLUŞTURUCU (YENİ SİSTEM ENTEGRE EDİLDİ) ---
const embedUrl = computed(() => {
  // 1. Yeni Sistem (Detay sayfasından hazır link gelirse)
  if (props.media.type === 'embed') {
    return props.media.url
  }
  // 2. Yedek Sistem (Eski usül ID gelirse)
  else if (props.media.type === 'movie') {
    return `https://vidsrc.xyz/embed/movie/${props.media.id}`
  } 
  else if (props.media.type === 'tv') {
    // Varsayılan 1. sezon 1. bölüm
    return `https://vidsrc.xyz/embed/tv/${props.media.id}/1/1`
  }
  return ''
})
</script>

<template>
  <div class="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden">
    
    <div 
      class="absolute top-0 w-full p-4 flex justify-between items-center z-[70] bg-black/90 transition-opacity duration-500 ease-in-out"
      :class="showControls ? 'opacity-100 visible' : 'opacity-0 invisible'"
    >
      <h2 class="text-white font-bold truncate pr-4 text-xl drop-shadow-md">
        {{ media.title || media.name }}
      </h2>

      <button 
        @click="emit('close')" 
        class="bg-red-700 hover:bg-red-600 text-white p-3 rounded-full border border-white/20 focus:ring-4 focus:ring-white transition-transform transform active:scale-95"
        title="Kapat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="media.type === 'm3u'" class="w-full h-full flex items-center justify-center bg-black">
      <video ref="videoElement" class="video-js vjs-default-skin vjs-big-play-centered w-full h-full" playsinline></video>
    </div>

    <div v-else class="w-full h-full bg-black">
      <iframe 
        :src="embedUrl" 
        class="w-full h-full border-0" 
        allowfullscreen 
        allow="autoplay; fullscreen; encrypted-media"
      ></iframe>
    </div>
    
  </div>
</template>