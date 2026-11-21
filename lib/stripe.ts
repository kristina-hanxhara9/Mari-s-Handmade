import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

/** Null until a Stripe publishable key is configured. */
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

/** Only ids and quantities are sent; the server looks up prices itself. */
export interface CheckoutData {
  items: { id: string; quantity: number }[];
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    address: string;
    city: string;
    postcode: string;
  };
  isGift: boolean;
  giftNote?: string;
}

export async function createPaymentIntent(data: CheckoutData): Promise<{ clientSecret: string; paymentIntentId: string; total: number }> {
  const response = await fetch('/.netlify/functions/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Could not start the payment. Please try again.');
  }
  return body;
}
