
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore, useCartStore } from '../store';
import { Section } from '../components/Section/Section';
import { ProductImage } from '../components/ProductImage';
import { FramedPicture } from '../components/FramedPicture';
import { FestiveCandle } from '../components/FestiveCandle';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ShoppingBag, TreePine, Heart, Egg, Cake, Flower2, Leaf } from 'lucide-react';

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

// Small repeating motif drawn behind each festive card.
const motif = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>${svg}</svg>`)}")`;
const HEART = 'M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21z';

type SeasonalCollection = {
  title: string;
  tag: string;
  blurb: string;
  icon: LucideIcon;
  accent: string;
  background: string;
  pattern: string;
};

// Blurbs are kept to a similar length so every card lines up.
const seasonalCollections: SeasonalCollection[] = [
  {
    title: 'Christmas Atelier',
    tag: 'Christmas',
    blurb: 'Fir, clove and gold leaf for long fireside evenings.',
    icon: TreePine,
    accent: '#2F6B4F',
    background: 'linear-gradient(160deg, #EEF4EF 0%, #DCE9E0 55%, #F3ECDD 100%)',
    pattern: motif("<path d='M16 8l1.6 5.4L23 15l-5.4 1.6L16 22l-1.6-5.4L9 15l5.4-1.6z' fill='#C5A059' fill-opacity='.45'/><circle cx='46' cy='44' r='1.8' fill='#2F6B4F' fill-opacity='.3'/><circle cx='44' cy='14' r='1.2' fill='#C5A059' fill-opacity='.5'/><circle cx='12' cy='50' r='1' fill='#2F6B4F' fill-opacity='.3'/>"),
  },
  {
    title: "Valentine's Salon",
    tag: "Valentine's",
    blurb: 'Rose-blush hearts tied in silk, made for evenings in love.',
    icon: Heart,
    accent: '#C45B6E',
    background: 'linear-gradient(160deg, #FCF1F3 0%, #F8DFE4 60%, #F6E6E0 100%)',
    pattern: motif(`<path d='${HEART}' transform='translate(6 6) scale(.6)' fill='#C45B6E' fill-opacity='.22'/><path d='${HEART}' transform='translate(38 36) scale(.45)' fill='#C45B6E' fill-opacity='.16'/>`),
  },
  {
    title: 'Easter Brunch',
    tag: 'Easter',
    blurb: 'Speckled egg candles in soft pastels for the spring table.',
    icon: Egg,
    accent: '#5E9475',
    background: 'linear-gradient(160deg, #FBF8E8 0%, #EAF4EC 60%, #F1F0FA 100%)',
    pattern: motif("<ellipse cx='16' cy='18' rx='5' ry='7' fill='#E9C46A' fill-opacity='.35'/><ellipse cx='46' cy='44' rx='4' ry='5.5' fill='#5E9475' fill-opacity='.25'/><circle cx='44' cy='14' r='1.4' fill='#A08BC9' fill-opacity='.4'/><circle cx='14' cy='48' r='1.4' fill='#E9C46A' fill-opacity='.45'/>"),
  },
  {
    title: 'Birthday Parlour',
    tag: 'Birthday',
    blurb: 'Confetti-drip keepsakes with sparkling citrus for big nights.',
    icon: Cake,
    accent: '#5F73B8',
    background: 'linear-gradient(160deg, #EFF3FB 0%, #F6EEF8 55%, #FCEDE2 100%)',
    pattern: motif("<rect x='10' y='10' width='7' height='3' rx='1.5' transform='rotate(30 13 11)' fill='#5F73B8' fill-opacity='.35'/><rect x='40' y='20' width='7' height='3' rx='1.5' transform='rotate(-25 43 21)' fill='#F4A261' fill-opacity='.45'/><rect x='22' y='42' width='7' height='3' rx='1.5' transform='rotate(60 25 43)' fill='#E76F8A' fill-opacity='.35'/><circle cx='50' cy='50' r='1.8' fill='#C5A059' fill-opacity='.5'/>"),
  },
  {
    title: "Mother's Day Tea",
    tag: "Mother's Day",
    blurb: "Floral pieces with garden tea notes, a gift she'll treasure.",
    icon: Flower2,
    accent: '#A8607F',
    background: 'linear-gradient(160deg, #F8F1F8 0%, #F6E6EE 55%, #FBEADF 100%)',
    pattern: motif("<g fill='#A8607F' fill-opacity='.2'><circle cx='16' cy='11' r='3'/><circle cx='21' cy='15' r='3'/><circle cx='19' cy='21' r='3'/><circle cx='13' cy='21' r='3'/><circle cx='11' cy='15' r='3'/></g><circle cx='16' cy='16' r='2' fill='#C5A059' fill-opacity='.5'/><circle cx='46' cy='46' r='1.6' fill='#A8607F' fill-opacity='.3'/>"),
  },
  {
    title: 'Autumn Harvest',
    tag: 'Autumn',
    blurb: 'Amber lanterns and smoky vanilla for candle-lit dinners.',
    icon: Leaf,
    accent: '#B0672F',
    background: 'linear-gradient(160deg, #FBF2E4 0%, #F4E2CC 60%, #EFE6D8 100%)',
    pattern: motif("<path d='M10 24C10 14 18 8 26 8c0 10-6 16-16 16z' fill='#B0672F' fill-opacity='.22'/><path d='M40 52c0-7 5-12 12-12 0 7-5 12-12 12z' fill='#C5A059' fill-opacity='.3'/><circle cx='48' cy='16' r='1.4' fill='#B0672F' fill-opacity='.35'/>"),
  },
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

        {/* FESTIVE COLLECTIONS */}
        <Section variant="transparent" className="overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-center md:text-left">
              <div>
                <span className="text-mari-gold font-bold tracking-[0.4em] text-[10px] uppercase block mb-3">Festive Collections</span>
                <h2 className="text-4xl md:text-7xl font-display font-normal text-mari-ink leading-tight">For every season <span className="italic font-light text-mari-teal">worth celebrating.</span></h2>
              </div>
              <Link to="/shop" className="inline-flex items-center justify-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-mari-dark border border-mari-dark/30 px-6 py-3 rounded-full hover:bg-mari-dark hover:text-white transition-all shadow-md backdrop-blur-sm">
                Shop All Seasons <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {seasonalCollections.map(({ title, tag, blurb, icon: Icon, accent, background, pattern }) => (
                <Link
                  key={tag}
                  to="/shop"
                  className="relative overflow-hidden rounded-[28px] border border-white/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] group h-[250px] md:h-[270px] block transition-transform duration-500 hover:-translate-y-1"
                  style={{ background }}
                >
                  <div className="absolute inset-0" style={{ backgroundImage: pattern }} aria-hidden="true" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/25 to-transparent" aria-hidden="true" />
                  <FestiveCandle
                    accent={accent}
                    className="absolute right-5 md:right-7 bottom-0 w-[66px] md:w-[76px] h-auto transition-transform duration-700 group-hover:-translate-y-1"
                  />
                  <div className="relative h-full p-8 md:p-9 flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                        <Icon className="w-4 h-4" style={{ color: accent }} aria-hidden="true" />
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>{tag}</span>
                    </div>
                    <h3 className="mt-5 text-3xl md:text-[2.1rem] font-display font-normal text-mari-ink whitespace-nowrap overflow-hidden text-ellipsis">{title}</h3>
                    <p className="mt-2 pr-16 md:pr-20 text-gray-600 font-light leading-relaxed text-sm md:text-base line-clamp-2 min-h-[3.25em]">{blurb}</p>
                    <span className="mt-auto inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-mari-dark group-hover:gap-3 transition-all">
                      Shop now
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
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
