import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
    }),
  ],
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
