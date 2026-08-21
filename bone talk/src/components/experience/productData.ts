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
    name: 'SAAKANTHA CORE',
    image: '/products/saakantha/media_1787318718299.jpg',
    price: '₹24,999',
    currency: 'INR',
    benefit: 'Assistive wearable that converts muscle signals into communication through personalized signal recognition.',
    specialty: 'Core communication device with advanced EMG sensing.',
    valueReason: 'Medical-grade sensor components, AI processing unit, precision assembly.',
    availability: 'Available for pre-order'
  },
  {
    id: 'saakantha-02',
    name: 'SAAKANTHA PRO',
    image: '/products/saakantha/media_1787318718315.jpg',
    price: '₹26,999',
    currency: 'INR',
    benefit: 'Enhanced communication wearable with advanced muscle pattern recognition.',
    specialty: 'Professional-grade sensing with extended battery life.',
    valueReason: 'Premium sensor array, enhanced processing power, professional construction.',
    availability: 'Available for pre-order'
  },
  {
    id: 'saakantha-03',
    name: 'SAAKANTHA ELITE',
    image: '/products/saakantha/media_1787318718332.jpg',
    price: '₹29,999',
    currency: 'INR',
    benefit: 'Premium assistive device with personalized learning algorithms.',
    specialty: 'Elite-tier signal processing with adaptive learning.',
    valueReason: 'Advanced AI integration, premium materials, extended feature set.',
    availability: 'Available for pre-order'
  },
  {
    id: 'saakantha-04',
    name: 'SAAKANTHA ULTRA',
    image: '/products/saakantha/media_1787318718345.jpg',
    price: '₹32,999',
    currency: 'INR',
    benefit: 'Flagship communication wearable with multi-modal signal interpretation.',
    specialty: 'Ultra-precision sensing with real-time AI adaptation.',
    valueReason: 'Flagship sensor suite, maximum processing capability, premium finish.',
    availability: 'Limited availability'
  },
  {
    id: 'saakantha-05',
    name: 'SAAKANTHA SIGNATURE',
    image: '/products/saakantha/media_1787318718406.jpg',
    price: '₹34,999',
    currency: 'INR',
    benefit: 'Signature edition with personalized calibration and premium construction.',
    specialty: 'Handcrafted assembly with individualized tuning.',
    valueReason: 'Bespoke calibration, signature-grade materials, artisan construction.',
    availability: 'Made to order'
  }
]
