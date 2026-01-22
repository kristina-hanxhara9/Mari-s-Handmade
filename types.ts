
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  scentNotes: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'shipped' | 'delivered';
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

export interface AdminState {
  products: Product[];
  orders: Order[];
  siteConfig: SiteConfig;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateSiteConfig: (updates: Partial<SiteConfig>) => void;
}
