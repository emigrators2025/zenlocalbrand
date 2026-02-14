import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendLowInventoryAlert } from '@/lib/email';

// Check inventory and send alerts for low stock products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threshold = 10 } = body;

    // Get all products
    const productsSnapshot = await adminDb.collection('products').get();
    const lowStockProducts: { id: string; name: string; stock: number; threshold: number }[] = [];

    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      const stock = data.stock || 0;
      const productThreshold = data.lowStockThreshold || threshold;

      if (stock <= productThreshold) {
        lowStockProducts.push({
          id: doc.id,
          name: data.name,
          stock,
          threshold: productThreshold,
        });
      }
    });

    if (lowStockProducts.length === 0) {
      return NextResponse.json({ message: 'No low stock products found' });
    }

    // Send alert email
    const result = await sendLowInventoryAlert(lowStockProducts);

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send alert email' }, { status: 500 });
    }

    // Log the alert
    await adminDb.collection('inventory_alerts').add({
      products: lowStockProducts,
      sentAt: new Date().toISOString(),
      threshold,
    });

    return NextResponse.json({
      message: `Low inventory alert sent for ${lowStockProducts.length} products`,
      products: lowStockProducts,
    });
  } catch (error) {
    console.error('Error checking inventory:', error);
    return NextResponse.json({ error: 'Failed to check inventory' }, { status: 500 });
  }
}

// Get inventory alert history
export async function GET() {
  try {
    const alertsSnapshot = await adminDb
      .collection('inventory_alerts')
      .orderBy('sentAt', 'desc')
      .limit(50)
      .get();

    const alerts = alertsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
