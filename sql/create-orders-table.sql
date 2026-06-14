CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mpesa')),
    mpesa_code TEXT DEFAULT '',
    delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders are readable by admins" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Orders are updatable by admins" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Orders are deletable by admins" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- If you already created the table, run this to add delivery_cost:
-- ALTER TABLE orders ADD COLUMN delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0;
