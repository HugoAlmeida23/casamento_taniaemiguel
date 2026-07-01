// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Custom domain served from the root.
  site: 'https://taniaemiguel.pt',
  base: '/',
  integrations: [tailwind()],
});
