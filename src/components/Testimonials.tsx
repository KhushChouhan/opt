'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Star, Quote, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { TESTIMONIAL_LIST } from '../data/testimonials';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll interval logic
  useEffect(() => {
    if (isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIAL_LIST.length);
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIAL_LIST.length) % TESTIMONIAL_LIST.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIAL_LIST.length);
  };

  const current = TESTIMONIAL_LIST[activeIndex];

  // Helper to generate initials avatar if image is empty
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="max-w-4xl mx-auto relative group"
    >
      {/* Testimonial container card */}
      <div className="bg-surface border border-white/10 p-6 md:p-12 rounded-2xl relative shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between">
        
        {/* Quote floating decoration */}
        <Quote className="absolute top-6 right-8 w-24 h-24 text-white/[0.02] stroke-[1] select-none pointer-events-none" />

        <div className="space-y-6">
          {/* Star rating */}
          <div className="flex justify-center space-x-1">
            {[...Array(current.stars)].map((_, i) => (
              <Star key={i} className="w-4.5 h-4.5 fill-[#C9A84C] text-[#C9A84C]" />
            ))}
          </div>

          {/* Testimonial Quote text */}
          <blockquote className="text-sm md:text-base text-gray-200 leading-relaxed font-light italic max-w-2xl mx-auto text-center">
            &ldquo;{current.quote}&rdquo;
          </blockquote>
        </div>

        {/* User profile section */}
        <div className="flex flex-col items-center mt-6 space-y-3">
          {/* Avatar block */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#2A2A30] flex items-center justify-center text-charcoal font-sans font-bold text-xs shadow-md">
            {current.avatarSrc ? (
              // If there was an avatar image
              <Image src={current.avatarSrc} alt={current.author} width={48} height={48} className="w-full h-full object-cover rounded-full" />
            ) : (
              getInitials(current.author)
            )}
          </div>

          <div className="text-center">
            <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider font-display flex items-center justify-center">
              <span>{current.author}</span>
              <span className="ml-1.5 inline-flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 p-0.5 rounded-full" title="Verified Purchase">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </span>
            </h4>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">
              {current.role} &bull; {current.location}
            </p>
          </div>
        </div>

        {/* Navigation arrow buttons (appears on hover) */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/10 bg-charcoal/80 text-gray-400 hover:text-[#C9A84C] hover:border-[#C9A84C] flex items-center justify-center transition-all md:opacity-0 group-hover:opacity-100"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/10 bg-charcoal/80 text-gray-400 hover:text-[#C9A84C] hover:border-[#C9A84C] flex items-center justify-center transition-all md:opacity-0 group-hover:opacity-100"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-4.5 h-4.5" />
        </button>

        {/* Carousel indicators dots */}
        <div className="flex items-center justify-center space-x-2 mt-8 z-10">
          {TESTIMONIAL_LIST.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIndex ? 'w-6 bg-[#C9A84C]' : 'w-1.5 bg-gray-600'
              }`}
              aria-label={`Go to testimonial slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
