-- ============================================
-- SUPABASE SQL SCHEMA FOR MARI'S HANDMADE
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates the tables needed for products and orders

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  scent_notes VARCHAR(255),
  burn_time VARCHAR(100),
  category VARCHAR(100) DEFAULT 'candles',
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
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
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: Allow public read access
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Products: Only authenticated users can insert/update/delete
CREATE POLICY "Products can be created by authenticated users" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products can be updated by authenticated users" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Products can be deleted by authenticated users" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Orders: Allow public insert (customers can create orders)
CREATE POLICY "Orders can be created by anyone" ON orders
  FOR INSERT WITH CHECK (true);

-- Orders: Only authenticated users (admin) can view all orders
CREATE POLICY "Orders viewable by authenticated users" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Orders: Only authenticated users can update orders
CREATE POLICY "Orders can be updated by authenticated users" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- SAMPLE PRODUCTS (OPTIONAL)
-- ============================================
-- Uncomment and run this to add sample products

/*
INSERT INTO products (name, price, image, description, scent_notes, burn_time, category, featured, in_stock)
VALUES
  ('Serenity Swirl', 34.00, 'https://images.unsplash.com/photo-1602607434848-8c1f3d6c11f8?q=80&w=600&auto=format&fit=crop', 'A calming sculptural piece with gentle curves', 'Lavender & Vanilla', '40 hours', 'sculptural', true, true),
  ('Bloom Tower', 42.00, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop', 'Elegant floral-inspired tower candle', 'Rose & Jasmine', '45 hours', 'sculptural', true, true),
  ('Ocean Wave', 38.00, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?q=80&w=600&auto=format&fit=crop', 'Inspired by the gentle motion of waves', 'Sea Salt & Driftwood', '35 hours', 'sculptural', true, true),
  ('Golden Spiral', 45.00, 'https://images.unsplash.com/photo-1608181831718-c9ffd8928d07?q=80&w=600&auto=format&fit=crop', 'Luxurious golden-hued spiral design', 'Amber & Sandalwood', '50 hours', 'luxury', false, true),
  ('Autumn Leaf', 32.00, 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=600&auto=format&fit=crop', 'Warm autumn-inspired sculptural candle', 'Cinnamon & Apple', '38 hours', 'seasonal', false, true);
*/

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
