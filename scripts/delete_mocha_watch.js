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

const targetId = "8a4215d3-df13-4ec7-8a18-7e62165438b2"; // Titan Workwear NT2649WL01
const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\fdffd189-2106-4db3-a186-7f82a83d2d51\\scratch\\db_products.json";
const productsBackupPath = path.resolve(__dirname, '../supabase_backup/products_backup.json');

async function run() {
  console.log(`Deleting watch product ${targetId} from Supabase database...`);
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', targetId)
    .select();
    
  if (error) {
    console.error(`Error deleting product:`, error);
  } else {
    console.log(`Deleted product from Supabase successfully:`, data);
  }

  // Update supabase_backup/products_backup.json
  if (fs.existsSync(productsBackupPath)) {
    try {
      const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
      const filteredBackup = backupProducts.filter(p => p.id !== targetId);
      fs.writeFileSync(productsBackupPath, JSON.stringify(filteredBackup, null, 2), 'utf-8');
      console.log("Deleted watch from supabase_backup/products_backup.json successfully.");
    } catch (e) {
      console.error("Error updating products_backup.json:", e);
    }
  }

  // Update local db_products.json copy if it exists
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      const filtered = localProducts.filter(p => p.id !== targetId);
      fs.writeFileSync(localDbPath, JSON.stringify(filtered, null, 2), 'utf-8');
      console.log("Deleted watch from local db_products.json copy successfully.");
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
}

run().then(() => process.exit(0));
