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

const DOWNLOADS_SRC_DIR = "C:\\Users\\s\\Downloads\\eye";
const DOWNLOADS_OVERLAYS_DIR = "C:\\Users\\s\\Downloads\\eye\\y";

const IMAGES_DEST_DIR = path.resolve(__dirname, '../public/images');
const OVERLAYS_DEST_DIR = path.resolve(__dirname, '../public/images/overlays');

const NEW_PRODUCTS_MAPPING = [
  {
    srcImage: "Group 49.png",
    destImage: "rayban_aviator_gold.png",
    srcOverlay: "Group 50.png",
    destOverlay: "rayban_aviator_gold_tryon.png",
    product: {
      id: crypto.randomUUID(),
      name: "Ray-Ban Aviator Optical RX6489 (Gold)",
      category: "glasses",
      price: 9990,
      description: "Legendary double-bridge aviator frame configured as clear lens prescription eyeglasses. Polished gold stainless steel wire construction.",
      image_url: "/images/rayban_aviator_gold.png",
      overlay_image_url: "/images/overlays/rayban_aviator_gold_tryon.png",
      stock: 15,
      created_at: new Date().toISOString(),
      overlay_scale: 1.0,
      overlay_x_offset: 0,
      overlay_y_offset: 0,
      overlay_rotation_offset: 0,
      lens_image_url: null,
      reflection_image_url: null
    }
  },
  {
    srcImage: "Group 51.png",
    destImage: "rayban_aviator_black_gold.png",
    srcOverlay: "Group 58.png",
    destOverlay: "rayban_aviator_black_gold_tryon.png",
    product: {
      id: crypto.randomUUID(),
      name: "Ray-Ban Aviator Optical RX6489 (Black & Gold)",
      category: "glasses",
      price: 10590,
      description: "Legendary double-bridge aviator frame with black coated rims and polished gold temples/bridge. Sleek modern contrast styling.",
      image_url: "/images/rayban_aviator_black_gold.png",
      overlay_image_url: "/images/overlays/rayban_aviator_black_gold_tryon.png",
      stock: 15,
      created_at: new Date().toISOString(),
      overlay_scale: 1.0,
      overlay_x_offset: 0,
      overlay_y_offset: 0,
      overlay_rotation_offset: 0,
      lens_image_url: null,
      reflection_image_url: null
    }
  },
  {
    srcImage: "Group 52.png",
    destImage: "rayban_round_black.png",
    srcOverlay: "Group 55.png",
    destOverlay: "rayban_round_black_tryon.png",
    product: {
      id: crypto.randomUUID(),
      name: "Ray-Ban Round Classic RX2180V (Black)",
      category: "glasses",
      price: 8290,
      description: "Timeless round acetate eyeglasses frame with keyhole bridge detailing. Signature diamond-shaped rivets on endpoints. Minimalist elegance in polished black.",
      image_url: "/images/rayban_round_black.png",
      overlay_image_url: "/images/overlays/rayban_round_black_tryon.png",
      stock: 15,
      created_at: new Date().toISOString(),
      overlay_scale: 1.0,
      overlay_x_offset: 0,
      overlay_y_offset: 0,
      overlay_rotation_offset: 0,
      lens_image_url: null,
      reflection_image_url: null
    }
  },
  {
    srcImage: "Group 53.png",
    destImage: "rayban_clubmaster_tortoise_gold.png",
    srcOverlay: "Group 56.png",
    destOverlay: "rayban_clubmaster_tortoise_gold_tryon.png",
    product: {
      id: crypto.randomUUID(),
      name: "Ray-Ban Clubmaster Optical RX5154 (Tortoise & Gold)",
      category: "glasses",
      price: 10290,
      description: "Retro-classic browline frame with tortoiseshell acetate upper brow and temples, complemented by a gold-plated lower metal wire rim and bridge.",
      image_url: "/images/rayban_clubmaster_tortoise_gold.png",
      overlay_image_url: "/images/overlays/rayban_clubmaster_tortoise_gold_tryon.png",
      stock: 15,
      created_at: new Date().toISOString(),
      overlay_scale: 1.0,
      overlay_x_offset: 0,
      overlay_y_offset: 0,
      overlay_rotation_offset: 0,
      lens_image_url: null,
      reflection_image_url: null
    }
  },
  {
    srcImage: "Group 54.png",
    destImage: "rayban_clubmaster_black_silver.png",
    srcOverlay: "Group 57.png",
    destOverlay: "rayban_clubmaster_black_silver_tryon.png",
    product: {
      id: crypto.randomUUID(),
      name: "Ray-Ban Clubmaster Optical RX5154 (Black & Silver)",
      category: "glasses",
      price: 9990,
      description: "Iconic semi-rimless retro eyeglasses. Gloss black acetate upper browline and temples paired with polished silver metallic wire lower rims and bridge.",
      image_url: "/images/rayban_clubmaster_black_silver.png",
      overlay_image_url: "/images/overlays/rayban_clubmaster_black_silver_tryon.png",
      stock: 15,
      created_at: new Date().toISOString(),
      overlay_scale: 1.0,
      overlay_x_offset: 0,
      overlay_y_offset: 0,
      overlay_rotation_offset: 0,
      lens_image_url: null,
      reflection_image_url: null
    }
  }
];

function copyFiles() {
  console.log("Copying product images and overlays...");
  
  if (!fs.existsSync(IMAGES_DEST_DIR)) {
    fs.mkdirSync(IMAGES_DEST_DIR, { recursive: true });
  }
  if (!fs.existsSync(OVERLAYS_DEST_DIR)) {
    fs.mkdirSync(OVERLAYS_DEST_DIR, { recursive: true });
  }

  for (const item of NEW_PRODUCTS_MAPPING) {
    const srcImgPath = path.join(DOWNLOADS_SRC_DIR, item.srcImage);
    const destImgPath = path.join(IMAGES_DEST_DIR, item.destImage);
    const srcOvlPath = path.join(DOWNLOADS_OVERLAYS_DIR, item.srcOverlay);
    const destOvlPath = path.join(OVERLAYS_DEST_DIR, item.destOverlay);

    if (fs.existsSync(srcImgPath)) {
      fs.copyFileSync(srcImgPath, destImgPath);
      console.log(`Copied ${item.srcImage} -> ${destImgPath}`);
    } else {
      console.error(`Error: Source product image ${srcImgPath} not found!`);
      process.exit(1);
    }

    if (fs.existsSync(srcOvlPath)) {
      fs.copyFileSync(srcOvlPath, destOvlPath);
      console.log(`Copied ${item.srcOverlay} -> ${destOvlPath}`);
    } else {
      console.error(`Error: Source overlay image ${srcOvlPath} not found!`);
      process.exit(1);
    }
  }
}

async function run() {
  // 1. Copy files
  copyFiles();

  const productsToInsert = NEW_PRODUCTS_MAPPING.map(m => m.product);

  // 2. Insert into Supabase
  console.log(`Inserting ${productsToInsert.length} new products to Supabase...`);
  const { data, error } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select();

  if (error) {
    console.error("Error inserting to Supabase:", error);
    process.exit(1);
  } else {
    console.log(`Successfully inserted ${data?.length} products into Supabase.`);
  }

  // 3. Update products_backup.json
  if (fs.existsSync(productsBackupPath)) {
    try {
      const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
      const updatedBackup = [...backupProducts, ...productsToInsert];
      fs.writeFileSync(productsBackupPath, JSON.stringify(updatedBackup, null, 2), 'utf-8');
      console.log("Appended to supabase_backup/products_backup.json successfully.");
    } catch (e) {
      console.error("Error updating products_backup.json:", e);
    }
  }

  // 4. Update local db_products.json
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      const updatedLocal = [...localProducts, ...productsToInsert];
      fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
      console.log("Appended to local db_products.json successfully.");
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
}

run().then(() => {
  console.log("All tasks completed successfully!");
  process.exit(0);
}).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
