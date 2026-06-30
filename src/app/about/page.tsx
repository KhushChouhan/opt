'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Award, Eye, Settings, Heart, Users, Target, Compass, Sparkles, MapPin } from 'lucide-react';

const VALUES = [
  { icon: ShieldCheck, title: 'Authenticity First', desc: 'Every luxury watch and optical frame in our showroom is 100% genuine, sourced directly from authorized distributors.' },
  { icon: Target, title: 'Absolute Precision', desc: 'From computerized eye refractions to mechanical watch calibrations, we pride ourselves on mathematical accuracy.' },
  { icon: Heart, title: 'Customer Heritage', desc: 'For over 25 years, we have built relationships that span generations, serving families with personalized care.' },
  { icon: Compass, title: 'Innovative Vision', desc: 'We bridge physical retail with digital convenience, introducing advanced AI virtual mirrors for try-on convenience.' },
];

const WHY_CHOOSE_US = [
  { icon: Eye, title: 'Free Expert Eye Testing', desc: 'Equipped with computerized testing machinery to deliver absolute lens prescription accuracy.' },
  { icon: Settings, title: 'Master Watch Repair', desc: 'Certified horologists providing water-proofing, battery restoration, and automatic movement calibrations.' },
  { icon: Award, title: 'Premium Brand Curation', desc: 'Authorized retail hub for global giants like Titan, Fossil, Seiko, Ray-Ban, and Oakley.' },
  { icon: Users, title: 'Generational Legacy', desc: 'A household name in Hanumangarh, Rajasthan, trusted by thousands of customers since 1998.' }
];



export default function AboutPage() {
  return (
    <div className="bg-[#050c14] min-h-screen text-white pb-24 relative overflow-hidden">
      {/* Luxury Grid Overlay background */}
      <div className="absolute inset-0 luxury-grid-overlay" />

      {/* Hero Header */}
      <section className="relative py-24 border-b border-[#c7a14e]/15 bg-[#0b131e]/25">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">Est. 1998 • Rajasthan</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            Our Legacy of Trust
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed">
            Hariyana Watch & Opticals has been Hanumangarh&apos;s premier destination for genuine timepieces and certified optical care for over two decades.
          </p>
        </div>
      </section>

      {/* Legacy Introduction & Showroom Image */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text block */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.3em] uppercase block">
              OUR HERITAGE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Crafting Perfection <br />
              <span className="italic text-[#c7a14e]">Across Generations</span>
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-[#c7a14e] to-transparent" />
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">
              Founded in 1998, Hariyana Watch & Opticals started as a humble watch shop with a singular promise: to provide our community with authentic, high-quality products backed by uncompromising support. Over the next 25 years, that promise guided our evolution into a flagship showroom offering premium timepieces and expert optometry services.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">
              Today, our retail store at Main Bus Stand, Hanumangarh Town, houses state-of-the-art eye testing equipment and an extensive gallery of global brands. We carry forward our legacy by integrating modern AR WebGL virtual try-on mirrors, ensuring our customers experience a seamless purchase journey whether in-store or online.
            </p>
            
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-extrabold text-[#c7a14e] font-display">25+</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Years of Service</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#c7a14e] font-display">50k+</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#c7a14e] font-display">100%</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Authentic Guarantee</p>
              </div>
            </div>
          </div>

          {/* Showroom Image Block */}
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            <Image
              src="/images/store_interior_cinematic.png"
              alt="Hariyana luxury showroom display"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-102"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050c14]/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border-l-4 border-l-[#c7a14e] flex gap-5 items-start bg-[#0b131e]/30">
            <div className="p-3 bg-[#c7a14e]/10 border border-[#c7a14e]/20 text-[#c7a14e] rounded-xl shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">Our Mission</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">
                To safeguard our customers&apos; vision with accurate computerized eye checks and provide them with master-level horological repairs, ensuring their eyes and timepieces are looked after with high-precision retail care.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border-l-4 border-l-[#c7a14e] flex gap-5 items-start bg-[#0b131e]/30">
            <div className="p-3 bg-[#c7a14e]/10 border border-[#c7a14e]/20 text-[#c7a14e] rounded-xl shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">Our Vision</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">
                To serve as Rajasthan&apos;s most forward-thinking optical and watch retail showroom, merging genuine craftsmanship with modern web technologies, so luxury brands and custom AR fittings are accessible everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase block">PREMIUM BENEFITS</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">Why Choose Hariyana</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#c7a14e] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_US.map((item, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-xl p-5 border border-white/5 hover:border-[#c7a14e]/30 hover:shadow-lg transition-all duration-300 flex flex-col items-start space-y-4"
            >
              <div className="p-2.5 bg-[#c7a14e]/10 border border-[#c7a14e]/20 text-[#c7a14e] rounded-lg">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-[#c7a14e]/15 bg-[#0b131e]/25 relative overflow-hidden">
          {/* Subtle glow inside values */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,rgba(199,161,78,0.1),transparent_50%)] pointer-events-none" />
          
          <div className="text-center mb-10 relative z-10">
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase block">GUIDING PHILOSOPHY</span>
            <h2 className="font-display text-3xl font-bold text-white mt-2">Our Core Values</h2>
            <div className="w-12 h-[1px] bg-[#c7a14e] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {VALUES.map((val, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="p-2 bg-[#c7a14e]/10 border border-[#c7a14e]/20 text-[#c7a14e] rounded-lg shrink-0">
                  <val.icon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1.5 text-left">
                  <h3 className="font-display font-bold text-white text-base tracking-wide">{val.title}</h3>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Bottom Store Locator strip */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="glass-panel rounded-xl p-5 border border-[#c7a14e]/20 flex flex-col md:flex-row items-center justify-between gap-5 bg-gradient-to-r from-[#0b131e] to-[#070e17]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#c7a14e]/10 border border-[#c7a14e]/20 text-[#c7a14e] rounded-full">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>
            <div className="text-left">
              <h4 className="font-display font-bold text-white text-base">Visit Our Flagship Store</h4>
              <p className="text-[11px] text-gray-400 font-light">52 Main Bus Stand, Hanumangarh Town, Rajasthan 335513</p>
            </div>
          </div>
          <a
            href="https://maps.app.goo.gl/Ao5XF84qxdaMoFxL8"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-[#c7a14e] hover:bg-[#e8d9a0] text-[#050c14] text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors"
          >
            Get Directions
          </a>
        </div>
      </section>
    </div>
  );
}
