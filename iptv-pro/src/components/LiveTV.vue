<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Parser } from 'm3u8-parser'

const emit = defineEmits(['play'])

// Veriler
const newPlaylistUrl = ref('')
const newPlaylistName = ref('')
const playlists = ref<any[]>([])
const selectedPlaylistId = ref<number | null>(null)
const channels = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('Tümü')
const categories = ref<string[]>(['Tümü'])
const isMenuOpen = ref(false)

// SABİT KULLANICI ID (Artık login yok, herkes admin)
const USER_ID = '11111111-1111-1111-1111-111111111111'

// --- 1. Playlistleri Getir ---
const fetchPlaylists = async () => {
  // admin-user'a ait listeleri çek
  const { data } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', USER_ID) 
    .order('created_at', { ascending: true })

  if (data) {
    playlists.value = data
    if (!selectedPlaylistId.value && data.length > 0) {
      selectPlaylist(data[0])
    }
  }
}

// --- 2. Yeni Playlist Ekle ---
const addPlaylist = async () => {
  if (!newPlaylistUrl.value) return
  loading.value = true
  
  const name = newPlaylistName.value || `Liste ${playlists.value.length + 1}`

  const { error } = await supabase.from('playlists').insert({
    user_id: USER_ID, // Sabit ID kullanıyoruz
    url: newPlaylistUrl.value,
    name: name
  })

  if (error) {
    alert('Hata: ' + error.message)
  } else {
    newPlaylistUrl.value = ''
    newPlaylistName.value = ''
    await fetchPlaylists()
    alert('Liste eklendi!')
  }
  loading.value = false
}

// --- 3. Playlist Sil ---
const deletePlaylist = async (id: number) => {
  if (!confirm('Silinsin mi?')) return
  await supabase.from('playlists').delete().eq('id', id)
  if (selectedPlaylistId.value === id) {
    channels.value = []
    selectedPlaylistId.value = null
  }
  await fetchPlaylists()
}

// --- 4. Playlist Seç ve Yükle ---
const selectPlaylist = async (playlist: any) => {
  selectedPlaylistId.value = playlist.id
  loading.value = true
  isMenuOpen.value = false
  
  try {
    const response = await fetch(playlist.url)
    const text = await response.text()
    const parser = new Parser()
    parser.push(text)
    parser.end()

    const parsedChannels = parser.manifest.segments.map((seg: any, index: number) => {
      const info = seg.title || ""
      const groupMatch = info.match(/group-title="([^"]*)"/)
      const logoMatch = info.match(/tvg-logo="([^"]*)"/)
      const nameMatch = info.split(',').pop()
      return {
        id: index,
        name: nameMatch ? nameMatch.trim() : 'Kanal',
        group: groupMatch ? groupMatch[1] : 'Diğer',
        logo: logoMatch ? logoMatch[1] : null,
        url: seg.uri
      }
    })
    channels.value = parsedChannels
    const groups = parsedChannels.map((c: any) => c.group || 'Diğer')
    categories.value = ['Tümü', ...[...new Set(groups)].sort()]
    selectedCategory.value = 'Tümü'
    
  } catch (e) {
    console.error(e)
    alert('Liste yüklenemedi.')
  } finally {
    loading.value = false
  }
}

const handleKey = (e: KeyboardEvent, channel: any) => {
  if (e.key === 'Enter') {
    emit('play', { url: channel.url, type: 'm3u', title: channel.name })
  }
}

onMounted(() => {
  fetchPlaylists()
})

const filteredChannels = computed(() => {
  let result = channels.value
  if (selectedCategory.value !== 'Tümü') result = result.filter(c => c.group === selectedCategory.value)
  if (searchQuery.value) result = result.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return result
})
</script>

<template>
  <div class="flex h-full relative">
    <div 
      :class="isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed inset-y-0 left-0 z-30 w-64 bg-[#151515] border-r border-gray-800 transition-transform duration-300 lg:static lg:block flex flex-col p-4 pt-16 lg:pt-4"
    >
      <h2 class="text-lg font-bold text-red-600 mb-4 flex justify-between items-center">
        LİSTELERİM
        <button @click="isMenuOpen = false" class="lg:hidden text-white">✕</button>
      </h2>

      <div class="mb-6 space-y-2 border-b border-gray-800 pb-4">
        <input v-model="newPlaylistName" type="text" placeholder="Liste Adı" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white">
        <input v-model="newPlaylistUrl" type="text" placeholder="M3U Linki" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white">
        <button @click="addPlaylist" class="w-full bg-red-700 hover:bg-red-600 text-white text-xs font-bold py-2 rounded">
          {{ loading ? '...' : '+ Ekle' }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-2">
        <div 
          v-for="pl in playlists" 
          :key="pl.id"
          class="group flex items-center justify-between p-3 rounded cursor-pointer"
          :class="selectedPlaylistId === pl.id ? 'bg-red-900/30 border border-red-700' : 'bg-gray-800 hover:bg-gray-700'"
          @click="selectPlaylist(pl)"
        >
          <span class="text-sm font-medium truncate">{{ pl.name }}</span>
          <button @click.stop="deletePlaylist(pl.id)" class="text-gray-500 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">🗑️</button>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col h-full bg-[#0f0f0f] w-full">
      <div class="p-4 bg-[#1a1a1a] flex gap-3 items-center sticky top-0 z-20">
        <button @click="isMenuOpen = true" class="lg:hidden p-2 bg-gray-800 rounded text-white">☰</button>
        <input v-model="searchQuery" type="text" placeholder="Kanal ara..." class="flex-1 bg-gray-900 text-white rounded-full px-4 py-2 border border-gray-700 outline-none">
        <select v-model="selectedCategory" class="bg-gray-900 text-white rounded-full px-4 py-2 border border-gray-700 outline-none max-w-[150px]">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="flex-1 overflow-y-auto p-4 pb-24">
        <div v-if="loading" class="flex justify-center pt-20">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
        </div>
        <div v-else-if="channels.length === 0" class="text-center text-gray-500 pt-20">
           Lütfen soldan bir liste seçin veya yeni liste ekleyin.
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div 
            v-for="channel in filteredChannels" 
            :key="channel.id"
            @click="emit('play', { url: channel.url, type: 'm3u', title: channel.name })" 
            @keydown="handleKey($event, channel)"
            class="group bg-[#1a1a1a] p-2 rounded-lg cursor-pointer hover:bg-[#252525] hover:scale-105 transition-all"
            tabindex="0"
          >
            <div class="aspect-video bg-black/40 rounded flex items-center justify-center mb-2 overflow-hidden">
              <img v-if="channel.logo" :src="channel.logo" class="h-full object-contain p-1" @error="$event.target.style.display='none'">
              <span v-else class="text-2xl opacity-50">📺</span>
            </div>
            <h3 class="text-xs font-medium text-gray-300 group-hover:text-white truncate">{{ channel.name }}</h3>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isMenuOpen" @click="isMenuOpen = false" class="fixed inset-0 bg-black/80 z-20 lg:hidden"></div>
  </div>
</template>