import { Brand } from '../types';

export const BRAND_LIST: Brand[] = [
  {
    id: 'rayban',
    name: 'Ray-Ban',
    tagline: 'Genuine Since 1937',
    logoSrc: 'Ray-Ban',
    description: 'Iconic eyewear designed for innovators and cultural pioneers. Experience timeless styling paired with advanced optical shielding.',
    accentColor: '#C9A84C',
    featuredSkus: [
      {
        id: 'rayban-aviator',
        name: 'Ray-Ban Aviator Optical',
        price: 4500.00,
        image_url: '/images/hero_glasses.png',
        category: 'glasses',
        stock: 8
      },
      {
        id: 'rayban-wayfarer',
        name: 'Ray-Ban Wayfarer Classic',
        price: 8999.00,
        image_url: '/images/hero_sunglasses.png',
        category: 'sunglasses',
        stock: 5
      },
      {
        id: 'rayban-clubmaster',
        name: 'Ray-Ban Clubmaster Elegant',
        price: 7499.00,
        image_url: '/images/hero_glasses.png',
        category: 'glasses',
        stock: 4
      }
    ]
  },
  {
    id: 'titan',
    name: 'Titan',
    tagline: 'Refining Precision & Style',
    logoSrc: 'Titan',
    description: 'Classic craftsmanship meets contemporary design. India\'s most trusted timepiece and optical companion for every formal milestone.',
    accentColor: '#C9A84C',
    featuredSkus: [
      {
        id: 'titan-classic',
        name: 'Titan Classic Rectangular',
        price: 1499.00,
        image_url: '/images/hero_glasses.png',
        category: 'glasses',
        stock: 15
      },
      {
        id: 'titan-neo',
        name: 'Titan Neo Classic Quartz',
        price: 3299.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 12
      },
      {
        id: 'titan-edge',
        name: 'Titan Edge Ultra-Slim',
        price: 9999.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 3
      }
    ]
  },
  {
    id: 'fastrack',
    name: 'Fastrack',
    tagline: 'Effortlessly Bold, Uniquely You',
    logoSrc: 'Fastrack',
    description: 'Vibrant, athletic eyewear and dynamic watches built for a generation that defines its own trends and style templates.',
    accentColor: '#C9A84C',
    featuredSkus: [
      {
        id: 'fastrack-sporty',
        name: 'Fastrack Sporty Sunglasses',
        price: 2199.00,
        image_url: '/images/hero_sunglasses.png',
        category: 'sunglasses',
        stock: 20
      },
      {
        id: 'fastrack-chrono',
        name: 'Fastrack Chronograph Watch',
        price: 4495.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 10
      },
      {
        id: 'fastrack-geek-chic',
        name: 'Fastrack Geek Chic Round',
        price: 1850.00,
        image_url: '/images/hero_glasses.png',
        category: 'glasses',
        stock: 11
      }
    ]
  },
  {
    id: 'oakley',
    name: 'Oakley',
    tagline: 'High Definition Optics',
    logoSrc: 'Oakley',
    description: 'Engineered for athletes who demand peak performance. High-wrap frames built to survive extreme sports and active lifestyle environments.',
    accentColor: '#C9A84C',
    featuredSkus: [
      {
        id: 'oakley-radar',
        name: 'Oakley Radar EV Path',
        price: 14500.00,
        image_url: '/images/hero_sunglasses.png',
        category: 'sunglasses',
        stock: 6
      },
      {
        id: 'oakley-holbrook',
        name: 'Oakley Holbrook Matte Black',
        price: 9800.00,
        image_url: '/images/hero_sunglasses.png',
        category: 'sunglasses',
        stock: 7
      },
      {
        id: 'oakley-crosslink',
        name: 'Oakley Crosslink Performance',
        price: 6800.00,
        image_url: '/images/hero_glasses.png',
        category: 'glasses',
        stock: 4
      }
    ]
  },
  {
    id: 'casio',
    name: 'Casio',
    tagline: 'Reliability Built to Last',
    logoSrc: 'Casio',
    description: 'Renowned digital durability and vintage aesthetic. From heavy-duty G-Shock military armor to retro steel daily timekeepers.',
    accentColor: '#C9A84C',
    featuredSkus: [
      {
        id: 'casio-gshock',
        name: 'Casio G-Shock Matte Black',
        price: 7995.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 9
      },
      {
        id: 'casio-vintage',
        name: 'Casio Vintage Digital Steel',
        price: 2495.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 18
      },
      {
        id: 'casio-edifice',
        name: 'Casio Edifice Sapphire Chrono',
        price: 12995.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 4
      }
    ]
  },
  {
    id: 'seiko',
    name: 'Seiko',
    tagline: 'Moving ahead. Touching hearts.',
    logoSrc: 'Seiko',
    description: 'Mechanical mastery since 1881. Automatic movement and luxury dials built for enthusiasts who appreciate watchmaking tradition.',
    accentColor: '#C9A84C',
    featuredSkus: [
      {
        id: 'seiko-presage',
        name: 'Seiko Presage Cocktail Time',
        price: 38000.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 2
      },
      {
        id: 'seiko-sports5',
        name: 'Seiko 5 Sports Automatic',
        price: 22000.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 3
      },
      {
        id: 'seiko-prospex',
        name: 'Seiko Prospex Diver Automatic',
        price: 45000.00,
        image_url: '/images/hero_watch.png',
        category: 'watches',
        stock: 1
      }
    ]
  }
];
