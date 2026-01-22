
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CartSidebar } from './components/CartSidebar';
import { InfoModal } from './components/InfoModal';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { LightCursor } from './components/LightCursor';
import { BackgroundLayout } from './layouts/BackgroundLayout';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Modal Content Definitions
const modalContent = {
  shipping: (
    <div className="space-y-4">
      <p><strong>Processing Time:</strong> All our candles are handmade to order. Please allow 3-5 business days for your order to be crafted and cured before dispatch.</p>
      <p><strong>UK Standard Delivery (£4.99):</strong> 2-4 working days via Royal Mail Tracked 48.</p>
      <p><strong>Express Delivery (£7.99):</strong> Next working day delivery via DPD (Orders placed before 12pm).</p>
      <p>Currently, we only ship within the United Kingdom. We pack all orders using plastic-free, biodegradable materials to ensure your candles arrive safely and sustainably.</p>
    </div>
  ),
  returns: (
    <div className="space-y-4">
      <p>We hope you love your Mari's Handmade purchase. However, if you are not completely satisfied, we are here to help.</p>
      <p><strong>Return Policy:</strong> You have 14 days from the date of delivery to return your item. To be eligible for a return, your item must be unused, in the same condition that you received it, and in the original packaging.</p>
      <p><strong>Damages:</strong> If your candle arrives damaged, please contact us within 48 hours with photographic evidence, and we will arrange a replacement immediately.</p>
      <p><strong>Refunds:</strong> Once we receive your return, we will inspect it and notify you. If approved, your refund will be processed to your original method of payment within 5-10 business days.</p>
    </div>
  ),
  contact: (
    <div className="space-y-4">
      <p>Have a question about a custom order or need help with your purchase? We'd love to hear from you.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Email:</strong> hello@marishandmade.co.uk</li>
        <li><strong>Studio Hours:</strong> Mon-Fri, 9am - 5pm</li>
      </ul>
      <p>For wholesale inquiries, please include "Wholesale" in your email subject line.</p>
    </div>
  ),
  terms: (
    <div className="space-y-4">
      <p><strong>1. Introduction</strong><br/>By accessing and placing an order with Mari's Handmade, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below.</p>
      
      <p><strong>2. Products</strong><br/>All our products are handmade. As a result, slight imperfections, color variations, and frosting (a natural occurrence in soy wax) may appear. These are not defects but rather proof of the handmade nature of the product.</p>
      
      <p><strong>3. Safety</strong><br/>It is the customer's responsibility to follow all safety instructions included with the product. Mari's Handmade is not liable for any damage or injury resulting from the improper use of our candles.</p>
      
      <p><strong>4. Pricing</strong><br/>Prices are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>
      
      <p><strong>5. Privacy</strong><br/>We respect your privacy and will not share your personal information with third parties, except as necessary to process your order (e.g., shipping providers).</p>
    </div>
  )
};

const Footer = ({ onOpenModal }: { onOpenModal: (type: string) => void }) => (
  <footer className="relative pt-12 md:pt-16 pb-8 bg-transparent overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-16 md:h-20 z-10 pointer-events-none">
      <svg 
        viewBox="0 0 1440 160" 
        className="absolute top-0 w-full h-full fill-mari-charcoal"
        preserveAspectRatio="none"
      >
        <path 
          d="M0,160 L1440,160 L1440,60 C1320,20 1200,80 1080,60 C960,40 840,0 720,20 C600,40 480,80 360,60 C240,40 120,0 0,20 Z"
        />
        <path 
          fill="none" 
          stroke="#4A90A4" 
          strokeWidth="4" 
          strokeOpacity="0.4"
          d="M0,22 C120,2 240,42 360,62 C480,82 600,42 720,22 C840,2 960,42 1080,62 C1200,82 1320,22 1440,62"
        />
      </svg>
    </div>

    <div className="bg-mari-charcoal text-white pt-8 md:pt-12 relative z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10 md:mb-12">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-serif text-white tracking-widest uppercase">Mari's</h3>
            <p className="text-white/70 font-light leading-relaxed max-w-sm mx-auto md:mx-0 italic text-sm md:text-base">
              "Every light is a sculpture, every scent a memory." Handcrafted with devotion in our UK studio.
            </p>
          </div>
          
          <div className="text-center md:text-left">
            <h4 className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] mb-4 md:mb-6 text-mari-gold uppercase">Customer Support</h4>
            <ul className="space-y-2 md:space-y-3">
              {['shipping', 'returns', 'terms', 'contact'].map((type) => (
                <li key={type}>
                  <button 
                    onClick={() => onOpenModal(type)} 
                    className="text-white/60 hover:text-white transition-all text-xs font-medium tracking-wide flex items-center gap-2 justify-center md:justify-start mx-auto md:mx-0"
                  >
                    <span className="w-3 h-[1px] bg-mari-gold/30 hidden md:block"></span>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('shipping', 'Shipping Policy').replace('returns', 'Returns & Refunds').replace('terms', 'Terms & Conditions').replace('contact', 'Contact Us')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-6 text-center md:text-left">
             <div>
               <h4 className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] mb-3 md:mb-4 text-mari-gold uppercase">The Studio</h4>
               <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                 Open for custom commissions.<br/>
                 hello@marishandmade.co.uk
               </p>
             </div>
             <div className="flex gap-4 justify-center md:justify-start">
               {['IG', 'FB', 'TT'].map((social) => (
                 <div key={social} className="w-8 h-8 md:w-10 md:h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-mari-gold hover:text-mari-dark transition-all cursor-pointer text-[8px] md:text-[10px] font-bold tracking-widest shadow-lg">
                   {social}
                 </div>
               ))}
             </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-6 md:pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 pb-4 md:pb-6">
          <span className="text-white/30 text-[8px] md:text-[9px] tracking-[0.3em] uppercase">&copy; {new Date().getFullYear()} Mari's Handmade</span>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <Link to="/admin" className="text-white/20 hover:text-mari-gold transition-colors text-[8px] md:text-[9px] uppercase tracking-widest font-bold">Admin Portal</Link>
            <span className="text-white/10 text-[8px] md:text-[9px] tracking-[0.4em] uppercase">Handmade in UK</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

function App() {
  const [activeModal, setActiveModal] = useState<keyof typeof modalContent | null>(null);

  const getModalTitle = (type: keyof typeof modalContent | null) => {
    switch(type) {
      case 'shipping': return 'Shipping Policy';
      case 'returns': return 'Returns & Refunds';
      case 'contact': return 'Contact Us';
      case 'terms': return 'Terms & Conditions';
      default: return '';
    }
  };

  return (
    <Router>
      <BackgroundLayout>
        <div className="min-h-screen bg-transparent text-mari-dark font-sans selection:bg-mari-coral selection:text-white overflow-x-hidden">
          <LightCursor />
          <ScrollToTop />
          <Navbar />
          <CartSidebar />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          
          <Footer onOpenModal={(type) => setActiveModal(type as keyof typeof modalContent)} />

          <InfoModal 
            isOpen={!!activeModal}
            onClose={() => setActiveModal(null)}
            title={getModalTitle(activeModal)}
            content={activeModal ? modalContent[activeModal] : null}
          />
        </div>
      </BackgroundLayout>
    </Router>
  );
}

export default App;
