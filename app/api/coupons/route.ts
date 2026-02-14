import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const COUPONS_COLLECTION = 'coupons';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

// GET - Get all coupons (admin) or validate a coupon code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const orderAmount = parseFloat(searchParams.get('orderAmount') || '0');

    if (code) {
      // Validate a specific coupon code
      const snapshot = await adminDb
        .collection(COUPONS_COLLECTION)
        .where('code', '==', code.toUpperCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
      }

      const couponDoc = snapshot.docs[0];
      const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;

      // Check if coupon is active
      if (!coupon.isActive) {
        return NextResponse.json({ valid: false, error: 'This coupon is no longer active' });
      }

      // Check expiration
      if (coupon.expiresAt) {
        const expiryDate = coupon.expiresAt instanceof Date 
          ? coupon.expiresAt 
          : new Date((coupon.expiresAt as unknown as { toDate: () => Date }).toDate?.() || coupon.expiresAt);
        if (expiryDate < new Date()) {
          return NextResponse.json({ valid: false, error: 'This coupon has expired' });
        }
      }

      // Check usage limit
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' });
      }

      // Check minimum order amount
      if (orderAmount < coupon.minOrderAmount) {
        return NextResponse.json({ 
          valid: false, 
          error: `Minimum order amount is ${coupon.minOrderAmount} EGP` 
        });
      }

      // Calculate discount
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (orderAmount * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }

      return NextResponse.json({
        valid: true,
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount: Math.min(discount, orderAmount),
        },
      });
    }

    // Get all coupons (admin)
    const snapshot = await adminDb
      .collection(COUPONS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const coupons = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error with coupons:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// POST - Create a new coupon (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'code, type, and value are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingSnapshot = await adminDb
      .collection(COUPONS_COLLECTION)
      .where('code', '==', code.toUpperCase())
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    const couponData = {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUses: Number(maxUses) || 0, // 0 = unlimited
      usedCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(COUPONS_COLLECTION).add(couponData);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

// PUT - Update coupon or apply coupon usage
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code, action, ...updateData } = body;

    if (action === 'use' && code) {
      // Increment usage count
      const snapshot = await adminDb
        .collection(COUPONS_COLLECTION)
        .where('code', '==', code.toUpperCase())
        .limit(1)
        .get();

      if (!snapshot.empty) {
        await adminDb.collection(COUPONS_COLLECTION).doc(snapshot.docs[0].id).update({
          usedCount: FieldValue.increment(1),
        });
      }
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await adminDb.collection(COUPONS_COLLECTION).doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE - Delete a coupon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await adminDb.collection(COUPONS_COLLECTION).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
