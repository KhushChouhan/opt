import React from 'react';
import type { Metadata } from 'next';
import { Phone, Mail, Clock, MapPin, Sparkles } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Hariyana Watch & Opticals',
  description: 'Reach out to Hariyana Watch & Opticals in Hanumangarh Town, Rajasthan. Get store location, phone numbers, operating hours, or send us a query online.',
  alternates: {
    canonical: 'https://hariyana-watch-opticals.vercel.app/contact',
  },
  openGraph: {
    title: 'Contact Us | Hariyana Watch & Opticals',
    description: 'Get in touch with Hanumangarh\'s premium dealer of authentic watches and luxury frames.',
    url: 'https://hariyana-watch-opticals.vercel.app/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="bg-[#050c14] min-h-screen text-gray-300 pb-20 relative overflow-hidden">
      {/* Luxury Background Overlay */}
      <div className="absolute inset-0 luxury-grid-overlay opacity-80" />

      {/* Hero Header */}
      <section className="relative py-20 border-b border-[#c7a14e]/15 bg-[#0b131e]/20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center items-center gap-2 text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mb-4">
            <a href="/" className="hover:text-[#c7a14e] transition-colors">Home</a>
            <span>/</span>
            <span className="text-[#c7a14e] font-semibold">Contact Us</span>
          </nav>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">Get In Touch</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed">
            Have questions about a timepiece, custom optical fitting, or our virtual try-on mirror? We are here to assist.
          </p>
        </div>
      </section>

      {/* Grid Content */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Column 1: Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">DIRECTORY</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Store Information</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#c7a14e] to-transparent mt-2" />
            </div>

            {/* Address */}
            <div className="flex gap-4 p-5 rounded-xl border border-white/5 bg-[#0b131e]/50 hover:border-[#c7a14e]/30 transition-all duration-300">
              <MapPin className="w-6 h-6 text-[#c7a14e] shrink-0" />
              <div>
                <p className="text-white font-bold text-sm tracking-wide uppercase">Showroom Address</p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed font-light">
                  Hariyana Watch &amp; Opticals<br />
                  52 Main Bus Stand<br />
                  Hanumangarh Town<br />
                  Rajasthan - 335513
                </p>
              </div>
            </div>

            {/* Phones */}
            <div className="flex gap-4 p-5 rounded-xl border border-white/5 bg-[#0b131e]/50 hover:border-[#c7a14e]/30 transition-all duration-300">
              <Phone className="w-6 h-6 text-[#c7a14e] shrink-0" />
              <div>
                <p className="text-white font-bold text-sm tracking-wide uppercase">Phone Contacts</p>
                <div className="mt-2 space-y-2 text-sm">
                  <p className="flex justify-between gap-6">
                    <span className="text-gray-400">Vinod Kumar:</span>
                    <a href="tel:+919828207999" className="text-white hover:text-[#c7a14e] font-semibold transition-colors">+91 98282-07999</a>
                  </p>
                  <p className="flex justify-between gap-6">
                    <span className="text-gray-400">Shop Line:</span>
                    <a href="tel:+918526200444" className="text-white hover:text-[#c7a14e] font-semibold transition-colors">+91 85262-00444</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 p-5 rounded-xl border border-white/5 bg-[#0b131e]/50 hover:border-[#c7a14e]/30 transition-all duration-300">
              <Mail className="w-6 h-6 text-[#c7a14e] shrink-0" />
              <div>
                <p className="text-white font-bold text-sm tracking-wide uppercase">Email Support</p>
                <p className="text-sm mt-2">
                  <a href="mailto:hariyanaoptical49@gmail.com" className="text-gray-400 hover:text-[#c7a14e] transition-colors break-all">
                    hariyanaoptical49@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4 p-5 rounded-xl border border-white/5 bg-[#0b131e]/50 hover:border-[#c7a14e]/30 transition-all duration-300">
              <Clock className="w-6 h-6 text-[#c7a14e] shrink-0" />
              <div>
                <p className="text-white font-bold text-sm tracking-wide uppercase">Working Hours</p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  10:00 AM – 8:00 PM <span className="text-[#c7a14e] font-semibold font-display">(All Days Open)</span>
                </p>
              </div>
            </div>

          </div>

          {/* Column 2: Contact Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0b131e]/40 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase block">INQUIRY PORTAL</span>
              <h2 className="font-display text-2xl font-bold text-white mt-1">Send a Message</h2>
              <p className="text-sm text-gray-400 mt-1 font-light">Fill out the form below and our customer care team will respond within 24 hours.</p>
            </div>

            <ContactForm />
          </div>

        </div>
      </section>

      {/* Google Map Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#0b131e]/50 p-3">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3482.0163359648937!2d74.3218556!3d29.1415668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39147e452a2f8c5b%3A0xc3fa5c0ea3c242c1!2sHariyana%20Watch%20%26%20Opticals!5e0!3m2!1sen!2sin!4v1719643444000!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-xl grayscale opacity-80 contrast-125 focus:outline-none"
            title="Hariyana Watch &amp; Opticals Google Maps Location"
          />
        </div>
      </section>

    </div>
  );
}
