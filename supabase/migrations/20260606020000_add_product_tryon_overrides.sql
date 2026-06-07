-- Add optional try-on alignment scaling, positioning, and rotation overrides per product with default values
ALTER TABLE products ADD COLUMN IF NOT EXISTS overlay_scale NUMERIC DEFAULT 1.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS overlay_x_offset NUMERIC DEFAULT 0.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS overlay_y_offset NUMERIC DEFAULT 0.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS overlay_rotation_offset NUMERIC DEFAULT 0.0;
