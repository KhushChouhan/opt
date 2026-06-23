const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Load environment variables
function loadEnv() {
  const envPath = path.resolve(__dirname, './.env');
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

async function run() {
  console.log("Fetching watches from Supabase...");
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'watches')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching from Supabase:", error);
    process.exit(1);
  }
  
  console.log(`Found ${products.length} watch products in Supabase.`);
  
  // Update in Supabase
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageNumber = (i % 5) + 1;
    const newImageUrl = `/images/product${imageNumber}.png`;
    
    console.log(`Updating ${product.name}: ${product.image_url} -> ${newImageUrl}`);
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url: newImageUrl })
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`Error updating product ${product.id}:`, updateError);
    }
  }
  
  // Also update local db_products.json copy if it exists
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      let localWatchesCount = 0;
      
      const updatedLocal = localProducts.map(p => {
        if (p.category === 'watches') {
          const imageNumber = (localWatchesCount % 5) + 1;
          p.image_url = `/images/product${imageNumber}.png`;
          localWatchesCount++;
        }
        return p;
      });
      
      fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
      console.log(`Updated ${localWatchesCount} watches in local db_products.json copy.`);
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
  
  console.log("Database update completed successfully.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
