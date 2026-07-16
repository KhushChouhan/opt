import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Gem, ShieldCheck, Sparkles } from 'lucide-react';
import { BRAND_LIST } from '@/data/brands';

export const metadata: Metadata = {
  title: 'Brands | Hariyana Watch & Opticals',
  description: 'Explore authentic eyewear and watch brands curated by Hariyana Watch & Opticals.',
};

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-[#FCF8F4] text-[#121212]">
      <section className="relative overflow-hidden border-b border-[#EADEC9] bg-[linear-gradient(135deg,#FFFDFB_0%,#F9EDE2_100%)]">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#D9B48D]/40" />
        <div className="absolute -right-6 -top-8 h-52 w-52 rounded-full border border-[#D9B48D]/30" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C86620]"><Sparkles className="h-4 w-4" /> Authentic House Selection</div>
          <h1 className="font-serif text-4xl font-semibold text-[#062C1C] sm:text-6xl lg:text-7xl">Brands with a <span className="italic text-[#C86620]">lasting legacy.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#625A53] sm:text-base">A considered collection of global eyewear and watch names, selected for design, performance and dependable after-sales support.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.1em] text-[#3F3934]">
            <span className="flex items-center gap-1.5 rounded-full border border-[#E1D0BF] bg-white px-4 py-2"><BadgeCheck className="h-3.5 w-3.5 text-[#C86620]" /> Verified Products</span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#E1D0BF] bg-white px-4 py-2"><ShieldCheck className="h-3.5 w-3.5 text-[#C86620]" /> Warranty Support</span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#E1D0BF] bg-white px-4 py-2"><Gem className="h-3.5 w-3.5 text-[#C86620]" /> Curated Selection</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C86620]">Our Brand Portfolio</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#062C1C] sm:text-4xl">Discover the signatures</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {BRAND_LIST.map((brand, index) => {
            const preview = brand.featuredSkus[0];
            return (
              <article key={brand.id} className="group grid min-h-[310px] overflow-hidden rounded-[16px] border border-[#EADEC9] bg-white shadow-[0_8px_30px_rgba(80,50,25,0.06)] sm:grid-cols-[1.05fr_.95fr]">
                <div className="flex flex-col justify-between p-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C86620]">House {String(index + 1).padStart(2, '0')}</p>
                    <h3 className="mt-3 font-serif text-3xl font-semibold text-[#062C1C]">{brand.name}</h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A491D]">{brand.tagline}</p>
                    <p className="mt-4 text-[11px] leading-5 text-[#655D56]">{brand.description}</p>
                  </div>
                  <Link href={`/products?search=${encodeURIComponent(brand.name)}`} data-bump="true" className="mt-5 inline-flex w-max items-center gap-2 rounded-[5px] bg-[#062C1C] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.06em] text-white">
                    Explore {brand.name} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="relative min-h-[220px] overflow-hidden bg-[#F5EADF] sm:min-h-full">
                  <Image src={preview.image_url} alt={`${brand.name} collection`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 28vw" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[16px] bg-[#062C1C] p-7 text-white sm:flex-row sm:items-center sm:p-9">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F0B878]">Personal Selection</p><h2 className="mt-2 font-serif text-2xl font-semibold text-white sm:text-3xl">Need help choosing the right brand?</h2><p className="mt-2 max-w-xl text-xs leading-5 text-white/70">Visit our showroom for personalized frame fitting and watch recommendations.</p></div>
          <Link href="/contact" data-bump="true" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[6px] bg-white px-5 text-[9px] font-bold uppercase tracking-[0.07em] text-[#062C1C]">Visit Our Store <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
