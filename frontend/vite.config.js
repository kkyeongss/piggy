import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 개발 서버(5173)에서 /api, /oauth2 요청을 백엔드(8080)로 프록시.
// 같은 오리진처럼 동작해 CORS 문제 없이 세션 쿠키가 유지됩니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
