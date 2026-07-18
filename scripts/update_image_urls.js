const fs = require('fs');
const path = require('path');
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map old overlay paths -> new Cloudinary or correct paths
// Products that had local /images/overlays/ paths — those files are now in del folder.
// We'll update them to use the Cloudinary images where available,
// or set them to null/empty if no replacement exists.
const IMAGE_URL_FIXES = {
  '/images/overlays/MP000000026544067_437Wx649H_202505110203561-removebg-preview.png': '',
  '/images/overlays/watch_nt90146sl01-removebg-preview (1).png': '',
  '/images/overlays/watch_nt90142km01-removebg-preview.png': '',
  '/images/overlays/rayban_aviator_black_gold_tryon.png': '',
  '/images/overlays/11.png': '',
  '/images/overlays/rayban_meta_skyler_cinnamon_tryon.png': '',
  '/images/overlays/12.png': '',
  '/images/overlays/rayban_aviator_gold_tryon.png': '',
  '/images/overlays/rayban_clubmaster_black_silver_tryon.png': '',
  '/images/overlays/rayban_meta_glasses_gen1.png': '',
  '/images/overlays/rayban_clubmaster_tortoise_gold_tryon.png': '',
  '/images/overlays/chatgpt_image_jun25_080910.png': '',
  '/images/overlays/watch_classic.png': '',
  '/images/overlays/watch_nt90189ym02-removebg-preview.png': '',
  '/images/overlays/watch_1824ym02-removebg-preview.png': '',
  '/images/overlays/watch_nt16461ym02-removebg-preview.png': '',
  '/images/overlays/chatgpt_image_jun25_081235.png': '',
  '/images/overlays/rayban_round_black_tryon.png': '',
  '/images/overlays/product1try.png': '',
  '/images/overlays/watch_nt90127ym02-removebg-preview.png': '',
  '/images/overlays/rayban_meta_wayfarer_smoke_tryon.png': '',
  '/images/overlays/rayban_ferrari_wayfarer_grey_tryon.png': '',
};

async function updateImageUrls() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url, overlay_image_url, category');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products.\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const updates = {};

    // Fix overlay_image_url if it's a broken local path
    if (product.overlay_image_url && IMAGE_URL_FIXES.hasOwnProperty(product.overlay_image_url)) {
      updates.overlay_image_url = IMAGE_URL_FIXES[product.overlay_image_url];
    }

    // Fix image_url if it's a broken local path (old /images/ paths that were moved)
    const brokenLocalPaths = [
      '/images/product', '/images/rayban', '/images/watch_',
      '/images/smart-', '/images/store_', '/images/tryon_',
      '/images/optical', '/images/luxury'
    ];
    if (product.image_url && brokenLocalPaths.some(p => product.image_url.startsWith(p))) {
      // Keep Cloudinary URLs, only fix old local paths
      if (!product.image_url.startsWith('https://')) {
        updates.image_url = '/images/premium_redesign/category_watches.png'; // fallback for watches
        if (product.category === 'glasses' || product.category === 'sunglasses') {
          updates.image_url = '/images/premium_redesign/icon_exact_cateye.png';
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      skippedCount++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product.id);

    if (updateError) {
      console.error(`❌ Failed to update "${product.name}":`, updateError.message);
    } else {
      console.log(`✅ Updated: ${product.name}`);
      if (updates.image_url) console.log(`   image_url: ${updates.image_url}`);
      if (updates.overlay_image_url !== undefined) console.log(`   overlay_image_url: ${updates.overlay_image_url || 'null'}`);
      updatedCount++;
    }
  }

  console.log(`\n✅ Done! Updated: ${updatedCount}, Skipped (already OK): ${skippedCount}`);
  process.exit(0);
}

updateImageUrls();
