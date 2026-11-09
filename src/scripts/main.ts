import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import type { Instance as Calendar } from 'flatpickr/dist/types/instance';
import { glampings, site } from '../data/site';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'expo.out' });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EXPO_IN_OUT = 'expo.inOut';

// ---------- Scroll suave (sin Lenis si la persona prefiere menos movimiento) ----------
const lenis = reduceMotion ? null : new Lenis({ duration: 1.2 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---------- Header: claro u oscuro según la sección; se oculta al bajar ----------
const header = document.querySelector<HTMLElement>('[data-header]')!;
const lightSections = [...document.querySelectorAll<HTMLElement>('[data-header-theme="light"]')];
let lastY = window.scrollY;
let overlayOpen = false;

function updateHeader() {
  const y = window.scrollY;
  const probe = header.offsetHeight / 2;
  const overLight = lightSections.some((s) => {
    const r = s.getBoundingClientRect();
    return r.top <= probe && r.bottom >= probe;
  });
  header.classList.toggle('is-dark', !overLight);

  if (!overlayOpen) {
    const goingDown = y > lastY;
    header.classList.toggle('is-hidden', goingDown && y > window.innerHeight * 0.6);
  }
  lastY = y;
}

window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader);
updateHeader();

// ---------- Paneles (menú y reserva) ----------
type Panel = {
  root: HTMLElement;
  veil: HTMLElement;
  panel: HTMLElement;
  from: -100 | 100;
  items?: HTMLElement[];
  extra?: HTMLElement | null;
  trigger: HTMLElement | null;
  isOpen: boolean;
};

function makePanel(name: 'menu' | 'booking', from: -100 | 100): Panel {
  const root = document.querySelector<HTMLElement>(`[data-${name}]`)!;
  const panel = root.querySelector<HTMLElement>(`[data-${name}-panel]`)!;
  // El CSS no lleva transform: GSAP leería translateX(-100%) como píxeles
  gsap.set(panel, { x: 0, xPercent: from });
  return {
    root,
    veil: root.querySelector<HTMLElement>(`[data-${name}-veil]`)!,
    panel,
    from,
    trigger: null,
    isOpen: false,
  };
}

const menu = makePanel('menu', -100);
menu.items = [...menu.root.querySelectorAll<HTMLElement>('[data-menu-item]')];
menu.extra = menu.root.querySelector<HTMLElement>('.menu__preview');
const booking = makePanel('booking', 100);
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-open]')!;

function lockScroll(lock: boolean) {
  overlayOpen = lock;
  if (lenis) {
    if (lock) lenis.stop();
    else lenis.start();
  } else {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
  }
  if (lock) header.classList.remove('is-hidden');
}

function openPanel(p: Panel, trigger: HTMLElement | null) {
  if (p.isOpen) return;
  p.isOpen = true;
  p.trigger = trigger;
  p.root.inert = false;
  lockScroll(true);
  if (p === menu) menuButton.setAttribute('aria-expanded', 'true');

  const d = reduceMotion ? 0 : 1;
  gsap.killTweensOf([p.root, p.veil, p.panel, ...(p.items ?? []), p.extra]);
  gsap.set(p.root, { visibility: 'visible' });
  gsap.to(p.veil, { opacity: 1, duration: 0.6 * d, ease: 'power2.out' });
  gsap.to(p.panel, { xPercent: 0, duration: 0.9 * d, ease: 'expo.out' });
  if (p.items) {
    gsap.fromTo(
      p.items,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9 * d, ease: 'expo.out', stagger: 0.04 * d, delay: 0.15 * d }
    );
  }
  if (p.extra) gsap.to(p.extra, { opacity: 1, duration: 0.8 * d, delay: 0.3 * d });

  const focusTarget = p.panel.querySelector<HTMLElement>('button, a, input');
  focusTarget?.focus({ preventScroll: true });
}

function closePanel(p: Panel, { restoreFocus = true } = {}) {
  if (!p.isOpen) return Promise.resolve();
  p.isOpen = false;
  p.root.inert = true;
  if (p === menu) menuButton.setAttribute('aria-expanded', 'false');

  const d = reduceMotion ? 0 : 1;
  return new Promise<void>((resolve) => {
    // Cerrar responde rápido (0,5 s); abrir se toma su tiempo (0,9 s)
    gsap.to(p.veil, { opacity: 0, duration: 0.45 * d, ease: 'power2.out' });
    if (p.extra) gsap.to(p.extra, { opacity: 0, duration: 0.25 * d });
    gsap.to(p.panel, {
      xPercent: p.from,
      duration: 0.5 * d,
      ease: 'expo.out',
      onComplete: () => {
        gsap.set(p.root, { visibility: 'hidden' });
        if (!menu.isOpen && !booking.isOpen) lockScroll(false);
        if (restoreFocus) p.trigger?.focus({ preventScroll: true });
        resolve();
      },
    });
  });
}

function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else target.scrollIntoView();
}

// Vistas previas del menú: se cargan después de la página, sin competir con lo visible
const loadMenuPreviews = () =>
  menu.root.querySelectorAll<HTMLImageElement>('[data-menu-preview]').forEach((img) => (img.loading = 'eager'));
window.addEventListener('load', () => {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
  idle(loadMenuPreviews);
});

// Menú
menuButton.addEventListener('click', () => {
  loadMenuPreviews();
  openPanel(menu, menuButton);
});
menu.root.querySelectorAll('[data-menu-close]').forEach((el) =>
  el.addEventListener('click', () => closePanel(menu))
);
menu.root.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((link) =>
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    await closePanel(menu, { restoreFocus: false });
    scrollToHash(link.hash);
  })
);
menu.root.querySelectorAll<HTMLElement>('[data-menu-hover]').forEach((link) => {
  const show = () => {
    menu.root.querySelectorAll<HTMLElement>('[data-menu-preview]').forEach((img) =>
      img.classList.toggle('is-active', img.dataset.menuPreview === link.dataset.menuHover)
    );
  };
  link.addEventListener('mouseenter', show);
  link.addEventListener('focus', show);
});

// Enlaces internos fuera del menú
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not([data-menu-link])').forEach((link) =>
  link.addEventListener('click', (e) => {
    if (link.hash.length < 2) return;
    e.preventDefault();
    scrollToHash(link.hash);
  })
);

// ---------- Reserva en dos pasos ----------
const form = booking.root.querySelector<HTMLFormElement>('[data-booking-form]')!;
const step1 = form.querySelector<HTMLElement>('[data-booking-step="1"]')!;
const step2 = form.querySelector<HTMLElement>('[data-booking-step="2"]')!;
const error1 = form.querySelector<HTMLElement>('[data-booking-error="1"]')!;
const error2 = form.querySelector<HTMLElement>('[data-booking-error="2"]')!;
const datesText = form.querySelector<HTMLElement>('[data-booking-dates-text]')!;

const formatDate = (d: Date) =>
  d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

const nightsBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000);

// El calendario se carga aparte: no pesa en la carga inicial de la página
let calendar: Calendar | null = null;
let calendarLoading: Promise<void> | null = null;

function loadCalendar() {
  calendarLoading ??= Promise.all([
    import('flatpickr'),
    import('flatpickr/dist/l10n/es.js'),
  ]).then(([{ default: flatpickr }, { Spanish }]) => {
    calendar = flatpickr(form.querySelector<HTMLInputElement>('[data-booking-dates]')!, {
      inline: true,
      mode: 'range',
      locale: Spanish,
      minDate: 'today',
      disable: [], // fechas ocupadas, cuando las haya
      onChange: (dates) => {
        error1.hidden = true;
        if (dates.length === 2) {
          const n = nightsBetween(dates[0], dates[1]);
          datesText.textContent = `${formatDate(dates[0])} → ${formatDate(dates[1])} · ${n} ${n === 1 ? 'noche' : 'noches'}`;
        } else if (dates.length === 1) {
          datesText.textContent = `Llegada: ${formatDate(dates[0])}. Ahora elige la salida.`;
        } else {
          datesText.textContent = 'Selecciona dos fechas.';
        }
      },
    });
  });
  return calendarLoading;
}

// Se adelanta cuando el navegador está libre, para que la reserva abra sin espera
window.addEventListener('load', () => {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
  idle(() => loadCalendar());
});

function selectedDates() {
  if (!calendar) return null;
  const [checkin, checkout] = calendar.selectedDates;
  if (!checkin || !checkout || nightsBetween(checkin, checkout) < 1) return null;
  return { checkin, checkout, nights: nightsBetween(checkin, checkout) };
}

function selectedGlamping() {
  const id = (form.elements.namedItem('glamping') as RadioNodeList).value;
  return glampings.find((g) => g.id === id) ?? glampings[0];
}

function showStep(n: 1 | 2) {
  step1.hidden = n !== 1;
  step2.hidden = n !== 2;
  booking.panel.scrollTop = 0;
  const focus = (n === 1 ? step1 : step2).querySelector<HTMLElement>(n === 1 ? 'input:checked' : 'input[name="nombre"]');
  focus?.focus({ preventScroll: true });
}

form.querySelector('[data-booking-next]')!.addEventListener('click', () => {
  const dates = selectedDates();
  if (!dates) {
    error1.hidden = false;
    return;
  }
  const s = (key: string) => form.querySelector<HTMLElement>(`[data-summary="${key}"]`)!;
  s('glamping').textContent = selectedGlamping().name;
  s('checkin').textContent = formatDate(dates.checkin);
  s('checkout').textContent = `${formatDate(dates.checkout)} (${dates.nights} ${dates.nights === 1 ? 'noche' : 'noches'})`;
  showStep(2);
});

form.querySelector('[data-booking-back]')!.addEventListener('click', () => showStep(1));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dates = selectedDates();
  if (!dates) return showStep(1);

  const data = new FormData(form);
  const nombre = String(data.get('nombre') ?? '').trim();
  if (!nombre) {
    error2.hidden = false;
    form.querySelector<HTMLInputElement>('input[name="nombre"]')!.focus();
    return;
  }
  error2.hidden = true;

  const notas = String(data.get('notas') ?? '').trim();
  const lines = [
    `Hola, soy ${nombre}. Quiero reservar en Santa Clara Glamping.`,
    `Glamping: ${selectedGlamping().name}`,
    `Llegada: ${formatDate(dates.checkin)}`,
    `Salida: ${formatDate(dates.checkout)} (${dates.nights} ${dates.nights === 1 ? 'noche' : 'noches'})`,
    `Personas: ${data.get('personas')}`,
  ];
  if (notas) lines.push(`Notas: ${notas}`);

  window.open(`${site.whatsappUrl}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
});

form.querySelector('input[name="nombre"]')!.addEventListener('input', () => (error2.hidden = true));

async function openBooking(trigger: HTMLElement, glampingId?: string) {
  if (glampingId) {
    const radio = form.querySelector<HTMLInputElement>(`input[name="glamping"][value="${glampingId}"]`);
    if (radio) radio.checked = true;
  }
  showStep(1);
  error1.hidden = true;
  const calendarReady = loadCalendar();
  if (menu.isOpen) await closePanel(menu, { restoreFocus: false });
  openPanel(booking, trigger);
  await calendarReady;
}

document.querySelectorAll<HTMLElement>('[data-booking-open]').forEach((el) =>
  el.addEventListener('click', (e) => {
    e.preventDefault();
    // Si se abre desde el menú, el foco vuelve al botón del menú al cerrar
    const trigger = el.closest('[data-menu]') ? menuButton : el;
    openBooking(trigger, el.dataset.glamping);
  })
);
booking.root.querySelectorAll('[data-booking-close]').forEach((el) =>
  el.addEventListener('click', () => closePanel(booking))
);

// Escape cierra el panel abierto
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (booking.isOpen) closePanel(booking);
  else if (menu.isOpen) closePanel(menu);
});

// ---------- Slider de glampings ----------
// En escritorio el bloque de texto es el primer slide; en móvil va arriba y sale del slider.
// Swiper se descarga cuando la sección se acerca; antes funciona como fila con scroll horizontal.
const sliderEl = document.querySelector<HTMLElement>('[data-glampings]');
if (sliderEl) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      initSlider(sliderEl);
    },
    { rootMargin: '100% 0px' }
  );
  observer.observe(sliderEl);
}

async function initSlider(sliderEl: HTMLElement) {
  const { Swiper, Navigation, Keyboard } = await import('./slider');
  const introSlide = sliderEl.querySelector<HTMLElement>('.glampings__intro-slide')!;
  const desktop = window.matchMedia('(min-width: 900px)');
  const gutter = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter'));
  const syncIntro = () => introSlide.classList.toggle('swiper-slide', desktop.matches);
  syncIntro();

  const slider = new Swiper(sliderEl, {
    modules: [Navigation, Keyboard],
    slidesPerView: 'auto',
    spaceBetween: 20,
    slidesOffsetBefore: gutter(),
    slidesOffsetAfter: gutter(),
    speed: reduceMotion ? 0 : 900,
    grabCursor: true,
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: {
      prevEl: '[data-glampings-prev]',
      nextEl: '[data-glampings-next]',
    },
    on: {
      resize(s) {
        s.params.slidesOffsetBefore = s.params.slidesOffsetAfter = gutter();
      },
    },
  });

  desktop.addEventListener('change', () => {
    syncIntro();
    slider.update();
    slider.slideTo(0, 0);
  });
}

// ---------- Animaciones ----------
const heroVideo = document.querySelector<HTMLVideoElement>('[data-hero-img]');

// El video se descarga cuando la página ya cargó, para no quitarle ancho de banda
// a las fuentes y fotos. Sin movimiento no se descarga: queda el primer fotograma.
if (heroVideo && !reduceMotion) {
  window.addEventListener('load', () => {
    heroVideo.preload = 'auto';
    heroVideo.play().catch(() => {});
  });
}

if (!reduceMotion) {
  initHero();
  initEntorno();
  // SplitText mide líneas: espera a que carguen las fuentes
  document.fonts.ready.then(() => {
    initReveals();
    ScrollTrigger.refresh();
  });
  // Las fotos con loading="lazy" cambian alturas al cargar
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const media = hero.querySelector('[data-hero-media]');
  const content = hero.querySelector('[data-hero-content]');

  // Carga: la foto se asienta, las palabras suben, luego el resto aparece
  gsap
    .timeline({ delay: 0.35 })
    // Se escala el contenedor: así el poster y el video se mueven juntos
    .fromTo(media, { scale: 1.18 }, { scale: 1, duration: 2.6 }, 0)
    .to(hero.querySelectorAll('[data-hero-word]'), { y: 0, duration: 1.4, stagger: 0.08 }, 0)
    .to('[data-header]', { opacity: 1, duration: 1.2 }, 0.9)
    .to(hero.querySelectorAll('[data-hero-fade]'), { opacity: 1, duration: 1.2, stagger: 0.12 }, 0.9);

  // Scroll: la foto baja (parallax) y el título sube y se desvanece
  const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to(media, { yPercent: 22, ease: 'none', scrollTrigger: scrub });
  gsap.to(content, { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: scrub });
}

// Entorno: contenedor fijo de 100vh; cada foto se revela sobre la anterior
// y cambia el texto. Una unidad de timeline por foto.
function initEntorno() {
  const section = document.querySelector<HTMLElement>('[data-entorno]');
  if (!section) return;
  section.classList.add('is-sticky');

  const intro = section.querySelector('[data-entorno-intro]');
  const items = [...section.querySelectorAll<HTMLElement>('[data-entorno-item]')];
  const bars = section.querySelectorAll('[data-entorno-bar]');
  const progress = section.querySelector('.entorno__progress');

  gsap.set(progress, { opacity: 0 });
  items.forEach((item) => {
    gsap.set(item.querySelector('[data-entorno-img]'), { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(item.querySelector('img'), { scale: 1.15 });
    gsap.set(item.querySelector('[data-entorno-text]'), { opacity: 0, y: 40 });
  });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  tl.to(intro, { yPercent: -40, opacity: 0, duration: 0.6 }, 0).to(progress, { opacity: 1, duration: 0.3 }, 0.5);

  items.forEach((item, i) => {
    const at = i;
    if (i > 0) {
      tl.to(items[i - 1].querySelector('[data-entorno-text]'), { opacity: 0, y: -30, duration: 0.2 }, at);
    }
    tl.to(item.querySelector('[data-entorno-img]'), { clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power2.inOut' }, at)
      .to(item.querySelector('img'), { scale: 1, duration: 1 }, at)
      .to(item.querySelector('[data-entorno-text]'), { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, at + 0.3)
      .to(bars[i], { scaleX: 1, duration: 1 }, at);
  });
}

function initReveals() {
  // Texto por líneas con máscara
  document.querySelectorAll<HTMLElement>('[data-animate-text]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      // Sin aria-label en el <p>: las líneas conservan el texto en orden para lectores de pantalla
      aria: 'none',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.3,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  // Grupos (tarjetas de glamping): misma entrada, escalonada 80 ms
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    gsap.fromTo(
      group.children,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.08, scrollTrigger: { trigger: group, start: 'top 88%', once: true } }
    );
  });

  // Fundido + 28 px hacia arriba
  document.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 1.2, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }
    );
  });

  // Imagen: el marco se abre de abajo hacia arriba y la foto se asienta
  document.querySelectorAll<HTMLElement>('[data-animate-img]').forEach((frame) => {
    const img = frame.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 90%', once: true } });
    tl.to(frame, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: EXPO_IN_OUT }, 0);
    if (img) tl.from(img, { scale: 1.25, duration: 2 }, 0);
  });

  // Parallax: la foto recorre -8% a 8% mientras su marco cruza la pantalla
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });
}

// Color de fondo del body por sección (también sin movimiento: es solo color)
document.querySelectorAll<HTMLElement>('[data-bg-color]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 55%',
    end: 'bottom 45%',
    onToggle: ({ isActive }) => {
      document.body.style.backgroundColor = isActive ? section.dataset.bgColor! : '';
    },
  });
});
