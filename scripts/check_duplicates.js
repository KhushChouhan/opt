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

async function checkDuplicates() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  const counts = {};
  data.forEach(p => {
    counts[p.name] = (counts[p.name] || 0) + 1;
  });
  
  const duplicates = Object.keys(counts).filter(name => counts[name] > 1);
  if (duplicates.length === 0) {
    console.log("No duplicate product names found.");
  } else {
    console.log("Duplicate product names:", duplicates);
    duplicates.forEach(name => {
      console.log(`\nDuplicate: "${name}"`);
      const matches = data.filter(p => p.name === name);
      matches.forEach(m => {
        console.log(`  ID: ${m.id}, Category: ${m.category}, Image: ${m.image_url}, Overlay: ${m.overlay_image_url}`);
      });
    });
  }
}

checkDuplicates().then(() => process.exit(0));
