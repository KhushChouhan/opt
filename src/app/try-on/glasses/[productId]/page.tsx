import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GlassesTryOnCanvas from '@/components/GlassesTryOnCanvas';

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

  return (
    <div className="bg-[#0B1422] min-h-screen py-6">
      <GlassesTryOnCanvas product={product} />
    </div>
  );
}
