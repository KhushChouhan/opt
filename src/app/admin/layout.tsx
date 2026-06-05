import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Hariyana Watch & Opticals',
  description: 'Manage products and orders for Hariyana Watch & Opticals.',
  robots: 'noindex, nofollow', // Ensure search engines do not index the admin dashboard
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060b13] pb-16">
      {/* Dashboard Top Banner */}
      <div className="bg-[#0b132b] border-b border-[#d4af37]/20 py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">
              Management Center
            </h1>
            <p className="text-[10px] text-gray-500 font-sans mt-0.5">
              Secure administrative access active
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold rounded uppercase tracking-wider">
            Connected
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
