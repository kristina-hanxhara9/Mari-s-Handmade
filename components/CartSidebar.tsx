import React from 'react';
import { useCartStore } from '../store';
import { X, Plus, Minus, Trash2, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const CartSidebar = () => {
  const { items, isOpen, isGift, giftNote, toggleCart, toggleGift, setGiftNote, removeItem, updateQuantity, subtotal, total } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-mari-cream">
              <h2 className="font-serif text-2xl text-mari-dark">Your Basket</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="opacity-20">
                    <Gift className="w-12 h-12" />
                  </div>
                  <p className="text-lg font-medium">Your basket is empty</p>
                  <button
                    onClick={toggleCart}
                    className="text-mari-teal hover:underline underline-offset-4"
                  >
                    Start Browsing
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-lg text-mari-dark line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-gray-500">£{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-mari-coral transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:text-mari-teal transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-mari-cream">
                
                {/* Gift Option */}
                <div className="mb-6">
                    <div 
                    onClick={toggleGift}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${
                        isGift 
                        ? 'border-mari-gold bg-white shadow-sm' 
                        : 'border-transparent hover:bg-white hover:border-gray-200'
                    }`}
                    >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isGift ? 'bg-mari-gold text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                        <Gift className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                        <span className="font-medium text-mari-dark">Send as a Gift</span>
                        <span className="text-xs text-gray-500">Premium wrapping & note</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-mari-gold">+£5.00</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isGift ? 'bg-mari-gold border-mari-gold' : 'border-gray-300 bg-white'
                        }`}>
                        {isGift && <Plus className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                    </div>

                    {/* Animated Note Field */}
                    <AnimatePresence>
                        {isGift && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <textarea
                                    value={giftNote}
                                    onChange={(e) => setGiftNote(e.target.value)}
                                    placeholder="Type your gift message here... (Max 150 chars)"
                                    maxLength={150}
                                    className="w-full mt-3 p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-mari-gold focus:border-transparent outline-none resize-none bg-white/50"
                                    rows={3}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>£{subtotal().toFixed(2)}</span>
                  </div>
                  {isGift && (
                    <div className="flex justify-between items-center text-sm text-mari-gold font-medium">
                      <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Gift Wrapping</span>
                      <span>£5.00</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-900 font-medium">Total</span>
                    <span className="font-serif text-xl font-bold text-mari-dark">
                      £{total().toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 text-center mb-4">
                  Shipping calculated at checkout (UK Only)
                </p>
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="block w-full bg-mari-dark text-white text-center py-4 rounded-full font-medium tracking-wide hover:bg-mari-teal transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};