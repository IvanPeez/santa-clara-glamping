// Ajustes comunes para <Picture>: AVIF y WebP en varios anchos.
// Astro no genera anchos mayores que el original, así que con fotos en alta resolución
// salen solos los tamaños grandes.
export const photo = {
  formats: ['avif', 'webp'] as const,
  widths: [400, 640, 960, 1280, 1920, 2560],
  loading: 'lazy' as const,
  decoding: 'async' as const,
};
