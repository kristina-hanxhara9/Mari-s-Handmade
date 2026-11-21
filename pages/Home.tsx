
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore, useCartStore } from '../store';
import { Section } from '../components/Section/Section';
import { ProductImage } from '../components/ProductImage';
import { FramedPicture } from '../components/FramedPicture';
import { LazyVideo } from '../components/LazyVideo';
import { CandleGlow } from '../components/CandleGlow';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ShoppingBag, TreePine, Heart, Egg, Cake, Gift, Leaf } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// SEO: Reset page title on home page mount
const useHomeSEO = () => {
  useEffect(() => {
    document.title = "Mari's Handmade Candles | Luxury Sculptural Candles UK | Handcrafted Artisan Wax Art";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Discover exquisite handcrafted sculptural candles from Mari's Handmade. Luxury artisan candles hand poured in London, UK. Perfect for gifts, weddings, and home decor.");
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
    text: "The packaging was plastic free and so elegant. The 'Blossom Box' smells divine even without lighting it. Highly recommend as a gift.",
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

type SeasonalCollection = {
  title: string;
  tag: string;
  blurb: string;
  icon: LucideIcon;
  /** Candle scene photo (cut from the seasonal collection artwork). */
  image: string;
  /** Wall colours of the photo (middle, bottom), so the photo fades into the card. */
  wall: [string, string];
  /** Which part of the photo to keep in view on narrow cards. */
  focus: string;
  bow: string;
};

// Blurbs are kept to a similar length so every card lines up.
const seasonalCollections: SeasonalCollection[] = [
  { title: 'Christmas Atelier', tag: 'Christmas', blurb: 'Fir, clove and gold leaf for long fireside evenings.', icon: TreePine, image: '/images/seasonal/christmas.webp', wall: ['#E9CDBC', '#EFDBCB'], focus: '70% 60%', bow: '#F7EFE6' },
  { title: "Valentine's Salon", tag: "Valentine's", blurb: 'Rose blush hearts tied in silk, made for evenings in love.', icon: Heart, image: '/images/seasonal/valentines.webp', wall: ['#F1CEC5', '#F4D5CA'], focus: '62% 60%', bow: '#F6C9CF' },
  { title: 'Easter Brunch', tag: 'Easter', blurb: 'Speckled egg candles in soft pastels for the spring table.', icon: Egg, image: '/images/seasonal/easter.webp', wall: ['#F3DFCE', '#F5E2D2'], focus: '58% 60%', bow: '#F7EFE6' },
  { title: 'Birthday Parlour', tag: 'Birthday', blurb: 'Confetti drip keepsakes with sparkling citrus for big nights.', icon: Cake, image: '/images/seasonal/birthday.webp', wall: ['#EEDBD1', '#ECD4CD'], focus: '50% 60%', bow: '#F7EFE6' },
  { title: "Mother's Day Tea", tag: "Mother's Day", blurb: "Floral pieces with garden tea notes, a gift she'll treasure.", icon: Gift, image: '/images/seasonal/mothers.webp', wall: ['#F2D5C8', '#F6DDD1'], focus: '58% 60%', bow: '#F6C9CF' },
  { title: 'Autumn Harvest', tag: 'Autumn', blurb: 'Amber lanterns and smoky vanilla for candlelit dinners.', icon: Leaf, image: '/images/seasonal/autumn.webp', wall: ['#F6D9C4', '#F8DECB'], focus: '55% 60%', bow: '#F7EFE6' },
];

/** Small satin bow that sits on top of each seasonal card's frame. */
const Bow = ({ color }: { color: string }) => (
  <svg viewBox="-26 -16 52 38" className="w-11 h-8 md:w-12 md:h-9 drop-shadow-[0_2px_3px_rgba(120,90,70,0.25)]" aria-hidden="true">
    <g fill={color} stroke="rgba(140,100,80,0.35)" strokeWidth="0.8">
      <path d="M-2,2 L-11,19 L-7,17.5 L-5,21 L2,3Z" />
      <path d="M2,2 L11,19 L7,17.5 L5,21 L-2,3Z" />
      <path d="M0,0 C-6,-11 -23,-15 -23,-4 C-23,5 -9,5 0,0Z" />
      <path d="M0,0 C6,-11 23,-15 23,-4 C23,5 9,5 0,0Z" />
      <ellipse cx="0" cy="0.5" rx="4" ry="3.6" />
    </g>
    <path d="M-4,-2 C-9,-6 -16,-8 -18,-4 M4,-2 C9,-6 16,-8 18,-4" fill="none" stroke="rgba(140,100,80,0.25)" strokeWidth="0.7" />
  </svg>
);

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

  // Products ticked "Featured" in the admin; falls back to the newest ones.
  const featuredPicks = products.filter((p) => p.featured);
  const featuredProducts = (featuredPicks.length ? featuredPicks : products).slice(0, 6);

  return (
    <div className="w-full">
      {/* 1. HERO SECTION - Now with transparent background to show the global photo */}
      <header className="relative md:min-h-screen flex flex-row items-center overflow-hidden z-20 pt-24 pb-10 md:pt-32 md:pb-0">
        <div className="relative w-[54%] md:w-1/2 h-full flex flex-col justify-center pl-5 pr-2 sm:px-12 lg:px-24 z-10">
          <div className="relative space-y-4 sm:space-y-6 lg:space-y-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="w-10 md:w-24 h-[1px] bg-mari-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]"
            />
            <h1
              ref={titleRef}
              className="text-[2.6rem] sm:text-6xl md:text-7xl xl:text-[8rem] font-serif text-mari-dark leading-[0.9] tracking-tight"
            >
              Light.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mari-teal to-mari-gold italic pr-1 md:pr-4">Art.</span><br />
              Scent.
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-[11px] sm:text-base md:text-lg xl:text-xl text-gray-700 font-sans tracking-wide sm:tracking-widest font-light italic leading-relaxed max-w-md"
            >
              Sculptural candles, hand poured in London, UK. Designed to be a masterpiece.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="pt-1 sm:pt-4 md:pt-6 flex"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 sm:gap-3 md:gap-4 bg-mari-dark text-white px-4 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-full font-bold tracking-[0.12em] sm:tracking-[0.2em] md:tracking-[0.3em] text-[9px] sm:text-[10px] md:text-xs uppercase whitespace-nowrap hover:bg-mari-teal transition-all duration-500 shadow-lg"
              >
                Shop the Candles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="text-[8px] sm:text-[10px] md:text-[11px] tracking-[0.15em] sm:tracking-[0.25em] uppercase text-mari-ink/70"
            >
              Handmade to order in London &middot; UK delivery
            </motion.p>
          </div>
        </div>
        
        <div className="w-[46%] md:w-1/2 relative pr-5 pl-1 sm:p-6 lg:p-20 z-10 flex justify-center">
          <div className="marble-halo w-full sm:max-w-md md:max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full max-w-2xl aspect-[3/4] arch-top overflow-hidden shadow-2xl md:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.2)] relative bg-white"
            >
              <img
                src={siteConfig.heroForeground}
                alt="Luxury Candle Presentation"
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative z-10 bg-transparent">
        {/* 2. STORY SECTION - Showing background photo */}
        <Section id="story" variant="transparent" className="overflow-hidden" paddingClass="pt-16 pb-8 md:pt-[100px] md:pb-12">
          {/* Photo and text share the width like the hero: a little more room for the text */}
          <div ref={storyRef} className="grid grid-cols-[46fr_54fr] md:grid-cols-2 gap-4 sm:gap-12 md:gap-24 items-center">
            <div className="relative flex justify-center md:justify-start">
              <FramedPicture frame="ornate" className="w-full sm:max-w-sm md:max-w-md aspect-[3/4]" pictureClassName="bg-[#F6EEEA]">
                <img
                  src={siteConfig.storyImage}
                  alt="Artistic candle"
                  loading="lazy"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[3s]"
                />
              </FramedPicture>
            </div>
            <div className="flex flex-col items-start gap-3 sm:gap-6 pt-6">
              <h2 className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-mari-gold uppercase">The Craft</h2>
              <h3 className="text-[1.9rem] sm:text-5xl lg:text-6xl font-display font-normal text-mari-ink leading-[1.05] md:whitespace-nowrap">
                Sculptures <span className="italic font-light text-mari-gold">of</span> Light.
              </h3>
              <p className="text-gray-500 leading-relaxed font-sans text-[13px] sm:text-lg md:text-2xl font-light italic">
                Every piece at <strong>Mari's Handmade</strong> is a labor of love. We create sculptural wax art that defies the ordinary.
              </p>
            </div>
          </div>
        </Section>

        {/* 3. FEATURED SECTION - Carved in Ivory Marble */}
        <Section
          variant="transparent"
          className="overflow-hidden"
          paddingClass="pt-8 pb-20 md:pt-12 md:pb-[100px]"
        >
          <div ref={featuredRef} className="max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-4 text-center md:text-left">
              <div className="w-full md:w-auto">
                <span className="font-serif italic text-mari-gold text-base md:text-lg tracking-wide block mb-3">Editor's Choice</span>
                <h2 className="text-4xl md:text-7xl font-display font-normal text-mari-ink">
                  Signature <span className="italic font-light text-mari-teal">Pieces</span>
                </h2>
                <div className="mt-5 flex items-center justify-center md:justify-start gap-3" aria-hidden="true">
                  <span className="w-10 h-px bg-mari-gold/50" />
                  <span className="w-1.5 h-1.5 rotate-45 border border-mari-gold/70" />
                  <span className="w-10 h-px bg-mari-gold/50" />
                </div>
              </div>
              <Link to="/shop" className="inline-flex items-center gap-3 font-serif italic text-sm md:text-base text-mari-dark/80 border-b border-mari-gold/40 pb-1 hover:text-mari-gold hover:border-mari-gold transition-all">
                View the full collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:gap-20" role="list" aria-label="Featured candle products">
              {featuredProducts.map((product) => (
                <article key={product.id} className="featured-card group cursor-pointer text-center" role="listitem" itemScope itemType="https://schema.org/Product">
                  <div className="w-full">
                  <ProductImage
                    src={product.image}
                    alt={`${product.name}: handcrafted candle by Mari's Handmade`}
                  >
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => addItem(product)}
                        className="bg-white text-mari-dark p-4 rounded-full shadow-2xl"
                        aria-label={`Add ${product.name} to basket`}
                      >
                        <ShoppingBag className="w-6 h-6" aria-hidden="true" />
                      </button>
                    </div>
                  </ProductImage>
                  </div>
                  <div className="mt-4 sm:mt-8">
                      <h3 className="text-lg sm:text-2xl md:text-3xl font-display font-normal text-mari-ink leading-tight line-clamp-2 min-h-[2.5em] flex items-center justify-center mb-1" itemProp="name">{product.name}</h3>
                      {product.scentNotes && (
                        <p className="text-[11px] sm:text-sm text-gray-500 font-light italic mb-2 sm:mb-3 line-clamp-2">{product.scentNotes}</p>
                      )}
                      <p className="text-sm font-serif text-mari-gold tracking-wider" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <span itemProp="priceCurrency" content="GBP">£</span>
                        <span itemProp="price" content={product.price.toString()}>{product.price.toFixed(2)}</span>
                      </p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-12 md:mt-16 flex justify-center">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 rounded-full border border-mari-ink/30 bg-white/40 px-7 py-3 md:px-9 md:py-3.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-mari-ink shadow-sm transition-all duration-500 hover:bg-mari-ink hover:text-white hover:border-mari-ink"
              >
                View the full collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Section>

        {/* SEASONAL COLLECTIONS */}
        <Section variant="transparent" className="overflow-hidden">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="w-10 md:w-16 h-px bg-mari-gold/50" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.45em] text-mari-gold">Candle Collection</span>
                <span className="w-10 md:w-16 h-px bg-mari-gold/50" />
              </div>
              <h2 className="text-4xl md:text-6xl font-display italic font-light text-mari-ink">Seasonal Candle Collection</h2>
              <p className="mt-4 text-[10px] md:text-xs uppercase tracking-[0.35em] text-mari-ink/60">Handcrafted candles for life's special moments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-y-12">
              {seasonalCollections.map(({ title, tag, blurb, icon: Icon, image, wall, focus, bow }) => (
                <Link key={tag} to="/shop" className="group relative block pt-3" aria-label={`Shop the ${title} collection`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 transition-transform duration-500 group-hover:-translate-y-0.5">
                    <Bow color={bow} />
                  </div>
                  <FramedPicture
                    frame="cameo"
                    className="w-full h-[235px] sm:h-[260px] transition-transform duration-500 group-hover:-translate-y-1"
                    pictureClassName="!overflow-hidden"
                  >
                    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${wall[0]} 0%, ${wall[0]} 45%, ${wall[1]} 100%)` }} />
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="absolute right-0 top-0 h-full w-[50%] sm:w-[58%] object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                      style={{
                        objectPosition: focus,
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
                        maskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
                      }}
                    />
                    <div className="relative h-full w-[56%] sm:w-[54%] pl-5 sm:pl-6 pt-7 pb-5 flex flex-col items-start">
                      <span className="flex items-center gap-2 text-[#9A6E5E]">
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.35em]">{tag}</span>
                      </span>
                      <h3 className="mt-2 text-[1.3rem] sm:text-[1.45rem] leading-tight font-display font-normal text-mari-ink whitespace-nowrap">{title}</h3>
                      <p className="mt-1.5 text-[12.5px] leading-snug italic font-light text-mari-ink/75 line-clamp-3">{blurb}</p>
                      <span className="mt-auto inline-flex items-center gap-2 rounded-full border border-[#9A6E5E]/50 bg-white/40 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-mari-ink transition-colors group-hover:bg-mari-ink group-hover:text-white group-hover:border-mari-ink">
                        Shop now <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </div>
                  </FramedPicture>
                </Link>
              ))}
            </div>
          </div>
        </Section>

        {/* 4. ABOUT SECTION - Back to Photo Background */}
        <Section variant="transparent" className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-6 md:space-y-8 text-center md:text-left">
                  <span className="text-mari-gold font-bold tracking-[0.4em] text-[10px] uppercase">Behind the Flame</span>
                  <h2 className="text-5xl md:text-8xl font-display font-normal text-mari-ink">Hi, I'm <span className="italic font-light text-mari-teal">Mari.</span></h2>
                  <p className="text-lg md:text-xl text-gray-600 font-light italic leading-relaxed">
                      "I believe that a candle shouldn't just smell good. It should be an object of beauty that commands a room."
                  </p>
              </div>
              <div className="relative flex justify-center md:justify-end">
                  <div className="relative p-[3px] md:p-[4px] rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(74,144,164,0.4), rgba(74,144,164,0.2), rgba(74,144,164,0.3))' }}>
                      <div className="relative aspect-video w-full max-w-xl md:max-w-2xl overflow-hidden rounded-2xl shadow-xl bg-[#EFE4DE]">
                          <LazyVideo
                            src={`${basePath}video/candle-video.mp4`}
                            poster={`${basePath}video/candle-poster.webp`}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                      </div>
                  </div>
              </div>
          </div>
        </Section>

        {/* 5. REVIEWS, laid out like "Behind the Flame" */}
        <Section variant="transparent" className="overflow-hidden" backgroundElement={<CandleGlow />}>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 text-center md:text-left">
              <span className="text-mari-gold font-bold tracking-[0.4em] text-[10px] uppercase">Kind Words</span>
              <h2 className="text-5xl md:text-8xl font-display font-normal text-mari-ink">From our <span className="italic font-light text-mari-teal">customers.</span></h2>
            </div>
            <div ref={reviewRef} className="text-center md:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7 }}
                  className="min-h-[190px] md:min-h-[220px]"
                >
                  <p className="text-lg md:text-2xl text-gray-600 font-light italic leading-relaxed mb-6">
                    "{reviews[currentReview].text}"
                  </p>
                  <span className="block font-bold tracking-[0.4em] uppercase text-[9px] text-mari-gold mb-1">{reviews[currentReview].author}</span>
                  <span className="block text-gray-400 text-[8px] font-medium tracking-[0.2em] uppercase">{reviews[currentReview].location}</span>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center md:justify-start gap-3 mt-8">
                {reviews.map((review, idx) => (
                  <button
                    key={review.id}
                    onClick={() => setCurrentReview(idx)}
                    aria-label={`Show review ${idx + 1}`}
                    className={`h-1 transition-all duration-700 rounded-full ${currentReview === idx ? 'w-8 bg-mari-gold' : 'w-2 bg-mari-gold/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
};
