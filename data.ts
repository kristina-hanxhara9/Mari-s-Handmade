import { Product } from './types';

// Fallback catalogue, used when Supabase isn't configured and as the seed in supabase-schema.sql.
// image: '' shows a "photo coming soon" arch until a real photo is uploaded in the admin.
export const products: Product[] = [
  {
    id: '1',
    name: 'Blossom Box with Gold Chain',
    description: 'Our signature arrangement featuring hand-poured peony, rose, and heart-shaped candles in soft pinks and creams. Presented in a luxury white box with an elegant gold chain handle.',
    price: 48.00,
    category: 'Arrangements',
    image: `/images/produkt1.webp`,
    scentNotes: 'Peony, Rose Petals, Sweet Pea'
  },
  {
    id: '2',
    name: 'Celestial Blue & Gold Pillar',
    description: 'A masterpiece of wax art. This tall pillar features a mesmerising mottled blue and white texture, hand-gilded with 24k gold leaf accents. Each piece is completely unique.',
    price: 35.00,
    category: 'Pillars',
    image: `/images/produkt2.webp`,
    scentNotes: 'Ocean Mist, Driftwood, Amber'
  },
  {
    id: '3',
    name: 'Carousel Dreams Jar',
    description: 'A whimsical white ceramic vessel adorned with intricate carousel horse reliefs. Filled with our creamy soy wax blend.',
    price: 42.00,
    category: 'Jars',
    image: `/images/produkt3.webp`,
    scentNotes: 'Vanilla Bean, Cashmere, Sandalwood'
  },
  {
    id: '4',
    name: 'Pastel Tulip Bundle',
    description: 'A delicate collection of individual tulip candles in spring pastel shades. Perfect for table settings.',
    price: 22.00,
    category: 'Novelty',
    image: '',
    scentNotes: 'Fresh Cut Grass, Lemon Zest'
  },
  {
    id: '5',
    name: 'Textured Love Heart',
    description: 'Intricately textured heart candle in a vibrant berry pink. A perfect small gift for someone special.',
    price: 16.00,
    category: 'Novelty',
    image: '',
    scentNotes: 'Raspberry, Champagne, Sugar'
  },
  {
    id: '6',
    name: 'Midnight Gold',
    description: 'A deep blue version of our signature gold-leaf pillar, bringing a moody elegance to your evening.',
    price: 35.00,
    category: 'Pillars',
    image: '',
    scentNotes: 'Oud, Black Pepper, Bergamot'
  },
  {
    id: '7',
    name: 'Frosted Fir Luminary',
    description: 'Winter white pillar with hand-painted evergreen branches and a dusting of pearl shimmer—perfect for Christmas mantels.',
    price: 38.00,
    category: 'Christmas',
    image: '',
    scentNotes: 'Pine Resin, Clove, Winter Citrus'
  },
  {
    id: '8',
    name: 'Blush Peony Heart',
    description: 'Romantic sculpted heart with layered petals and a satin bow—made for Valentines surprises.',
    price: 24.00,
    category: 'Valentines',
    image: '',
    scentNotes: 'Rosewater, Peony, Vanilla Sugar'
  },
  {
    id: '9',
    name: 'Golden Yolk Egg Duo',
    description: 'Playful speckled egg candles nested in straw cups—sweet Easter brunch accents.',
    price: 18.00,
    category: 'Easter',
    image: '',
    scentNotes: 'Lemon Curd, Neroli, Vanilla Pod'
  },
  {
    id: '10',
    name: 'Confetti Drip Celebration Pillar',
    description: 'Tall ivory pillar with hand-poured candy-color drips and gold foil—built to crown a birthday table.',
    price: 32.00,
    category: 'Birthday',
    image: '',
    scentNotes: 'Sparkling Citrus, Buttercream, Tonka'
  },
  {
    id: '11',
    name: 'Mother’s Garden Bouquet',
    description: 'Cluster of sculpted floral tapers wrapped in silk ribbon, a tender nod to Mother’s Day brunches.',
    price: 36.00,
    category: 'Mother\'s Day',
    image: '',
    scentNotes: 'Magnolia, White Tea, Honeycomb'
  },
  {
    id: '12',
    name: 'Harvest Amber Lantern',
    description: 'Amber-toned carved lantern with leaf reliefs, ready for autumn gatherings and cozy dinners.',
    price: 34.00,
    category: 'Autumn',
    image: '',
    scentNotes: 'Maple Wood, Smoked Vanilla, Spiced Pear'
  }
];
