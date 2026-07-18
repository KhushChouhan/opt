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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreImageUrls() {
  const backupPath = path.resolve(__dirname, '../supabase_backup/products_backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('Backup file not found at', backupPath);
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  console.log(`Found ${backupData.length} products in backup.`);

  let updatedCount = 0;
  for (const product of backupData) {
    const updates = {};
    if (product.image_url) updates.image_url = product.image_url;
    if (product.overlay_image_url) updates.overlay_image_url = product.overlay_image_url;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);

      if (error) {
        console.error(`❌ Failed to restore "${product.name}":`, error.message);
      } else {
        console.log(`✅ Restored: ${product.name}`);
        updatedCount++;
      }
    }
  }

  console.log(`\n✅ Done! Restored images for ${updatedCount} products.`);
  process.exit(0);
}

restoreImageUrls();
