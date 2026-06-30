'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';

interface FAQItem {
  category: 'orders' | 'payments' | 'delivery' | 'warranty' | 'returns' | 'opticals' | 'watches';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // Orders
  {
    category: 'orders',
    question: 'How do I place an order on the Hariyana website?',
    answer: 'Simply browse our collections or catalog page, find your target watch or frames model, and click "Buy Now". Enter your billing address and phone details. You will be redirected to our interactive payment receipt screen to complete payment and finalize details directly over WhatsApp with our staff.'
  },
  {
    category: 'orders',
    question: 'Can I cancel or modify my order after placing it?',
    answer: 'Since orders are processed and coordinated rapidly on WhatsApp, please call or message us within 2 hours of checkout confirmation to cancel or modify your order name, lens customization prescription, or shipping address.'
  },
  
  // Payments
  {
    category: 'payments',
    question: 'What payment options are accepted?',
    answer: 'We support all major payment modes including UPI (Google Pay, PhonePe, Paytm), Net Banking, and Bank Transfer. You can scan our store QR code on the payment page and submit your transaction UTR number alongside the payment screenshot for instant order confirmation.'
  },
  {
    category: 'payments',
    question: 'Is cash on delivery (COD) option supported?',
    answer: 'Yes, Cash on Delivery is supported for standard non-customized products under ₹10,000. Customized lens mountings require partial or full prepayment via UPI.'
  },

  // Delivery
  {
    category: 'delivery',
    question: 'What are the delivery timelines and charges?',
    answer: 'We offer free delivery across India for orders above ₹1,999. Orders below ₹1,999 carry a standard shipping charge of ₹99. Delivery takes 2-4 business days within Rajasthan, and 5-7 business days for other states.'
  },
  {
    category: 'delivery',
    question: 'Do you provide shipping tracking details?',
    answer: 'Yes. Once your order packages are hand-delivered to our courier partners (Delhivery or Blue Dart), a tracking ID and link are sent to your registered WhatsApp line and email address.'
  },

  // Warranty
  {
    category: 'warranty',
    question: 'Are all products authentic and backed by warranty?',
    answer: 'Absolutely. Hariyana Watch & Opticals is an authorized retail showroom since 1998. Every timepiece and frame is 100% genuine and comes with the official brand stamped warranty card. Watches carry a 1-2 year brand warranty, and optical frames/lenses carry a 6-month coating warranty.'
  },
  {
    category: 'warranty',
    question: 'How do I claim a warranty repair or service?',
    answer: 'Simply contact us with your original purchase invoice and stamped warranty booklet. You can visit our showroom in Hanumangarh Town or ship the product to us. We will coordinate certified repairs with the brand service network.'
  },

  // Returns
  {
    category: 'returns',
    question: 'What is the return window for watches and frames?',
    answer: 'We offer an easy 7-day return and exchange policy. Items must be unworn, in original packing, with all seals, barcode tags, and warranty stamp booklets intact. Standard shipping for returns is coordinated by the customer.'
  },
  {
    category: 'returns',
    question: 'Are prescription lenses eligible for return?',
    answer: 'No. Since prescription lenses are specifically ground and customized to your optical power measurement parameters, they cannot be returned or refunded once fitted onto the frames.'
  },

  // Opticals (Frames & Lenses)
  {
    category: 'opticals',
    question: 'How do I submit my optical lens power prescription?',
    answer: 'After selecting a frame, you can upload your prescription image during checkout, or send a photo of your doctor\'s prescription card directly to us on WhatsApp during order finalization.'
  },
  {
    category: 'opticals',
    question: 'What lens materials and coatings do you provide?',
    answer: 'We offer high-index plastic lenses, blue-cut filters (digital screen protection), anti-reflective coatings (ARC), photochromic lenses (transitions), and premium progressive lenses from brands like Essilor, Zeiss, and Hoya.'
  },
  {
    category: 'opticals',
    question: 'Can I try on glasses virtually from the website?',
    answer: 'Yes! We feature an advanced WebGL Real-Time try-on camera tool. Select any frame and click "Try On AR" to see how the frame fits on your face directly via your browser.'
  },

  // Watches & Smartwatches
  {
    category: 'watches',
    question: 'What brands of watches are available in your store?',
    answer: 'We are authorized retailers for Titan, Fossil, Fastrack, Seiko, Casio, Sonata, and other major international timekeeping brands.'
  },
  {
    category: 'watches',
    question: 'Do smartwatches carry a warranty?',
    answer: 'Yes, all smartwatches sold at our showroom (including Fastrack Reflex, Titan Smart, and others) carry a 1-year brand manufacturer warranty covering software, display, charging issues, and mechanical casing defects.'
  },
  {
    category: 'watches',
    question: 'Can smartwatches track heart rate and blood oxygen accurately?',
    answer: 'Smartwatches provide close estimates for fitness tracking (steps, heart rate, sleep cycles, SPO2). However, they are not certified medical devices and measurements should not be used for critical medical diagnostics.'
  },
  {
    category: 'watches',
    question: 'Can I resize watch straps at the time of order?',
    answer: 'Yes, if you buy a metal chain strap watch, you can send us your wrist size details on WhatsApp, and our horologists will pre-adjust the links before dispatching the package.'
  }
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categoriesList = [
    { value: 'all', label: 'All FAQs' },
    { value: 'orders', label: 'Orders' },
    { value: 'payments', label: 'Payments' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'warranty', label: 'Warranty & Claims' },
    { value: 'returns', label: 'Returns & Exchange' },
    { value: 'opticals', label: 'Frames & Lenses' },
    { value: 'watches', label: 'Watches & Smartwatches' }
  ];

  const filteredFAQs = FAQ_ITEMS.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(prevIndex => (prevIndex === index ? null : index));
  };

  return (
    <div className="bg-[#050c14] min-h-screen text-gray-300 pb-20 relative overflow-hidden">
      {/* Luxury Background Overlay */}
      <div className="absolute inset-0 luxury-grid-overlay opacity-80" />

      {/* Hero Header */}
      <section className="relative py-20 border-b border-[#c7a14e]/15 bg-[#0b131e]/20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed mb-6">
            Quick answers to common questions about checkout payments, shipping delivery, and warranty coverages.
          </p>

          {/* Breadcrumb & Eyebrow moved below subtitle */}
          <nav className="flex justify-center items-center gap-2 text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mb-3">
            <a href="/" className="hover:text-[#c7a14e] transition-colors">Home</a>
            <span>/</span>
            <span className="text-[#c7a14e] font-semibold">FAQs</span>
          </nav>
          
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">Help Desk</span>
          </div>
        </div>
      </section>

      {/* Search & Filter bar */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col gap-8 items-center justify-center">
          {/* Search box centered */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F1B30]/80 border border-gray-700 rounded-md pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-all"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          </div>

          {/* Categories select (wrapped and centered) */}
          <div className="flex flex-wrap gap-2.5 justify-center items-center w-full">
            {categoriesList.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setOpenIndex(0); }}
                className={`text-xs uppercase font-bold tracking-wider px-5 py-2.5 rounded-full border transition-all ${
                  activeCategory === cat.value
                    ? 'bg-[#c7a14e] text-[#050c14] border-[#c7a14e] shadow-md'
                    : 'bg-[#0b131e]/50 border-gray-800 text-gray-400 hover:border-[#c7a14e]/45'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion List */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-4">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-white/5 bg-[#0b131e]/40 overflow-hidden hover:border-[#c7a14e]/20 transition-all duration-300"
              >
                {/* Header */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <HelpCircle className="w-5 h-5 text-[#c7a14e] shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base font-semibold text-white tracking-wide">{faq.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#c7a14e] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                </button>

                {/* Body Content */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-[#070b12]/20">
                    <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed pl-9">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl">
            <HelpCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No matching FAQs found. Try searching with different terms.</p>
          </div>
        )}
      </section>
      
    </div>
  );
}
