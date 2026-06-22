'use client';

import React from 'react';

type LuxuryNetworkMapProps = {
  variant: 'legacy' | 'store';
  className?: string;
};

/**
 * Decorative premium network visualization — not a functional map.
 * Both variants share coordinates so the graphic reads as one continuous panel.
 */
export default function LuxuryNetworkMap({ variant, className = '' }: LuxuryNetworkMapProps) {
  const viewBox = variant === 'legacy' ? '0 0 480 450' : '0 0 480 350';

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#050c14] ${className}`}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c7a14e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050c14" stopOpacity="0" />
          </radialGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="480" height={variant === 'legacy' ? 450 : 350} fill="#050c14" />
        <rect width="480" height={variant === 'legacy' ? 450 : 350} fill="url(#mapGlow)" />

        {/* Grid depth lines */}
        {[
          'M40 80 L440 80', 'M40 160 L440 160', 'M40 240 L440 240', 'M40 320 L440 320',
          'M80 40 L80 410', 'M160 40 L160 410', 'M240 40 L240 410', 'M320 40 L320 410', 'M400 40 L400 410',
        ].map((d, i) => (
          <path
            key={`grid-${i}`}
            d={d}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
            fill="none"
          />
        ))}

        {/* Network connections */}
        {[
          'M120 200 L200 140 L280 180 L360 120',
          'M80 280 L160 220 L240 260 L320 200 L400 240',
          'M200 140 L240 260', 'M280 180 L320 200',
          'M160 220 L120 200', 'M360 120 L400 240',
          'M240 260 L280 340', 'M320 200 L360 320',
        ].map((d, i) => (
          <path
            key={`net-${i}`}
            d={d}
            stroke="rgba(212,175,55,0.18)"
            strokeWidth="0.75"
            fill="none"
            filter="url(#lineGlow)"
          />
        ))}

        {/* Nodes */}
        {[
          [120, 200], [200, 140], [280, 180], [360, 120],
          [80, 280], [160, 220], [240, 260], [320, 200], [400, 240],
          [280, 340], [360, 320], [180, 360], [300, 80],
        ].map(([cx, cy], i) => (
          <circle
            key={`node-${i}`}
            cx={cx}
            cy={cy}
            r={variant === 'store' && i > 8 ? 2.5 : 2}
            fill="rgba(255,255,255,0.55)"
          />
        ))}

        {/* Primary location marker */}
        {variant === 'legacy' ? (
          <g transform="translate(280, 180)">
            <circle r="18" fill="rgba(212,175,55,0.12)" />
            <circle r="10" fill="rgba(212,175,55,0.25)" />
            <circle r="4" fill="#D4AF37" />
            <path
              d="M0 -22 C-8 -14 -12 -6 -12 2 C-12 10 -6 16 0 22 C6 16 12 10 12 2 C12 -6 8 -14 0 -22 Z"
              fill="#D4AF37"
              transform="translate(0, -8) scale(0.85)"
            />
          </g>
        ) : (
          <g transform="translate(320, 200)">
            <circle r="28" fill="rgba(212,175,55,0.1)" />
            <circle r="18" fill="rgba(212,175,55,0.18)" />
            <circle r="8" fill="#D4AF37" />
            <circle r="3" fill="#FFFFFF" />
          </g>
        )}
      </svg>
    </div>
  );
}
