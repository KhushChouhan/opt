'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { 
  Glasses, Shield, Camera, Send, CheckCircle, 
  Store, User, Star, ChevronLeft, ChevronRight, X, 
  ShoppingCart, Flame, AlertCircle, RefreshCw 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Seeded local fallback products (in case database has delay in API loading)
const fallbackProducts: Product[] = [
  {
    id: 'titan-classic',
    name: 'Titan Classic Rectangular',
    category: 'glasses',
    price: 1499.00,
    description: 'Elegant rectangular eyeglasses with a matte black metal frame. Perfect for daily office wear.',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_glasses_product.jpg',
    overlay_image_url: '/images/overlays/glasses_classic.png',
    stock: 15
  },
  {
    id: 'rayban-aviator',
    name: 'Ray-Ban Aviator Optical',
    category: 'glasses',
    price: 4500.00,
    description: 'Timeless gold metal wireframe aviator eyeglasses. Light, comfortable, and durable.',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_glasses_gold.jpg',
    overlay_image_url: '/images/overlays/glasses_gold.png',
    stock: 8
  },
  {
    id: 'fastrack-sporty',
    name: 'Fastrack Sporty Sunglasses',
    category: 'sunglasses',
    price: 2199.00,
    description: 'Aero-dynamic sports sunglasses with UV protection and a sleek wrap-around profile.',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_sunglasses_sports.jpg',
    overlay_image_url: '/images/overlays/sunglasses_sports.png',
    stock: 20
  },
  {
    id: 'rayban-wayfarer',
    name: 'Ray-Ban Wayfarer Classic',
    category: 'sunglasses',
    price: 8999.00,
    description: 'The iconic wayfarer sunglasses with green classic G-15 tinted lenses. Absolute style statement.',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_sunglasses_wayfarer.jpg',
    overlay_image_url: '/images/overlays/sunglasses_wayfarer.png',
    stock: 5
  },
  {
    id: 'titan-neo',
    name: 'Titan Neo Classic Quartz',
    category: 'watches',
    price: 3299.00,
    description: 'Classic analog watch with a brown leather strap and deep navy blue dial. Perfect for formal wear.',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_watch_titan.jpg',
    overlay_image_url: '/images/overlays/watch_classic.png',
    stock: 12
  },
  {
    id: 'fastrack-chrono',
    name: 'Fastrack Chronograph Watch',
    category: 'watches',
    price: 4495.00,
    description: 'Active black steel chronograph watch with multi-dial display and dynamic red accents.',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_watch_fastrack.jpg',
    overlay_image_url: '/images/overlays/watch_sporty.png',
    stock: 10
  }
];

export default function Home() {
  const router = useRouter();
  
  // API Fetch SWR
  const { data: dbProducts, isLoading } = useSWR<Product[]>('/api/products', fetcher);
  const products = dbProducts || fallbackProducts;

  // 1. Hero Slider States
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = [
    {
      subtitle: 'ITALIAN BRAND OF LUXURY SUNGLASSES',
      title: 'Looking cool by doing good',
      badgeText: 'START FROM ₹2,199',
      image: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_sunglasses_wayfarer.jpg',
      link: '/products?category=sunglasses',
      bgWord: 'SUNGLASSES',
      ctaText: 'Shop Sunglasses',
      highlightColor: '#d4af37'
    },
    {
      subtitle: 'PREMIUM CRAFTSMANSHIP & HERITAGE',
      title: 'Timepieces for the bold wrist',
      badgeText: 'GENUINE WARRANTY',
      image: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_watch_titan.jpg',
      link: '/products?category=watches',
      bgWord: 'WATCHES',
      ctaText: 'Shop Luxury Watches',
      highlightColor: '#d4af37'
    },
    {
      subtitle: 'REFINED TITANIUM & ACETATE',
      title: 'Clarify your sight in style',
      badgeText: 'TRY-ON IN MIRROR',
      image: 'https://res.cloudinary.com/demo/image/upload/v1672322322/sample_glasses_product.jpg',
      link: '/products?category=glasses',
      bgWord: 'EYEGLASSES',
      ctaText: 'Shop Eyeglasses',
      highlightColor: '#d4af37'
    }
  ];

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // 2. Direct Order Shop Section states
  const [selectedShopCategory, setSelectedShopCategory] = useState<string>('all');
  
  // Quick Checkout Modal states
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

  // Generate WhatsApp Deep Link
  const getWhatsAppLink = () => {
    if (!orderSuccessData) return '#';
    const text = `Hello Hariyana Watch & Opticals,\n\nI just placed an order on your website! Here are my details:\n\n*Order ID:* ${orderSuccessData.orderId}\n*Product Ordered:* ${orderSuccessData.productName}\n*Customer Name:* ${customerName}\n*Phone Number:* ${phone}\n*Delivery Address:* ${address}, PIN: ${pincode}\n\nPlease verify and confirm my order. Thank you!`;
    return `https://wa.me/919828207999?text=${encodeURIComponent(text)}`;
  };

  // 3. Testimonials Slider States
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    {
      quote: "The virtual mirror try-on for glasses is unbelievably accurate! I was skeptical at first, but when the frame loaded on my face and tracked my head movements smoothly, I was sold. Ordered a Ray-Ban frame and it fits exactly as shown.",
      author: "Rajesh Sharma",
      role: "Verified Buyer",
      location: "Hanumangarh, Rajasthan",
      stars: 5
    },
    {
      quote: "Vinod and the shop staff have been serving our family for a decade, but this website is a massive upgrade. Calibrating the watch size directly on screen and ordering via WhatsApp is seamless. The Fastrack watch was delivered within 48 hours.",
      author: "Anjali Verma",
      role: "Corporate Executive",
      location: "Sri Ganganagar, Rajasthan",
      stars: 5
    },
    {
      quote: "Fantastic experience! The subpixel EMA smoothing keeps the try-on overlay perfectly stable on your face. Ordering directly from the home page took less than 2 minutes, and WhatsApp customer service was extremely fast in confirming.",
      author: "Vikram Singh",
      role: "Tech Enthusiast",
      location: "Jaipur, Rajasthan",
      stars: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // 4. "Someone recently bought..." Conversion Popup States
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
    // Show popup after 3 seconds, then cycle every 12 seconds
    const initialTimer = setTimeout(() => {
      setShowRecentPopup(true);
    }, 3000);

    const interval = setInterval(() => {
      setShowRecentPopup(false);
      setTimeout(() => {
        setRecentPopupIdx((prev) => (prev + 1) % recentPurchases.length);
        setShowRecentPopup(true);
      }, 500); // Small delay for fade transition
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [recentPurchases.length]);

  // Filter products for direct shop section
  const filteredShopProducts = products.filter(product => {
    if (selectedShopCategory === 'all') return true;
    return product.category === selectedShopCategory;
  });

  const getOptimizedImageUrl = (url: string) => {
    if (url.includes('res.cloudinary.com')) {
      const splitUrl = url.split('/upload/');
      if (splitUrl.length === 2) {
        return `${splitUrl[0]}/upload/f_auto,q_auto,w_400,c_limit/${splitUrl[1]}`;
      }
    }
    return url;
  };

  return (
    <div className="relative overflow-hidden bg-[#060b13] min-h-screen text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* GSTIN Floating Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-amber-500/20 text-[10px] sm:text-xs font-semibold text-[#d4af37] tracking-wider uppercase">
          <Shield className="w-3.5 h-3.5" />
          <span>GSTIN: 08AZYPK6147M2ZC</span>
        </div>
      </div>

      {/* 1. HONGO-STYLE PREMIUM HERO SLIDER */}
      <section className="relative w-full overflow-hidden py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Active slide container */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-[#0b132b]/35 border border-gray-800/80 rounded-2xl overflow-hidden flex items-center justify-between p-6 md:p-12 shadow-2xl">
            
            {/* Background Big Typography Watermark */}
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.03] z-0 overflow-hidden">
              <span className="font-luxury text-[14vw] font-black tracking-[0.1em] text-white">
                {heroSlides[activeSlide].bgWord}
              </span>
            </div>

            {/* Slide Left Information (Transitioning) */}
            <div className="w-full md:w-1/2 space-y-4 md:space-y-6 z-10 text-left">
              <span className="text-[10px] md:text-xs font-extrabold text-[#d4af37] tracking-[0.2em] uppercase block">
                {heroSlides[activeSlide].subtitle}
              </span>
              
              <h2 className="font-luxury text-2xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-wider text-white">
                {heroSlides[activeSlide].title}
              </h2>
              
              <div className="flex items-center space-x-4">
                <Link href={heroSlides[activeSlide].link}>
                  <Button size="sm" className="md:size-md font-bold uppercase tracking-wider text-[10px] md:text-xs">
                    {heroSlides[activeSlide].ctaText}
                  </Button>
                </Link>
                
                {/* Floating try-on action */}
                <Link href="/products">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex border-gray-700 hover:border-[#d4af37] text-[10px] md:text-xs uppercase tracking-wider font-bold">
                    <Camera className="w-3.5 h-3.5 mr-1.5 text-[#d4af37]" />
                    Virtual Mirror
                  </Button>
                </Link>
              </div>
            </div>

            {/* Slide Right Showcase Visual (Image & Badge) */}
            <div className="hidden md:flex w-1/2 h-full items-center justify-center relative z-10">
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 group">
                {/* Circular background glow */}
                <div className="absolute inset-4 bg-[#d4af37]/10 rounded-full blur-2xl group-hover:bg-[#d4af37]/20 transition-all duration-700" />
                
                <Image
                  src={heroSlides[activeSlide].image}
                  alt={heroSlides[activeSlide].title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain transform rotate-[-4deg] group-hover:rotate-[0deg] scale-95 group-hover:scale-100 transition-all duration-700"
                />

                {/* Hongo Circle sticker badge */}
                <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-[#d4af37] border-2 border-white/80 flex flex-col items-center justify-center text-[#060b13] shadow-lg animate-bounce-gentle">
                  <span className="text-[7px] font-extrabold uppercase tracking-widest text-[#060b13]/80">EXCLUSIVE</span>
                  <span className="text-[10px] font-black text-center px-1 leading-none mt-1">
                    {heroSlides[activeSlide].badgeText}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Navigation Controls */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-800 bg-[#060b13]/70 hover:bg-[#d4af37] text-gray-400 hover:text-[#060b13] flex items-center justify-center transition-all z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 h-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-800 bg-[#060b13]/70 hover:bg-[#d4af37] text-gray-400 hover:text-[#060b13] flex items-center justify-center transition-all z-20"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 md:w-5 h-5" />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeSlide ? 'w-6 bg-[#d4af37]' : 'w-1.5 bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 2. DIRECT ORDER / SHOP SECTION (Instant Shop Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="text-left">
            <span className="text-[10px] font-bold text-[#d4af37] tracking-[0.25em] uppercase">SHOP COLLECTION</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-luxury tracking-wide mt-1 text-white">
              Trending Products & Instant Order
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              Browse hot items. Place a custom order instantly with zero redirection.
            </p>
          </div>

          {/* Quick shop category selectors */}
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
                className={`px-3.5 py-1.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedShopCategory === tab.id
                    ? 'bg-[#d4af37] text-[#060b13] border-transparent font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                    : 'bg-[#1c2541]/30 border-gray-800 text-gray-400 hover:text-white hover:bg-[#1c2541]/65'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States for Direct Shop */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
            <p className="text-xs text-gray-400">Loading catalog items...</p>
          </div>
        )}

        {!isLoading && filteredShopProducts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <p className="text-xs text-gray-400">No products available in this category.</p>
          </div>
        )}

        {/* Product Shop Grid */}
        {!isLoading && filteredShopProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredShopProducts.slice(0, 8).map((product) => {
              const tryOnLink = product.category === 'watches'
                ? `/try-on/watches/${product.id}`
                : `/try-on/glasses/${product.id}`;
              const isOutofStock = product.stock <= 0;

              return (
                <Card key={product.id} className="bg-[#0b132b]/40 border border-gray-850 hover:border-[#d4af37]/45 transition-all duration-300 flex flex-col justify-between group h-full">
                  <div className="relative aspect-square w-full bg-black/10 overflow-hidden rounded-t-lg">
                    <Image
                      src={getOptimizedImageUrl(product.image_url)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    {isOutofStock ? (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wider rounded">
                        Out of Stock
                      </span>
                    ) : product.stock <= 8 ? (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-[#060b13] text-[9px] font-extrabold uppercase tracking-widest rounded animate-pulse">
                        LOW STOCK
                      </span>
                    ) : null}

                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 text-[#f3e5ab] text-[9px] font-bold uppercase tracking-wider rounded capitalize">
                      {product.category}
                    </span>
                  </div>

                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-luxury group-hover:text-[#d4af37] transition-colors leading-tight line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed h-[3em]">
                        {product.description || 'No description available.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 mt-2">
                      <span className="text-[#d4af37] font-bold text-sm">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {product.stock > 0 ? `${product.stock} units left` : 'Sold out'}
                      </span>
                    </div>
                  </CardContent>

                  {/* Quick actions footer */}
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => router.push(tryOnLink)}
                      disabled={isOutofStock}
                      className="flex-1 py-1.5 bg-transparent border border-gray-700 hover:border-[#d4af37] text-gray-300 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Try On AR
                    </button>
                    <button
                      onClick={() => openQuickOrder(product)}
                      disabled={isOutofStock}
                      className="flex-1 py-1.5 bg-[#d4af37] text-[#060b13] hover:bg-[#d4af37]/90 rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                      <span>Quick Buy</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </section>

      {/* 3. STORE INFORMATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <Card className="border-[#d4af37]/35 bg-[#0b132b]/80 relative overflow-hidden">
          <div className="scanline" />
          <CardContent className="p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5 text-left">
              <div className="p-4 bg-[#1c2541] rounded-full border border-[#d4af37]/30 shrink-0">
                <Store className="w-8 h-8 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 font-luxury">Hariyana Watch & Opticals</h2>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                  Located at <strong>52 Main Bus Stand, Hanumangarh Town, Rajasthan</strong>. Owned and managed by <strong>Vinod Kumar</strong>. Offering expert optical consultation and clock services since 1999.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-gray-800 pt-4 lg:pt-0">
              <a href="tel:+919828207999" className="flex-1">
                <Button variant="outline" className="w-full flex items-center justify-center text-xs py-2 uppercase font-bold tracking-wider">
                  <User className="w-4 h-4 mr-2 text-[#d4af37]" />
                  Call Vinod: 98282-07999
                </Button>
              </a>
              <a href="tel:+918526200444" className="flex-1">
                <Button variant="secondary" className="w-full flex items-center justify-center text-xs py-2 uppercase font-bold tracking-wider">
                  Call Shop: 85262-00444
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. PREMIUM BRANDS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="text-[10px] font-bold text-[#d4af37] tracking-[0.25em] uppercase">OFFICIAL BRANDS</span>
        <h2 className="text-2xl sm:text-3xl font-bold font-luxury tracking-wide mt-1 mb-8 text-white">
          Authorized Wear Showcase
        </h2>
        
        {/* Brand grids */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { name: 'Ray-Ban', type: 'Eyewear' },
            { name: 'Fastrack', type: 'Eyewear & Watches' },
            { name: 'Titan', type: 'Eyewear & Watches' },
            { name: 'Oakley', type: 'Eyewear' },
            { name: 'Casio', type: 'Watches' },
            { name: 'Seiko', type: 'Watches' }
          ].map((brand) => (
            <div 
              key={brand.name} 
              className="p-5 bg-[#0b132b]/50 border border-gray-850 hover:border-[#d4af37]/40 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group cursor-default"
            >
              <span className="font-luxury text-lg md:text-xl font-bold text-white group-hover:text-[#d4af37] tracking-wider transition-colors block">
                {brand.name}
              </span>
              <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest mt-1 block">
                {brand.type}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE HOW VIRTUAL TRY-ON WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-12 font-luxury tracking-wide">
          How Virtual Try-On Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-6 bg-white/2 rounded-lg border border-gray-800 hover:border-[#d4af37]/20 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#1c2541] flex items-center justify-center border border-[#d4af37]/20 text-[#d4af37] mb-6">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 font-luxury">1. Open Camera</h3>
            <p className="text-sm text-gray-400">
              Select a product and allow camera access. Your video stays secure—no data is uploaded to our servers.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white/2 rounded-lg border border-gray-800 hover:border-[#d4af37]/20 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#1c2541] flex items-center justify-center border border-[#d4af37]/20 text-[#d4af37] mb-6">
              <Glasses className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 font-luxury">2. Interactive Tracking</h3>
            <p className="text-sm text-gray-400">
              WebGL traces landmarks on your face or wrist client-side, scaling and rotating the overlay in real time.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white/2 rounded-lg border border-gray-800 hover:border-[#d4af37]/20 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#1c2541] flex items-center justify-center border border-[#d4af37]/20 text-[#d4af37] mb-6">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 font-luxury">3. Instant Checkout</h3>
            <p className="text-sm text-gray-400">
              Take a snapshot, fill in your details, and place your order. A WhatsApp link is generated to confirm instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 6. LUXURY TESTIMONIALS SLIDER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 mb-20 text-center relative">
        <span className="text-[10px] font-bold text-[#d4af37] tracking-[0.25em] uppercase">CUSTOMER FEEDBACK</span>
        <h2 className="text-2xl sm:text-3xl font-bold font-luxury tracking-wide mt-1 mb-10 text-white">
          What Our Clients Say
        </h2>

        {/* Carousel testimonial box */}
        <div className="bg-[#0b132b]/40 border border-gray-850 p-6 md:p-10 rounded-2xl relative shadow-xl overflow-hidden min-h-[12em] flex flex-col justify-center">
          
          {/* Quote layout */}
          <div className="space-y-4 transition-all duration-500">
            <div className="flex justify-center space-x-1 text-amber-500">
              {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            
            <p className="text-sm md:text-base text-gray-200 leading-relaxed italic font-light max-w-2xl mx-auto">
              &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
            </p>
            
            <div>
              <h4 className="text-xs md:text-sm font-bold text-[#d4af37] uppercase tracking-wider font-luxury">
                {testimonials[activeTestimonial].author}
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {testimonials[activeTestimonial].role} &bull; {testimonials[activeTestimonial].location}
              </p>
            </div>
          </div>

          {/* Testimonial slider navigation dots */}
          <div className="flex items-center justify-center space-x-1.5 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeTestimonial ? 'bg-[#d4af37] w-4' : 'bg-gray-600'
                }`}
                aria-label={`Testimonial slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 7. RELIABILITY BANNERS */}
      <section className="bg-[#0b132b]/50 border-y border-[#d4af37]/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <CheckCircle className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold text-sm">100% Genuine</h4>
            <p className="text-xs text-gray-400 mt-1">Branded products</p>
          </div>
          <div className="p-4">
            <Store className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold text-sm">In-Store Pickup</h4>
            <p className="text-xs text-gray-400 mt-1">Hanumangarh Bus Stand</p>
          </div>
          <div className="p-4">
            <Send className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold text-sm">WhatsApp Support</h4>
            <p className="text-xs text-gray-400 mt-1">Quick confirmation</p>
          </div>
          <div className="p-4">
            <Camera className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold text-sm">Free Browser Try-On</h4>
            <p className="text-xs text-gray-400 mt-1">No sign-up required</p>
          </div>
        </div>
      </section>

      {/* 8. QUICK ORDER FORM CHECKOUT MODAL */}
      {selectedProductForOrder && (
        <Modal 
          isOpen={!!selectedProductForOrder} 
          onClose={() => setSelectedProductForOrder(null)} 
          title="Instant Quick Checkout"
        >
          {!orderSuccessData ? (
            <form onSubmit={handleQuickOrderSubmit} className="space-y-4">
              
              <div className="flex items-center space-x-3.5 p-3.5 bg-black/35 rounded border border-[#d4af37]/20 mb-2">
                <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-800 shrink-0">
                  <Image
                    src={selectedProductForOrder.image_url}
                    alt={selectedProductForOrder.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider capitalize">{selectedProductForOrder.category}</h4>
                  <h3 className="text-sm font-bold text-white leading-tight font-luxury line-clamp-1">{selectedProductForOrder.name}</h3>
                  <p className="text-xs text-[#d4af37] font-extrabold mt-0.5">₹{selectedProductForOrder.price.toLocaleString('en-IN')}</p>
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
                placeholder="Indian mobile number (e.g. 9828207999)"
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
                  className="flex-1 text-xs uppercase tracking-wider font-bold"
                  onClick={() => setSelectedProductForOrder(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 text-xs uppercase tracking-wider font-bold text-[#060b13] bg-[#d4af37]" 
                  isLoading={isSubmittingOrder}
                >
                  Instant Order
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center p-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-luxury">Quick Order Placed!</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Your purchase request for <strong>{orderSuccessData.productName}</strong> has been saved with Order ID <strong>{orderSuccessData.orderId.substring(0, 8)}...</strong>
                </p>
                <p className="text-[11px] text-amber-500 font-semibold">
                  Click the button below to send your purchase details via WhatsApp for instant shop dispatch verification.
                </p>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white border-transparent">
                    Send WhatsApp Confirmation &rarr;
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="text-xs font-bold uppercase tracking-wider border-gray-700"
                  onClick={() => setSelectedProductForOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* 9. "Someone recently bought..." REPLICA CONVERSION POPUP */}
      <div 
        className={`fixed bottom-4 left-4 z-40 max-w-[280px] md:max-w-[320px] bg-[#0b132b]/95 border border-[#d4af37]/35 shadow-2xl p-3 md:p-4 rounded-xl flex items-start space-x-3 backdrop-blur-md transition-all duration-700 ease-in-out transform ${
          showRecentPopup ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <span className="p-2 bg-[#1c2541] rounded-lg border border-[#d4af37]/20 text-[#d4af37] shrink-0 mt-0.5 animate-pulse">
          <Flame className="w-4 h-4 text-[#d4af37]" />
        </span>
        <div className="text-left flex-grow">
          <h4 className="text-[10px] md:text-xs font-bold text-white font-luxury line-clamp-1">
            {recentPurchases[recentPopupIdx].name}
          </h4>
          <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5 leading-tight">
            Bought recently in <strong>{recentPurchases[recentPopupIdx].location}</strong>
          </p>
          <p className="text-[8px] text-[#d4af37] font-semibold uppercase tracking-wider mt-1">
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
