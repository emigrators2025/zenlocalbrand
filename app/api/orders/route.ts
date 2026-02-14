import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      userEmail,
      userName,
      userPhone,
      items,
      subtotal,
      shipping,
      total,
      status,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentScreenshot,
      notes,
    } = body;

    if (!userEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderData = {
      userId: userId || 'guest',
      userEmail,
      userName: userName || '',
      userPhone: userPhone || '',
      items,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      total: total || 0,
      status: status || 'pending',
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentStatus || 'pending',
      paymentScreenshot: paymentScreenshot || null,
      notes: notes || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(ORDERS_COLLECTION).add(orderData);
    await docRef.update({ id: docRef.id });

    // Update user order count and total spent if not guest
    if (userId && userId !== 'guest') {
      try {
        const userRef = adminDb.collection(USERS_COLLECTION).doc(userId);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          const userData = userSnap.data();
          await userRef.update({
            orderCount: (userData?.orderCount || 0) + 1,
            totalSpent: (userData?.totalSpent || 0) + total,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      } catch (userError) {
        console.error('Failed to update user stats:', userError);
        // Don't fail the order if user update fails
      }
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET - Fetch orders (filtered by userId for users, all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = adminDb
      .collection(ORDERS_COLLECTION)
      .orderBy('createdAt', 'desc');

    // If userId is provided, filter orders by that user
    if (userId) {
      query = adminDb
        .collection(ORDERS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// PUT - Update an order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const cleanData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && key !== 'createdAt' && key !== 'updatedAt') {
        cleanData[key] = value;
      }
    }

    await adminDb.collection(ORDERS_COLLECTION).doc(id).update(cleanData);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
