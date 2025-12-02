<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['play'])
const TMDB_API_KEY = import.meta.env.VITE_TMDB_KEY // .env dosyanı kontrol et
const BASE_URL = 'https://api.themoviedb.org/3'
const IMG_URL = 'https://image.tmdb.org/t/p/w500'

const trends = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axios.get(`${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=tr-TR`)
    trends.value = res.data.results
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4 pb-24">
    <h2 class="text-xl font-bold mb-4 border-l-4 border-red-600 pl-2">Haftanın Trendleri</h2>
    
    <div v-if="loading" class="text-center py-10">Yükleniyor...</div>
    
    <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div 
        v-for="item in trends" :key="item.id"
        @click="emit('play', { id: item.id, type: item.media_type === 'tv' ? 'tv' : 'movie', title: item.title || item.name })"
        class="relative group cursor-pointer transition-transform hover:scale-105"
      >
        <img :src="IMG_URL + item.poster_path" class="rounded-lg shadow-lg w-full aspect-[2/3] object-cover">
        <div class="mt-2 text-sm font-medium truncate">{{ item.title || item.name }}</div>
        <div class="text-xs text-gray-500 capitalize">{{ item.media_type === 'tv' ? 'Dizi' : 'Film' }}</div>
      </div>
    </div>
  </div>
</template>