import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo (npm run dev), reenvia /api -> backend en :8080.
    // Asi la misma ruta '/api' funciona en dev (proxy) y en Docker (nginx).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // El backend NO tiene prefijo /api: lo quitamos al reenviar.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
