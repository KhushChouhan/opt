'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperProps {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export default function SectionWrapper({
  title,
  subtitle,
  size = 'md',
  id,
  className = '',
  children,
}: SectionWrapperProps) {
  // Map size to our globals.css padding classes
  const paddingClass = {
    sm: 'section-sm',
    md: 'section-md',
    lg: 'section-lg',
  }[size];

  // Luxury ease-out curve (cubic-bezier)
  const easeLuxury = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.section
      id={id}
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4, ease: easeLuxury }}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${paddingClass} ${className}`}
    >
      {(title || subtitle) && (
        <div className="text-center mb-10 md:mb-12 flex flex-col items-center">
          {subtitle && (
            <span className="text-[10px] md:text-xs font-bold text-[#C9A84C] tracking-[0.25em] uppercase mb-2">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="text-2xl sm:text-4xl font-bold font-display tracking-wide text-white">
              {title}
            </h2>
          )}
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mt-4" />
        </div>
      )}
      {children}
    </motion.section>
  );
}
