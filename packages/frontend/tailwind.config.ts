import type { Config } from 'tailwindcss';
import designSystemConfig from '@es-mono/design-system/tailwind.config';

export default {
  ...designSystemConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../design-system/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
