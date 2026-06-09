'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UGC_LIST } from '../data/ugc';
// Using inline SVG instead of Instagram from lucide-react to support older package versions

export default function UGCStrip() {
  return (
    <div className="w-full">
      {/* Scrollable container on mobile, grid on desktop */}
      <div 
        className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {UGC_LIST.map((tile) => (
          <div
            key={tile.id}
            className="min-w-[240px] md:min-w-0 snap-align-start snap-always relative aspect-square bg-surface border border-white/10 rounded-xl overflow-hidden group"
          >
            {/* Customer Photo */}
            <Image
              src={tile.imageSrc}
              alt={`Customer style showcase featuring ${tile.productName}`}
              fill
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Always visible header overlay */}
            <div className="absolute top-3 left-3 z-10 bg-black/60 border border-white/10 px-2 py-0.5 rounded flex items-center space-x-1.5 backdrop-blur-sm">
              <svg 
                className="w-3 h-3 text-[#C9A84C]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span className="text-[10px] font-bold text-white font-sans tracking-wide">
                {tile.customerName}
              </span>
            </div>

            {/* Hover visual details wrapper (opacity-0 to opacity-100) */}
            <div className="absolute inset-0 bg-charcoal/85 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
              <div className="space-y-2.5 translate-y-4 group-hover:translate-y-0 focus-within:translate-y-0 transition-transform duration-300">
                <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest block">
                  Featured Product
                </span>
                <h4 className="text-xs font-bold text-white leading-tight font-display">
                  {tile.productName}
                </h4>
                
                <Link
                  href={tile.productHref}
                  className="inline-flex items-center justify-center w-full py-1.5 bg-[#C9A84C] text-[#0D0D0F] hover:bg-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                  tabIndex={0}
                >
                  Shop This Look
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
