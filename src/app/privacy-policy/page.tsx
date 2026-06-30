import React from 'react';
import type { Metadata } from 'next';
import { Lock, Eye, ShieldCheck, Mail, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Hariyana Watch & Opticals',
  description: 'Understand how Hariyana Watch & Opticals collects, uses, and protects customer data and purchase invoice transaction details.',
  alternates: {
    canonical: 'https://hariyana-watch-opticals.vercel.app/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Hariyana Watch & Opticals',
    description: 'Learn about user data protection, secure billing records, and GDPR compliance standards.',
    url: 'https://hariyana-watch-opticals.vercel.app/privacy-policy',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
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
            <span className="text-[#c7a14e] font-semibold">Privacy Policy</span>
          </nav>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">LEGAL COMPLIANCE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed">
            Your privacy is of utmost importance to us. Review how we manage and safeguard your personal details.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-10 text-sm sm:text-base font-light leading-relaxed">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#c7a14e]">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">1. Data We Collect</h2>
          </div>
          <p className="text-gray-400">
            Hariyana Watch &amp; Opticals collects information essential to processing your order checkouts, communicating status updates, and personalizing support:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-xs sm:text-sm">
            <li><strong>Identity Details</strong>: Full name, shipping address, PIN code, and contact numbers.</li>
            <li><strong>Prescription Records</strong>: Optician lens prescription details provided for eyeglasses customization.</li>
            <li><strong>Transaction Records</strong>: Checkout product details, payment receipts, bank transfer invoice codes, and transaction UTR numbers.</li>
            <li><strong>Usage Information</strong>: IP address, device specs, browser headers, and cookie interactions to improve virtual try-on performance.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#c7a14e]">
            <Eye className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">2. How We Use Data</h2>
          </div>
          <p className="text-gray-400">
            Your collected records are processed to maintain store services:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-xs sm:text-sm">
            <li>To dispatch payment receipt confirmations and process custom lens cuts.</li>
            <li>To coordinate logistics deliveries and shipping tracking updates via WhatsApp.</li>
            <li>To authenticate admins inside secure dashboards and prevent billing fraud.</li>
            <li>To manage warranty repair claims and trace generational store purchase histories.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#c7a14e]">
            <Lock className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">3. Information Security</h2>
          </div>
          <p className="text-gray-400">
            We implement technical security protocols to protect transaction data:
          </p>
          <p className="text-gray-400">
            All user inputs are written to encrypted database tables. Stored payment screenshots and transaction invoice files are served over secure authenticated Content Delivery Networks (CDNs). We never trade, rent, or distribute customer identities or medical prescription documents to third-party marketing companies.
          </p>
        </div>

        <div className="space-y-4 border-t border-gray-800 pt-8">
          <div className="flex items-center gap-2 text-[#c7a14e]">
            <Mail className="w-5 h-5" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider">4. Contact Privacy Officer</h2>
          </div>
          <p className="text-gray-400">
            If you wish to inspect your stored contact records, request complete details deletion, or update billing addresses:
          </p>
          <p className="text-gray-400">
            Please write to us directly at: <a href="mailto:hariyanaoptical49@gmail.com" className="text-[#c7a14e] font-semibold hover:underline">hariyanaoptical49@gmail.com</a>.
          </p>
        </div>

      </section>

    </div>
  );
}
