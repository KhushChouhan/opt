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
  // 1. Ray-Ban Meta Wayfarer RW4008 601/ST53
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Meta Wayfarer RW4008 601/ST53",
    category: "sunglasses",
    price: 39900,
    description: "Ray-Ban Meta smart glasses - Model: RW4008 601/ST53 | Lens width: 53 mm | Storage: 32 GB | Includes: Charging case, cleaning cloth | Premium smart sunglasses with integrated open-ear speakers, 12MP camera, and Meta AI voice control in a classic matte black Wayfarer frame.",
    image_url: "/images/hero_sunglasses.png",
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
  // 2. Ray-Ban Meta Headliner RW4012 601/5S53
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Meta Headliner RW4012 601/5S53",
    category: "sunglasses",
    price: 39900,
    description: "Ray-Ban Meta smart glasses - Model: RW4012 601/5S53 | Lens width: 53 mm | Storage: 32 GB | Includes: Charging case, cleaning cloth | Smart glasses featuring a rounded, modern Headliner frame with a shiny black finish, transitions lenses, and hands-free video streaming.",
    image_url: "/images/hero_sunglasses.png",
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
  // 3. Ray-Ban Aviator Classic Sunglasses
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Aviator Classic RB3025",
    category: "sunglasses",
    price: 12490,
    description: "The classic pilot-style sunglasses. Polished gold metal frame with dark green G-15 glass lenses. Extreme durability and high-performance UV protection.",
    image_url: "/images/hero_sunglasses.png",
    overlay_image_url: "/images/overlays/sunglasses_aviator.png",
    stock: 15,
    created_at: new Date().toISOString(),
    overlay_scale: 1.02,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 4. Oakley Holbrook Sport Sunglasses
  {
    id: crypto.randomUUID(),
    name: "Oakley Holbrook Sport",
    category: "sunglasses",
    price: 15990,
    description: "Sport performance sunglasses featuring a classic square-keyhole frame design in lightweight O Matter. Equipped with Prizm polarized lenses for superior contrast and clarity.",
    image_url: "/images/hero_sunglasses.png",
    overlay_image_url: "/images/overlays/sunglasses_sports.png",
    stock: 12,
    created_at: new Date().toISOString(),
    overlay_scale: 1.0,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 5. Ray-Ban Clubmaster Classic Sunglasses
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Clubmaster Classic RB3016",
    category: "sunglasses",
    price: 14590,
    description: "Retro and timeless browline sunglasses featuring a shiny tortoiseshell acetate upper, gold-plated wire rims, and classic G-15 glass lenses.",
    image_url: "/images/hero_sunglasses.png",
    overlay_image_url: "/images/overlays/sunglasses_clubmaster.png",
    stock: 8,
    created_at: new Date().toISOString(),
    overlay_scale: 1.03,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 6. Carrera Aviator Red-Accent Sunglasses
  {
    id: crypto.randomUUID(),
    name: "Carrera Aviator Red-Line",
    category: "sunglasses",
    price: 9990,
    description: "Bold pilot sunglasses from Carrera featuring a signature double bridge, black matte finish, and athletic red details. High UV blocking index.",
    image_url: "/images/hero_sunglasses.png",
    overlay_image_url: "/images/overlays/first_3.png",
    stock: 15,
    created_at: new Date().toISOString(),
    overlay_scale: 1.05,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 7. Ray-Ban Wayfarer Ease
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Wayfarer Ease RB4340",
    category: "sunglasses",
    price: 10290,
    description: "Re-engineered classic Wayfarer with a slightly flatter frame inclination for a more comfortable and casual everyday fit. Polarized grey lenses.",
    image_url: "/images/hero_sunglasses.png",
    overlay_image_url: "/images/overlays/first_1.png",
    stock: 10,
    created_at: new Date().toISOString(),
    overlay_scale: 1.0,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 8. Oakley Pitchman R Optical Eyeglasses
  {
    id: crypto.randomUUID(),
    name: "Oakley Pitchman R Optical",
    category: "glasses",
    price: 13990,
    description: "Lightweight O Matter round frame prescription glasses with thin steel temples and non-slip Unobtainium earsocks for active professionals.",
    image_url: "/images/hero_glasses.png",
    overlay_image_url: "/images/overlays/custom_frame.png",
    stock: 12,
    created_at: new Date().toISOString(),
    overlay_scale: 1.0,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 9. Ray-Ban Clubmaster Optical prescription frames
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Clubmaster Optical RX5154",
    category: "glasses",
    price: 9990,
    description: "Classic semi-rimless clubmaster optical frames. Tortoiseshell acetate upper with silver metallic wire lower rims. Vintage geek-chic look.",
    image_url: "/images/hero_glasses.png",
    overlay_image_url: "/images/overlays/sunglasses_clubmaster.png",
    stock: 15,
    created_at: new Date().toISOString(),
    overlay_scale: 1.02,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 10. Titan Horizon Rimless titanium glasses
  {
    id: crypto.randomUUID(),
    name: "Titan Horizon Rimless Eyeglasses",
    category: "glasses",
    price: 4995,
    description: "Ultra-light rimless prescription frames featuring gold-plated titanium temples. Exceptional comfort and elegant minimalist aesthetics.",
    image_url: "/images/hero_glasses.png",
    overlay_image_url: "/images/overlays/frame.png",
    stock: 20,
    created_at: new Date().toISOString(),
    overlay_scale: 0.98,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 11. Ray-Ban Aviator Optical RX6489
  {
    id: crypto.randomUUID(),
    name: "Ray-Ban Aviator Optical RX6489",
    category: "glasses",
    price: 8590,
    description: "Legendary double-bridge aviator frame configured as clear lens prescription eyeglasses. Polished silver stainless steel wire construction.",
    image_url: "/images/hero_glasses.png",
    overlay_image_url: "/images/overlays/sunglasses_aviator.png",
    stock: 10,
    created_at: new Date().toISOString(),
    overlay_scale: 1.02,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  },
  // 12. Oakley Shovel Rectangular Eyeglasses
  {
    id: crypto.randomUUID(),
    name: "Oakley Shovel Rectangular",
    category: "glasses",
    price: 11290,
    description: "Sporty rectangular eyeglasses with a satin black metal frame, spring hinges, and red accent Unobtainium temple sleeves.",
    image_url: "/images/hero_glasses.png",
    overlay_image_url: "/images/overlays/first_1.png",
    stock: 12,
    created_at: new Date().toISOString(),
    overlay_scale: 1.0,
    overlay_x_offset: 0,
    overlay_y_offset: 0,
    overlay_rotation_offset: 0,
    lens_image_url: null,
    reflection_image_url: null
  }
];

async function run() {
  console.log(`Inserting ${NEW_PRODUCTS.length} products to Supabase...`);
  
  const { data, error } = await supabase
    .from('products')
    .insert(NEW_PRODUCTS)
    .select();

  if (error) {
    console.error("Error inserting to Supabase:", error);
  } else {
    console.log(`Successfully inserted ${data?.length} products into Supabase.`);
  }

  // Update supabase_backup/products_backup.json
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
