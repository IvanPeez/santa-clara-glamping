import type { ImageMetadata } from 'astro';
import heroVideo from '../assets/hero.mp4';
import heroVideo720 from '../assets/hero-720.mp4';
import heroPoster from '../assets/hero-poster.jpg';

// Todas las fotos de src/assets/img, por nombre de archivo (glamping-1, entorno-2…).
// Las versiones verticales para celular terminan en " movil" y quedan como "entorno-1-movil".
const img: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: ImageMetadata }>('../assets/img/*.jpg', { eager: true })).map(
    ([path, mod]) => [path.split('/').pop()!.replace('.jpg', '').replace(' movil', '-movil'), mod.default]
  )
);

// Todo el texto editable de la web vive aquí.
// Las fotos de src/assets/img son marcadores sacados de Instagram (640 px).
// Para cambiar una foto, reemplaza el archivo con el mismo nombre: Astro genera AVIF/WebP en varios anchos.

export type Glamping = {
  id: string;
  name: string;
  line: string; // capacidad · rasgo
  phrase: string;
  image: ImageMetadata;
  alt: string;
};

const whatsapp = '573122435198';

export const site = {
  name: 'Santa Clara Glamping',
  wordmark: 'Santa Clara',
  title: 'Santa Clara Glamping · Hospedaje mágico en un bosque de niebla',
  description:
    'Glamping para parejas en el km 18, vía La Elvira, a 20 minutos de Cali. Cabañas con jacuzzi privado y vista a la montaña en medio de un bosque de niebla.',
  motto: 'El principio fundamental del universo, el amor.',
  whatsapp,
  whatsappDisplay: '312 243 5198',
  whatsappUrl: `https://wa.me/${whatsapp}`,
  address: 'Vía La Elvira, km 18, Cali, Valle del Cauca',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Santa+Clara+Glamping+km+18+Cali',
  checkin: '3:00 a 8:00 p. m.', // confirmar
  checkout: '12:00 m. a 1:00 p. m.', // confirmar
  instagram: { handle: '@santaclaraglamping', url: 'https://www.instagram.com/santaclaraglamping/' },
  tiktok: { handle: '@santaclaraglamping', url: 'https://www.tiktok.com/@santaclaraglamping' },
};

export const nav = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'La experiencia', href: '#experiencia' },
  { label: 'Glampings', href: '#glampings' },
  { label: 'El entorno', href: '#entorno' },
  { label: 'Rituales', href: '#rituales' },
  { label: 'Contacto', href: '#contacto' },
];

export const hero = {
  label: 'Km 18 · Vía La Elvira · Cali',
  // Cada parte se divide en palabras; `em` va en cursiva
  title: [
    { text: 'Hospedaje mágico', em: false },
    { text: 'entre la niebla', em: true },
  ],
  scroll: 'Desliza para descubrir',
  // Video horizontal sin audio, girado desde el reel original: 1920×1080 y 1280×720 para móvil
  video: heroVideo as string,
  video720: heroVideo720 as string,
  // Primer fotograma: se ve mientras carga el video y sirve de imagen para redes (1200 × 630)
  image: heroPoster,
  alt: 'Cabañas en forma de A con ventanales y jacuzzi, rodeadas de bosque y niebla',
};

export const intro = {
  label: 'La experiencia',
  quote: 'Creemos que el amor es el principio de todo. Por eso hicimos un lugar pequeño, escondido en la montaña, para que dos personas se encuentren sin prisa.',
  paragraph:
    'Tres cabañas entre la niebla del km 18, a veinte minutos de Cali. Jacuzzi propio, ventanales que miran al bosque y noches frías que piden quedarse adentro.',
  link: { label: 'Conoce los glampings', href: '#glampings' },
  image: img['glamping-1'],
  alt: 'Cabaña tipo A con techo negro rodeada de hortensias',
};

// Nombres tomados de las historias destacadas de Instagram. Confirmar capacidad y rasgo de cada uno.
export const glampings: Glamping[] = [
  {
    id: 'sivana',
    name: 'Sivana',
    line: '2 personas · Jacuzzi privado',
    phrase: 'Una cabaña en A entre hortensias, con la niebla al otro lado del vidrio.',
    image: img['glamping-1'],
    alt: 'Cabaña Sivana, en forma de A, con jardín de hortensias',
  },
  {
    id: 'maktub',
    name: 'Maktub',
    line: '2 personas · Vista a la montaña',
    phrase: 'Estaba escrito: agua caliente, madera y el bosque como único vecino.',
    image: img['glamping-2'],
    alt: 'Jacuzzi de Maktub junto al ventanal de la cabaña',
  },
  {
    id: 'dharma',
    name: 'Dharma',
    line: '2 personas · Jacuzzi al aire libre',
    phrase: 'Para celebrar lo que importa, con el sonido de las aves de fondo.',
    image: img['glamping-3'],
    alt: 'Pareja en el jacuzzi exterior de Dharma rodeado de árboles',
  },
];

export const glampingsIntro = {
  title: 'Tres refugios, <em>una sola calma</em>',
  text: 'Cada cabaña es para dos. Elige la tuya y cuéntanos tus fechas.',
};

export const entorno = {
  intro: { title: 'Un lugar elegido por <em>su magia</em>' },
  items: [
    {
      title: 'Bosque de niebla',
      text: 'La nube baja por la tarde y lo cubre todo. Al amanecer se levanta despacio y deja ver la montaña.',
      image: img['entorno-1'],
      imageMobile: img['entorno-1-movil'],
      alt: 'Mujer de espaldas mirando los árboles envueltos en niebla',
    },
    {
      title: 'A veinte minutos de Cali',
      text: 'Por la vía a La Elvira, en el km 18. Lo bastante cerca para venir hoy, lo bastante lejos para olvidar la ciudad.',
      image: img['entorno-2'],
      imageMobile: img['entorno-2-movil'],
      alt: 'Jardín verde con pinos y senderos de piedra',
    },
    {
      title: 'Aves y flores',
      text: 'Colibríes, hortensias y un coro de pájaros que se encarga de despertarte.',
      image: img['entorno-3'],
      imageMobile: img['entorno-3-movil'],
      alt: 'Vista desde el ventanal hacia el jacuzzi y el bosque con niebla',
    },
  ],
};

export const rituales = {
  quote: 'Lo pequeño, <em>hecho con intención</em>',
  items: [
    'Jacuzzi caliente bajo la niebla',
    'Fogata y cielo de montaña',
    'Desayuno servido en tu cabaña',
    'Decoración para celebraciones y pedidas',
  ], // confirmar
  paragraph:
    'Cumpleaños, aniversarios o la pregunta más importante. Cuéntanos qué celebras y preparamos la cabaña antes de que llegues.',
  button: 'Personaliza tu estadía',
  imageA: img['exp-1'],
  altA: 'Desayuno con chocolate caliente y rosas rojas sobre una mesa de madera',
  imageB: img['exp-2'],
  altB: 'Cabaña decorada con globos de corazón, rosas y un letrero de neón',
};

export const footer = {
  title: 'Tu noche entre <em>la niebla</em> te espera',
  image: img['footer'],
  imageMobile: img['footer-movil'],
  alt: 'Hombre en la piscina frente a la cabaña tipo A al atardecer',
  explore: nav.filter((n) => n.href !== '#inicio' && n.href !== '#contacto'),
};
