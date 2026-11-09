-- ==============================================================================
-- POSTERWALA DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS TABLE (Poster, Polaroid pack, Photo print)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT SIZES TABLE
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "A4 (8.3 x 11.7 in)", "A3 (11.7 x 16.5 in)", "Polaroid Pack (12 Prints)"
  dimensions_cm TEXT NOT NULL, -- e.g. "21.0 x 29.7 cm"
  width_px_300dpi INT NOT NULL, -- e.g. 2480
  height_px_300dpi INT NOT NULL, -- e.g. 3508
  bleed_mm INT NOT NULL DEFAULT 3,
  price_inr NUMERIC(10, 2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (product_id, name)
);

-- 5. DESIGNS TABLE (Admin curated designs)
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  high_res_storage_path TEXT NOT NULL, -- in secure-originals private bucket
  watermark_storage_path TEXT NOT NULL, -- in public-assets bucket
  thumbnail_storage_path TEXT NOT NULL, -- in public-assets bucket
  starting_price NUMERIC(10, 2) NOT NULL DEFAULT 299.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. UPLOADS TABLE (Customer custom images for custom prints)
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- for anonymous guests before login
  original_storage_path TEXT NOT NULL, -- in secure-originals private bucket
  preview_storage_path TEXT, -- compressed/filtered preview in public or temp
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- bytes (max 25MB)
  mime_type TEXT NOT NULL,
  width INT NOT NULL,
  height INT NOT NULL,
  calculated_dpi NUMERIC(6, 2),
  dpi_check BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- for anonymous cart persistence
  design_id UUID REFERENCES public.designs(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.product_sizes(id) ON DELETE CASCADE,
  finish TEXT NOT NULL DEFAULT 'matte' CHECK (finish IN ('matte', 'glossy')),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_inr NUMERIC(10, 2) NOT NULL,
  custom_config JSONB DEFAULT '{}'::jsonb, -- Konva edits: crop, zoom, text, filter
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'Received' CHECK (status IN ('Received', 'Printing', 'Shipped', 'Delivered', 'Cancelled')),
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_pincode TEXT NOT NULL,
  tracking_carrier TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  size_id UUID REFERENCES public.product_sizes(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size_name TEXT NOT NULL,
  finish TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  custom_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  raw_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update own profile; admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Categories & Products & Sizes: Public can read active items, Admin can modify
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin write products" ON public.products
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product_sizes" ON public.product_sizes
  FOR SELECT USING (true);
CREATE POLICY "Admin write product_sizes" ON public.product_sizes
  FOR ALL USING (public.is_admin());

-- Designs: Public can read active designs; Admin has full access
CREATE POLICY "Public read active designs" ON public.designs
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin manage designs" ON public.designs
  FOR ALL USING (public.is_admin());

-- Uploads: Users can view and create their own uploads; Admin can view all
CREATE POLICY "Users can insert own uploads" ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users view own uploads" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Cart items: Users can read/write their own cart items
CREATE POLICY "Users access own cart items" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Orders: Customers can view own orders, Admins can view/update all orders
CREATE POLICY "Customers view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());
CREATE POLICY "Customers create orders" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order items: Viewable if order is accessible
CREATE POLICY "View order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );
CREATE POLICY "Insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Payments: Viewable by order owner or admin
CREATE POLICY "View payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ==============================================================================
-- STORAGE BUCKETS SETUP (Execute in Supabase SQL editor)
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('secure-originals', 'secure-originals', false) ON CONFLICT DO NOTHING;
