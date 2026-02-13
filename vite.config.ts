import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  
  return {
    plugins: [react()],
    base: isDev ? '/' : './',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      manifest: true,
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
        treeshake: {
          moduleSideEffects: true,
        },
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
