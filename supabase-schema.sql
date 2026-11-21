-- ============================================
-- SUPABASE SCHEMA FOR MARI'S HANDMADE
-- ============================================
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
--
-- BEFORE RUNNING: replace admin@example.com below with the email address
-- of the admin user you create under Authentication > Users.
-- Only that user can change products, orders and site settings.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Who counts as an admin
CREATE TABLE IF NOT EXISTS admin_emails (
  email TEXT PRIMARY KEY
);
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY; -- no policies: not readable from the browser

INSERT INTO admin_emails (email) VALUES ('admin@example.com')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_emails WHERE lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  image TEXT NOT NULL,
  description TEXT,
  scent_notes VARCHAR(255),
  burn_time VARCHAR(100),
  category VARCHAR(100) DEFAULT 'Other',
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS (written only by the Stripe webhook, using the service-role key)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_postcode VARCHAR(20) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  is_gift BOOLEAN DEFAULT false,
  gift_message TEXT,
  status VARCHAR(50) DEFAULT 'paid',
  stripe_payment_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SITE CONFIG (single row with the homepage images)
-- ============================================
CREATE TABLE IF NOT EXISTS site_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{}'
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (in_stock OR is_admin());
CREATE POLICY "products_admin_write" ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "orders_admin_read" ON orders;
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_read" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "site_config_public_read" ON site_config;
DROP POLICY IF EXISTS "site_config_admin_write" ON site_config;
CREATE POLICY "site_config_public_read" ON site_config FOR SELECT USING (true);
CREATE POLICY "site_config_admin_write" ON site_config FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- IMAGE STORAGE (public bucket, admin uploads)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STARTER PRODUCTS (only added if the table is empty)
-- Images starting with /images/ are served by the website itself.
-- ============================================
INSERT INTO products (name, price, image, description, scent_notes, category, featured, in_stock)
SELECT * FROM (VALUES
  ('Blossom Box with Gold Chain', 48.00, '/images/produkt1.jpeg', 'Our signature arrangement featuring hand-poured peony, rose, and heart-shaped candles in soft pinks and creams. Presented in a luxury white box with an elegant gold chain handle.', 'Peony, Rose Petals, Sweet Pea', 'Arrangements', true, true),
  ('Celestial Blue & Gold Pillar', 35.00, '/images/produkt2.jpeg', 'A masterpiece of wax art. This tall pillar features a mesmerising mottled blue and white texture, hand-gilded with 24k gold leaf accents. Each piece is completely unique.', 'Ocean Mist, Driftwood, Amber', 'Pillars', true, true),
  ('Carousel Dreams Jar', 42.00, '/images/produkt3.jpeg', 'A whimsical white ceramic vessel adorned with intricate carousel horse reliefs. Filled with our creamy soy wax blend.', 'Vanilla Bean, Cashmere, Sandalwood', 'Jars', true, true),
  ('Pastel Tulip Bundle', 22.00, 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000&auto=format&fit=crop', 'A delicate collection of individual tulip candles in spring pastel shades. Perfect for table settings.', 'Fresh Cut Grass, Lemon Zest', 'Novelty', false, true),
  ('Textured Love Heart', 16.00, 'https://images.unsplash.com/photo-1518049615243-71822c974444?q=80&w=1000&auto=format&fit=crop', 'Intricately textured heart candle in a vibrant berry pink. A perfect small gift for someone special.', 'Raspberry, Champagne, Sugar', 'Novelty', false, true),
  ('Midnight Gold', 35.00, 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?q=80&w=1000&auto=format&fit=crop', 'A deep blue version of our signature gold-leaf pillar, bringing a moody elegance to your evening.', 'Oud, Black Pepper, Bergamot', 'Pillars', false, true),
  ('Frosted Fir Luminary', 38.00, 'https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1000&auto=format&fit=crop', 'Winter white pillar with hand-painted evergreen branches and a dusting of pearl shimmer—perfect for Christmas mantels.', 'Pine Resin, Clove, Winter Citrus', 'Christmas', false, true),
  ('Blush Peony Heart', 24.00, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1000&auto=format&fit=crop', 'Romantic sculpted heart with layered petals and a satin bow—made for Valentines surprises.', 'Rosewater, Peony, Vanilla Sugar', 'Valentines', false, true),
  ('Golden Yolk Egg Duo', 18.00, 'https://images.unsplash.com/photo-1528458965990-428de4b1cb0f?q=80&w=1000&auto=format&fit=crop', 'Playful speckled egg candles nested in straw cups—sweet Easter brunch accents.', 'Lemon Curd, Neroli, Vanilla Pod', 'Easter', false, true),
  ('Confetti Drip Celebration Pillar', 32.00, 'https://images.unsplash.com/photo-1526655009434-6c000a543221?q=80&w=1000&auto=format&fit=crop', 'Tall ivory pillar with hand-poured candy-color drips and gold foil—built to crown a birthday table.', 'Sparkling Citrus, Buttercream, Tonka', 'Birthday', false, true),
  ('Mother’s Garden Bouquet', 36.00, 'https://images.unsplash.com/photo-1441123100240-f9f3f77ed41b?q=80&w=1000&auto=format&fit=crop', 'Cluster of sculpted floral tapers wrapped in silk ribbon, a tender nod to Mother’s Day brunches.', 'Magnolia, White Tea, Honeycomb', 'Mother''s Day', false, true),
  ('Harvest Amber Lantern', 34.00, 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?q=80&w=1000&auto=format&fit=crop', 'Amber-toned carved lantern with leaf reliefs, ready for autumn gatherings and cozy dinners.', 'Maple Wood, Smoked Vanilla, Spiced Pear', 'Autumn', false, true)
) AS seed(name, price, image, description, scent_notes, category, featured, in_stock)
WHERE NOT EXISTS (SELECT 1 FROM products);
