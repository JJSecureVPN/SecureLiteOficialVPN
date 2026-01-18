import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ command }) => {
  const plugins = [react()];
  if (process.env.ANALYZE) {
    plugins.push(
      // genera stats.html en dist
      visualizer({ filename: 'dist/stats.html', open: false }) as any
    );
  }

  return {
    plugins,
  // En build usamos rutas relativas para que dist/index.html funcione
  // al abrirse desde filesystem o dentro de un WebView.
    // En build usamos rutas relativas para que dist/index.html funcione
    // al abrirse desde filesystem o dentro de un WebView.
    base: command === 'build' ? './' : '/',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      manifest: true,
      cssCodeSplit: true,
      rollupOptions: {
        treeshake: {
          // Mantiene imports por efectos laterales (p.ej. hojas de estilo importadas).
          // Importante para que el build emita CSS y para que build-inline pueda inlinearlo.
          moduleSideEffects: true,
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
