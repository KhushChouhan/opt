'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Flame } from 'lucide-react';

// Compute today's date string (local timezone) - outside component so it is static
const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export default function FlashDealBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default to dismissed (true) on server to avoid hydration shifts
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Escape key listener to close banner - inlined to avoid dependency on dismissBanner function
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDismissed(true);
        localStorage.setItem('hariyana_deal_dismissed_date', getTodayString());
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Check localStorage state
    const dismissedDate = localStorage.getItem('hariyana_deal_dismissed_date');
    const todayStr = getTodayString();
    if (dismissedDate !== todayStr) {
      setIsDismissed(false);
    }

    // Set up timer counting down to midnight
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight

      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (num: number) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const dismissBanner = () => {
    setIsDismissed(true);
    localStorage.setItem('hariyana_deal_dismissed_date', getTodayString());
  };

  if (!isMounted || isDismissed) {
    return null;
  }

  return (
    <div
      role="banner"
      className="relative z-50 w-full bg-[#C9A84C] text-[#0D0D0F] font-sans py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-md"
    >
      <div className="flex items-center space-x-1.5 animate-pulse">
        <Flame className="w-3.5 h-3.5 fill-current text-[#0D0D0F]" />
        <span>LIMITED FLASH STOCK:</span>
      </div>
      <span>
        Only 4 luxury frames left at special pricing! Deal expires in:
      </span>
      <span
        aria-live="polite"
        className="bg-[#0D0D0F] text-[#C9A84C] px-2 py-0.5 rounded font-mono text-[11px] tracking-wider ml-1"
      >
        {timeLeft}
      </span>
      
      <button
        onClick={dismissBanner}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0D0D0F]/80 hover:text-[#0D0D0F] transition-colors p-1"
        aria-label="Dismiss deal banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
