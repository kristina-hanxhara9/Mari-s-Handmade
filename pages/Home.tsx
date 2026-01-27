
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore, useCartStore } from '../store';
import { CandleEffect } from '../components/CandleEffect';
import { Section } from '../components/Section/Section';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// SEO: Reset page title on home page mount
const useHomeSEO = () => {
  useEffect(() => {
    document.title = "Mari's Handmade Candles | Luxury Sculptural Candles UK | Handcrafted Artisan Wax Art";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Discover exquisite handcrafted sculptural candles from Mari's Handmade. Luxury artisan candles hand-poured in the UK. Perfect for gifts, weddings, and home decor.");
    }
  }, []);
};

const basePath = import.meta.env.BASE_URL || '/';

const reviews = [
  {
    id: 1,
    text: "These candles are almost too beautiful to burn. The detail on the carousel jar is incredible, and the scent fills the whole room.",
    author: "Emma W.",
    location: "London"
  },
  {
    id: 2,
    text: "I bought the Blue & Gold pillar for my wedding centerpiece. It was absolutely stunning and everyone commented on it. A true work of art.",
    author: "Sarah J.",
    location: "Manchester"
  },
  {
    id: 3,
    text: "The packaging was plastic-free and so elegant. The 'Blossom Box' smells divine even without lighting it. Highly recommend as a gift.",
    author: "Michael T.",
    location: "Bristol"
  },
  {
    id: 4,
    text: "Obsessed with the pastel tulips! They look so real, I almost don't want to light them. The perfect pop of spring for my flat.",
    author: "Jessica M.",
    location: "Edinburgh"
  }
];

const galleryImages = [
  "https://images.unsplash.com/photo-1602523774026-c23f5b72e022?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596436066266-932f995a9478?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617112836230-664448557d19?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608649826315-998f4803b9f4?q=80&w=800&auto=format&fit=crop"
];

const seasonalCollections = [
  {
    title: 'Christmas Atelier',
    tag: 'Christmas',
    blurb: 'Fir, clove, pearlescent shimmer, and gold leaf layered into sculpted pillars for cozy fireside rituals.',
    image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Valentines Salon',
    tag: 'Valentines',
    blurb: 'Rosy sculpted heart candles with silk bows and rosewater accords—made to light love-soaked evenings.',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Easter Brunch',
    tag: 'Easter',
    blurb: 'Speckled egg tapers with lemon-curd notes and buttercream drips to elevate pastel tablescapes.',
    image: 'https://images.unsplash.com/photo-1528458965990-428de4b1cb0f?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Birthday Parlor',
    tag: 'Birthday',
    blurb: 'Confetti-drip keepsake pillars scented with sparkling citrus buttercream for milestone nights.',
    image: 'https://images.unsplash.com/photo-1526655009434-6c000a543221?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Mother’s Day Tea',
    tag: 'Mother\'s Day',
    blurb: 'Silk-ribbon floral tapers with garden tea accords to honor the women who taught us warmth.',
    image: 'https://images.unsplash.com/photo-1441123100240-f9f3f77ed41b?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Autumn Harvest',
    tag: 'Autumn',
    blurb: 'Amber lanterns with leaf reliefs and smoky vanilla pour to anchor long candle-lit dinners.',
    image: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?q=80&w=1200&auto=format&fit=crop'
  }
];

export const Home = () => {
  // SEO hook for home page
  useHomeSEO();

  const { addItem } = useCartStore();
  const { products, siteConfig } = useAdminStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      titleRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, ease: 'power3.out', delay: 0.2 }
    );

    gsap.fromTo(
      storyRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 85%',
        },
      }
    );

    const cards = gsap.utils.toArray('.featured-card');
    gsap.fromTo(
      cards,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: featuredRef.current,
          start: 'top 80%',
        },
      }
    );
  }, []);

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="w-full">
      {/* 1. HERO SECTION - Now with transparent background to show the global photo */}
      <header className="relative min-h-[100vh] lg:min-h-screen flex flex-col md:flex-row items-center overflow-hidden z-20 pt-28 md:pt-40">
        <div className="relative w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 md:py-0 z-10">
          <div className="relative space-y-6 lg:space-y-10 max-w-xl mx-auto md:mx-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="w-12 md:w-24 h-[1px] bg-mari-gold shadow-[0_0_10px_rgba(197,160,89,0.5)] mx-auto md:mx-0"
            />
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl md:text-7xl xl:text-[8rem] font-serif text-mari-dark leading-[0.9] tracking-tight text-center md:text-left"
            >
              Light.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mari-teal to-mari-gold italic pr-1 md:pr-4">Art.</span><br />
              Scent.
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-sm sm:text-base md:text-lg xl:text-xl text-gray-700 font-sans tracking-widest font-light italic leading-relaxed text-center md:text-left max-w-md mx-auto md:mx-0"
            >
              Sculptural candles, hand-poured in the UK. Designed to be a masterpiece.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="pt-4 md:pt-6 flex justify-center md:justify-start"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 md:gap-4 border border-mari-dark/20 text-mari-dark px-8 py-3 md:px-10 md:py-4 rounded-full font-bold tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs uppercase hover:bg-mari-dark hover:text-white transition-all duration-500 shadow-lg backdrop-blur-sm"
              >
                Enter Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 relative p-6 lg:p-20 z-10 flex justify-center">
          <div className="marble-halo w-full max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full max-w-2xl aspect-[3/4] arch-top overflow-hidden shadow-2xl md:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.2)] relative bg-white"
            >
              <img 
                src={siteConfig.heroForeground}
                alt="Luxury Candle Presentation"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative z-10 bg-transparent">
        {/* 2. STORY SECTION - Showing background photo */}
        <Section id="story" variant="transparent" className="overflow-hidden">
          <div ref={storyRef} className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="relative order-2 md:order-1 flex justify-center md:justify-start">
              <div className="marble-halo max-w-sm md:max-w-md w-full">
                <div className="aspect-[3/4] md:aspect-[3/4.5] arch-top overflow-hidden shadow-2xl border-[10px] md:border-[12px] border-white w-full">
                  <img 
                    src={siteConfig.storyImage} 
                    alt="Artistic candle" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[3s]"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-8 order-1 md:order-2 text-center md:text-left">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="h-[1px] w-12 bg-mari-gold"></div>
                <h2 className="text-[10px] font-bold tracking-[0.4em] text-mari-gold uppercase">The Craft</h2>
              </div>
              <h3 className="text-4xl md:text-6xl font-serif text-mari-dark leading-[1.1]">
                Sculptures <br/><span className="italic font-light text-mari-gold">of</span> Light.
              </h3>
              <p className="text-gray-500 leading-relaxed font-sans text-base md:text-xl font-light italic">
                Every piece at <strong>Mari's Handmade</strong> is a labor of love. We create sculptural wax art that defies the ordinary.
              </p>
            </div>
          </div>
        </Section>

        {/* 3. FEATURED SECTION - Carved in Ivory Marble */}
        <Section 
          variant="transparent" 
          className="overflow-hidden"
        >
          <div ref={featuredRef} className="max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-4 text-center md:text-left">
              <div className="w-full md:w-auto">
                <span className="text-mari-gold font-bold tracking-[0.3em] text-[10px] uppercase block mb-2">Editor's Choice</span>
                <h2 className="text-3xl md:text-6xl font-serif text-mari-dark">Signature Pieces</h2>
              </div>
              <Link to="/shop" className="inline-flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-widest uppercase text-mari-dark border-b border-mari-dark pb-1 hover:text-mari-gold transition-all">
                Full Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20" role="list" aria-label="Featured candle products">
              {featuredProducts.map((product) => (
                <article key={product.id} className="featured-card group cursor-pointer text-center" role="listitem" itemScope itemType="https://schema.org/Product">
                  <div className="relative aspect-[3/4.5] arch-top overflow-hidden bg-white/40 backdrop-blur-sm shadow-xl transition-all duration-700 group-hover:-translate-y-3">
                    <img
                      src={product.image}
                      alt={`${product.name} - Handcrafted luxury candle by Mari's Handmade, ${product.scentNotes}`}
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                      loading="lazy"
                      itemProp="image"
                    />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => addItem(product)}
                          className="bg-white text-mari-dark p-4 rounded-full shadow-2xl"
                          aria-label={`Add ${product.name} to basket`}
                        >
                            <ShoppingBag className="w-6 h-6" aria-hidden="true" />
                        </button>
                    </div>
                  </div>
                  <div className="mt-8">
                      <h3 className="text-xl md:text-2xl font-serif text-mari-dark mb-2" itemProp="name">{product.name}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <span itemProp="priceCurrency" content="GBP">£</span>
                        <span itemProp="price" content={product.price.toString()}>{product.price.toFixed(2)}</span>
                      </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        {/* FESTIVE COLLECTIONS */}
        <Section variant="transparent" className="overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-center md:text-left">
              <div>
                <span className="text-mari-gold font-bold tracking-[0.4em] text-[10px] uppercase block mb-3">Festive Collections</span>
                <h2 className="text-3xl md:text-6xl font-serif text-mari-dark leading-tight">For every season worth celebrating.</h2>
              </div>
              <Link to="/shop" className="inline-flex items-center justify-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-mari-dark border border-mari-dark/30 px-6 py-3 rounded-full hover:bg-mari-dark hover:text-white transition-all shadow-md backdrop-blur-sm">
                Shop All Seasons <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {seasonalCollections.map((collection, idx) => (
                <div 
                  key={collection.tag} 
                  className="relative overflow-hidden rounded-[28px] border border-white/30 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] group"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.65)), url(${collection.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-mari-gold/10 opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="relative p-8 md:p-10 space-y-4 flex flex-col min-h-[260px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.35em] text-mari-gold">{collection.tag}</span>
                      <div className="w-8 h-[1px] bg-mari-gold/60" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif text-mari-dark">{collection.title}</h3>
                    <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base flex-1">{collection.blurb}</p>
                    <Link 
                      to="/shop" 
                      className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-mari-dark group-hover:text-mari-gold transition-colors"
                    >
                      Explore {collection.tag}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 4. ABOUT SECTION - Back to Photo Background */}
        <Section variant="transparent" className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-6 md:space-y-8 text-center md:text-left">
                  <span className="text-mari-gold font-bold tracking-[0.4em] text-[10px] uppercase">Behind the Flame</span>
                  <h2 className="text-4xl md:text-7xl font-serif text-mari-dark">Hi, I'm Mari.</h2>
                  <p className="text-lg md:text-xl text-gray-600 font-light italic leading-relaxed">
                      "I believe that a candle shouldn't just smell good—it should be an object of beauty that commands a room."
                  </p>
              </div>
              <div className="relative flex justify-center md:justify-end">
                  <div className="relative p-[3px] md:p-[4px] rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(74,144,164,0.4), rgba(74,144,164,0.2), rgba(74,144,164,0.3))' }}>
                      <div className="aspect-video w-full max-w-xl md:max-w-2xl overflow-hidden rounded-2xl shadow-xl">
                          <video
                            src={`${basePath}video/candle-video.mp4`}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            disablePictureInPicture
                            className="w-full h-full object-cover pointer-events-none"
                            ref={(el) => {
                              if (el) {
                                el.play().catch(() => {});
                              }
                            }}
                          />
                      </div>
                  </div>
              </div>
          </div>
        </Section>

        {/* 5. REVIEW SECTION - Carved in Ivory Marble */}
        <Section variant="transparent" className="overflow-hidden min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 opacity-80">
                  <CandleEffect />
              </div>
          </div>

          <div className="relative z-10 w-full">
            <div className="mb-12 md:mb-16 text-center px-4">
              <span className="text-mari-gold font-bold tracking-[0.5em] text-[10px] md:text-[12px] uppercase block mb-4">Kind Words</span>
              <h2 className="text-3xl md:text-7xl font-serif text-mari-dark">Reviews</h2>
            </div>

            <div ref={reviewRef} className="w-full max-w-4xl mx-auto relative px-6">
              <div className="relative group mx-auto w-full max-w-3xl">
                {/* Wavy white container using SVG with curved edges */}
                <svg className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)]" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wavyContainerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#wavyContainerGradient)"
                    d="M0,12
                       C15,5 30,18 50,8
                       C70,0 90,15 110,6
                       C130,0 150,12 170,5
                       C185,0 195,8 200,12
                       L200,88
                       C195,92 185,100 170,95
                       C150,88 130,100 110,94
                       C90,85 70,100 50,92
                       C30,82 15,95 0,88
                       Z"
                  />
                </svg>

                {/* Card content */}
                <div className="relative min-h-[350px] md:min-h-[400px] flex flex-col justify-center items-center overflow-visible">
                  <div className="relative z-10 p-8 md:p-20 text-center w-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentReview}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.7 }}
                      >
                        <p className="text-base md:text-3xl font-serif text-mari-dark leading-relaxed mb-6 italic px-2">
                          "{reviews[currentReview].text}"
                        </p>
                        <div className="flex flex-col items-center">
                          <span className="font-bold tracking-[0.4em] uppercase text-[9px] text-mari-gold mb-1">{reviews[currentReview].author}</span>
                          <span className="text-gray-400 text-[8px] font-medium tracking-[0.2em] uppercase">{reviews[currentReview].location}</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-center gap-3 mt-8 md:mt-12">
                      {reviews.map((_, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setCurrentReview(idx)}
                          className={`h-1 transition-all duration-700 rounded-full ${currentReview === idx ? 'w-8 bg-mari-gold' : 'w-2 bg-mari-gold/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
};
