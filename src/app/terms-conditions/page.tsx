import React from 'react';
import type { Metadata } from 'next';
import { Scale, FileText, ShoppingBag, AlertCircle, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Hariyana Watch & Opticals',
  description: 'Review the terms of service, billing policies, purchase agreements, and legal conditions at Hariyana Watch & Opticals.',
  alternates: {
    canonical: 'https://hariyana-watch-opticals.vercel.app/terms-conditions',
  },
  openGraph: {
    title: 'Terms & Conditions | Hariyana Watch & Opticals',
    description: 'Read the official terms governing store products, WebGL virtual try-on tools, and checkout transactions.',
    url: 'https://hariyana-watch-opticals.vercel.app/terms-conditions',
    type: 'website',
  },
};

export default function TermsConditionsPage() {
  return (
    <div className="bg-[#050c14] min-h-screen text-gray-300 pb-20 relative overflow-hidden">
      {/* Luxury Background Overlay */}
      <div className="absolute inset-0 luxury-grid-overlay opacity-80" />

      {/* Hero Header */}
      <section className="relative py-20 border-b border-[#c7a14e]/15 bg-[#0b131e]/20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center items-center gap-2 text-xs text-gray-500 uppercase tracking-widest mb-4">
            <a href="/" className="hover:text-[#c7a14e] transition-colors">Home</a>
            <span>/</span>
            <span className="text-[#c7a14e] font-semibold">Terms &amp; Conditions</span>
          </nav>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">STORE CONDITIONS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed">
            Please read these terms and conditions carefully before using our digital store or completing a purchase.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-10 text-sm sm:text-base font-light leading-relaxed">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#c7a14e]">
            <Scale className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">1. Agreement to Terms</h2>
          </div>
          <p className="text-gray-400">
            By accessing or placing checkout orders on `hariyanawatchopticals.com`, you agree to be bound by these Terms of Service. If you do not agree to all terms, you are prohibited from utilizing our digital store or placing checkout inquiries.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#c7a14e]">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">2. Product Pricing &amp; Discounts</h2>
          </div>
          <p className="text-gray-400">
            We strive to display precise pricing. All products listed across the homepage and catalogs carry a **20% storewide discount** off the original price. This final checkout amount is presented in the Checkout Modal. In cases of manual data input discrepancies, we reserve the right to correct pricing before confirming order packaging over WhatsApp.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#c7a14e]">
            <FileText className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">3. Checkout and UPI Payments</h2>
          </div>
          <p className="text-gray-400">
            Order finalization requires verifying payments:
          </p>
          <p className="text-gray-400">
            Our checkout redirects the customer to a payment receipt invoice containing our UPI QR code. The customer must upload their payment screenshot and enter their 12-digit transaction UTR number to submit their receipt. The order finalization is coordinated directly over WhatsApp with our showroom representatives. Order dispatches are only executed once transaction settlement is verified in our bank ledger.
          </p>
        </div>

        <div className="space-y-4 border-t border-gray-800 pt-8">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">4. Limitation of Liability</h2>
          </div>
          <p className="text-gray-400">
            Hariyana Watch &amp; Opticals and its founders are not liable for direct, incidental, or consequential damages resulting from the use or inability to use this digital store, including WebGL browser freezes during try-on simulations, or courier tracking transit delays.
          </p>
        </div>

      </section>

    </div>
  );
}
