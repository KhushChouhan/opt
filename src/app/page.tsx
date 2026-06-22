'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck, BadgeCheck, CreditCard, RefreshCw, Truck,
  Watch, Glasses, ArrowRight, ChevronLeft, ChevronRight,
  Camera, ScanFace, Heart, Star, Upload
} from 'lucide-react';
import { buildWhatsAppUrl, WHATSAPP_PRIMARY } from '@/utils/whatsapp';
import ShowroomLegacySection from '@/components/ShowroomLegacySection';

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
  { title: 'Smart Watches', image: '/images/luxury_smartwatch.png', href: '/products?category=watches' },
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
  { quote: 'Best place for premium watches and branded eyewear in Hisar. Highly recommended!', name: 'Neha Katkar', image: '/images/client_neha.png' },
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

  const [activeTryOnIndex, setActiveTryOnIndex] = useState(1);

  const handleTryOnSelect = (index: number) => {
    setActiveTryOnIndex(index);
  };

  // Parallax scrolling for hero background
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  // Framer Motion staggered animations variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className="bg-[#050c14] text-white overflow-hidden">
      {/* ============ HERO ============ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[calc(100vh-80px)] lg:h-[90vh] flex items-center bg-[#050c14]"
      >
        {/* Background Hatom Grid Overlay */}
        <div className="luxury-grid-overlay opacity-30" />

        {/* Parallax Background Image */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <Image
            src="/images/banner-background-direct.png"
            alt="Luxury chronograph watch and premium sunglasses"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
        </motion.div>

        {/* Left fade and bottom fade gradients for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050c14] via-[#050c14]/85 to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c14] via-transparent to-transparent z-0 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <span className="w-10 h-px bg-[#c7a14e]" />
              <span className="text-[11px] font-bold text-[#c7a14e] tracking-[0.35em] uppercase">Welcome to Hariyana</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="font-display font-bold leading-[1.02] mt-6 text-5xl sm:text-6xl md:text-7xl">
              <span className="block text-white">Timeless Elegance.</span>
              <span className="block text-[#c7a14e] mt-1">Perfect Vision.</span>
            </motion.h1>

            <motion.div variants={itemVariants} className="w-32 h-px bg-gradient-to-r from-[#c7a14e] to-transparent mt-7" />
            
            <motion.p variants={itemVariants} className="text-gray-300 mt-6 max-w-md leading-relaxed text-sm md:text-base font-light">
              Curated luxury timepieces and premium eyewear for those who value time, style and trust.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mt-9">
              <Link
                href="/products?category=watches"
                className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-[#c7a14e] to-[#9e782f] text-[#050c14] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_30px_rgba(199,161,78,0.45)] transition-all duration-300 transform active:scale-95"
              >
                <Watch className="w-4 h-4" /> Shop Watches
              </Link>
              <Link
                href="/products?category=glasses"
                className="group inline-flex items-center gap-2.5 border border-[#c7a14e]/40 text-[#c7a14e] px-7 py-3.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#c7a14e]/10 hover:border-[#c7a14e] transition-all duration-300 transform active:scale-95"
              >
                <Glasses className="w-4 h-4" /> Explore Frames
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20 group"
          onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-[9px] font-bold text-[#c7a14e]/60 tracking-[0.25em] uppercase group-hover:text-[#c7a14e] transition-colors duration-300">Scroll</span>
          <div className="w-5.5 h-9 rounded-full border border-[#c7a14e]/30 flex justify-center p-1.5 group-hover:border-[#c7a14e]/85 transition-colors duration-300">
            <motion.div
              animate={{
                y: [0, 11, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-1 h-1.5 rounded-full bg-[#c7a14e]"
            />
          </div>
        </motion.div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="border-y border-[#c7a14e]/15 bg-[#0b131e]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-8 md:gap-y-0 divide-y md:divide-y-0 md:divide-x divide-[#c7a14e]/15">
            {TRUST.map((t) => (
              <div key={t.title} className="flex items-center gap-3.5 justify-center px-4">
                <t.icon className="w-7 h-7 text-[#c7a14e] flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-tight">{t.title}</p>
                  <p className="text-[9.5px] text-gray-400 mt-1">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SHOP BY CATEGORY ============ */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Heading eyebrow="Shop by Category" title="Find Your Perfect Style" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                sizes="(max-width:1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050c14] via-[#050c14]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-bold text-white">{c.title}</h3>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c7a14e] mt-1.5 group-hover:gap-2.5 transition-all">
                  Explore Collection <ArrowRight className="w-4 h-4" />
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
                  <p className="text-[9.5px] font-bold text-[#c7a14e] uppercase tracking-wider mt-4 leading-tight">1. UPLOAD PHOTO</p>
                  <p className="text-[9px] text-[#B8C0CC] mt-2 leading-snug font-light max-w-[100px] sm:max-w-[120px]">Upload or take a clear photo</p>
                </div>

                {/* Connector 1 */}
                <div className="absolute top-[28px] left-[33.3%] -translate-x-1/2 w-5 sm:w-8 h-[2px] bg-[#c7a14e]/40 hidden lg:block" />

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center relative z-10 w-1/3">
                  <div className="w-14 h-14 rounded-full border border-[#c7a14e]/45 bg-[#0b131e] flex items-center justify-center text-[#c7a14e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:border-[#c7a14e]">
                    <ScanFace className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-[9.5px] font-bold text-[#c7a14e] uppercase tracking-wider mt-4 leading-tight">2. AI DETECTS FACE</p>
                  <p className="text-[9px] text-[#B8C0CC] mt-2 leading-snug font-light max-w-[100px] sm:max-w-[120px]">Our AI detects your face instantly</p>
                </div>

                {/* Connector 2 */}
                <div className="absolute top-[28px] left-[66.6%] -translate-x-1/2 w-5 sm:w-8 h-[2px] bg-[#c7a14e]/40 hidden lg:block" />

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center relative z-10 w-1/3">
                  <div className="w-14 h-14 rounded-full border border-[#c7a14e]/45 bg-[#0b131e] flex items-center justify-center text-[#c7a14e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:border-[#c7a14e]">
                    <Glasses className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-[9.5px] font-bold text-[#c7a14e] uppercase tracking-wider mt-4 leading-tight">3. SEE REAL-TIME PREVIEW</p>
                  <p className="text-[9px] text-[#B8C0CC] mt-2 leading-snug font-light max-w-[100px] sm:max-w-[120px]">Try frames in real-time before you buy</p>
                </div>

              </div>
            </div>

            {/* Column 3: Right Phone Mockup */}
            <div className="lg:col-span-3 flex justify-center w-full">
              <div className="relative w-[236px] h-[450px] rounded-[2.2rem] border-[5px] border-[#1E2A3B] bg-[#050c14] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group ring-1 ring-white/10">
                {/* Notch/Pill overlay */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-[#1E2A3B] rounded-b-xl z-20" />
                
                {/* Real Try-on Model Photo (static original image) */}
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
                    { img: '/images/hero_sunglasses.png', brand: 'RAY-BAN', model: 'Aviator', price: '₹10,990' },
                    { img: '/images/hero_glasses.png', brand: 'OAKLEY', model: 'Holbrook', price: '₹7,490' },
                    { img: '/images/luxury_optical_frames.png', brand: 'TITAN', model: 'Signature', price: '₹5,995' }
                  ].map((item, i) => {
                    const isSelected = activeTryOnIndex === i;
                    return ( 
                      <button
                        key={i}
                        onClick={() => handleTryOnSelect(i)}
                        className={`w-[70px] h-[82px] rounded bg-white flex flex-col items-center justify-between p-1.5 shadow-md transition-all duration-300 text-center outline-none ${
                          isSelected ? 'border-2 border-[#c7a14e] scale-105 shadow-lg' : 'border border-gray-200/60 opacity-90 hover:opacity-100'
                        }`}
                      >
                        {/* Small glasses image */}
                        <div className="relative w-full h-[28px] flex items-center justify-center">
                          <Image
                            src={item.img}
                            alt={item.model}
                            fill
                            className="object-contain p-0.5 filter brightness-95 pointer-events-none"
                            sizes="60px"
                          />
                        </div>
                        {/* Metadata */}
                        <div className="flex flex-col items-center justify-center text-[7px] leading-[1.1] text-gray-900 font-bold select-none text-center">
                          <span className="text-[6px] text-[#9e782f] font-extrabold uppercase tracking-wider">{item.brand}</span>
                          <span className="text-[7px] text-gray-800 font-semibold truncate max-w-[58px]">{item.model}</span>
                          <span className="text-[6.5px] text-gray-500 font-normal mt-0.5">{item.price}</span>
                        </div>
                      </button>
                    );
                  })}
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
            {BEST_SELLERS.map((p) => (
              <div
                key={p.name}
                onClick={() => inquire(`${p.brand} ${p.name}`)}
                className="cursor-pointer snap-start flex-shrink-0 w-[220px] rounded-xl border border-white/10 bg-[#0b131e]/90 hover:border-[#c7a14e]/50 hover:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300 group flex flex-col justify-between overflow-hidden"
              >
                <div className="relative aspect-square w-full bg-transparent overflow-hidden">
                  <Image 
                    src={p.image} 
                    alt={p.name} 
                    fill 
                    sizes="220px" 
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-4 pt-0">
                  <p className="text-[11px] font-semibold text-white uppercase tracking-wider">{p.brand}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-normal truncate">{p.name}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs font-semibold text-white">₹{p.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Heart click action
                      }}
                      aria-label="Add to wishlist"
                      className="text-[#c7a14e] hover:text-white transition-colors p-1"
                    >
                      <Heart className="w-3.5 h-3.5 fill-none" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            <div key={r.name} className="rounded-xl border border-white/10 bg-[#0b131e]/90 p-5 sm:p-6 flex items-center gap-4 sm:gap-5 hover:border-[#c7a14e]/35 hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300">
              {/* Profile Image with Gold Ring */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#c7a14e]/40 p-1 flex-shrink-0">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={r.image}
                    alt={r.name}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#c7a14e] text-[#c7a14e]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <p className="text-xs sm:text-sm font-semibold text-white/95 mt-2">
                  &mdash; {r.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
