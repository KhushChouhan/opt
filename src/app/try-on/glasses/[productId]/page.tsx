import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GlassesTryOnCanvas from '@/components/GlassesTryOnCanvas';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    productId: string;
  };
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = params;
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (!product) {
    return {
      title: 'Product Not Found | Hariyana Watch & Opticals',
    };
  }

  return {
    title: `Try On ${product.name} | Hariyana Watch & Opticals`,
    description: `Virtually try on ${product.name} (${product.category}) using your web camera. Real-time WebGL fitting at Hariyana Watch & Opticals, Rajasthan.`,
  };
}

export default async function GlassesTryOnPage({ params }: PageProps) {
  const { productId } = params;
  
  // Verify UUID format before hitting DB
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    notFound();
  }

  // Fetch product from Supabase (server-side for low latency & SEO)
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error || !product) {
    console.error('Error fetching product for try-on page:', error);
    notFound();
  }

  // Double check that category is appropriate
  if (product.category !== 'glasses' && product.category !== 'sunglasses') {
    notFound();
  }

  let pid = '';
  let desc = product.description || '';
  let discount = 0;
  try {
    const parsed = JSON.parse(product.description);
    if (parsed && typeof parsed === 'object') {
      if (parsed.pid) pid = parsed.pid;
      if (parsed.desc) desc = parsed.desc;
      if (parsed.discount) discount = parseFloat(parsed.discount) || 0;
    }
  } catch {
    // Product descriptions can also be plain text.
  }

  if (!pid) {
    const match = desc.match(/\[PID:\s*(PID-\d+)\]$/);
    if (match) {
      pid = match[1];
      desc = desc.replace(/\[PID:\s*(PID-\d+)\]$/, '').trim();
    } else {
      let hash = 0;
      for (let i = 0; i < product.id.length; i++) {
        hash = (hash << 5) - hash + product.id.charCodeAt(i);
        hash |= 0;
      }
      pid = `PID-${String(Math.abs(hash) % 100000).padStart(6, '0')}`;
    }
  }

  const parsedProduct = {
    ...product,
    product_id: pid,
    description: desc,
    discount,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(200,102,32,0.08),_transparent_30%),linear-gradient(180deg,_#FFFDFC_0%,_#FCF8F4_100%)] py-4 text-[#121212] sm:py-6">
      <GlassesTryOnCanvas product={parsedProduct} />
    </div>
  );
}
