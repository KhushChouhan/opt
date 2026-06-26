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

async function run() {
  console.log("Resetting watch calibrations in Supabase database to null defaults...");
  
  // We set scale, x_offset, y_offset, rotation_offset to null for all watches
  // so they automatically fall back to the component's adaptive default settings
  const { data: updatedData, error: updateError } = await supabase
    .from('products')
    .update({
      overlay_scale: null,
      overlay_x_offset: null,
      overlay_y_offset: null,
      overlay_rotation_offset: null
    })
    .eq('category', 'watches')
    .select();

  if (updateError) {
    console.error("Error updating watches in Supabase:", updateError);
  } else {
    console.log(`Successfully updated ${updatedData ? updatedData.length : 0} watches in Supabase.`);
    if (updatedData) {
      updatedData.forEach(p => console.log(` - Reset: ${p.name}`));
    }
  }

  // Update products_backup.json
  if (fs.existsSync(productsBackupPath)) {
    try {
      const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
      const updatedBackup = backupProducts.map(p => {
        if (p.category === 'watches') {
          return {
            ...p,
            overlay_scale: null,
            overlay_x_offset: null,
            overlay_y_offset: null,
            overlay_rotation_offset: null
          };
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
        if (p.category === 'watches') {
          return {
            ...p,
            overlay_scale: null,
            overlay_x_offset: null,
            overlay_y_offset: null,
            overlay_rotation_offset: null
          };
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

run().then(() => process.exit(0)).catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
