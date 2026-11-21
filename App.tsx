
import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CartSidebar } from './components/CartSidebar';
import { InfoModal } from './components/InfoModal';
import { Home } from './pages/Home';
import { LightCursor } from './components/LightCursor';
import { BackgroundLayout } from './layouts/BackgroundLayout';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CandleApostrophe } from './components/CandleApostrophe';
import { Instagram } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/maris_handmade25/';
const WHATSAPP_DISPLAY = '+44 7827 804920';
const WHATSAPP_URL = 'https://wa.me/447827804920';

// Only the home page is in the first download; the rest load when visited.
const Shop = lazy(() => import('./pages/Shop').then((m) => ({ default: m.Shop })));
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })));
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));

// Scroll to top helper
// Scroll to the top on page change, or to a section when the link names one (e.g. "/#story")
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

// Modal Content Definitions
const modalContent = {
  shipping: (
    <div className="space-y-4">
      <p><strong>Processing Time:</strong> All our candles are handmade to order. Please allow 3 to 5 business days for your order to be crafted and cured before dispatch.</p>
      <p><strong>UK Standard Delivery (£4.99):</strong> 2 to 4 working days via Royal Mail Tracked 48.</p>
      <p><strong>Express Delivery (£7.99):</strong> Next working day delivery via DPD (Orders placed before 12pm).</p>
      <p>Currently, we only ship within the United Kingdom. We pack all orders using plastic free, biodegradable materials to ensure your candles arrive safely and sustainably.</p>
    </div>
  ),
  returns: (
    <div className="space-y-4">
      <p>We hope you love your Mari's Handmade purchase. However, if you are not completely satisfied, we are here to help.</p>
      <p><strong>Return Policy:</strong> You have 14 days from the date of delivery to return your item. To be eligible for a return, your item must be unused, in the same condition that you received it, and in the original packaging.</p>
      <p><strong>Damages:</strong> If your candle arrives damaged, please contact us within 48 hours with photographic evidence, and we will arrange a replacement immediately.</p>
      <p><strong>Refunds:</strong> Once we receive your return, we will inspect it and notify you. If approved, your refund will be processed to your original method of payment within 5 to 10 business days.</p>
    </div>
  ),
  contact: (
    <div className="space-y-4">
      <p>Have a question about a custom order or need help with your purchase? We'd love to hear from you.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>WhatsApp:</strong> <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-mari-teal">{WHATSAPP_DISPLAY}</a></li>
        <li><strong>Email:</strong> hello@marishandmade.co.uk</li>
        <li><strong>Instagram:</strong> <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-mari-teal">@maris_handmade25</a></li>
        <li><strong>Studio:</strong> London, UK</li>
        <li><strong>Studio Hours:</strong> Monday to Friday, 9am to 5pm</li>
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

type ModalType = keyof typeof modalContent;

const getModalTitle = (type: ModalType | null) => {
  switch (type) {
    case 'shipping': return 'Shipping Policy';
    case 'returns': return 'Returns & Refunds';
    case 'contact': return 'Contact Us';
    case 'terms': return 'Terms & Conditions';
    default: return '';
  }
};

const Footer = ({ onOpenModal }: { onOpenModal: (type: string) => void }) => (
  <footer className="relative pt-10 md:pt-16 bg-transparent overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-12 md:h-20 z-10 pointer-events-none">
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

    <div className="bg-mari-charcoal text-white pt-6 md:pt-12 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 md:gap-12 mb-6 md:mb-12">
          <div className="col-span-2 md:col-span-1 space-y-2 md:space-y-4">
            <h3 className="text-lg md:text-2xl font-serif text-white tracking-widest uppercase">Mari<CandleApostrophe />s</h3>
            <p className="text-white/70 font-light leading-relaxed max-w-sm italic text-xs md:text-base">
              "Every light is a sculpture, every scent a memory." Handcrafted with devotion in our London studio.
            </p>
          </div>
          
          <div>
            <h4 className="text-[8px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-6 text-mari-gold uppercase">Customer Support</h4>
            <ul className="space-y-1.5 md:space-y-3">
              {['shipping', 'returns', 'terms', 'contact'].map((type) => (
                <li key={type}>
                  <button 
                    onClick={() => onOpenModal(type)} 
                    className="text-white/60 hover:text-white transition-all text-[11px] md:text-xs font-medium tracking-wide text-left"
                  >
                    {getModalTitle(type as ModalType)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3 md:space-y-6 min-w-0">
             <div>
               <h4 className="text-[8px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 text-mari-gold uppercase">The Studio</h4>
               <p className="text-white/60 text-[11px] md:text-sm leading-relaxed break-words">
                 London, UK<br/>
                 Open for custom commissions.<br/>
                 <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-mari-gold transition-colors">WhatsApp {WHATSAPP_DISPLAY}</a><br/>
                 <a href="mailto:hello@marishandmade.co.uk" className="hover:text-mari-gold transition-colors">hello@marishandmade.co.uk</a>
               </p>
             </div>
             <a
               href={INSTAGRAM_URL}
               target="_blank"
               rel="noopener noreferrer"
               aria-label="Follow Mari's Handmade on Instagram"
               className="inline-flex items-center gap-2 md:gap-3 group"
             >
               <span className="shrink-0 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#3F8FB0] via-[#8FB8E0] to-[#E8799F] shadow-[0_4px_14px_-4px_rgba(232,160,184,0.6)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_6px_18px_-4px_rgba(74,144,164,0.7)]">
                 <Instagram className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
               </span>
               <span className="text-[11px] md:text-sm tracking-wide font-semibold bg-gradient-to-r from-[#8CC4EA] to-[#F291B4] bg-clip-text text-transparent transition-all duration-300 group-hover:from-[#B5DCF5] group-hover:to-[#F8B4CC]">@maris_handmade25</span>
             </a>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-4 md:pt-8 flex flex-row flex-wrap justify-between items-center gap-2 md:gap-4 pb-14 md:pb-6">
          <span className="text-white/30 text-[8px] md:text-[9px] tracking-[0.3em] uppercase">&copy; {new Date().getFullYear()} Mari's Handmade</span>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <Link to="/admin" className="text-white/20 hover:text-mari-gold transition-colors text-[8px] md:text-[9px] uppercase tracking-widest font-bold">Admin Portal</Link>
            <span className="text-white/10 text-[8px] md:text-[9px] tracking-[0.4em] uppercase">Handmade in London, UK</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

function App() {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  return (
    <Router>
      <BackgroundLayout>
        <div className="min-h-screen bg-transparent text-mari-dark font-sans selection:bg-mari-coral selection:text-white overflow-x-hidden">
          <LightCursor />
          <ScrollToTop />
          <Navbar />
          <CartSidebar />
          
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Suspense>
          
          <Footer onOpenModal={(type) => setActiveModal(type as ModalType)} />

          <InfoModal
            isOpen={!!activeModal}
            onClose={() => setActiveModal(null)}
            title={getModalTitle(activeModal)}
            content={activeModal ? modalContent[activeModal] : null}
          />

          {/* WhatsApp Floating Button */}
          <WhatsAppButton />
        </div>
      </BackgroundLayout>
    </Router>
  );
}

export default App;
