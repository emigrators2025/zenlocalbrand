import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      customerEmail,
      customerName,
      customerPhone,
      orderNumber,
      items,
      total,
      subtotal,
      shipping,
      paymentMethod,
      shippingAddress,
      paymentScreenshot,
    } = body;

    // Validate required fields
    if (!customerEmail || !orderNumber || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send order confirmation to customer
    const customerEmailResult = await sendOrderConfirmation(
      customerEmail,
      orderNumber,
      customerName || 'Valued Customer',
      items,
      total,
      paymentMethod || 'cod'
    );

    // Send notification to admin
    const adminEmailResult = await sendAdminOrderNotification(
      orderNumber,
      customerName || 'Unknown',
      customerEmail,
      customerPhone || 'Not provided',
      items,
      subtotal || total,
      shipping || 0,
      total,
      paymentMethod || 'cod',
      shippingAddress || {},
      paymentScreenshot
    );

    return NextResponse.json({
      success: true,
      customerEmail: customerEmailResult,
      adminEmail: adminEmailResult,
    });
  } catch (error: any) {
    console.error('Error sending order emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send emails' },
      { status: 500 }
    );
  }
}
