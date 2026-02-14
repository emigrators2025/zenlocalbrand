import sgMail from '@sendgrid/mail';
import { LOGIN_ALERT_RECIPIENT } from './security';

const rawSendgridKey = process.env.SENDGRID_API_KEY;

if (!rawSendgridKey) {
  throw new Error('SENDGRID_API_KEY environment variable is not set');
}

// Sanitize the API key to avoid header parsing errors caused by stray whitespace/newlines
const sanitizedKey = rawSendgridKey.replace(/\s+/g, '');

if (!sanitizedKey) {
  throw new Error('SENDGRID_API_KEY is empty after sanitization');
}

sgMail.setApiKey(sanitizedKey);

// Your verified sender email (must be verified in SendGrid)
const FROM_EMAIL = 'support@zenlocalbrand.shop';
const FROM_NAME = 'ZEN LOCAL BRAND';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject,
    text: text || '',
    html: html || text || '',
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error: error.message };
  }
}

// Order confirmation email
export async function sendOrderConfirmation(
  to: string,
  orderNumber: string,
  customerName: string,
  items: { name: string; quantity: number; price: number }[],
  total: number,
  paymentMethod: 'cod' | 'instapay'
) {
  const itemsList = items
    .map((item) => `• ${item.name} x${item.quantity} - ${item.price} EGP`)
    .join('<br>');

  const paymentText =
    paymentMethod === 'cod'
      ? 'Cash on Delivery - Pay when you receive your order'
      : 'InstaPay - We will verify your payment shortly';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">ZEN LOCAL BRAND</h1>
        <p style="color: #666;">Premium Streetwear</p>
      </div>
      
      <h2 style="color: #333;">Order Confirmed! 🎉</h2>
      
      <p>Hi ${customerName},</p>
      
      <p>Thank you for your order! We've received it and will process it soon.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Order #${orderNumber}</h3>
        <div style="color: #666;">
          ${itemsList}
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <p style="font-size: 18px; font-weight: bold; color: #333; margin: 0;">
          Total: ${total} EGP
        </p>
      </div>
      
      <div style="background: #10b98120; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; color: #059669;"><strong>Payment:</strong> ${paymentText}</p>
      </div>
      
      <p>We'll contact you at your phone number to confirm delivery details.</p>
      
      <p style="color: #666; font-size: 14px;">
        Questions? Contact us at support@zenlocalbrand.shop or +201062137061
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="text-align: center; color: #999; font-size: 12px;">
        © 2026 ZEN LOCAL BRAND. All rights reserved.<br>
        Cairo, Egypt
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmed #${orderNumber} - ZEN LOCAL BRAND`,
    html,
    text: `Order Confirmed! Order #${orderNumber}. Total: ${total} EGP. Payment: ${paymentText}`,
  });
}

// New order notification to admin
export async function sendAdminOrderNotification(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: { name: string; quantity: number; price: number }[],
  subtotal: number,
  shipping: number,
  total: number,
  paymentMethod: 'cod' | 'instapay',
  shippingAddress: {
    street?: string;
    city?: string;
    governorate?: string;
    country?: string;
  },
  paymentScreenshot?: string
) {
  const itemsList = items
    .map((item) => `• ${item.name} x${item.quantity} - ${item.price} EGP`)
    .join('<br>');

  const addressString = shippingAddress 
    ? `${shippingAddress.street || ''}, ${shippingAddress.city || ''}, ${shippingAddress.governorate || ''}, ${shippingAddress.country || ''}`
    : 'Not provided';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #10b981;">🛒 New Order Received!</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order #${orderNumber}</h3>
        
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Address:</strong> ${addressString}</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        
        <p><strong>Items:</strong></p>
        <div style="color: #666;">
          ${itemsList}
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        
        <p><strong>Subtotal:</strong> ${subtotal} EGP</p>
        <p><strong>Shipping:</strong> ${shipping} EGP</p>
        <p style="font-size: 18px; font-weight: bold;">Total: ${total} EGP</p>
        <p><strong>Payment Method:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'InstaPay'}</p>
        ${paymentScreenshot ? `<p style="color: #10b981;">📷 Payment screenshot uploaded - <a href="${paymentScreenshot}">View Screenshot</a></p>` : ''}
      </div>
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://zenlocalbrand.shop'}/zen-admin/orders" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a></p>
    </div>
  `;

  return sendEmail({
    to: 'support@zenlocalbrand.shop',
    subject: `🛒 New Order #${orderNumber} - ${total} EGP`,
    html,
    text: `New Order #${orderNumber} from ${customerName}. Total: ${total} EGP. Payment: ${paymentMethod}`,
  });
}

export async function sendLoginAlert(params: {
  email: string;
  status: 'success' | 'failed' | '2fa_required';
  ipAddress: string;
  countryCode: string;
  city?: string | null;
  userAgent?: string;
  reason?: string;
  userId?: string;
  isAdmin?: boolean;
}) {
  const {
    email,
    status,
    ipAddress,
    countryCode,
    city,
    userAgent,
    reason,
    userId,
    isAdmin,
  } = params;

  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'UTC',
    hour12: false,
  });

  const subjectPrefix =
    status === 'failed'
      ? '⚠️ Failed Login'
      : status === '2fa_required'
      ? '🔐 2FA Required'
      : '✅ Successful Login';

  const subject = `${subjectPrefix} • ${email}`;

  const details = [
    `Email: ${email}`,
    `Status: ${status}`,
    `Admin Account: ${isAdmin ? 'Yes' : 'No'}`,
    `User ID: ${userId || 'Unknown'}`,
    `IP Address: ${ipAddress}`,
    `Country: ${countryCode}${city ? ` (${city})` : ''}`,
    `User Agent: ${userAgent || 'Unknown'}`,
    `Timestamp (UTC): ${timestamp}`,
    reason ? `Notes: ${reason}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: ${status === 'failed' ? '#dc2626' : '#10b981'}; margin-top: 0;">${subjectPrefix}</h2>
      <p style="color: #4b5563;">A login event was recorded for your storefront.</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Email</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Status</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${status.replace('_', ' ')}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Admin Account</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${isAdmin ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">IP Address</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${ipAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Location</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${countryCode}${city ? ` • ${city}` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">User Agent</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userAgent || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Time (UTC)</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${timestamp}</td>
          </tr>
          ${reason ? `<tr><td style="padding: 8px; font-weight: bold;">Notes</td><td style="padding: 8px;">${reason}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;

  return sendEmail({
    to: LOGIN_ALERT_RECIPIENT,
    subject,
    text: details,
    html,
  });
}

// Low inventory alert to admin
export async function sendLowInventoryAlert(
  products: { id: string; name: string; stock: number; threshold: number }[]
) {
  const productList = products
    .map(
      (p) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: ${p.stock === 0 ? '#dc2626' : '#f59e0b'};">${p.stock}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.threshold}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #f59e0b; margin-top: 0;">⚠️ Low Inventory Alert</h2>
      <p style="color: #4b5563;">The following products are running low on stock:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Current Stock</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${productList}
        </tbody>
      </table>
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://zenlocalbrand.shop'}/zen-admin/products" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Inventory</a></p>
    </div>
  `;

  return sendEmail({
    to: 'support@zenlocalbrand.shop',
    subject: `⚠️ Low Inventory Alert - ${products.length} products need restocking`,
    html,
    text: `Low Inventory Alert: ${products.map((p) => `${p.name} (${p.stock} left)`).join(', ')}`,
  });
}

// Shipping update notification to customer
export async function sendShippingUpdate(
  to: string,
  customerName: string,
  orderNumber: string,
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered',
  trackingNumber?: string
) {
  const statusMessages: Record<string, { emoji: string; title: string; message: string }> = {
    processing: {
      emoji: '📦',
      title: 'Order Being Prepared',
      message: 'Your order is being prepared for shipment.',
    },
    shipped: {
      emoji: '🚚',
      title: 'Order Shipped',
      message: 'Your order has been shipped and is on its way!',
    },
    out_for_delivery: {
      emoji: '🛵',
      title: 'Out for Delivery',
      message: 'Your order is out for delivery today!',
    },
    delivered: {
      emoji: '✅',
      title: 'Order Delivered',
      message: 'Your order has been delivered. Enjoy!',
    },
  };

  const statusInfo = statusMessages[status];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">ZEN LOCAL BRAND</h1>
        <p style="color: #666;">Premium Streetwear</p>
      </div>
      
      <h2 style="color: #333;">${statusInfo.emoji} ${statusInfo.title}</h2>
      
      <p>Hi ${customerName},</p>
      
      <p>${statusInfo.message}</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order:</strong> #${orderNumber}</p>
        ${trackingNumber ? `<p style="margin: 10px 0 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Questions? Contact us at support@zenlocalbrand.shop or +201062137061
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="text-align: center; color: #999; font-size: 12px;">
        © 2026 ZEN LOCAL BRAND. All rights reserved.<br>
        Cairo, Egypt
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `${statusInfo.emoji} ${statusInfo.title} - Order #${orderNumber}`,
    html,
    text: `${statusInfo.title}: ${statusInfo.message} Order #${orderNumber}${trackingNumber ? `. Tracking: ${trackingNumber}` : ''}`,
  });
}

// Welcome email for new users
export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">ZEN LOCAL BRAND</h1>
        <p style="color: #666;">Premium Streetwear</p>
      </div>
      
      <h2 style="color: #333;">Welcome to the Family! 🎉</h2>
      
      <p>Hi ${name},</p>
      
      <p>Thank you for joining ZEN LOCAL BRAND! We're excited to have you as part of our community.</p>
      
      <div style="background: linear-gradient(135deg, #10b98120, #059669); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #059669;">Use code WELCOME10</h3>
        <p style="margin: 0; color: #333;">for 10% off your first order!</p>
      </div>
      
      <p>Here's what you can look forward to:</p>
      <ul style="color: #666;">
        <li>Exclusive drops and early access</li>
        <li>Special member-only discounts</li>
        <li>Free shipping on orders over 1000 EGP</li>
      </ul>
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://zenlocalbrand.shop'}/products" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Shop Now</a></p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="text-align: center; color: #999; font-size: 12px;">
        © 2026 ZEN LOCAL BRAND. All rights reserved.<br>
        Cairo, Egypt
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to ZEN LOCAL BRAND! 🎉',
    html,
    text: `Welcome to ZEN LOCAL BRAND, ${name}! Use code WELCOME10 for 10% off your first order.`,
  });
}

// Back in stock notification
export async function sendBackInStockNotification(
  to: string,
  customerName: string,
  productName: string,
  productSlug: string,
  productImage: string
) {
  const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://zenlocalbrand.shop'}/products/${productSlug}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">ZEN LOCAL BRAND</h1>
        <p style="color: #666;">Premium Streetwear</p>
      </div>
      
      <h2 style="color: #333;">It's Back! 🔥</h2>
      
      <p>Hi ${customerName},</p>
      
      <p>Great news! <strong>${productName}</strong> is back in stock.</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <img src="${productImage}" alt="${productName}" style="max-width: 200px; border-radius: 10px;">
        <h3 style="color: #333;">${productName}</h3>
      </div>
      
      <p style="text-align: center;">
        <a href="${productUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Shop Now</a>
      </p>
      
      <p style="color: #666; font-size: 14px; text-align: center;">Hurry, popular items sell out fast!</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="text-align: center; color: #999; font-size: 12px;">
        © 2026 ZEN LOCAL BRAND. All rights reserved.<br>
        Cairo, Egypt
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `${productName} is Back in Stock! 🔥`,
    html,
    text: `${productName} is back in stock! Shop now at ${productUrl}`,
  });
}

// Password reset email
export async function sendPasswordResetEmail(
  to: string,
  customerName: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://zenlocalbrand.shop'}/auth/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">ZEN LOCAL BRAND</h1>
        <p style="color: #666;">Premium Streetwear</p>
      </div>
      
      <h2 style="color: #333;">Password Reset Request</h2>
      
      <p>Hi ${customerName},</p>
      
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
      </p>
      
      <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #10b981; word-break: break-all; font-size: 12px;">${resetUrl}</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          <strong>⚠️ Security Notice:</strong><br>
          This link expires in 1 hour. If you didn't request this reset, please ignore this email or contact support.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="text-align: center; color: #999; font-size: 12px;">
        © 2026 ZEN LOCAL BRAND. All rights reserved.<br>
        Cairo, Egypt
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Password - ZEN LOCAL BRAND',
    html,
    text: `Hi ${customerName}, Reset your password using this link: ${resetUrl}. This link expires in 1 hour.`,
  });
}
