const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Load env variables
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

const SUNGLASSES_MAPPING = [
  {
    name: 'Ray-Ban Wayfarer Classic',
    overlay: '/images/overlays/first_1.png'
  },
  {
    name: 'Ray-Ban New Wayfarer Classic sunglasses',
    overlay: '/images/overlays/first_2.png'
  },
  {
    name: 'Fastrack Sporty Sunglasses',
    overlay: '/images/overlays/first_3.png'
  },
  {
    name: 'NEW WAYFARER',
    overlay: '/images/overlays/first_1.png'
  },
  {
    name: 'Ray-Ban Clubmaster Classic',
    overlay: '/images/overlays/first_2.png'
  }
];

async function updateSunglasses() {
  console.log('Starting Sunglasses overlays update...');

  for (const item of SUNGLASSES_MAPPING) {
    console.log(`Updating ${item.name} with overlay: ${item.overlay}...`);
    const { data, error } = await supabase
      .from('products')
      .update({ overlay_image_url: item.overlay })
      .eq('name', item.name)
      .select();

    if (error) {
      console.error(`Error updating ${item.name}:`, error);
    } else {
      console.log(`Successfully updated ${item.name}. Result count: ${data ? data.length : 0}`);
    }
  }

  // Update local db_products.json as well if present
  const localDbPath = "C:\\Users\\s\\.gemini\\antigravity\\brain\\fdffd189-2106-4db3-a186-7f82a83d2d51\\scratch\\db_products.json";
  if (fs.existsSync(localDbPath)) {
    try {
      console.log('Updating local db_products.json...');
      const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      if (Array.isArray(localData)) {
        localData.forEach(entry => {
          const match = SUNGLASSES_MAPPING.find(m => m.name === entry.name);
          if (match) {
            entry.overlay_image_url = match.overlay;
            console.log(`Updated local json for ${entry.name}`);
          }
        });
        fs.writeFileSync(localDbPath, JSON.stringify(localData, null, 2));
        console.log('Successfully saved local db_products.json updates.');
      }
    } catch (err) {
      console.error('Error updating local db_products.json:', err);
    }
  }

  console.log('Sunglasses overlays update completed!');
}

updateSunglasses().then(() => process.exit(0));
