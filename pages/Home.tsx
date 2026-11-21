
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore, useCartStore } from '../store';
import { Section } from '../components/Section/Section';
import { ProductImage } from '../components/ProductImage';
import { FramedPicture } from '../components/FramedPicture';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ShoppingBag, TreePine, Heart, Egg, Cake, Gift, Leaf } from 'lucide-react';

// The 3D glow uses three.js (large), so it is only downloaded when the reviews section is near.
const CandleEffect = lazy(() => import('../components/CandleEffect').then((m) => ({ default: m.CandleEffect })));
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// SEO: Reset page title on home page mount
const useHomeSEO = () => {
  useEffect(() => {
    document.title = "Mari's Handmade Candles | Luxury Sculptural Candles UK | Handcrafted Artisan Wax Art";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Discover exquisite handcrafted sculptural candles from Mari's Handmade. Luxury artisan candles hand-poured in London, UK. Perfect for gifts, weddings, and home decor.");
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
  { title: "Valentine's Salon", tag: "Valentine's", blurb: 'Rose-blush hearts tied in silk, made for evenings in love.', icon: Heart, image: '/images/seasonal/valentines.webp', wall: ['#F1CEC5', '#F4D5CA'], focus: '62% 60%', bow: '#F6C9CF' },
  { title: 'Easter Brunch', tag: 'Easter', blurb: 'Speckled egg candles in soft pastels for the spring table.', icon: Egg, image: '/images/seasonal/easter.webp', wall: ['#F3DFCE', '#F5E2D2'], focus: '58% 60%', bow: '#F7EFE6' },
  { title: 'Birthday Parlour', tag: 'Birthday', blurb: 'Confetti-drip keepsakes with sparkling citrus for big nights.', icon: Cake, image: '/images/seasonal/birthday.webp', wall: ['#EEDBD1', '#ECD4CD'], focus: '50% 60%', bow: '#F7EFE6' },
  { title: "Mother's Day Tea", tag: "Mother's Day", blurb: "Floral pieces with garden tea notes, a gift she'll treasure.", icon: Gift, image: '/images/seasonal/mothers.webp', wall: ['#F2D5C8', '#F6DDD1'], focus: '58% 60%', bow: '#F6C9CF' },
  { title: 'Autumn Harvest', tag: 'Autumn', blurb: 'Amber lanterns and smoky vanilla for candle-lit dinners.', icon: Leaf, image: '/images/seasonal/autumn.webp', wall: ['#F6D9C4', '#F8DECB'], focus: '55% 60%', bow: '#F7EFE6' },
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
  const effectRef = useRef<HTMLDivElement>(null);
  const [showEffect, setShowEffect] = useState(false);

  // Load the 3D glow only when the reviews section is about to scroll into view.
  useEffect(() => {
    const el = effectRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowEffect(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
              Sculptural candles, hand-poured in London, UK. Designed to be a masterpiece.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="pt-4 md:pt-6 flex justify-center md:justify-start"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 md:gap-4 bg-mari-dark text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-bold tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs uppercase hover:bg-mari-teal transition-all duration-500 shadow-lg"
              >
                Shop the Candles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-mari-ink/70 text-center md:text-left"
            >
              Handmade to order in London &middot; UK delivery
            </motion.p>
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
                fetchPriority="high"
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
              <FramedPicture frame="ornate" className="max-w-sm md:max-w-md w-full aspect-[3/4]" pictureClassName="bg-[#F6EEEA]">
                <img
                  src={siteConfig.storyImage}
                  alt="Artistic candle"
                  loading="lazy"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[3s]"
                />
              </FramedPicture>
            </div>
            <div className="space-y-8 order-1 md:order-2 text-center md:text-left">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="h-[1px] w-12 bg-mari-gold"></div>
                <h2 className="text-[10px] font-bold tracking-[0.4em] text-mari-gold uppercase">The Craft</h2>
              </div>
              <h3 className="text-[2rem] sm:text-4xl lg:text-5xl font-display font-normal text-mari-ink leading-tight whitespace-nowrap">
                Sculptures <span className="italic font-light text-mari-gold">of</span> Light.
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
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20" role="list" aria-label="Featured candle products">
              {featuredProducts.map((product) => (
                <article key={product.id} className="featured-card group cursor-pointer text-center" role="listitem" itemScope itemType="https://schema.org/Product">
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
                  <div className="mt-8">
                      <h3 className="text-2xl md:text-3xl font-display font-normal text-mari-ink leading-tight line-clamp-2 min-h-[2.5em] flex items-center justify-center mb-1" itemProp="name">{product.name}</h3>
                      {product.scentNotes && (
                        <p className="text-sm text-gray-500 font-light italic mb-3">{product.scentNotes}</p>
                      )}
                      <p className="text-sm font-serif text-mari-gold tracking-wider" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <span itemProp="priceCurrency" content="GBP">£</span>
                        <span itemProp="price" content={product.price.toString()}>{product.price.toFixed(2)}</span>
                      </p>
                  </div>
                </article>
              ))}
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
                            preload="metadata"
                            poster={`${basePath}video/candle-poster.webp`}
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
          <div ref={effectRef} className="absolute inset-0 z-0">
              <div className="absolute inset-0 opacity-80">
                  {showEffect && (
                    <Suspense fallback={null}>
                      <CandleEffect />
                    </Suspense>
                  )}
              </div>
          </div>

          <div className="relative z-10 w-full">
            <div className="mb-12 md:mb-16 text-center px-4">
              <span className="text-mari-gold font-bold tracking-[0.5em] text-[10px] md:text-[12px] uppercase block mb-4">Kind Words</span>
              <h2 className="text-4xl md:text-8xl font-display font-normal text-mari-ink italic font-light">Reviews</h2>
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
