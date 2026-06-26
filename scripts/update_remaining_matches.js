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

const REMAINING_MATCHES = [
  {
    id: "e78c8a8f-af14-4f2e-8081-05539236fbeb", // Titan Neo NT1802QL01
    overlay_image_url: "/images/overlays/-original-imahz8xshgjgczuz-removebg-preview.png"
  },
  {
    id: "4dad30a9-a358-462c-9c45-a83044054756", // Titan Palette NT10033SM01
    overlay_image_url: "/images/overlays/MP000000026544067_437Wx649H_202505110203561-removebg-preview.png"
  },
  {
    id: "3ca45406-e928-416e-9d4a-7e9e0cce1854", // Titan Karishma NP1777YM02
    overlay_image_url: "/images/overlays/ChatGPT Image Jun 25, 2026, 08_12_35 PM.png"
  },
  {
    id: "36723aa4-d1d7-4c8b-9f74-d83011a7eb29", // Titan Palette 10033SM02
    overlay_image_url: "/images/overlays/ChatGPT Image Jun 25, 2026, 08_09_10 PM.png"
  }
];

async function run() {
  console.log("Updating remaining overlay matches in Supabase...");
  for (const match of REMAINING_MATCHES) {
    console.log(`Updating ${match.id} -> ${match.overlay_image_url}`);
    const { data, error } = await supabase
      .from('products')
      .update({ overlay_image_url: match.overlay_image_url })
      .eq('id', match.id)
      .select();

    if (error) {
      console.error(`Error updating product ${match.id}:`, error);
    } else {
      console.log(`Updated successfully:`, data?.[0]?.name);
    }
  }

  // Update products_backup.json
  if (fs.existsSync(productsBackupPath)) {
    try {
      const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
      const updatedBackup = backupProducts.map(p => {
        const match = REMAINING_MATCHES.find(m => m.id === p.id);
        if (match) {
          p.overlay_image_url = match.overlay_image_url;
        }
        return p;
      });
      fs.writeFileSync(productsBackupPath, JSON.stringify(updatedBackup, null, 2), 'utf-8');
      console.log("Updated products_backup.json successfully.");
    } catch (e) {
      console.error("Error updating products_backup.json:", e);
    }
  }

  // Update local db_products.json
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      const updatedLocal = localProducts.map(p => {
        const match = REMAINING_MATCHES.find(m => m.id === p.id);
        if (match) {
          p.overlay_image_url = match.overlay_image_url;
        }
        return p;
      });
      fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
      console.log("Updated local db_products.json successfully.");
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
}

run().then(() => process.exit(0));
