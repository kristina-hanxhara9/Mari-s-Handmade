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

    // Build line items for Stripe
    const lineItems = data.items.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          images: item.image.startsWith('http') ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents/pence
      },
      quantity: item.quantity,
    }));

    // Add shipping cost
    if (data.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'UK Standard Shipping',
            images: [],
          },
          unit_amount: Math.round(data.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add gift wrapping if selected
    if (data.isGift && data.giftWrapCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: '🎁 Gift Wrapping',
            images: [],
          },
          unit_amount: Math.round(data.giftWrapCost * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: data.customerEmail,
      success_url: `${process.env.URL || 'http://localhost:5173'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/checkout`,
      metadata: {
        customerName: data.customerName,
        shippingAddress: data.shippingAddress.address,
        shippingCity: data.shippingAddress.city,
        shippingPostcode: data.shippingAddress.postcode,
        isGift: data.isGift ? 'true' : 'false',
        giftNote: data.giftNote || '',
      },
      shipping_address_collection: {
        allowed_countries: ['GB'],
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
    };
  } catch (error: any) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to create checkout session',
      }),
    };
  }
};

export { handler };
