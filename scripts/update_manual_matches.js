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

const targetId = "33db81fa-2e31-4ebc-bca7-965e4b69d50d"; // Titan Neo Roman 10063YM01 / NT16461YM02
const overlayUrl = "/images/overlays/watch_nt16461ym02-removebg-preview.png";
const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\b3c6f85a-84e1-45f3-a989-843208993c14\\scratch\\db_products.json";
const productsBackupPath = path.resolve(__dirname, '../supabase_backup/products_backup.json');

async function run() {
  console.log(`Updating product ${targetId} overlay to ${overlayUrl}...`);
  const { data, error } = await supabase
    .from('products')
    .update({ overlay_image_url: overlayUrl })
    .eq('id', targetId)
    .select();

  if (error) {
    console.error("Error updating Supabase:", error);
  } else {
    console.log("Updated Supabase successfully:", data);
  }

  // Update backup files
  if (fs.existsSync(productsBackupPath)) {
    const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
    const updatedBackup = backupProducts.map(p => {
      if (p.id === targetId) p.overlay_image_url = overlayUrl;
      return p;
    });
    fs.writeFileSync(productsBackupPath, JSON.stringify(updatedBackup, null, 2), 'utf-8');
    console.log("Updated products_backup.json successfully.");
  }

  if (fs.existsSync(localDbPath)) {
    const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
    const updatedLocal = localProducts.map(p => {
      if (p.id === targetId) p.overlay_image_url = overlayUrl;
      return p;
    });
    fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
    console.log("Updated local db_products.json successfully.");
  }
}

run().then(() => process.exit(0));
