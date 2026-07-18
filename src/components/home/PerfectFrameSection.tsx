'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, ArrowRight } from 'lucide-react';

const FRAME_STYLES = [
  { label: 'CATEYE',    imgSrc: '/images/premium_redesign/icon_exact_cateye.png',    href: '/products?shape=cat-eye' },
  { label: 'SQUARE',    imgSrc: '/images/premium_redesign/icon_exact_square.png',    href: '/products?shape=square' },
  { label: 'RECTANGLE', imgSrc: '/images/premium_redesign/icon_exact_rectangle.png', href: '/products?shape=rectangle' },
  { label: 'PILOT',     imgSrc: '/images/premium_redesign/icon_exact_pilot.png',     href: '/products?shape=pilot' },
  { label: 'ROUND',     imgSrc: '/images/premium_redesign/icon_exact_round.png',     href: '/products?shape=round' },
];

const MORE_FRAME_STYLES = [
  { label: 'RIMLESS', imgSrc: '/images/premium_redesign/icon_exact_rimless.svg', href: '/products?shape=rimless' },
  { label: 'RETRO',   imgSrc: '/images/premium_redesign/icon_exact_retro.svg',   href: '/products?shape=retro' },
  { label: 'OVAL',    imgSrc: '/images/premium_redesign/icon_exact_oval.svg',    href: '/products?shape=oval' },
];

export default function PerfectFrameSection() {
  const [showMoreFrames, setShowMoreFrames] = useState(false);

  const renderFrameStyle = (
    { label, imgSrc, href }: (typeof FRAME_STYLES)[number] | (typeof MORE_FRAME_STYLES)[number],
    idx: number,
    total: number,
  ) => (
    <Link
      key={label}
      href={href}
      className="group flex flex-col items-center justify-center transition-colors hover:bg-[#FBF1E8]"
      style={{
        padding: '14px 8px 12px',
        borderRight: idx < total - 1 ? '1px solid #DDD8CF' : 'none',
      }}
    >
      <div
        className="relative flex items-center justify-center transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-125"
        style={{ width: '60px', height: '28px' }}
      >
        <Image src={imgSrc} alt={`${label} frame shape`} fill className="object-contain" />
      </div>
      <span
        className="transition-colors group-hover:text-[#C86620]"
        style={{
          fontFamily: 'var(--font-sans), sans-serif',
          fontSize: '8.5px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#444444',
          marginTop: '8px',
          display: 'block',
        }}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <section
      className="mx-auto w-[calc(100%-24px)] max-w-[1280px] sm:w-[94%]"
      style={{ margin: '10px auto' }}
    >
      {/* Outer cream card */}
      <div
        className="flex w-full flex-col items-center px-3 py-4 text-center sm:px-7 sm:pt-5 sm:pb-[18px]"
        style={{
          backgroundColor: '#fcf9f4',
          border: '1px solid #DDD8CF',
          borderRadius: '12px',
        }}
      >
        {/* FIND YOUR */}
        <p
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: '#1A1A1A',
            marginBottom: '2px',
          }}
        >
          FIND YOUR
        </p>

        {/* PERFECT FRAME */}
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(22px, 6vw, 26px)',
            fontWeight: 700,
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
            lineHeight: 1.15,
            marginBottom: '4px',
          }}
        >
          <span style={{ color: '#1A1A1A' }}>PERFECT </span>
          <span style={{ color: '#C86620' }}>FRAME</span>
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '11px',
            fontWeight: 400,
            color: '#777777',
            marginBottom: '14px',
          }}
        >
          Pick a style you love. We&apos;ll show frames that suit you best.
        </p>

        {/* Icon Selector Box — full width of outer card */}
        <div
          className="mobile-rail w-full overflow-x-auto"
          style={{
            backgroundColor: '#fcf8f5',
            border: '1px solid #DDD8CF',
            borderRadius: '8px',
            marginBottom: '14px',
          }}
        >
          <div
            className="grid min-w-[520px] sm:min-w-0"
            style={{ gridTemplateColumns: `repeat(${FRAME_STYLES.length}, minmax(0, 1fr))` }}
          >
            {FRAME_STYLES.map((frame, idx) => renderFrameStyle(frame, idx, FRAME_STYLES.length))}
          </div>

          <div
            id="more-frame-shapes"
            className={`grid overflow-hidden border-t border-[#DDD8CF] transition-all duration-300 ${
              showMoreFrames ? 'max-h-28 opacity-100' : 'max-h-0 border-t-transparent opacity-0'
            }`}
            style={{ gridTemplateColumns: `repeat(${MORE_FRAME_STYLES.length}, minmax(0, 1fr))` }}
            aria-hidden={!showMoreFrames}
          >
            {MORE_FRAME_STYLES.map((frame, idx) => renderFrameStyle(frame, idx, MORE_FRAME_STYLES.length))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5" style={{ marginBottom: '10px' }}>
          <Link
            href="/products?category=glasses"
            data-bump="true"
            className="flex items-center justify-center gap-[6px] text-white transition-opacity hover:opacity-90"
            style={{
              width: '180px',
              height: '42px',
              backgroundColor: '#162B1F',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}
          >
            <Camera style={{ width: '14px', height: '14px', strokeWidth: 2 }} />
            TRY ON VIRTUAL
          </Link>
          <button
            type="button"
            onClick={() => setShowMoreFrames((current) => !current)}
            aria-expanded={showMoreFrames}
            aria-controls="more-frame-shapes"
            data-bump="true"
            className="flex items-center justify-center gap-[6px] transition-colors hover:bg-[#FBF1E8]"
            style={{
              width: '180px',
              height: '42px',
              border: '1px solid #C86620',
              borderRadius: '8px',
              color: '#8A491D',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}
          >
            {showMoreFrames ? 'HIDE EXTRA FRAMES' : 'VIEW MORE FRAMES'}
            <ArrowRight
              className={`transition-transform duration-300 ${showMoreFrames ? '-rotate-90' : 'rotate-90'}`}
              style={{ width: '14px', height: '14px', strokeWidth: 2 }}
            />
          </button>
        </div>

        {/* Bottom link */}
        <Link
          href="/products"
          className="flex items-center gap-[4px] hover:underline"
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '11px',
            fontWeight: 400,
            color: '#2D2D2D',
          }}
        >
          See how frames look on you
          <ArrowRight style={{ width: '12px', height: '12px', color: '#C86620', strokeWidth: 2.2 }} />
        </Link>
      </div>
    </section>
  );
}
