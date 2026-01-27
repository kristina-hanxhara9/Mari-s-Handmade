import React, { useState, useEffect } from 'react';
import { useCartStore, useAdminStore } from '../store';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Gift, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, createPaymentIntent, type CheckoutData } from '../lib/stripe';
import { sendOrderEmails } from '../lib/email';

// Stripe card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a1a',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
      padding: '12px',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

// Payment form component (used inside Elements provider)
const PaymentForm = ({
  formData,
  onSuccess,
  onError,
  loading,
  setLoading,
}: {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    postcode: string;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total, isGift, giftNote } = useCartStore();
  const [cardError, setCardError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const SHIPPING_COST = 4.99;
  const GIFT_WRAP_COST = 5.00;

  // Create payment intent when form data is complete
  useEffect(() => {
    const createIntent = async () => {
      if (!formData.email || !formData.firstName || !formData.address) return;

      try {
        const checkoutData: CheckoutData = {
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            postcode: formData.postcode,
            country: 'United Kingdom',
          },
          isGift,
          giftNote: giftNote || undefined,
          shippingCost: SHIPPING_COST,
          giftWrapCost: GIFT_WRAP_COST,
        };

        const { clientSecret: secret, paymentIntentId: intentId } = await createPaymentIntent(checkoutData);
        setClientSecret(secret);
        setPaymentIntentId(intentId);
      } catch (error: any) {
        console.error('Failed to create payment intent:', error);
        // Don't show error yet, will show when user tries to pay
      }
    };

    createIntent();
  }, [formData.email, formData.firstName, formData.address, items, isGift, giftNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    if (!stripe || !elements || !clientSecret) {
      setCardError('Payment system not ready. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card element not found.');
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: {
              line1: formData.address,
              city: formData.city,
              postal_code: formData.postcode,
              country: 'GB',
            },
          },
        },
      });

      if (error) {
        setCardError(error.message || 'Payment failed. Please try again.');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setCardError('Payment was not completed. Please try again.');
        setLoading(false);
      }
    } catch (error: any) {
      setCardError(error.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <CardElement options={cardElementOptions} />
      </div>

      {cardError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{cardError}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe || !clientSecret}
        className="w-full bg-mari-coral text-white py-4 rounded-full font-medium hover:bg-mari-dark transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay £{(total() + SHIPPING_COST).toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

// Main Checkout component
export const Checkout = () => {
  const { items, total, subtotal, isGift, giftNote, clearCart } = useCartStore();
  const { addOrder } = useAdminStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SHIPPING_COST = 4.99;
  const GIFT_WRAP_COST = 5.00;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postcode: '',
  });

  // Check for success redirect from Stripe hosted checkout
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      setStep('success');
      clearCart();
    }
  }, [searchParams, clearCart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Create order
    const order = {
      id: paymentIntentId || Date.now().toString(),
      customerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      postcode: formData.postcode,
      items: [...items],
      total: total() + SHIPPING_COST,
      date: new Date().toISOString(),
      status: 'pending' as const,
      isGift,
      giftNote: giftNote || undefined,
    };

    addOrder(order);

    // Send emails
    try {
      const emailResults = await sendOrderEmails(order);
      console.log('Email results:', emailResults);
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
      // Don't block the success flow if emails fail
    }

    setLoading(false);
    setStep('success');
    clearCart();
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  // Success screen
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
          {isGift && giftNote && (
            <div className="bg-mari-gold/10 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm font-medium text-mari-gold flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4" /> Gift Message Included
              </p>
              <p className="text-sm text-gray-600 italic">"{giftNote}"</p>
            </div>
          )}
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

  // Empty cart
  if (items.length === 0 && step === 'form') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Your basket is empty</h2>
        <Link to="/shop" className="text-mari-teal hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Checkout form
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-mari-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left column - Forms */}
          <div className="space-y-8">
            {/* Shipping Details */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-serif text-mari-dark mb-6">Shipping Details (UK Only)</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      name="firstName"
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      name="lastName"
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    name="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    name="address"
                    required
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      name="city"
                      required
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                    <input
                      name="postcode"
                      required
                      type="text"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-serif text-mari-dark mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" /> Payment
              </h2>

              {error && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Elements stripe={stripePromise}>
                <PaymentForm
                  formData={formData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  loading={loading}
                  setLoading={setLoading}
                />
              </Elements>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>Powered by</span>
                <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#6772e5"
                    d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-5.13L32.37 0v3.77l-4.13.88V.44zm-4.32 9.35v10.22H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.45-3.32.43zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.41zm-4.91.7c0 3.05-2.84 3.22-3.8 3.22-.87 0-1.7-.15-2.62-.52v-3.2c.73.35 1.8.63 2.73.63.5 0 .88-.16.88-.64 0-1.2-3.52-1.26-3.52-4.71 0-3.36 2.18-4.14 4.1-4.14.79 0 1.76.13 2.6.46v3.2c-.55-.31-1.48-.6-2.22-.6-.55 0-.88.2-.88.55 0 1.04 3.73.97 3.73 4.75zM8.24 20.3c-4.65 0-7.35-3.24-7.35-7.62 0-4.39 2.7-7.51 7.35-7.51 4.64 0 7.34 3.12 7.34 7.51 0 4.38-2.7 7.62-7.34 7.62zm0-11.72c-1.87 0-3.02 1.59-3.02 4.1 0 2.52 1.15 4.21 3.02 4.21 1.88 0 3.02-1.7 3.02-4.21 0-2.51-1.14-4.1-3.02-4.1z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right column - Order Summary */}
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
                    <span className="flex items-center gap-2">
                      <Gift className="w-4 h-4" /> Gift Wrapping
                    </span>
                    <span>£{GIFT_WRAP_COST.toFixed(2)}</span>
                  </div>
                )}
                {isGift && giftNote && (
                  <div className="bg-mari-gold/5 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Gift Message:</p>
                    <p className="text-sm text-gray-700 italic">"{giftNote}"</p>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping (UK Standard)</span>
                  <span>£{SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-serif font-bold text-mari-dark pt-4">
                  <span>Total</span>
                  <span>£{(total() + SHIPPING_COST).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
