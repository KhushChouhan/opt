'use client';

import React from 'react';
import { Share2, Gift } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/whatsapp';

export default function LoyaltyTeaser() {
  const getWhatsAppShareLink = () => {
    const shareText = "Hey! Check out Hariyana Watch & Opticals. They have premium glasses and luxury watches that you can try on virtually directly from your phone browser! Use this link to browse: https://hariyanawatchopticals.com";
    // Empty recipient number creates a generic contact-share dispatch link
    return buildWhatsAppUrl(shareText, '');
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/35 to-[#2A2A30]/50 border border-[#C9A84C]/45 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
      
      {/* Background Decorative Spark */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#C9A84C]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Referral Copy */}
      <div className="flex items-center space-x-5 text-left z-10">
        <div className="p-4 bg-charcoal border border-[#C9A84C]/40 rounded-full shrink-0 hidden sm:flex text-[#C9A84C]">
          <Gift className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[9px] font-extrabold text-[#C9A84C] tracking-[0.25em] uppercase block">
            LOYALTY PROGRAM
          </span>
          <h3 className="text-xl md:text-2xl font-bold font-display text-white mt-1 leading-tight">
            Refer &amp; Earn ₹500 In-Store Credit
          </h3>
          <p className="text-xs text-gray-300 mt-1.5 max-w-xl leading-relaxed">
            Invite your friends to experience our virtual try-on mirror. Once they place their first purchase order with us, both of you receive ₹500 in credit!
          </p>
        </div>
      </div>

      {/* Share Actions */}
      <div className="shrink-0 w-full md:w-auto z-10 text-center">
        <a
          href={getWhatsAppShareLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto inline-flex items-center justify-center space-x-2 bg-charcoal text-white hover:bg-white hover:text-charcoal border border-white/20 hover:border-transparent px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg"
        >
          <Share2 className="w-4 h-4 shrink-0 text-[#C9A84C]" />
          <span>Invite Friends</span>
        </a>
      </div>

    </div>
  );
}
