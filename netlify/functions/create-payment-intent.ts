import type { Handler } from '@netlify/functions';

// Note: You need to install stripe: npm install stripe
// And set STRIPE_SECRET_KEY in your Netlify environment variables

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutRequest {
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

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data: CheckoutRequest = JSON.parse(event.body || '{}');

    // Calculate total amount
    const itemsTotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const giftCost = data.isGift ? data.giftWrapCost : 0;
    const totalAmount = itemsTotal + data.shippingCost + giftCost;

    // Create items description for metadata
    const itemsDescription = data.items
      .map((item) => `${item.name} x${item.quantity}`)
      .join(', ');

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe uses cents/pence
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: data.customerEmail,
      metadata: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        shippingAddress: data.shippingAddress.address,
        shippingCity: data.shippingAddress.city,
        shippingPostcode: data.shippingAddress.postcode,
        isGift: data.isGift ? 'true' : 'false',
        giftNote: data.giftNote || '',
        items: itemsDescription.substring(0, 500), // Stripe metadata limit
      },
      description: `Mari's Handmade Order - ${itemsDescription}`.substring(0, 1000),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error: any) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to create payment intent',
      }),
    };
  }
};

export { handler };
