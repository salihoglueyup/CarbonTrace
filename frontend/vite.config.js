import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build timestamp for cache busting
const buildTimestamp = Date.now()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Cache ayarları - otomatik temizleme için
  cacheDir: 'node_modules/.vite',

  // Define global constants for cache busting
  define: {
    __BUILD_TIMESTAMP__: buildTimestamp,
  },

  // Server ayarları - AUTO CACHE CLEAN
  server: {
    port: 5173,
    strictPort: true,

    // HMR ayarları - tam sayfa yenileme
    hmr: {
      overlay: true,
      // Hata durumunda tam yenileme
      timeout: 30000,
    },

    // Dosya izleme ayarları
    watch: {
      usePolling: false,
      // CSS ve JS değişikliklerini anında algıla
      interval: 100,
    },

    // Anti-cache HTTP headers - CTRL+SHIFT+F5'e gerek kalmaz
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'ETag': 'false',
      'Last-Modified': new Date().toUTCString(),
      // Cache busting için özel header
      'X-Build-Timestamp': String(buildTimestamp),
    },

    // Pre-transform - daha hızlı yükleme
    warmup: {
      clientFiles: [
        './src/App.jsx',
        './src/index.css',
        './src/main.jsx',
      ],
    },
  },

  // Build optimizasyonları
  build: {
    // Her build'de benzersiz hash oluştur
    rollupOptions: {
      output: {
        // Cache busting için hash kullan
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Kaynak haritaları geliştirme için
    sourcemap: true,
    // Eski cache'leri temizle
    emptyOutDir: true,
  },

  // CSS işleme
  css: {
    devSourcemap: true,
    // CSS modülleri için hash
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },

  // Optimizasyon - dependency pre-bundling
  optimizeDeps: {
    // Development'ta npm run dev:clean kullanın cache temizlemek için
    force: false,
    // Exclude edilecek paketler (eğer sorun çıkarırsa)
    exclude: [],
    // Include edilecek paketler
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },

  // Preview server (npm run preview)
  preview: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  },
})

