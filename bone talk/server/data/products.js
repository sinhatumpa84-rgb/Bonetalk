// Server-side product catalog for validation
// Prices are stored in INR (Indian Rupee integer amount)
import { calculateBoneTalkPrice } from './pricing.js'

export const PRODUCT_CATALOG = {
  // Test Integration Item (₹10 / 1000 paise)
  'test-item-10': {
    id: 'test-item-10',
    name: 'BoneTalk Integration Test Node',
    edition: 'TEST MODE',
    price: 10,
    image: '/favicon.svg',
    currency: 'INR',
  },
  // Exhibition Series Products (Calculated via Centralized BoneTalk Pricing System)
  'silver-sage': {
    id: 'silver-sage',
    name: 'SILVER SAGE',
    edition: 'HERITAGE EDITION',
    price: calculateBoneTalkPrice(13799).numeric,
    image: '/products/new/silver-sage.jpeg',
    currency: 'INR',
  },
  'deep-teal': {
    id: 'deep-teal',
    name: 'DEEP TEAL',
    edition: 'HERITAGE EDITION',
    price: calculateBoneTalkPrice(14099).numeric,
    image: '/products/new/deep-teal.jpeg',
    currency: 'INR',
  },
  'midnight-navy': {
    id: 'midnight-navy',
    name: 'MIDNIGHT NAVY',
    edition: 'HERITAGE EDITION',
    price: calculateBoneTalkPrice(14799).numeric,
    image: '/products/new/midnight-navy.jpeg',
    currency: 'INR',
  },
  'plum-purple': {
    id: 'plum-purple',
    name: 'PLUM PURPLE',
    edition: 'HERITAGE EDITION',
    price: calculateBoneTalkPrice(15799).numeric,
    image: '/products/new/plum-purple.jpeg',
    currency: 'INR',
  },
  'terracotta-orange': {
    id: 'terracotta-orange',
    name: 'TERRACOTTA ORANGE',
    edition: 'HERITAGE EDITION',
    price: calculateBoneTalkPrice(13099).numeric,
    image: '/products/new/terracotta-orange.jpeg',
    currency: 'INR',
  },
  'warm-beige': {
    id: 'warm-beige',
    name: 'WARM BEIGE',
    edition: 'SKIN TONE SERIES',
    price: calculateBoneTalkPrice(12999).numeric,
    image: '/products/new/warm-beige.jpeg',
    currency: 'INR',
  },
  'light-beige': {
    id: 'light-beige',
    name: 'LIGHT BEIGE',
    edition: 'SKIN TONE SERIES',
    price: calculateBoneTalkPrice(12999).numeric,
    image: '/products/new/light-beige.jpeg',
    currency: 'INR',
  },
  'tan-brown': {
    id: 'tan-brown',
    name: 'TAN BROWN',
    edition: 'SKIN TONE SERIES',
    price: calculateBoneTalkPrice(13299).numeric,
    image: '/products/new/tan-brown.jpeg',
    currency: 'INR',
  },
  'deep-brown': {
    id: 'deep-brown',
    name: 'DEEP BROWN',
    edition: 'SKIN TONE SERIES',
    price: calculateBoneTalkPrice(13499).numeric,
    image: '/products/new/deep-brown.jpeg',
    currency: 'INR',
  },
  'charcoal-black': {
    id: 'charcoal-black',
    name: 'CHARCOAL BLACK',
    edition: 'SKIN TONE SERIES',
    price: calculateBoneTalkPrice(12999).numeric,
    image: '/products/new/charcoal-black.jpeg',
    currency: 'INR',
  },
  'naruto-shinobi-legend': {
    id: 'naruto-shinobi-legend',
    name: 'NARUTO × SHINOBI LEGEND',
    edition: 'ANIME-TECH SPECIAL EDITION',
    price: calculateBoneTalkPrice(15299).numeric,
    image: '/products/new/naruto-shinobi-legend.jpeg',
    currency: 'INR',
  },
  'demon-slayer-water-breathing': {
    id: 'demon-slayer-water-breathing',
    name: 'DEMON SLAYER × WATER BREATHING',
    edition: 'ANIME-TECH SPECIAL EDITION',
    price: calculateBoneTalkPrice(15299).numeric,
    image: '/products/new/demon-slayer-water-breathing.jpeg',
    currency: 'INR',
  },
  'bleach-bankai-tech': {
    id: 'bleach-bankai-tech',
    name: 'BLEACH × BANKAI TECH',
    edition: 'ANIME-TECH SPECIAL EDITION',
    price: calculateBoneTalkPrice(14999).numeric,
    image: '/products/new/bleach-bankai-tech.jpeg',
    currency: 'INR',
  },
  'jjk-domain-expansion': {
    id: 'jjk-domain-expansion',
    name: 'JUJUTSU KAISEN × DOMAIN EXPANSION',
    edition: 'ANIME-TECH SPECIAL EDITION',
    price: calculateBoneTalkPrice(15799).numeric,
    image: '/products/new/jjk-domain-expansion.jpeg',
    currency: 'INR',
  },
  'death-note-shinigami-eye': {
    id: 'death-note-shinigami-eye',
    name: 'DEATH NOTE × SHINIGAMI EYE',
    edition: 'ANIME-TECH SPECIAL EDITION',
    price: calculateBoneTalkPrice(14999).numeric,
    image: '/products/new/death-note-shinigami-eye.jpeg',
    currency: 'INR',
  },
  'my-hero-plus-ultra': {
    id: 'my-hero-plus-ultra',
    name: 'MY HERO ACADEMIA × PLUS ULTRA',
    edition: 'ANIME-TECH SPECIAL EDITION',
    price: calculateBoneTalkPrice(14699).numeric,
    image: '/products/new/my-hero-plus-ultra.jpeg',
    currency: 'INR',
  },
  'dragon-ball-z-kamehameha': {
    id: 'dragon-ball-z-kamehameha',
    name: 'DRAGON BALL Z × KAMEHAMEHA',
    edition: 'ANIME-TECH SPECIAL EDITION',
    price: calculateBoneTalkPrice(15099).numeric,
    image: '/products/new/dragon-ball-z-kamehameha.jpeg',
    currency: 'INR',
  },
  'aviation-tech-flight-path': {
    id: 'aviation-tech-flight-path',
    name: 'AVIATION TECH × FLIGHT PATH',
    edition: 'EXPLORER SERIES',
    price: calculateBoneTalkPrice(13599).numeric,
    image: '/products/new/aviation-tech-flight-path.jpeg',
    currency: 'INR',
  },
  'space-exploration-orbit': {
    id: 'space-exploration-orbit',
    name: 'SPACE EXPLORATION × ORBIT',
    edition: 'EXPLORER SERIES',
    price: calculateBoneTalkPrice(14299).numeric,
    image: '/products/new/space-exploration-orbit.jpeg',
    currency: 'INR',
  },
  'cyberpunk-circuit': {
    id: 'cyberpunk-circuit',
    name: 'CYBER-PUNK FUTURE × CIRCUIT',
    edition: 'EXPLORER SERIES',
    price: calculateBoneTalkPrice(14499).numeric,
    image: '/products/new/cyberpunk-circuit.jpeg',
    currency: 'INR',
  },
  'ocean-life-reef': {
    id: 'ocean-life-reef',
    name: 'OCEAN LIFE × REEF',
    edition: 'EXPLORER SERIES',
    price: calculateBoneTalkPrice(13899).numeric,
    image: '/products/new/ocean-life-reef.jpeg',
    currency: 'INR',
  },
  'music-rockstar': {
    id: 'music-rockstar',
    name: 'MUSIC CULTURE × ROCKSTAR',
    edition: 'EXPLORER SERIES',
    price: calculateBoneTalkPrice(14199).numeric,
    image: '/products/new/music-rockstar.jpeg',
    currency: 'INR',
  },
  'sports-relay': {
    id: 'sports-relay',
    name: 'SPORTS LEGENDS × RELAY',
    edition: 'EXPLORER SERIES',
    price: calculateBoneTalkPrice(13699).numeric,
    image: '/products/new/sports-relay.jpeg',
    currency: 'INR',
  },
  // Core Series (Calculated via Centralized BoneTalk Pricing System)
  'saakantha-01': {
    id: 'saakantha-01',
    name: 'BoneTalk CORE',
    edition: 'FLAGSHIP SERIES',
    price: calculateBoneTalkPrice(12999).numeric,
    image: '/products/new/charcoal-black.jpeg',
    currency: 'INR',
  },
  'saakantha-02': {
    id: 'saakantha-02',
    name: 'BoneTalk PRO',
    edition: 'FLAGSHIP SERIES',
    price: calculateBoneTalkPrice(13799).numeric,
    image: '/products/new/silver-sage.jpeg',
    currency: 'INR',
  },
  'saakantha-03': {
    id: 'saakantha-03',
    name: 'BoneTalk ELITE',
    edition: 'FLAGSHIP SERIES',
    price: calculateBoneTalkPrice(14099).numeric,
    image: '/products/new/deep-teal.jpeg',
    currency: 'INR',
  },
  'saakantha-04': {
    id: 'saakantha-04',
    name: 'BoneTalk ULTRA',
    edition: 'FLAGSHIP SERIES',
    price: calculateBoneTalkPrice(14799).numeric,
    image: '/products/new/midnight-navy.jpeg',
    currency: 'INR',
  },
  'saakantha-05': {
    id: 'saakantha-05',
    name: 'BoneTalk SIGNATURE',
    edition: 'FLAGSHIP SERIES',
    price: calculateBoneTalkPrice(15799).numeric,
    image: '/products/new/plum-purple.jpeg',
    currency: 'INR',
  },
}

export function getProductById(id) {
  if (!id) return null
  return PRODUCT_CATALOG[id] || null
}

export function parsePrice(priceString) {
  if (typeof priceString === 'number') return priceString
  if (!priceString) return 0
  const clean = priceString.replace(/[^0-9]/g, '')
  return parseInt(clean, 10) || 0
}

// Single Source of Truth for Default BoneTalk Product Pricing
export const BONETALK_PRICING = calculateBoneTalkPrice(12999)
export const BONETALK_PRICE_INR = BONETALK_PRICING.numeric
export const BONETALK_PRICE_PAISE = BONETALK_PRICING.paise

