'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { 
  Shield, Camera, ChevronLeft, ChevronRight, X, 
  AlertCircle, RefreshCw, CheckCircle 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { CompareProvider, useCompare } from '@/context/CompareContext';

// Import our new luxury design components
import SectionWrapper from '@/components/SectionWrapper';
import ProductCard from '@/components/ProductCard';
import ComparisonBar from '@/components/ComparisonBar';
import SpotlightSection from '@/components/SpotlightSection';
import BrandShowcase from '@/components/BrandShowcase';
import TryOnSteps from '@/components/TryOnSteps';
import StoreLocator from '@/components/StoreLocator';
import Testimonials from '@/components/Testimonials';
import UGCStrip from '@/components/UGCStrip';
import LoyaltyTeaser from '@/components/LoyaltyTeaser';

import { Product } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fallbackProducts: Product[] = [
  {
    id: 'titan-classic',
    name: 'Titan Classic Rectangular',
    category: 'glasses',
    price: 1499.00,
    mrp: 1899.00,
    description: 'Elegant rectangular eyeglasses with a matte black metal frame. Perfect for daily office wear.',
    image_url: '/images/hero_glasses.png',
    overlay_image_url: '/images/overlays/glasses_classic.png',
    stock: 15,
    specs: { frameWidth: '140 mm', material: 'Stainless Steel', warranty: '1 Year Warranty' }
  },
  {
    id: 'rayban-aviator',
    name: 'Ray-Ban Aviator Optical',
    category: 'glasses',
    price: 4500.00,
    mrp: 5800.00,
    description: 'Timeless gold metal wireframe aviator eyeglasses. Light, comfortable, and durable.',
    image_url: '/images/hero_glasses.png',
    overlay_image_url: '/images/overlays/glasses_gold.png',
    stock: 8,
    specs: { frameWidth: '142 mm', material: 'Monel Metal', warranty: '1 Year Warranty' }
  },
  {
    id: 'fastrack-sporty',
    name: 'Fastrack Sporty Sunglasses',
    category: 'sunglasses',
    price: 2199.00,
    mrp: 2999.00,
    description: 'Aero-dynamic sports sunglasses with UV protection and a sleek wrap-around profile.',
    image_url: '/images/hero_sunglasses.png',
    overlay_image_url: '/images/overlays/sunglasses_sports.png',
    stock: 20,
    specs: { frameWidth: '145 mm', material: 'Acetate', warranty: '6 Months Warranty' }
  },
  {
    id: 'rayban-wayfarer',
    name: 'Ray-Ban Wayfarer Classic',
    category: 'sunglasses',
    price: 8999.00,
    mrp: 11000.00,
    description: 'The iconic wayfarer sunglasses with green classic G-15 tinted lenses. Absolute style statement.',
    image_url: '/images/hero_sunglasses.png',
    overlay_image_url: '/images/overlays/sunglasses_wayfarer.png',
    stock: 5,
    specs: { frameWidth: '144 mm', material: 'Hypoallergenic Acetate', warranty: '2 Years Warranty' }
  },
  {
    id: 'titan-neo',
    name: 'Titan Neo Classic Quartz',
    category: 'watches',
    price: 3299.00,
    mrp: 4200.00,
    description: 'Classic analog watch with a brown leather strap and deep navy blue dial. Perfect for formal wear.',
    image_url: '/images/hero_watch.png',
    overlay_image_url: '/images/overlays/watch_classic.png',
    stock: 12,
    specs: { lugWidth: '22 mm', material: 'Genuine Leather & Brass', warranty: '1 Year Warranty' }
  },
  {
    id: 'fastrack-chrono',
    name: 'Fastrack Chronograph Watch',
    category: 'watches',
    price: 4495.00,
    mrp: 5495.00,
    description: 'Active black steel chronograph watch with multi-dial display and dynamic red accents.',
    image_url: '/images/hero_watch.png',
    overlay_image_url: '/images/overlays/watch_sporty.png',
    stock: 10,
    specs: { lugWidth: '22 mm', material: 'Stainless Steel', warranty: '1 Year Warranty' }
  }
];

export default function Home() {
  return (
    <CompareProvider>
      <HomeContent />
    </CompareProvider>
  );
}

function HomeContent() {
  // 1. API Fetch SWR
  const { data: dbProducts, isLoading } = useSWR<Product[]>('/api/products', fetcher);
  const products = dbProducts || fallbackProducts;

  // 2. Compare State Context
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  // 3. Hero Slider States
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroHover, setHeroHover] = useState(false);
  const heroSlides = [
    {
      subtitle: 'ITALIAN LUXURY EYEWEAR DESIGN',
      title: 'Looking cool by doing good',
      badgeText: 'START FROM ₹2,199',
      image: '/images/hero_sunglasses.png',
      link: '/products?category=sunglasses',
      bgWord: 'SUNGLASSES',
      ctaText: 'Shop Sunglasses',
      urgency: 'Strictly limited retail slots available this week in Hanumangarh.'
    },
    {
      subtitle: 'PREMIUM AUTOMATIC CRAFTSMANSHIP',
      title: 'Timepieces for the bold wrist',
      badgeText: 'GENUINE WARRANTY',
      image: '/images/hero_watch.png',
      link: '/products?category=watches',
      bgWord: 'WATCHES',
      ctaText: 'Shop Watches',
      urgency: 'Authorized retail watches catalog. In-store certification provided.'
    },
    {
      subtitle: 'REFINED HANDMADE TITANIUM',
      title: 'Clarify your sight in style',
      badgeText: 'TRY-ON IN MIRROR',
      image: '/images/hero_glasses.png',
      link: '/products?category=glasses',
      bgWord: 'EYEGLASSES',
      ctaText: 'Shop Eyeglasses',
      urgency: 'Virtual camera mirror try-on active. Test frames instantly.'
    }
  ];

  // Auto-advance hero slides
  useEffect(() => {
    if (heroHover) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length, heroHover]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // 4. Shop Category Selection
  const [selectedShopCategory, setSelectedShopCategory] = useState<string>('all');
  
  // 5. Quick Checkout Modal States
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{ orderId: string; productName: string } | null>(null);

  const openQuickOrder = (product: Product) => {
    setSelectedProductForOrder(product);
    setCheckoutError('');
    setOrderSuccessData(null);
  };

  const handleQuickOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setIsSubmittingOrder(true);

    if (!selectedProductForOrder) return;

    if (customerName.trim().length < 2) {
      setCheckoutError('Please enter a valid name (at least 2 characters).');
      setIsSubmittingOrder(false);
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setCheckoutError('Please enter a valid 10-digit Indian phone number.');
      setIsSubmittingOrder(false);
      return;
    }

    if (address.trim().length < 10) {
      setCheckoutError('Please enter a detailed physical address (min 10 chars).');
      setIsSubmittingOrder(false);
      return;
    }

    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(pincode.trim())) {
      setCheckoutError('Please enter a valid 6-digit Indian PIN code.');
      setIsSubmittingOrder(false);
      return;
    }

    const orderId = crypto.randomUUID();

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          product_id: selectedProductForOrder.id,
          customer_name: customerName,
          phone,
          address,
          pincode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setOrderSuccessData({
        orderId,
        productName: selectedProductForOrder.name
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected database error occurred. Please try again.';
      setCheckoutError(errMsg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Generate WhatsApp Order Confirmation Link
  const getWhatsAppOrderLink = () => {
    if (!orderSuccessData) return '#';
    const text = `Hello Hariyana Watch & Opticals,\n\nI just placed an order on your website! Here are my details:\n\n*Order ID:* ${orderSuccessData.orderId.substring(0, 8)}\n*Product:* ${orderSuccessData.productName}\n*Customer:* ${customerName}\n*Phone:* ${phone}\n*Address:* ${address}, PIN: ${pincode}\n\nPlease verify and dispatch. Thank you!`;
    return `https://wa.me/919882070999?text=${encodeURIComponent(text)}`;
  };

  // 6. "Someone recently bought..." Conversion Popup States
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const [recentPopupIdx, setRecentPopupIdx] = useState(0);
  const recentPurchases = [
    { name: 'Ray-Ban Wayfarer Classic', time: '12 minutes ago', location: 'Hanumangarh Town' },
    { name: 'Titan Neo Classic Quartz', time: '42 minutes ago', location: 'Sangaria' },
    { name: 'Fastrack Chronograph Watch', time: '8 minutes ago', location: 'Pilibanga' },
    { name: 'Ray-Ban Aviator Optical', time: '2 hours ago', location: 'Rawatsar' },
    { name: 'Titan Classic Rectangular', time: '35 minutes ago', location: 'Nohar' }
  ];

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShowRecentPopup(true);
    }, 4000);

    const interval = setInterval(() => {
      setShowRecentPopup(false);
      setTimeout(() => {
        setRecentPopupIdx((prev) => (prev + 1) % recentPurchases.length);
        setShowRecentPopup(true);
      }, 500);
    }, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [recentPurchases.length]);

  // Filter products for shop grid section
  const filteredShopProducts = products.filter(product => {
    if (selectedShopCategory === 'all') return true;
    return product.category === selectedShopCategory;
  });

  return (
    <div className="relative overflow-hidden bg-charcoal min-h-screen text-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Store Shield Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-[#C9A84C]/20 text-[10px] sm:text-xs font-semibold text-[#C9A84C] tracking-wider uppercase">
          <Shield className="w-3.5 h-3.5" />
          <span>GSTIN: 08AZYPK6147M2ZC &bull; AUTHORISED RETAILER</span>
        </div>
      </div>

      {/* 1. HERO SLIDER SECTION */}
      <section 
        className="relative w-full overflow-hidden py-10 md:py-16"
        onMouseEnter={() => setHeroHover(true)}
        onMouseLeave={() => setHeroHover(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="relative aspect-[16/10] md:aspect-[21/9] w-full bg-surface/50 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-between p-6 md:p-12 shadow-2xl">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.02] z-0 overflow-hidden">
              <span className="font-display text-[15vw] font-black tracking-[0.1em] text-white">
                {heroSlides[activeSlide].bgWord}
              </span>
            </div>

            {/* Left Column details */}
            <div className="w-full md:w-1/2 space-y-4 md:space-y-6 z-10 text-left">
              <span className="text-[10px] md:text-xs font-extrabold text-[#C9A84C] tracking-[0.2em] uppercase block">
                {heroSlides[activeSlide].subtitle}
              </span>
              
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-wider text-white">
                {heroSlides[activeSlide].title}
              </h2>
              
              <p className="text-[10px] md:text-xs text-gray-400 italic font-medium">
                {heroSlides[activeSlide].urgency}
              </p>

              <div className="flex items-center space-x-4 pt-2">
                <Link href={heroSlides[activeSlide].link}>
                  <Button size="sm" className="bg-[#C9A84C] hover:bg-white text-charcoal font-bold uppercase tracking-wider text-[10px] md:text-xs px-5 py-2.5 rounded-md transition-colors">
                    {heroSlides[activeSlide].ctaText}
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex border-white/20 hover:border-[#C9A84C] text-[10px] md:text-xs uppercase tracking-wider font-bold">
                    <Camera className="w-3.5 h-3.5 mr-1.5 text-[#C9A84C]" />
                    Virtual Mirror
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column Parallax Visual */}
            <div className="hidden md:flex w-1/2 h-full items-center justify-center relative z-10">
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 group">
                <div className="absolute inset-4 bg-[#C9A84C]/5 rounded-full blur-2xl group-hover:bg-[#C9A84C]/15 transition-all duration-700" />
                
                <Image
                  src={heroSlides[activeSlide].image}
                  alt={heroSlides[activeSlide].title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain transform rotate-[-3deg] group-hover:rotate-[1deg] scale-95 group-hover:scale-100 transition-all duration-700 ease-out"
                />

                {/* Hongo sticker badge */}
                <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-[#C9A84C] border border-white/80 flex flex-col items-center justify-center text-charcoal shadow-lg animate-bounce-gentle">
                  <span className="text-[7px] font-extrabold uppercase tracking-widest text-charcoal/80">EXCLUSIVE</span>
                  <span className="text-[10px] font-black text-center px-1 leading-none mt-1">
                    {heroSlides[activeSlide].badgeText}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 bg-charcoal/70 hover:bg-[#C9A84C] text-gray-400 hover:text-charcoal flex items-center justify-center transition-all z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 h-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 bg-charcoal/70 hover:bg-[#C9A84C] text-gray-400 hover:text-charcoal flex items-center justify-center transition-all z-20"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 md:w-5 h-5" />
            </button>

            {/* Indicators Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-20">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? 'w-6 bg-[#C9A84C]' : 'w-1.5 bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 2. DIRECT ORDER / SHOP SECTION */}
      <SectionWrapper
        title="Trending Catalog & Instant checkout"
        subtitle="SHOP COLLECTION"
        size="md"
        id="shop-grid"
      >
        {/* Tab category selectors */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/5 pb-6">
          <p className="text-xs text-gray-400 text-left">
            Select items. Place orders instantly. Skip cart steps with instant WhatsApp confirmation.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'glasses', label: 'Eyeglasses' },
              { id: 'sunglasses', label: 'Sunglasses' },
              { id: 'watches', label: 'Watches' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedShopCategory(tab.id)}
                className={`px-3.5 py-2 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedShopCategory === tab.id
                    ? 'bg-[#C9A84C] text-charcoal border-transparent font-extrabold shadow-[0_0_12px_rgba(201,168,76,0.25)]'
                    : 'bg-surface border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog loader */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#C9A84C] animate-spin" />
            <p className="text-xs text-gray-450">Loading store collection...</p>
          </div>
        )}

        {/* Empty catalog */}
        {!isLoading && filteredShopProducts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-400">No products listed in this collection.</p>
          </div>
        )}

        {/* Product Grid Mapping */}
        {!isLoading && filteredShopProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredShopProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickBuy={openQuickOrder}
              />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* 3. PRODUCT COMPARISON BAR */}
      <ComparisonBar
        items={compareList}
        onRemove={removeFromCompare}
        onClear={clearCompare}
      />

      {/* 4. BRAND EDITORIAL SPOTLIGHT */}
      <SectionWrapper
        title="Authorized Brand Spotlights"
        subtitle="DESIGNER LABELS"
        size="lg"
        id="spotlights"
      >
        <SpotlightSection />
      </SectionWrapper>

      {/* 5. BACKLIT BRANDS LOGO SHOWCASE */}
      <SectionWrapper
        title="Authorized Wear Showcase"
        subtitle="OFFICIAL BRANDS"
        size="md"
        id="brand-logos"
      >
        <BrandShowcase />
      </SectionWrapper>

      {/* 6. TIMELINE AR TRY ON STEPS */}
      <SectionWrapper
        title="How Virtual Try-On Works"
        subtitle="SMART FIT MIRROR"
        size="lg"
        id="tryon-timeline"
      >
        <TryOnSteps />
      </SectionWrapper>

      {/* 7. STORE VISIT LOCATOR SECTION */}
      <SectionWrapper
        title="Flagship Retail Outlet"
        subtitle="STORE LOCATOR"
        size="md"
        id="store-visit"
      >
        <StoreLocator />
      </SectionWrapper>

      {/* 8. AUTO SCROLL CAROUSEL TESTIMONIALS */}
      <SectionWrapper
        title="Client Testimonials"
        subtitle="CLIENT FEEDBACK"
        size="md"
        id="testimonials-slider"
      >
        <Testimonials />
      </SectionWrapper>

      {/* 9. INSTAGRAM UGC FEED STRIP */}
      <SectionWrapper
        title="Shop Customer Looks"
        subtitle="INSTAGRAM STYLE"
        size="md"
        id="ugc-strip"
      >
        <UGCStrip />
      </SectionWrapper>

      {/* 10. REFERRAL LOYALTY TEASER */}
      <SectionWrapper
        size="sm"
        id="referral-teaser"
        className="mb-16"
      >
        <LoyaltyTeaser />
      </SectionWrapper>

      {/* 11. QUICK ORDER FORM MODAL */}
      {selectedProductForOrder && (
        <Modal 
          isOpen={!!selectedProductForOrder} 
          onClose={() => setSelectedProductForOrder(null)} 
          title="Instant Checkout Form"
        >
          {!orderSuccessData ? (
            <form onSubmit={handleQuickOrderSubmit} className="space-y-4">
              
              <div className="flex items-center space-x-3.5 p-3.5 bg-charcoal rounded border border-white/10 mb-2">
                <div className="relative w-12 h-12 rounded overflow-hidden border border-white/5 shrink-0 bg-white/5">
                  <Image
                    src={selectedProductForOrder.image_url}
                    alt={selectedProductForOrder.name}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-wider capitalize">{selectedProductForOrder.category}</h4>
                  <h3 className="text-xs font-bold text-white leading-tight font-display line-clamp-1">{selectedProductForOrder.name}</h3>
                  <p className="text-xs text-[#C9A84C] font-extrabold mt-0.5">₹{selectedProductForOrder.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <Input
                label="10-Digit Phone Number"
                type="tel"
                placeholder="Indian mobile number (e.g. 9882070999)"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Textarea
                label="Detailed Shipping Address"
                placeholder="Street address, house number, landmarks..."
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <Input
                label="6-Digit PIN Code"
                type="text"
                placeholder="e.g. 335513"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />

              <div className="pt-2 flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs uppercase tracking-wider font-bold py-2.5 rounded-md border-white/10"
                  onClick={() => setSelectedProductForOrder(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 text-xs uppercase tracking-wider font-bold text-charcoal bg-[#C9A84C] py-2.5 rounded-md hover:bg-white transition-colors" 
                  isLoading={isSubmittingOrder}
                >
                  Instant Order
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center p-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Instant Order Logged!</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Your purchase request for <strong>{orderSuccessData.productName}</strong> has been logged with Order ID <strong>{orderSuccessData.orderId.substring(0, 8)}...</strong>
                </p>
                <p className="text-[11px] text-[#C9A84C] font-semibold">
                  Send details via WhatsApp to verify shipping dispatch immediately.
                </p>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a href={getWhatsAppOrderLink()} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white border-transparent py-2.5 rounded-md">
                    Send WhatsApp Dispatch
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="text-xs font-bold uppercase tracking-wider border-white/10 py-2.5 rounded-md"
                  onClick={() => setSelectedProductForOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* 12. "Someone recently bought..." REPLICA POPUP */}
      <div 
        className={`fixed bottom-4 left-4 z-40 max-w-[280px] md:max-w-[320px] bg-surface/95 border border-[#C9A84C]/45 shadow-2xl p-3 md:p-4 rounded-xl flex items-start space-x-3 backdrop-blur-md transition-all duration-700 ease-in-out transform ${
          showRecentPopup ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <span className="p-2 bg-charcoal rounded-lg border border-[#C9A84C]/25 text-[#C9A84C] shrink-0 mt-0.5 animate-pulse">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </span>
        <div className="text-left flex-grow">
          <h4 className="text-[10px] md:text-xs font-bold text-white font-display line-clamp-1">
            {recentPurchases[recentPopupIdx].name}
          </h4>
          <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5 leading-tight">
            Bought recently in <strong>{recentPurchases[recentPopupIdx].location}</strong>
          </p>
          <p className="text-[8px] text-[#C9A84C] font-semibold uppercase tracking-wider mt-1">
            {recentPurchases[recentPopupIdx].time}
          </p>
        </div>
        <button 
          onClick={() => setShowRecentPopup(false)}
          className="text-gray-500 hover:text-white transition-colors p-0.5 rounded-full"
          aria-label="Close Notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
