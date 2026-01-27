
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, Product, AdminState, Order, SiteConfig } from './types';
import { products as initialProducts } from './data';
import {
  fetchProducts,
  createProduct as supabaseCreateProduct,
  updateProduct as supabaseUpdateProduct,
  deleteProduct as supabaseDeleteProduct,
  createOrder as supabaseCreateOrder,
  fetchOrders,
  updateOrderStatus as supabaseUpdateOrderStatus,
  isSupabaseConfigured
} from './lib/supabase';

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

// Helper to convert Supabase product to app Product format
const mapSupabaseProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: p.price,
  image: p.image,
  description: p.description,
  scentNotes: p.scent_notes,
  burnTime: p.burn_time,
  category: p.category,
  featured: p.featured,
});

// Helper to convert app Product to Supabase format
const mapToSupabaseProduct = (p: Partial<Product>) => ({
  name: p.name,
  price: p.price,
  image: p.image,
  description: p.description,
  scent_notes: p.scentNotes,
  burn_time: p.burnTime,
  category: p.category,
  featured: p.featured ?? false,
  in_stock: true,
});

// --- Admin / Product Store (Supabase + LocalStorage fallback) ---
export const useAdminStore = create<AdminState & {
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  isLoading: boolean;
  isSupabaseEnabled: boolean;
}>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      orders: [],
      siteConfig: defaultSiteConfig,
      isLoading: false,
      isSupabaseEnabled: isSupabaseConfigured(),

      // Load products from Supabase
      loadProducts: async () => {
        if (!isSupabaseConfigured()) {
          console.log('Supabase not configured, using local data');
          return;
        }

        set({ isLoading: true });
        try {
          const products = await fetchProducts();
          if (products.length > 0) {
            set({ products: products.map(mapSupabaseProduct) });
          }
        } catch (error) {
          console.error('Failed to load products:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Load orders from Supabase
      loadOrders: async () => {
        if (!isSupabaseConfigured()) return;

        set({ isLoading: true });
        try {
          const orders = await fetchOrders();
          set({ orders: orders as Order[] });
        } catch (error) {
          console.error('Failed to load orders:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addProduct: async (product: Product) => {
        // Always update local state first
        set({ products: [product, ...get().products] });

        // Sync to Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            await supabaseCreateProduct(mapToSupabaseProduct(product) as any);
          } catch (error) {
            console.error('Failed to sync product to Supabase:', error);
          }
        }
      },

      updateProduct: async (id, updates) => {
        // Update local state
        set({
          products: get().products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        });

        // Sync to Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            await supabaseUpdateProduct(id, mapToSupabaseProduct(updates) as any);
          } catch (error) {
            console.error('Failed to sync product update to Supabase:', error);
          }
        }
      },

      removeProduct: async (id: string) => {
        // Update local state
        set({ products: get().products.filter((p) => p.id !== id) });

        // Sync to Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            await supabaseDeleteProduct(id);
          } catch (error) {
            console.error('Failed to sync product deletion to Supabase:', error);
          }
        }
      },

      addOrder: async (order: Order) => {
        // Update local state
        set({ orders: [order, ...get().orders] });

        // Sync to Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            await supabaseCreateOrder({
              customer_name: order.customerName,
              customer_email: order.customerEmail,
              customer_phone: order.customerPhone,
              shipping_address: order.shippingAddress,
              shipping_city: order.shippingCity,
              shipping_postcode: order.shippingPostcode,
              items: order.items.map(item => ({
                product_id: item.id,
                product_name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              subtotal: order.subtotal,
              shipping: order.shipping,
              total: order.total,
              is_gift: order.isGift,
              gift_message: order.giftNote,
              status: order.status,
              stripe_payment_id: order.paymentId,
            });
          } catch (error) {
            console.error('Failed to sync order to Supabase:', error);
          }
        }
      },

      updateOrderStatus: async (id: string, status: Order['status']) => {
        // Update local state
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)),
        });

        // Sync to Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            await supabaseUpdateOrderStatus(id, status);
          } catch (error) {
            console.error('Failed to sync order status to Supabase:', error);
          }
        }
      },

      updateSiteConfig: (updates) => {
        set({ siteConfig: { ...get().siteConfig, ...updates } });
      }
    }),
    {
      name: 'mari-admin-storage-v5', // versioned key to force refresh
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        siteConfig: state.siteConfig,
      }),
    }
  )
);

// Initialize: Load products from Supabase on app start
if (typeof window !== 'undefined') {
  // Small delay to ensure store is ready
  setTimeout(() => {
    useAdminStore.getState().loadProducts();
  }, 100);
}
