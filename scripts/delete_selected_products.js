const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error("No env file found at:", envPath);
    process.exit(1);
  }
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

const PRODUCTS_TO_REMOVE = [
  "0RB3026IW",
  "CLUBMASTER METAL",
  "AVIATOR CLASSIC",
  "Titan Classic Rectangular",
  "Ray-Ban Aviator Optical",
  "Ray-Ban Clubmaster Optical RX5154",
  "Titan Horizon Rimless Eyeglasses",
  "Ray-Ban Aviator Optical RX6489",
  "Oakley Shovel Rectangular",
  "Oakley Pitchman R Optical"
];

async function run() {
  console.log("Removing products from Supabase database...");
  const { data: deletedData, error: deleteError } = await supabase
    .from('products')
    .delete()
    .in('name', PRODUCTS_TO_REMOVE)
    .select();

  if (deleteError) {
    console.error("Error deleting products from Supabase:", deleteError);
  } else {
    console.log(`Successfully deleted ${deletedData ? deletedData.length : 0} products from Supabase.`);
    if (deletedData) {
      deletedData.forEach(p => console.log(` - Deleted: ${p.name} (${p.id})`));
    }
  }

  // Update products_backup.json
  if (fs.existsSync(productsBackupPath)) {
    try {
      const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
      const filteredBackup = backupProducts.filter(p => !PRODUCTS_TO_REMOVE.includes(p.name));
      fs.writeFileSync(productsBackupPath, JSON.stringify(filteredBackup, null, 2), 'utf-8');
      console.log("Updated products_backup.json successfully.");
    } catch (e) {
      console.error("Error updating products_backup.json:", e);
    }
  }

  // Update local db_products.json
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      const filteredLocal = localProducts.filter(p => !PRODUCTS_TO_REMOVE.includes(p.name));
      fs.writeFileSync(localDbPath, JSON.stringify(filteredLocal, null, 2), 'utf-8');
      console.log("Updated local db_products.json successfully.");
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
}

run().then(() => process.exit(0)).catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
