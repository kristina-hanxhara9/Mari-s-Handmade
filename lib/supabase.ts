import { createClient } from '@supabase/supabase-js';
import type { Order, Product, SiteConfig } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Only create a real client when configured; otherwise calls would hit an invalid URL.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function client() {
  if (!supabase) throw new Error('Supabase is not configured yet.');
  return supabase;
}

// ---------- Row <-> app mapping ----------
type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  image: string;
  description: string | null;
  scent_notes: string | null;
  burn_time: string | null;
  category: string | null;
  featured: boolean;
  in_stock: boolean;
};

const fromProductRow = (p: ProductRow): Product => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  image: p.image,
  description: p.description ?? '',
  scentNotes: p.scent_notes ?? '',
  burnTime: p.burn_time ?? undefined,
  category: p.category ?? 'Other',
  featured: p.featured,
  inStock: p.in_stock,
});

const toProductRow = (p: Partial<Product>) => {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.price !== undefined) row.price = p.price;
  if (p.image !== undefined) row.image = p.image;
  if (p.description !== undefined) row.description = p.description;
  if (p.scentNotes !== undefined) row.scent_notes = p.scentNotes;
  if (p.burnTime !== undefined) row.burn_time = p.burnTime;
  if (p.category !== undefined) row.category = p.category;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.inStock !== undefined) row.in_stock = p.inStock;
  return row;
};

const fromOrderRow = (o: any): Order => ({
  id: o.id,
  customerName: o.customer_name,
  email: o.customer_email,
  address: o.shipping_address,
  city: o.shipping_city,
  postcode: o.shipping_postcode,
  items: (o.items || []).map((i: any) => ({
    id: i.product_id,
    name: i.product_name,
    price: Number(i.price),
    quantity: i.quantity,
  })),
  subtotal: Number(o.subtotal),
  shipping: Number(o.shipping),
  total: Number(o.total),
  date: o.created_at,
  status: o.status,
  isGift: o.is_gift,
  giftNote: o.gift_message ?? undefined,
});

// ---------- Products ----------
/** Public shop listing: in-stock products only. */
export async function fetchProducts(includeOutOfStock = false): Promise<Product[]> {
  let query = client().from('products').select('*').order('created_at', { ascending: false });
  if (!includeOutOfStock) query = query.eq('in_stock', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProductRow[]).map(fromProductRow);
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await client().from('products').insert([toProductRow(product)]).select().single();
  if (error) throw error;
  return fromProductRow(data as ProductRow);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await client().from('products').update(toProductRow(updates)).eq('id', id).select().single();
  if (error) throw error;
  return fromProductRow(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await client().from('products').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Orders (admin only, enforced by RLS) ----------
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await client().from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromOrderRow);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await client().from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

// ---------- Site config (single row, id = 1) ----------
export async function fetchSiteConfig(): Promise<Partial<SiteConfig> | null> {
  const { data, error } = await client().from('site_config').select('config').eq('id', 1).maybeSingle();
  if (error) throw error;
  return (data?.config as Partial<SiteConfig>) ?? null;
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const { error } = await client().from('site_config').upsert({ id: 1, config });
  if (error) throw error;
}

// ---------- Image upload (Supabase Storage bucket "product-images") ----------
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await client().storage.from('product-images').upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
  });
  if (error) throw error;
  return client().storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

// ---------- Admin auth ----------
export async function signIn(email: string, password: string) {
  const { error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await client().auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
