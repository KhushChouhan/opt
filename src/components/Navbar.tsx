'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Phone, Star, Eye, ShieldCheck, Search, Menu, X,
  ChevronDown, Watch, Glasses, LogOut, Shield,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Watches',
    href: '/products?category=watches',
    children: [
      { label: 'All Watches', href: '/products?category=watches' },
      { label: 'Chronographs', href: '/products?category=watches' },
      { label: 'Automatic', href: '/products?category=watches' },
      { label: 'Smart Watches', href: '/products?category=watches' },
    ],
  },
  {
    label: 'Opticals',
    href: '/products?category=glasses',
    children: [
      { label: 'Eyeglasses', href: '/products?category=glasses' },
      { label: 'Sunglasses', href: '/products?category=sunglasses' },
      { label: 'Optical Frames', href: '/products?category=glasses' },
      { label: 'Lenses', href: '/products?category=glasses' },
    ],
  },
  { label: 'Brands', href: '/#brands' },
  { label: 'Collections', href: '/#categories' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isActive = (href: string) => pathname === href;

  // Scroll logic to hide/show navbar
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 w-full"
    >
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-[#9e782f] via-[#c7a14e] to-[#9e782f] text-[#050c14] border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
            <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 98765 43210</span>
            </a>
            <div className="hidden md:flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Premium Watches &amp; Eyewear Since 1998</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="hidden sm:flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Free Eye Test Booking</span>
              </span>
              <span className="hidden lg:flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Authentic Products</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="bg-[#050c14]/75 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" aria-label="Hariyana Watch & Opticals - Home" className="flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Hariyana Watch & Opticals"
                width={565}
                height={441}
                priority
                className="h-[75px] w-auto transition-all duration-300 hover:scale-[1.02]"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 py-2 text-[12px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      isActive(item.href)
                        ? 'text-[#c7a14e]'
                        : 'text-gray-300 hover:text-[#c7a14e]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.children && <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />}
                  </Link>
                  {/* underline */}
                  <span className={`absolute -bottom-px left-0 h-[1.5px] bg-[#c7a14e] transition-all duration-300 ${isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />

                  {/* Dropdown */}
                  {item.children && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="w-52 rounded-xl bg-[#0b131e] border border-[#c7a14e]/20 shadow-2xl py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-300 hover:text-[#c7a14e] hover:bg-white/5 transition-colors"
                          >
                            {item.label === 'Watches' ? <Watch className="w-3.5 h-3.5" /> : <Glasses className="w-3.5 h-3.5" />}
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden lg:flex items-center gap-6">
              <span className="w-px h-9 bg-[#c7a14e]/20" aria-hidden="true" />
              <Link
                href="/products"
                aria-label="Search products"
                className="flex flex-col items-center gap-0.5 text-[#c7a14e] hover:text-[#e8d9a0] transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Search</span>
              </Link>
              {session && (
                <>
                  <Link
                    href="/admin"
                    aria-label="Admin panel"
                    className="flex flex-col items-center gap-0.5 text-[#c7a14e] hover:text-[#e8d9a0] transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Admin</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    aria-label="Sign out"
                    className="flex flex-col items-center gap-0.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Logout</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-200 hover:text-[#c7a14e] transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-[#c7a14e]/15 bg-[#050c14] px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider text-gray-200 hover:text-[#c7a14e] hover:bg-white/5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider text-[#c7a14e] hover:bg-white/5"
            >
              <Search className="w-4 h-4" /> Search
            </Link>
            {session && (
              <div className="flex gap-2 pt-2 border-t border-white/10 mt-2">
                <Link href="/admin" onClick={() => setIsOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border border-[#c7a14e]/40 text-[#c7a14e]">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
                <button onClick={() => { setIsOpen(false); signOut({ callbackUrl: '/' }); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border border-red-500/30 text-red-400">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </motion.header>
  );
}
