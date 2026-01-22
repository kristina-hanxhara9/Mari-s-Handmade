import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation variants based on screen size
  const desktopVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 0 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 0 }
  };

  const mobileVariants = {
    hidden: { y: '100%', opacity: 1 },
    visible: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />
          
          {/* Modal Content */}
          <motion.div
            variants={isMobile ? mobileVariants : desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto bg-white w-full md:w-full md:max-w-2xl max-h-[85vh] md:max-h-[80vh] flex flex-col rounded-t-2xl md:rounded-2xl shadow-2xl relative z-10 md:mx-4"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-mari-cream rounded-t-2xl">
              <h2 className="text-xl md:text-2xl font-serif text-mari-dark">{title}</h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 overscroll-contain">
              <div className="prose prose-stone prose-sm md:prose-base max-w-none font-sans text-gray-600">
                {content}
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="flex-shrink-0 p-4 border-t border-gray-100 flex justify-end bg-white pb-safe md:pb-4 rounded-b-none md:rounded-b-2xl">
                 <button 
                    onClick={onClose} 
                    className="w-full md:w-auto px-6 py-3 bg-mari-dark text-white rounded-xl text-sm font-medium hover:bg-mari-teal transition-colors active:scale-95"
                 >
                     Close
                 </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};