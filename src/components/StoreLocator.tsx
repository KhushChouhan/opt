'use client';

import React from 'react';
import Image from 'next/image';
import { Store, Clock, Phone, MapPin, MessageSquare } from 'lucide-react';
import { buildWhatsAppUrl, WHATSAPP_PRIMARY } from '../utils/whatsapp';

export default function StoreLocator() {
  // Deep-link WhatsApp book visit template
  const getWhatsAppBookLink = () => {
    const text = "Hi, I'd like to book a visit to Hariyana Watch & Opticals. Please let me know if you have slots available today or tomorrow.";
    return buildWhatsAppUrl(text, WHATSAPP_PRIMARY);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Column 1: Static Map Image Link (Fast Initial Load) */}
      <div className="col-span-1 lg:col-span-6 relative min-h-[300px] lg:min-h-[400px] w-full overflow-hidden bg-charcoal group">
        <a
          href="https://maps.app.goo.gl/Ao5XF84qxdaMoFxL8"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 block w-full h-full"
          aria-label="Open Hariyana Watch & Opticals on Google Maps"
        >
          {/* Overlay glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-300" />
          
          <Image
            src="/images/store_map.png"
            alt="Hariyana Watch & Opticals Location map at Hanumangarh Town Bus Stand"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />

          {/* Location pin tag overlay */}
          <div className="absolute bottom-6 left-6 z-20 bg-charcoal/95 border border-[#C9A84C]/40 px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg backdrop-blur-md">
            <MapPin className="w-4 h-4 text-[#C9A84C] animate-bounce" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              Tap to get directions
            </span>
          </div>
        </a>
      </div>

      {/* Column 2: Store Information Cards */}
      <div className="col-span-1 lg:col-span-6 p-6 md:p-10 flex flex-col justify-between space-y-6 text-left">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[10px] font-bold text-[#C9A84C] tracking-wider uppercase mb-4">
            <Store className="w-3.5 h-3.5" />
            <span>Hanumangarh Flagship Store</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold font-display text-white leading-tight">
            Visit Us in Person
          </h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Experience our premium collection in a luxurious environment. Access expert fitting sessions, frame measurements, and professional watch maintenance.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Store Hours */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-[#C9A84C]" /> Store Hours
            </h4>
            <div className="text-xs text-gray-300 leading-normal">
              <p className="font-semibold text-white">Monday - Saturday</p>
              <p className="mt-0.5">10:00 AM - 8:30 PM</p>
              <p className="text-[10px] text-gray-500 mt-1">Closed on Sundays</p>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-[#C9A84C]" /> Contact Details
            </h4>
            <div className="text-xs text-gray-300 space-y-1.5">
              <a href="tel:+919828207999" className="hover:text-[#C9A84C] transition-colors block font-semibold text-white flex items-center">
                <span>Vinod Kumar:</span>
                <span className="ml-1.5 text-gray-400 text-[11px]">98282-07999</span>
              </a>
              <a href="tel:+918526200444" className="hover:text-[#C9A84C] transition-colors block flex items-center">
                <span>Shop Line:</span>
                <span className="ml-1.5 text-gray-400 text-[11px]">85262-00444</span>
              </a>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-4 bg-charcoal/50 border border-white/5 rounded-xl text-xs space-y-1 leading-relaxed">
          <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">Store Address</span>
          <p className="text-gray-300 font-medium">
            52 Main Bus Stand, Hanumangarh Town, Rajasthan - 335513
          </p>
        </div>

        {/* WhatsApp Deep Link CTA */}
        <div className="pt-2">
          <a
            href={getWhatsAppBookLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#C9A84C] text-[#0D0D0F] hover:bg-[#C9A84C]/90 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Book In-Store Visit</span>
          </a>
        </div>

      </div>

    </div>
  );
}
