import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Box, CheckCircle2, Clock3, MapPin, PackageCheck, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Policy | Hariyana Watch & Opticals',
  description: 'Shipping, dispatch, tracking and delivery information for Hariyana Watch & Opticals orders.',
};

const HIGHLIGHTS = [
  { icon: Clock3, title: 'Careful Processing', text: 'Orders are checked and prepared before dispatch.' },
  { icon: ShieldCheck, title: 'Secure Packaging', text: 'Frames and watches are protected for transit.' },
  { icon: Truck, title: 'Tracked Delivery', text: 'Tracking is shared after courier handover.' },
  { icon: PackageCheck, title: 'Delivery Support', text: 'Our team remains available until delivery.' },
];

const STEPS = [
  { number: '01', title: 'Order Confirmation', text: 'Your order and payment details are reviewed by our showroom team.' },
  { number: '02', title: 'Quality Inspection', text: 'The product, accessories and applicable warranty materials are checked.' },
  { number: '03', title: 'Protective Packing', text: 'Each item is packed using product-appropriate protective materials.' },
  { number: '04', title: 'Courier Handover', text: 'A trusted delivery partner receives the parcel and tracking is shared with you.' },
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCF8F4] text-[#121212]">
      <section className="border-b border-[#EADEC9] bg-[linear-gradient(135deg,#FFFDFB_0%,#FBF1E8_100%)]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 text-center sm:px-8 sm:py-20 lg:px-12">
          <nav className="mb-5 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#756B63]"><Link href="/" className="transition-colors hover:text-[#C86620]">Home</Link><span>/</span><span className="text-[#C86620]">Shipping Policy</span></nav>
          <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C86620]"><Sparkles className="h-4 w-4" /> From our showroom to your door</div>
          <h1 className="font-serif text-4xl font-semibold text-[#062C1C] sm:text-6xl">Shipping, handled with care.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#625A53] sm:text-base">Every order is inspected, protected and coordinated personally to preserve the quality of your eyewear or timepiece throughout its journey.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid overflow-hidden rounded-[16px] border border-[#EADEC9] bg-white shadow-[0_8px_30px_rgba(80,50,25,0.05)] sm:grid-cols-2 xl:grid-cols-4">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`p-6 sm:p-7 ${index ? 'border-t border-[#EADEC9] sm:border-l sm:border-t-0 xl:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 sm:border-t xl:border-l xl:border-t-0' : ''}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBF1E8] text-[#C86620]"><Icon className="h-5 w-5" /></div>
                <h2 className="mt-4 font-serif text-xl font-semibold text-[#062C1C]">{item.title}</h2>
                <p className="mt-2 text-[11px] leading-5 text-[#6B625A]">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C86620]">Dispatch Journey</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#062C1C] sm:text-4xl">What happens after you order</h2>
            <p className="mt-4 text-sm leading-7 text-[#655D56]">Our team coordinates each shipment from the physical showroom. This personal handling helps us confirm the exact item, packaging and delivery details before dispatch.</p>
            <div className="mt-7 rounded-[14px] border border-[#E7D7C7] bg-[#FBF1E8] p-5">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#C86620]" /><div><h3 className="font-serif text-lg font-semibold text-[#062C1C]">Delivery availability</h3><p className="mt-1 text-[11px] leading-5 text-[#6B625A]">Delivery timelines depend on the destination PIN code, product preparation and courier serviceability. Our team confirms the expected window during order processing.</p></div></div>
            </div>
          </div>

          <div className="space-y-4">
            {STEPS.map((step) => (
              <article key={step.number} className="flex gap-4 rounded-[14px] border border-[#EADEC9] bg-white p-5 shadow-[0_6px_22px_rgba(80,50,25,0.04)] sm:gap-5 sm:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#062C1C] font-serif text-sm font-semibold text-[#F0B878]">{step.number}</div>
                <div><h3 className="font-serif text-xl font-semibold text-[#062C1C]">{step.title}</h3><p className="mt-1.5 text-xs leading-5 text-[#655D56]">{step.text}</p></div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <article className="rounded-[16px] border border-[#E5D6C7] bg-[#FFFDFC] p-6 sm:p-8"><Box className="h-6 w-6 text-[#C86620]" /><h2 className="mt-4 font-serif text-2xl font-semibold text-[#062C1C]">Inspection on arrival</h2><p className="mt-3 text-xs leading-6 text-[#655D56]">Please inspect the outer package at delivery. If it appears materially damaged or tampered with, photograph it before opening and contact our team promptly with your order details.</p></article>
          <article className="rounded-[16px] border border-[#E5D6C7] bg-[#FFFDFC] p-6 sm:p-8"><CheckCircle2 className="h-6 w-6 text-[#C86620]" /><h2 className="mt-4 font-serif text-2xl font-semibold text-[#062C1C]">Tracking &amp; assistance</h2><p className="mt-3 text-xs leading-6 text-[#655D56]">Tracking details are shared after dispatch. Courier updates can occasionally take time to refresh; our showroom can help if movement is not visible after the first scan.</p></article>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[16px] bg-[#062C1C] p-7 text-white sm:flex-row sm:items-center sm:p-9">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F0B878]">Need delivery help?</p><h2 className="mt-2 font-serif text-2xl font-semibold text-white sm:text-3xl">Speak with our showroom team.</h2><p className="mt-2 text-xs leading-5 text-white/70">We can check serviceability, order status and tracking support.</p></div>
          <Link href="/contact" data-bump="true" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[6px] bg-white px-5 text-[9px] font-bold uppercase tracking-[0.07em] text-[#062C1C]">Contact Support <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
