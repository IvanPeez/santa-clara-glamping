// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  build: {
    // El CSS va dentro del HTML: sin peticiones que bloqueen el primer pintado
    inlineStylesheets: 'always',
  },
});
