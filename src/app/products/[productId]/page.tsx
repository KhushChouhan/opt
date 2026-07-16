'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, Camera, RefreshCw, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import CheckoutModal from '@/components/CheckoutModal';

interface ProductDetails {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  brand?: string;
  rating?: number | string;
  stock?: number;
  discount?: number;
  error?: string;
}

function getDisplayDescription(description?: string) {
  if (!description) return '';

  try {
    const parsed = JSON.parse(description);
    if (typeof parsed === 'string') return getDisplayDescription(parsed);
    if (parsed && typeof parsed === 'object') {
      return String(parsed.desc || parsed.description || '').trim();
    }
  } catch {
    return description.replace(/^\[Category:\s*.*?\]\s*/i, '').trim();
  }

  return description.trim();
}

export default function ProductDetailsPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const { data: product, error, isLoading } = useSWR<ProductDetails>(productId ? `/api/products/${productId}` : null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#FCF8F4]">
        <RefreshCw className="h-7 w-7 animate-spin text-[#C86620]" />
        <p className="text-[12px] font-semibold text-[#645D56]">Loading product details...</p>
      </div>
    );
  }

  if (error || !product || product.error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 bg-[#FCF8F4] px-5 text-center">
        <h1 className="font-serif text-3xl font-bold text-[#062C1C]">Product not found</h1>
        <p className="max-w-md text-sm text-[#645D56]">This watch is currently unavailable. Browse the complete luxury watch collection instead.</p>
        <Link href="/products?category=watches" data-bump="true" className="rounded-[6px] bg-[#062C1C] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-white">View All Watches</Link>
      </div>
    );
  }

  const finalPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;
  const image = product.image_url || '/images/premium_redesign/category_watches_reference.png';
  const isWatch = product.category === 'watches';
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const displayDescription = getDisplayDescription(product.description);

  return (
    <div className="bg-[#FCF8F4] px-4 py-7 sm:px-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/#luxury-watches" className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B625A] transition-colors hover:text-[#C86620]">
          <ArrowLeft className="h-4 w-4" /> Back to Luxury Watches
        </Link>

        <article className="grid overflow-hidden rounded-[20px] border border-[#E5D7CA] bg-white shadow-[0_18px_55px_rgba(75,46,25,0.09)] md:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[380px] bg-gradient-to-br from-[#FBF1E8] via-[#F8EDE3] to-[#EEE0D2] sm:min-h-[500px] lg:min-h-[620px]">
            <Image src={image} alt={product.name} fill priority sizes="(max-width: 767px) 100vw, 55vw" className="object-contain p-8 mix-blend-multiply sm:p-12" />
          </div>

          <div className="flex flex-col p-6 sm:p-9 lg:p-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C86620]">{product.brand || 'Luxury Watch'}</p>
            <h1 className="mt-3 font-serif text-[34px] font-bold leading-[1.05] text-[#111] sm:text-[44px]">{product.name}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-[25px] font-extrabold text-[#062C1C]">₹{finalPrice.toLocaleString('en-IN')}</span>
              {product.discount ? <span className="text-[13px] text-[#777] line-through">₹{product.price.toLocaleString('en-IN')}</span> : null}
              {product.discount ? <span className="rounded-full bg-[#E7F3EC] px-2.5 py-1 text-[10px] font-bold text-[#17663D]">{product.discount}% OFF</span> : null}
              <span className="flex items-center gap-1 rounded-full bg-[#F5E5D6] px-2.5 py-1 text-[10px] font-bold text-[#A5531B]"><Star className="h-3 w-3 fill-current" /> {product.rating || '4.8'}</span>
            </div>

            <p className="mt-6 text-[13px] leading-[1.8] text-[#5A554F]">
              {displayDescription || 'A refined premium timepiece crafted for everyday elegance, reliable performance and lasting comfort.'}
            </p>

            <div className="mt-7 grid grid-cols-3 gap-2 border-y border-[#E5D7CA] py-5">
              <span className="flex flex-col items-center gap-1.5 text-center text-[9px] font-semibold text-[#49433D]"><ShieldCheck className="h-6 w-6 text-[#C86620]" /> 100% Authentic</span>
              <span className="flex flex-col items-center gap-1.5 text-center text-[9px] font-semibold text-[#49433D]"><RotateCcw className="h-6 w-6 text-[#C86620]" /> Easy Returns</span>
              <span className="flex flex-col items-center gap-1.5 text-center text-[9px] font-semibold text-[#49433D]"><Truck className="h-6 w-6 text-[#C86620]" /> Free Delivery</span>
            </div>

            <div className="mt-auto grid grid-cols-1 gap-3 pt-8 sm:grid-cols-2">
              {isWatch ? (
                <Link href={`/try-on/watches/${product.id}`} data-bump="true" className="flex h-12 items-center justify-center gap-2 rounded-[6px] border border-[#062C1C] bg-white text-[10px] font-bold uppercase tracking-[0.08em] text-[#062C1C]">
                  <Camera className="h-4 w-4" /> Try On Watch
                </Link>
              ) : null}
              <button type="button" disabled={isOutOfStock} onClick={() => setIsCheckoutOpen(true)} className="flex h-12 items-center justify-center gap-2 rounded-[6px] bg-[#062C1C] text-[10px] font-bold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:bg-[#9B958F]">
                <ShoppingBag className="h-4 w-4" /> {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
          </div>
        </article>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={{ id: product.id, name: product.name, price: finalPrice }}
      />
    </div>
  );
}
