'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { Facebook, Instagram, WhatsApp, Youtube } from '@/components/icons/Social';

const SHOP = [
  { label: 'Watches', href: '/products?category=watches' },
  { label: 'Smart Watches', href: '/products?category=smart-watches' },
  { label: 'Sunglasses', href: '/products?category=sunglasses' },
  { label: 'Optical Frames', href: '/products?category=glasses' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'New Arrivals', href: '/products?new-arrivals=true' },
];

const CARE = [
  { label: 'About Us', href: '/about' },
  { label: 'Blog Journal', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Returns & Exchange', href: '/returns-exchange' },
  { label: 'Warranty Care', href: '/warranty-care' },
  { label: 'FAQs', href: '/faqs' },
];

const INSTAGRAM_URL = "https://www.instagram.com/hariyana_watch_opticals49?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const subjectText = "Hariyana Newsletter Subscription Request";
    const bodyText = `Hello Hariyana Watch & Opticals team,

Please add my email address to your newsletter mailing list for updates on new arrivals, exclusive discounts, and store announcements.

📧 Email to subscribe: ${email}

------------------------------------------
Submitted via Hariyana Watch & Opticals Footer portal.`;

    const mailtoUrl = `mailto:hariyanaoptical49@gmail.com?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
    setEmail('');
  };

  // Base Column styling with vertical dividers on desktop
  const colClassName = "border-b border-[#c7a14e]/10 lg:border-b-0 lg:border-r border-[#c7a14e]/15 last:border-r-0 last:border-b-0 pb-8 lg:pb-0 px-0 lg:px-6 xl:px-8 first:lg:pl-0 flex flex-col justify-start items-center text-center";

  if (pathname?.startsWith('/receipt/') || pathname?.startsWith('/verify/')) {
    return null;
  }

  return (
    <footer className="bg-[#050c14] border-t border-[#c7a14e]/15 text-gray-400">
      {/* ============ INSTAGRAM FEED BANNER ============ */}
      <div className="border-b border-[#c7a14e]/15 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left side: text */}
            <div className="flex-shrink-0 space-y-1.5 text-center lg:text-left">
              <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase block">
                Follow Us On Instagram
              </span>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-2xl sm:text-3xl text-white font-medium hover:text-[#c7a14e] transition-colors block tracking-wide animate-pulse"
              >
                @hariyana.watch.opticals
              </a>
            </div>

            {/* Right side: 6 Instagram cards (Enlarged size) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5 w-full lg:w-auto justify-items-center">
              {/* Card 1: Watch */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[140px] lg:w-28 xl:w-32"
              >
                <Image
                  src="/images/luxury_watches.png"
                  alt="Watch"
                  fill
                  sizes="(max-width: 640px) 30vw, 140px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 2: Sunglasses */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[140px] lg:w-28 xl:w-32"
              >
                <Image
                  src="/images/luxury_sunglasses.png"
                  alt="Sunglasses"
                  fill
                  sizes="(max-width: 640px) 30vw, 140px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 3: Optical Frames */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[140px] lg:w-28 xl:w-32"
              >
                <Image
                  src="/images/luxury_optical_frames.png"
                  alt="Optical Frames"
                  fill
                  sizes="(max-width: 640px) 30vw, 140px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 4: Store interior cinematic */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[140px] lg:w-28 xl:w-32"
              >
                <Image
                  src="/images/store_interior_cinematic.png"
                  alt="Showroom display"
                  fill
                  sizes="(max-width: 640px) 30vw, 140px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 5: Store interior */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[140px] lg:w-28 xl:w-32"
              >
                <Image
                  src="/images/store_interior.png"
                  alt="Store showroom"
                  fill
                  sizes="(max-width: 640px) 30vw, 140px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 6: View More Instagram Logo */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-[#c7a14e]/30 bg-gradient-to-br from-[#0b131e] to-[#050c14] hover:border-[#c7a14e] transition-colors flex flex-col items-center justify-center gap-1 p-2 group w-full max-w-[140px] lg:w-28 xl:w-32"
              >
                <Instagram className="w-5 h-5 text-[#c7a14e] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[9px] font-bold text-[#c7a14e] uppercase tracking-widest mt-1">
                  View More
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN FOOTER LINKS ============ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-10 lg:gap-x-0">
          {/* Column 1: Brand block (Spans 2 columns) */}
          <div className={`${colClassName} lg:col-span-2 items-center text-center lg:items-start lg:text-left`}>
            <Image
              src="/images/logo-dark.png"
              alt="Hariyana Watch & Opticals"
              width={565}
              height={441}
              className="h-28 sm:h-32 w-auto object-contain mb-4 animate-fade-in"
            />
            <p className="text-[15px] leading-relaxed max-w-[220px] mb-6">
              Premium watches and eyewear for those who value time, style and trust.
            </p>
            {/* Social Icons (Slightly compact and perfectly centered) */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/Vinod271083"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#c7a14e] hover:border-[#c7a14e]/40 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#c7a14e] hover:border-[#c7a14e]/40 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/919828207999"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors"
              >
                <WhatsApp className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/40 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop (Spans 2 columns) */}
          <div className={`${colClassName} lg:col-span-2`}>
            <h4 className="text-[#c7a14e] font-bold text-base uppercase tracking-[0.15em] mb-5">Shop</h4>
            <ul className="space-y-3.5 text-[15px] flex flex-col items-center text-center w-full">
              {SHOP.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care (Spans 2 columns) */}
          <div className={`${colClassName} lg:col-span-2`}>
            <h4 className="text-[#c7a14e] font-bold text-base uppercase tracking-[0.15em] mb-5">Customer Care</h4>
            <ul className="space-y-3.5 text-[15px] flex flex-col items-center text-center w-full">
              {CARE.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us (Spans 3 columns) */}
          <div className={`${colClassName} lg:col-span-3`}>
            <h4 className="text-[#c7a14e] font-bold text-base uppercase tracking-[0.15em] mb-5">Contact Us</h4>
            <ul className="space-y-3.5 text-[15px] flex flex-col items-center text-center w-full">
              <li className="flex flex-col items-center gap-1.5">
                <MapPin className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/Ao5XF84qxdaMoFxL8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  52 Main Bus Stand,<br />Hanumangarh Town, Rajasthan 335513
                </a>
              </li>
              <li className="flex flex-col items-center gap-1.5">
                <Phone className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+919828207999" className="hover:text-white transition-colors">Vinod Kumar: 98282-07999</a>
                  <a href="tel:+918526200444" className="hover:text-white transition-colors">Shop Line: 85262-00444</a>
                </div>
              </li>
              <li className="flex flex-col items-center gap-1.5">
                <Mail className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                <a href="mailto:hariyanaoptical49@gmail.com" className="hover:text-white transition-colors break-all">hariyanaoptical49@gmail.com</a>
              </li>
              <li className="flex flex-col items-center gap-1.5">
                <Clock className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                <span className="leading-relaxed">10:00 AM &ndash; 8:00 PM<br />(All Days)</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter (Spans 3 columns for spacious text box display) */}
          <div className="lg:col-span-3 pb-8 lg:pb-0 px-0 lg:pl-6 xl:pl-8 flex flex-col justify-start items-center text-center">
            <h4 className="text-[#c7a14e] font-bold text-base uppercase tracking-[0.15em] mb-5">Newsletter</h4>
            <p className="text-[15px] text-gray-400 leading-relaxed mb-4">
              Subscribe for updates on new arrivals and exclusive offers.
            </p>
            <form
              onSubmit={handleSubscribeSubmit}
              className="flex w-full mt-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 bg-[#0b131e] border border-[#c7a14e]/20 rounded-l-md px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#c7a14e]/60"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-[#c7a14e] text-[#050c14] px-5 rounded-r-md hover:bg-[#e8d9a0] transition-colors flex items-center justify-center flex-shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#c7a14e]/10 mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500">
            <p>
              &copy; {year} Hariyana Watch &amp; Opticals. All Rights Reserved.
            </p>
            <span className="hidden sm:inline">|</span>
            <p className="text-xs">
              Created by{' '}
              <a
                href="https://techprosolution.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#C9A84C]/80 hover:text-[#E8D9A0] transition-colors"
              >
                Tech Pro Solutions
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <Link href="/privacy-policy" className="hover:text-[#c7a14e] transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms-conditions" className="hover:text-[#c7a14e] transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
