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

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Glasses },
  ];

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

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(link.href)
                      ? 'text-[#d4af37] bg-white/5 border border-[#d4af37]/20'
                      : 'text-gray-300 hover:text-[#d4af37] hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Try-on Quick Access Dropdown / Links */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 uppercase tracking-widest px-2">Try On:</span>
              <Link
                href="/products?category=glasses"
                className="flex items-center space-x-1 text-xs px-2 py-1 rounded bg-[#1c2541] hover:bg-[#d4af37]/20 hover:text-[#d4af37] transition-all border border-gray-700 hover:border-[#d4af37]/30"
              >
                <Glasses className="w-3.5 h-3.5" />
                <span>Glasses</span>
              </Link>
              <Link
                href="/products?category=watches"
                className="flex items-center space-x-1 text-xs px-2 py-1 rounded bg-[#1c2541] hover:bg-[#d4af37]/20 hover:text-[#d4af37] transition-all border border-gray-700 hover:border-[#d4af37]/30"
              >
                <Watch className="w-3.5 h-3.5" />
                <span>Watches</span>
              </Link>
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
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-[#d4af37] bg-white/5 border-l-2 border-[#d4af37]'
                    : 'text-gray-300 hover:text-[#d4af37] hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="border-t border-gray-800 my-2 pt-2">
            <span className="block px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Virtual Try-On
            </span>
            <div className="grid grid-cols-2 gap-2 p-2">
              <Link
                href="/products?category=glasses"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-2 p-2 rounded bg-[#1c2541] text-sm font-medium hover:text-[#d4af37] border border-gray-700"
              >
                <Glasses className="w-4 h-4" />
                <span>Glasses</span>
              </Link>
              <Link
                href="/products?category=watches"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-2 p-2 rounded bg-[#1c2541] text-sm font-medium hover:text-[#d4af37] border border-gray-700"
              >
                <Watch className="w-4 h-4" />
                <span>Watches</span>
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
