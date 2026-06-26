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

const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\b3c6f85a-84e1-45f3-a989-843208993c14\\scratch\\db_products.json";
const productsBackupPath = path.resolve(__dirname, '../supabase_backup/products_backup.json');

const META_SUNGLASSES_NAMES = [
  "Ray-Ban Meta Wayfarer RW4008 601/ST53",
  "Ray-Ban Meta Headliner RW4012 601/5S53"
];

async function run() {
  console.log("Fetching sunglasses products from Supabase...");
  const { data: sunglasses, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'sunglasses');

  if (fetchError) {
    console.error("Error fetching sunglasses:", fetchError);
    process.exit(1);
  }

  const toDelete = sunglasses.filter(s => !META_SUNGLASSES_NAMES.includes(s.name));
  const deleteIds = toDelete.map(s => s.id);

  console.log(`Found ${sunglasses.length} total sunglasses. Keeping ${sunglasses.length - toDelete.length} Meta models. Deleting ${toDelete.length} other models.`);

  if (deleteIds.length > 0) {
    const { data: deletedData, error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', deleteIds)
      .select();

    if (deleteError) {
      console.error("Error deleting sunglasses from Supabase:", deleteError);
    } else {
      console.log(`Successfully deleted ${deletedData?.length} sunglasses from Supabase.`);
    }

    // Update products_backup.json
    if (fs.existsSync(productsBackupPath)) {
      try {
        const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
        const filteredBackup = backupProducts.filter(p => !deleteIds.includes(p.id));
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
        const filteredLocal = localProducts.filter(p => !deleteIds.includes(p.id));
        fs.writeFileSync(localDbPath, JSON.stringify(filteredLocal, null, 2), 'utf-8');
        console.log("Updated local db_products.json successfully.");
      } catch (e) {
        console.error("Error updating local JSON copy:", e);
      }
    }
  } else {
    console.log("No other sunglasses found to delete.");
  }
}

run().then(() => process.exit(0));
