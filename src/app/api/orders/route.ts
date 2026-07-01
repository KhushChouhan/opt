/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

// Helper function to parse product details and extract PID
function parseProduct(product: any) {
  if (!product) return null;
  let pid = '';
  let desc = product.description || '';
  try {
    const parsed = JSON.parse(product.description);
    if (parsed && typeof parsed === 'object' && parsed.pid) {
      pid = parsed.pid;
      desc = parsed.desc || '';
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
      // Deterministic fallback based on ID hash
      let hash = 0;
      for (let i = 0; i < product.id.length; i++) {
        hash = (hash << 5) - hash + product.id.charCodeAt(i);
        hash |= 0;
      }
      const absHash = Math.abs(hash) % 100000;
      pid = `PID-${String(absHash).padStart(6, '0')}`;
    }
  }

  return {
    ...product,
    product_id: pid,
    description: desc
  };
}

// Helper function to parse order details and its JSON address metadata
function parseOrder(order: any) {
  let addressData: any = {};
  try {
    addressData = JSON.parse(order.address);
  } catch (e) {
    // Not JSON
  }

  const hasJsonAddress = Object.keys(addressData).length > 0;
  const parsedProduct = parseProduct(order.products);

  return {
    ...order,
    order_id: addressData.order_id || `HWO-LEGACY-${order.id.slice(0, 8).toUpperCase()}`,
    invoice_number: addressData.invoice_number || `INV-LEGACY-${order.id.slice(0, 8).toUpperCase()}`,
    customer_email: addressData.customer_email || '',
    transaction_id: addressData.transaction_id || '',
    payment_status: addressData.payment_status || order.status || 'pending',
    payment_method: addressData.payment_method || 'UPI',
    payment_date: addressData.payment_date || new Date(order.created_at).toISOString().slice(0, 10),
    payment_time: addressData.payment_time || new Date(order.created_at).toTimeString().slice(0, 8),
    payment_screenshot: addressData.payment_screenshot || null,
    address: hasJsonAddress ? (addressData.shipping_address || '') : order.address,
    customer_details: addressData.customer_details || {
      name: order.customer_name,
      phone: order.phone,
      email: addressData.customer_email || ''
    },
    shipping_address: hasJsonAddress ? (addressData.shipping_address || '') : order.address,
    order_items: addressData.order_items || [
      {
        product_id: parsedProduct?.product_id || 'PID-000000',
        product_name: parsedProduct?.name || '',
        price: parsedProduct?.price ? Number(parsedProduct.price) : 0,
        quantity: 1
      }
    ],
    products: parsedProduct
  };
}

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

    const parsedOrders = orders.map(parseOrder);
    return NextResponse.json(parsedOrders);
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
    const { id, product_id, customer_name, phone, address, pincode, email } = body;

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

    // Optional Email Validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check if product exists & has stock
    const { data: product, error: productError } = await supabaseAdmin
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

    // Auto-generate unique incrementing date-based Order ID and Invoice Number
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    // Get number of orders placed today for incrementing serial
    const startOfDay = new Date(new Date().setHours(0,0,0,0)).toISOString();
    const { count } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfDay);

    const serialNum = (count || 0) + 1;
    const serialStr = String(serialNum).padStart(6, '0');
    const orderId = `HWO-${dateStr}-${serialStr}`;
    const invoiceNo = `INV-${dateStr}-${serialStr}`;

    // Parse product details for items mapping
    const parsedProduct = parseProduct(product);

    // Package metadata in JSON format inside the address column
    const addressData = {
      order_id: orderId,
      invoice_number: invoiceNo,
      shipping_address: address.trim(),
      customer_email: (email || '').trim(),
      transaction_id: '',
      payment_status: 'pending',
      payment_method: 'UPI',
      payment_date: '',
      payment_time: '',
      payment_screenshot: null,
      customer_details: {
        name: customer_name.trim(),
        phone: phone.trim(),
        email: (email || '').trim()
      },
      order_items: [
        {
          product_id: parsedProduct?.product_id || 'PID-000000',
          product_name: parsedProduct?.name || '',
          price: parsedProduct?.price ? Number(parsedProduct.price) : 0,
          quantity: 1
        }
      ]
    };

    // Prepare insert payload
    const orderPayload: any = {
      product_id,
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      address: JSON.stringify(addressData),
      pincode: pincode.trim(),
      status: 'pending',
    };

    // Use client-generated UUID if supplied to support slow redirection fallbacks
    if (id) {
      orderPayload.id = id;
    }

    const { data: order, error: insertError } = await supabaseAdmin
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

    const parsedOrder = parseOrder({ ...order, products: parsedProduct });

    return NextResponse.json({ 
      success: true, 
      order: parsedOrder,
      order_id: orderId, 
      invoice_number: invoiceNo 
    }, { status: 201 });
  } catch (error) {
    console.error('API orders POST error:', error);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
