import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgePercent, CheckCircle2, Clock3, Gift, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Offers | Hariyana Watch & Opticals',
  description: 'Explore current eyewear, watch and accessory offers at Hariyana Watch & Opticals.',
};

const OFFERS = [
  {
    eyebrow: 'Limited Time',
    title: 'Buy Any Frames, Get Lens Free',
    description: 'Purchase any of our premium optical frames and get your prescription lenses absolutely free.',
    note: 'On all optical frames',
    image: '/images/premium_redesign/offer_lenses_free_ai.png',
    href: '/products?category=glasses',
    accent: '#F5E5D6',
  },
  {
    eyebrow: 'Special Offer',
    title: 'Free Gift on ₹2000+',
    description: 'Shop for ₹2000 or more across any category and receive a complimentary premium gift with your purchase.',
    note: 'On shopping above ₹2000',
    image: '/images/premium_redesign/offer_free_gift_ai.jpg',
    href: '/products',
    accent: '#F9EBDD',
  }
];

const BENEFITS = [
  { icon: ShieldCheck, title: '100% Authentic', text: 'Every offer applies to genuine products.' },
  { icon: Gift, title: 'Store Exclusive', text: 'Curated promotions across signature edits.' },
  { icon: CheckCircle2, title: 'Easy Support', text: 'Our team helps confirm product eligibility.' },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-[#FCF8F4] text-[#121212]">
      <section className="border-b border-[#EADEC9] bg-[linear-gradient(135deg,#FFFDFB_0%,#FBF1E8_100%)]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_.9fr] lg:px-12 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C86620]">
              <Sparkles className="h-4 w-4" /> Limited Editions &amp; Seasonal Rewards
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.02] text-[#062C1C] sm:text-6xl lg:text-7xl">
              Luxury, made even <span className="italic text-[#C86620]">more rewarding.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#625A53] sm:text-base">
              Explore considered offers across premium eyewear, watches and accessories—without compromising authenticity or service.
            </p>
            <Link href="#current-offers" data-bump="true" className="mt-7 inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#062C1C] px-6 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              Explore Current Offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[18px] border border-[#E3D4C5] bg-[#F3E7DB] shadow-[0_18px_50px_rgba(80,50,25,0.12)] sm:min-h-[380px]">
            <Image src="/images/luxury_watches.png" alt="Premium watch offer presentation" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 46vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5E9DD]/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-[10px] border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:bottom-7 sm:left-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C86620]">Seasonal Event</p>
              <p className="mt-1 font-serif text-xl font-semibold text-[#062C1C]">Up to 50% off</p>
            </div>
          </div>
        </div>
      </section>

      <section id="current-offers" className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C86620]">Now Available</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#062C1C] sm:text-4xl">Important Offers</h2>
          </div>
          <p className="max-w-md text-xs leading-6 text-[#6B625A] sm:text-right">Offer availability may vary by product and stock. Final eligibility is confirmed before purchase.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {OFFERS.map((offer) => (
            <article key={offer.title} className="group overflow-hidden rounded-[16px] border border-[#EADEC9] bg-white shadow-[0_8px_30px_rgba(80,50,25,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(80,50,25,0.11)]">
              <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: offer.accent }}>
                <Image src={offer.image} alt={offer.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" />
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#062C1C] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                  <BadgePercent className="h-3 w-3 text-[#F0B878]" /> {offer.eyebrow}
                </div>
              </div>
              <div className="p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#C86620]">{offer.note}</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#062C1C]">{offer.title}</h3>
                <p className="mt-2 min-h-[60px] text-xs leading-5 text-[#655D56]">{offer.description}</p>
                <Link href={offer.href} data-bump="true" className="mt-5 inline-flex h-9 items-center gap-2 rounded-[5px] bg-[#062C1C] px-4 text-[9px] font-bold uppercase tracking-[0.06em] text-white">
                  Shop Offer <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 grid overflow-hidden rounded-[16px] border border-[#E5D6C7] bg-[#FFFDFC] sm:grid-cols-3">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className={`flex gap-4 p-6 sm:p-7 ${index ? 'border-t border-[#EADEC9] sm:border-l sm:border-t-0' : ''}`}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBF1E8] text-[#C86620]"><Icon className="h-5 w-5" /></div>
                <div><h3 className="font-serif text-lg font-semibold text-[#062C1C]">{benefit.title}</h3><p className="mt-1 text-[11px] leading-5 text-[#6B625A]">{benefit.text}</p></div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-[12px] border border-[#EAD9C8] bg-[#FBF1E8] p-5 text-[#5E554E]">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#C86620]" />
          <p className="text-[11px] leading-5"><strong className="text-[#062C1C]">Offer note:</strong> Promotions cannot be combined unless stated otherwise. Terms, stock and participating products can change. Contact our showroom for current availability.</p>
        </div>
      </section>
    </div>
  );
}
