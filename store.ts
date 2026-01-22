
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, Product, AdminState, Order, SiteConfig } from './types';
import { products as initialProducts } from './data';

const getBasePath = () => {
  // Use import.meta.env.BASE_URL if available, otherwise default to '/'
  return (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
};

const defaultSiteConfig: SiteConfig = {
  heroBackground: `${getBasePath()}images/backround-image.png`,
  heroForeground: `${getBasePath()}images/collage-prodcut.png`,
  storyImage: `${getBasePath()}images/web-image.png`,
  aboutImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
  reviewsBackground: "https://images.unsplash.com/photo-1596436066266-932f995a9478?q=80&w=2000&auto=format&fit=crop",
  navbarBackground: `${getBasePath()}images/nav-photo.png`
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
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        isOpen: true,
      });
    } else {
      set({ items: [...currentItems, { ...product, quantity: 1 }], isOpen: true });
    }
  },
  removeItem: (id: string) => {
    set({ items: get().items.filter((item) => item.id !== id) });
  },
  updateQuantity: (id: string, delta: number) => {
    const currentItems = get().items;
    const mapped = currentItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    set({ items: mapped });
  },
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

// --- Admin / Product Store (Persisted to LocalStorage) ---
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      orders: [],
      siteConfig: defaultSiteConfig,
      addProduct: (product: Product) => {
        set({ products: [product, ...get().products] });
      },
      updateProduct: (id, updates) => {
        set({
          products: get().products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        });
      },
      removeProduct: (id: string) => {
        set({ products: get().products.filter((p) => p.id !== id) });
      },
      addOrder: (order: Order) => {
        set({ orders: [order, ...get().orders] });
      },
      updateOrderStatus: (id: string, status: Order['status']) => {
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)),
        });
      },
      updateSiteConfig: (updates) => {
        set({ siteConfig: { ...get().siteConfig, ...updates } });
      }
    }),
    {
      name: 'mari-admin-storage-v4', // versioned key to force refresh
    }
  )
);
