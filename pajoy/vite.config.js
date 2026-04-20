import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'frontend',
  base: './',
  plugins: [react()],
  resolve: { },
  build: { outDir: 'dist', emptyOutDir: true },
  server: { port: 5173, strictPort: true }
});
