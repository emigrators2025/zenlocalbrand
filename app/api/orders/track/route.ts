import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - Track order by order number or email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    // Search for order by order number (stored in notes field as "Order #ZENXXXXXX")
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('notes', '==', `Order #${orderNumber}`)
      .limit(1)
      .get();

    if (ordersSnapshot.empty) {
      // Try searching without the "Order #" prefix
      const ordersSnapshot2 = await adminDb
        .collection('orders')
        .where('notes', '==', orderNumber)
        .limit(1)
        .get();

      if (ordersSnapshot2.empty) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      const orderDoc = ordersSnapshot2.docs[0];
      const orderData = orderDoc.data();

      // Verify email if provided
      if (email && orderData.userEmail?.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        order: formatOrderForTracking(orderDoc.id, orderData),
      });
    }

    const orderDoc = ordersSnapshot.docs[0];
    const orderData = orderDoc.data();

    // Verify email if provided
    if (email && orderData.userEmail?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: formatOrderForTracking(orderDoc.id, orderData),
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}

function formatOrderForTracking(id: string, data: FirebaseFirestore.DocumentData) {
  const orderNumber = data.notes?.replace('Order #', '') || id;
  
  // Define order status steps
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
    { key: 'processing', label: 'Processing', description: 'We are preparing your order' },
    { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order will arrive today' },
    { key: 'delivered', label: 'Delivered', description: 'Your order has been delivered' },
  ];

  // Map order status to step index
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    processing: 1,
    shipped: 2,
    out_for_delivery: 3,
    delivered: 4,
    completed: 4,
    cancelled: -1,
  };

  const currentStatus = data.shippingStatus || data.status || 'pending';
  const currentStepIndex = statusMap[currentStatus] ?? 0;

  // Build timeline
  const timeline = statusSteps.map((step, index) => ({
    ...step,
    completed: index <= currentStepIndex && currentStepIndex !== -1,
    current: index === currentStepIndex,
    timestamp: index === 0 ? data.date || data.createdAt : null,
  }));

  return {
    orderNumber,
    status: currentStatus,
    statusLabel: currentStatus === 'cancelled' ? 'Cancelled' : statusSteps[currentStepIndex]?.label || 'Processing',
    timeline,
    trackingNumber: data.trackingNumber || null,
    estimatedDelivery: data.estimatedDelivery || null,
    items: data.items?.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      size: item.size,
      color: item.color,
    })) || [],
    shippingAddress: data.shippingAddress || null,
    total: data.total,
    subtotal: data.subtotal,
    shipping: data.shipping,
    discount: data.discount || 0,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentStatus,
    orderDate: data.date || data.createdAt,
    isCancelled: currentStatus === 'cancelled',
  };
}
