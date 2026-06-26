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

const UPDATES = [
  {
    name: "Ray-Ban Meta Skyler Shiny Cinnamon",
    overlay_image_url: "/images/overlays/10.png"
  },
  {
    name: "Ray-Ban Meta Wayfarer Shiny Smoke",
    overlay_image_url: "/images/overlays/11.png"
  },
  {
    name: "Ray-Ban Scuderia Ferrari Wayfarer Grey",
    overlay_image_url: "/images/overlays/12.png"
  }
];

async function run() {
  console.log("Updating overlay paths to 10.png, 11.png, and 12.png directly...");

  for (const item of UPDATES) {
    console.log(`Updating "${item.name}" -> "${item.overlay_image_url}"`);
    const { data, error } = await supabase
      .from('products')
      .update({ overlay_image_url: item.overlay_image_url })
      .eq('name', item.name)
      .select();

    if (error) {
      console.error(`Error updating "${item.name}":`, error);
    } else {
      console.log(`Successfully updated in Supabase:`, data?.[0]?.name, "->", data?.[0]?.overlay_image_url);
      
      const productId = data?.[0]?.id;
      if (productId) {
        // Update products_backup.json
        if (fs.existsSync(productsBackupPath)) {
          try {
            const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
            const updatedBackup = backupProducts.map(p => {
              if (p.id === productId) p.overlay_image_url = item.overlay_image_url;
              return p;
            });
            fs.writeFileSync(productsBackupPath, JSON.stringify(updatedBackup, null, 2), 'utf-8');
            console.log(`Updated products_backup.json for ${item.name}`);
          } catch (e) {
            console.error("Error updating products_backup.json:", e);
          }
        }

        // Update local db_products.json
        if (fs.existsSync(localDbPath)) {
          try {
            const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
            const updatedLocal = localProducts.map(p => {
              if (p.id === productId) p.overlay_image_url = item.overlay_image_url;
              return p;
            });
            fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
            console.log(`Updated local db_products.json for ${item.name}`);
          } catch (e) {
            console.error("Error updating local JSON copy:", e);
          }
        }
      }
    }
  }
}

run().then(() => process.exit(0));
