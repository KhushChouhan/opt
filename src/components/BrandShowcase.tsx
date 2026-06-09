'use client';

import React from 'react';
import { BRAND_LIST } from '../data/brands';

export default function BrandShowcase() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {BRAND_LIST.map((brand) => (
        <div
          key={brand.id}
          className="p-6 bg-surface border border-white/5 hover:border-[#C9A84C]/40 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group cursor-default relative overflow-hidden"
          style={{
            // Add subtle backlit glow using custom inline gradients for hover states
            backgroundImage: 'radial-gradient(circle at center, rgba(201, 168, 76, 0.03) 0%, transparent 70%)',
          }}
        >
          {/* Backlit Glow Hover Effect */}
          <div className="absolute inset-0 bg-radial-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
               style={{
                 backgroundImage: 'radial-gradient(circle at center, rgba(201, 168, 76, 0.08) 0%, transparent 60%)',
               }}
          />

          <span className="font-display text-xl md:text-2xl font-bold text-white group-hover:text-[#C9A84C] tracking-widest transition-colors block z-10">
            {brand.name}
          </span>
          
          <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mt-1.5 block leading-tight text-center z-10 group-hover:text-gray-300 transition-colors h-[2.5em] flex items-center justify-center">
            {brand.tagline}
          </span>
        </div>
      ))}
    </div>
  );
}
