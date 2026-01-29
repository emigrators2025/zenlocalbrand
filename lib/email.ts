import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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
