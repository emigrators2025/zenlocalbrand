import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const WISHLIST_COLLECTION = 'wishlists';

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const wishlistDoc = await adminDb.collection(WISHLIST_COLLECTION).doc(userId).get();
    
    if (!wishlistDoc.exists) {
      return NextResponse.json({ items: [] });
    }

    const data = wishlistDoc.data();
    return NextResponse.json({ items: data?.items || [] });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, product } = body;

    if (!userId || !productId) {
      return NextResponse.json({ error: 'userId and productId are required' }, { status: 400 });
    }

    const wishlistRef = adminDb.collection(WISHLIST_COLLECTION).doc(userId);
    const wishlistDoc = await wishlistRef.get();

    if (!wishlistDoc.exists) {
      // Create new wishlist
      await wishlistRef.set({
        userId,
        items: [{
          productId,
          ...product,
          addedAt: new Date().toISOString(),
        }],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Add to existing wishlist if not already present
      const data = wishlistDoc.data();
      const existingItems = data?.items || [];
      const exists = existingItems.some((item: { productId: string }) => item.productId === productId);
      
      if (!exists) {
        await wishlistRef.update({
          items: [...existingItems, {
            productId,
            ...product,
            addedAt: new Date().toISOString(),
          }],
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'userId and productId are required' }, { status: 400 });
    }

    const wishlistRef = adminDb.collection(WISHLIST_COLLECTION).doc(userId);
    const wishlistDoc = await wishlistRef.get();

    if (wishlistDoc.exists) {
      const data = wishlistDoc.data();
      const existingItems = data?.items || [];
      const filteredItems = existingItems.filter(
        (item: { productId: string }) => item.productId !== productId
      );
      
      await wishlistRef.update({
        items: filteredItems,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
