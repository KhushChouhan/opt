'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BRAND_LIST } from '../data/brands';
import { Brand } from '../types';
import { buildWhatsAppUrl, WHATSAPP_PRIMARY } from '../utils/whatsapp';
import { ExternalLink } from 'lucide-react';

export default function SpotlightSection() {
  return (
    <div className="w-full space-y-24 md:space-y-36 bg-[#0D0D0F]">
      {BRAND_LIST.slice(0, 3).map((brand, index) => (
        <BrandRow key={brand.id} brand={brand} index={index} />
      ))}
    </div>
  );
}

function BrandRow({ brand, index }: { brand: Brand; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  // Track scroll offsets for this specific row to apply smooth parallax zoom
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Scale from 1 to 1.06 as it moves through the viewport
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  // Main visual assets based on brand
  const brandVisualMap: Record<string, string> = {
    rayban: '/images/hero_glasses.png',
    titan: '/images/hero_watch.png',
    fastrack: '/images/hero_sunglasses.png',
  };

  const mainImage = brandVisualMap[brand.id] || '/images/hero_glasses.png';

  const handleWhatsAppInquiry = (productName: string) => {
    const text = `Hi Hariyana Watch & Opticals, I am interested in the ${brand.name} collection, specifically the "${productName}". Please let me know its availability and current store offers.`;
    const url = buildWhatsAppUrl(text, WHATSAPP_PRIMARY);
    window.open(url, '_blank');
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row items-center gap-12 md:gap-16 py-16 border-b border-white/5 last:border-b-0 ${
        isEven ? '' : 'lg:flex-row-reverse'
      }`}
    >
      {/* Editorial Branding & Image Parallax Showcase */}
      <div className="w-full lg:w-1/2 overflow-hidden rounded-2xl relative aspect-[4/3] bg-surface border border-white/10 group">
        <div className="absolute inset-0 bg-[#C9A84C]/5 z-10 pointer-events-none group-hover:bg-[#C9A84C]/0 transition-colors duration-500" />
        
        {/* Parallax Image */}
        <motion.div style={{ scale }} className="w-full h-full relative">
          <Image
            src={mainImage}
            alt={`${brand.name} featured collection`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8 transform transition-transform duration-700"
          />
        </motion.div>

        {/* Overlay brand banner */}
        <div className="absolute bottom-6 left-6 z-20 bg-charcoal/90 border border-white/15 px-4 py-2 rounded shadow-lg backdrop-blur-md">
          <span className="font-display text-2xl font-bold tracking-wider text-[#C9A84C]">
            {brand.name}
          </span>
        </div>
      </div>

      {/* Brand Copy & Featured Products Grid */}
      <div className="w-full lg:w-1/2 space-y-6 text-left">
        <div>
          <span className="text-[10px] font-bold text-[#C9A84C] tracking-[0.25em] uppercase">
            {brand.tagline}
          </span>
          <h3 className="text-3xl md:text-4xl font-bold font-display text-white mt-1 leading-tight">
            {brand.name} Collection
          </h3>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            {brand.description}
          </p>
        </div>

        {/* Brand SKUs cards list */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Featured Masterpieces
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {brand.featuredSkus.map((sku) => (
              <div
                key={sku.id}
                onClick={() => handleWhatsAppInquiry(sku.name)}
                className="bg-surface border border-white/10 hover:border-[#C9A84C]/40 p-3.5 rounded-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-black/10 rounded mb-2.5 overflow-hidden">
                  <Image
                    src={sku.image_url}
                    alt={sku.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 15vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-white leading-snug line-clamp-1 group-hover:text-[#C9A84C] transition-colors">
                    {sku.name}
                  </h5>
                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5">
                    <span className="text-[11px] font-extrabold text-[#C9A84C]">
                      ₹{sku.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      Inquire
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => handleWhatsAppInquiry(`Complete ${brand.name} catalog`)}
            className="btn-premium-gradient text-[#0D0D0F] hover:text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors border border-[#C9A84C]/25"
          >
            <span>Inquire Catalog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
