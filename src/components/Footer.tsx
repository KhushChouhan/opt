'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b132b] border-t border-[#d4af37]/20 pt-12 pb-6 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Store info */}
          <div className="space-y-4">
            <h3 className="font-luxury text-[#d4af37] text-xl font-bold tracking-wider">
              HARIYANA WATCH & OPTICALS
            </h3>
            <p className="text-sm leading-relaxed text-gray-300">
              Your trusted partner for high-quality eyewear and watches in Hanumangarh since 1999. Visit our physical store to try our complete range or experience virtual try-on online.
            </p>
            <div className="flex items-center space-x-2 text-xs text-amber-500/80 bg-black/30 p-2.5 rounded border border-amber-500/10 w-fit">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <span>GSTIN: <strong>08AZYPK6147M2ZC</strong></span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 md:pl-12">
            <h4 className="text-white font-semibold tracking-wide text-sm uppercase">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#d4af37] transition-colors">Product Catalog</Link>
              </li>
              <li>
                <Link href="/products?category=glasses" className="hover:text-[#d4af37] transition-colors">Eyeglasses Try-on</Link>
              </li>
              <li>
                <Link href="/products?category=watches" className="hover:text-[#d4af37] transition-colors">Watches Try-on</Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#d4af37] transition-colors">Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Physical Store Details */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold tracking-wide text-sm uppercase">Contact Details</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  52 Main Bus Stand,<br />
                  Hanumangarh Town, Rajasthan, India
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <div className="flex flex-col text-gray-300">
                  <a href="tel:+919828207999" className="hover:text-[#d4af37] transition-colors">98282-07999</a>
                  <a href="tel:+918526200444" className="hover:text-[#d4af37] transition-colors">85262-00444</a>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <a href="mailto:hariyanaoptical49@gmail.com" className="hover:text-[#d4af37] text-gray-300 transition-colors">
                  hariyanaoptical49@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <span className="text-gray-300">Mon - Sat: 10:00 AM - 8:30 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-gray-800 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between text-xs">
          <p>
            &copy; {currentYear} Hariyana Watch & Opticals. All Rights Reserved.
          </p>
          <p className="mt-2 md:mt-0 text-gray-500">
            Designed for retail excellence. Owner: Vinod Kumar.
          </p>
        </div>
      </div>
    </footer>
  );
}
