import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendShippingUpdate } from '@/lib/email';

// Send shipping update notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, trackingNumber } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: processing, shipped, out_for_delivery, or delivered' },
        { status: 400 }
      );
    }

    // Get order details
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderDoc.data();
    if (!order) {
      return NextResponse.json({ error: 'Order data not found' }, { status: 404 });
    }

    // Update order status
    await adminDb.collection('orders').doc(orderId).update({
      status: status === 'delivered' ? 'completed' : status,
      shippingStatus: status,
      trackingNumber: trackingNumber || order.trackingNumber,
      updatedAt: new Date().toISOString(),
    });

    // Send email notification to customer
    const result = await sendShippingUpdate(
      order.userEmail,
      order.userName || 'Customer',
      order.notes?.replace('Order #', '') || orderId,
      status,
      trackingNumber
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Order updated but failed to send notification email' },
        { status: 500 }
      );
    }

    // Log notification
    await adminDb.collection('notifications').add({
      type: 'shipping_update',
      orderId,
      status,
      email: order.userEmail,
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Shipping update sent successfully',
      status,
      email: order.userEmail,
    });
  } catch (error) {
    console.error('Error sending shipping update:', error);
    return NextResponse.json(
      { error: 'Failed to send shipping update' },
      { status: 500 }
    );
  }
}
