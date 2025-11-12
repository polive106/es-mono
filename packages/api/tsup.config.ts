import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false, // Disable DTS generation temporarily due to tsconfig issues
  clean: true,
  sourcemap: true,
});
