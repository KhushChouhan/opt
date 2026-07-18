'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Star, Search, Menu, X,
  ChevronDown,
  CheckCircle, Gem, LogOut, Shield
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  premium?: boolean;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'EYEGLASSES',
    href: '/products?category=glasses',
    children: [
      { label: 'All Eyeglasses', href: '/products?category=glasses' },
      { label: 'Men', href: '/products?category=glasses' },
      { label: 'Women', href: '/products?category=glasses' },
    ],
  },
  {
    label: 'SUNGLASSES',
    href: '/products?category=sunglasses',
    children: [
      { label: 'All Sunglasses', href: '/products?category=sunglasses' },
      { label: 'Aviators', href: '/products?category=sunglasses' },
      { label: 'Wayfarers', href: '/products?category=sunglasses' },
    ],
  },
  {
    label: 'WATCHES',
    href: '/products?category=watches',
    children: [
      { label: 'All Watches', href: '/products?category=watches' },
      { label: 'Smart Watches', href: '/products?category=smart-watches' },
      { label: 'Chronographs', href: '/products?category=watches' },
    ],
  },
  {
    label: 'ACCESSORIES',
    href: '/products?category=accessories',
    children: [
      { label: 'Belts', href: '/products?category=belts' },
      { label: 'Wallets', href: '/products?category=wallets' },
      { label: 'Perfumes', href: '/products?category=perfumes' },
      { label: 'Other Accessories', href: '/products?category=accessories' },
    ],
  },
  { label: 'PREMIUM', href: '/heritage', premium: true },
  { label: 'OFFERS', href: '/offers' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const isAdminPanel = pathname?.startsWith('/admin') ?? false;
  const isHomePage = pathname === '/';

  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isOpen) lastScrollY.current = window.scrollY;
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && Math.abs(window.scrollY - lastScrollY.current) > 25) {
        setIsOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (isOpen) { setHidden(false); return; }
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (pathname?.startsWith('/receipt/') || pathname?.startsWith('/verify/')) return null;

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 w-full font-sans"
    >
      {/* ─── Top Bar ─── */}
      <div className="flex h-[32px] items-center border-b sm:h-[36px]" style={{ backgroundColor: '#fdf9f6', borderColor: '#EFE5DA', color: '#111111' }}>
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center text-[10px] font-bold tracking-wide font-inter">
          <div className="flex min-w-0 items-center gap-6">
            <span className="flex items-center gap-1.5 whitespace-nowrap text-[9px] sm:text-[10px]"><CheckCircle className="w-[13px] h-[13px]" style={{color: '#C86620'}} strokeWidth={2.5}/> FREE EYE TEST AT ALL STORES</span>
            <span className="hidden md:flex items-center gap-1.5"><Star className="w-[14px] h-[14px]" style={{color: '#C86620'}} strokeWidth={2.5}/> 100% AUTHENTIC PRODUCTS</span>
            <span className="hidden lg:flex items-center gap-1.5"><CheckCircle className="w-[14px] h-[14px]" style={{color: '#C86620'}} strokeWidth={2.5}/> EASY RETURNS & EXCHANGE</span>
          </div>
        </div>
      </div>

      {/* ─── Main Navbar ─── */}
      <nav className="border-b transition-all duration-300" style={{ backgroundColor: '#fdf9f6', borderColor: '#EFE5DA' }}>
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          {/* Top row: Logo, Search, Actions */}
          <div className="flex items-center justify-between py-2 lg:py-3">

            <Link href="/" aria-label="Hariyana Watch & Opticals - Home" className="flex w-[150px] flex-shrink-0 items-center sm:w-[188px] lg:w-[270px]">
              <Image src="/images/logo-header.png" alt="Hariyana Watch & Opticals" width={1536} height={1152} className="h-[84px] w-auto object-contain mix-blend-multiply sm:h-[100px] lg:h-[128px]" priority />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-[600px] mx-10 relative">
              <input
                type="text"
                placeholder="Search for glasses, sunglasses, watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[46px] pl-5 pr-12 outline-none text-[13px] font-inter placeholder-[#888888]"
                style={{
                  borderRadius: '999px',
                  border: '1px solid #E5D8CC',
                  backgroundColor: '#FFFFFF',
                  color: '#111111'
                }}
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111111] hover:opacity-70">
                <Search className="w-5 h-5" strokeWidth={2} />
              </button>
            </form>

            {isAdminPanel && session ? (
              <div className="hidden w-[250px] items-center justify-end gap-6 lg:flex">
                <Link
                  href="/admin"
                  aria-label="Admin panel"
                  className="flex flex-col items-center gap-0.5 text-[#062C1C] transition-colors hover:text-[#C86620]"
                >
                  <Shield className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Admin</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  aria-label="Log out"
                  className="flex flex-col items-center gap-0.5 text-[#8A491D] transition-colors hover:text-[#C86620]"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Logout</span>
                </button>
              </div>
            ) : isHomePage ? (
              <div className="hidden w-[250px] items-center justify-end lg:flex">
                <Link
                  href="/admin"
                  data-bump="true"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#B98B52]/45 bg-[#062C1C] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm transition-all duration-300 hover:bg-[#0A3A27] hover:shadow-md"
                >
                  <Shield className="h-4 w-4 text-[#F2C58F]" />
                  Store Admin
                </Link>
              </div>
            ) : (
              <div className="hidden w-[250px] lg:block" aria-hidden="true" />
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-[#111111]" aria-label="Toggle menu">
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

          {/* Bottom row: Links & Button */}
          <div className="hidden items-center justify-center pb-3 lg:flex">
            <div className="flex w-full items-center justify-center gap-8 xl:gap-14">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className={item.premium
                      ? `flex items-center gap-1.5 rounded-full border px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] shadow-[0_4px_14px_rgba(138,73,29,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_7px_18px_rgba(138,73,29,0.16)] ${pathname === item.href ? 'border-[#062C1C] bg-[#062C1C] text-[#F2C58F]' : 'border-[#DAB58C] bg-gradient-to-r from-[#FFF9F2] to-[#F5E3CF] text-[#8A491D] hover:border-[#C86620]'}`
                      : 'flex items-center gap-1 py-2 text-[12px] font-bold text-[#111111] hover:text-[#C86620] transition-colors uppercase tracking-wide font-inter'}
                  >
                    {item.premium ? <Gem className="h-3.5 w-3.5" strokeWidth={1.9} /> : null}
                    {item.label}
                    {item.premium ? <span className="rounded-full bg-[#C86620] px-1.5 py-0.5 text-[7px] leading-none tracking-[0.08em] text-white">HERITAGE</span> : null}
                    {item.label === 'OFFERS' && (
                      <span className="bg-[#FF0000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] ml-1 uppercase -mt-2">HOT</span>
                    )}
                    {item.children && <ChevronDown className="w-3.5 h-3.5 opacity-60" strokeWidth={2.5}/>}
                  </Link>

                  {/* Dropdown */}
                  {item.children && (
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="w-48 bg-[#FFFFFF] border border-[#EFE5DA] shadow-lg py-2 rounded-xl">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-5 py-2.5 text-[13px] text-[#111111] font-medium hover:bg-[#F9F9F9] hover:text-[#C86620] transition-colors font-inter"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="space-y-1 border-t border-[#EADEC9] bg-[#FCF8F4] px-4 py-4 lg:hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-4 pr-10 outline-none text-[15px] rounded-full border"
                style={{ borderColor: 'var(--border-color)' }}
              />
              <button type="submit" className="absolute right-4 text-[var(--text-main)]"><Search className="w-5 h-5"/></button>
            </form>

            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={item.premium
                  ? `flex items-center gap-2 rounded-xl border px-3 py-3 text-[12px] font-extrabold uppercase tracking-[0.1em] ${pathname === item.href ? 'border-[#062C1C] bg-[#062C1C] text-[#F2C58F]' : 'border-[#DAB58C] bg-gradient-to-r from-[#FFF9F2] to-[#F5E3CF] text-[#8A491D]'}`
                  : 'block rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#121212] hover:bg-[#F8EEE5]'}
              >
                {item.premium ? <Gem className="h-4 w-4" strokeWidth={1.9} /> : null}
                {item.label}
                {item.premium ? <span className="ml-auto rounded-full bg-[#C86620] px-2 py-1 text-[7px] leading-none tracking-[0.1em] text-white">NEW</span> : null}
              </Link>
            ))}

            {isHomePage && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                data-bump="true"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#B98B52]/45 bg-[#062C1C] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm"
              >
                <Shield className="h-4 w-4 text-[#F2C58F]" />
                Store Admin
              </Link>
            )}

            {isAdminPanel && session ? (
              <div className="mt-3 flex gap-2 border-t border-[#EADEC9] pt-3">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#062C1C]/25 px-3 py-2 text-xs font-semibold text-[#062C1C]"
                >
                  <Shield className="h-3.5 w-3.5" /> Admin
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/admin/login' });
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#C86620]/30 px-3 py-2 text-xs font-semibold text-[#8A491D]"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            ) : null}

          </div>
        )}
      </nav>
    </motion.header>
  );
}
