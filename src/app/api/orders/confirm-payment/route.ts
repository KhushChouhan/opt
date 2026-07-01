/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db_id, transaction_id, payment_screenshot } = body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!db_id || !uuidRegex.test(db_id)) {
      return NextResponse.json({ error: 'Invalid order reference key format.' }, { status: 400 });
    }

    if (!transaction_id || !/^\d{12}$/.test(transaction_id.trim())) {
      return NextResponse.json({ error: 'Transaction ID / UTR must be exactly 12 digits.' }, { status: 400 });
    }

    // Fetch the existing order row
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', db_id)
      .maybeSingle();

    if (fetchError || !order) {
      console.error('Error fetching order for payment confirmation:', fetchError);
      return NextResponse.json({ error: 'Order reference not found in database.' }, { status: 404 });
    }

    // Parse the address column as JSON metadata
    let metadata: any = {};
    try {
      metadata = JSON.parse(order.address);
    } catch (e) {
      // Backwards compatibility if address was saved as a plain string
      metadata = {
        shipping_address: order.address,
        customer_email: '',
        order_id: `HWO-LEGACY-${order.id.slice(0, 8)}`,
        invoice_number: `INV-LEGACY-${order.id.slice(0, 8)}`
      };
    }

    const today = new Date();
    const paymentDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const paymentTime = today.toTimeString().slice(0, 8);  // HH:MM:SS

    // Update metadata properties
    metadata.transaction_id = transaction_id.trim();
    metadata.payment_screenshot = payment_screenshot || null;
    metadata.payment_date = paymentDate;
    metadata.payment_time = paymentTime;
    metadata.payment_status = 'pending'; // Awaiting verification
    metadata.payment_method = 'UPI';

    const updatedAddressJson = JSON.stringify(metadata);

    // Update in database using supabaseAdmin
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        address: updatedAddressJson
      })
      .eq('id', db_id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error during payment confirmation:', updateError);
      return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('API confirm-payment POST error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
