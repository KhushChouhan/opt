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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function assignProductIds() {
  console.log('Fetching all products...');
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }
  
  console.log(`Found ${products.length} products. Assigning Product IDs...`);
  
  let count = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let rawDesc = p.description || '';
    let pid = '';
    let actualDesc = '';
    
    // Check if already assigned
    try {
      const parsed = JSON.parse(rawDesc);
      if (parsed && typeof parsed === 'object' && parsed.pid) {
        pid = parsed.pid;
        actualDesc = parsed.desc || '';
      }
    } catch (e) {
      // Not JSON
    }
    
    if (!pid) {
      // Format: PID-000001, PID-000002...
      const numStr = String(i + 1).padStart(6, '0');
      pid = `PID-${numStr}`;
      actualDesc = rawDesc;
      
      const newDesc = JSON.stringify({
        pid: pid,
        desc: actualDesc
      });
      
      console.log(`Product "${p.name}" -> Updating with ${pid}`);
      const { error: updateError } = await supabase
        .from('products')
        .update({ description: newDesc })
        .eq('id', p.id);
        
      if (updateError) {
        console.error(`Error updating product ${p.name}:`, updateError);
      } else {
        count++;
      }
    } else {
      console.log(`Product "${p.name}" already has ${pid}`);
    }
  }
  
  console.log(`Successfully assigned/updated ${count} products.`);
}

assignProductIds().then(() => process.exit(0));
