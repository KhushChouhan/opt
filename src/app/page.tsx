'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck, BadgeCheck, CreditCard, RefreshCw, Truck,
  Watch, Glasses, Eye, ArrowRight, ChevronLeft, ChevronRight,
  Camera, ScanFace, Sparkles, Heart, Star, MapPin, Navigation, Gem,
} from 'lucide-react';
import { Instagram } from '@/components/icons/Social';
import { buildWhatsAppUrl, WHATSAPP_PRIMARY } from '@/utils/whatsapp';

const STORE_ADDRESS = 'Hariyana Watch & Opticals, SCO 25, Sector 14, Hisar, Haryana 125001';
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS)}`;

/* ---------------- Section heading ---------------- */
function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mb-12">
      <span className="text-[11px] font-bold text-[#C9A84C] tracking-[0.3em] uppercase">{eyebrow}</span>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-2">{title}</h2>
      <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto mt-5" />
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
  { title: 'Watches', image: '/images/watches.png', href: '/products?category=watches' },
  { title: 'Smart Watches', image: '/images/smart-watche.png', href: '/products?category=watches' },
  { title: 'Sunglasses', image: '/images/sunglasses.png', href: '/products?category=sunglasses' },
  { title: 'Optical Frames', image: '/images/optical-frames.png', href: '/products?category=glasses' },
];

const BEST_SELLERS = [
  { brand: 'Titan', name: 'Chronograph Green Dial', price: 14995, image: '/images/hero_watch.png', category: 'watches' },
  { brand: 'Ray-Ban', name: 'Aviator Classic', price: 10990, image: '/images/hero_sunglasses.png', category: 'sunglasses' },
  { brand: 'Fossil', name: 'Grant Chronograph', price: 12995, image: '/images/hero_watch.png', category: 'watches' },
  { brand: 'Oakley', name: 'Rectangular Frame', price: 7490, image: '/images/hero_glasses.png', category: 'glasses' },
  { brand: 'Seiko', name: 'Presage Automatic', price: 43500, image: '/images/hero_watch.png', category: 'watches' },
  { brand: 'Fastrack', name: 'Wayfarer Frame', price: 3995, image: '/images/hero_sunglasses.png', category: 'sunglasses' },
];

const BRANDS = ['Titan', 'Ray-Ban', 'Fossil', 'Fastrack', 'Seiko', 'Casio', 'Police'];

const TRYON_STEPS = [
  { n: '1', icon: Camera, title: 'Upload Photo', sub: 'Upload or take a clear photo' },
  { n: '2', icon: ScanFace, title: 'AI Detects Face', sub: 'Our AI detects your face instantly' },
  { n: '3', icon: Sparkles, title: 'See Real-Time Preview', sub: 'Try frames in real-time before you buy' },
];

const STATS = [
  { value: '25+', label: 'Years of Trust' },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Top Brands' },
  { value: '100%', label: 'Authenticity' },
];

const STORE_FEATURES = [
  { icon: Eye, title: 'Free Eye Test', sub: 'By Expert Optometrists' },
  { icon: Gem, title: 'Personalized Styling', sub: 'Find Your Perfect Look' },
  { icon: Sparkles, title: 'Premium Experience', sub: 'Luxury Redefined' },
];

const REVIEWS = [
  { quote: 'Excellent collection and genuine products. The staff is very helpful and knowledgeable.', name: 'Rajeev Verma' },
  { quote: 'Best place for premium watches and branded eyewear in Hisar. Highly recommended!', name: 'Neha Katkar' },
  { quote: 'Great experience! Got my perfect pair with their free eye test and expert guidance.', name: 'Amit Saini' },
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

  return (
    <div className="bg-[#0A0F18] text-white overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden min-h-[540px] md:min-h-[660px] flex items-center">
        {/* Background banner (combined watch + sunglasses + gears) */}
        <Image
          src="/images/banner-background-direct.png"
          alt="Luxury chronograph watch and premium sunglasses"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Left fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F18] via-[#0A0F18]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F18]/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="w-10 h-px bg-[#C9A84C]" />
              <span className="text-[11px] font-bold text-[#C9A84C] tracking-[0.35em] uppercase">Welcome to Hariyana</span>
            </div>
            <h1 className="font-display font-bold leading-[1.02] mt-6 text-5xl sm:text-6xl md:text-7xl">
              <span className="block text-white">Timeless Elegance.</span>
              <span className="block text-[#C9A84C]">Perfect Vision.</span>
            </h1>
            <div className="w-32 h-px bg-gradient-to-r from-[#C9A84C] to-transparent mt-7" />
            <p className="text-gray-300 mt-6 max-w-md leading-relaxed">
              Curated luxury timepieces and premium eyewear for those who value time, style and trust.
            </p>
            <div className="flex flex-wrap gap-4 mt-9">
              <Link
                href="/products?category=watches"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#A07A2A] text-[#0A0F18] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider hover:brightness-110 hover:shadow-[0_0_25px_rgba(201,168,76,0.35)] transition-all"
              >
                <Watch className="w-4 h-4" /> Shop Watches
              </Link>
              <Link
                href="/products?category=glasses"
                className="inline-flex items-center gap-2 border border-[#C9A84C]/50 text-[#C9A84C] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#C9A84C]/10 transition-all"
              >
                <Glasses className="w-4 h-4" /> Explore Frames
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="border-y border-[#C9A84C]/15 bg-[#0F1B30]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {TRUST.map((t) => (
              <div key={t.title} className="flex items-center gap-3 justify-center md:justify-start">
                <t.icon className="w-7 h-7 text-[#C9A84C] flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{t.title}</p>
                  <p className="text-[10px] text-gray-400">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SHOP BY CATEGORY ============ */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Heading eyebrow="Shop by Category" title="Find Your Perfect Style" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 hover:border-[#C9A84C]/50 transition-all duration-300"
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(max-width:1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F18] via-[#0A0F18]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-bold text-white">{c.title}</h3>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A84C] mt-1.5 group-hover:gap-2.5 transition-all">
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ VIRTUAL TRY-ON ============ */}
      <section className="bg-[#0F1B30]/50 border-y border-[#C9A84C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[11px] font-bold text-[#C9A84C] tracking-[0.3em] uppercase">Try Before You Buy</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Virtual Try-On</h2>
              <p className="text-gray-400 mt-4 max-w-md leading-relaxed">
                See how frames look on you in real-time with our advanced AI technology.
              </p>
              <Link
                href="/products?category=glasses"
                className="inline-flex items-center gap-2 mt-7 bg-gradient-to-r from-[#C9A84C] to-[#A07A2A] text-[#0A0F18] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all"
              >
                <Camera className="w-4 h-4" /> Try On Now
              </Link>

              <div className="grid sm:grid-cols-3 gap-6 mt-10">
                {TRYON_STEPS.map((s) => (
                  <div key={s.n}>
                    <div className="w-12 h-12 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] mb-3">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-wider">{s.n}. {s.title}</p>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* phone mock */}
            <div className="flex justify-center">
              <div className="relative w-60 h-[460px] rounded-[2.5rem] border-4 border-[#1A2742] bg-[#0A0F18] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1A2742] rounded-b-2xl z-20" />
                <div className="relative h-full w-full bg-gradient-to-b from-[#1A2742] to-[#0A0F18] flex flex-col items-center justify-center">
                  <div className="scanline" />
                  <div className="w-28 h-28 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                    <ScanFace className="w-14 h-14 text-[#C9A84C]/70" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">Face detected</p>
                  <div className="flex gap-2 mt-6">
                    {['hero_glasses', 'hero_sunglasses', 'hero_glasses'].map((g, i) => (
                      <div key={i} className="relative w-14 h-10 rounded-md bg-white/5 border border-white/10">
                        <Image src={`/images/${g}.png`} alt="frame option" fill sizes="56px" className="object-contain p-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BEST SELLERS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Heading eyebrow="Best Sellers" title="Our Most Loved Picks" />
        <div className="relative">
          <button
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0F1B30] border border-[#C9A84C]/30 items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0F18] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 snap-x"
            style={{ scrollbarWidth: 'none' }}
          >
            {BEST_SELLERS.map((p) => (
              <div
                key={p.name}
                className="snap-start flex-shrink-0 w-[230px] rounded-2xl border border-white/10 bg-[#0F1B30] hover:border-[#C9A84C]/50 transition-all duration-300 group"
              >
                <div className="relative aspect-square bg-[#0A0F18] rounded-t-2xl overflow-hidden">
                  <Image src={p.image} alt={p.name} fill sizes="230px" className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                  <button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0A0F18]/70 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#C9A84C] transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest">{p.brand}</p>
                  <h3 className="text-sm font-semibold text-white mt-1 leading-snug">{p.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-bold text-white">₹{p.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => inquire(`${p.brand} ${p.name}`)}
                      className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider hover:text-white transition-colors"
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0F1B30] border border-[#C9A84C]/30 items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0F18] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ============ BRAND STRIP ============ */}
      <section id="brands" className="border-y border-[#C9A84C]/15 bg-[#0F1B30]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {BRANDS.map((b) => (
              <span key={b} className="font-display text-xl md:text-2xl font-bold text-gray-400 hover:text-[#C9A84C] tracking-wider transition-colors cursor-default">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LEGACY OF TRUST ============ */}
      <section id="about" className="relative">
        <div className="absolute inset-0 opacity-[0.06]">
          <Image src="/images/store_map.png" alt="" fill className="object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#C9A84C]/20 bg-gradient-to-br from-[#1A2742] to-[#0A0F18] flex items-center justify-center">
              <Image src="/images/logo-dark.png" alt="Hariyana flagship store" width={565} height={441} className="h-40 w-auto opacity-90" />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded bg-[#0A0F18]/80 border border-[#C9A84C]/20 text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">
                Flagship Store · Hisar
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#C9A84C] tracking-[0.3em] uppercase">Since 1998</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3 leading-tight">
                A Legacy of Trust<br />Crafted Over Time
              </h2>
              <p className="text-gray-400 mt-4 leading-relaxed max-w-lg">
                For over 25 years, Hariyana Watch &amp; Opticals has been Haryana&apos;s most trusted destination for luxury watches and premium eyewear.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-9">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl md:text-3xl font-bold text-[#C9A84C]">{s.value}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/#contact" className="inline-flex items-center gap-1.5 mt-8 text-xs font-bold text-[#C9A84C] uppercase tracking-wider hover:gap-2.5 transition-all">
                Know More About Us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VISIT STORE ============ */}
      <section id="contact" className="relative bg-[#0F1B30] border-y border-[#C9A84C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="text-[11px] font-bold text-[#C9A84C] tracking-[0.3em] uppercase">Visit Our Flagship Store</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Experience Luxury In Person</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {STORE_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C] flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-10 pt-8 border-t border-white/10">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                Hariyana Watch &amp; Opticals<br />
                <span className="text-gray-400">SCO 25, Sector 14, Hisar, Haryana 125001</span>
              </p>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#A07A2A] text-[#0A0F18] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all w-full sm:w-auto"
            >
              <Navigation className="w-4 h-4" /> Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Heading eyebrow="What Our Customers Say" title="Trusted By Thousands" />
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-2xl border border-white/10 bg-[#0F1B30] p-7">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] font-bold text-sm">
                  {r.name.charAt(0)}
                </div>
                <p className="text-sm font-semibold text-white">— {r.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ INSTAGRAM STRIP ============ */}
      <section className="border-t border-[#C9A84C]/15 bg-[#0F1B30]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-gray-300 mb-6">
            <Instagram className="w-5 h-5 text-[#C9A84C]" />
            <span className="text-sm">Follow us on Instagram</span>
            <span className="font-display text-lg font-bold text-[#C9A84C]">@hariyana.watch.opticals</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              '/images/hero_watch.png', '/images/hero_sunglasses.png', '/images/hero_glasses.png',
              '/images/hero_watch.png', '/images/hero_sunglasses.png', '/images/hero_glasses.png',
            ].map((src, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#0A0F18] group"
              >
                <Image src={src} alt="Instagram post" fill sizes="(max-width:640px) 33vw, 16vw" className="object-contain p-3 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#C9A84C]/0 group-hover:bg-[#C9A84C]/10 transition-colors flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
