import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WatchTryOnCanvas from '@/components/WatchTryOnCanvas';

interface PageProps {
  params: {
    productId: string;
  };
}

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
    description: `Virtually try on ${product.name} (watch) on your wrist using your web camera. Real-time fitting at Hariyana Watch & Opticals, Rajasthan.`,
  };
}

export default async function WatchTryOnPage({ params }: PageProps) {
  const { productId } = params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    notFound();
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error || !product) {
    console.error('Error fetching product for watch try-on page:', error);
    notFound();
  }

  if (product.category !== 'watches') {
    notFound();
  }

  return (
    <div className="bg-[#0B1422] min-h-screen py-6">
      <WatchTryOnCanvas product={product} />
    </div>
  );
}
