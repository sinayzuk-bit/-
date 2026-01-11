import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Allows process.env.API_KEY to be used in the client code if set in Vercel settings
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})