-- Add optional columns to products table for advanced multi-layer virtual try-on
ALTER TABLE products ADD COLUMN IF NOT EXISTS lens_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reflection_image_url TEXT;
