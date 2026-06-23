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

const WATCH_UPDATES = [
  {
    old_name: 'Titan Karishma Quartz Analog Green Dial Silver Stainless Steel Strap Watch For Men',
    new_name: 'Titan Karishma 1648SM01',
    price: 2695.00,
    image_url: '/images/product1.png',
    overlay_image_url: '/images/overlays/product1try.png',
    description: 'Elegant quartz analog watch featuring a vibrant green dial with a premium silver-tone stainless steel strap. Case diameter 42mm, 3 ATM water resistance.'
  },
  {
    old_name: 'Titan Minimals Quartz Analog with Date Black Dial Black Metal Strap Watch For Men',
    new_name: 'Titan Minimals 1806NM01',
    price: 4495.00,
    image_url: '/images/product2.png',
    overlay_image_url: '/images/overlays/product2try.png',
    description: 'Monochrome minimalist watch featuring a clean black dial with a matching black metal strap. 5 ATM water resistance, date window at 6 o\'clock.'
  },
  {
    old_name: 'Fastrack Stunners Blue Dial Metal Strap Watch for Guys',
    new_name: 'Fastrack Stunners 3278SM03',
    price: 1495.00,
    image_url: '/images/product3.png',
    overlay_image_url: '/images/overlays/product3try.png',
    description: 'Dynamic quartz watch for guys featuring a bold blue dial with contrasting indices and a classic silver metal strap. Lightweight and durable.'
  },
  {
    old_name: 'Fastrack Marvellous FX3 Smartwatch with 1.43" AMOLED Display, Slim 10.4mm Design, HRM, Additional Silicone Strap',
    new_name: 'Fastrack Marvellous FX3',
    price: 5995.00,
    image_url: '/images/product4.png',
    overlay_image_url: '/images/overlays/product4try.png',
    description: 'Premium smartwatch featuring a 1.43" Super AMOLED display, slim 10.4mm metal casing, and 24/7 heart rate monitoring. Includes an additional silicone strap.'
  },
  {
    old_name: 'Fastrack Thor Quartz Multifunction Red Dial Metal Strap Watch for Guys',
    new_name: 'Fastrack Thor NU3286KM01',
    price: 5595.00,
    image_url: '/images/product5.png',
    overlay_image_url: '/images/overlays/product5try.png',
    description: 'Official Marvel Thor collection watch featuring a striking red multifunction dial with rose gold details and a gunmetal strap. Case diameter 51.5mm.'
  },
  {
    old_name: 'Titan Neo Classic Quartz',
    new_name: 'Titan Neo Analog 1836NL04',
    price: 3795.00,
    image_url: '/images/product1.png',
    overlay_image_url: '/images/overlays/product1try.png',
    description: 'Classic formal watch featuring a deep navy blue dial with a premium brown leather strap. Quartz analog with date function.'
  },
  {
    old_name: 'Fastrack Chronograph Watch',
    new_name: 'Fastrack Overdrive 3072SM04',
    price: 4495.00,
    image_url: '/images/product2.png',
    overlay_image_url: '/images/overlays/product2try.png',
    description: 'Sporty chronograph watch with a black steel case, dynamic red accent sub-dials, and multiple stopwatch functions.'
  }
];

async function run() {
  console.log("Starting watches database updates...");
  
  // 1. Update live Supabase DB
  for (const update of WATCH_UPDATES) {
    // Try to find the product by either old name or new name (in case it was partially updated)
    const { data: productsByOld } = await supabase
      .from('products')
      .select('*')
      .eq('name', update.old_name)
      .maybeSingle();

    const product = productsByOld;
    if (product) {
      console.log(`Updating live: "${update.old_name}" -> "${update.new_name}"`);
      const { error } = await supabase
        .from('products')
        .update({
          name: update.new_name,
          price: update.price,
          description: update.description,
          image_url: update.image_url,
          overlay_image_url: update.overlay_image_url
        })
        .eq('id', product.id);

      if (error) {
        console.error(`Error updating live product ${product.id}:`, error);
      }
    } else {
      // Check if it's already updated to new_name
      const { data: productsByNew } = await supabase
        .from('products')
        .select('*')
        .eq('name', update.new_name)
        .maybeSingle();
        
      if (productsByNew) {
        console.log(`Product "${update.new_name}" already exists and matches. Ensuring fields are correct...`);
        const { error } = await supabase
          .from('products')
          .update({
            price: update.price,
            description: update.description,
            image_url: update.image_url,
            overlay_image_url: update.overlay_image_url
          })
          .eq('id', productsByNew.id);
        if (error) console.error("Error checking live update:", error);
      } else {
        console.log(`Could not find watch product: "${update.old_name}" or "${update.new_name}"`);
      }
    }
  }

  // 2. Update local db_products.json copy
  if (fs.existsSync(localDbPath)) {
    try {
      const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      const updatedLocal = localProducts.map(p => {
        const match = WATCH_UPDATES.find(u => u.old_name === p.name || u.new_name === p.name);
        if (match) {
          p.name = match.new_name;
          p.price = match.price;
          p.description = match.description;
          p.image_url = match.image_url;
          p.overlay_image_url = match.overlay_image_url;
        }
        return p;
      });
      fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
      console.log("Updated local db_products.json copy successfully.");
    } catch (e) {
      console.error("Error updating local JSON copy:", e);
    }
  }
  
  console.log("Database update completed.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
