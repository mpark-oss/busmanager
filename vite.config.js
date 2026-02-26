import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // '/api'로 시작하는 요청을 로스트아크 API 서버로 전달합니다.
      '/api': {
        target: 'https://developer-lostark.game.onstove.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})