'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { Facebook, Instagram, Twitter, Youtube } from '@/components/icons/Social';

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
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#0A0F18] border-t border-[#C9A84C]/15 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          {/* Brand block */}
          <div className="col-span-2 lg:col-span-2 space-y-5">
            <Image src="/images/logo-dark.png" alt="Hariyana Watch & Opticals" width={565} height={441} className="h-20 w-auto" />
            <p className="text-sm leading-relaxed max-w-xs">
              Premium watches and eyewear for those who value time, style and trust.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-[#C9A84C]/25 flex items-center justify-center text-gray-400 hover:text-[#0A0F18] hover:bg-[#C9A84C] hover:border-[#C9A84C] transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <FooterCol title="Shop" links={SHOP} />
          {/* Brands */}
          <FooterCol title="Brands" links={BRANDS} />
          {/* Customer Care */}
          <FooterCol title="Customer Care" links={CARE} />

          {/* Contact + Newsletter */}
          <div className="col-span-2 lg:col-span-1 space-y-6">
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                  <span>SCO 25, Sector 14,<br />Hisar, Haryana 125001</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                  <a href="tel:+919876543210" className="hover:text-[#C9A84C] transition-colors">+91 98765 43210</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                  <a href="mailto:hello@hariyanawatch.in" className="hover:text-[#C9A84C] transition-colors">hello@hariyanawatch.in</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                  <span>10:00 AM &ndash; 8:00 PM<br />[All Days]</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Newsletter</h4>
              <p className="text-xs mb-3">Subscribe for updates on new arrivals and exclusive offers.</p>
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                className="flex"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 bg-[#0F1B30] border border-[#C9A84C]/20 rounded-l-md px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/60"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="bg-gradient-to-r from-[#C9A84C] to-[#A07A2A] text-[#0A0F18] px-4 rounded-r-md hover:brightness-110 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-gray-500">
            &copy; {year} Hariyana Watch &amp; Opticals. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-gray-500">
            <Link href="/#contact" className="hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>
            <Link href="/#contact" className="hover:text-[#C9A84C] transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>

        {/* Developer credit */}
        <div className="text-center text-xs text-gray-600 mt-4">
          Created by{' '}
          <a
            href="https://techprosolution.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#C9A84C] hover:text-[#E8D9A0] transition-colors"
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
    <div>
      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-[#C9A84C] transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
