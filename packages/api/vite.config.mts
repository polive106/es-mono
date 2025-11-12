import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'hono',
        '@hono/node-server',
        '@es-mono/database',
        '@es-mono/database/schema',
        '@es-mono/shared',
        'drizzle-orm',
        'better-sqlite3',
        'crypto',
        'path',
        'fs',
      ],
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
