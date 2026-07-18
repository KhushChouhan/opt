import React from 'react';
import { Metadata } from 'next';
import './admin-theme.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Hariyana Watch & Opticals',
  description: 'Manage products and orders for Hariyana Watch & Opticals.',
  robots: 'noindex, nofollow', // Ensure search engines do not index the admin dashboard
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme site-light-page min-h-screen pb-16">
      {/* Dashboard Top Banner */}
      <div className="admin-topbar border-b py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="admin-topbar-title text-xs uppercase font-bold tracking-widest">
              Hariyana Management Center
            </h1>
            <p className="admin-topbar-copy text-[10px] font-sans mt-0.5">
              Secure administrative access active
            </p>
          </div>
          <span className="admin-connected text-[10px] px-2.5 py-1 border font-semibold rounded-full uppercase tracking-wider">
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
