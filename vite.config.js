import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relativa: el build funciona en la raíz de un dominio o en una subcarpeta
// (por ejemplo GitHub Pages en /skilly/).
export default defineConfig({
  plugins: [react()],
  base: './',
});
