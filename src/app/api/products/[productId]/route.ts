import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET specific product details - Public
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!productId || !uuidRegex.test(productId)) {
    return NextResponse.json({ error: 'Invalid product reference key.' }, { status: 400 });
  }

  try {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('API specific product GET error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// PUT update product - Admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  const { productId } = params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!productId || !uuidRegex.test(productId)) {
    return NextResponse.json({ error: 'Invalid product reference key.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, category, price, description, image_url, overlay_image_url, stock, lens_image_url, reflection_image_url, overlay_scale, overlay_x_offset, overlay_y_offset, overlay_rotation_offset } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    if (!category || !['glasses', 'sunglasses', 'watches'].includes(category)) {
      return NextResponse.json({ error: 'Valid category (glasses, sunglasses, watches) is required.' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Price must be a valid positive number.' }, { status: 400 });
    }

    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ error: 'Stock must be a non-negative whole number.' }, { status: 400 });
    }

    if (!image_url || !image_url.startsWith('http')) {
      return NextResponse.json({ error: 'A valid showcase image URL is required.' }, { status: 400 });
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

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update({
        name: name.trim(),
        category,
        price: parsedPrice,
        description: description?.trim() || '',
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
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product row:', error);
      return NextResponse.json({ error: 'Failed to update product details in database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('API specific product PUT error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE product - Admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  const { productId } = params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!productId || !uuidRegex.test(productId)) {
    return NextResponse.json({ error: 'Invalid product reference key.' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product row:', error);
      return NextResponse.json(
        { error: 'Failed to delete product. Note that products tied to historical orders cannot be deleted (instead, set their stock to 0).' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('API specific product DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
