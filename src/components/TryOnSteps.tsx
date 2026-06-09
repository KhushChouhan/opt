'use client';

import React from 'react';
import { Camera, Sparkles, Send } from 'lucide-react';

export default function TryOnSteps() {
  const steps = [
    {
      number: '01',
      title: 'Open Camera',
      description: 'Select any product with the AR badge and click Try On. Grant browser camera permissions securely.',
      icon: Camera
    },
    {
      number: '02',
      title: 'Interactive Tracking',
      description: 'Our client-side system maps your face landmarks or wrist joints in real time with high accuracy.',
      icon: Sparkles
    },
    {
      number: '03',
      title: 'WhatsApp Dispatch',
      description: 'Confirm size fitting, take a snapshot, and place your order. Verification details are shared directly over WhatsApp.',
      icon: Send
    }
  ];

  return (
    <div className="relative w-full py-6">
      
      {/* Stepper horizontal connector line (desktop only) */}
      <div className="absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/35 to-transparent hidden md:block z-0" />

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        {steps.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.number}
              className="flex flex-col items-center text-center group"
            >
              {/* Stepper icon bubble */}
              <div className="w-20 h-20 rounded-full bg-surface border border-white/10 group-hover:border-[#C9A84C]/70 flex items-center justify-center text-gray-400 group-hover:text-[#C9A84C] transition-all duration-500 shadow-xl relative mb-6">
                
                {/* Outlined Luxury Icon */}
                <IconComponent className="w-8 h-8 stroke-[1.25]" />

                {/* Step indicator count badge */}
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#C9A84C] text-charcoal font-sans font-bold text-[10px] flex items-center justify-center shadow-md">
                  {step.number}
                </span>

                {/* Glow ring on step hover */}
                <div className="absolute inset-0 rounded-full border border-dashed border-[#C9A84C] scale-95 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
              </div>

              {/* Title & Copy */}
              <h3 className="text-lg font-bold text-white font-display group-hover:text-[#C9A84C] transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-xs text-gray-400 mt-2.5 max-w-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
