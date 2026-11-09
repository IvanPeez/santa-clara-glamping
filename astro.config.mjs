// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages: la web vive en ivanpeez.github.io/santa-clara-glamping.
  // Con dominio propio, cambia `site` por el dominio y borra `base`.
  site: 'https://ivanpeez.github.io',
  base: '/santa-clara-glamping',
  build: {
    // El CSS va dentro del HTML: sin peticiones que bloqueen el primer pintado
    inlineStylesheets: 'always',
  },
});
