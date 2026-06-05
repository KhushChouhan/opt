'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { Glasses, Watch, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';

interface Product {
  id: string;
  name: string;
  category: 'glasses' | 'sunglasses' | 'watches';
  price: number;
  description: string;
  image_url: string;
  overlay_image_url: string;
  stock: number;
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // SWR Fetching
  const { data: products, error, isLoading, mutate } = useSWR<Product[]>('/api/products');

  // Handle category initial state from URL query
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['glasses', 'sunglasses', 'watches'].includes(cat)) {
      setActiveCategory(cat);
    } else {
      setActiveCategory('all');
    }
  }, [searchParams]);

  // Update URL search params when changing tabs
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const params = new URLSearchParams(window.location.search);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.replace(`/products?${params.toString()}`);
  };

  // Filter products client-side for ultra-fast UX
  const filteredProducts = products
    ? products.filter((product) => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
    : [];

  // Cloudinary image optimizer helper
  const getOptimizedImageUrl = (url: string) => {
    if (url.includes('res.cloudinary.com')) {
      // Inject f_auto, q_auto, w_500, c_limit transformations
      const splitUrl = url.split('/upload/');
      if (splitUrl.length === 2) {
        return `${splitUrl[0]}/upload/f_auto,q_auto,w_500,c_limit/${splitUrl[1]}`;
      }
    }
    return url;
  };

  const categories = [
    { value: 'all', label: 'All Products', icon: SlidersHorizontal },
    { value: 'glasses', label: 'Eyeglasses', icon: Glasses },
    { value: 'sunglasses', label: 'Sunglasses', icon: Glasses },
    { value: 'watches', label: 'Watches', icon: Watch },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="font-luxury text-3xl sm:text-5xl font-bold tracking-wider text-white">
          Our Collection
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Browse luxury eyeglasses, sunglasses, and watches. Select a product to try on instantly.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? 'bg-[#d4af37] text-[#060b13] border-transparent shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                    : 'bg-[#1c2541]/40 border-gray-700 text-gray-300 hover:text-white hover:bg-[#1c2541]/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 order-1 md:order-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b132b]/80 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
          <p className="text-sm text-gray-400">Loading catalog items...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <p className="text-red-400 font-semibold">Failed to load products.</p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 bg-[#1c2541] hover:bg-[#253258] text-xs font-semibold rounded text-white"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-lg bg-white/2">
          <SlidersHorizontal className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
          <p className="text-sm text-gray-400">
            Try adjusting your category filter or search query.
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const isOutofStock = product.stock <= 0;
            const tryOnLink =
              product.category === 'watches'
                ? `/try-on/watches/${product.id}`
                : `/try-on/glasses/${product.id}`;

            return (
              <Card key={product.id} hoverable className="flex flex-col h-full bg-[#0b132b]/40">
                {/* Product Image Panel */}
                <div className="relative aspect-square w-full bg-black/10 overflow-hidden group">
                  <Image
                    src={getOptimizedImageUrl(product.image_url)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isOutofStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-1 bg-black/40 text-[#f3e5ab] text-xs font-semibold rounded capitalize">
                    {product.category}
                  </span>
                </div>

                {/* Details */}
                <CardContent className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 leading-snug font-luxury truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                      {product.description || 'No description available.'}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-800">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Price</span>
                    <span className="text-lg font-bold text-[#d4af37]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </CardContent>

                {/* Footer Actions */}
                <CardFooter className="p-5 pt-0 bg-transparent flex flex-col space-y-2">
                  {isOutofStock ? (
                    <Button disabled className="w-full bg-gray-800 text-gray-500 cursor-not-allowed">
                      Out of Stock
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push(tryOnLink)}
                      className="w-full"
                    >
                      Virtual Try On
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4 min-h-screen">
        <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
        <p className="text-sm text-gray-400">Loading catalog...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
