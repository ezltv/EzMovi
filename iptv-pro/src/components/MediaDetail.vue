<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

const props = defineProps(['mediaId', 'mediaType']) // ID ve Tip (movie/tv) gelir
const emit = defineEmits(['close', 'play'])

const TMDB_API_KEY = import.meta.env.VITE_TMDB_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMG_URL = 'https://image.tmdb.org/t/p/w1280' // Yüksek kalite kapak

const details = ref<any>(null)
const loading = ref(true)
const seasons = ref<any[]>([])
const selectedSeason = ref(1)
const selectedEpisode = ref(1)
const episodeCount = ref(0) // Seçilen sezondaki bölüm sayısı

// Detayları Çek
const fetchDetails = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${BASE_URL}/${props.mediaType}/${props.mediaId}?api_key=${TMDB_API_KEY}&language=tr-TR`)
    details.value = res.data

    // Eğer Diziyse Sezon Bilgilerini Al
    if (props.mediaType === 'tv') {
      seasons.value = res.data.seasons.filter((s: any) => s.season_number > 0) // 0. sezonu (özel bölümleri) gizle
      // Varsayılan olarak 1. sezonun bölüm sayısını ayarla
      updateEpisodeCount()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Sezon değişince o sezondaki bölüm sayısını bul
const updateEpisodeCount = () => {
  const season = seasons.value.find(s => s.season_number === selectedSeason.value)
  episodeCount.value = season ? season.episode_count : 1
  selectedEpisode.value = 1 // Sezon değişince 1. bölüme dön
}

// Play Butonuna Basılınca
const handlePlay = () => {
  let url = ''
  let title = details.value.title || details.value.name

  if (props.mediaType === 'movie') {
    // Film Linki
    url = `https://vidsrc.xyz/embed/movie/${props.mediaId}`
  } else {
    // Dizi Linki (Sezon ve Bölüm eklenir)
    url = `https://vidsrc.xyz/embed/tv/${props.mediaId}/${selectedSeason.value}/${selectedEpisode.value}`
    title += ` - S${selectedSeason.value} B${selectedEpisode.value}`
  }

  // Ana sayfaya "Oynat" emri gönder
  emit('play', { url, type: 'embed', title }) // 'embed' tipini kullanacağız
}

onMounted(() => {
  fetchDetails()
})
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
    
    <div v-if="loading" class="text-white">Yükleniyor...</div>

    <div v-else-if="details" class="bg-[#1a1a1a] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
      
      <button @click="$emit('close')" class="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="hidden md:block w-1/3 relative">
        <img :src="IMG_URL + details.poster_path" class="w-full h-full object-cover">
      </div>

      <div class="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
        
        <div class="md:hidden w-full h-48 bg-cover bg-center rounded-lg mb-4 relative" :style="`background-image: url(${IMG_URL + details.backdrop_path})`">
          <div class="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
        </div>

        <h2 class="text-3xl font-bold text-white mb-2">{{ details.title || details.name }}</h2>
        
        <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span v-if="details.release_date || details.first_air_date">{{ (details.release_date || details.first_air_date).substring(0,4) }}</span>
          <span class="flex items-center gap-1 text-yellow-500">
            ★ {{ details.vote_average.toFixed(1) }}
          </span>
          <span class="border border-gray-600 px-2 py-0.5 rounded text-xs">{{ details.genres.map((g:any) => g.name).join(', ') }}</span>
        </div>

        <p class="text-gray-300 text-sm leading-relaxed mb-6 flex-1">
          {{ details.overview || 'Özet bilgisi bulunamadı.' }}
        </p>

        <div v-if="props.mediaType === 'tv'" class="bg-gray-800/50 p-4 rounded-xl mb-6 border border-gray-700">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Sezon</label>
              <select v-model="selectedSeason" @change="updateEpisodeCount" class="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 outline-none">
                <option v-for="s in seasons" :key="s.id" :value="s.season_number">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Bölüm</label>
              <select v-model="selectedEpisode" class="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 outline-none">
                <option v-for="n in episodeCount" :key="n" :value="n">{{ n }}. Bölüm</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          @click="handlePlay" 
          class="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
          HEMEN İZLE
        </button>

      </div>
    </div>
  </div>
</template>