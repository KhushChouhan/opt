const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.substring(0, idx).trim();
    let val = trimmed.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  });
}

loadEnv();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const productsBackupPath = path.resolve(__dirname, '../supabase_backup/products_backup.json');
const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\b3c6f85a-84e1-45f3-a989-843208993c14\\scratch\\db_products.json";

async function run() {
  const overlayUrl = '/images/overlays/rayban_meta_skyler_cinnamon_tryon.png';
  const productName = 'Ray-Ban Meta Skyler Shiny Cinnamon';

  console.log(`Updating "${productName}" -> "${overlayUrl}"`);

  const { data, error } = await supabase
    .from('products')
    .update({ overlay_image_url: overlayUrl })
    .eq('name', productName)
    .select('id, name, overlay_image_url');

  if (error) {
    console.error('Supabase error:', error);
    process.exit(1);
  }

  console.log('Supabase updated:', data);
  const pid = data?.[0]?.id;

  if (pid && fs.existsSync(productsBackupPath)) {
    const ps = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
    ps.forEach(p => { if (p.id === pid) p.overlay_image_url = overlayUrl; });
    fs.writeFileSync(productsBackupPath, JSON.stringify(ps, null, 2), 'utf-8');
    console.log('products_backup.json updated');
  }

  if (pid && fs.existsSync(localDbPath)) {
    const ps = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
    ps.forEach(p => { if (p.id === pid) p.overlay_image_url = overlayUrl; });
    fs.writeFileSync(localDbPath, JSON.stringify(ps, null, 2), 'utf-8');
    console.log('db_products.json updated');
  }
}

run().then(() => process.exit(0));
