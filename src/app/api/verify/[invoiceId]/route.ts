/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  const { invoiceId } = params;

  if (!invoiceId) {
    return NextResponse.json({ error: 'Invoice reference is required' }, { status: 400 });
  }

  try {
    // Query database for orders matching the invoice ID in the address column
    const { data: orders, error: dbError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .filter('address', 'like', `%"invoice_number":"${invoiceId}"%`)
      .limit(1);

    if (dbError) {
      console.error('Error fetching verification order:', dbError);
      return NextResponse.json({ error: 'Database search query failed.' }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ verified: false, error: 'No matching tax invoice record found.' }, { status: 404 });
    }

    const orderData = orders[0];

    // Parse metadata
    let metadata: any = {};
    try {
      metadata = JSON.parse(orderData.address);
    } catch (e) {}

    // Get product details
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', orderData.product_id)
      .maybeSingle();

    // Parse product description
    let pid = 'PID-000000';
    let desc = product?.description || '';
    try {
      const parsedDesc = JSON.parse(product?.description);
      if (parsedDesc && typeof parsedDesc === 'object' && parsedDesc.pid) {
        pid = parsedDesc.pid;
        desc = parsedDesc.desc || '';
      }
    } catch (e) {}

    const verificationPayload = {
      verified: true,
      verification_timestamp: new Date().toISOString(),
      invoice_number: metadata.invoice_number || invoiceId,
      order_id: metadata.order_id || `HWO-LEGACY-${orderData.id.slice(0, 8).toUpperCase()}`,
      order_date: new Date(orderData.created_at).toISOString().slice(0, 10),
      customer_name: orderData.customer_name,
      customer_phone: orderData.phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2'), // Mask phone for privacy
      product_name: product?.name || 'Luxury Collection Piece',
      product_id: pid,
      brand_name: product?.name?.toLowerCase().includes('titan') ? 'Titan' : 'Hariyana Select',
      amount_paid: product?.price ? Number(product.price) : 0,
      payment_status: metadata.payment_status || orderData.status || 'pending',
      transaction_id: metadata.transaction_id || '',
    };

    return NextResponse.json(verificationPayload);
  } catch (error) {
    console.error('Verify endpoint error:', error);
    return NextResponse.json({ error: 'Internal server verification error.' }, { status: 500 });
  }
}
