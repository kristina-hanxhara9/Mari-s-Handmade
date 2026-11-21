import { create } from 'zustand';
import { CartState, Product, Order, SiteConfig } from './types';
import { products as fallbackProducts } from './data';
import * as db from './lib/supabase';

const defaultSiteConfig: SiteConfig = {
  heroBackground: '/images/backround-image.webp',
  heroForeground: '/images/collage-prodcut.webp',
  storyImage: '/images/web-image.webp',
  aboutImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
  reviewsBackground: 'https://images.unsplash.com/photo-1596436066266-932f995a9478?q=80&w=2000&auto=format&fit=crop',
  navbarBackground: '/images/nav-photo.webp',
};

// --- Cart Store ---
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isGift: false,
  giftNote: '',
  addItem: (product: Product) => {
    const currentItems = get().items;
    const existingItem = currentItems.find((item) => item.id === product.id);
    if (existingItem) {
      set({
        items: currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
        isOpen: true,
      });
    } else {
      set({ items: [...currentItems, { ...product, quantity: 1 }], isOpen: true });
    }
  },
  removeItem: (id: string) => set({ items: get().items.filter((item) => item.id !== id) }),
  updateQuantity: (id: string, delta: number) =>
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      ),
    }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  toggleGift: () => set({ isGift: !get().isGift }),
  setGiftNote: (note: string) => set({ giftNote: note }),
  clearCart: () => set({ items: [], isGift: false, giftNote: '' }),
  subtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  total: () => {
    const sub = get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return get().isGift ? sub + 5 : sub;
  },
}));

// --- Catalogue / Admin Store ---
// Supabase is the source of truth. When it isn't configured yet, the shop shows
// the fallback catalogue from data.ts and admin editing is disabled.
interface AdminStore {
  products: Product[];
  orders: Order[];
  siteConfig: SiteConfig;
  isLoading: boolean;
  isSupabaseEnabled: boolean;
  loadProducts: (includeOutOfStock?: boolean) => Promise<void>;
  loadSiteConfig: () => Promise<void>;
  loadOrders: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateSiteConfig: (updates: Partial<SiteConfig>) => void;
  saveSiteConfig: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>()((set, get) => ({
  products: db.isSupabaseConfigured() ? [] : fallbackProducts,
  orders: [],
  siteConfig: defaultSiteConfig,
  isLoading: db.isSupabaseConfigured(),
  isSupabaseEnabled: db.isSupabaseConfigured(),

  loadProducts: async (includeOutOfStock = false) => {
    if (!db.isSupabaseConfigured()) return;
    set({ isLoading: true });
    try {
      set({ products: await db.fetchProducts(includeOutOfStock) });
    } catch (error) {
      console.error('Failed to load products:', error);
      set({ products: fallbackProducts });
    } finally {
      set({ isLoading: false });
    }
  },

  loadSiteConfig: async () => {
    if (!db.isSupabaseConfigured()) return;
    try {
      const saved = await db.fetchSiteConfig();
      if (saved) set({ siteConfig: { ...defaultSiteConfig, ...saved } });
    } catch (error) {
      console.error('Failed to load site config:', error);
    }
  },

  loadOrders: async () => {
    if (!db.isSupabaseConfigured()) return;
    set({ orders: await db.fetchOrders() });
  },

  // Writes go to Supabase first; local state changes only when they succeed.
  // Errors are thrown so the admin page can show them.
  addProduct: async (product) => {
    const created = await db.createProduct(product);
    set({ products: [created, ...get().products] });
  },

  updateProduct: async (id, updates) => {
    const updated = await db.updateProduct(id, updates);
    set({ products: get().products.map((p) => (p.id === id ? updated : p)) });
  },

  removeProduct: async (id) => {
    await db.deleteProduct(id);
    set({ products: get().products.filter((p) => p.id !== id) });
  },

  updateOrderStatus: async (id, status) => {
    await db.updateOrderStatus(id, status);
    set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) });
  },

  updateSiteConfig: (updates) => set({ siteConfig: { ...get().siteConfig, ...updates } }),

  saveSiteConfig: async () => {
    await db.saveSiteConfig(get().siteConfig);
  },
}));

if (typeof window !== 'undefined') {
  useAdminStore.getState().loadProducts();
  useAdminStore.getState().loadSiteConfig();
}
