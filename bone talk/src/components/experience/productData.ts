export interface Product {
  id: string
  name: string
  image: string
  price: string
  currency: string
  benefit: string
  specialty: string
  valueReason: string
  availability: string
}

export const products: Product[] = [
  {
    id: 'saakantha-01',
    name: 'BoneTalk CORE',
    image: '/products/new/charcoal-black.jpeg',
    price: '₹15,999',
    currency: 'INR',
    benefit: 'Assistive wearable that converts muscle signals into communication through personalized signal recognition.',
    specialty: 'Core communication device with advanced EMG sensing.',
    valueReason: 'Medical-grade sensor components, AI processing unit, precision assembly.',
    availability: 'Available for pre-order'
  },
  {
    id: 'saakantha-02',
    name: 'BoneTalk PRO',
    image: '/products/new/silver-sage.jpeg',
    price: '₹4,999',
    currency: 'INR',
    benefit: 'Enhanced communication wearable with advanced muscle pattern recognition.',
    specialty: 'Professional-grade sensing with extended battery life.',
    valueReason: 'Premium sensor array, enhanced processing power, professional construction.',
    availability: 'Available for pre-order'
  },
  {
    id: 'saakantha-03',
    name: 'BoneTalk ELITE',
    image: '/products/new/deep-teal.jpeg',
    price: '₹5,499',
    currency: 'INR',
    benefit: 'Premium assistive device with personalized learning algorithms.',
    specialty: 'Elite-tier signal processing with adaptive learning.',
    valueReason: 'Advanced AI integration, premium materials, extended feature set.',
    availability: 'Available for pre-order'
  },
  {
    id: 'saakantha-04',
    name: 'BoneTalk ULTRA',
    image: '/products/new/midnight-navy.jpeg',
    price: '₹6,499',
    currency: 'INR',
    benefit: 'Flagship communication wearable with multi-modal signal interpretation.',
    specialty: 'Ultra-precision sensing with real-time AI adaptation.',
    valueReason: 'Flagship sensor suite, maximum processing capability, premium finish.',
    availability: 'Limited availability'
  },
  {
    id: 'saakantha-05',
    name: 'BoneTalk SIGNATURE',
    image: '/products/new/plum-purple.jpeg',
    price: '₹7,499',
    currency: 'INR',
    benefit: 'Signature edition with personalized calibration and premium construction.',
    specialty: 'Handcrafted assembly with individualized tuning.',
    valueReason: 'Bespoke calibration, signature-grade materials, artisan construction.',
    availability: 'Made to order'
  }
]
