/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// GET products - Public
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    let query = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });

    const isCustomCategory = ['belts', 'perfumes', 'wallets', 'accessories'].includes(category || '');
    const dbCategory = isCustomCategory ? 'glasses' : category;

    if (dbCategory && ['glasses', 'sunglasses', 'watches'].includes(dbCategory)) {
      query = query.eq('category', dbCategory);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
    }

    let filteredProducts = products || [];
    if (isCustomCategory && products) {
      filteredProducts = products.filter((p: { description?: string | null }) => 
        p.description && p.description.includes(`[Category: ${category}]`)
      );
    }

    const parsedProducts = filteredProducts.map((p: any) => {
      let pid = '';
      let desc = p.description || '';
      let discount = 0;
      try {
        const parsed = JSON.parse(p.description);
        if (parsed && typeof parsed === 'object') {
          if (parsed.pid) pid = parsed.pid;
          if (parsed.desc) desc = parsed.desc;
          if (parsed.discount) discount = parseFloat(parsed.discount) || 0;
        }
      } catch (e) {
        // Not JSON
      }

      if (!pid) {
        const match = desc.match(/\[PID:\s*(PID-\d+)\]$/);
        if (match) {
          pid = match[1];
          desc = desc.replace(/\[PID:\s*(PID-\d+)\]$/, '').trim();
        } else {
          let hash = 0;
          for (let i = 0; i < p.id.length; i++) {
            hash = (hash << 5) - hash + p.id.charCodeAt(i);
            hash |= 0;
          }
          pid = `PID-${String(Math.abs(hash) % 100000).padStart(6, '0')}`;
        }
      }

      return {
        ...p,
        product_id: pid,
        description: desc,
        discount
      };
    });

    return NextResponse.json(parsedProducts);
  } catch (error) {
    console.error('API products GET error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// POST create product - Admin only
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, category, price, description, image_url, overlay_image_url, stock, lens_image_url, reflection_image_url, overlay_scale, overlay_x_offset, overlay_y_offset, overlay_rotation_offset, discount } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    if (!category || !['glasses', 'sunglasses', 'watches', 'belts', 'perfumes', 'wallets', 'accessories'].includes(category)) {
      return NextResponse.json({ error: 'Valid category (glasses, sunglasses, watches, belts, perfumes, wallets, accessories) is required.' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Price must be a valid positive number.' }, { status: 400 });
    }

    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ error: 'Stock must be a non-negative whole number.' }, { status: 400 });
    }

    const parsedDiscount = discount !== undefined && discount !== null && discount !== '' ? parseFloat(discount) : 0;
    if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      return NextResponse.json({ error: 'Discount must be a valid number between 0 and 100.' }, { status: 400 });
    }

    if (!image_url || !image_url.startsWith('http')) {
      return NextResponse.json({ error: 'A valid showcase image URL is required (must start with http/https).' }, { status: 400 });
    }

    if (!overlay_image_url || (!overlay_image_url.startsWith('http') && !overlay_image_url.startsWith('/'))) {
      return NextResponse.json({ error: 'A valid overlay image URL or local asset path is required.' }, { status: 400 });
    }

    if (lens_image_url && !lens_image_url.startsWith('http') && !lens_image_url.startsWith('/')) {
      return NextResponse.json({ error: 'Lens image URL must be a valid URL or local asset path.' }, { status: 400 });
    }

    if (reflection_image_url && !reflection_image_url.startsWith('http') && !reflection_image_url.startsWith('/')) {
      return NextResponse.json({ error: 'Reflection image URL must be a valid URL or local asset path.' }, { status: 400 });
    }

    let dbCategory = category;
    let dbDescription = description?.trim() || '';

    if (['belts', 'perfumes', 'wallets', 'accessories'].includes(category)) {
      dbCategory = 'glasses';
      const cleanDesc = dbDescription.replace(/^\[Category:\s*.*?\]\s*/g, '');
      dbDescription = `[Category: ${category}] ${cleanDesc}`;
    }

    // Generate new unique Product ID by checking all existing PIDs
    const { data: allProducts } = await supabaseAdmin
      .from('products')
      .select('description');
    
    let maxSuffix = 0;
    if (allProducts) {
      for (const p of allProducts) {
        if (!p.description) continue;
        try {
          const parsed = JSON.parse(p.description);
          if (parsed && typeof parsed === 'object' && parsed.pid) {
            const num = parseInt(parsed.pid.replace('PID-', ''), 10);
            if (!isNaN(num) && num > maxSuffix) maxSuffix = num;
          }
        } catch (e) {
          const match = p.description.match(/\[PID:\s*PID-(\d+)\]$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxSuffix) maxSuffix = num;
          }
        }
      }
    }
    const nextPidNum = maxSuffix + 1;
    const newPid = `PID-${String(nextPidNum).padStart(6, '0')}`;

    const finalDesc = JSON.stringify({
      pid: newPid,
      desc: dbDescription,
      discount: parsedDiscount
    });

    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: name.trim(),
        category: dbCategory,
        price: parsedPrice,
        description: finalDesc,
        image_url: image_url.trim(),
        overlay_image_url: overlay_image_url.trim(),
        lens_image_url: lens_image_url?.trim() || null,
        reflection_image_url: reflection_image_url?.trim() || null,
        overlay_scale: overlay_scale !== undefined && overlay_scale !== null && overlay_scale !== '' ? parseFloat(overlay_scale) : null,
        overlay_x_offset: overlay_x_offset !== undefined && overlay_x_offset !== null && overlay_x_offset !== '' ? parseFloat(overlay_x_offset) : null,
        overlay_y_offset: overlay_y_offset !== undefined && overlay_y_offset !== null && overlay_y_offset !== '' ? parseFloat(overlay_y_offset) : null,
        overlay_rotation_offset: overlay_rotation_offset !== undefined && overlay_rotation_offset !== null && overlay_rotation_offset !== '' ? parseFloat(overlay_rotation_offset) : null,
        stock: parsedStock,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting product row:', error);
      return NextResponse.json({ error: 'Failed to record the product in database.' }, { status: 500 });
    }

    // Parse the newly created product to return a clean client object
    let clientProductDesc = newProduct.description;
    let clientProductId = newPid;
    try {
      const parsedNew = JSON.parse(newProduct.description);
      if (parsedNew && typeof parsedNew === 'object' && parsedNew.pid) {
        clientProductId = parsedNew.pid;
        clientProductDesc = parsedNew.desc || '';
      }
    } catch (e) {}

    return NextResponse.json({ 
      success: true, 
      product: {
        ...newProduct,
        product_id: clientProductId,
        description: clientProductDesc
      }
    }, { status: 201 });
  } catch (error) {
    console.error('API products POST error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
