/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import {
  ShieldCheck, BadgeCheck, RotateCcw, Truck,
  ArrowRight, ChevronLeft, ChevronRight, Play, Pause, Camera, Star, CreditCard, PackageCheck
} from 'lucide-react';
import PerfectFrameSection from '@/components/home/PerfectFrameSection';

/* ─── Color tokens to match reference exactly ─── */
const C = {
  bg: '#FCF8F4',
  primary: '#062C1C',
  accent: '#C86620',
  text: '#121212',
  white: '#FFFFFF',
  muted: '#6B7280',
  border: '#EADEC9',
  surface: '#F8EEE5',
};

/* ─── Static Data Fallbacks ─── */
const BEST_SELLERS_STATIC = [
  { brand: 'Titan', name: 'Chronograph Premium', price: 8995, image: '/images/premium_redesign/category_watches.png', category: 'watches', rating: 4.6 },
  { brand: 'Tissot', name: 'PRX Powermatic 80', price: 42500, image: '/images/premium_redesign/tryon_watch_lifestyle.png', category: 'watches', rating: 4.8 },
  { brand: 'Seiko', name: 'Presage Automatic', price: 36990, image: '/images/premium_redesign/category_watches.png', category: 'watches', rating: 4.7 },
  { brand: 'Fossil', name: 'Grant Chronograph', price: 11995, image: '/images/premium_redesign/category_accessories.png', category: 'watches', rating: 4.6 },
  { brand: 'Citizen', name: 'Eco-Drive Classic', price: 19990, image: '/images/premium_redesign/tryon_watch_lifestyle.png', category: 'watches', rating: 4.6 },
  { brand: 'Casio', name: 'Edifice Chronograph', price: 9995, image: '/images/premium_redesign/category_watches.png', category: 'watches', rating: 4.5 },
];

const HOME_HERO_SLIDES = [
  {
    id: 'main-campaign',
    image: '/images/premium_redesign/hero_campaign_unified.png',
    imageAlt: 'Luxury eyewear and watch campaign',
    imageClass: 'object-cover object-[64%_center] lg:object-contain lg:object-center',
    eyebrow: 'SEE CLEAR. LIVE BETTER.',
    title: 'Timeless Style.',
    accentTitle: 'Every Day.',
    description: 'Premium eyewear and luxury watches crafted for those who value quality, comfort and elegance.',
    primaryLabel: 'EXPLORE EYEWEAR',
    primaryHref: '/products?category=glasses',
    features: [
      { label: '100% Authentic', icon: BadgeCheck },
      { label: '1 Year Warranty', icon: ShieldCheck },
      { label: 'Easy Returns', icon: RotateCcw },
    ],
    saleBadge: true,
    referenceImage: false,
  },
  {
    id: 'heritage-premium',
    image: '/images/heritage/homepage-reference.png',
    imageAlt: 'Premium Heritage Collection with vintage eyewear, pocket watches and collector timepieces',
    imageClass: 'object-cover object-center',
    eyebrow: 'PREMIUM HERITAGE COLLECTION',
    title: 'Where Heritage',
    accentTitle: 'Meets Luxury.',
    accentColor: '#9A6328',
    description: 'Discover our rare collection of handcrafted vintage eyewear and heritage watches selected for collectors who appreciate timeless craftsmanship.',
    primaryLabel: 'EXPLORE HERITAGE COLLECTION',
    primaryHref: '/heritage',
    secondaryLabel: 'BOOK PRIVATE APPOINTMENT',
    secondaryHref: '/contact?interest=private-heritage-viewing',
    features: [
      { label: 'Heritage Collection', icon: ShieldCheck },
      { label: 'Collector Edition', icon: Star },
      { label: 'Rare & Limited Pieces', icon: BadgeCheck },
      { label: 'Vintage Certified', icon: Camera },
      { label: 'Authentic Provenance', icon: PackageCheck },
    ],
    saleBadge: false,
    referenceImage: true,
  },
];

const TRENDING_STYLES = [
  { tag: 'LUXURY EDIT', name: 'SIGNATURE SCENT', img: '/images/premium_redesign/trending_urban_icons.png', video: '/videos/trending/model-01.mp4', href: '/products?category=perfumes', videoLabel: 'Signature fragrance campaign' },
  { tag: 'TECH EDIT', name: 'SMART MOTION', img: '/images/premium_redesign/trending_titanium.png', video: '/videos/trending/model-02.mp4', href: '/products?category=smart-watches', videoLabel: 'Smartwatch feature campaign' },
  { tag: 'WATCH EDIT', name: 'TIMELESS WRIST', img: '/images/premium_redesign/trending_street_drip.png', video: '/videos/trending/model-03.mp4', href: '/products?category=watches', videoLabel: 'Classic watch fashion campaign' },
  { tag: 'OPTICAL EDIT', name: 'MODERN OPTICS', img: '/images/premium_redesign/trending_flip_ups.png', video: '/videos/trending/model-04.mp4', href: '/products?category=glasses', videoLabel: 'Premium optical frame campaign' },
  { tag: 'SUN EDIT', name: 'SUN-READY STYLE', img: '/images/premium_redesign/trending_retro_class.png', video: '/videos/trending/model-05.mp4', href: '/products?category=sunglasses', videoLabel: 'Gold aviator sunglasses campaign' },
];

function TrendingVideoCard({ item }: { item: (typeof TRENDING_STYLES)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  };

  const playVideoOnHover = () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      void playVideo();
    }
  };

  return (
    <article
      className="group relative aspect-[0.9] min-w-[205px] snap-start overflow-hidden rounded-[12px] bg-[#E9DED3] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:min-w-0"
      onMouseEnter={playVideoOnHover}
      onMouseLeave={stopVideo}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) stopVideo();
      }}
    >
      <video ref={videoRef} src={item.video} muted loop playsInline preload="metadata" aria-label={item.videoLabel} className="absolute inset-0 h-full w-full object-cover" />
      <Image src={item.img} alt={`${item.name} campaign preview`} fill sizes="(max-width: 767px) 205px, 20vw" className={`object-cover transition-all duration-500 ${isPlaying ? 'scale-[1.02] opacity-0' : 'opacity-100 group-hover:scale-105'}`} />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`} />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <button
          type="button"
          data-no-bump
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (isPlaying) stopVideo(); else void playVideo();
          }}
          aria-label={isPlaying ? `Pause ${item.name} video` : `Play ${item.name} video`}
          className={`${isPlaying ? 'm-auto' : 'mb-auto mt-[46%]'} flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-black/10 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110`}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="ml-0.5 h-4 w-4 fill-white" />}
        </button>
        <div aria-hidden={isPlaying} className={`mt-auto w-full pb-2 text-center transition-all duration-300 ${isPlaying ? 'invisible translate-y-2 opacity-0' : 'visible translate-y-0 opacity-100'}`}>
          <span className="mb-0.5 block text-[10px] font-bold tracking-[0.2em] text-white/90">{item.tag}</span>
          <h3 className="mb-2 font-sans text-[17px] font-bold uppercase tracking-[0.02em] text-white drop-shadow-md">{item.name}</h3>
          <Link href={item.href} data-bump="true" className="inline-block rounded bg-white px-4 py-1.5 text-[8px] font-bold uppercase tracking-wider transition-colors hover:bg-[#F8F4ED]" style={{ color: C.primary }}>
            SHOP NOW <ArrowRight className="ml-1 -mt-0.5 inline-block h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const watchCarouselRef = useRef<HTMLDivElement>(null);
  const trendingCarouselRef = useRef<HTMLDivElement>(null);
  const scrollWatches = (dir: number) => watchCarouselRef.current?.scrollBy({ left: dir * 250, behavior: 'smooth' });
  const scrollTrending = (dir: number) => trendingCarouselRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    if (isHeroPaused) return;

    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % HOME_HERO_SLIDES.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [isHeroPaused]);

  const activeHero = HOME_HERO_SLIDES[activeHeroSlide];
  const showPreviousHeroSlide = () => setActiveHeroSlide((current) => (current - 1 + HOME_HERO_SLIDES.length) % HOME_HERO_SLIDES.length);
  const showNextHeroSlide = () => setActiveHeroSlide((current) => (current + 1) % HOME_HERO_SLIDES.length);

  const { data: products } = useSWR<any[]>('/api/products');
  const watchProducts = products && products.length > 0
    ? products.filter(p => p.category === 'watches').slice(0, 6)
    : BEST_SELLERS_STATIC.map((p, idx) => ({ ...p, id: `mock-${idx}`, stock: 5 }));

  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen font-sans selection:bg-[#183629] selection:text-white">

      {/* Top Announcement Bar removed to avoid duplication with Navbar */}

      {/* ─── HERO SECTION ─── */}
      <section
        className="relative min-h-[560px] overflow-hidden sm:min-h-[600px] lg:aspect-[2/1] lg:min-h-0"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured collections"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onFocusCapture={() => setIsHeroPaused(true)}
        onBlurCapture={() => setIsHeroPaused(false)}
      >
        <div className="absolute inset-0 z-0 bg-[#F8EEE5]">
          {HOME_HERO_SLIDES.map((slide, index) => {
            const isActive = index === activeHeroSlide;

            return (
              <div key={slide.id} className={`absolute inset-0 transition-all duration-700 ease-out ${isActive ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-8 opacity-0'}`} aria-hidden={!isActive}>
                {slide.referenceImage ? (
                  <>
                    <div className="absolute inset-0 bg-[#F8EEE5]" />
                    <div
                      role="img"
                      aria-label={slide.imageAlt}
                      className="absolute inset-0 bg-no-repeat"
                      style={{ backgroundImage: `url(${slide.image})`, backgroundPosition: '90% 51%', backgroundSize: 'auto 164%' }}
                    >
                      <div
                        className="absolute inset-0 hidden lg:block"
                        style={{ background: 'linear-gradient(90deg, #F8EEE5 0%, #F8EEE5 38%, rgba(248,238,229,0.97) 46%, rgba(248,238,229,0.66) 56%, rgba(248,238,229,0) 72%)' }}
                      />
                    </div>
                  </>
                ) : (
                  <Image src={slide.image} alt={slide.imageAlt} fill className={slide.imageClass} priority sizes="100vw" />
                )}
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#FCF8F4]/95 via-[#FCF8F4]/70 to-transparent sm:via-[#FCF8F4]/50 lg:hidden" />

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1440px] px-5 sm:min-h-[600px] sm:px-8 lg:h-full lg:min-h-0 lg:px-12">
          {/* Left Side 45% */}
          <div key={activeHero.id} className="hero-content-enter relative z-20 flex h-full w-full max-w-[600px] flex-col justify-center pr-0 lg:w-[45%] lg:pr-10" aria-live="polite">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.5px] sm:mb-3 sm:text-[12px]" style={{ color: C.primary }}>{activeHero.eyebrow}</p>
            <h1 className="font-serif text-[42px] font-bold leading-[0.96] sm:text-[54px] lg:text-[62px]" style={{ color: '#111111' }}>
              {activeHero.title}<br/>
              <span style={{ color: 'accentColor' in activeHero ? activeHero.accentColor : C.accent }}>{activeHero.accentTitle}</span>
            </h1>
            <p className="mt-4 max-w-[350px] text-[14px] font-normal leading-[1.5] sm:mt-5 sm:max-w-[390px] sm:text-[16px]" style={{ color: '#333333' }}>
              {activeHero.description}
            </p>

            <div className="mt-5 flex w-full max-w-[320px] flex-col gap-3 min-[430px]:grid min-[430px]:max-w-[360px] min-[430px]:grid-cols-2 sm:mt-6 sm:flex sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-4">
              <Link href={activeHero.primaryHref} data-bump="true" className="btn-primary gap-1.5 px-3 sm:px-6">
                {activeHero.primaryLabel}
                {activeHero.id === 'heritage-premium' ? <ArrowRight className="h-3.5 w-3.5" /> : null}
              </Link>
              {'secondaryHref' in activeHero && activeHero.secondaryHref && activeHero.secondaryLabel ? (
                <Link href={activeHero.secondaryHref} data-bump="true" className="btn-secondary px-3 sm:px-6">
                  {activeHero.secondaryLabel}
                </Link>
              ) : null}
            </div>

            <div className="mobile-rail mt-5 flex max-w-full items-center gap-4 overflow-x-auto pb-1 sm:mt-7 sm:flex-wrap sm:gap-x-6 sm:gap-y-2 sm:overflow-visible">
              {activeHero.features.map((feature) => (
                <span key={feature.label} className="flex flex-none items-center gap-1.5 text-[9px] font-semibold sm:gap-2 sm:text-[10px]" style={{ color: '#222' }}>
                  <feature.icon className="h-4 w-4" style={{color: C.accent}} /> {feature.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right Side 55% */}
          <div className="relative hidden h-full w-[55%] lg:block">
            {/* Summer Sale Badge perfectly positioned overlapping the right edge */}
            {activeHero.saleBadge ? (
              <div className="absolute right-0 top-[25%] z-30 flex h-[132px] w-[132px] flex-col items-center justify-center overflow-hidden rounded-full border-[3px] bg-[#111111] px-3 py-3 text-center text-white shadow-xl" style={{ borderColor: C.accent }}>
                <span className="mb-2 block whitespace-nowrap text-[9px] font-bold uppercase leading-none tracking-[0.14em]" style={{ color: C.accent }}>SUMMER SALE</span>
                <span className="block text-[13px] font-bold uppercase leading-none tracking-widest text-white">UP TO</span>
                <span className="my-1 block font-serif text-[42px] font-bold leading-[0.9] text-[#C86620]">50%</span>
                <span className="block text-[13px] font-bold uppercase leading-none tracking-widest text-[#C86620]">OFF</span>
              </div>
            ) : activeHero.referenceImage ? null : (
              <div className="absolute right-0 top-[24%] z-30 rounded-[10px] border border-white/70 bg-[#FCF8F4]/90 px-4 py-3 text-right shadow-sm backdrop-blur-sm">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#C86620]">Premium Edit</p>
                <p className="mt-1 font-serif text-[18px] font-bold leading-none text-[#062C1C]">Collector&apos;s Choice</p>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 sm:bottom-auto sm:right-6 sm:top-6 lg:right-12">
          <button type="button" onClick={showPreviousHeroSlide} aria-label="Previous homepage hero slide" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/75 bg-[#FCF8F4]/90 text-[#062C1C] shadow-sm backdrop-blur-sm hover:bg-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 rounded-full border border-white/75 bg-[#FCF8F4]/90 px-2.5 py-2 shadow-sm backdrop-blur-sm" aria-label={`Slide ${activeHeroSlide + 1} of ${HOME_HERO_SLIDES.length}`}>
            {HOME_HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show homepage slide ${index + 1}`}
                aria-current={index === activeHeroSlide ? 'true' : undefined}
                onClick={() => setActiveHeroSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeHeroSlide ? 'w-5 bg-[#C86620]' : 'w-1.5 bg-[#9D8C7E]'}`}
              />
            ))}
          </div>
          <button type="button" onClick={showNextHeroSlide} aria-label="Next homepage hero slide" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/75 bg-[#FCF8F4]/90 text-[#062C1C] shadow-sm backdrop-blur-sm hover:bg-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ─── SHOP BY CATEGORY ─── */}
      <section className="mx-auto max-w-[1440px] px-4 pt-4 pb-2 sm:px-8 md:pt-5 lg:px-12">
        <div className="mobile-rail -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 lg:gap-6">
          {[
            { title: 'EYEGLASSES', sub: 'Explore Collection', img: '/images/premium_redesign/category_eyeglasses_reference.png', link: '/products?category=glasses' },
            { title: 'SUNGLASSES', sub: 'Explore Collection', img: '/images/premium_redesign/category_sunglasses_reference.png', link: '/products?category=sunglasses' },
            { title: 'CONTACT LENSES', sub: 'Explore Now', img: '/images/premium_redesign/category_contact_lenses_reference.png', link: '/products?category=contact-lenses' },
            { title: 'WATCHES', sub: 'Explore Collection', img: '/images/premium_redesign/category_watches_reference.png', link: '/products?category=watches' },
            { title: 'ACCESSORIES', sub: 'Explore Collection', img: '/images/premium_redesign/category_accessories_reference.png', link: '/products?category=accessories' },
          ].map((cat) => (
            <Link
              key={cat.title}
              href={cat.link}
              className="group relative block aspect-[0.94] min-w-[158px] snap-start overflow-hidden rounded-[14px] bg-[#fbf8f3] shadow-[0_3px_14px_rgba(71,45,27,0.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(71,45,27,0.10)] md:min-w-0"
            >
              <Image
                src={cat.img}
                alt={cat.title}
                fill
                sizes="(max-width: 767px) 50vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#fbf8f3] via-[#fbf8f3]/75 to-transparent [background-size:100%_58%] bg-no-repeat" />
              <div className="absolute left-0 top-0 z-10 p-4 text-left sm:p-5 lg:p-6">
                <h3 className="font-sans text-[12px] font-bold leading-none tracking-[-0.01em] text-[#151515] sm:text-[13px] lg:text-[15px]">{cat.title}</h3>
                <span className="mt-3 flex items-center gap-1 text-[9px] font-medium leading-none text-[#292929] sm:text-[10px] lg:text-[12px]">
                  {cat.sub}
                  <ArrowRight className="h-3 w-3 text-[#C86620] lg:h-3.5 lg:w-3.5" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── TRUSTED BRANDS ─── */}
      <section className="mx-auto max-w-[1400px] px-4 py-4 sm:px-8 md:py-5" aria-labelledby="brands-heading">
        <div className="rounded-[14px] border border-[#E9DDD1] bg-white px-4 py-4 shadow-[0_6px_24px_rgba(80,50,25,0.04)] sm:px-6">
          <div className="mb-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#C86620]">Curated for you</p>
              <h2 id="brands-heading" className="font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-[#171717] sm:text-[15px]">Trusted Brands</h2>
            </div>
          </div>

          <div className="mobile-rail -mx-4 flex snap-x items-center gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-7 md:gap-2 md:overflow-visible md:px-0">
            {[
              { name: 'TITAN', className: 'tracking-[0.16em]' },
              { name: 'Fastrack', className: 'italic tracking-[-0.03em]' },
              { name: 'Ray-Ban', className: 'font-serif italic tracking-[-0.04em]' },
              { name: 'FOSSIL', className: 'tracking-[0.18em]' },
              { name: 'CASIO', className: 'tracking-[0.12em]' },
              { name: 'SEIKO', className: 'font-serif tracking-[0.12em]' },
              { name: 'CITIZEN', className: 'tracking-[0.14em]' },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={`/products?search=${encodeURIComponent(brand.name)}`}
                className="group flex h-[58px] min-w-[136px] snap-start items-center justify-center rounded-[9px] border border-[#EEE4DB] bg-[#FCF8F4] px-4 text-center transition-all hover:-translate-y-0.5 hover:border-[#C86620]/45 hover:bg-[#FBF1E8] md:min-w-0"
              >
                <span className={`font-sans text-[14px] font-bold text-[#282522] transition-colors group-hover:text-[#C86620] sm:text-[15px] ${brand.className}`}>{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEW & TRENDING ─── */}
      <section className="relative mx-auto max-w-[1400px] px-4 pt-4 pb-4 text-center sm:px-8 md:pt-5 md:pb-5">
        <h2 className="font-serif text-[25px] font-bold uppercase leading-none tracking-[0.04em] sm:text-[30px]" style={{ color: C.primary }}>NEW & TRENDING</h2>
        <div className="relative mt-2 mb-5 flex items-center justify-between">
          <p className="mx-auto text-[10px] font-medium tracking-[0.06em] uppercase" style={{ color: C.muted }}>THE LATEST IN EYEWEAR, WATCHES &amp; LUXURY LIFESTYLE.</p>
          <Link href="/products" data-bump="true" className="absolute right-0 hidden items-center gap-1 rounded-[5px] border border-[#D9B48D] bg-[#FBF1E8] px-3 py-2 text-[9px] font-bold uppercase sm:flex" style={{ color: C.accent }}>View All <ArrowRight className="w-3 h-3"/></Link>
        </div>

<<<<<<< HEAD
              return (
                <div
                  key={p.id}
                  className="snap-start flex-shrink-0 w-[240px] rounded-xl border border-white/10 bg-[#0b131e]/90 hover:border-[#c7a14e]/50 hover:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300 group flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative aspect-square w-full bg-transparent overflow-hidden">
                    <Image 
                      src={p.image_url} 
                      alt={p.name} 
                      fill 
                      sizes="240px" 
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-4 pt-0 flex flex-col justify-between flex-grow">
                    <div>
                      <p className="text-[11px] font-semibold text-[#c7a14e] uppercase tracking-wider">{actualBrand}</p>
                      <p className="text-[12px] text-white mt-0.5 font-bold truncate leading-snug line-clamp-1">{actualName}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">₹{Math.round(p.price * 0.8).toLocaleString('en-IN')}</span>
                        <span className="text-[9px] text-[#c7a14e] uppercase tracking-widest font-semibold">{p.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px]">
                        <span className="text-gray-500 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-[#25D366] font-bold">20% Off</span>
                      </div>
                    </div>
                    
                    <div className="mt-3.5 space-y-1.5">
                      {!p.id.startsWith('mock-') ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCheckoutProduct({ id: p.id, name: p.name, price: Math.round(p.price * 0.8) });
                            setIsCheckoutOpen(true);
                          }}
                          className="w-full py-2 bg-[#c7a14e] text-[#050c14] hover:bg-[#e8d9a0] text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 shadow-md"
                        >
                          <ShoppingCart className="w-3 h-3" /> Buy Now
                        </button>
                      ) : (
                        <button
                          onClick={() => inquire(`${actualBrand} ${actualName}`)}
                          className="w-full py-2 bg-[#c7a14e] text-[#050c14] hover:bg-[#e8d9a0] text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 shadow-md"
                        >
                          Buy on WhatsApp
                        </button>
                      )}
                      
                      {hasTryOn && !p.id.startsWith('mock-') && (
                        <Link
                          href={tryOnLink}
                          className="block w-full py-1.5 border border-[#c7a14e]/30 text-gray-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded text-center transition-colors hover:bg-[#c7a14e]/10"
                        >
                          Try On AR
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0b131e] border border-[#c7a14e]/30 items-center justify-center text-[#c7a14e] hover:bg-[#c7a14e] hover:text-[#050c14] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
=======
        <button type="button" onClick={() => scrollTrending(-1)} aria-label="Previous trending styles" className="absolute left-1 top-[58%] z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EADEC9] bg-white shadow-sm md:flex"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => scrollTrending(1)} aria-label="Next trending styles" className="absolute right-1 top-[58%] z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EADEC9] bg-white shadow-sm md:flex"><ChevronRight className="h-4 w-4" /></button>
        <div ref={trendingCarouselRef} className="mobile-rail -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 text-left sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:text-center">
          {TRENDING_STYLES.map((item) => <TrendingVideoCard key={item.name} item={item} />)}
>>>>>>> 902d8ad (UI redesign: navbar fixes, color updates, cleanup unused files, logo resize)
        </div>
      </section>

      {/* ─── FIND YOUR PERFECT FRAME ─── */}
      <PerfectFrameSection />

      {/* ─── OFFERS GRID ─── */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 md:py-7" aria-labelledby="offers-heading">
        <div className="mb-4 px-1">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#C86620]">Limited-time savings</p>
            <h2 id="offers-heading" className="font-serif text-[24px] font-bold uppercase leading-none tracking-[0.04em] text-[#062C1C] sm:text-[28px]">Important Offers</h2>
          </div>
        </div>
        <div className="mobile-rail -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 sm:gap-4 relative">
          {[
            { tag: 'LIMITED TIME', title: 'BUY 1\nGET 1', sub: 'On Selected Frames', btn: 'SHOP NOW', img: '/images/premium_redesign/offer_buy1get1.png' },
            { tag: 'SUMMER SPECIAL', title: 'FLAT\n40% OFF', sub: 'On Sunglasses', btn: 'SHOP SUNGLASSES', img: '/images/premium_redesign/offer_flat40.png' },
            { tag: 'FESTIVAL SALE', title: 'UP TO\n50% OFF', sub: 'On Premium Watches', btn: 'EXPLORE WATCHES', img: '/images/premium_redesign/category_watches_reference.png' },
            { tag: 'STUDENT EXCLUSIVE', title: 'EXTRA\n10% OFF', sub: 'On All Products', btn: 'VERIFY NOW', img: '/images/premium_redesign/offer_clean_student.png' },
            { tag: 'CLEARANCE SALE', title: 'UP TO\n60% OFF', sub: 'On Last Season Styles', btn: 'SHOP NOW', img: '/images/premium_redesign/category_accessories_reference.png' },
          ].map((offer, i) => (
            <div key={i} className="group relative flex min-h-[188px] min-w-[225px] snap-start flex-col justify-between overflow-hidden rounded-[14px] border border-[#E9D8C8] bg-gradient-to-br from-[#FFFDFC] via-[#FBF1E8] to-[#F4E4D5] p-4 shadow-[0_7px_22px_rgba(89,55,24,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C86620]/45 hover:shadow-[0_12px_30px_rgba(89,55,24,0.12)] sm:p-[18px] md:min-w-0">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#C86620] via-[#D99755] to-transparent" />
              {/* Product Image on the Right */}
              <div className="pointer-events-none absolute right-[-13%] bottom-[3%] z-0 h-[82%] w-[68%] overflow-hidden rounded-lg transition-transform duration-500 group-hover:scale-[1.04]">
                <Image src={offer.img} alt={offer.title.replace('\n', ' ')} fill className="rounded-lg object-contain object-right mix-blend-multiply" />
              </div>

              {/* Left Content */}
              <div className="relative z-10 w-[65%] flex flex-col h-full">
                <div>
                  <span className="mb-2 inline-flex rounded-full border border-[#D9B48D] bg-white/75 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.07em] text-[#9A4D18] sm:text-[8px]">{offer.tag}</span>
                  <h3 className="text-[15px] sm:text-[17px] font-black uppercase leading-[1.1] mb-1 whitespace-pre-line text-[#111111] font-inter">
                    {offer.title}
                  </h3>
                  <p className="text-[9px] sm:text-[9.5px] text-[#666666] mb-3 font-inter">{offer.sub}</p>
                </div>
                
                <div className="mt-auto">
                  <Link href="/products" data-bump="true" className="inline-block rounded-[5px] bg-[#062C1C] px-3 py-[7px] text-[8px] font-bold uppercase text-white transition-colors hover:bg-[#0B422C] sm:text-[9px]">
                    {offer.btn}
                  </Link>
                  <p className="text-[7.5px] mt-2 text-[#777777] font-inter">*T&C Apply</p>
                </div>
              </div>
            </div>
          ))}

          {/* Optional Carousel Arrow exactly like reference */}
          <div className="hidden md:flex absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center border border-gray-100 cursor-pointer hover:bg-gray-50 z-20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </section>

      {/* ─── LUXURY WATCHES ─── */}
      <section id="luxury-watches" className="relative mx-auto max-w-[1400px] scroll-mt-36 px-4 py-6 sm:px-8 md:py-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex-1 hidden md:block border-t" style={{ borderColor: C.border }} />
          <h2 className="px-3 font-serif text-[25px] font-bold uppercase tracking-[0.04em] sm:px-8 sm:text-[30px]" style={{ color: C.primary }}>LUXURY WATCHES</h2>
          <div className="flex-1 hidden md:block border-t" style={{ borderColor: C.border }} />
        </div>
        <div className="mb-5 text-center">
          <p className="text-[10px] font-medium tracking-[0.04em]" style={{ color: C.muted }}>Precision, craftsmanship and style — all in one.</p>
          <Link href="/products?category=watches" data-bump="true" className="absolute right-8 top-16 mt-2 hidden items-center gap-1 rounded-[5px] border border-[#D9B48D] bg-[#FBF1E8] px-3 py-2 text-[9px] font-bold uppercase md:inline-flex" style={{ color: C.accent }}>View All Watches <ArrowRight className="w-3 h-3"/></Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(220px,1fr)] lg:grid-cols-4 lg:gap-6">
          <div className="lg:col-span-3 relative">
            <button onClick={() => scrollWatches(-1)} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 border" style={{ borderColor: C.border }}><ChevronLeft className="w-4 h-4" style={{color: C.primary}}/></button>
            <button onClick={() => scrollWatches(1)} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 border" style={{ borderColor: C.border }}><ChevronRight className="w-4 h-4" style={{color: C.primary}}/></button>

            <div ref={watchCarouselRef} className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-4" style={{ scrollbarWidth: 'none' }}>
              {watchProducts.map((p: any) => (
                <Link key={p.id} href={String(p.id).startsWith('mock-') ? '/products?category=watches' : `/products/${p.id}`} className="group flex w-[150px] flex-shrink-0 snap-start cursor-pointer flex-col overflow-hidden rounded-[12px] border bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[160px]" style={{ borderColor: C.border }} aria-label={`View details for ${p.name}`}>
                  <div className="relative aspect-square w-full p-4 flex items-center justify-center border-b" style={{ background: C.surface, borderColor: C.border }}>
                    <Image src={p.image_url || p.image || '/images/premium_redesign/category_watches_reference.png'} alt={p.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform mix-blend-multiply" />
                  </div>
                  <div className="flex flex-grow flex-col bg-white p-3">
                    <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: C.muted }}>{p.brand}</p>
                    <p className="text-xs font-bold mt-1 line-clamp-2 leading-snug" style={{ color: C.text }}>{p.name}</p>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="text-sm font-black" style={{ color: C.primary }}>₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: C.accent }}><Star className="w-3 h-3 fill-current"/> {p.rating || '4.8'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="group relative flex overflow-hidden rounded-[12px] border bg-white shadow-sm md:col-span-1 md:flex-col lg:rounded-2xl" style={{ borderColor: C.border }}>
            <div className="z-10 flex w-[42%] flex-col justify-center border-r bg-white p-4 text-left md:w-full md:border-r-0 md:border-b md:p-5 md:text-center lg:p-6" style={{ borderColor: C.border }}>
              <h3 className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: C.primary }}>TRY-ON FOR WATCHES</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase">See how it looks on your wrist</p>
            </div>
            <div className="relative min-h-[190px] flex-grow bg-[#F8F4ED] sm:min-h-[220px] md:min-h-[250px]">
              <Image src="/images/premium_redesign/tryon_watch_lifestyle.png" alt="Try on watch" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-6">
                <Link href="/products?category=watches" data-bump="true" className="flex items-center gap-2 rounded border border-white/20 bg-black/80 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur transition-colors hover:bg-black">
                  <Camera className="w-3 h-3" /> TRY ON WATCHES
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ASSURANCE STRIP ─── */}
      <section className="mx-auto max-w-[1400px] px-4 py-2 sm:px-8 md:py-3">
        <div className="mobile-rail flex gap-2 overflow-x-auto rounded-[12px] bg-[#FBF1E8] px-3 py-4 md:grid md:grid-cols-6 md:gap-0 md:px-6 md:py-5">
          {[
            { icon: BadgeCheck, t1: 'Free Eye Test', t2: 'At All Our Stores' },
            { icon: ShieldCheck, t1: '100% Authentic', t2: 'Genuine Brands' },
            { icon: RotateCcw, t1: '1 Year Warranty', t2: 'On All Products' },
            { icon: Truck, t1: 'Easy Returns', t2: 'Hassle Free' },
            { icon: CreditCard, t1: 'Secure Payments', t2: '100% Safe & Secure' },
            { icon: PackageCheck, t1: 'Free Delivery', t2: 'Above ₹999' },
          ].map(t => (
            <div key={t.t1} className="flex min-w-[140px] flex-none items-center justify-start gap-2 px-2 text-left md:min-w-0 md:justify-center md:gap-3">
              <t.icon className="h-8 w-8 flex-none text-[#D56A1B]" strokeWidth={1.6}/>
              <span>
                <span className="block text-[10px] font-bold text-[#161616]">{t.t1}</span>
                <span className="block text-[8px] leading-4 text-[#3E3E3E]">{t.t2}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM INFO BLOCKS ─── */}
      <section className="mx-auto max-w-[1400px] px-4 py-3 sm:px-8 md:py-5">
        <div className="mobile-rail -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0">
          <article className="relative min-h-[220px] min-w-[270px] snap-start overflow-hidden rounded-[12px] border bg-white p-5 md:min-w-0" style={{ borderColor: C.border }}>
            <h3 className="font-sans text-[11px] font-bold uppercase">FROM OUR BLOG</h3>
            <Link href="/blog" className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-[#C86620]">View All <ArrowRight className="h-3 w-3"/></Link>
            <p className="mt-6 max-w-[140px] text-[12px] font-semibold leading-[1.45]">How to choose the perfect sunglasses?</p>
            <p className="mt-4 text-[8px] uppercase tracking-[0.04em] text-[#777]">MAY 30, 2024</p>
              <Link href="/blog" data-bump="true" className="absolute bottom-4 left-5 rounded-[4px] border border-[#BEB8B2] bg-white px-4 py-1.5 text-[8px] font-bold">READ MORE</Link>
            <div className="absolute bottom-0 right-0 h-[178px] w-[46%]">
              <Image src="/images/premium_redesign/blog_lifestyle.png" alt="Fashion eyewear blog" fill className="object-cover object-top" />
            </div>
          </article>

          <article className="min-h-[220px] min-w-[270px] snap-start rounded-[12px] border bg-white p-5 md:min-w-0" style={{ borderColor: C.border }}>
            <h3 className="font-sans text-[11px] font-bold uppercase">INSTAGRAM</h3>
            <p className="mt-1 text-[9px]">@hariyana_watch_opticals49</p>
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="relative aspect-[1.2] overflow-hidden rounded-[5px] bg-[#F8EEE5]">
                  <Image src="/images/premium_redesign/category_watches_reference.png" alt="Watch collection" fill className="object-cover" />
                </div>
              ))}
            </div>
            <a href="https://www.instagram.com/hariyana_watch_opticals49" target="_blank" rel="noopener noreferrer" data-bump="true" className="mx-auto mt-3 block w-max rounded-[4px] border border-[#BEB8B2] bg-white px-6 py-1.5 text-[8px] font-bold">FOLLOW US</a>
          </article>

          <article className="min-h-[220px] min-w-[270px] snap-start rounded-[12px] border bg-white p-5 md:min-w-0" style={{ borderColor: C.border }}>
            <h3 className="font-sans text-[11px] font-bold uppercase">FIND A STORE NEAR YOU</h3>
            <p className="mt-3 text-[9px] leading-[1.5]">Visit our stores for a premium<br/>experience</p>
            <div className="relative mt-3 h-[105px] overflow-hidden rounded-[6px]">
              <Image src="/images/premium_redesign/showroom_interior.png" alt="Hariyana showroom" fill className="object-cover" />
            </div>
            <Link href="/contact" data-bump="true" className="relative mx-auto -mt-3 block w-max rounded-[4px] border border-[#BEB8B2] bg-white px-6 py-1.5 text-[8px] font-bold">LOCATE STORE</Link>
          </article>

          <article className="relative min-h-[220px] min-w-[270px] snap-start overflow-hidden rounded-[12px] border bg-[#FBF1E8] p-5 md:min-w-0" style={{ borderColor: C.border }}>
            <h3 className="font-sans text-[11px] font-bold uppercase">VIRTUAL TRY-ON</h3>
            <p className="mt-3 max-w-[140px] text-[9px] leading-[1.55]">Try frames from your<br/>camera in real time</p>
            <Link href="/products?category=glasses" data-bump="true" className="absolute bottom-5 left-5 z-10 rounded-[4px] bg-[#062C1C] px-5 py-2 text-[8px] font-bold text-white">TRY NOW</Link>
            <div className="absolute bottom-0 right-0 h-[188px] w-[52%]">
              <Image src="/images/premium_redesign/virtual_tryon_app.png" alt="Customer previewing optical frames with virtual try-on" fill className="object-cover object-[52%_42%]" />
            </div>
          </article>
        </div>
      </section>

    </div>
  );
}
