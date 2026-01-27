
import React, { useMemo, useState, useEffect } from 'react';
import { useAdminStore, useCartStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const Shop = () => {
  // Update page title and meta for SEO
  useEffect(() => {
    document.title = "Shop Luxury Handmade Candles | Mari's Handmade UK";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Browse our collection of luxury handcrafted sculptural candles. Pillar candles, arrangements, jars, and seasonal designs. Hand-poured in the UK with premium ingredients.');
    }
  }, []);
  const [activeCategory, setActiveCategory] = useState('All');
  const { addItem } = useCartStore();
  const { products } = useAdminStore();

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="pt-28 md:pt-32 pb-24 min-h-screen relative bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-mari-gold font-bold tracking-[0.3em] text-[10px] uppercase block mb-4"
          >
            The Archive
          </motion.span>
          <h1 className="text-4xl md:text-7xl font-serif text-mari-dark mb-4 md:mb-6">Our Collection</h1>
          <p className="text-gray-500 max-w-xl mx-auto font-light leading-relaxed italic text-sm md:text-base">
            "Every light is a sculpture, every scent a memory."
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16 md:mb-20 border-b border-mari-dark/5 pb-6 md:pb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative py-1 md:py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? 'text-mari-dark'
                  : 'text-gray-400 hover:text-mari-gold'
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-mari-dark"
                />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-20"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                key={product.id}
                className="group relative"
              >
                <div className="relative aspect-[3/4] md:aspect-[3/4.5] arch-top overflow-hidden bg-white/40 backdrop-blur-sm shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:shadow-[0_25px_60px_-15px_rgba(197,160,89,0.2)] group-hover:-translate-y-2 border border-white/20">
                  <div className="absolute inset-0 bg-mari-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-mari-dark/10 backdrop-blur-[2px]">
                    <button
                      onClick={() => addItem(product)}
                      className="bg-white text-mari-dark px-6 md:px-8 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-mari-dark hover:text-white transition-all flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" /> Add to Basket
                    </button>
                  </div>

                  <div className="absolute top-6 md:top-8 left-0 right-0 text-center z-20">
                      <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] text-white/80 drop-shadow-md">
                          {product.category}
                      </span>
                  </div>
                </div>
                
                <div className="mt-6 md:mt-8 text-center px-2">
                  <h3 className="text-xl md:text-2xl font-serif text-mari-dark mb-1 group-hover:text-mari-gold transition-colors duration-500">
                    {product.name}
                  </h3>
                  <div className="w-6 md:w-8 h-[1px] bg-mari-gold/30 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-400 text-[9px] md:text-xs uppercase tracking-[0.2em] font-medium mb-2 md:mb-3">
                    £{product.price.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm font-light leading-relaxed line-clamp-1 italic mb-4">
                    Notes of {product.scentNotes}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
