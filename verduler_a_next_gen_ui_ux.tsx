import React, { useState, useMemo, useEffect } from 'react';

const THEMES = {
  freshLight: {
    name: 'Fresh Light (Orgánico)',
    bg: 'bg-stone-50',
    cardBg: 'bg-white',
    textMain: 'text-stone-900',
    textMuted: 'text-stone-500',
    border: 'border-stone-200',
    accent: 'emerald',
    accentColor: '#10b981',
    headerBg: 'bg-white/85 backdrop-blur-md border-stone-200',
    tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  vercelDark: {
    name: 'Vercel Dark (High-Tech)',
    bg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900/90',
    textMain: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    border: 'border-zinc-800',
    accent: 'emerald',
    accentColor: '#34d399',
    headerBg: 'bg-zinc-950/90 backdrop-blur-md border-zinc-800',
    tagBg: 'bg-zinc-800 text-emerald-400 border-zinc-700',
  },
  farmSage: {
    name: 'Farm Sage (Mercado Rústico)',
    bg: 'bg-[#0f2419]',
    cardBg: 'bg-[#153424]',
    textMain: 'text-emerald-50',
    textMuted: 'text-emerald-200/70',
    border: 'border-emerald-900/60',
    accent: 'emerald',
    accentColor: '#4ade80',
    headerBg: 'bg-[#0f2419]/90 backdrop-blur-md border-emerald-900/50',
    tagBg: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  }
};

const Icon = ({ name, className = "w-5 h-5", ...props }) => {
  const icons = {
    search: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    shoppingBag: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    shoppingCart: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
    plus: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M12 5v14m-7-7h14" />
      </svg>
    ),
    minus: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M5 12h14" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    x: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    ),
    truck: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" /><circle cx="17" cy="18.5" r="2.5" /><circle cx="6.5" cy="18.5" r="2.5" />
      </svg>
    ),
    sparkles: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
      </svg>
    ),
    leaf: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
    whatsapp: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
    trash: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    ),
    sliders: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" />
      </svg>
    ),
    info: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    ),
    zap: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    package: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
    shieldCheck: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    tag: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><circle cx="7" cy="7" r=".5" />
      </svg>
    ),
    eye: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    mapPin: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />
      </svg>
    )
  };
  return icons[name] || null;
};

const PRODUCTS_DATA = [
  {
    id: 'lechuga-costina',
    name: 'Lechuga Costina Hidropónica',
    category: 'hojas',
    categoryLabel: 'Hojas Verdes',
    price: 1390,
    unit: 'unidad',
    unitDetail: '1 Mata crocante y lavada',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=700&q=80',
    harvest: 'Hoy 06:15 AM (Paine)',
    isOrganic: true,
    isPopular: true,
    nutrition: 'Rica en Vitamina A, K y ácido fólico',
    recipeTip: 'Ideal para ensalada César ligera o wraps saludables',
    rating: 4.9,
    reviewsCount: 38,
    stock: 24,
    badge: 'Cosecha de hoy'
  },
  {
    id: 'espinaca-fresca',
    name: 'Espinaca Tierna Baby',
    category: 'hojas',
    categoryLabel: 'Hojas Verdes',
    price: 1290,
    unit: 'atado',
    unitDetail: 'Atado de 400g aprox.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=700&q=80',
    harvest: 'Ayer tarde (Curacaví)',
    isOrganic: true,
    isPopular: false,
    nutrition: 'Alto contenido de hierro y magnesio',
    recipeTip: 'Salteada al wok con ajo o en batidos verdes energéticos',
    rating: 4.8,
    reviewsCount: 19,
    stock: 18,
    badge: '100% Orgánico'
  },
  {
    id: 'acelga-verde',
    name: 'Acelga Verde Selección',
    category: 'hojas',
    categoryLabel: 'Hojas Verdes',
    price: 1190,
    unit: 'atado',
    unitDetail: 'Atado grande 600g',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
    harvest: 'Hoy 06:30 AM (Talagante)',
    isOrganic: false,
    isPopular: false,
    nutrition: 'Aporta fibra dietética y potasio',
    recipeTip: 'Tortilla chilena clásica o pascualina horneada',
    rating: 4.7,
    reviewsCount: 14,
    stock: 12,
    badge: null
  },
  {
    id: 'palta-hass',
    name: 'Palta Hass Calibre 1era',
    category: 'frutas',
    categoryLabel: 'Frutas & Frutos',
    price: 4990,
    unit: 'kg',
    unitDetail: 'Aprox. 4 a 5 unidades por kilo',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=80',
    harvest: 'Valle de Quillota',
    isOrganic: false,
    isPopular: true,
    nutrition: 'Grasas saludables Omega-9 y Potasio',
    recipeTip: 'Tostadas matutinas o guacamole casero fresco',
    rating: 5.0,
    reviewsCount: 94,
    stock: 45,
    badge: 'Top Ventas'
  },
  {
    id: 'tomate-limachino',
    name: 'Tomate Limachino Tradicional',
    category: 'frutas',
    categoryLabel: 'Frutas & Frutos',
    price: 2490,
    unit: 'kg',
    unitDetail: 'Kilo seleccionado (dulzor y pulpa)',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=80',
    harvest: 'Limache, V Región',
    isOrganic: true,
    isPopular: true,
    nutrition: 'Licopeno natural antioxidante',
    recipeTip: 'Ensalada chilena con cebolla amortiguada y cilantro',
    rating: 4.9,
    reviewsCount: 52,
    stock: 30,
    badge: 'Sabor Auténtico'
  },
  {
    id: 'zanahorias-tallo',
    name: 'Zanahorias Dulces con Tallo',
    category: 'tuberculos',
    categoryLabel: 'Tubérculos & Raíces',
    price: 1390,
    unit: 'atado',
    unitDetail: 'Atado de 1 kg con hojas verdes',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=700&q=80',
    harvest: 'Melipilla',
    isOrganic: true,
    isPopular: false,
    nutrition: 'Beta-caroteno puro para la piel y vista',
    recipeTip: 'Horneadas con miel y romero o en jugos prensados',
    rating: 4.8,
    reviewsCount: 22,
    stock: 20,
    badge: 'Extra Crujiente'
  },
  {
    id: 'papas-nuevas',
    name: 'Papas Nuevas Desirée',
    category: 'tuberculos',
    categoryLabel: 'Tubérculos & Raíces',
    price: 1590,
    unit: 'kg',
    unitDetail: 'Malla 1 kg lavada y calibrada',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80',
    harvest: 'Chiloé / La Serena',
    isOrganic: false,
    isPopular: true,
    nutrition: 'Excelente textura para horno o puré',
    recipeTip: 'Papas rústicas con piel doradas al romero',
    rating: 4.9,
    reviewsCount: 40,
    stock: 60,
    badge: null
  },
  {
    id: 'limon-sutil',
    name: 'Limón Sutil Jugoso',
    category: 'frutas',
    categoryLabel: 'Frutas & Frutos',
    price: 1890,
    unit: 'kg',
    unitDetail: 'Aprox. 10-12 limones verdes jugosos',
    image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=700&q=80',
    harvest: 'Ovalle, IV Región',
    isOrganic: false,
    isPopular: false,
    nutrition: 'Bomba de Vitamina C cítrica',
    recipeTip: 'Aliños para ceviche, limonada menta-jengibre',
    rating: 4.7,
    reviewsCount: 27,
    stock: 25,
    badge: 'Mucho Jugo'
  },
  {
    id: 'cilantro-fresco',
    name: 'Cilantro Aromático de Campo',
    category: 'aromaticas',
    categoryLabel: 'Aromáticas & Hierbas',
    price: 890,
    unit: 'atado',
    unitDetail: 'Atado fresco aromático 250g',
    image: 'https://images.unsplash.com/photo-1588879462716-1f9518d6a7f5?auto=format&fit=crop&w=700&q=80',
    harvest: 'Hoy 05:45 AM (Lampa)',
    isOrganic: true,
    isPopular: false,
    nutrition: 'Aroma fresco estimulante digestivo',
    recipeTip: 'Infaltable para el pebre casero y sopas de campo',
    rating: 4.9,
    reviewsCount: 16,
    stock: 35,
    badge: 'Cosecha de Hoy'
  }
];

const INITIAL_PACKS = [
  {
    id: 'pack-semanal-familiar',
    title: 'Canasta Semanal Completa (Familiar)',
    subtitle: 'Solución balanceada para 3 a 4 personas durante toda la semana',
    price: 18990,
    oldPrice: 22490,
    tag: 'Más Vendido (-15% dto)',
    savings: '$3.500',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    items: [
      '1x Lechuga Costina Hidropónica',
      '1x Atado de Espinaca Tierna',
      '1 kg Palta Hass Maduración Media',
      '1.5 kg Tomate Limachino',
      '2 kg Papas Nuevas Desirée',
      '1 kg Cebollas Dulces',
      '1 kg Zanahorias con tallo',
      '1 Atado Cilantro Fresco'
    ]
  },
  {
    id: 'pack-ensalada-fit',
    title: 'Box Verde & Ensaladas Rápidas',
    subtitle: 'Hojas seleccionadas, lavadas y listas para armar bowls nutritivos',
    price: 9990,
    oldPrice: 11800,
    tag: 'Saludable Express',
    savings: '$1.810',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    items: [
      '2x Lechuga Costina',
      '1x Atado Espinaca Baby',
      '500g Tomate Cherry Limachino',
      '3x Paltas Hass punto justo',
      '1x Limón Sutil malla 500g'
    ]
  },
  {
    id: 'pack-sopas-guisos',
    title: 'Box Cazuela & Sopas Caseras',
    subtitle: 'Tubérculos, raíces y verduras consistentes para almuerzos reconfortantes',
    price: 11490,
    oldPrice: 13900,
    tag: 'Cocinero de Invierno',
    savings: '$2.410',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    items: [
      '2 kg Papas Desirée seleccionadas',
      '1.5 kg Zanahorias dulces',
      '1x Atado grande de Acelga',
      '1x Zapallo Camote trozo 1 kg',
      '1x Atado de Cilantro aromático'
    ]
  },
  {
    id: 'pack-frutas-jugos',
    title: 'Box Frutas de Temporada & Jugos',
    subtitle: 'Cítricos y frutos seleccionados a mano por su alto nivel de dulzor',
    price: 12990,
    oldPrice: 14990,
    tag: 'Energía Diaria',
    savings: '$2.000',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
    items: [
      '1.5 kg Naranjas jugosas para exprimir',
      '1 kg Manzanas Fuji crujientes',
      '1 kg Plátano Seda importado',
      '1 kg Limón Sutil de Ovalle',
      '1 Piña Golden entera dulce'
    ]
  }
];

const COMUNAS_SANTIAGO = [
  { name: 'Ñuñoa', fee: 1990, time: 'Hoy 14:00 - 18:00' },
  { name: 'Providencia', fee: 1990, time: 'Hoy 14:00 - 18:00' },
  { name: 'Las Condes', fee: 2490, time: 'Hoy 15:00 - 19:00' },
  { name: 'Santiago Centro', fee: 1990, time: 'Hoy 14:30 - 18:30' },
  { name: 'Vitacura', fee: 2490, time: 'Hoy 15:00 - 19:00' },
  { name: 'La Reina', fee: 2490, time: 'Hoy 15:30 - 19:30' },
  { name: 'Macul', fee: 1990, time: 'Hoy 14:00 - 18:00' },
  { name: 'San Miguel', fee: 2200, time: 'Hoy 16:00 - 20:00' },
  { name: 'Maipú', fee: 2990, time: 'Mañana 10:00 - 14:00' },
  { name: 'Peñalolén', fee: 2490, time: 'Hoy 16:00 - 20:00' }
];

const FREE_SHIPPING_THRESHOLD = 20000;
const PROMO_COUPON_CODE = 'FRESCO10';

export default function App() {
  const [activeView, setActiveView] = useState('store');
  const [currentThemeKey, setCurrentThemeKey] = useState('freshLight');
  
  // Shopping Cart states
  const [cart, setCart] = useState({
    'lechuga-costina': 2,
    'palta-hass': 1,
    'tomate-limachino': 1
  });
  const [packCart, setPackCart] = useState({});
  const [customPacksList, setCustomPacksList] = useState([]);

  // UI state & Modals
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals visibility
  const [isPackBuilderOpen, setIsPackBuilderOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Announcement Banner
  const [isTopBannerVisible, setIsTopBannerVisible] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);

  // Customer Delivery Info
  const [selectedComuna, setSelectedComuna] = useState(COMUNAS_SANTIAGO[0]);
  const [customerName, setCustomerName] = useState('Francisca Tapia');
  const [customerPhone, setCustomerPhone] = useState('+56 9 8765 4321');
  const [customerAddress, setCustomerAddress] = useState('Av. Italia 1432, Depto 402');
  const [customerNotes, setCustomerNotes] = useState('Tocar timbre 402. Dejar en conserjería si no estoy.');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('transfer');

  // Custom Pack Builder temporary selection
  const [customPackItems, setCustomPackItems] = useState({});
  const [customPackTitle, setCustomPackTitle] = useState('Mi Canasta Personalizada');

  const theme = THEMES[currentThemeKey];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyPromoCode = (code) => {
    if (code.trim().toUpperCase() === PROMO_COUPON_CODE) {
      setAppliedCoupon(PROMO_COUPON_CODE);
      setCouponDiscountPercent(10);
      showToast('¡Cupón FRESCO10 aplicado! 10% de descuento en tus verduras');
    } else {
      showToast('Código no válido. Prueba usando FRESCO10');
    }
  };

  const cartCalculations = useMemo(() => {
    let subtotal = 0;
    let itemCount = 0;

    // Single produce items
    Object.entries(cart).forEach(([prodId, qty]) => {
      const prod = PRODUCTS_DATA.find(p => p.id === prodId);
      if (prod && qty > 0) {
        subtotal += prod.price * qty;
        itemCount += qty;
      }
    });

    // Preset & Custom Packs
    const allPacksAvailable = [...INITIAL_PACKS, ...customPacksList];
    Object.entries(packCart).forEach(([packId, qty]) => {
      const pack = allPacksAvailable.find(p => p.id === packId);
      if (pack && qty > 0) {
        subtotal += pack.price * qty;
        itemCount += qty;
      }
    });

    // Discount from Coupon
    const discountAmount = couponDiscountPercent > 0 ? Math.round((subtotal * couponDiscountPercent) / 100) : 0;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    const isFreeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
    const deliveryFee = isFreeShipping ? 0 : selectedComuna.fee;
    const progressToFreeShipping = Math.min(100, Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
    const amountNeededForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
    const total = discountedSubtotal + deliveryFee;

    return {
      subtotal,
      discountAmount,
      discountedSubtotal,
      deliveryFee,
      isFreeShipping,
      progressToFreeShipping,
      amountNeededForFree,
      total,
      itemCount
    };
  }, [cart, packCart, customPacksList, selectedComuna, couponDiscountPercent]);

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[productId];
      } else {
        updated[productId] = next;
      }
      return updated;
    });

    const item = PRODUCTS_DATA.find(p => p.id === productId);
    if (delta > 0 && item) {
      showToast(`+1 ${item.name} agregado`);
    }
  };

  const addPack = (packId) => {
    setPackCart(prev => ({
      ...prev,
      [packId]: (prev[packId] || 0) + 1
    }));
    const allPacks = [...INITIAL_PACKS, ...customPacksList];
    const pack = allPacks.find(p => p.id === packId);
    if (pack) showToast(`Pack sumado: ${pack.title}`);
  };

  const removePack = (packId) => {
    setPackCart(prev => {
      const next = { ...prev };
      if (next[packId] > 1) {
        next[packId] -= 1;
      } else {
        delete next[packId];
      }
      return next;
    });
  };

  const updateCustomPackItem = (productId, delta) => {
    setCustomPackItems(prev => {
      const curr = prev[productId] || 0;
      const updated = Math.max(0, curr + delta);
      const clone = { ...prev };
      if (updated === 0) {
        delete clone[productId];
      } else {
        clone[productId] = updated;
      }
      return clone;
    });
  };

  const customPackSummary = useMemo(() => {
    let totalItems = 0;
    let basePrice = 0;
    const itemList = [];

    Object.entries(customPackItems).forEach(([pId, qty]) => {
      const prod = PRODUCTS_DATA.find(p => p.id === pId);
      if (prod && qty > 0) {
        totalItems += qty;
        basePrice += prod.price * qty;
        itemList.push(`${qty}x ${prod.name}`);
      }
    });

    // Dynamic bundle discount: >= 4 items gets 10% off; >= 6 items gets 15% off
    let discountPct = 0;
    if (totalItems >= 6) discountPct = 15;
    else if (totalItems >= 4) discountPct = 10;

    const bundleSavings = Math.round((basePrice * discountPct) / 100);
    const finalPrice = basePrice - bundleSavings;

    return {
      totalItems,
      basePrice,
      discountPct,
      bundleSavings,
      finalPrice,
      itemList
    };
  }, [customPackItems]);

  const handleSaveCustomPack = () => {
    if (customPackSummary.totalItems < 3) {
      showToast('Selecciona al menos 3 verduras o frutas para armar tu pack');
      return;
    }

    const newPackId = `custom-pack-${Date.now()}`;
    const newPack = {
      id: newPackId,
      title: customPackTitle || 'Pack Personalizado Especial',
      subtitle: `Combo armado por ti (${customPackSummary.totalItems} productos seleccionados)`,
      price: customPackSummary.finalPrice,
      oldPrice: customPackSummary.basePrice,
      tag: `Personalizado (${customPackSummary.discountPct}% OFF)`,
      savings: `$${customPackSummary.bundleSavings.toLocaleString('es-CL')}`,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      items: customPackSummary.itemList,
      isCustom: true
    };

    setCustomPacksList(prev => [newPack, ...prev]);
    // Automatically add to packCart
    setPackCart(prev => ({ ...prev, [newPackId]: 1 }));
    setIsPackBuilderOpen(false);
    setCustomPackItems({});
    showToast(`¡Pack "${newPack.title}" creado y añadido al carrito!`);
  };

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS_DATA.filter(prod => {
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prod.harvest.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const generatedWhatsAppUrl = useMemo(() => {
    let text = `🌱 *NUEVO PEDIDO - HUERTO DIRECTO*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *Cliente:* ${customerName}\n`;
    text += `📞 *Teléfono:* ${customerPhone}\n`;
    text += `📍 *Dirección:* ${customerAddress}, ${selectedComuna.name}\n`;
    if (customerNotes) text += `📝 *Nota:* ${customerNotes}\n`;
    text += `💳 *Método de Pago:* ${selectedPaymentMethod === 'transfer' ? 'Transferencia Bancaria' : selectedPaymentMethod === 'webpay' ? 'Tarjeta Débito/Crédito' : 'Efectivo al Recibir'}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🛒 *DETALLE DEL PEDIDO:*\n`;

    // Singles
    Object.entries(cart).forEach(([prodId, qty]) => {
      const prod = PRODUCTS_DATA.find(p => p.id === prodId);
      if (prod && qty > 0) {
        text += `• ${qty}x ${prod.name} ($${(prod.price * qty).toLocaleString('es-CL')})\n`;
      }
    });

    // Preset & Custom Packs
    const allPacks = [...INITIAL_PACKS, ...customPacksList];
    Object.entries(packCart).forEach(([packId, qty]) => {
      const pack = allPacks.find(p => p.id === packId);
      if (pack && qty > 0) {
        text += `• ${qty}x [PACK] ${pack.title} ($${(pack.price * qty).toLocaleString('es-CL')})\n`;
      }
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Subtotal: $${cartCalculations.subtotal.toLocaleString('es-CL')}\n`;
    if (cartCalculations.discountAmount > 0) {
      text += `Cupón (${appliedCoupon}): -$${cartCalculations.discountAmount.toLocaleString('es-CL')}\n`;
    }
    text += `Despacho (${selectedComuna.name}): ${cartCalculations.isFreeShipping ? '¡GRATIS!' : `$${cartCalculations.deliveryFee.toLocaleString('es-CL')}`}\n`;
    text += `*TOTAL FINAL: $${cartCalculations.total.toLocaleString('es-CL')}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🚀 *Ventana estimada:* ${selectedComuna.time}\n`;
    text += `_Pedido procesado con la nueva plataforma UI/UX HuertoDirecto_`;

    return `https://wa.me/56912345678?text=${encodeURIComponent(text)}`;
  }, [cart, packCart, customPacksList, customerName, customerPhone, customerAddress, customerNotes, selectedComuna, selectedPaymentMethod, cartCalculations, appliedCoupon]);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textMain} transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white pb-32`}>
      
      {/* Dynamic Floating Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 text-xs sm:text-sm animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner 1: Promotional Announcement with Promo Code */}
      {isTopBannerVisible && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white text-xs px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-amber-400 text-zinc-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
              OFERTA
            </span>
            <span className="font-medium">
              Envío GRATIS en Gran Santiago sobre $20.000 + 10% OFF con código:
            </span>
            <button
              onClick={() => applyPromoCode(PROMO_COUPON_CODE)}
              className="bg-white/20 hover:bg-white/30 text-amber-200 font-mono px-2 py-0.5 rounded border border-white/20 font-bold transition flex items-center gap-1 active:scale-95"
              title="Click para aplicar cupón automáticamente"
            >
              <span>{PROMO_COUPON_CODE}</span>
              <Icon name="tag" className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={() => setIsTopBannerVisible(false)}
            className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition"
            title="Cerrar aviso"
          >
            <Icon name="x" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Control Switcher Bar: Prototype vs UI/UX Audit & Theme */}
      <div className="bg-zinc-900 text-zinc-300 border-b border-zinc-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 z-40">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            PROTOTIPO ADAPTABLE 2.0
          </span>
          <span className="hidden md:inline text-zinc-400 text-[11px]">
            Vercel + MUI Interaction System (Banners, Modales & Packs)
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveView('store')}
            className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
              activeView === 'store' ? 'bg-emerald-500 text-white shadow-sm' : 'hover:text-white text-zinc-400'
            }`}
          >
            <Icon name="shoppingBag" className="w-3.5 h-3.5" />
            Tienda Interactiva
          </button>
          <button
            onClick={() => setActiveView('audit')}
            className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
              activeView === 'audit' ? 'bg-emerald-500 text-white shadow-sm' : 'hover:text-white text-zinc-400'
            }`}
          >
            <Icon name="info" className="w-3.5 h-3.5" />
            Auditoría UI/UX
          </button>
          <button
            onClick={() => setActiveView('designSystem')}
            className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
              activeView === 'designSystem' ? 'bg-emerald-500 text-white shadow-sm' : 'hover:text-white text-zinc-400'
            }`}
          >
            <Icon name="sliders" className="w-3.5 h-3.5" />
            Tokens Vercel/MUI
          </button>
        </div>

        {/* Theme select dropdown */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-zinc-400 hidden lg:block">Tema:</label>
          <select
            value={currentThemeKey}
            onChange={(e) => setCurrentThemeKey(e.target.value)}
            className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {Object.entries(THEMES).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Header & Quick Search */}
      <header className={`sticky top-0 z-30 border-b ${theme.headerBg} transition-all shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('store')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/20">
              <Icon name="leaf" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight">HuertoDirecto</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Gran Santiago
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Cosecha de hoy • Directo a tu puerta
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Icon name="search" className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar palta, espinaca, lechuga, tomates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${theme.border} ${theme.cardBg} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Header Action Buttons: Pack Builder & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsPackBuilderOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-xs transition active:scale-95 bg-white shadow-sm"
            >
              <Icon name="sparkles" className="w-4 h-4 text-emerald-600" />
              <span>Crear mi Pack</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-lg shadow-emerald-600/30 active:scale-95"
            >
              <div className="relative">
                <Icon name="shoppingCart" className="w-5 h-5" />
                {cartCalculations.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-900 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-emerald-600 animate-pulse">
                    {cartCalculations.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">
                ${cartCalculations.discountedSubtotal.toLocaleString('es-CL')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* View: UI/UX Audit Comparison */}
      {activeView === 'audit' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Auditoría UI/UX: Antes vs. Solución Adaptable</h1>
            <p className="text-stone-500 mt-2 text-sm max-w-3xl">
              Análisis comparativo de los problemas detectados en las capturas del sitio original y las soluciones aplicadas en esta versión 2.0 interactiva con modales y banners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-3`}>
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                <span className="p-1 rounded bg-red-100 text-red-600">❌ Sitio Original</span>
                Fondo Verde Petróleo Monótono
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Toda la pantalla tenía un tono verde oscuro plano (`#0b2314`), provocando cansancio visual, bajo contraste en textos y quitándole luminosidad a los productos.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 space-y-1">
                <strong className="text-emerald-700 flex items-center gap-1"><Icon name="check" className="w-3.5 h-3.5" /> Solución Aplicada:</strong>
                <p>Paletas limpias neutras inspiradas en Vercel, donde las verduras aportan el color natural y la frescura fotográfica.</p>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-3`}>
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                <span className="p-1 rounded bg-red-100 text-red-600">❌ Sitio Original</span>
                Falta de Modales y Banners Dinámicos
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                No existían ventanas modales de vista rápida ni constructor interactivo para packs personalizados. El usuario no tenía incentivos visibles de promociones ni cupones.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 space-y-1">
                <strong className="text-emerald-700 flex items-center gap-1"><Icon name="check" className="w-3.5 h-3.5" /> Solución Aplicada:</strong>
                <p>Banners de aviso descartables, modal de armado de packs a medida con descuentos automáticos por volumen y modal de checkout rápido.</p>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-3`}>
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                <span className="p-1 rounded bg-red-100 text-red-600">❌ Sitio Original</span>
                Fricción en el Carrito Lateral Fijo
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                El carrito lateral ocupaba la mitad de la pantalla de escritorio o tapaba todo en móviles sin desglose claro de despacho ni barra de progreso a envío gratis.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 space-y-1">
                <strong className="text-emerald-700 flex items-center gap-1"><Icon name="check" className="w-3.5 h-3.5" /> Solución Aplicada:</strong>
                <p>Drawer deslizable fluido con cálculo automático de envío por comuna, barra gamificada para envío sin costo y botón instantáneo a WhatsApp.</p>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-3`}>
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                <span className="p-1 rounded bg-red-100 text-red-600">❌ Sitio Original</span>
                Packs Rígidos y No Modificables
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Las opciones de canastas no permitían agregar nuevos combos personalizados ni ver qué ingredientes exactos las componían en detalle.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 space-y-1">
                <strong className="text-emerald-700 flex items-center gap-1"><Icon name="check" className="w-3.5 h-3.5" /> Solución Aplicada:</strong>
                <p>Módulo de "Crear mi Pack" donde el usuario elije sus verduras favoritas y el sistema le bonifica con 10% a 15% de ahorro automático.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View: Design System Tokens */}
      {activeView === 'designSystem' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Tokens de Diseño: Vercel + MUI</h1>
            <p className="text-stone-500 mt-2 text-sm max-w-2xl">
              Principios arquitectónicos basados en Geist Design y Material Design 3 para un e-commerce ergonómico y táctil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-3`}>
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-600">Banners & Alertas</div>
              <p className="text-xs text-stone-500">
                Los banners usan degradados de alta saturación controlada con llamadas a la acción directas y opción de cerrado descartable para no saturar al usuario recurrente.
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-3`}>
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-600">Modales Accesibles</div>
              <p className="text-xs text-stone-500">
                Fondos con desenfoque (`backdrop-blur-md`), foco en accesibilidad, bloqueo de scroll innecesario y botones grandes táctiles compatibles con pulgares móviles.
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-3`}>
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-600">Steppers Numéricos</div>
              <p className="text-xs text-stone-500">
                Botones de incremento y decremento con micro-rebote `active:scale-95` y fuentes `tabular-nums` que evitan saltos de diseño cuando el precio sube.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View: Storefront */}
      {activeView === 'store' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
          
          {/* Dynamic Free Shipping Progress Banner */}
          <div className={`p-4 rounded-2xl border ${theme.border} ${theme.cardBg} shadow-sm transition`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Icon name="truck" className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    {cartCalculations.isFreeShipping ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Icon name="sparkles" className="w-4 h-4 text-amber-500" />
                        ¡Envío GRATIS activado para {selectedComuna.name}!
                      </span>
                    ) : (
                      <span>
                        Faltan <strong>${cartCalculations.amountNeededForFree.toLocaleString('es-CL')}</strong> para Envío Gratis
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    Monto base para envío libre: ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 self-start sm:self-auto">
                {cartCalculations.progressToFreeShipping}% completado
              </span>
            </div>
            
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${cartCalculations.progressToFreeShipping}%` }}
              ></div>
            </div>
          </div>

          {/* Hero Promotional Banner */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-7 sm:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                COSECHADO HOY EN PAINE Y CURACAVÍ
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Verdura fresca a tu puerta en <span className="text-emerald-300 underline decoration-amber-400 decoration-wavy">menos de 24 horas</span>
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                Pide por kilos sueltos o aprovecha nuestros packs listos con descuentos de hasta un 20%. También puedes diseñar tu propio pack a medida.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsPackBuilderOpen(true)}
                  className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <Icon name="sparkles" className="w-4 h-4 text-stone-950" />
                  Diseñar mi Propio Pack (-15%)
                </button>
                <a
                  href="#packs"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider transition border border-white/20 backdrop-blur-md flex items-center gap-2"
                >
                  <Icon name="package" className="w-4 h-4" />
                  Ver Packs Armados
                </a>
              </div>
            </div>
          </section>

          {/* Interactive Callout Banner: Custom Pack Promotion */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Icon name="package" className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">¿Tienes preferencias específicas en tu familia?</h3>
                <p className="text-xs sm:text-sm text-amber-100">
                  Arma una canasta con tus 4 a 8 verduras favoritas y obtén automáticamente hasta un <strong>15% de ahorro</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPackBuilderOpen(true)}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow active:scale-95 shrink-0"
            >
              Abrir Creador de Packs
            </button>
          </div>

          {/* Packs Section */}
          <section id="packs" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-600">Ahorro y Rapidez</span>
                <h2 className="text-2xl font-extrabold tracking-tight">Packs Armados Listos para Agregar</h2>
                <p className="text-xs text-stone-500">Combos prediseñados y canastas creadas por ti.</p>
              </div>
              <button
                onClick={() => setIsPackBuilderOpen(true)}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <Icon name="plus" className="w-3.5 h-3.5" />
                Crear Nuevo Pack Personalizado
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...customPacksList, ...INITIAL_PACKS].map((pack) => {
                const inCartQty = packCart[pack.id] || 0;
                return (
                  <div
                    key={pack.id}
                    className={`rounded-2xl border ${theme.border} ${theme.cardBg} overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between group relative`}
                  >
                    <div>
                      {/* Pack Image */}
                      <div className="relative h-44 overflow-hidden bg-stone-100">
                        <img
                          src={pack.image}
                          alt={pack.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-stone-900/85 backdrop-blur-md text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-stone-700">
                          {pack.tag}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                          Ahorras {pack.savings}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2.5">
                        <h3 className="font-bold text-base leading-snug">{pack.title}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2">{pack.subtitle}</p>

                        <div className="pt-2 border-t border-stone-100 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            Incluye:
                          </div>
                          <ul className="text-xs text-stone-600 space-y-0.5 max-h-24 overflow-y-auto pr-1">
                            {pack.items.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span className="truncate">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Price and Add button */}
                    <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-stone-400 line-through">
                          ${pack.oldPrice.toLocaleString('es-CL')}
                        </div>
                        <div className="text-lg font-extrabold text-emerald-700">
                          ${pack.price.toLocaleString('es-CL')}
                        </div>
                      </div>

                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-0.5">
                          <button
                            onClick={() => removePack(pack.id)}
                            className="w-7 h-7 rounded-lg bg-white text-stone-700 hover:bg-stone-100 flex items-center justify-center font-bold text-xs shadow-sm"
                          >
                            <Icon name="minus" className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs text-emerald-900 w-5 text-center">{inCartQty}</span>
                          <button
                            onClick={() => addPack(pack.id)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold text-xs shadow-sm"
                          >
                            <Icon name="plus" className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addPack(pack.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <Icon name="plus" className="w-3.5 h-3.5" />
                          Añadir Pack
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Catalog Filter Controls */}
          <section id="catalogo" className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-600">Catálogo Individual</span>
                <h2 className="text-2xl font-extrabold tracking-tight">Verduras y Frutas Sueltas</h2>
                <p className="text-xs text-stone-500">Selecciona kilo por kilo con maduración garantizada.</p>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="popular">Más Populares</option>
                  <option value="price-asc">Menor Precio</option>
                  <option value="price-desc">Mayor Precio</option>
                  <option value="rating">Mejor Calificación</option>
                </select>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'Todos los productos (9)' },
                { id: 'hojas', label: 'Hojas Verdes (3)' },
                { id: 'frutas', label: 'Frutas & Frutos (3)' },
                { id: 'tuberculos', label: 'Tubérculos & Raíces (2)' },
                { id: 'aromaticas', label: 'Aromáticas (1)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                      : `border ${theme.border} ${theme.cardBg} hover:bg-stone-100 text-stone-600`
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => {
                const qtyInCart = cart[prod.id] || 0;
                return (
                  <div
                    key={prod.id}
                    className={`rounded-2xl border ${theme.border} ${theme.cardBg} overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between group`}
                  >
                    <div>
                      {/* Image + Quick View hover trigger */}
                      <div className="relative h-44 overflow-hidden bg-stone-100">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        {prod.badge && (
                          <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                            {prod.badge}
                          </div>
                        )}

                        {/* Quick View Button */}
                        <button
                          onClick={() => setQuickViewProduct(prod)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-white/90 hover:bg-white text-stone-700 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-200"
                          title="Vista rápida del producto"
                        >
                          <Icon name="eye" className="w-4 h-4" />
                        </button>

                        <div className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-md text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Icon name="mapPin" className="w-3 h-3 text-emerald-400" />
                          <span>{prod.harvest}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>{prod.categoryLabel}</span>
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {prod.unitDetail}
                          </span>
                        </div>
                        <h3
                          onClick={() => setQuickViewProduct(prod)}
                          className="font-bold text-base leading-snug cursor-pointer hover:text-emerald-600 transition"
                        >
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-stone-500 line-clamp-1">{prod.nutrition}</p>
                      </div>
                    </div>

                    {/* Stepper Footer */}
                    <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-extrabold text-stone-900">
                          ${prod.price.toLocaleString('es-CL')}
                        </div>
                        <div className="text-[11px] text-stone-400 uppercase font-semibold">
                          por {prod.unit}
                        </div>
                      </div>

                      {qtyInCart > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-0.5">
                          <button
                            onClick={() => updateQuantity(prod.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white text-stone-800 hover:bg-stone-100 flex items-center justify-center font-bold text-xs shadow-sm active:scale-95"
                          >
                            <Icon name="minus" className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs text-emerald-900 w-5 text-center">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => updateQuantity(prod.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold text-xs shadow-sm active:scale-95"
                          >
                            <Icon name="plus" className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateQuantity(prod.id, 1)}
                          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-emerald-700 text-white font-medium text-xs transition active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                          <Icon name="plus" className="w-3.5 h-3.5" />
                          Añadir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {/* MODAL 1: Custom Pack Builder Modal */}
      {isPackBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsPackBuilderOpen(false)}
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
          ></div>

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow">
                  <Icon name="package" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-stone-900">Arma tu Propio Pack Personalizado</h3>
                  <p className="text-xs text-stone-500">
                    Elige 4 o más verduras/frutas y recibe un <strong>10% a 15% de descuento automático</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPackBuilderOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-white transition"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Pack Title & Produce selector */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Nombre para tu Pack:</label>
                <input
                  type="text"
                  value={customPackTitle}
                  onChange={(e) => setCustomPackTitle(e.target.value)}
                  placeholder="Ej: Canasta de la Abuela, Pack Ensaladas de Oficina..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Produce Selection Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                  <span>Selecciona productos a incluir:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {customPackSummary.totalItems} productos seleccionados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {PRODUCTS_DATA.map((prod) => {
                    const count = customPackItems[prod.id] || 0;
                    return (
                      <div
                        key={prod.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          count > 0 ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' : 'border-stone-200 bg-stone-50/50'
                        }`}
                      >
                        <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs truncate">{prod.name}</h4>
                          <p className="text-[11px] text-stone-500">${prod.price.toLocaleString('es-CL')} / {prod.unit}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCustomPackItem(prod.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-stone-100"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{count}</span>
                          <button
                            onClick={() => updateCustomPackItem(prod.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-stone-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer: Live Discount & Action */}
            <div className="p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-600 space-y-0.5 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span>Precio normal: <span className="line-through text-stone-400">${customPackSummary.basePrice.toLocaleString('es-CL')}</span></span>
                  {customPackSummary.discountPct > 0 && (
                    <span className="bg-amber-400 text-stone-900 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      -{customPackSummary.discountPct}% PACK
                    </span>
                  )}
                </div>
                <div className="text-base font-black text-emerald-800">
                  Total Pack: ${customPackSummary.finalPrice.toLocaleString('es-CL')}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsPackBuilderOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCustomPack}
                  disabled={customPackSummary.totalItems < 3}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-xs uppercase tracking-wider shadow-md transition active:scale-95"
                >
                  Guardar y Agregar Pack
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Product Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setQuickViewProduct(null)}
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
          ></div>

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 z-10 p-2 text-white bg-stone-950/60 rounded-full hover:bg-stone-950 transition"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>

            <div className="relative h-56 bg-stone-100">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-stone-100 text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-1.5">
                <Icon name="mapPin" className="w-3.5 h-3.5 text-emerald-400" />
                <span>{quickViewProduct.harvest}</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                  {quickViewProduct.categoryLabel}
                </span>
                <h3 className="text-xl font-black text-stone-900">{quickViewProduct.name}</h3>
                <p className="text-xs text-stone-500 mt-1">{quickViewProduct.unitDetail}</p>
              </div>

              <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs">
                <div className="flex items-center gap-2 text-stone-700 font-semibold">
                  <Icon name="sparkles" className="w-4 h-4 text-emerald-600" />
                  <span>Aporte nutricional:</span>
                </div>
                <p className="text-stone-500 pl-6">{quickViewProduct.nutrition}</p>

                <div className="flex items-center gap-2 text-stone-700 font-semibold pt-1">
                  <Icon name="leaf" className="w-4 h-4 text-amber-500" />
                  <span>Idea de receta:</span>
                </div>
                <p className="text-stone-500 pl-6">{quickViewProduct.recipeTip}</p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-stone-900">
                    ${quickViewProduct.price.toLocaleString('es-CL')}
                  </div>
                  <div className="text-xs text-stone-400">por {quickViewProduct.unit}</div>
                </div>

                <button
                  onClick={() => {
                    updateQuantity(quickViewProduct.id, 1);
                    setQuickViewProduct(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center gap-2"
                >
                  <Icon name="plus" className="w-4 h-4" />
                  Sumar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Checkout Express Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsCheckoutModalOpen(false)}
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
          ></div>

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <Icon name="whatsapp" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">Confirmar Pedido Express</h3>
                  <p className="text-xs text-stone-500">Revisa tus datos antes de enviar a WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Payment selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">¿Cómo prefieres pagar?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'transfer', label: 'Transferencia' },
                    { id: 'webpay', label: 'Webpay/Tarjeta' },
                    { id: 'cash', label: 'Efectivo entrega' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedPaymentMethod(m.id)}
                      className={`p-2 rounded-xl border text-center font-semibold transition ${
                        selectedPaymentMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery info summary */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Destinatario:</span>
                  <span className="font-bold text-stone-800">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Teléfono:</span>
                  <span className="font-bold text-stone-800">{customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Dirección:</span>
                  <span className="font-bold text-stone-800">{customerAddress}, {selectedComuna.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Ventana estimada:</span>
                  <span className="font-bold text-emerald-700">{selectedComuna.time}</span>
                </div>
              </div>

              {/* Price total */}
              <div className="pt-2 border-t border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal productos:</span>
                  <span>${cartCalculations.subtotal.toLocaleString('es-CL')}</span>
                </div>
                {cartCalculations.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-600 font-bold">
                    <span>Descuento cupón:</span>
                    <span>-${cartCalculations.discountAmount.toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>Despacho:</span>
                  <span>{cartCalculations.isFreeShipping ? 'GRATIS' : `$${cartCalculations.deliveryFee.toLocaleString('es-CL')}`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Final:</span>
                  <span className="text-emerald-700">${cartCalculations.total.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-stone-200 bg-stone-50">
              <a
                href={generatedWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <Icon name="whatsapp" className="w-4 h-4" />
                Abrir WhatsApp y Enviar Pedido
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
          ></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className={`w-screen max-w-md ${theme.cardBg} shadow-2xl flex flex-col justify-between border-l ${theme.border}`}>
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Icon name="shoppingBag" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Tu Canasta de Verduras</h3>
                    <p className="text-xs text-stone-400">{cartCalculations.itemCount} productos en total</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                
                {/* Free Shipping Alert in Drawer */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Despacho ({selectedComuna.name}):</span>
                    <span className={cartCalculations.isFreeShipping ? "text-emerald-600 font-bold" : "text-stone-700"}>
                      {cartCalculations.isFreeShipping ? '¡GRATIS!' : `$${cartCalculations.deliveryFee.toLocaleString('es-CL')}`}
                    </span>
                  </div>
                  {!cartCalculations.isFreeShipping && (
                    <p className="text-[11px] text-stone-500">
                      Suma ${cartCalculations.amountNeededForFree.toLocaleString('es-CL')} más para envío gratuito.
                    </p>
                  )}
                </div>

                {/* Coupon Code Input */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de cupón (Ej: FRESCO10)"
                    value={appliedCoupon}
                    onChange={(e) => setAppliedCoupon(e.target.value)}
                    className="flex-1 text-xs p-2 rounded-lg border border-stone-300 bg-white uppercase font-mono"
                  />
                  <button
                    onClick={() => applyPromoCode(appliedCoupon)}
                    className="px-3 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    Aplicar
                  </button>
                </div>

                {/* Single Items List */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Verduras Sueltas</div>
                  {Object.entries(cart).length === 0 && Object.entries(packCart).length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs">
                      Tu canasta está vacía. Selecciona verduras o packs para comenzar.
                    </div>
                  ) : (
                    Object.entries(cart).map(([prodId, qty]) => {
                      const prod = PRODUCTS_DATA.find(p => p.id === prodId);
                      if (!prod) return null;
                      return (
                        <div key={prodId} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-stone-100 bg-stone-50/50">
                          <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs truncate">{prod.name}</h4>
                            <p className="text-[11px] text-stone-400">${prod.price.toLocaleString('es-CL')} / {prod.unit}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(prod.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-xs hover:bg-stone-100"
                            >
                              -
                            </button>
                            <span className="w-4 text-center text-xs font-bold">{qty}</span>
                            <button
                              onClick={() => updateQuantity(prod.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-xs hover:bg-stone-100"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-xs font-bold text-stone-900 w-14 text-right">
                            ${(prod.price * qty).toLocaleString('es-CL')}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Packs in Cart */}
                {Object.entries(packCart).length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Packs en Carrito</div>
                    {Object.entries(packCart).map(([packId, qty]) => {
                      const allPacks = [...INITIAL_PACKS, ...customPacksList];
                      const pack = allPacks.find(p => p.id === packId);
                      if (!pack) return null;
                      return (
                        <div key={packId} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-amber-200 bg-amber-50/40">
                          <img src={pack.image} alt={pack.title} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs truncate">{pack.title}</h4>
                            <p className="text-[11px] text-amber-700 font-bold">${pack.price.toLocaleString('es-CL')}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                            <button onClick={() => removePack(pack.id)} className="w-5 h-5 rounded flex items-center justify-center text-xs">-</button>
                            <span className="w-4 text-center text-xs font-bold">{qty}</span>
                            <button onClick={() => addPack(pack.id)} className="w-5 h-5 rounded flex items-center justify-center text-xs">+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Delivery Form */}
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Datos de Despacho</div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600 block">Comuna:</label>
                    <select
                      value={selectedComuna.name}
                      onChange={(e) => {
                        const c = COMUNAS_SANTIAGO.find(item => item.name === e.target.value);
                        if (c) setSelectedComuna(c);
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                    >
                      {COMUNAS_SANTIAGO.map((comuna) => (
                        <option key={comuna.name} value={comuna.name}>
                          {comuna.name} (+${comuna.fee.toLocaleString('es-CL')}) — {comuna.time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre"
                      className="text-xs p-2 rounded-xl border border-stone-300 bg-white"
                    />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+56 9..."
                      className="text-xs p-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Calle, número, departamento..."
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                  />
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal:</span>
                    <span>${cartCalculations.subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  {cartCalculations.discountAmount > 0 && (
                    <div className="flex justify-between text-amber-600 font-bold">
                      <span>Descuento cupón:</span>
                      <span>-${cartCalculations.discountAmount.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-500">
                    <span>Despacho:</span>
                    <span>{cartCalculations.isFreeShipping ? 'GRATIS' : `$${cartCalculations.deliveryFee.toLocaleString('es-CL')}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
                    <span>Total a Pagar:</span>
                    <span className="text-emerald-700">${cartCalculations.total.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                  disabled={cartCalculations.itemCount === 0}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
                >
                  <Icon name="whatsapp" className="w-4 h-4" />
                  Ir al Checkout Express
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 flex items-center justify-between gap-3 z-30 shadow-2xl">
        <button
          onClick={() => setIsPackBuilderOpen(true)}
          className="p-2.5 rounded-xl border border-emerald-600 text-emerald-700 font-bold text-xs flex items-center gap-1 active:scale-95"
        >
          <Icon name="sparkles" className="w-4 h-4 text-emerald-600" />
          <span>Crear Pack</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/30 active:scale-95"
        >
          <div className="flex items-center gap-1.5">
            <Icon name="shoppingCart" className="w-4 h-4" />
            <span>Canasta ({cartCalculations.itemCount})</span>
          </div>
          <span>${cartCalculations.total.toLocaleString('es-CL')}</span>
        </button>
      </div>

    </div>
  );
}