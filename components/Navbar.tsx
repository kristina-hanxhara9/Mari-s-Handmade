
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore, useAdminStore } from '../store';
import { AnimatePresence, motion } from 'framer-motion';

const basePath = import.meta.env.BASE_URL || '/';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const { siteConfig } = useAdminStore();
  const location = useLocation();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop Collection', path: '/shop' },
    { name: 'Our Story', path: '/#story' },
  ];

  const isHome = location.pathname === '/';
  const shouldShowBackground = isScrolled || mobileMenuOpen || !isHome;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-700">
      {/* Sculpted Wavy Background Layer */}
      <div 
        className={`absolute inset-0 z-[-1] transition-all duration-1000 ease-in-out pointer-events-none ${
          shouldShowBackground ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        }`}
      >
        <div className="absolute inset-0 h-[calc(100%+3.5rem)] w-full overflow-hidden filter drop-shadow(0 15px 40px rgba(0,0,0,0.08))">
          
          {/* Ambient Background with Clip Path to prevent blurring in "empty" wave areas */}
          <div className="absolute inset-0 z-0" style={{ clipPath: 'url(#waveClip)' }}>
             <img 
               src={siteConfig.navbarBackground || `${basePath}images/nav-photo.png`}
               alt="Navbar Ambient Background" 
               className="w-full h-full object-cover opacity-30"
             />
             {/* Increased opacity to bg-white/90 for better text contrast */}
             <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" />
          </div>

          <svg 
            viewBox="0 0 1440 160" 
            className="absolute bottom-0 w-full h-full fill-white"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FCFBF9" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>
              <filter id="tealGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <clipPath id="waveClip" clipPathUnits="objectBoundingBox">
                 <path d="M0,0 L1,0 L1,0.625 C0.916,0.875 0.833,0.5 0.75,0.625 C0.666,0.75 0.583,1 0.5,0.875 C0.416,0.75 0.333,0.5 0.25,0.625 C0.166,0.75 0.083,1 0,0.875 Z" />
              </clipPath>
            </defs>
            <path 
              fill="url(#navGradient)"
              d="M0,0 L1440,0 L1440,100 C1320,140 1200,80 1080,100 C960,120 840,160 720,140 C600,120 480,80 360,100 C240,120 120,160 0,140 Z"
            />
            <path 
              fill="none" 
              stroke="#4A90A4" 
              strokeWidth="2" 
              strokeOpacity="0.3"
              filter="url(#tealGlow)"
              d="M0,141 C120,161 240,121 360,101 C480,81 600,121 720,141 C840,161 960,121 1080,101 C1200,81 1320,141 1440,101"
            />
          </svg>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex justify-between items-center transition-all duration-700 ${shouldShowBackground ? 'py-3 md:py-4' : 'py-8 md:py-12'}`}>
        
        {/* Brand Text Logo */}
        <Link to="/" className="flex flex-col items-center group relative z-50">
          <motion.span 
            className="font-serif text-xl md:text-4xl tracking-[0.2em] uppercase text-mari-dark font-bold leading-none drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
            animate={{ 
                scale: shouldShowBackground ? 0.85 : 1,
            }}
          >
            Mari's
          </motion.span>
          <motion.span 
            className="font-sans text-[7px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase mt-0.5 md:mt-1 text-mari-teal font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"
            animate={{ 
              opacity: shouldShowBackground ? 0.9 : 1,
            }}
          >
            Handmade
          </motion.span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10 lg:gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[10px] font-bold tracking-[0.3em] transition-all duration-300 uppercase relative group drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)] ${
                shouldShowBackground ? 'text-mari-dark hover:text-mari-gold' : 'text-mari-dark/80 hover:text-mari-gold'
              }`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-mari-gold transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-6 relative z-50">
          <button
            onClick={toggleCart}
            className="group relative p-2 md:p-3 hover:bg-mari-pink/10 rounded-full transition-all duration-500"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-mari-dark drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 bg-mari-gold text-white text-[8px] md:text-[9px] w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center rounded-full font-bold shadow-md"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <button
            className="md:hidden p-2 text-mari-dark transition-transform active:scale-90"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-white/98 z-40 backdrop-blur-2xl flex flex-col items-center justify-center px-6"
          >
            <div className="flex flex-col items-center space-y-10 w-full">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="w-full text-center"
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl font-serif text-mari-dark hover:text-mari-gold transition-colors block"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-10 border-t border-mari-dark/10 w-24 text-center">
                <span className="text-[9px] tracking-[0.4em] uppercase text-gray-400">Est. 2024</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
