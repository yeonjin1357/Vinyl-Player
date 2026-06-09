import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// `base` differs per deploy target. Vercel (default) serves from root.
// GitHub Pages serves from a subpath: build with DEPLOY_TARGET=gh-pages.
const base = process.env.DEPLOY_TARGET === 'gh-pages' ? '/Vinyl-Player/' : '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
