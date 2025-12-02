<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import MediaDetail from './MediaDetail.vue' // <--- Yeni bileşenimizi çağırıyoruz

const emit = defineEmits(['play'])

const TMDB_API_KEY = import.meta.env.VITE_TMDB_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMG_URL = 'https://image.tmdb.org/t/p/w500'

// Veriler
const content = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedGenre = ref('trend')
const selectedMediaId = ref<number | null>(null)
const selectedMediaType = ref<'movie'|'tv'>('movie')

// Türler (Manuel listeledik, istersen API'den de çekilebilir)
const genres = [
  { id: 'trend', name: '🔥 Trendler' },
  { id: '28', name: 'Aksiyon' },
  { id: '35', name: 'Komedi' },
  { id: '27', name: 'Korku' },
  { id: '878', name: 'Bilim Kurgu' },
  { id: '16', name: 'Animasyon' },
  { id: '18', name: 'Dram' }
]

// İçerik Getir (Trend veya Kategoriye göre)
const fetchContent = async () => {
  loading.value = true
  try {
    let url = ''
    if (searchQuery.value.length > 2) {
      // Arama Modu
      url = `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=tr-TR&query=${searchQuery.value}`
    } else if (selectedGenre.value === 'trend') {
      // Trend Modu
      url = `${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=tr-TR`
    } else {
      // Kategori Modu (Sadece Filmleri çeker örnek olarak)
      url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&with_genres=${selectedGenre.value}`
    }

    const res = await axios.get(url)
    // Filtreleme: Resmi olmayan veya kişisi olmayanları çıkar
    content.value = res.data.results.filter((i:any) => i.poster_path && (i.media_type !== 'person'))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Arama kutusunu dinle (Yazarken bekleme süresi koyduk - Debounce)
let timeout: any
watch(searchQuery, () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    fetchContent()
  }, 500) // Yarım saniye bekle sonra ara
})

// Tür değişince getir
watch(selectedGenre, () => {
  searchQuery.value = '' // Tür seçince aramayı temizle
  fetchContent()
})

// Detay Aç
const openDetail = (item: any) => {
  selectedMediaId.value = item.id
  // API'den gelen veride media_type yoksa (discover endpointinde olmaz), varsayılan movie olsun
  selectedMediaType.value = item.media_type || 'movie'
}

// Detaydan gelen "Oynat" emrini yukarı (Home'a) ilet
const handlePlayFromDetail = (mediaInfo: any) => {
  selectedMediaId.value = null // Detayı kapat
  emit('play', mediaInfo) // Player'ı aç
}

onMounted(() => {
  fetchContent()
})
</script>

<template>
  <div class="h-full flex flex-col">
    
    <MediaDetail 
      v-if="selectedMediaId" 
      :mediaId="selectedMediaId" 
      :mediaType="selectedMediaType"
      @close="selectedMediaId = null"
      @play="handlePlayFromDetail"
    />

    <div class="p-4 bg-[#0f0f0f] sticky top-0 z-10 space-y-4 shadow-lg">
      
      <div class="relative">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Film veya Dizi ara..." 
          class="w-full bg-[#1a1a1a] text-white rounded-xl px-12 py-3 border border-gray-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
        >
        <svg class="w-6 h-6 text-gray-500 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          v-for="g in genres" :key="g.id"
          @click="selectedGenre = g.id"
          class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border border-gray-800"
          :class="selectedGenre === g.id ? 'bg-red-700 text-white border-red-600' : 'bg-[#1a1a1a] text-gray-400 hover:bg-gray-800'"
        >
          {{ g.name }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 pb-24">
      
      <div v-if="loading" class="flex justify-center pt-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>

      <div v-else-if="content.length === 0" class="text-center text-gray-500 pt-10">
        Sonuç bulunamadı.
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <div 
          v-for="item in content" :key="item.id"
          @click="openDetail(item)"
          class="group relative cursor-pointer bg-[#1a1a1a] rounded-xl overflow-hidden transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-red-900/20"
        >
          <div class="aspect-[2/3] w-full relative">
            <img :src="IMG_URL + item.poster_path" class="w-full h-full object-cover" loading="lazy">
            <div class="absolute top-2 right-2 bg-black/70 text-yellow-500 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
              {{ item.vote_average?.toFixed(1) }}
            </div>
          </div>
          
          <div class="p-3">
            <h3 class="text-sm font-bold text-gray-200 truncate">{{ item.title || item.name }}</h3>
            <p class="text-xs text-gray-500 mt-1 capitalize">{{ item.media_type === 'tv' ? '📺 Dizi' : '🎬 Film' }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>