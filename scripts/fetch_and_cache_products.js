const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found!');
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Credentials missing from environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: { transport: ws }
});

const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\fdffd189-2106-4db3-a186-7f82a83d2d51\\scratch\\db_products.json";

async function fetchProducts() {
  console.log('Fetching all products from Supabase...');
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Fetched ${data.length} products.`);
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Saved products cache to ${localDbPath}`);
}

fetchProducts().then(() => {
  // Graceful exit to avoid Node ws/libuv crash on exit
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});
