'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { Glasses, Watch, Search, SlidersHorizontal, RefreshCw, X, Check } from 'lucide-react';
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

// Color Swatch type definition
interface ColorSwatch {
  id: string;
  label: string;
  hex: string;
  terms: string[];
}

// Material type definition
interface MaterialFilter {
  id: string;
  label: string;
  terms: string[];
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Grid column choice layout state: 2, 3, or 4 columns on desktop
  const [gridCols, setGridCols] = useState<number>(3);
  
  // Slide-out filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  
  // Faceted filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SWR Fetching
  const { data: products, error, isLoading, mutate } = useSWR<Product[]>('/api/products');

  // Handle category initial state from URL query
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['glasses', 'sunglasses', 'watches'].includes(cat)) {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  // Sync quick category choice with URL query and filter state
  const handleCategoryChange = (category: string) => {
    let updatedCats: string[];
    if (category === 'all') {
      updatedCats = [];
    } else {
      updatedCats = [category];
    }
    
    setSelectedCategories(updatedCats);
    
    const params = new URLSearchParams(window.location.search);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.replace(`/products?${params.toString()}`);
  };

  // Color Swatches definition with styled hex values
  const colorSwatches: ColorSwatch[] = [
    { id: 'black', label: 'Black', hex: '#000000', terms: ['black', 'onyx', 'charcoal', 'dark', 'coal', 'nero'] },
    { id: 'gold', label: 'Gold', hex: '#C9A84C', terms: ['gold', 'gilded', 'golden', 'rose gold', 'champagne'] },
    { id: 'silver', label: 'Silver', hex: '#c0c0c0', terms: ['silver', 'chrome', 'steel', 'metal', 'platinum', 'argent'] },
    { id: 'blue', label: 'Blue', hex: '#1e3a8a', terms: ['blue', 'navy', 'indigo', 'cobalt', 'sapphire', 'azure'] },
    { id: 'brown', label: 'Brown', hex: '#78350f', terms: ['brown', 'tortoise', 'havana', 'demi', 'wood', 'amber', 'bronze', 'tan'] },
  ];

  // Materials definition
  const materialsList: MaterialFilter[] = [
    { id: 'metal', label: 'Metal / Stainless Steel', terms: ['metal', 'steel', 'titanium', 'gold', 'silver', 'alloy', 'stainless', 'wire'] },
    { id: 'acetate', label: 'Acetate / Premium Plastic', terms: ['acetate', 'plastic', 'tr90', 'polycarbonate', 'shell', 'acrylic'] },
    { id: 'leather', label: 'Genuine Leather', terms: ['leather', 'strap', 'band', 'hide', 'crocodile'] },
    { id: 'titanium', label: 'Ultra-light Titanium', terms: ['titanium', 'ti', 'beta-titanium'] },
  ];

  // Checkbox helpers
  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handlePriceToggle = (priceRange: string) => {
    setSelectedPrices(prev =>
      prev.includes(priceRange) ? prev.filter(p => p !== priceRange) : [...prev, priceRange]
    );
  };

  const handleColorToggle = (colorId: string) => {
    setSelectedColors(prev =>
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId) ? prev.filter(m => m !== materialId) : [...prev, materialId]
    );
  };

  const resetAllFilters = () => {
    setSelectedCategories([]);
    setInStockOnly(false);
    setSelectedPrices([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSearchQuery('');
    router.replace('/products');
  };

  // Filter products client-side for ultra-fast UX
  const filteredProducts = products
    ? products.filter((product) => {
        // 1. Search Query Filter
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // 2. Category Filter
        const matchesCategory =
          selectedCategories.length === 0 || selectedCategories.includes(product.category);

        // 3. Stock Availability Filter
        const matchesStock = !inStockOnly || product.stock > 0;

        // 4. Price Ranges Filter
        let matchesPrice = true;
        if (selectedPrices.length > 0) {
          matchesPrice = selectedPrices.some((range) => {
            if (range === 'under_3000') return product.price < 3000;
            if (range === '3000_10000') return product.price >= 3000 && product.price <= 10000;
            if (range === 'over_10000') return product.price > 10000;
            return true;
          });
        }

        // 5. Color matching (scanning substrings of name & description)
        let matchesColor = true;
        if (selectedColors.length > 0) {
          const searchableText = `${product.name} ${product.description || ''}`.toLowerCase();
          matchesColor = selectedColors.some((colorId) => {
            const swatch = colorSwatches.find(s => s.id === colorId);
            return swatch ? swatch.terms.some(term => searchableText.includes(term)) : false;
          });
        }

        // 6. Material matching (scanning substrings of name & description)
        let matchesMaterial = true;
        if (selectedMaterials.length > 0) {
          const searchableText = `${product.name} ${product.description || ''}`.toLowerCase();
          matchesMaterial = selectedMaterials.some((materialId) => {
            const mat = materialsList.find(m => m.id === materialId);
            return mat ? mat.terms.some(term => searchableText.includes(term)) : false;
          });
        }

        return matchesSearch && matchesCategory && matchesStock && matchesPrice && matchesColor && matchesMaterial;
      })
    : [];

  // Cloudinary image optimizer helper
  const getOptimizedImageUrl = (url: string) => {
    if (url.includes('res.cloudinary.com')) {
      const splitUrl = url.split('/upload/');
      if (splitUrl.length === 2) {
        return `${splitUrl[0]}/upload/f_auto,q_auto,w_600,c_limit/${splitUrl[1]}`;
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

  // Number of active filters count
  const activeFiltersCount = 
    (selectedCategories.length > 0 ? selectedCategories.length : 0) +
    (inStockOnly ? 1 : 0) +
    selectedPrices.length +
    selectedColors.length +
    selectedMaterials.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="font-luxury text-3xl sm:text-5xl font-bold tracking-wider text-white">
          Our Collection
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
          Explore our handpicked curation of luxury eyeglasses, designer sunglasses, and premium watches. Match your perfect look with instant AR virtual mirror fitting.
        </p>
      </div>

      {/* Grid, Tab, & Search Controls Header (Hongo Layout Style) */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#0F1B30]/40 p-4 rounded-xl border border-gray-800 backdrop-blur-md">
        
        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            // Quick tab is highlighted if:
            // - value is "all" and selectedCategories is empty
            // - value is in selectedCategories (and selectedCategories only has 1 item)
            const isSelected = 
              (cat.value === 'all' && selectedCategories.length === 0) || 
              (selectedCategories.length === 1 && selectedCategories[0] === cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? 'bg-[#C9A84C] text-[#0B1422] border-transparent shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                    : 'bg-[#1A2742]/40 border-gray-700 text-gray-300 hover:text-white hover:bg-[#1A2742]/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Search Input */}
        <div className="flex flex-wrap items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-between md:justify-end">
          
          {/* Advanced Filter Drawer Trigger */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#1A2742]/80 hover:bg-[#253258] border border-gray-700 text-gray-200 rounded-md text-xs font-semibold tracking-wider uppercase transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#C9A84C] text-[#0B1422] text-[10px] font-extrabold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Desktop Grid Layout Selector */}
          <div className="hidden lg:flex items-center space-x-1 border border-gray-700 rounded-md p-1 bg-[#0B1422]/55">
            <button
              onClick={() => setGridCols(2)}
              className={`p-1.5 rounded transition-all ${
                gridCols === 2
                  ? 'bg-[#C9A84C] text-[#0B1422]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="2 Columns Grid"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 rounded transition-all ${
                gridCols === 3
                  ? 'bg-[#C9A84C] text-[#0B1422]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="3 Columns Grid"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="3" width="5" height="18" rx="1" />
                <rect x="9.5" y="3" width="5" height="18" rx="1" />
                <rect x="17" y="3" width="5" height="18" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 rounded transition-all ${
                gridCols === 4
                  ? 'bg-[#C9A84C] text-[#0B1422]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="4 Columns Grid"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="3" width="4" height="18" rx="0.5" />
                <rect x="7.3" y="3" width="4" height="18" rx="0.5" />
                <rect x="12.7" y="3" width="4" height="18" rx="0.5" />
                <rect x="18" y="3" width="4" height="18" rx="0.5" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F1B30]/80 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-all"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
          </div>

        </div>
      </div>

      {/* Advanced filters visual list - breadcrumb tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Active Filters:</span>
          
          {selectedCategories.map((cat) => (
            <span key={cat} className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded">
              <span>Category: {cat}</span>
              <button onClick={() => handleCategoryToggle(cat)} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          ))}

          {inStockOnly && (
            <span className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded">
              <span>In Stock Only</span>
              <button onClick={() => setInStockOnly(false)} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          )}

          {selectedPrices.map((range) => (
            <span key={range} className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded">
              <span>
                {range === 'under_3000' ? 'Under ₹3,000' : range === '3000_10000' ? '₹3,000 - ₹10,000' : 'Over ₹10,000'}
              </span>
              <button onClick={() => handlePriceToggle(range)} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          ))}

          {selectedColors.map((colorId) => {
            const swatch = colorSwatches.find(s => s.id === colorId);
            return (
              <span key={colorId} className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded">
                <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: swatch?.hex }} />
                <span>{swatch?.label}</span>
                <button onClick={() => handleColorToggle(colorId)} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            );
          })}

          {selectedMaterials.map((materialId) => {
            const mat = materialsList.find(m => m.id === materialId);
            return (
              <span key={materialId} className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded">
                <span>{mat?.label}</span>
                <button onClick={() => handleMaterialToggle(materialId)} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            );
          })}

          <button
            onClick={resetAllFilters}
            className="text-[10px] text-[#C9A84C] hover:text-[#E8D9A0] font-bold uppercase tracking-wider underline transition-colors pl-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 text-[#C9A84C] animate-spin" />
          <p className="text-sm text-gray-400">Loading catalog items...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <p className="text-red-400 font-semibold">Failed to load products.</p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 bg-[#1A2742] hover:bg-[#253258] text-xs font-semibold rounded text-white"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-lg bg-[#0F1B30]/20">
          <SlidersHorizontal className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No products match filters</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2">
            We couldn&apos;t find any matching premium products. Try adjusting your search query, price sliders, or color filters.
          </p>
          <Button onClick={resetAllFilters} className="mt-5 text-xs">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className={`grid gap-8 transition-all duration-300 ${
          gridCols === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : gridCols === 4
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredProducts.map((product) => {
            const isOutofStock = product.stock <= 0;
            const tryOnLink =
              product.category === 'watches'
                ? `/try-on/watches/${product.id}`
                : `/try-on/glasses/${product.id}`;

            return (
              <Card key={product.id} hoverable className="flex flex-col h-full bg-[#0F1B30]/40 border border-gray-800/80 group overflow-hidden">
                {/* Product Image Panel */}
                <div className="relative aspect-square w-full bg-black/10 overflow-hidden">
                  <Image
                    src={getOptimizedImageUrl(product.image_url)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority={false}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {isOutofStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                      <span className="px-3 py-1.5 bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  
                  {/* Category Tag badge */}
                  <span className="absolute top-3 right-3 px-2 py-1 bg-black/55 backdrop-blur-md text-[#E8D9A0] text-[10px] font-bold uppercase tracking-wider rounded border border-[#C9A84C]/20 z-10">
                    {product.category}
                  </span>

                  {/* Micro-Interaction Overlay: View Button on Hover */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => router.push(tryOnLink)}
                      className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0B1422] font-bold text-xs uppercase tracking-wider rounded-md shadow-lg"
                    >
                      Instant Mirror Try-On
                    </button>
                  </div>
                </div>

                {/* Details */}
                <CardContent className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 leading-snug font-luxury group-hover:text-[#C9A84C] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4 min-h-[4.5em]">
                      {product.description || 'No description available for this luxury collection piece.'}
                    </p>
                  </div>
                  
                  <div className="flex items-baseline justify-between mt-2 pt-3 border-t border-gray-800/80">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Luxury Price</span>
                    <span className="text-lg font-bold text-[#C9A84C]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </CardContent>

                {/* Footer Actions */}
                <CardFooter className="p-5 pt-0 bg-transparent flex flex-col space-y-2">
                  {isOutofStock ? (
                    <Button disabled className="w-full bg-gray-800 text-gray-500 cursor-not-allowed border-transparent">
                      Out of Stock
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push(tryOnLink)}
                      className="w-full font-bold uppercase tracking-wider text-xs"
                    >
                      Virtual Try On &rarr;
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Advanced Faceted Filter Drawer (Hongo Shopify Theme Replica) */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div 
          onClick={() => setIsFilterOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Drawer container */}
        <div 
          className={`absolute top-0 right-0 h-full w-80 sm:w-96 bg-[#0B1422] border-l border-[#C9A84C]/25 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform ${
            isFilterOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Filter & Sort</h3>
            </div>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Content Area (Scrollable) */}
          <div className="flex-grow overflow-y-auto p-5 space-y-6">
            
            {/* 1. Category Facet */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-gray-800 pb-2">
                Departments
              </h4>
              <div className="space-y-2">
                {['glasses', 'sunglasses', 'watches'].map((cat) => (
                  <label key={cat} className="flex items-center space-x-2.5 text-xs text-gray-300 hover:text-white cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-[#C9A84C] focus:ring-[#C9A84C]/20 focus:ring-offset-0 focus:outline-none"
                    />
                    <span className="capitalize">{cat === 'glasses' ? 'Eyeglasses' : cat === 'sunglasses' ? 'Sunglasses' : 'Premium Watches'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Stock Availability Facet */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-gray-800 pb-2">
                Availability
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 text-xs text-gray-300 hover:text-white cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-[#C9A84C] focus:ring-[#C9A84C]/20 focus:ring-offset-0 focus:outline-none"
                  />
                  <span>Show In-Stock Only</span>
                </label>
              </div>
            </div>

            {/* 3. Price Range Facet */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-gray-800 pb-2">
                Price Range
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'under_3000', label: 'Under ₹3,000' },
                  { id: '3000_10000', label: '₹3,000 - ₹10,000' },
                  { id: 'over_10000', label: 'Over ₹10,000' }
                ].map((range) => (
                  <label key={range.id} className="flex items-center space-x-2.5 text-xs text-gray-300 hover:text-white cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={selectedPrices.includes(range.id)}
                      onChange={() => handlePriceToggle(range.id)}
                      className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-[#C9A84C] focus:ring-[#C9A84C]/20 focus:ring-offset-0 focus:outline-none"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Luxury Color Swatches Facet */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-gray-800 pb-2">
                Luxury Color Swatches
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {colorSwatches.map((color) => {
                  const isChecked = selectedColors.includes(color.id);
                  return (
                    <button
                      key={color.id}
                      onClick={() => handleColorToggle(color.id)}
                      className={`flex items-center space-x-2 p-2 rounded-md border text-left text-xs transition-all ${
                        isChecked 
                          ? 'border-[#C9A84C] bg-[#C9A84C]/5 text-white' 
                          : 'border-gray-800 bg-[#1A2742]/20 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 flex items-center justify-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isChecked && <Check className="w-2 h-2 text-white" />}
                      </span>
                      <span className="truncate">{color.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Frame & Strap Material Facet */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-gray-800 pb-2">
                Material Composition
              </h4>
              <div className="space-y-2">
                {materialsList.map((material) => (
                  <label key={material.id} className="flex items-center space-x-2.5 text-xs text-gray-300 hover:text-white cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={selectedMaterials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                      className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-[#C9A84C] focus:ring-[#C9A84C]/20 focus:ring-offset-0 focus:outline-none"
                    />
                    <span>{material.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Footer controls inside drawer */}
          <div className="p-5 border-t border-gray-800 bg-[#0F1B30]/40 flex space-x-3">
            <Button
              variant="outline"
              onClick={resetAllFilters}
              className="flex-1 text-xs py-2 uppercase font-bold tracking-wider"
            >
              Reset
            </Button>
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 text-xs py-2 uppercase font-bold tracking-wider text-[#0B1422] bg-[#C9A84C]"
            >
              Apply Filter ({filteredProducts.length})
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4 min-h-screen bg-[#0B1422]">
        <RefreshCw className="w-8 h-8 text-[#C9A84C] animate-spin" />
        <p className="text-sm text-gray-400">Loading catalog...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}

