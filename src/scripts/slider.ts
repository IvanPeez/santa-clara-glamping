// Se carga aparte desde main.ts. Los imports con nombre permiten descartar
// los módulos de Swiper que no se usan (import('swiper/modules') los trae todos).
import Swiper from 'swiper';
import { Navigation, Keyboard } from 'swiper/modules';

export { Swiper, Navigation, Keyboard };
