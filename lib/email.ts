import emailjs from '@emailjs/browser';
import type { Order } from '../types';

// EmailJS Configuration
// IMPORTANT: Replace these with your actual EmailJS credentials
// Get them from: https://www.emailjs.com/
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_ADMIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID || 'your_admin_template_id';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@marishandmade.co.uk';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Format order items for email
function formatOrderItems(order: Order): string {
  return order.items
    .map(item => `• ${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');
}

// Format gift message section
function formatGiftSection(order: Order): string {
  if (!order.isGift) return '';

  let giftSection = '\n🎁 GIFT ORDER\n';
  giftSection += 'Gift Wrapping: £5.00\n';
  if (order.giftNote) {
    giftSection += `Gift Message: "${order.giftNote}"\n`;
  }
  return giftSection;
}

// Send order confirmation to customer
export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  try {
    const templateParams = {
      to_email: order.email,
      to_name: order.customerName,
      order_id: order.id,
      order_date: new Date(order.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      order_items: formatOrderItems(order),
      subtotal: `£${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}`,
      shipping: '£4.99',
      gift_section: formatGiftSection(order),
      total: `£${order.total.toFixed(2)}`,
      shipping_address: `${order.address}\n${order.city}\n${order.postcode}\nUnited Kingdom`,
      is_gift: order.isGift ? 'Yes' : 'No',
      gift_note: order.giftNote || 'N/A',
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.log(`✅ Order confirmation sent to ${order.email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order confirmation:', error);
    return false;
  }
}

// Send new order notification to admin
export async function sendAdminNotification(order: Order): Promise<boolean> {
  try {
    const templateParams = {
      to_email: ADMIN_EMAIL,
      order_id: order.id,
      customer_name: order.customerName,
      customer_email: order.email,
      order_date: new Date(order.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      order_items: formatOrderItems(order),
      total: `£${order.total.toFixed(2)}`,
      shipping_address: `${order.address}, ${order.city}, ${order.postcode}`,
      is_gift: order.isGift ? '🎁 YES - GIFT ORDER' : 'No',
      gift_note: order.giftNote || 'N/A',
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TEMPLATE_ID, templateParams);
    console.log(`✅ Admin notification sent for order ${order.id}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    return false;
  }
}

// Send both emails
export async function sendOrderEmails(order: Order): Promise<{ customer: boolean; admin: boolean }> {
  const [customerResult, adminResult] = await Promise.all([
    sendOrderConfirmation(order),
    sendAdminNotification(order),
  ]);

  return {
    customer: customerResult,
    admin: adminResult,
  };
}
