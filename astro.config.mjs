// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],

  // Code theme picked for the Sunset Pixel palette; its comments stay readable (AA) on the dark code background.
  markdown: {
    shikiConfig: { theme: 'catppuccin-mocha' },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});