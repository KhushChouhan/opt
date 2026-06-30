/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import {
  ShieldCheck, BadgeCheck, CreditCard, RefreshCw, Truck,
  Watch, Glasses, ArrowRight, ChevronLeft, ChevronRight,
  Camera, ScanFace, Star, Upload, ShoppingCart
} from 'lucide-react';
import { buildWhatsAppUrl, WHATSAPP_PRIMARY } from '@/utils/whatsapp';
import ShowroomLegacySection from '@/components/ShowroomLegacySection';
import CheckoutModal from '@/components/CheckoutModal';

/* ---------------- Section heading ---------------- */
function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mb-8">
      <span className="text-[11px] font-bold text-[#c7a14e] tracking-[0.3em] uppercase">{eyebrow}</span>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-2">{title}</h2>
      <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#c7a14e] to-transparent mx-auto mt-5" />
    </div>
  );
}

/* ---------------- Data ---------------- */
const TRUST = [
  { icon: ShieldCheck, title: '100% Authentic', sub: 'Original Products' },
  { icon: BadgeCheck, title: '1 Year Warranty', sub: 'On All Watches' },
  { icon: CreditCard, title: 'Secure Payment', sub: 'Protected Checkout' },
  { icon: RefreshCw, title: 'Easy Returns', sub: '7 Days Return Policy' },
  { icon: Truck, title: 'Free Shipping', sub: 'Above ₹1999' },
];

const CATEGORIES = [
  { title: 'Watches', image: '/images/luxury_watches.png', href: '/products?category=watches' },
  { title: 'Smart Watches', image: '/images/luxury_smartwatch.png', href: '/products?category=smart-watches' },
  { title: 'Sunglasses', image: '/images/luxury_sunglasses.png', href: '/products?category=sunglasses' },
  { title: 'Optical Frames', image: '/images/luxury_optical_frames.png', href: '/products?category=glasses' },
  { title: 'Perfumes', image: '/images/luxury_perfumes.png', href: '/products?category=perfumes' },
  { title: 'Belts', image: '/images/luxury_belts.png', href: '/products?category=belts' },
  { title: 'Wallets', image: '/images/luxury_wallets.png', href: '/products?category=wallets' },
  { title: 'Accessories', image: '/images/luxury_accessories.png', href: '/products?category=accessories' },
];

const BEST_SELLERS = [
  { brand: 'Titan', name: 'Chronograph Green Dial', price: 14995, image: '/images/hero_watch.png', category: 'watches' },
  { brand: 'Ray-Ban', name: 'Aviator Classic', price: 10990, image: '/images/hero_sunglasses.png', category: 'sunglasses' },
  { brand: 'Fossil', name: 'Grant Chronograph', price: 12995, image: '/images/luxury_watches.png', category: 'watches' },
  { brand: 'Oakley', name: 'Rectangular Frame', price: 7490, image: '/images/hero_glasses.png', category: 'glasses' },
  { brand: 'Seiko', name: 'Presage Automatic', price: 43500, image: '/images/luxury_watches.png', category: 'watches' },
  { brand: 'Fastrack', name: 'Wayfarer Frame', price: 3995, image: '/images/luxury_sunglasses.png', category: 'sunglasses' },
];

const REVIEWS = [
  { quote: 'Excellent collection and genuine products. The staff is very helpful and knowledgeable.', name: 'Rajat Verma', image: '/images/client_rajat.png' },
  { quote: 'Best place for premium watches and branded eyewear in Hanumangarh. Highly recommended!', name: 'Neha Katkar', image: '/images/client_neha.png' },
  { quote: 'Great experience! Got my perfect pair with their free eye test and expert guidance.', name: 'Amit Saini', image: '/images/client_amit.png' },
];

const inquire = (item: string) => {
  const url = buildWhatsAppUrl(
    `Hi Hariyana Watch & Opticals, I'm interested in "${item}". Please share availability and best price.`,
    WHATSAPP_PRIMARY,
  );
  window.open(url, '_blank');
};

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  // SWR products fetching for live best sellers
  const { data: products } = useSWR<any[]>('/api/products');
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fallback to static list if SWR hasn't resolved yet
  const bestSellersList = products && products.length > 0
    ? products.filter(p => ['watches', 'sunglasses', 'glasses'].includes(p.category)).slice(0, 6)
    : BEST_SELLERS.map((p, idx) => ({
        id: `mock-${idx}`,
        name: p.name,
        brand: p.brand,
        price: p.price,
        image_url: p.image,
        category: p.category,
        description: `${p.brand} premium product.`,
        stock: 5
      }));

  return (
    <div className="bg-[#050c14] text-white overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden min-h-[540px] md:min-h-[660px] flex items-center">
        {/* Background banner (combined watch + sunglasses + gears) */}
        <Image
          src="/images/banner-background-direct.png"
          alt="Luxury chronograph watch and premium sunglasses"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center] md:object-right transition-all duration-700"
        />
        {/* Left fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050c14] via-[#050c14]/90 sm:via-[#050c14]/70 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c14] via-transparent to-transparent z-0" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="w-10 h-px bg-[#c7a14e]" />
              <span className="text-[11px] font-bold text-[#c7a14e] tracking-[0.35em] uppercase">Welcome to Hariyana</span>
            </div>
            <h1 className="font-display font-bold leading-[1.02] mt-6 text-5xl sm:text-6xl md:text-7xl">
              <span className="block text-white">Timeless Elegance.</span>
              <span className="block text-[#c7a14e]">Perfect Vision.</span>
            </h1>
            <div className="w-32 h-px bg-gradient-to-r from-[#c7a14e] to-transparent mt-7" />
            <p className="text-gray-300 mt-6 max-w-md leading-relaxed">
              Curated luxury timepieces and premium eyewear for those who value time, style and trust.
            </p>
            <div className="flex flex-wrap gap-4 mt-9">
              <Link
                href="/products?category=watches"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c7a14e] to-[#9e782f] text-[#050c14] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider hover:brightness-110 hover:shadow-[0_0_25px_rgba(199,161,78,0.35)] transition-all"
              >
                <Watch className="w-4 h-4" /> Shop Watches
              </Link>
              <Link
                href="/products?category=glasses"
                className="inline-flex items-center gap-2 border border-[#c7a14e]/50 text-[#c7a14e] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#c7a14e]/10 transition-all"
              >
                <Glasses className="w-4 h-4" /> Explore Frames
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="border-y border-[#c7a14e]/15 bg-[#0b131e]/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TRUST.map((t, idx) => (
              <div 
                key={t.title} 
                className={`flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left justify-center sm:justify-start p-4 rounded-xl border border-white/5 bg-[#0b131e]/30 hover:border-[#c7a14e]/20 transition-all duration-300 ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <t.icon className="w-8 h-8 text-[#c7a14e] flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider leading-tight">{t.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SHOP BY CATEGORY ============ */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Heading eyebrow="Shop by Category" title="Find Your Perfect Style" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 hover:border-[#c7a14e]/50 transition-all duration-300"
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050c14] via-[#050c14]/75 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-20">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-normal tracking-wide drop-shadow-md pb-0.5">{c.title}</h3>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#c7a14e] mt-1 group-hover:gap-2.5 transition-all drop-shadow-sm">
                  Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ VIRTUAL TRY-ON ============ */}
      <section className="bg-[#050c14] border-y border-[#c7a14e]/15 py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-y-12 lg:gap-y-0 lg:gap-x-8">
            
            {/* Column 1: Left Content & CTA */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">Try Before You Buy</span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-[42px] font-bold text-white mt-3 leading-none tracking-wide">VIRTUAL TRY-ON</h2>
              <p className="text-xs text-[#B8C0CC] mt-4 leading-relaxed max-w-xs font-light">
                See how frames look on you in real-time with our advanced AI technology.
              </p>
              <Link
                href="/products?category=glasses"
                className="inline-flex items-center gap-2.5 mt-8 bg-[#c7a14e] text-[#050c14] px-7 py-3.5 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-[#e8d9a0] transition-colors shadow-[0_4px_25px_rgba(199,161,78,0.25)]"
              >
                <Camera className="w-4 h-4" /> TRY ON NOW
              </Link>
            </div>

            {/* Column 2: Steps Container */}
            <div className="lg:col-span-5 w-full">
              <div className="relative flex flex-row items-start justify-between w-full px-2 sm:px-6">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center relative z-10 w-1/3">
                  <div className="w-14 h-14 rounded-full border border-[#c7a14e]/45 bg-[#0b131e] flex items-center justify-center text-[#c7a14e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:border-[#c7a14e]">
                    <Upload className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-[11px] sm:text-[13px] font-bold text-[#c7a14e] uppercase tracking-wider mt-4 leading-tight">1. UPLOAD PHOTO</p>
                  <p className="text-[10.5px] sm:text-[12px] text-[#B8C0CC] mt-2 leading-snug font-light max-w-[100px] sm:max-w-[120px]">Upload or take a clear photo</p>
                </div>

                {/* Connector 1 */}
                <div className="absolute top-[28px] left-[33.3%] -translate-x-1/2 w-5 sm:w-8 h-[2px] bg-[#c7a14e]/40 hidden lg:block" />

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center relative z-10 w-1/3">
                  <div className="w-14 h-14 rounded-full border border-[#c7a14e]/45 bg-[#0b131e] flex items-center justify-center text-[#c7a14e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:border-[#c7a14e]">
                    <ScanFace className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-[11px] sm:text-[13px] font-bold text-[#c7a14e] uppercase tracking-wider mt-4 leading-tight">2. AI DETECTS FACE</p>
                  <p className="text-[10.5px] sm:text-[12px] text-[#B8C0CC] mt-2 leading-snug font-light max-w-[100px] sm:max-w-[120px]">Our AI detects your face instantly</p>
                </div>

                {/* Connector 2 */}
                <div className="absolute top-[28px] left-[66.6%] -translate-x-1/2 w-5 sm:w-8 h-[2px] bg-[#c7a14e]/40 hidden lg:block" />

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center relative z-10 w-1/3">
                  <div className="w-14 h-14 rounded-full border border-[#c7a14e]/45 bg-[#0b131e] flex items-center justify-center text-[#c7a14e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:border-[#c7a14e]">
                    <Glasses className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-[11px] sm:text-[13px] font-bold text-[#c7a14e] uppercase tracking-wider mt-4 leading-tight">3. SEE REAL-TIME PREVIEW</p>
                  <p className="text-[10.5px] sm:text-[12px] text-[#B8C0CC] mt-2 leading-snug font-light max-w-[100px] sm:max-w-[120px]">Try frames in real-time before you buy</p>
                </div>

              </div>
            </div>

            {/* Column 3: Right Phone Mockup */}
            <div className="lg:col-span-3 flex justify-center w-full">
              <div className="relative w-[236px] h-[450px] rounded-[2.2rem] border-[5px] border-[#1E2A3B] bg-[#050c14] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group ring-1 ring-white/10">
                {/* Notch/Pill overlay */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-[#1E2A3B] rounded-b-xl z-20" />
                
                {/* Real Try-on Model Photo */}
                <Image
                  src="/images/tryon_model.png"
                  alt="Virtual Try-On Model"
                  fill
                  className="object-cover object-center"
                  sizes="230px"
                  priority
                />

                {/* Glasses Selector Overlays at bottom */}
                <div className="absolute bottom-4 left-0 right-0 px-2 flex justify-center gap-1.5 z-20">
                  {[
                    { img: '/images/hero_sunglasses.png', brand: 'RAY-BAN', model: 'Aviator', price: '₹10,990', active: false },
                    { img: '/images/hero_glasses.png', brand: 'OAKLEY', model: 'Holbrook', price: '₹7,490', active: true },
                    { img: '/images/luxury_optical_frames.png', brand: 'TITAN', model: 'Signature', price: '₹5,995', active: false }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`w-[70px] h-[82px] rounded bg-white flex flex-col items-center justify-between p-1.5 shadow-md transition-all duration-300 ${
                        item.active ? 'border-2 border-[#c7a14e] scale-105 shadow-lg' : 'border border-gray-200/60 opacity-90'
                      }`}
                    >
                      {/* Small glasses image */}
                      <div className="relative w-full h-[28px] flex items-center justify-center">
                        <Image
                          src={item.img}
                          alt={item.model}
                          fill
                          className="object-contain p-0.5 filter brightness-95"
                          sizes="60px"
                        />
                      </div>
                      {/* Metadata */}
                      <div className="flex flex-col items-center justify-center text-[7px] leading-[1.1] text-gray-900 font-bold select-none text-center">
                        <span className="text-[6px] text-[#9e782f] font-extrabold uppercase tracking-wider">{item.brand}</span>
                        <span className="text-[7px] text-gray-800 font-semibold truncate max-w-[58px]">{item.model}</span>
                        <span className="text-[6.5px] text-gray-500 font-normal mt-0.5">{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============ BEST SELLERS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Heading eyebrow="Best Sellers" title="Our Most Loved Picks" />
        <div className="relative">
          <button
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0b131e] border border-[#c7a14e]/30 items-center justify-center text-[#c7a14e] hover:bg-[#c7a14e] hover:text-[#050c14] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 snap-x"
            style={{ scrollbarWidth: 'none' }}
          >
            {bestSellersList.map((p: any) => {
              const actualBrand = p.brand || p.name.split(' ')[0];
              const actualName = p.name;
              const hasTryOn = ['glasses', 'sunglasses', 'watches'].includes(p.category);
              const tryOnLink = p.category === 'watches'
                ? `/try-on/watches/${p.id}`
                : `/try-on/glasses/${p.id}`;

              return (
                <div
                  key={p.id}
                  className="snap-start flex-shrink-0 w-[240px] rounded-xl border border-white/10 bg-[#0b131e]/90 hover:border-[#c7a14e]/50 hover:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300 group flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative aspect-square w-full bg-transparent overflow-hidden">
                    <Image 
                      src={p.image_url} 
                      alt={p.name} 
                      fill 
                      sizes="240px" 
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-4 pt-0 flex flex-col justify-between flex-grow">
                    <div>
                      <p className="text-[11px] font-semibold text-[#c7a14e] uppercase tracking-wider">{actualBrand}</p>
                      <p className="text-[12px] text-white mt-0.5 font-bold truncate leading-snug line-clamp-1">{actualName}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">₹{Math.round(p.price * 0.8).toLocaleString('en-IN')}</span>
                        <span className="text-[9px] text-[#c7a14e] uppercase tracking-widest font-semibold">{p.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px]">
                        <span className="text-gray-500 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-[#25D366] font-bold">20% Off</span>
                      </div>
                    </div>
                    
                    <div className="mt-3.5 space-y-1.5">
                      {!p.id.startsWith('mock-') ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCheckoutProduct({ id: p.id, name: p.name, price: Math.round(p.price * 0.8) });
                            setIsCheckoutOpen(true);
                          }}
                          className="w-full py-2 bg-[#c7a14e] text-[#050c14] hover:bg-[#e8d9a0] text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 shadow-md"
                        >
                          <ShoppingCart className="w-3 h-3" /> Buy Now
                        </button>
                      ) : (
                        <button
                          onClick={() => inquire(`${actualBrand} ${actualName}`)}
                          className="w-full py-2 bg-[#c7a14e] text-[#050c14] hover:bg-[#e8d9a0] text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 shadow-md"
                        >
                          Buy on WhatsApp
                        </button>
                      )}
                      
                      {hasTryOn && !p.id.startsWith('mock-') && (
                        <Link
                          href={tryOnLink}
                          className="block w-full py-1.5 border border-[#c7a14e]/30 text-gray-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded text-center transition-colors hover:bg-[#c7a14e]/10"
                        >
                          Try On AR
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0b131e] border border-[#c7a14e]/30 items-center justify-center text-[#c7a14e] hover:bg-[#c7a14e] hover:text-[#050c14] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
      {/* ============ SHOWROOM & LEGACY SECTIONS ============ */}
      <ShowroomLegacySection />

      {/* ============ TESTIMONIALS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Heading eyebrow="What Our Customers Say" title="Trusted By Thousands" />
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-xl border border-white/10 bg-[#0b131e]/90 p-6 flex flex-col justify-between hover:border-[#c7a14e]/35 hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 min-h-[160px]">
              <div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c7a14e] text-[#c7a14e]" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-light italic">
                  &ldquo;{r.quote}&rdquo;
                </p>
              </div>
              <p className="text-sm font-semibold text-white/95 mt-4 pt-3 border-t border-white/5">
                &mdash; {r.name}
              </p>
            </div>
          ))}
        </div>
      </section>



      {/* Checkout Modal Dialog */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
      />

    </div>
  );
}
