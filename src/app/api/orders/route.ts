import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

// GET all orders - Admin only
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, products(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('API orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create order - Public (Rate limited)
export async function POST(request: NextRequest) {
  // Resolve client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
  const rateLimitStatus = await checkRateLimit(ip);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      { error: 'Too many order attempts. Please try again after 60 seconds.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { id, product_id, customer_name, phone, address, pincode } = body;

    // UUID Validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!product_id || !uuidRegex.test(product_id)) {
      return NextResponse.json({ error: 'Invalid product key format.' }, { status: 400 });
    }

    if (id && !uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid order reference key format.' }, { status: 400 });
    }

    // Name Validation
    if (!customer_name || customer_name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid name (at least 2 letters).' }, { status: 400 });
    }

    // Phone Validation (10 digits, starts with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit Indian phone number.' }, { status: 400 });
    }

    // Address Validation
    if (!address || address.trim().length < 10) {
      return NextResponse.json({ error: 'Please enter a complete address (at least 10 characters).' }, { status: 400 });
    }

    // Pincode Validation (6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincode || !pincodeRegex.test(pincode.trim())) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit Indian PIN code.' }, { status: 400 });
    }

    // Check if product exists & has stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: 'The selected product does not exist in our catalog.' }, { status: 404 });
    }

    if (product.stock <= 0) {
      return NextResponse.json({ error: 'This product is currently out of stock.' }, { status: 400 });
    }

    // Prepare insert payload
    const orderPayload: {
      product_id: string;
      customer_name: string;
      phone: string;
      address: string;
      pincode: string;
      status: string;
      id?: string;
    } = {
      product_id,
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      status: 'pending',
    };

    // Use client-generated UUID if supplied to support slow redirection fallbacks
    if (id) {
      orderPayload.id = id;
    }

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting order row:', insertError);
      return NextResponse.json({ error: 'Database error. Could not record your order.' }, { status: 500 });
    }

    // Decrement stock counter using supabaseAdmin (bypass public UPDATE block)
    const { error: stockError } = await supabaseAdmin
      .from('products')
      .update({ stock: Math.max(0, product.stock - 1) })
      .eq('id', product_id);

    if (stockError) {
      console.error('Error decrementing stock counter:', stockError);
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('API orders POST error:', error);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
