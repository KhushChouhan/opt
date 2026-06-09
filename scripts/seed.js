const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');


// Helper to load .env file manually (Node v18 fallback)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.log('.env file not found. Seeding will run with system environment variables.');
    return;
  }
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIdx = trimmed.indexOf('=');
    if (separatorIdx === -1) return;
    const key = trimmed.substring(0, separatorIdx).trim();
    let val = trimmed.substring(separatorIdx + 1).trim();
    // Remove wrapping quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'hariyanaoptical49@gmail.com';
const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: { transport: ws }
});


async function runSeed() {
  console.log('Starting Database Seed...');

  // 1. Seed Admin
  console.log(`Checking admin user: ${adminEmail}...`);
  const { data: existingAdmin, error: findError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', adminEmail)
    .maybeSingle();

  if (findError) {
    console.error('Error finding admin:', findError);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  if (!existingAdmin) {
    console.log('Inserting new admin user...');
    const { error: insertAdminError } = await supabase
      .from('admins')
      .insert({
        email: adminEmail,
        password_hash: passwordHash,
      });

    if (insertAdminError) {
      console.error('Error creating admin:', insertAdminError);
    } else {
      console.log('Admin account successfully created.');
    }
  } else {
    console.log('Admin user already exists. Updating password hash...');
    const { error: updateAdminError } = await supabase
      .from('admins')
      .update({ password_hash: passwordHash })
      .eq('email', adminEmail);

    if (updateAdminError) {
      console.error('Error updating admin:', updateAdminError);
    } else {
      console.log('Admin password updated successfully.');
    }
  }

  // 2. Seed Demo Products
  console.log('Seeding demo products...');
  const demoProducts = [
    {
      name: 'Titan Classic Rectangular',
      category: 'glasses',
      price: 1499.00,
      description: 'Elegant rectangular eyeglasses with a matte black metal frame. Perfect for daily office wear.',
      image_url: '/images/hero_glasses.png',
      overlay_image_url: '/images/overlays/glasses_classic.png',
      stock: 15
    },
    {
      name: 'Ray-Ban Aviator Optical',
      category: 'glasses',
      price: 4500.00,
      description: 'Timeless gold metal wireframe aviator eyeglasses. Light, comfortable, and durable.',
      image_url: '/images/hero_glasses.png',
      overlay_image_url: '/images/overlays/glasses_gold.png',
      stock: 8
    },
    {
      name: 'Fastrack Sporty Sunglasses',
      category: 'sunglasses',
      price: 2199.00,
      description: 'Aero-dynamic sports sunglasses with UV protection and a sleek wrap-around profile.',
      image_url: '/images/hero_sunglasses.png',
      overlay_image_url: '/images/overlays/sunglasses_sports.png',
      stock: 20
    },
    {
      name: 'Ray-Ban Wayfarer Classic',
      category: 'sunglasses',
      price: 8999.00,
      description: 'The iconic wayfarer sunglasses with green classic G-15 tinted lenses. Absolute style statement.',
      image_url: '/images/hero_sunglasses.png',
      overlay_image_url: '/images/overlays/sunglasses_wayfarer.png',
      stock: 5
    },
    {
      name: 'Titan Neo Classic Quartz',
      category: 'watches',
      price: 3299.00,
      description: 'Classic analog watch with a brown leather strap and deep navy blue dial. Perfect for formal wear.',
      image_url: '/images/hero_watch.png',
      overlay_image_url: '/images/overlays/watch_classic.png',
      stock: 12
    },
    {
      name: 'Fastrack Chronograph Watch',
      category: 'watches',
      price: 4495.00,
      description: 'Active black steel chronograph watch with multi-dial display and dynamic red accents.',
      image_url: '/images/hero_watch.png',
      overlay_image_url: '/images/overlays/watch_sporty.png',
      stock: 10
    }
  ];

  for (const product of demoProducts) {
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('name', product.name)
      .maybeSingle();

    if (!existingProduct) {
      console.log(`Inserting product: ${product.name}...`);
      const { error: insertProdError } = await supabase
        .from('products')
        .insert(product);

      if (insertProdError) {
        console.error(`Error inserting ${product.name}:`, insertProdError);
      }
    } else {
      console.log(`Product ${product.name} already exists. Updating details and local image URL...`);
      const { error: updateProdError } = await supabase
        .from('products')
        .update(product)
        .eq('id', existingProduct.id);

      if (updateProdError) {
        console.error(`Error updating ${product.name}:`, updateProdError);
      }
    }
  }

  console.log('Database Seeding Completed Successfully.');
}

runSeed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
