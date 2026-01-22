
import React, { useState } from 'react';
import { useCartStore, useAdminStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export const Checkout = () => {
  const { items, total, subtotal, isGift, giftNote, clearCart } = useCartStore();
  const { addOrder } = useAdminStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postcode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const email = data.get('email') as string;
    const name = `${data.get('firstName')} ${data.get('lastName')}`;

    setTimeout(() => {
        addOrder({
            id: Date.now().toString(),
            customerName: name,
            email: email,
            address: data.get('address') as string,
            city: data.get('city') as string,
            postcode: data.get('postcode') as string,
            items: [...items],
            total: total() + 4.99,
            date: new Date().toISOString(),
            status: 'pending',
            isGift,
            giftNote
        });

        console.log(`%c[Email Service] Order Confirmation sent to ${email}`, 'color: green; font-weight: bold;');
        console.log(`%c[Email Service] New Order Notification sent to admin@marishandmade.co.uk`, 'color: blue; font-weight: bold;');

        setLoading(false);
        setStep('success');
        clearCart();
    }, 2000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-mari-cream flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-serif text-mari-dark mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for shopping with Mari's Handmade. We've sent a confirmation email with your order details. Your candles will be on their way soon!
          </p>
          <Link
            to="/"
            className="inline-block bg-mari-dark text-white px-8 py-3 rounded-full hover:bg-mari-teal transition-colors"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0 && step === 'form') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Your basket is empty</h2>
        <Link to="/shop" className="text-mari-teal hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-mari-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-serif text-mari-dark mb-6">Shipping Details (UK Only)</h2>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input name="firstName" required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input name="lastName" required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input name="email" required type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input name="address" required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input name="city" required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                    <input name="postcode" required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                   <select disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                     <option>United Kingdom</option>
                   </select>
                </div>
              </form>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-serif text-mari-dark mb-6">Payment</h2>
                <div className="p-4 border border-mari-teal/20 bg-mari-teal/5 rounded-lg text-mari-dark text-sm">
                    This is a demo store. No actual payment will be processed.
                </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-mari-cream">
              <h2 className="text-2xl font-serif text-mari-dark mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>£{subtotal().toFixed(2)}</span>
                </div>
                {isGift && (
                  <div className="flex justify-between text-mari-gold font-medium">
                    <span className="flex items-center gap-2"><Gift className="w-4 h-4" /> Gift Wrapping</span>
                    <span>£5.00</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping (UK Standard)</span>
                  <span>£4.99</span>
                </div>
                <div className="flex justify-between text-xl font-serif font-bold text-mari-dark pt-4">
                  <span>Total</span>
                  <span>£{(total() + 4.99).toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full mt-8 bg-mari-coral text-white py-4 rounded-full font-medium hover:bg-mari-dark transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
