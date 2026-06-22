'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Camera } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Product } from '../types';
import { useCompare } from '../context/CompareContext';

interface ProductCardProps {
  product: Product;
  onQuickBuy: (product: Product) => void;
}

export default function ProductCard({ product, onQuickBuy }: ProductCardProps) {
  const { compareList, addToCompare, removeFromCompare } = useCompare();
  const isCompared = compareList.some((item) => item.id === product.id);

  const handleCompareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      addToCompare(product);
    } else {
      removeFromCompare(product.id);
    }
  };

  const isOutofStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;

  // Strikethrough MRP placeholder calculation if not present
  const mrp = product.mrp || Math.round(product.price * 1.25);

  const tryOnLink = product.category === 'watches'
    ? `/try-on/watches/${product.id}`
    : `/try-on/glasses/${product.id}`;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="bg-surface border border-white/5 hover:border-[#C9A84C]/45 transition-all duration-500 flex flex-col justify-between group h-full relative overflow-hidden">
        
        {/* Soft Golden Backlit Glow on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(201, 168, 76, 0.05) 0%, transparent 65%)',
          }}
        />

        {/* 4:5 Aspect Ratio Image Wrapper */}
        <div className="relative aspect-[4/5] w-full bg-black/10 overflow-hidden z-10 border-b border-white/5">
        
        {/* Compare Checkbox (appears top-left on hover, focus-visible) */}
        <label 
          className="absolute top-3 left-3 z-30 bg-charcoal/80 hover:bg-charcoal border border-white/10 p-1.5 rounded-md flex items-center space-x-1.5 cursor-pointer backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
          title="Compare this product"
        >
          <input
            type="checkbox"
            checked={isCompared}
            onChange={handleCompareChange}
            className="w-3.5 h-3.5 text-[#C9A84C] bg-charcoal border-white/20 rounded focus:ring-0 focus:ring-offset-0 focus:ring-[#C9A84C]"
          />
          <span className="text-[9px] font-bold text-white uppercase tracking-wider hidden sm:inline select-none">
            Compare
          </span>
        </label>

        {/* Product Image */}
        <Image
          src={product.image_url}
          alt={`Studio product display of ${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />

        {/* Dynamic Badges */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end space-y-1.5">
          {isOutofStock ? (
            <span className="px-2 py-0.5 bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wider rounded">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 bg-amber-500 text-charcoal text-[9px] font-extrabold uppercase tracking-widest rounded animate-pulse">
              LOW STOCK
            </span>
          ) : null}

          <span className="px-2 py-0.5 bg-charcoal/60 text-[#C9A84C] text-[9px] font-bold uppercase tracking-wider rounded backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {/* Quick Buy Slide Up (appears on card hover, desktop only) */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent pt-10 hidden md:block">
          <button
            onClick={() => onQuickBuy(product)}
            disabled={isOutofStock}
            className="w-full py-2 bg-[#C9A84C] text-[#0D0D0F] hover:bg-white text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:bg-muted disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 shadow-lg"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>Instant Order</span>
          </button>
        </div>

      </div>

      {/* Card Content Details */}
      <CardContent className="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div className="text-left">
          <h3 className="text-xs font-extrabold text-[#C9A84C] uppercase tracking-wider">
            {product.name.split(' ')[0]}
          </h3>
          <h4 className="text-sm font-bold text-white font-display mt-0.5 group-hover:text-[#C9A84C] transition-colors leading-tight line-clamp-1">
            {product.name}
          </h4>
          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed h-[3em]">
            {product.description || 'Premium design and construction from authorised distributors.'}
          </p>
        </div>

        {/* Pricing details */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-baseline space-x-2 text-left">
            <span className="text-white font-bold text-sm">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-gray-500 line-through">
              MRP: ₹{mrp.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[9px] text-gray-500 font-medium">
            {product.stock > 0 ? `${product.stock} units left` : 'Sold out'}
          </span>
        </div>
      </CardContent>

      {/* Card Footer Quick Mobile Actions */}
      <div className="p-4 pt-0 flex gap-2 md:hidden">
        <Link href={tryOnLink} className="flex-1">
          <button
            disabled={isOutofStock}
            className="w-full py-2 bg-transparent border border-white/20 hover:border-[#C9A84C] text-gray-300 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AR Try On</span>
          </button>
        </Link>
        <button
          onClick={() => onQuickBuy(product)}
          disabled={isOutofStock}
          className="flex-1 py-2 bg-[#C9A84C] text-[#0D0D0F] hover:bg-[#C9A84C]/90 rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:bg-muted disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span>Quick Buy</span>
        </button>
      </div>

      {/* Card Footer Desktop Auxiliary AR Button */}
      <div className="p-4 pt-0 hidden md:block border-t border-white/5 bg-charcoal/20">
        <Link href={tryOnLink} className="block w-full">
          <button
            disabled={isOutofStock}
            className="w-full py-1.5 bg-transparent border border-white/10 hover:border-[#C9A84C] text-gray-400 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
          >
            <Camera className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Launch Virtual Mirror</span>
          </button>
        </Link>
      </div>

      </Card>
    </motion.div>
  );
}
