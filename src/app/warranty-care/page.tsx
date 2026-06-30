import React from 'react';
import type { Metadata } from 'next';
import { Award, ShieldCheck, FileText, Settings, Phone, Mail, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Warranty & Care | Hariyana Watch & Opticals',
  description: 'Understand the warranty coverage, service procedures, and terms of care for your watches and eyewear from Hariyana showroom.',
  alternates: {
    canonical: 'https://hariyana-watch-opticals.vercel.app/warranty-care',
  },
  openGraph: {
    title: 'Warranty & Care | Hariyana Watch & Opticals',
    description: 'Learn about watch movement coverage, lens coating warranties, and certified service procedures.',
    url: 'https://hariyana-watch-opticals.vercel.app/warranty-care',
    type: 'website',
  },
};

export default function WarrantyCarePage() {
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
            <span className="text-[#c7a14e] font-semibold">Warranty Care</span>
          </nav>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">Service Policy</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            Warranty Care
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed">
            Hariyana Watch &amp; Opticals stands behind every item we sell. Access certified repairs, brand coverage, and authentic service.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-12">
        
        {/* Core Coverage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Watch Warranty */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#c7a14e]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Watch Warranty</h2>
            </div>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              We offer a minimum **1-Year Storewide Warranty** on all premium brand watches, supplemented by official brand warranties:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Covers internal watch movement mechanical defects (timekeeping accuracy, gear-train locks).</li>
              <li>Covers manufacturing faults in hands, dial design parameters, and indexes.</li>
              <li>Free battery replacements for quartz models within the first 6 months of purchase.</li>
              <li>Repairs are completed by our certified horologists in-store using genuine components.</li>
            </ul>
          </div>

          {/* Eyewear Warranty */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#c7a14e]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Eyewear Warranty</h2>
            </div>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              All optical frames, smart glasses, and premium lenses carry a **6-Month Eyewear Warranty**:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Covers structural manufacturing defects in spring hinges, metal soldering, or temple rivets.</li>
              <li>Covers lens coating peel-offs (anti-reflective, blue-cut coatings) under normal usage.</li>
              <li>Includes free lifetime frame alignment, nose pad swaps, and screw tightening services.</li>
            </ul>
          </div>

        </div>

        {/* Claim process */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#c7a14e]/20 bg-gradient-to-r from-[#0b131e]/80 to-[#070b12] space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.2em] uppercase">PROCEDURE</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">How to Claim Warranty</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-light">
            <div className="space-y-2">
              <span className="text-lg font-display font-bold text-[#c7a14e] block">1. File Details</span>
              <p className="text-gray-400 text-sm">Share your original retail invoice and stamped brand warranty card with our team via WhatsApp.</p>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-display font-bold text-[#c7a14e] block">2. In-Store Inspection</span>
              <p className="text-gray-400 text-sm">Drop off your item or ship it to our showroom for technical validation of internal movement or frame faults.</p>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-display font-bold text-[#c7a14e] block">3. Certified Service</span>
              <p className="text-gray-400 text-sm">Faulty items are repaired under warranty or replaced with brand-fresh units within 7-10 business days.</p>
            </div>
          </div>
        </div>

        {/* Required Documents and Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Required Documents */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#c7a14e]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Required Documents</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              To guarantee that warranty repairs are processed successfully, verify you present the following:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Original Hariyana Watch &amp; Opticals retail invoice receipt.</li>
              <li>Official brand warranty card stamped by Hariyana Watch &amp; Opticals at the time of purchase.</li>
              <li>Valid Government ID matching billing address (for luxury high-value pieces).</li>
            </ul>
          </div>

          {/* Exclusions & Limitations */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0b131e]/40 hover:border-[#c7a14e]/30 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-[#c7a14e]" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Warranty Exclusions</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              The warranty does not cover damages arising from:
            </p>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-400 font-light pl-4 list-disc">
              <li>Glass lens cracks, outer scratches on sapphire or mineral crystals.</li>
              <li>Case, strap chain plating discoloration, water entry beyond ATM rating, or strap tears.</li>
              <li>Repairs attempted by non-authorized watch clinics or optician shops.</li>
              <li>Accidental drops, chemical exposure, or lens coating corrosion due to sweat.</li>
            </ul>
          </div>

        </div>

        {/* Support Section */}
        <div className="border-t border-gray-800 pt-10 text-center space-y-4">
          <h3 className="font-display text-xl font-bold text-white">Warranty Help Desk</h3>
          <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto font-light">Need help claiming a brand warranty or seeking details on custom lens services?</p>
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
