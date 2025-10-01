-- Create the profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR
SELECT USING (TRUE);
CREATE POLICY "Users can insert their own profile." ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR
UPDATE USING (auth.uid() = id);
-- Create the products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 0.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT [] NOT NULL DEFAULT '{}'::text [],
  vendor TEXT,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON products FOR
SELECT USING (TRUE);
-- Create the orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NULL,
  anonymous_cart_id UUID REFERENCES anonymous_carts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Pending',
  total NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB
);
-- Enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON orders FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders." ON orders FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Create the order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE
  SET NULL,
    variant_id UUID,
    -- Assuming variant IDs are UUIDs or can be null
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);
-- Enable RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items are viewable by order owner." ON order_items FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM orders
      WHERE orders.id = order_id
        AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert order items for their orders." ON order_items FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM orders
      WHERE orders.id = order_id
        AND orders.user_id = auth.uid()
    )
  );
-- Create the carts table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Enable RLS for carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own cart." ON carts FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cart." ON carts FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart." ON carts FOR
UPDATE USING (auth.uid() = user_id);
-- Create the cart_items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID,
  -- Assuming variant IDs are UUIDs or can be null
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Enable RLS for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cart items are viewable by cart owner." ON cart_items FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM carts
      WHERE carts.id = cart_id
        AND carts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert cart items for their cart." ON cart_items FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM carts
      WHERE carts.id = cart_id
        AND carts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update cart items for their cart." ON cart_items FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM carts
      WHERE carts.id = cart_id
        AND carts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete cart items from their cart." ON cart_items FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM carts
    WHERE carts.id = cart_id
      AND carts.user_id = auth.uid()
  )
);