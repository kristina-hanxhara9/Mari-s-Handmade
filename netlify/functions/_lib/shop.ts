import { createClient } from '@supabase/supabase-js';
import { products as fallbackProducts } from '../../../data';

export const SHIPPING_COST = 4.99;
export const GIFT_WRAP_COST = 5.0;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** Server-side Supabase client (bypasses RLS). Null until configured. */
export const adminDb = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  : null;

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
}

/** Look up the real price of each product id. Never trust prices from the browser. */
export async function lookupProducts(ids: string[]): Promise<Map<string, CatalogItem>> {
  const map = new Map<string, CatalogItem>();
  if (adminDb) {
    const { data, error } = await adminDb
      .from('products')
      .select('id, name, price')
      .in('id', ids)
      .eq('in_stock', true);
    if (error) throw new Error(`Product lookup failed: ${error.message}`);
    for (const p of data || []) map.set(p.id, { id: p.id, name: p.name, price: Number(p.price) });
  } else {
    for (const p of fallbackProducts) {
      if (ids.includes(p.id)) map.set(p.id, { id: p.id, name: p.name, price: p.price });
    }
  }
  return map;
}

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const money = (n: number) => Math.round(n * 100) / 100;
export { money };
