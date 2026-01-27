import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// IMPORTANT: Replace with your actual Stripe publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';

export const stripePromise = loadStripe(stripePublishableKey);

// Types for Stripe checkout
export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    address: string;
    city: string;
    postcode: string;
    country: string;
  };
  isGift: boolean;
  giftNote?: string;
  shippingCost: number;
  giftWrapCost: number;
}

// Create a Stripe Checkout Session
export async function createCheckoutSession(data: CheckoutData): Promise<{ sessionId: string; url: string }> {
  const apiUrl = import.meta.env.VITE_API_URL || '/.netlify/functions';

  const response = await fetch(`${apiUrl}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

// Alternative: Create Payment Intent for embedded checkout
export async function createPaymentIntent(data: CheckoutData): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const apiUrl = import.meta.env.VITE_API_URL || '/.netlify/functions';

  const response = await fetch(`${apiUrl}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment intent');
  }

  return response.json();
}
