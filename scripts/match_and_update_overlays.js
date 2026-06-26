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
const overlaysDir = path.resolve(__dirname, '../public/images/overlays');

async function run() {
  console.log("Reading overlays directory...");
  const files = fs.readdirSync(overlaysDir);
  console.log(`Found ${files.length} files in overlays directory.`);

  console.log("Fetching watch products from Supabase...");
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'watches');

  if (error) {
    console.error("Error fetching watches from Supabase:", error);
    process.exit(1);
  }

  console.log(`Found ${products.length} watch products in Supabase.`);

  const matches = [];
  const unmatchedFiles = [];
  const unmatchedProducts = [...products];

  // Try to match files to products
  for (const file of files) {
    // Only process PNG/JPG files
    if (!file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.jpeg')) continue;
    
    // Skip static/general overlays
    if (['custom_frame.png', 'first_1.png', 'first_2.png', 'first_3.png', 'frame.png', 'lens.png', 'product1try.png', 'product2try.png', 'product3try.png', 'product4try.png', 'product5try.png', 'produtct3try.png', 'reflection.png', 'sun.png', 'watch_classic.png', 'watch_sporty.png'].includes(file)) {
      continue;
    }

    // Try to extract a model number from file name
    // e.g. "watch_nt15843sm04-removebg-preview.png" -> NT15843SM04
    // e.g. "watch_1824ym02-removebg-preview.png" -> 1824YM02
    const lowerFile = file.toLowerCase();
    let matchedProduct = null;

    for (const p of products) {
      const lowerName = p.name.toLowerCase();
      
      // Match model number
      // We look for model numbers like NT15843SM04, 1824YM02 etc.
      // Let's extract any word containing digits and letters
      const modelRegex = /[a-z0-9]+/g;
      const fileTokens = lowerFile.match(modelRegex) || [];
      
      // Check if any token from file name is present in product name
      // Specifically tokens that have numbers in them (e.g. "1824ym02", "15843sm04")
      const candidateTokens = fileTokens.filter(t => /[0-9]/.test(t) && t.length >= 4);
      
      for (const token of candidateTokens) {
        // Strip common prefix like "nt" or "nu" if necessary to match variations
        const cleanToken = token.startsWith('watch') ? token.replace('watch', '') : token;
        const normalizedToken = cleanToken.startsWith('nt') ? cleanToken.substring(2) : cleanToken;
        
        if (lowerName.includes(cleanToken) || lowerName.includes(normalizedToken)) {
          matchedProduct = p;
          break;
        }
      }
      
      if (matchedProduct) break;
    }

    if (matchedProduct) {
      matches.push({ file, product: matchedProduct });
      // Remove from unmatched products list
      const idx = unmatchedProducts.findIndex(p => p.id === matchedProduct.id);
      if (idx !== -1) unmatchedProducts.splice(idx, 1);
    } else {
      unmatchedFiles.push(file);
    }
  }

  console.log("\n--- Matching Summary ---");
  console.log(`Matched: ${matches.length} products.`);
  console.log(`Unmatched files: ${unmatchedFiles.length}`);
  console.log(`Unmatched products in DB: ${unmatchedProducts.length}`);

  // Perform updates
  const updatedIds = [];
  for (const match of matches) {
    const overlayUrl = `/images/overlays/${match.file}`;
    console.log(`Updating "${match.product.name}" overlay -> "${overlayUrl}"`);
    
    // Update Supabase
    const { error: updateErr } = await supabase
      .from('products')
      .update({ overlay_image_url: overlayUrl })
      .eq('id', match.product.id);

    if (updateErr) {
      console.error(`Error updating Supabase for ${match.product.id}:`, updateErr);
    } else {
      updatedIds.push({ id: match.product.id, url: overlayUrl });
    }
  }

  // Update local backups
  if (updatedIds.length > 0) {
    // 1. products_backup.json
    if (fs.existsSync(productsBackupPath)) {
      try {
        const backupProducts = JSON.parse(fs.readFileSync(productsBackupPath, 'utf-8'));
        const updatedBackup = backupProducts.map(p => {
          const match = updatedIds.find(u => u.id === p.id);
          if (match) {
            p.overlay_image_url = match.url;
          }
          return p;
        });
        fs.writeFileSync(productsBackupPath, JSON.stringify(updatedBackup, null, 2), 'utf-8');
        console.log("Updated products_backup.json successfully.");
      } catch (e) {
        console.error("Error updating products_backup.json:", e);
      }
    }

    // 2. local db_products.json
    if (fs.existsSync(localDbPath)) {
      try {
        const localProducts = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
        const updatedLocal = localProducts.map(p => {
          const match = updatedIds.find(u => u.id === p.id);
          if (match) {
            p.overlay_image_url = match.url;
          }
          return p;
        });
        fs.writeFileSync(localDbPath, JSON.stringify(updatedLocal, null, 2), 'utf-8');
        console.log("Updated local db_products.json copy successfully.");
      } catch (e) {
        console.error("Error updating local JSON copy:", e);
      }
    }
  }

  console.log("\n--- Detailed Unmatched Report ---");
  console.log("Unmatched Files in folder:");
  unmatchedFiles.forEach(f => console.log(`  - ${f}`));

  console.log("\nUnmatched Watch Products in DB (still using default watch_classic):");
  unmatchedProducts.forEach(p => console.log(`  - [${p.id}] ${p.name}`));
}

run().then(() => process.exit(0));
