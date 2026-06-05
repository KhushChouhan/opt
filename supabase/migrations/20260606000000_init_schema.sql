-- Create Enum Types
CREATE TYPE product_category AS ENUM ('glasses', 'sunglasses', 'watches');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'delivered');

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category product_category NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url TEXT NOT NULL,         -- Product main listing image
  overlay_image_url TEXT NOT NULL, -- Transparent PNG for virtual try-on overlay
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Orders Table (as per confirmed decisions, snapshot_url is NOT present)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) >= 2),
  phone TEXT NOT NULL CHECK (phone ~ '^[6-9]\d{9}$'), -- 10-digit Indian Mobile validation
  address TEXT NOT NULL CHECK (char_length(address) >= 10),
  pincode TEXT NOT NULL CHECK (pincode ~ '^\d{6}$'), -- 6-digit Indian PIN Code validation
  status order_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Admins Table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Row Level Security (RLS) Configuration
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full write to products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders Policies
-- 1. Anyone can insert orders (customers checking out)
CREATE POLICY "Allow customers to create orders" ON orders FOR INSERT WITH CHECK (true);
-- 2. Explicit anonymous SELECT deny: only allow authenticated users (admins) to select orders
CREATE POLICY "Deny anon read orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
-- 3. Only authenticated users can update/delete orders
CREATE POLICY "Allow authenticated full write to orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Admins Policies: Admins can do everything, public has no access
CREATE POLICY "Admins full access" ON admins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add Indexes for Performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
