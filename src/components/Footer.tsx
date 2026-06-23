'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { Facebook, Instagram, WhatsApp, Youtube } from '@/components/icons/Social';

const SHOP = [
  { label: 'Watches', href: '/products?category=watches' },
  { label: 'Smart Watches', href: '/products?category=watches' },
  { label: 'Sunglasses', href: '/products?category=sunglasses' },
  { label: 'Optical Frames', href: '/products?category=glasses' },
  { label: 'Accessories', href: '/products' },
  { label: 'New Arrivals', href: '/products' },
];

const BRANDS = [
  { label: 'Titan', href: '/products?category=watches' },
  { label: 'Ray-Ban', href: '/products?category=sunglasses' },
  { label: 'Fossil', href: '/products?category=watches' },
  { label: 'Fastrack', href: '/products' },
  { label: 'Seiko', href: '/products?category=watches' },
  { label: 'All Brands', href: '/#brands' },
];

const CARE = [
  { label: 'Contact Us', href: '/#contact' },
  { label: 'Track Order', href: '/#contact' },
  { label: 'Returns & Exchange', href: '/#contact' },
  { label: 'Shipping Policy', href: '/#contact' },
  { label: 'Warranty', href: '/#contact' },
  { label: 'FAQs', href: '/#contact' },
];

const SOCIALS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/hariyana.watch.opticals', label: 'Instagram' },
  { icon: WhatsApp, href: 'https://wa.me/919828207999', label: 'WhatsApp' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');

  // Column styling: bottom border on mobile/tablet, vertical divider lines on desktop (lg:)
  const colClassName = "border-b border-[#c7a14e]/10 lg:border-b-0 lg:border-r border-[#c7a14e]/15 last:border-r-0 last:border-b-0 pb-8 lg:pb-0 px-0 lg:px-6 xl:px-8 first:lg:pl-0 last:lg:pr-0 flex flex-col justify-start";

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
                href="https://instagram.com/hariyana.watch.opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-2xl sm:text-3xl text-white font-medium hover:text-[#c7a14e] transition-colors block tracking-wide"
              >
                @hariyana.watch.opticals
              </a>
            </div>

            {/* Right side: 6 Instagram cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5 w-full lg:w-auto justify-items-center">
              {/* Card 1: Watch */}
              <a
                href="https://instagram.com/hariyana.watch.opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[120px] lg:w-24 xl:w-28"
              >
                <Image
                  src="/images/luxury_watches.png"
                  alt="Watch"
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 2: Sunglasses */}
              <a
                href="https://instagram.com/hariyana.watch.opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[120px] lg:w-24 xl:w-28"
              >
                <Image
                  src="/images/luxury_sunglasses.png"
                  alt="Sunglasses"
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 3: Optical Frames */}
              <a
                href="https://instagram.com/hariyana.watch.opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[120px] lg:w-24 xl:w-28"
              >
                <Image
                  src="/images/luxury_optical_frames.png"
                  alt="Optical Frames"
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 4: Store interior cinematic */}
              <a
                href="https://instagram.com/hariyana.watch.opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[120px] lg:w-24 xl:w-28"
              >
                <Image
                  src="/images/store_interior_cinematic.png"
                  alt="Showroom display"
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 5: Store interior */}
              <a
                href="https://instagram.com/hariyana.watch.opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#070B12] hover:border-[#C9A84C]/40 transition-colors group w-full max-w-[120px] lg:w-24 xl:w-28"
              >
                <Image
                  src="/images/store_interior.png"
                  alt="Store showroom"
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              {/* Card 6: View More Instagram Logo */}
              <a
                href="https://instagram.com/hariyana.watch.opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden border border-[#c7a14e]/30 bg-gradient-to-br from-[#0b131e] to-[#050c14] hover:border-[#c7a14e] transition-colors flex flex-col items-center justify-center gap-1 p-2 group w-full max-w-[120px] lg:w-24 xl:w-28"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-y-10 lg:gap-x-0">
          {/* Column 1: Brand block */}
          <div className={colClassName}>
            <Image
              src="/images/logo-dark.png"
              alt="Hariyana Watch & Opticals"
              width={565}
              height={441}
              className="h-16 w-auto object-contain self-start mb-4 animate-fade-in"
            />
            <p className="text-xs leading-relaxed max-w-[200px] text-gray-400 mb-6">
              Premium watches and eyewear for those who value time, style and trust.
            </p>
            <div className="flex items-center gap-5 mt-auto pt-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-gray-400 hover:text-[#C9A84C] transition-colors"
                >
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className={colClassName}>
            <FooterCol title="Shop" links={SHOP} />
          </div>

          {/* Column 3: Brands */}
          <div className={colClassName}>
            <FooterCol title="Brands" links={BRANDS} />
          </div>

          {/* Column 4: Customer Care */}
          <div className={colClassName}>
            <FooterCol title="Customer Care" links={CARE} />
          </div>

          {/* Column 5: Contact Us */}
          <div className={colClassName}>
            <h4 className="text-[#C9A84C] font-bold text-xs uppercase tracking-[0.15em] mb-5">Contact Us</h4>
            <ul className="space-y-4 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/Ao5XF84qxdaMoFxL8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  52 Main Bus Stand,<br />Hanumangarh Town, Rajasthan 335513
                </a>
              </li>
              <li className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                  <a href="tel:+919828207999" className="hover:text-white transition-colors">Vinod Kumar: 98282-07999</a>
                </div>
                <div className="flex items-center gap-2.5 ml-[26px]">
                  <a href="tel:+918526200444" className="hover:text-white transition-colors">Shop Line: 85262-00444</a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                <a href="mailto:hariyanaoptical49@gmail.com" className="hover:text-white transition-colors">hariyanaoptical49@gmail.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">10:00 AM &ndash; 8:00 PM<br />(All Days)</span>
              </li>
            </ul>
          </div>

          {/* Column 6: Newsletter */}
          <div className={colClassName}>
            <h4 className="text-[#c7a14e] font-bold text-xs uppercase tracking-[0.15em] mb-5">Newsletter</h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Subscribe for updates on new arrivals and exclusive offers.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
              className="flex w-full mt-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 bg-[#0b131e] border border-[#c7a14e]/20 rounded-l-md px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c7a14e]/60"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-[#c7a14e] text-[#050c14] px-4 rounded-r-md hover:bg-[#e8d9a0] transition-colors flex items-center justify-center flex-shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#c7a14e]/10 mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-gray-500">
            &copy; {year} Hariyana Watch &amp; Opticals. All Rights Reserved.
          </p>
          <div className="flex items-center gap-3 text-gray-500">
            <Link href="/#contact" className="hover:text-[#c7a14e] transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="/#contact" className="hover:text-[#c7a14e] transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>

        {/* Developer credit */}
        <div className="text-center text-[10px] text-gray-600 mt-4">
          Created by{' '}
          <a
            href="https://techprosolution.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#C9A84C]/80 hover:text-[#E8D9A0] transition-colors"
          >
            Tech Pro Solutions
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="h-full flex flex-col justify-start">
      <h4 className="text-[#C9A84C] font-bold text-xs uppercase tracking-[0.15em] mb-5">{title}</h4>
      <ul className="space-y-3.5 text-xs">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
