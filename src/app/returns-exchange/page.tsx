import React from 'react';
import type { Metadata } from 'next';
import { RefreshCw, CheckCircle2, Clock, ShieldAlert, Phone, Mail, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Exchange | Hariyana Watch & Opticals',
  description: 'Learn about our easy 7-day return and exchange policy for watches, smartwatches, and optical frames at Hariyana.',
  alternates: {
    canonical: 'https://hariyana-watch-opticals.vercel.app/returns-exchange',
  },
  openGraph: {
    title: 'Returns & Exchange | Hariyana Watch & Opticals',
    description: 'Get simplified instructions on how to return, replace, or exchange products purchased from our showroom.',
    url: 'https://hariyana-watch-opticals.vercel.app/returns-exchange',
    type: 'website',
  },
};

export default function ReturnsExchangePage() {
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
            <span className="text-[#c7a14e] font-semibold">Returns &amp; Exchange</span>
          </nav>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">Customer Support</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            Returns &amp; Exchange
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed">
            We value your trust. Read our simplified guidelines on returns, replacements, and quick refund settlements.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-12">
        
        {/* Core Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Return Eligibility */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#c7a14e]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Return Eligibility</h2>
            </div>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              We offer a hassle-free 7-day return policy on all eligible timepieces and optical wear. To be eligible for a full return:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Products must be completely unworn, unused, and undamaged.</li>
              <li>Must remain in original retail packaging with all protective stickers, seals, tags, and barcode cards intact.</li>
              <li>Include the original invoice receipt and stamped warranty booklet.</li>
              <li>Customized prescription lenses fitted onto frames are non-returnable.</li>
            </ul>
          </div>

          {/* Exchange Policy */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#c7a14e]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Exchange Policy</h2>
            </div>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Want a different model, frame size, or strap color? Exchanges are supported within 7 days of shipment:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Item can be exchanged for any product of equivalent or higher value.</li>
              <li>If exchanging for an item of higher value, the price difference must be cleared before dispatch.</li>
              <li>One free exchange is provided per order; subsequent swaps carry shipping handling charges.</li>
            </ul>
          </div>

        </div>

        {/* Process & Timeline Banner */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#c7a14e]/20 bg-gradient-to-r from-[#0b131e]/80 to-[#070b12] space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.2em] uppercase">STEP-BY-STEP</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Replacement &amp; Return Process</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-light">
            <div className="space-y-2">
              <span className="text-lg font-bold text-[#c7a14e] font-display block">01. Request</span>
              <p className="text-gray-400 text-sm">Initiate a request by emailing or messaging us on WhatsApp with your Order ID and item pictures.</p>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-bold text-[#c7a14e] font-display block">02. Inspect</span>
              <p className="text-gray-400 text-sm">Ship the item back to our Hanumangarh showroom. Our watchmakers &amp; frame specialists inspect condition.</p>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-bold text-[#c7a14e] font-display block">03. Resolve</span>
              <p className="text-gray-400 text-sm">Upon approval, your replacement model is shipped out immediately, or your refund is initiated.</p>
            </div>
          </div>
        </div>

        {/* Refund Timeline & Damage Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Refund Timeline */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#c7a14e]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Refund Timeline</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Once your returned package reaches our warehouse and passes quality inspections:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Refunds are initiated back to the original payment source within **3-5 business days**.</li>
              <li>For Cash on Delivery (COD) orders, refunds are settled via bank transfer or UPI transfer as chosen by the customer.</li>
              <li>A digital refund invoice is sent to your registered email for tracking.</li>
            </ul>
          </div>

          {/* Damaged Policy */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider text-red-400">Damaged / Defect Policy</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Every shipment is packed under CCTV cameras to verify items. In the rare case of transit damage:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Report transit damage or structural defects within **24 hours** of delivery.</li>
              <li>Please provide a clear unboxing video showing the shipping label and the defect.</li>
              <li>Hariyana Opticals coordinates immediate pickup and ships a fresh replacement unit at zero cost.</li>
            </ul>
          </div>

        </div>

        {/* Support Section */}
        <div className="border-t border-gray-800 pt-10 text-center space-y-4">
          <h3 className="font-display text-xl font-bold text-white">Need Assistance with a Return?</h3>
          <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto font-light">Contact our dedicated support desk to resolve queries or track return shipments.</p>
          <div className="flex flex-wrap justify-center gap-6 pt-2 text-sm">
            <a href="tel:+919828207999" className="flex items-center gap-2 hover:text-[#c7a14e] transition-colors">
              <Phone className="w-4 h-4 text-[#c7a14e]" />
              <span>+91 98282-07999</span>
            </a>
            <a href="mailto:hariyanaoptical49@gmail.com" className="flex items-center gap-2 hover:text-[#c7a14e] transition-colors">
              <Mail className="w-4 h-4 text-[#c7a14e]" />
              <span>hariyanaoptical49@gmail.com</span>
            </a>
          </div>
        </div>

      </section>

    </div>
  );
}
