-- Naju Poultry - Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- Products table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('eggs', 'chicks', 'live', 'dressed', 'feed')),
    unit TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery requests table
CREATE TABLE delivery_requests (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    address TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time TEXT DEFAULT '',
    product_interest TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    latitude TEXT DEFAULT '',
    longitude TEXT DEFAULT '',
    location_link TEXT DEFAULT '',
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mpesa')),
    mpesa_code TEXT DEFAULT '',
    admin_notes TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Products are readable by anyone, writable only by authenticated admins
CREATE POLICY "Products are publicly readable"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Products are insertable by admins"
    ON products FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by admins"
    ON products FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Products are deletable by admins"
    ON products FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS: Delivery requests are writable by anyone (public form), readable by admins
CREATE POLICY "Anyone can insert delivery requests"
    ON delivery_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Delivery requests are readable by admins"
    ON delivery_requests FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Delivery requests are updatable by admins"
    ON delivery_requests FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Delivery requests are deletable by admins"
    ON delivery_requests FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS: Contact messages are writable by anyone (public form), readable by admins
CREATE POLICY "Anyone can insert contact messages"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Contact messages are readable by admins"
    ON contact_messages FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Contact messages are updatable by admins"
    ON contact_messages FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Contact messages are deletable by admins"
    ON contact_messages FOR DELETE
    USING (auth.role() = 'authenticated');

-- Seed data
INSERT INTO products (name, description, price, category, unit, stock, image_url) VALUES
    ('Fresh Kienyeji Eggs', 'Farm-fresh indigenous eggs from free-range chickens', 450, 'eggs', 'dozen', 50, '🥚'),
    ('Fresh Brown Eggs', 'Premium brown eggs from healthy hens', 420, 'eggs', 'dozen', 45, '🥚'),
    ('Day-Old Kienyeji Chicks', 'Healthy day-old indigenous chicks', 120, 'chicks', 'bird', 100, '🐥'),
    ('Day-Old Broiler Chicks', 'Quality day-old broiler chicks for meat production', 100, 'chicks', 'bird', 80, '🐥'),
    ('Live Kienyeji Chicken', 'Fresh live indigenous chickens', 800, 'live', 'kg', 30, '🐓'),
    ('Live Broiler Chicken', 'Healthy live broiler chickens', 650, 'live', 'kg', 25, '🐓'),
    ('Dressed Kienyeji Chicken', 'Cleaned and dressed indigenous chicken', 850, 'dressed', 'kg', 25, '🍗'),
    ('Dressed Broiler Chicken', 'Cleaned and dressed broiler chicken', 700, 'dressed', 'kg', 20, '🍗'),
    ('Chick Starter Mash', 'Nutritious starter feed for chicks', 2800, 'feed', '50kg bag', 15, '🌾'),
    ('Growers Mash', 'Balanced grower feed for growing chickens', 2600, 'feed', '50kg bag', 12, '🌾'),
    ('Layers Mash', 'Specialized feed for laying hens', 2900, 'feed', '50kg bag', 10, '🌾'),
    ('Finisher Feed', 'High-energy finisher feed for broilers', 2500, 'feed', '50kg bag', 8, '🌾');

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_delivery_requests_status ON delivery_requests(status);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_delivery_requests_created_at ON delivery_requests(created_at DESC);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Storage bucket for product images
-- Run this in Supabase SQL Editor to create the bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- 
-- Then set RLS to allow authenticated uploads:
-- CREATE POLICY "Public product images"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'product-images');
-- 
-- CREATE POLICY "Admin can upload product images"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Admin can delete product images"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
