import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // <-- DÜZELTİLEN SATIR (plugin-vue)
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11', 'chrome >= 52'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: true
    })
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
  }
})