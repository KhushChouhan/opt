'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Glasses, Watch, Search, SlidersHorizontal, RefreshCw, X, Check, Gem } from 'lucide-react';
import { buildWhatsAppUrl, WHATSAPP_PRIMARY } from '@/utils/whatsapp';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import CheckoutModal from '@/components/CheckoutModal';

interface Product {
  id: string;
  name: string;
  category: 'glasses' | 'sunglasses' | 'contact-lenses' | 'watches' | 'smart-watches' | 'belts' | 'perfumes' | 'wallets' | 'accessories';
  price: number;
  description: string;
  image_url: string;
  overlay_image_url: string;
  stock: number;
  brand?: string;
  product_id?: string;
  discount?: number;
  catalogOnly?: boolean;
}

const LOCAL_CONTACT_LENS_PRODUCTS: Product[] = [
  {
    id: 'catalog-contact-daily-comfort',
    product_id: 'CL-DAILY-01',
    name: 'Clear Vision Daily Comfort Lenses',
    category: 'contact-lenses',
    price: 1299,
    discount: 10,
    description: 'Breathable daily-wear clear lenses designed for reliable moisture retention and all-day comfort.',
    image_url: '/images/premium_redesign/category_contact_lenses_reference.png',
    overlay_image_url: '',
    stock: 12,
    brand: 'Clear Vision',
    catalogOnly: true,
  },
  {
    id: 'catalog-contact-monthly-aqua',
    product_id: 'CL-MONTHLY-02',
    name: 'Aqua Balance Monthly Lenses',
    category: 'contact-lenses',
    price: 1699,
    description: 'Soft monthly replacement lenses with a balanced fit for clear, comfortable everyday vision.',
    image_url: '/images/premium_redesign/category_contact_lenses.png',
    overlay_image_url: '',
    stock: 9,
    brand: 'Aqua Balance',
    catalogOnly: true,
  },
  {
    id: 'catalog-contact-premium-hydra',
    product_id: 'CL-PREMIUM-03',
    name: 'HydraSoft Premium Lens Pair',
    category: 'contact-lenses',
    price: 2199,
    discount: 8,
    description: 'Premium soft lenses with enhanced hydration and a smooth optical surface for long-wear comfort.',
    image_url: '/images/premium_redesign/category_contact_lenses_reference.png',
    overlay_image_url: '',
    stock: 7,
    brand: 'HydraSoft',
    catalogOnly: true,
  },
];

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

type FrameShape = 'cat-eye' | 'square' | 'rectangle' | 'pilot' | 'round' | 'rimless' | 'retro' | 'oval';

const FRAME_SHAPES: FrameShape[] = ['cat-eye', 'square', 'rectangle', 'pilot', 'round', 'rimless', 'retro', 'oval'];

const FRAME_SHAPE_ALIASES: Record<FrameShape, string[]> = {
  'cat-eye': ['cat eye', 'cateye', 'skyler'],
  square: ['square', 'wayfarer', 'holbrook'],
  rectangle: ['rectangle', 'rectangular'],
  pilot: ['pilot', 'aviator', 'double bridge'],
  round: ['round', 'circular'],
  rimless: ['rimless', 'semi rimless', 'frameless'],
  retro: ['retro', 'vintage', 'clubmaster', 'browline'],
  oval: ['oval', 'ellipse', 'elliptical'],
};

const ACCESSORY_CATEGORIES = ['accessories', 'belts', 'wallets', 'perfumes'];

const normalizeSearchText = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const isFrameShape = (value: string | null): value is FrameShape =>
  value !== null && FRAME_SHAPES.includes(value as FrameShape);

const getActualCategory = (product: Product): string => {
  if (product.description) {
    if (product.description.includes('[Category: perfumes]')) return 'perfumes';
    if (product.description.includes('[Category: belts]')) return 'belts';
    if (product.description.includes('[Category: wallets]')) return 'wallets';
    if (product.description.includes('[Category: accessories]')) return 'accessories';
  }
  if (product.category === 'watches') {
    const isSmart = product.name.toLowerCase().includes('smart') || 
                    product.description?.toLowerCase().includes('smartwatch') || 
                    product.description?.toLowerCase().includes('smart watch');
    if (isSmart) return 'smart-watches';
  }
  return product.category;
};

const getProductFrameShapes = (product: Product): FrameShape[] => {
  const actualCategory = getActualCategory(product);
  if (actualCategory !== 'glasses' && actualCategory !== 'sunglasses') return [];

  const searchableText = ` ${normalizeSearchText(`${product.name} ${product.description || ''}`)} `;

  return FRAME_SHAPES.filter((shape) =>
    FRAME_SHAPE_ALIASES[shape].some((alias) => searchableText.includes(` ${alias} `))
  );
};

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shapeParam = searchParams.get('shape');
  const selectedShape = isFrameShape(shapeParam) ? shapeParam : null;
  
  // Grid column choice layout state: 2, 3, or 4 columns on desktop
  const [gridCols, setGridCols] = useState<number>(4);
  
  // Slide-out filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Buy Now Checkout states
  const [checkoutProduct, setCheckoutProduct] = useState<{ id: string; name: string; price: number } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Faceted filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SWR Fetching
  const { data: products, error, isLoading, mutate } = useSWR<Product[]>('/api/products');

  // Handle category and brand initial state from URL query
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['glasses', 'sunglasses', 'contact-lenses', 'watches', 'smart-watches', 'belts', 'perfumes', 'wallets', 'accessories'].includes(cat)) {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }

    const brand = searchParams.get('brand');
    if (brand) {
      setSelectedBrand(brand);
    } else {
      setSelectedBrand(null);
    }

    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
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
    params.delete('shape');
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
    const updatedCategories = selectedCategories.includes(cat)
      ? selectedCategories.filter((category) => category !== cat)
      : [...selectedCategories, cat];

    setSelectedCategories(updatedCategories);

    const params = new URLSearchParams(window.location.search);
    if (params.has('shape')) {
      params.delete('shape');
      if (updatedCategories.length === 1) {
        params.set('category', updatedCategories[0]);
      } else {
        params.delete('category');
      }
      router.replace(`/products?${params.toString()}`);
    }
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
  const catalogProducts = [...(products ?? []), ...LOCAL_CONTACT_LENS_PRODUCTS];

  const filteredProducts = catalogProducts.filter((product) => {
        // 1. Search Query Filter
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // 2. Category Filter
        const actualCategory = getActualCategory(product);
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.some((category) =>
            category === 'accessories'
              ? ACCESSORY_CATEGORIES.includes(actualCategory)
              : category === actualCategory
          );

        // Dedicated frame-shape matching is deliberately limited to eyewear.
        // Products without explicit shape metadata in their name/description stay out.
        const matchesShape =
          !selectedShape || getProductFrameShapes(product).includes(selectedShape);

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

        // 7. Brand Filter
        let matchesBrand = true;
        if (selectedBrand) {
          const targetBrandClean = selectedBrand.toLowerCase().replace(/[^a-z0-9]/g, '');
          const productBrand = (product.brand || product.name.split(' ')[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          matchesBrand = productBrand.includes(targetBrandClean) || targetBrandClean.includes(productBrand);
        }

        return matchesSearch && matchesCategory && matchesShape && matchesStock && matchesPrice && matchesColor && matchesMaterial && matchesBrand;
      });

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
    { value: 'contact-lenses', label: 'Contact Lenses', icon: Gem },
    { value: 'watches', label: 'Watches', icon: Watch },
    { value: 'smart-watches', label: 'Smart Watches', icon: Watch },
    { value: 'accessories', label: 'Accessories', icon: Gem },
  ];

  // Number of active filters count
  const activeFiltersCount = 
    (selectedCategories.length > 0 ? selectedCategories.length : 0) +
    (inStockOnly ? 1 : 0) +
    selectedPrices.length +
    selectedColors.length +
    selectedMaterials.length +
    (selectedBrand ? 1 : 0) +
    (selectedShape ? 1 : 0);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 text-[#121212] sm:px-6 sm:py-10 lg:px-8">
      
      {/* Page Title */}
      <div className="mb-8 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C86620]">Curated for every style</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-[0.02em] text-[#062C1C] sm:text-5xl">
          Our Collection
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#6B625A]">
          Explore our handpicked curation of luxury eyeglasses, designer sunglasses, and premium watches. Match your perfect look with instant AR virtual mirror fitting.
        </p>
      </div>

      {/* Grid, Tab, & Search Controls Header (Hongo Layout Style) */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-[14px] border border-[#E5D8CC] bg-white p-4 shadow-[0_8px_28px_rgba(71,45,27,0.06)] md:flex-row md:items-center md:space-y-0">
        
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
                className={`flex items-center space-x-1.5 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'border-[#062C1C] bg-[#062C1C] text-white shadow-[0_5px_14px_rgba(6,44,28,0.16)]'
                    : 'border-[#E2D5C9] bg-[#FCF8F4] text-[#554D46] hover:border-[#C86620]/55 hover:bg-[#FBF1E8] hover:text-[#8A491D]'
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
            className="flex items-center space-x-2 rounded-md border border-[#DCCFC3] bg-[#FCF8F4] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#062C1C] transition-all hover:border-[#C86620]/55 hover:bg-[#FBF1E8]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#C86620]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C86620] text-[10px] font-extrabold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Desktop Grid Layout Selector */}
          <div className="hidden items-center space-x-1 rounded-md border border-[#DCCFC3] bg-[#FCF8F4] p-1 lg:flex">
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 rounded transition-all ${
                gridCols === 3
                  ? 'bg-[#C86620] text-white'
                  : 'text-[#766C63] hover:bg-[#F5E9DE] hover:text-[#062C1C]'
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
                  ? 'bg-[#C86620] text-white'
                  : 'text-[#766C63] hover:bg-[#F5E9DE] hover:text-[#062C1C]'
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
              className="w-full rounded-md border border-[#DCCFC3] bg-[#FFFDFC] py-2 pl-10 pr-4 text-sm text-[#171717] placeholder-[#9A9087] transition-all focus:border-[#C86620] focus:outline-none focus:ring-1 focus:ring-[#C86620]/20"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8A8179]" />
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

          {selectedShape && (
            <span className="flex items-center space-x-1 rounded border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]">
              <span>Frame: {selectedShape.replace('-', ' ')}</span>
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.delete('shape');
                  router.replace(`/products?${params.toString()}`);
                }}
                className="hover:text-white"
                aria-label={`Remove ${selectedShape} frame filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedBrand && (
            <span className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded">
              <span>Brand: {selectedBrand}</span>
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.delete('brand');
                  router.replace(`/products?${params.toString()}`);
                }}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

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
        <div className="rounded-[14px] border border-dashed border-[#D8C8BA] bg-white py-20 text-center">
          <SlidersHorizontal className="mx-auto mb-4 h-10 w-10 text-[#B49B87]" />
          <h3 className="mb-1 text-lg font-bold text-[#062C1C]">No products match filters</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#746B63]">
            We couldn&apos;t find any matching premium products. Try adjusting your search query, price sliders, or color filters.
          </p>
          <Button onClick={resetAllFilters} className="mt-5 text-xs">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className={`grid gap-8 transition-all duration-300 ${
            gridCols === 4
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredProducts.map((product) => {
            const isOutofStock = product.stock <= 0;
            const actualCategory = getActualCategory(product);
            const hasTryOn = ['glasses', 'sunglasses', 'watches'].includes(actualCategory);
            const tryOnLink =
              actualCategory === 'watches'
                ? `/try-on/watches/${product.id}`
                : `/try-on/glasses/${product.id}`;

            const handleAction = () => {
              if (hasTryOn) {
                router.push(tryOnLink);
              } else {
                const url = buildWhatsAppUrl(
                  `Hi Hariyana Watch & Opticals, I am interested in purchasing "${product.name}". Please provide availability and details.`,
                  WHATSAPP_PRIMARY
                );
                window.open(url, '_blank');
              }
            };

            return (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="h-full"
              >
                <Card hoverable className="group relative flex h-full flex-col overflow-hidden border border-[#E8DCD0] bg-white shadow-[0_6px_24px_rgba(71,45,27,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_38px_rgba(71,45,27,0.12)]">
                  {/* Soft subtle glow backlight inside item cards */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" 
                    style={{
                      backgroundImage: 'radial-gradient(circle at center, rgba(200, 102, 32, 0.07) 0%, transparent 70%)',
                    }}
                  />

                  {/* Product Image Panel */}
                  <div className="relative z-10 aspect-square w-full overflow-hidden border-b border-[#EEE4DA] bg-[#F8EEE5]">
                    <Image
                      src={getOptimizedImageUrl(product.image_url)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={false}
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {isOutofStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                        <span className="px-3 py-1.5 bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    
                    {/* Category Tag badge */}
                    <span className="absolute right-3 top-3 z-10 rounded border border-white/30 bg-[#062C1C]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {actualCategory === 'glasses' ? 'Eyeglasses' : actualCategory === 'contact-lenses' ? 'Contact Lenses' : actualCategory}
                    </span>

                    {/* Micro-Interaction Overlay: View Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[#062C1C]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        onClick={handleAction}
                        className="translate-y-4 transform rounded-md bg-[#062C1C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-transform duration-300 group-hover:translate-y-0 hover:bg-[#0A3C28]"
                      >
                        {hasTryOn ? 'Instant Mirror Try-On' : 'Buy on WhatsApp'}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <CardContent className="relative z-10 flex flex-grow flex-col justify-between bg-white p-5">
                    <div>
                      {product.product_id && (
                        <div className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-[#C86620]">
                          {product.product_id}
                        </div>
                      )}
                      <h3 className="mb-2 line-clamp-2 min-h-[2.8em] font-serif text-lg font-bold leading-snug text-[#171717] transition-colors group-hover:text-[#9A6328]">
                        {product.name}
                      </h3>
                      <p className="mb-4 min-h-[4.5em] line-clamp-3 text-xs leading-relaxed text-[#6B625A]">
                        {product.description || 'No description available for this luxury collection piece.'}
                      </p>
                    </div>
                    
                    <div className="mt-2 flex items-baseline justify-between border-t border-[#EEE4DA] pt-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8A8179]">Luxury Price</span>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-[#062C1C]">
                          ₹{(product.discount ? Math.round(product.price * (1 - product.discount / 100)) : product.price).toLocaleString('en-IN')}
                        </span>
                        {product.discount ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-[#9A9087] line-through">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-bold text-[#2E7D58]">{product.discount}% Off</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>

                  {/* Footer Actions */}
                  <CardFooter className="relative z-10 flex flex-col space-y-2 border-0 bg-white p-5 pt-0">
                    {isOutofStock ? (
                      <Button disabled className="w-full cursor-not-allowed border-transparent bg-none bg-[#E9E2DB] text-[#8A8179]">
                        Out of Stock
                      </Button>
                    ) : product.catalogOnly ? (
                      <Button onClick={handleAction} className="w-full bg-none bg-[#062C1C] text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0A3C28]">
                        Enquire on WhatsApp
                      </Button>
                    ) : (
                      <div className="flex flex-col space-y-2 w-full">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCheckoutProduct({ 
                              id: product.id, 
                              name: product.name, 
                              price: product.discount ? Math.round(product.price * (1 - product.discount / 100)) : product.price 
                            });
                            setIsCheckoutOpen(true);
                          }}
                          className="w-full bg-none bg-[#062C1C] text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0A3C28]"
                        >
                          Buy Now
                        </Button>
                        <Button
                          onClick={handleAction}
                          variant="outline"
                          className="w-full border-[#D8C6B5] bg-white text-xs font-bold uppercase tracking-wider text-[#062C1C] hover:border-[#C86620] hover:bg-[#FBF1E8] hover:text-[#8A491D]"
                        >
                          {hasTryOn ? 'Virtual Try On →' : 'Buy on WhatsApp →'}
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
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
          className="absolute inset-0 bg-[#1E1712]/45 backdrop-blur-xs"
        />

        {/* Drawer container */}
        <div 
          className={`absolute right-0 top-0 flex h-full w-80 transform flex-col justify-between border-l border-[#D9C8B9] bg-[#FCF8F4] shadow-2xl transition-transform duration-300 ease-out sm:w-96 ${
            isFilterOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E6D9CD] p-5">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-[#C86620]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#062C1C]">Filter & Sort</h3>
            </div>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="rounded-full p-1 text-[#81776E] transition-colors hover:bg-[#F1E5DA] hover:text-[#062C1C]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Content Area (Scrollable) */}
          <div className="flex-grow overflow-y-auto p-5 space-y-6">
            
            {/* 1. Category Facet */}
            <div className="space-y-3">
              <h4 className="border-b border-[#E6D9CD] pb-2 text-xs font-bold uppercase tracking-wider text-[#9A6328]">
                Departments
              </h4>
              <div className="space-y-2">
                {['glasses', 'sunglasses', 'contact-lenses', 'watches', 'belts', 'perfumes', 'wallets', 'accessories'].map((cat) => (
                  <label key={cat} className="flex cursor-pointer select-none items-center space-x-2.5 text-xs text-[#514A44] hover:text-[#8A491D]">
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="h-4 w-4 rounded border-[#CDBBAA] bg-white text-[#C86620] focus:outline-none focus:ring-[#C86620]/20 focus:ring-offset-0"
                    />
                    <span className="capitalize">
                      {cat === 'glasses' ? 'Eyeglasses' : 
                       cat === 'sunglasses' ? 'Sunglasses' : 
                       cat === 'contact-lenses' ? 'Contact Lenses' :
                       cat === 'watches' ? 'Premium Watches' : 
                       cat === 'belts' ? 'Luxury Belts' : 
                       cat === 'perfumes' ? 'Perfumes' : 
                       cat === 'wallets' ? 'Wallets' : 
                       'Accessories'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Stock Availability Facet */}
            <div className="space-y-3">
              <h4 className="border-b border-[#E6D9CD] pb-2 text-xs font-bold uppercase tracking-wider text-[#9A6328]">
                Availability
              </h4>
              <div className="space-y-2">
                <label className="flex cursor-pointer select-none items-center space-x-2.5 text-xs text-[#514A44] hover:text-[#8A491D]">
                  <input 
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-[#CDBBAA] bg-white text-[#C86620] focus:outline-none focus:ring-[#C86620]/20 focus:ring-offset-0"
                  />
                  <span>Show In-Stock Only</span>
                </label>
              </div>
            </div>

            {/* 3. Price Range Facet */}
            <div className="space-y-3">
              <h4 className="border-b border-[#E6D9CD] pb-2 text-xs font-bold uppercase tracking-wider text-[#9A6328]">
                Price Range
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'under_3000', label: 'Under ₹3,000' },
                  { id: '3000_10000', label: '₹3,000 - ₹10,000' },
                  { id: 'over_10000', label: 'Over ₹10,000' }
                ].map((range) => (
                  <label key={range.id} className="flex cursor-pointer select-none items-center space-x-2.5 text-xs text-[#514A44] hover:text-[#8A491D]">
                    <input 
                      type="checkbox"
                      checked={selectedPrices.includes(range.id)}
                      onChange={() => handlePriceToggle(range.id)}
                      className="h-4 w-4 rounded border-[#CDBBAA] bg-white text-[#C86620] focus:outline-none focus:ring-[#C86620]/20 focus:ring-offset-0"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Luxury Color Swatches Facet */}
            <div className="space-y-3">
              <h4 className="border-b border-[#E6D9CD] pb-2 text-xs font-bold uppercase tracking-wider text-[#9A6328]">
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
                          ? 'border-[#C86620] bg-[#F9EBDD] text-[#8A491D]'
                          : 'border-[#E1D5CA] bg-white text-[#655D56] hover:border-[#C86620]/55'
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
              <h4 className="border-b border-[#E6D9CD] pb-2 text-xs font-bold uppercase tracking-wider text-[#9A6328]">
                Material Composition
              </h4>
              <div className="space-y-2">
                {materialsList.map((material) => (
                  <label key={material.id} className="flex cursor-pointer select-none items-center space-x-2.5 text-xs text-[#514A44] hover:text-[#8A491D]">
                    <input 
                      type="checkbox"
                      checked={selectedMaterials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                      className="h-4 w-4 rounded border-[#CDBBAA] bg-white text-[#C86620] focus:outline-none focus:ring-[#C86620]/20 focus:ring-offset-0"
                    />
                    <span>{material.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Footer controls inside drawer */}
          <div className="flex space-x-3 border-t border-[#E6D9CD] bg-[#F8EEE5] p-5">
            <Button
              variant="outline"
              onClick={resetAllFilters}
              className="flex-1 border-[#CDBBAA] bg-white py-2 text-xs font-bold uppercase tracking-wider text-[#062C1C] hover:bg-[#FBF1E8]"
            >
              Reset
            </Button>
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 bg-none bg-[#062C1C] py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0A3C28]"
            >
              Apply Filter ({filteredProducts.length})
            </Button>
          </div>

        </div>
      </div>

      {/* Checkout Modal Dialog */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
      />

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-[#FCF8F4] py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-[#C86620]" />
        <p className="text-sm text-[#6B625A]">Loading catalog...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}

