import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'force-exit',
          closeBundle() {
            // Se estiver na Vercel, força o processo a encerrar
            if (process.env.VERCEL) {
              setTimeout(() => process.exit(0), 0);
            }
          }
        }
      ]
    }
  }
})