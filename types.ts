export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  scentNotes: string;
  burnTime?: string;
  featured?: boolean;
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  date: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  isGift: boolean;
  giftNote?: string;
}

export interface SiteConfig {
  heroBackground: string;
  heroForeground: string;
  storyImage: string;
  aboutImage: string;
  reviewsBackground: string;
  navbarBackground: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isGift: boolean;
  giftNote: string;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  toggleCart: () => void;
  toggleGift: () => void;
  setGiftNote: (note: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  total: () => number;
}
