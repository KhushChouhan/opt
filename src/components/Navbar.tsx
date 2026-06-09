'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Glasses, Watch, Home, Shield, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-[#d4af37]/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex flex-col">
              <span className="font-luxury text-lg sm:text-xl font-bold tracking-wider text-[#d4af37]">
                HARIYANA
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#f3e5ab] font-sans -mt-1">
                Watch & Opticals
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links (Hongo style Mega Menu) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`flex items-center space-x-1.5 px-1 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                isActive('/')
                  ? 'text-[#d4af37] border-[#d4af37]'
                  : 'text-gray-300 border-transparent hover:text-[#d4af37] hover:border-[#d4af37]/30'
              }`}
            >
              <Home className="w-4 h-4 mr-1" />
              <span>Home</span>
            </Link>

            {/* Shop Catalog Mega Menu Trigger */}
            <div className="group static">
              <Link
                href="/products"
                className={`flex items-center space-x-1.5 px-1 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  pathname.startsWith('/products')
                    ? 'text-[#d4af37] border-[#d4af37]'
                    : 'text-gray-300 border-transparent hover:text-[#d4af37] hover:border-[#d4af37]/30'
                }`}
              >
                <Glasses className="w-4 h-4 mr-1" />
                <span>Shop Catalog</span>
                <span className="text-[8px] transition-transform duration-300 group-hover:rotate-180 ml-0.5">▼</span>
              </Link>

              {/* Mega Menu Dropdown */}
              <div className="absolute top-16 left-0 right-0 w-full bg-[#0b132b]/95 backdrop-blur-md border-b border-[#d4af37]/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-2xl z-50">
                <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-4 gap-8">
                  {/* Column 1: Eyeglasses */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider border-b border-gray-800 pb-2 flex items-center">
                      <Glasses className="w-4 h-4 mr-2" /> Eyeglasses
                    </h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <Link href="/products?category=glasses" className="text-gray-300 hover:text-white transition-colors block py-1">
                          All Eyeglasses
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=glasses" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Acetate Designer Frames
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=glasses" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Titanium & Metal Frames
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=glasses" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Classic Round Styles
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Sunglasses */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider border-b border-gray-800 pb-2 flex items-center">
                      <Glasses className="w-4 h-4 mr-2 text-amber-500" /> Sunglasses
                    </h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <Link href="/products?category=sunglasses" className="text-gray-300 hover:text-white transition-colors block py-1">
                          All Sunglasses
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=sunglasses" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Polarized Lenses
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=sunglasses" className="text-gray-400 hover:text-white transition-colors block py-1">
                          100% UV Protection
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=sunglasses" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Modern Aviators
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Watches */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider border-b border-gray-800 pb-2 flex items-center">
                      <Watch className="w-4 h-4 mr-2" /> Premium Watches
                    </h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <Link href="/products?category=watches" className="text-gray-300 hover:text-white transition-colors block py-1">
                          All Watches
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=watches" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Chronograph Series
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=watches" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Quartz Elegance
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=watches" className="text-gray-400 hover:text-white transition-colors block py-1">
                          Sports & Rugged Wear
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Promo Visual Card */}
                  <div className="relative rounded-lg overflow-hidden border border-[#d4af37]/20 bg-[#1c2541]/40 p-4 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[9px] px-2 py-0.5 bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] font-semibold rounded uppercase tracking-wider">
                        Virtual Try-On
                      </span>
                      <h5 className="text-xs font-bold text-white mt-2 font-luxury">Experience Live AR mirror</h5>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        Try on optical glasses and designer watch models instantly using WebGL tracking.
                      </p>
                    </div>
                    <Link href="/products" className="mt-4">
                      <button className="w-full py-1.5 bg-[#d4af37] text-[#060b13] hover:bg-[#d4af37]/90 text-[10px] font-bold uppercase tracking-wider rounded transition-colors">
                        Launch Try-On
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin / Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold border ${
                    isActive('/admin')
                      ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'
                      : 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1.5 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-700 transition-colors ${
                  isActive('/admin/login')
                    ? 'text-[#d4af37] border-[#d4af37]'
                    : 'text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Store Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {session && (
              <Link
                href="/admin"
                className="mr-3 p-1 text-amber-500 hover:text-amber-400"
                title="Admin Dashboard"
              >
                <Shield className="w-5 h-5 animate-pulse" />
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-[#d4af37] hover:bg-white/5 focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-[#d4af37]/20 px-2 pt-2 pb-4 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
              isActive('/')
                ? 'text-[#d4af37] bg-white/5 border-l-2 border-[#d4af37]'
                : 'text-gray-300 hover:text-[#d4af37] hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/products"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
              pathname === '/products'
                ? 'text-[#d4af37] bg-white/5 border-l-2 border-[#d4af37]'
                : 'text-gray-300 hover:text-[#d4af37] hover:bg-white/5'
            }`}
          >
            <Glasses className="w-5 h-5" />
            <span>Shop All Products</span>
          </Link>

          <div className="border-t border-gray-800 my-2 pt-2">
            <span className="block px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Shop By Department
            </span>
            <div className="grid grid-cols-1 gap-1 p-2">
              <Link
                href="/products?category=glasses"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded bg-[#1c2541]/40 text-sm font-medium hover:text-[#d4af37] border border-gray-800"
              >
                <span className="flex items-center space-x-2">
                  <Glasses className="w-4.5 h-4.5" />
                  <span>Eyeglasses</span>
                </span>
                <span className="text-[10px] text-gray-500">→</span>
              </Link>
              <Link
                href="/products?category=sunglasses"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded bg-[#1c2541]/40 text-sm font-medium hover:text-[#d4af37] border border-gray-800"
              >
                <span className="flex items-center space-x-2">
                  <Glasses className="w-4.5 h-4.5 text-amber-500" />
                  <span>Sunglasses</span>
                </span>
                <span className="text-[10px] text-gray-500">→</span>
              </Link>
              <Link
                href="/products?category=watches"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded bg-[#1c2541]/40 text-sm font-medium hover:text-[#d4af37] border border-gray-800"
              >
                <span className="flex items-center space-x-2">
                  <Watch className="w-4.5 h-4.5" />
                  <span>Premium Watches</span>
                </span>
                <span className="text-[10px] text-gray-500">→</span>
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 my-2 pt-2">
            {session ? (
              <div className="px-2 space-y-2">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 w-full justify-center px-4 py-2 rounded-md text-sm font-semibold border border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="flex items-center space-x-2 w-full justify-center px-4 py-2 rounded-md text-sm font-medium border border-red-500/30 bg-red-500/10 text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 justify-center px-4 py-2 rounded-md text-sm font-medium border border-gray-700 text-gray-400 hover:text-[#d4af37]"
              >
                <Shield className="w-4 h-4" />
                <span>Store Admin Access</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
