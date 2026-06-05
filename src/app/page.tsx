import React from 'react';
import Link from 'next/link';
import { Glasses, Watch, Shield, Camera, Send, CheckCircle, Store, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function Home() {
  const categories = [
    {
      name: 'Designer Eyeglasses',
      description: 'Elegant metal and acetate frames designed for all face shapes.',
      categorySlug: 'glasses',
      icon: Glasses,
      btnText: 'Try On Eyeglasses',
      image: '/images/showcase_glasses.jpg', // Cloudinary fallback handles this
    },
    {
      name: 'Fashion Sunglasses',
      description: 'UV protection with pre-baked tints for maximum style.',
      categorySlug: 'sunglasses',
      icon: Glasses,
      btnText: 'Try On Sunglasses',
      image: '/images/showcase_sunglasses.jpg',
    },
    {
      name: 'Premium Watches',
      description: 'Analog, quartz, and chronograph wrist wear for every occasion.',
      categorySlug: 'watches',
      icon: Watch,
      btnText: 'Try On Watches',
      image: '/images/showcase_watches.jpg',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-amber-500/20 text-xs font-semibold text-[#d4af37] tracking-wider uppercase mb-6 animate-pulse-gold">
          <Shield className="w-3.5 h-3.5" />
          <span>GSTIN: 08AZYPK6147M2ZC</span>
        </div>

        <h1 className="font-luxury text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Virtual Try-On <br />
          <span className="bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] bg-clip-text text-transparent">
            Hariyana Watch & Opticals
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 mb-10 leading-relaxed">
          Experience our premium collection of eyeglasses, sunglasses, and luxury watches directly from your browser. 
          Our WebGL-accelerated try-on runs entirely client-side for zero-cost, high-speed matching.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/products">
            <Button size="lg" className="w-full sm:w-auto">
              Browse Collection
            </Button>
          </Link>
          <Link href="/products?category=glasses">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Glasses className="w-5 h-5 mr-2" />
              Try On Eyeglasses
            </Button>
          </Link>
        </div>
      </section>

      {/* Store Information Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <Card className="border-[#d4af37]/30 bg-[#0b132b]/80 relative overflow-hidden">
          <div className="scanline" />
          <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="p-4 bg-[#1c2541] rounded-full border border-[#d4af37]/30">
                <Store className="w-8 h-8 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Hariyana Watch & Opticals</h2>
                <p className="text-sm text-gray-300 max-w-lg">
                  Located at <strong>52 Main Bus Stand, Hanumangarh Town, Rajasthan</strong>. Owned and managed by <strong>Vinod Kumar</strong>. Offering expert optical consultation and clock services since 1999.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
              <a href="tel:+919828207999" className="flex-1">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <User className="w-4 h-4 mr-2" />
                  Call Vinod: 98282-07999
                </Button>
              </a>
              <a href="tel:+918526200444" className="flex-1">
                <Button variant="secondary" className="w-full flex items-center justify-center">
                  Call Shop: 85262-00444
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Interactive Try-On Flow description */}
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

      {/* Category Section Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-luxury tracking-wide">
            Select Your Style
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Choose a department to start browsing and overlay items dynamically.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card key={cat.name} hoverable className="flex flex-col justify-between h-full bg-[#0b132b]/40">
                <CardContent className="p-8 flex-grow flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#1c2541] rounded-md flex items-center justify-center border border-[#d4af37]/20 mb-6">
                    <Icon className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-luxury">{cat.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">{cat.description}</p>
                </CardContent>
                <div className="px-8 pb-8 pt-0">
                  <Link href={`/products?category=${cat.categorySlug}`}>
                    <Button variant="outline" className="w-full">
                      {cat.btnText}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Shop Reliability Banner */}
      <section className="bg-[#0b132b]/50 border-y border-[#d4af37]/10 py-12 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <CheckCircle className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold">100% Genuine</h4>
            <p className="text-xs text-gray-400 mt-1">Branded products</p>
          </div>
          <div className="p-4">
            <Store className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold">In-Store Pickup</h4>
            <p className="text-xs text-gray-400 mt-1">Hanumangarh Bus Stand</p>
          </div>
          <div className="p-4">
            <Send className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold">WhatsApp Support</h4>
            <p className="text-xs text-gray-400 mt-1">Quick confirmation</p>
          </div>
          <div className="p-4">
            <Camera className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
            <h4 className="text-white font-bold">Free Browser Try-On</h4>
            <p className="text-xs text-gray-400 mt-1">No sign-up required</p>
          </div>
        </div>
      </section>
    </div>
  );
}
