import Stripe from 'stripe';
import { GIFT_WRAP_COST, SHIPPING_COST, json, lookupProducts, money } from './_lib/shop';

interface CheckoutRequest {
  items: { id: string; quantity: number }[];
  customerEmail: string;
  customerName: string;
  shippingAddress: { address: string; city: string; postcode: string };
  isGift: boolean;
  giftNote?: string;
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json(503, { error: 'Payments are not set up yet. Please try again later.' });
  const stripe = new Stripe(secretKey);

  let data: CheckoutRequest;
  try {
    data = await req.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  const requested = (data.items || []).filter(
    (i) => typeof i.id === 'string' && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 50
  );
  if (requested.length === 0) return json(400, { error: 'Your basket is empty.' });
  if (!data.customerEmail || !data.customerName || !data.shippingAddress?.address) {
    return json(400, { error: 'Please fill in your name, email and address.' });
  }

  try {
    const catalog = await lookupProducts(requested.map((i) => i.id));
    const missing = requested.filter((i) => !catalog.has(i.id));
    if (missing.length) {
      return json(409, { error: 'Some items in your basket are no longer available. Please refresh and try again.' });
    }

    const lines = requested.map((i) => {
      const p = catalog.get(i.id)!;
      return { id: p.id, name: p.name, price: p.price, quantity: i.quantity };
    });
    const subtotal = money(lines.reduce((s, l) => s + l.price * l.quantity, 0));
    const giftWrap = data.isGift ? GIFT_WRAP_COST : 0;
    const total = money(subtotal + SHIPPING_COST + giftWrap);

    // Stripe metadata values are limited to 500 chars, so split the item list across keys.
    const itemsJson = JSON.stringify(lines.map((l) => [l.id, l.quantity, l.price]));
    const itemChunks: Record<string, string> = {};
    for (let i = 0; i * 450 < itemsJson.length && i < 20; i++) {
      itemChunks[`items_${i}`] = itemsJson.slice(i * 450, (i + 1) * 450);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      receipt_email: data.customerEmail,
      metadata: {
        customerName: data.customerName.slice(0, 200),
        customerEmail: data.customerEmail.slice(0, 200),
        shippingAddress: data.shippingAddress.address.slice(0, 450),
        shippingCity: (data.shippingAddress.city || '').slice(0, 100),
        shippingPostcode: (data.shippingAddress.postcode || '').slice(0, 20),
        isGift: data.isGift ? 'true' : 'false',
        giftNote: (data.giftNote || '').slice(0, 450),
        subtotal: subtotal.toFixed(2),
        shipping: SHIPPING_COST.toFixed(2),
        giftWrap: giftWrap.toFixed(2),
        ...itemChunks,
      },
      description: `Mari's Handmade order: ${lines.map((l) => `${l.name} x${l.quantity}`).join(', ')}`.slice(0, 1000),
    });

    return json(200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      total,
    });
  } catch (error: any) {
    console.error('create-payment-intent error:', error);
    return json(500, { error: 'Could not start the payment. Please try again.' });
  }
};
