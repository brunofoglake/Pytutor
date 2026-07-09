import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Pytutor/', // troque pelo nome exato do seu repositório no GitHub
})