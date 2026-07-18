'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Award, Gem, ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'hariyana-heritage-launch-v1';

export default function HeritageLaunchAlert() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const dismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // The alert can still close when browser storage is unavailable.
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
      setIsOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        if (window.sessionStorage.getItem(STORAGE_KEY) !== 'dismissed') setIsOpen(true);
      } catch {
        setIsOpen(true);
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [dismiss, isOpen]);

  if (!isOpen || pathname !== '/') return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#24170F]/55 p-3 backdrop-blur-[5px] sm:p-6" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="heritage-launch-title"
        className="relative grid max-h-[calc(100vh-24px)] w-full max-w-[1040px] overflow-y-auto rounded-[20px] border border-[#D6B188] bg-[#FCF8F4] shadow-[0_32px_100px_rgba(46,27,14,0.34)] sm:max-h-[calc(100vh-48px)] lg:grid-cols-[1.02fr_.98fr] lg:overflow-hidden"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close Heritage Collection announcement"
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[#FCF8F4]/95 text-[#062C1C] shadow-md backdrop-blur-sm hover:bg-white sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative min-h-[245px] overflow-hidden bg-[#E9D7C5] lg:order-2 lg:min-h-[590px]">
          <div
            role="img"
            aria-label="Heritage Collection of authenticated antique watches and vintage eyewear"
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/heritage/homepage-reference.png)',
              backgroundPosition: '90% 51%',
              backgroundSize: 'auto 164%',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#24170F]/50 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[10px] border border-white/25 bg-[#1F180F]/70 px-4 py-3 text-white shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#F2C58F]">Private Collector Edit</p>
              <p className="mt-1 font-serif text-[17px] font-bold leading-none">Authenticated. Rare. Timeless.</p>
            </div>
            <Gem className="h-7 w-7 flex-none text-[#F2C58F]" strokeWidth={1.45} />
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:order-1 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full border border-[#C86620]/10" />
          <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full border border-[#C86620]/10" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D9B48D] bg-[#FBF1E8] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#8A491D]">
              <Award className="h-3.5 w-3.5" /> The Heritage Collection
            </span>
            <h2 id="heritage-launch-title" className="mt-5 font-serif text-[38px] font-bold leading-[0.97] text-[#111] sm:text-[48px]">
              A Legacy Worth<br /><span className="text-[#9A6328]">Collecting.</span>
            </h2>
            <p className="mt-5 max-w-[440px] text-[13px] leading-[1.75] text-[#5E5750] sm:text-[14px]">
              Enter a private world of authenticated antique pieces, vintage eyewear and collector-grade craftsmanship—curated for those who value history.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 text-[9px] font-semibold text-[#514941]">
              <span className="flex items-center gap-2 rounded-[8px] border border-[#E5D8CC] bg-white px-3 py-3"><ShieldCheck className="h-4 w-4 flex-none text-[#C86620]" /> Verified Authenticity</span>
              <span className="flex items-center gap-2 rounded-[8px] border border-[#E5D8CC] bg-white px-3 py-3"><Gem className="h-4 w-4 flex-none text-[#C86620]" /> Collector Pieces</span>
            </div>

            <Link href="/heritage" onClick={dismiss} data-bump="true" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[7px] bg-[#062C1C] px-6 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(6,44,28,0.18)] sm:w-auto">
              Explore Heritage Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <button type="button" onClick={dismiss} className="mt-4 block w-full text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7C7168] hover:text-[#C86620] sm:w-auto">
              Continue browsing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
