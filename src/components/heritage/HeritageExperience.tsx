'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  Gem,
  History,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const heroSlides = [
  {
    image: '/images/heritage/antique-piece-01.jpeg',
    alt: 'Vintage black and champagne-gold eyewear on a warm stone pedestal',
    badge: 'Curated Archive',
    imageClass: 'object-cover',
  },
  {
    image: '/images/heritage/antique-piece-10.jpeg',
    alt: 'Rare rimless brown and gold vintage eyewear in warm gallery light',
    badge: 'Collector Edition',
    imageClass: 'object-cover',
    title: 'Vintage Icons. Timeless Presence.',
    copy: 'Discover rare eyewear selected for its character, craft and enduring design.',
    cta: 'Explore Heritage Pieces',
    href: '#featured-heritage',
  },
];

const heritagePieces = [
  {
    name: 'The Noir Square Archive',
    year: '1978',
    origin: 'Italy',
    craft: 'Hand-finished acetate',
    condition: 'Collector Grade',
    certificate: 'Verified Provenance',
    image: '/images/heritage/antique-piece-04.jpeg',
  },
  {
    name: 'Gilded Round Atelier',
    year: '1968',
    origin: 'France',
    craft: 'Gold-tone metalwork',
    condition: 'Excellent',
    certificate: 'Archive Certificate',
    image: '/images/heritage/antique-piece-03.jpeg',
  },
  {
    name: 'Bronze Slimline Classic',
    year: '1975',
    origin: 'Japan',
    craft: 'Slim alloy profile',
    condition: 'Very Fine',
    certificate: 'Authentication File',
    image: '/images/heritage/antique-piece-13.jpeg',
  },
  {
    name: 'Tortoise Navigator',
    year: '1972',
    origin: 'Italy',
    craft: 'Double-bridge metal',
    condition: 'Excellent',
    certificate: 'Service Record',
    image: '/images/heritage/antique-piece-07.jpeg',
  },
  {
    name: 'Imperial Round Edition',
    year: '1965',
    origin: 'France',
    craft: 'Ornate temple detail',
    condition: 'Collector Grade',
    certificate: 'Verified Authenticity',
    image: '/images/heritage/antique-piece-08.jpeg',
  },
  {
    name: 'Crystal Cut Classic',
    year: '1984',
    origin: 'Europe',
    craft: 'Crystal acetate frame',
    condition: 'Very Fine',
    certificate: 'Collector Dossier',
    image: '/images/heritage/antique-piece-12.jpeg',
  },
];

const collectorChoices = [
  {
    label: 'Rimless Icons',
    title: 'Lightness, preserved in time.',
    copy: 'Delicate profiles and rose-tinted lenses selected for understated character.',
    image: '/images/heritage/antique-piece-06.jpeg',
  },
  {
    label: 'Gilded Details',
    title: 'Craft visible in every line.',
    copy: 'Black lenses, warm metal accents and balanced proportions with collector appeal.',
    image: '/images/heritage/antique-piece-11.jpeg',
  },
  {
    label: 'Rose Archive',
    title: 'A rare expression of its era.',
    copy: 'Gradient lenses and rimless construction, presented with complete context.',
    image: '/images/heritage/antique-piece-02.jpeg',
  },
  {
    label: 'Sculpted Metalwork',
    title: 'Precision, quietly distinctive.',
    copy: 'A slender archival profile selected for its restrained lines and beautifully aged finish.',
    image: '/images/heritage/antique-piece-05.jpeg',
  },
];

const authenticationItems = [
  { icon: FileCheck2, title: 'Certificate', copy: 'A documented record accompanies every qualifying piece.' },
  { icon: PackageCheck, title: 'Original Box', copy: 'Original presentation materials are recorded where available.' },
  { icon: ShieldCheck, title: 'Verified Authenticity', copy: 'Frame, lenses, hardware and period details are examined with care.' },
  { icon: Gem, title: 'Collector Grade', copy: 'Condition is communicated clearly, without marketplace language.' },
  { icon: History, title: 'Service History', copy: 'Known maintenance and restoration details are transparently noted.' },
];

interface ManagedHeritageProduct {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  brand?: string;
  stock?: number;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C86620]">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-[28px] font-bold leading-[1.05] tracking-[0.01em] text-[#062C1C] sm:text-[36px]">{title}</h2>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mx-auto mt-3 block h-px w-14 origin-center bg-[#C86620]"
      />
      {description ? <p className="mt-3 text-[12px] leading-[1.7] text-[#6B625A] sm:text-[13px]">{description}</p> : null}
    </div>
  );
}

export default function HeritageExperience() {
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const { data: managedProducts = [] } = useSWR<ManagedHeritageProduct[]>('/api/products');

  const managedHeritagePieces = managedProducts
    .filter((product) => product.description?.includes('[Collection: heritage]'))
    .map((product) => ({
      name: product.name,
      year: 'Archive',
      origin: product.brand || 'Hariyana Curation',
      craft: 'Collector-selected piece',
      condition: (product.stock ?? 0) > 0 ? 'Available for Viewing' : 'Private Reserve',
      certificate: 'Heritage Collection',
      image: product.image_url,
    }));

  const displayedHeritagePieces = [...managedHeritagePieces, ...heritagePieces];

  useEffect(() => {
    if (isHeroPaused) return;

    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isHeroPaused]);

  const showPreviousHeroSlide = () => {
    setActiveHeroSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };

  const showNextHeroSlide = () => {
    setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
  };

  return (
    <div className="overflow-hidden bg-[#FCF8F4] text-[#121212]">
      <section className="relative overflow-hidden border-b border-[#EADFD4] bg-[#F8EEE5]">
        <svg aria-hidden="true" viewBox="0 0 760 560" className="pointer-events-none absolute right-0 top-0 h-full w-[64%] text-[#9B6B48] opacity-[0.10]">
          <path d="M80 170c120-95 210-80 315-16 102 62 170 48 285-52M15 260c110-70 205-58 298 7 110 77 220 72 420-30M70 380c105-90 205-93 310-22 92 62 188 68 308 20" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="545" cy="180" r="72" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="545" cy="180" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M545 93v174M458 180h174M484 119l122 122M606 119 484 241" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative mx-auto grid min-h-[620px] max-w-[1440px] items-center gap-8 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[.88fr_1.12fr] lg:px-12 lg:py-16">
          <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 max-w-[610px]">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-[#C86620]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A491D] sm:text-[11px]">The Heritage Collection</p>
            </div>
            <h1 className="font-serif text-[46px] font-bold leading-[0.98] text-[#111] sm:text-[58px] lg:text-[66px]">
              Where Heritage<br />Meets <span className="text-[#9A6328]">Luxury.</span>
            </h1>
            <p className="mt-5 max-w-[500px] text-[14px] leading-[1.7] text-[#4F4943] sm:text-[16px]">
              Discover authenticated vintage eyewear and rare optical collectibles curated for passionate collectors.
            </p>
            <div className="mt-7 flex flex-col gap-3 min-[430px]:flex-row">
              <Link href="#featured-heritage" data-bump="true" className="btn-primary gap-2 px-6">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact?interest=private-heritage-viewing" data-bump="true" className="btn-secondary px-6">
                Book Private Viewing
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-semibold uppercase tracking-[0.07em] text-[#5E554E]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#C86620]" /> Authenticated</span>
              <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-[#C86620]" /> Private Acquisition</span>
              <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-[#C86620]" /> Collector Guidance</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="relative mx-auto w-full max-w-[690px]">
            <div className="absolute -bottom-5 -left-5 h-[78%] w-[78%] rounded-[18px] border border-[#A76C43]/25 bg-[#8A5735]/10" />
            <div
              className="relative aspect-[1.16] overflow-hidden rounded-[18px] border border-[#DCC9B8] bg-[#EEE0D4] shadow-[0_22px_60px_rgba(75,46,25,0.15)]"
              role="region"
              aria-roledescription="carousel"
              aria-label="Heritage and premium collections"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
              onFocusCapture={() => setIsHeroPaused(true)}
              onBlurCapture={() => setIsHeroPaused(false)}
            >
              {heroSlides.map((slide, index) => {
                const isActive = index === activeHeroSlide;

                return (
                  <div
                    key={slide.image}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${isActive ? 'pointer-events-auto translate-x-0 opacity-100' : 'pointer-events-none translate-x-8 opacity-0'}`}
                    aria-hidden={!isActive}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1023px) 100vw, 54vw"
                      className={`${slide.imageClass} transition-transform duration-700 hover:scale-[1.025]`}
                    />
                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-[#FCF8F4]/90 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#70401E] shadow-sm backdrop-blur-sm">{slide.badge}</div>

                    {slide.href ? (
                      <div className="absolute inset-x-4 bottom-4 rounded-[12px] border border-white/70 bg-[#FCF8F4]/95 p-4 shadow-[0_8px_26px_rgba(53,32,18,0.13)] backdrop-blur-md sm:inset-x-auto sm:left-5 sm:max-w-[360px] sm:p-5">
                        <h2 className="font-serif text-[20px] font-bold leading-tight text-[#062C1C] sm:text-[25px]">{slide.title}</h2>
                        <p className="mt-1.5 text-[10px] leading-[1.55] text-[#5E5750] sm:text-[11px]">{slide.copy}</p>
                        <Link href={slide.href} data-bump="true" className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[5px] bg-[#062C1C] px-4 text-[8px] font-bold uppercase tracking-[0.05em] text-white sm:text-[9px]">
                          {slide.cta} <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
                <button type="button" onClick={showPreviousHeroSlide} aria-label="Previous hero slide" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-[#FCF8F4]/90 text-[#062C1C] shadow-sm backdrop-blur-sm hover:bg-white">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-[#FCF8F4]/90 px-2.5 py-2 shadow-sm backdrop-blur-sm" aria-label={`Slide ${activeHeroSlide + 1} of ${heroSlides.length}`}>
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.image}
                      type="button"
                      aria-label={`Show slide ${index + 1}`}
                      aria-current={index === activeHeroSlide ? 'true' : undefined}
                      onClick={() => setActiveHeroSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === activeHeroSlide ? 'w-5 bg-[#C86620]' : 'w-1.5 bg-[#9D8C7E]'}`}
                    />
                  ))}
                </div>
                <button type="button" onClick={showNextHeroSlide} aria-label="Next hero slide" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-[#FCF8F4]/90 text-[#062C1C] shadow-sm backdrop-blur-sm hover:bg-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} variants={reveal} transition={{ duration: 0.65 }} className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-12">
        <div className="group relative min-h-[390px] overflow-hidden rounded-[14px] border border-[#E4D6C9] bg-[#FBF1E8] shadow-[0_8px_30px_rgba(71,45,27,0.07)] sm:min-h-[520px]">
          <Image src="/images/heritage/antique-piece-09.jpeg" alt="Archival silver eyewear presented in warm ivory light" fill sizes="(max-width: 1023px) 100vw, 52vw" className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]" />
          <div className="absolute bottom-4 left-4 rounded-[6px] border border-white/60 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#C86620]">Private Curation</p>
            <p className="mt-0.5 font-serif text-[15px] font-bold text-[#171717]">A story behind every piece</p>
          </div>
        </div>

        <div className="lg:pl-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C86620]">Our Legacy</p>
          <h2 className="mt-2 font-serif text-[32px] font-bold leading-[1.08] text-[#062C1C] sm:text-[42px]">Collected with patience.<br />Presented with purpose.</h2>
          <p className="mt-5 text-[13px] leading-[1.8] text-[#5E5750] sm:text-[14px]">
            For a true collector, eyewear is never only functional. It carries the hand of its maker, the character of its era and the quiet marks of design history.
          </p>
          <p className="mt-4 text-[13px] leading-[1.8] text-[#5E5750] sm:text-[14px]">
            The Heritage Collection brings those stories together through considered sourcing, transparent condition notes and personal guidance from first conversation to private viewing.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {['Considered curation', 'Personal guidance', 'Documented provenance'].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-[9px] border border-[#E8DCD0] bg-white px-3 py-3 text-[10px] font-semibold text-[#3F3934]">
                <CheckCircle2 className="h-4 w-4 flex-none text-[#C86620]" /> {item}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <section id="featured-heritage" className="scroll-mt-32 border-y border-[#EEE2D7] bg-[#FFFDFC] py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <SectionHeading eyebrow="Curated Archive" title="Featured Heritage Pieces" description="A considered selection of characterful vintage frames, offered with context rather than catalogue noise." />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-6">
            {displayedHeritagePieces.map((piece, index) => (
              <motion.article
                key={`${piece.name}-${index}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={reveal}
                transition={{ duration: 0.55, delay: index * 0.045 }}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-[14px] border border-[#E8DCD0] bg-white shadow-[0_5px_20px_rgba(71,45,27,0.045)] transition-shadow duration-300 hover:shadow-[0_14px_34px_rgba(71,45,27,0.11)]"
              >
                <div className="relative aspect-[1.08] overflow-hidden border-b border-[#EEE4DA] bg-[#F8EEE5]">
                  <Image src={piece.image} alt={piece.name} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-contain p-5 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05]" />
                  <span className="absolute left-4 top-4 rounded-full border border-[#DAB994] bg-[#FCF8F4]/95 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#8A491D]">Est. {piece.year}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="font-serif text-[22px] font-bold leading-tight text-[#171717]">{piece.name}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#EEE4DA] py-4 text-[9px]">
                    <span><b className="mb-0.5 block uppercase tracking-[0.1em] text-[#9A7255]">Origin</b>{piece.origin}</span>
                    <span><b className="mb-0.5 block uppercase tracking-[0.1em] text-[#9A7255]">Craft</b>{piece.craft}</span>
                    <span><b className="mb-0.5 block uppercase tracking-[0.1em] text-[#9A7255]">Condition</b>{piece.condition}</span>
                    <span><b className="mb-0.5 block uppercase tracking-[0.1em] text-[#9A7255]">Certificate</b>{piece.certificate}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#8A8179]">Valuation</p>
                      <p className="mt-0.5 text-[12px] font-bold text-[#062C1C]">Price on Request</p>
                    </div>
                    <Link href={`/contact?interest=${encodeURIComponent(piece.name)}`} data-bump="true" className="inline-flex h-9 items-center gap-1.5 rounded-[5px] bg-[#062C1C] px-4 text-[9px] font-bold uppercase text-white">
                      Request Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <SectionHeading eyebrow="Editorial Selection" title="Collector’s Choice" description="Four expressions of heritage, chosen for their visual restraint, archival character and enduring presence." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-6">
          {collectorChoices.map((choice, index) => (
            <motion.article key={choice.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} transition={{ duration: 0.6, delay: index * 0.07 }} className="group overflow-hidden rounded-[14px] border border-[#E8DCD0] bg-white shadow-[0_5px_20px_rgba(71,45,27,0.045)]">
              <div className="relative aspect-[1.52] overflow-hidden bg-[#F8EEE5]">
                <Image src={choice.image} alt={choice.title} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#C86620]">{choice.label}</p>
                <h3 className="mt-2 font-serif text-[22px] font-bold leading-[1.12] text-[#171717]">{choice.title}</h3>
                <p className="mt-3 text-[11px] leading-[1.7] text-[#655E57]">{choice.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#EEE2D7] bg-[#FBF3EB] py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <SectionHeading eyebrow="Collector Confidence" title="Authentication, Clearly Documented" description="A calm, transparent process built around the details collectors care about most." />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:mt-10 lg:grid-cols-5 lg:gap-4">
            {authenticationItems.map((item, index) => (
              <motion.article key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} transition={{ duration: 0.5, delay: index * 0.05 }} className="group rounded-[12px] border border-[#E5D8CC] bg-white p-4 text-center shadow-[0_4px_18px_rgba(71,45,27,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C86620]/45 hover:shadow-[0_10px_28px_rgba(71,45,27,0.09)] sm:p-5">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#E3C7AC] bg-[#FBF1E8] text-[#C86620] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-125">
                  <item.icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-3 font-sans text-[10px] font-bold uppercase tracking-[0.07em] text-[#25211E] sm:text-[11px]">{item.title}</h3>
                <p className="mt-2 text-[9px] leading-[1.55] text-[#716961] sm:text-[10px]">{item.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} variants={reveal} transition={{ duration: 0.65 }} className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid overflow-hidden rounded-[16px] border border-[#DFCDBD] bg-white shadow-[0_12px_38px_rgba(71,45,27,0.09)] lg:grid-cols-[.9fr_1.1fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C86620]">Private Viewing</p>
            <h2 className="mt-2 font-serif text-[32px] font-bold leading-[1.05] text-[#062C1C] sm:text-[42px]">Experience Every Piece In Person</h2>
            <p className="mt-4 max-w-lg text-[12px] leading-[1.75] text-[#655E57] sm:text-[13px]">A private appointment gives you time to study the frame, details, proportions and provenance with personal guidance in a calm setting.</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-semibold text-[#544D47]">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-[#C86620]" /> By appointment</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#C86620]" /> In-store consultation</span>
              <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-[#C86620]" /> Personal curation</span>
            </div>
            <Link href="/contact?interest=private-heritage-appointment" data-bump="true" className="btn-primary mt-7 w-max gap-2 px-6">
              Book Private Appointment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="group relative min-h-[330px] bg-[#F8EEE5] sm:min-h-[430px]">
            <Image src="/images/heritage/antique-piece-10.jpeg" alt="Private vintage eyewear viewing appointment" fill sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]" />
          </div>
        </div>
      </motion.section>
    </div>
  );
}
