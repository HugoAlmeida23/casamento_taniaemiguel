// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://hugoalmeida23.github.io',
  base: '/casamento_taniaemiguel',
  integrations: [tailwind()],
});
