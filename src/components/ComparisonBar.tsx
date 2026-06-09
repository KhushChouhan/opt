'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Product } from '../types';
import Link from 'next/link';

interface ComparisonBarProps {
  items: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function ComparisonBar({ items, onRemove, onClear }: ComparisonBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const [ariaMessage, setAriaMessage] = useState('');

  const active = items.length >= 2;

  // Manage ARIA announcement on change
  useEffect(() => {
    if (items.length > 0) {
      setAriaMessage(`Comparison list updated. ${items.length} items currently selected.`);
    } else {
      setAriaMessage('Comparison list cleared.');
    }
  }, [items.length]);

  // Focus trap implementation
  useEffect(() => {
    if (!active) {
      setIsOpen(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      // Handle Escape key to clear/dismiss
      if (e.key === 'Escape') {
        onClear();
        return;
      }

      // Keyboard focus trap
      if (e.key === 'Tab') {
        const focusableElements = containerRef.current.querySelectorAll(
          'a[href], button, input, [tabindex="0"]'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onClear]);

  // Sync open state
  useEffect(() => {
    if (active && items.length === 2 && !isOpen) {
      // Auto expand to show comparison
      setIsOpen(true);
    }
  }, [active, items.length, isOpen]);

  return (
    <>
      {/* Screen reader announcer */}
      <div className="sr-only" aria-live="polite">
        {ariaMessage}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            ref={containerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-[#C9A84C]/40 shadow-[0_-10px_45px_rgba(0,0,0,0.7)] px-4 py-4 md:py-6 text-left"
          >
            <div className="max-w-7xl mx-auto flex flex-col space-y-4">
              
              {/* Header Toggles */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                    Product Comparison ({items.length}/3 selected)
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    ref={firstItemRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs text-gray-400 hover:text-[#C9A84C] font-semibold transition-colors uppercase tracking-wider py-1 px-2.5 border border-white/10 rounded-md hover:bg-white/5"
                  >
                    {isOpen ? 'Minimize Specs' : 'Expand Specs'}
                  </button>
                  <button
                    onClick={onClear}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors uppercase tracking-wider py-1 px-2.5 hover:bg-red-500/10 rounded-md"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Dynamic Comparison Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.slice(0, 3).map((product) => {
                  const tryOnLink = product.category === 'watches'
                    ? `/try-on/watches/${product.id}`
                    : `/try-on/glasses/${product.id}`;

                  return (
                    <div
                      key={product.id}
                      className="bg-charcoal border border-white/5 p-3.5 rounded-xl relative flex flex-col justify-between"
                    >
                      {/* Delete item */}
                      <button
                        onClick={() => onRemove(product.id)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full"
                        aria-label={`Remove ${product.name} from comparison`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Product identity */}
                      <div className="flex items-start space-x-3">
                        <div className="relative w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded overflow-hidden">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="pr-5">
                          <h4 className="text-[11px] font-bold text-white leading-tight line-clamp-1">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5 tracking-wider block">
                            {product.category}
                          </span>
                          <span className="text-xs font-bold text-[#C9A84C] mt-1 block">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Spec comparisons (Toggled display) */}
                      {isOpen && (
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[10px] text-gray-400">
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span>Material</span>
                            <span className="text-white font-semibold">
                              {product.specs?.material || 'Premium Steel / Acetate'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span>Stock Status</span>
                            <span className={product.stock > 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                              {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span>Warranty</span>
                            <span className="text-white font-semibold">
                              {product.specs?.warranty || '1 Year Store Warranty'}
                            </span>
                          </div>
                          {product.category === 'watches' ? (
                            <div className="flex justify-between pb-1">
                              <span>Lug Width</span>
                              <span className="text-white font-semibold">
                                {product.specs?.lugWidth || '22 mm'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between pb-1">
                              <span>Lens / Frame Width</span>
                              <span className="text-white font-semibold">
                                {product.specs?.frameWidth || '142 mm'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AR Try on Deep Link */}
                      <div className="mt-3.5 pt-2 border-t border-white/5">
                        <Link href={tryOnLink} className="block w-full">
                          <button
                            disabled={product.stock <= 0}
                            className="w-full py-1.5 bg-[#C9A84C]/10 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0D0D0F] border border-[#C9A84C]/35 rounded text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Launch Try-On
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
