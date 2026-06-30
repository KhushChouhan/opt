'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Tag, BookOpen, Clock, Heart, Share2, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  image: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: 'lens-coatings',
    title: 'Blue Light vs. Anti-Reflective: Which Lens Coating Do You Need?',
    category: 'Eye Care',
    author: 'Vinod Kumar (Certified Optician)',
    date: 'June 25, 2026',
    readTime: '5 min read',
    excerpt: 'Explore the difference between Blue Light filtering and Anti-Reflective coatings. Learn which options best protect your vision in the digital age.',
    content: [
      'In today\'s screen-dominated environment, eye strain has become an almost universal complaint. When purchasing prescription glasses or computer eyewear, the options for lens coatings can be overwhelming. Two of the most recommended treatments are Blue Light filtering and Anti-Reflective (AR) coatings. While they may seem similar, they serve entirely different optical purposes.',
      'Anti-Reflective (AR) coatings are designed to eliminate glare. By minimizing light reflections from both the front and back surfaces of your lenses, AR coatings allow more light to pass through to your eyes. This results in sharper vision, reduced night-driving glare (particularly from oncoming LED headlights), and better cosmetics—since people can see your eyes clearly instead of a reflection. AR coating is recommended for almost all prescription glasses.',
      'Blue Light filtering coatings, on the other hand, are specifically formulated to target High-Energy Visible (HEV) blue light emitted by digital screens, smartphones, and artificial lighting. Prolonged exposure to HEV blue light is associated with digital eye strain, eye fatigue, and disrupted circadian rhythms (sleep cycles). Blue light coatings reflect or absorb a portion of this blue spectrum, shielding your eyes from glare and blue radiation.',
      'So, which one do you need? If you work on computers for more than 4 hours a day, experience dry eyes, or suffer from sleep issues, a Blue Light coating is highly beneficial. However, for general everyday use, night driving, and maximum lens clarity, an Anti-Reflective coating is indispensable. At Hariyana Watch & Opticals, we offer premium lenses that integrate both technologies into a single composite coating, giving you the ultimate protection against both physical glare and digital blue light.'
    ],
    image: '/images/luxury_optical_frames.png',
    featured: true
  },
  {
    id: 'chronograph-evolution',
    title: 'The Evolution of Chronograph Timepieces: A Collector\'s Guide',
    category: 'Horology',
    author: 'Amit Saini (Master Horologist)',
    date: 'June 18, 2026',
    readTime: '7 min read',
    excerpt: 'Trace the history of the chronograph watch from its 19th-century origins to modern mechanical masterpieces, and learn how to start your own collection.',
    content: [
      'The chronograph—a watch with built-in stopwatch capabilities—is one of the most popular and recognizable complications in horology. While it has become a staple of modern sports watch design, its origins were strictly functional, rooted in scientific measurement and astronomical observation.',
      'The invention of the chronograph is widely credited to French watchmaker Nicolas Mathieu Rieussec, who in 1821 built a device to time horse races. Rieussec\'s machine literally "wrote time" (chrono-graph) by depositing a small drop of ink on a rotating dial. It wasn\'t until the early 20th century, however, that the chronograph was miniaturized onto the wrist. Brands like Breitling and Universal Genève pioneered the addition of separate pushers at 2 and 4 o\'clock to start, stop, and reset the stopwatch function independently.',
      'For collectors, understanding the mechanics of a chronograph is essential. Mechanical chronographs fall into two main categories: column-wheel and cam-actuated. Column-wheel chronographs are more traditional, utilizing a turreted wheel that coordinates the gears with buttery-smooth pusher action. Cam-actuated chronographs, popularized by the legendary Lemania movements, are robust, reliable, and easier to service. Both have a prestigious place in watch history.',
      'When starting your chronograph collection, look for iconic reference styles. A vintage-inspired dial layout, tachymeter scale, and well-proportioned sub-dials (bi-compax or tri-compax layouts) are classic design tokens. Whether you choose an entry-level quartz chronograph or an automatic mechanical timepiece, the chronograph remains a testament to the intersection of mechanical utility and absolute style.'
    ],
    image: '/images/luxury_watches.png'
  },
  {
    id: 'eyewear-face-shape',
    title: 'Style Guide: Matching Eyewear Frames to Your Face Shape',
    category: 'Fashion',
    author: 'Neha Katkar (Styling Consultant)',
    date: 'June 12, 2026',
    readTime: '4 min read',
    excerpt: 'Uncover the secret to finding frames that complement your natural features. Get expert tips on sizing, geometry, and luxury styling.',
    content: [
      'Choosing a new pair of eyeglasses is as much about aesthetics as it is about vision. The right frames can act as an immediate enhancer, highlighting your best features and balancing your facial contours. The golden rule of frame selection is contrast: frame shapes should contrast with your face shape, and frame size should be in scale with your face size.',
      'Round Faces: If you have soft curves with similar width and length, rectangular or square frames are your best match. The sharp, clean angles of geometric frames add structure, elongating your face and making it appear thinner.',
      'Square Faces: Characterized by a strong jawline and broad forehead, square faces look best in round, oval, or aviator-style frames. Soft, curved frames soften the sharp angles of the jaw, drawing attention upward and establishing a balanced visual weight.',
      'Heart Faces: Broad foreheads that taper to a narrow, pointed chin look excellent in bottom-heavy frames or clean rimless designs. Classic cat-eye shapes or aviators help draw the eyes downward, complementing the natural structure of the face.',
      'Oval Faces: Often considered the ideal face shape due to its balanced proportions, those with oval faces can wear almost any frame style. Feel free to experiment with bold aviators, retro round frames, or premium oversized rectangular silhouettes. At Hariyana Opticals, you can try on all these shapes instantly using our WebGL Virtual Try-On mirror right from your browser, making it easy to find your perfect style match.'
    ],
    image: '/images/luxury_sunglasses.png'
  },
  {
    id: 'automatic-vs-quartz',
    title: 'Automatic vs. Quartz Watches: What Every Enthusiast Should Know',
    category: 'Education',
    author: 'Rajat Verma (Collector)',
    date: 'June 5, 2026',
    readTime: '6 min read',
    excerpt: 'Compare the meticulous craftsmanship of mechanical automatic movements with the battery-powered precision of Quartz watches to find your next timepiece.',
    content: [
      'The debate between automatic and quartz movements is as old as the quartz crisis of the 1970s. Both technologies serve the same purpose—keeping time—but they do so in completely different ways, appealing to different facets of watch appreciation.',
      'Quartz watches are powered by a battery that sends an electrical current through a tiny quartz crystal, causing it to vibrate at a precise frequency of 32,768 times per second. This vibration is converted into a regular electrical pulse that drives the hands. Quartz watches are incredibly accurate (gaining or losing only a few seconds per month), low-maintenance, and relatively affordable. A quartz watch is the ultimate grab-and-go tool.',
      'Automatic watches, by contrast, are mechanical marvels. They contain no batteries. Instead, they are powered by a mainspring that is wound by the natural movement of the wearer\'s wrist, which rotates an internal weighted rotor. This energy is released through a complex train of gears and regulated by a balance wheel. The result is the signature sweeping motion of the seconds hand, unlike the ticking tick of a quartz watch.',
      'For watch enthusiasts, the choice comes down to emotion vs. utility. While quartz represents pure precision and reliability, automatic watches represent horological history, micro-engineering heritage, and craftsmanship. In our store, we carry excellent examples of both, from high-precision Seiko quartz chronographs to exquisite automatic timepieces that celebrate mechanical history.'
    ],
    image: '/images/store_interior_cinematic.png'
  },
  {
    id: 'smartwatch-trends',
    title: 'The Smartwatch Shift: Balancing Modern Tech with Classic Horology',
    category: 'Innovation',
    author: 'Vinod Kumar (Certified Optician)',
    date: 'June 29, 2026',
    readTime: '5 min read',
    excerpt: 'Explore how smartwatches are merging health-tracking, high-res displays, and smart notifications with premium, classic luxury watch designs.',
    content: [
      'Smartwatches have transitioned from simple step-counters to indispensable lifestyle statement pieces. Modern buyers no longer want to choose between high-tech utility and luxury styling. The latest trends are focused on blending health-tracking metrics, cellular connectivity, and screen clarity with premium watch materials like stainless steel casing and sapphire crystal glass.',
      'One of the key reasons smartwatches have captured the market is active health tracking. Real-time heart rate monitoring, blood oxygen levels (SpO2), stress analysis, sleep trackers, and sports tracking allow users to get absolute control over their fitness. These sensors are housed in high-end lightweight materials like ceramic or matte titanium, matching the durability of dive watches.',
      'Classic brands are also stepping into the smartwatch space by offering hybrid models. Hybrid smartwatches retain physical analog hands and dial details but integrate circular sub-displays or vibrating sensors for digital notifications. This caters to classic watch enthusiasts who love the dial look but need basic notifications.',
      'Whether you choose a full AMOLED display smartwatch or a classic mechanical watch, at Hariyana Watch & Opticals we offer smartwatches from Titan, Fastrack, and other premium brands with warranty support, ensuring you stay connected while looking refined.'
    ],
    image: '/images/luxury_watches.png'
  }
];

export default function BlogPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const featuredPost = ARTICLES.find(a => a.featured);
  const regularPosts = ARTICLES.filter(a => !a.featured);

  return (
    <div className="bg-[#050c14] min-h-screen text-white pb-20 relative overflow-hidden">
      {/* Luxury Grid Overlay background */}
      <div className="absolute inset-0 luxury-grid-overlay" />

      {/* Hero Header */}
      <section className="relative py-20 border-b border-[#c7a14e]/15 bg-[#0b131e]/25">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c7a14e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#c7a14e] tracking-[0.25em] uppercase">Hariyana Editorial</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wider text-white">
            The Journal
          </h1>
          <p className="text-sm text-gray-400 mt-4 max-w-xl mx-auto font-light leading-relaxed">
            Discover expert insights on luxury watch craftsmanship, optical wellness, and seasonal eyewear styling trends from our certified horologists and opticians.
          </p>
        </div>
      </section>

      {/* Main Listing Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        
        {/* Featured Post Card */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#c7a14e] mb-4 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> Featured Editorial
            </h2>
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-[#c7a14e]/30 transition-all duration-500 grid grid-cols-1 lg:grid-cols-12">
              {/* Image Block */}
              <div className="relative aspect-video lg:aspect-auto lg:col-span-7 w-full h-full min-h-[300px] overflow-hidden group">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050c14] via-[#050c14]/20 to-transparent" />
              </div>
              
              {/* Content Block */}
              <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between bg-[#0a1628]/40">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-[#c7a14e] uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {featuredPost.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight group-hover:text-[#c7a14e]">
                    {featuredPost.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed line-clamp-4">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Published on</p>
                    <p className="text-xs text-[#c7a14e] font-semibold mt-0.5">{featuredPost.date}</p>
                  </div>

                  <Button
                    onClick={() => setSelectedArticle(featuredPost)}
                    className="self-start sm:self-auto bg-[#c7a14e] text-[#050c14] hover:bg-[#e8d9a0] font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
            Latest Publications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <div 
                key={post.id} 
                className="glass-panel rounded-xl overflow-hidden border border-white/5 hover:border-[#c7a14e]/25 hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between group h-full"
              >
                {/* Image Block */}
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050c14]/40 to-transparent" />
                </div>

                {/* Details */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[9px] font-bold text-[#c7a14e] uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> {post.category}</span>
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {post.readTime}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#c7a14e] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-500 font-medium">Published: {post.date}</p>
                    </div>

                    <button
                      onClick={() => setSelectedArticle(post)}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#c7a14e] hover:text-white transition-colors flex items-center gap-1"
                    >
                      Read <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Detail Modal Viewer */}
      <Modal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.category || 'Article'}
      >
        {selectedArticle && (
          <div className="space-y-5 text-left pb-4">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/5">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#c7a14e] uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {selectedArticle.category}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {selectedArticle.readTime}</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                {selectedArticle.title}
              </h2>
              <div className="pt-2 border-y border-white/5 py-2">
                <p className="text-[10px] text-gray-400">Published: <span className="text-[#c7a14e] font-semibold">{selectedArticle.date}</span></p>
              </div>
            </div>

            {/* Paragraph Content */}
            <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              {selectedArticle.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Social Share mockup bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-gray-500 text-xs">
              <span className="italic font-light">Hariyana Watch & Opticals Journal</span>
              <div className="flex items-center gap-4">
                <button aria-label="Like article" className="hover:text-[#c7a14e] transition-colors flex items-center gap-1">
                  <Heart className="w-4 h-4" /> <span>Like</span>
                </button>
                <button aria-label="Share article" className="hover:text-[#c7a14e] transition-colors flex items-center gap-1">
                  <Share2 className="w-4 h-4" /> <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
