import Stripe from 'stripe';
import { adminDb, json } from './_lib/shop';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function sendAdminEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !to) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Mari's Handmade <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) console.error('Resend error:', res.status, await res.text());
}

export default async (req: Request) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return json(503, { error: 'Webhook not configured' });

  const stripe = new Stripe(secretKey);
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, req.headers.get('stripe-signature') || '', webhookSecret);
  } catch (err: any) {
    console.error('Bad webhook signature:', err.message);
    return json(400, { error: 'Invalid signature' });
  }

  if (event.type !== 'payment_intent.succeeded') return json(200, { received: true });

  const pi = event.data.object as Stripe.PaymentIntent;
  const m = pi.metadata;
  const itemsJson = Object.keys(m)
    .filter((k) => k.startsWith('items_'))
    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)))
    .map((k) => m[k])
    .join('');
  const rawItems: [string, number, number][] = itemsJson ? JSON.parse(itemsJson) : [];

  // Look up names for the email/admin view.
  const names = new Map<string, string>();
  if (adminDb && rawItems.length) {
    const { data } = await adminDb.from('products').select('id, name').in('id', rawItems.map((i) => i[0]));
    for (const p of data || []) names.set(p.id, p.name);
  }
  const items = rawItems.map(([id, quantity, price]) => ({
    product_id: id,
    product_name: names.get(id) || 'Product',
    price,
    quantity,
  }));

  const total = pi.amount_received / 100;
  const isGift = m.isGift === 'true';

  if (adminDb) {
    const { error } = await adminDb.from('orders').upsert(
      {
        customer_name: m.customerName,
        customer_email: m.customerEmail,
        shipping_address: m.shippingAddress,
        shipping_city: m.shippingCity,
        shipping_postcode: m.shippingPostcode,
        items,
        subtotal: Number(m.subtotal),
        shipping: Number(m.shipping),
        total,
        is_gift: isGift,
        gift_message: m.giftNote || null,
        status: 'paid',
        stripe_payment_id: pi.id,
      },
      { onConflict: 'stripe_payment_id', ignoreDuplicates: true }
    );
    if (error) {
      console.error('Failed to save order:', error);
      return json(500, { error: 'Failed to save order' }); // Stripe will retry
    }
  }

  const rows = items
    .map((i) => `<li>${esc(i.product_name)} × ${i.quantity}: £${(i.price * i.quantity).toFixed(2)}</li>`)
    .join('');
  await sendAdminEmail(
    `New order: £${total.toFixed(2)} from ${m.customerName}`,
    `<h2>New order</h2>
     <p><b>${esc(m.customerName)}</b> (${esc(m.customerEmail)})</p>
     <p>${esc(m.shippingAddress)}, ${esc(m.shippingCity)}, ${esc(m.shippingPostcode)}</p>
     <ul>${rows}</ul>
     ${isGift ? `<p>🎁 Gift wrap${m.giftNote ? `: “${esc(m.giftNote)}”` : ''}</p>` : ''}
     <p><b>Total paid: £${total.toFixed(2)}</b></p>
     <p>Stripe payment: ${pi.id}</p>`
  ).catch((e) => console.error('Email failed:', e));

  return json(200, { received: true });
};
