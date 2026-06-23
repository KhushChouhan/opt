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
      overlay_image_url: '/images/overlays/first_3.png',
      stock: 20
    },
    {
      name: 'Ray-Ban Wayfarer Classic',
      category: 'sunglasses',
      price: 8999.00,
      description: 'The iconic wayfarer sunglasses with green classic G-15 tinted lenses. Absolute style statement.',
      image_url: '/images/hero_sunglasses.png',
      overlay_image_url: '/images/overlays/first_1.png',
      stock: 5
    },
    {
      name: 'Ray-Ban New Wayfarer Classic sunglasses',
      category: 'sunglasses',
      price: 14090.00,
      description: 'Aero-dynamic sports sunglasses with UV protection and a sleek wrap-around profile.',
      image_url: '/images/hero_sunglasses.png',
      overlay_image_url: '/images/overlays/first_2.png',
      stock: 12
    },
    {
      name: 'Titan Karishma 1648SM01',
      category: 'watches',
      price: 2695.00,
      description: 'Elegant quartz analog watch featuring a vibrant green dial with a premium silver-tone stainless steel strap. Case diameter 42mm, 3 ATM water resistance.',
      image_url: '/images/product1.png',
      overlay_image_url: '/images/overlays/product1try.png',
      stock: 12
    },
    {
      name: 'Fastrack Overdrive 3072SM04',
      category: 'watches',
      price: 4495.00,
      description: 'Sporty chronograph watch with a black steel case, dynamic red accent sub-dials, and multiple stopwatch functions.',
      image_url: '/images/product2.png',
      overlay_image_url: '/images/overlays/product2try.png',
      stock: 10
    },
    {
      name: 'Fastrack Stunners 3278SM03',
      category: 'watches',
      price: 1495.00,
      description: 'Dynamic quartz watch for guys featuring a bold blue dial with contrasting indices and a classic silver metal strap. Lightweight and durable.',
      image_url: '/images/product3.png',
      overlay_image_url: '/images/overlays/product3try.png',
      stock: 12
    },
    {
      name: 'Fastrack Marvellous FX3',
      category: 'watches',
      price: 5995.00,
      description: 'Premium smartwatch featuring a 1.43" Super AMOLED display, slim 10.4mm metal casing, and 24/7 heart rate monitoring. Includes an additional silicone strap.',
      image_url: '/images/product4.png',
      overlay_image_url: '/images/overlays/product4try.png',
      stock: 12
    },
    {
      name: 'Fastrack Thor NU3286KM01',
      category: 'watches',
      price: 5595.00,
      description: 'Official Marvel Thor collection watch featuring a striking red multifunction dial with rose gold details and a gunmetal strap. Case diameter 51.5mm.',
      image_url: '/images/product5.png',
      overlay_image_url: '/images/overlays/product5try.png',
      stock: 12
    },
    {
      name: 'Creed Aventus Eau De Parfum',
      category: 'glasses',
      price: 26500.00,
      description: '[Category: perfumes] The exceptional Aventus was inspired by the dramatic life of a historic emperor, celebrating strength, power and success.',
      image_url: '/images/product_creed_aventus.png',
      overlay_image_url: '',
      stock: 5
    },
    {
      name: 'Tom Ford Oud Wood',
      category: 'glasses',
      price: 22000.00,
      description: '[Category: perfumes] One of the most rare, precious, and expensive ingredients in a perfumer’s arsenal, oud wood is often burned in incense-filled temples.',
      image_url: '/images/product_tom_ford.png',
      overlay_image_url: '',
      stock: 6
    },
    {
      name: 'Montblanc Classic Leather Belt',
      category: 'glasses',
      price: 19500.00,
      description: '[Category: belts] Rectangular shiny palladium-coated pin buckle with Montblanc emblem, self-adjustable black and brown reversible leather strap.',
      image_url: '/images/product_montblanc_belt.png',
      overlay_image_url: '',
      stock: 12
    },
    {
      name: 'Hermes H-Buckle Reversible Belt',
      category: 'glasses',
      price: 65000.00,
      description: '[Category: belts] Reversible leather strap in Epsom calfskin with the signature H metal buckle in brushed gold plating.',
      image_url: '/images/product_hermes_belt.png',
      overlay_image_url: '',
      stock: 3
    },
    {
      name: 'Louis Vuitton Pocket Organizer',
      category: 'glasses',
      price: 34500.00,
      description: '[Category: wallets] Crafted in signature Monogram Eclipse canvas, this pocket organizer is the compact wallet of choice for everyday essentials.',
      image_url: '/images/product_lv_wallet.png',
      overlay_image_url: '',
      stock: 7
    },
    {
      name: 'Montblanc Meisterstuck Leather Wallet',
      category: 'glasses',
      price: 24000.00,
      description: '[Category: wallets] Black full-grain cowhide leather wallet with 6 credit card pockets, 2 compartments for banknotes and 2 additional pockets.',
      image_url: '/images/product_montblanc_wallet.png',
      overlay_image_url: '',
      stock: 10
    },
    {
      name: 'Montblanc Meisterstuck Classique Pen',
      category: 'glasses',
      price: 42000.00,
      description: '[Category: accessories] The luxury rollerball pen in deep black precious resin with elegant gold-coated details, surmounted by the white star emblem.',
      image_url: '/images/product_montblanc_pen.png',
      overlay_image_url: '',
      stock: 4
    },
    {
      name: 'Signature Gold & Onyx Cufflinks',
      category: 'glasses',
      price: 8500.00,
      description: '[Category: accessories] Elegant round cufflinks in polished gold-toned brass with a central black onyx stone insert. Timeless luxury details.',
      image_url: '/images/product_gold_cufflinks.png',
      overlay_image_url: '',
      stock: 8
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
