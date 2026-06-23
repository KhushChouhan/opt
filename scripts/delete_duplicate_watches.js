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

const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\fdffd189-2106-4db3-a186-7f82a83d2d51\\scratch\\db_products.json";

async function run() {
  const idsToDelete = [
    "4cc5ad5a-a04c-47ab-82f9-1b8aaaa3a18d", // Titan Neo Analog 1836NL04 (mismatched image product1.png, duplicate overlay)
    "75d7ea99-6d30-4adf-92da-ca6992ca5912"  // Titan Minimals 1806NM01 (mismatched image product2.png, duplicate overlay)
  ];

  console.log("Deleting duplicate watches from Supabase database...");
  for (const id of idsToDelete) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Error deleting product ${id}:`, error);
    } else {
      console.log(`Deleted product:`, data);
    }
  }

  // Update local db_products.json copy
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      const filtered = localProducts.filter(p => !idsToDelete.includes(p.id));
      fs.writeFileSync(localDbPath, JSON.stringify(filtered, null, 2), 'utf-8');
      console.log("Updated local db_products.json successfully.");
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
}

run().then(() => process.exit(0));
