import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Base path for GitHub Pages.
 *
 * - Default './' (relative) works for ANY repository name, because BLOOM uses
 *   HashRouter — every route lives after the `#`, so the server only ever
 *   serves index.html.
 * - The GitHub Actions workflow sets BASE_PATH=/<your-repo-name>/ automatically.
 * - To hardcode it, replace the fallback below, e.g. '/bloom/'.
 */
const base = process.env.BASE_PATH || './';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('@react-three')) return 'r3f';
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          return undefined;
        },
      },
    },
  },
});
