'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Facebook, Instagram, WhatsApp } from '@/components/icons/Social';
import { buildWhatsAppUrl, WHATSAPP_STORE } from '@/utils/whatsapp';

const shopLinks = [
  { label: 'EyeGlasses', href: '/products?category=glasses' },
  { label: 'Sunglasses', href: '/products?category=sunglasses' },
  { label: 'Contact Lenses', href: '/products?category=contact-lenses' },
  { label: 'Watches', href: '/products?category=watches' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Brands', href: '/brands' },
];

const supportLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Store Locator', href: '/contact' },
  { label: 'Track Order', href: '/contact' },
  { label: 'Returns & Exchange', href: '/returns-exchange' },
  { label: 'FAQ', href: '/faqs' },
  { label: 'Contact Us', href: '/contact' },
];

const informationLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-conditions' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Warranty Policy', href: '/warranty-care' },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');

  if (pathname?.startsWith('/receipt/') || pathname?.startsWith('/verify/')) return null;

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    const subject = 'Hariyana Newsletter Subscription Request';
    const body = `Please add ${email.trim()} to the Hariyana Watch & Opticals newsletter.`;
    window.location.href = `mailto:hariyanaoptical49@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setEmail('');
  };

  const linkClass = 'block text-[11px] leading-[1.8] text-[#303030] transition-colors hover:text-[#C86620] sm:text-[11.5px]';
  const headingClass = 'mb-2.5 font-sans text-[11px] font-bold uppercase tracking-[0.04em] text-[#171717] sm:text-[11.5px]';
  const socialClass = 'flex h-8 w-8 items-center justify-center rounded-full border border-[#CFC8C0] bg-[#FCF8F4] text-[#252525] transition-colors hover:border-[#C86620] hover:text-[#C86620]';

  return (
    <footer className="border-t border-[#EEE5DC] bg-[#FBF3EB] text-[#252525]">
      <div className="mx-auto max-w-[1440px] px-5 pb-5 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-9">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-[1.45fr_.72fr_.92fr_.78fr_1.2fr] lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" aria-label="Hariyana Watch & Opticals home" className="inline-block">
              <Image
                src="/images/logo-footer.png"
                alt="Hariyana Watch & Opticals"
                width={1536}
                height={1152}
                className="h-auto w-[170px] object-contain mix-blend-multiply sm:w-[185px]"
              />
            </Link>
            <p className="mt-3 max-w-[245px] text-[11px] leading-[1.65] text-[#343434] sm:text-[11.5px]">
              See Better. Live Better.<br />
              Premium eyewear and luxury watches<br className="hidden xl:block" /> for your every moment.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a href="https://www.instagram.com/hariyana_watch_opticals49" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialClass}>
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/Vinod271083" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialClass}>
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={buildWhatsAppUrl('Hello Hariyana Watch & Opticals, I visited your website and would like to know more about your products.', WHATSAPP_STORE)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Hariyana Watch & Opticals on WhatsApp"
                className={`${socialClass} hover:border-[#25D366] hover:text-[#128C4B]`}
              >
                <WhatsApp className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className={headingClass}>Shop</h3>
            <nav aria-label="Footer shop links">
              {shopLinks.map((item) => (
                <Link key={item.label} href={item.href} className={linkClass}>{item.label}</Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className={headingClass}>Help &amp; Support</h3>
            <nav aria-label="Footer support links">
              {supportLinks.map((item) => (
                <Link key={item.label} href={item.href} className={linkClass}>{item.label}</Link>
              ))}
            </nav>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className={headingClass}>Information</h3>
            <nav aria-label="Footer information links">
              {informationLinks.map((item) => (
                <Link key={item.label} href={item.href} className={linkClass}>{item.label}</Link>
              ))}
            </nav>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className={headingClass}>Newsletter</h3>
            <p className="max-w-[230px] text-[11px] leading-[1.6] text-[#343434] sm:text-[11.5px]">
              Get updates on new arrivals,<br />offers &amp; more.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex h-[45px] w-full max-w-[285px] overflow-hidden rounded-[6px] border border-[#D9D0C7] bg-white">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 text-[11px] text-[#222] outline-none placeholder:text-[#9C9C9C]"
              />
              <button type="submit" aria-label="Subscribe to newsletter" className="flex w-[49px] flex-shrink-0 items-center justify-center bg-[#D9883E] text-[#171717] transition-colors hover:bg-[#C86620] hover:text-white">
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 border-t border-[#DED5CC] pt-4 text-[10px] text-[#3C3C3C] sm:mt-8 sm:pt-5 sm:text-[11px]">
          <p>&copy; 2024 Hariyana Watch &amp; Opticals. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
