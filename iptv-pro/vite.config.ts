import { defineConfig } from 'vite'
import vue from '@vitejs/vue'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // BURASI SİHİRLİ KISIM: Kodu eski tarayıcılar için dönüştürür
    legacy({
      targets: ['defaults', 'not IE 11', 'chrome >= 52'], // LG WebOS Chrome 38-50 arası kullanır
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: true
    })
  ],
  build: {
    target: 'es2015', // Hedefi düşürdük
    minify: 'terser', // Eski usül sıkıştırma
  }
})