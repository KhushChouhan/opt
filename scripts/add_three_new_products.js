const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIdx = trimmed.indexOf('=');
    if (separatorIdx === -1) return;
    const key = trimmed.substring(0, separatorIdx).trim();
    let val = trimmed.substring(separatorIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\b3c6f85a-84e1-45f3-a989-843208993c14\\scratch\\db_products.json";
const productsBackupPath = path.resolve(__dirname, '../supabase_backup/products_backup.json');

const NEW_PRODUCTS = [
  // 1. Ray-Ban Meta Wayfarer Shiny Smoke
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Meta Wayfarer Shiny Smoke",
    category: "sunglasses",
    price: 39900,
    description: "Ray-Ban Meta Smart Glasses | Model: RW4006 | Frame: Shiny Smoke (Transparent Grey) | Lens: Clear / Transitions | Storage: 32 GB | High-tech smart glasses with integrated open-ear speakers, 12MP camera, and Meta AI voice control in a modern transparent grey frame.",
    image_url: "/images/rayban_meta_wayfarer_smoke.png",
    overlay_image_url: "/images/overlays/sunglasses_wayfarer.png",
    stock: 10,
    created_at: new Date().toISOString(),
    overlay_scale: 1.0,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 2. Ray-Ban Meta Skyler Shiny Cinnamon
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Meta Skyler Shiny Cinnamon",
    category: "sunglasses",
    price: 39900,
    description: "Ray-Ban Meta Smart Glasses | Model: RW4009 | Frame: Shiny Cinnamon (Transparent Pinkish Brown) | Lens: Clear / Transitions | Storage: 32 GB | Vintage-inspired cat-eye smart glasses designed for smaller faces, featuring camera, music, calls, and Meta AI capabilities.",
    image_url: "/images/rayban_meta_skyler_cinnamon.png",
    overlay_image_url: "/images/overlays/sunglasses_fashion.png",
    stock: 10,
    created_at: new Date().toISOString(),
    overlay_scale: 1.05,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 3. Ray-Ban Scuderia Ferrari Wayfarer Grey
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Scuderia Ferrari Wayfarer Grey",
    category: "sunglasses",
    price: 18590,
    description: "Ray-Ban Scuderia Ferrari Collection | Frame: Transparent Grey Acetate | Lens: Clear prescription-compatible | Timeless Wayfarer shape with sleek transparent grey frames, featuring the yellow Scuderia Ferrari racing shield logo on the temples.",
    image_url: "/images/rayban_ferrari_wayfarer_grey.png",
    overlay_image_url: "/images/overlays/frame.png",
    stock: 15,
    created_at: new Date().toISOString(),
    overlay_scale: 0.98,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  }
];

async function run() {
  console.log(`Inserting ${NEW_PRODUCTS.length} new products to Supabase...`);
  
  const { data, error } = await supabase
    .from('products')
    .insert(NEW_PRODUCTS)
    .select();

  if (error) {
    console.error("Error inserting to Supabase:", error);
    process.exit(1);
  } else {
    console.log(`Successfully inserted ${data?.length} products into Supabase.`);
  }

  // Update products_backup.json
  if (fs.existsSync(productsBackupPath)) {
    try {
      const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
      const updatedBackup = [...backupProducts, ...NEW_PRODUCTS];
      fs.writeFileSync(productsBackupPath, JSON.stringify(updatedBackup, null, 2), 'utf-8');
      console.log("Appended to supabase_backup/products_backup.json successfully.");
    } catch (e) {
      console.error("Error updating products_backup.json:", e);
    }
  }

  // Update local db_products.json
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      const updatedLocal = [...localProducts, ...NEW_PRODUCTS];
      fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
      console.log("Appended to local db_products.json successfully.");
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
}

run().then(() => process.exit(0));
