import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const REVIEWS_COLLECTION = 'reviews';
const PRODUCTS_COLLECTION = 'products';

// GET - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Fetch reviews for the product (avoid complex index by filtering in memory)
    let reviews: Record<string, unknown>[] = [];
    
    try {
      // Try with index first
      const snapshot = await adminDb
        .collection(REVIEWS_COLLECTION)
        .where('productId', '==', productId)
        .where('status', '==', 'approved')
        .orderBy('createdAt', 'desc')
        .get();

      reviews = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        } as Record<string, unknown>;
      });
    } catch (indexError) {
      console.log('Index not available, using fallback query for reviews');
      // Fallback: fetch by productId only and filter in memory
      const snapshot = await adminDb
        .collection(REVIEWS_COLLECTION)
        .where('productId', '==', productId)
        .get();

      reviews = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          } as Record<string, unknown>;
        })
        .filter(r => r.status === 'approved')
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
          return dateB - dateA;
        });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r: Record<string, unknown>) => sum + (r.rating as number || 0), 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return NextResponse.json({ 
      reviews, 
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length 
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, userEmail, rating, title, comment } = body;

    if (!productId || !userId || !rating) {
      return NextResponse.json(
        { error: 'productId, userId, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await adminDb
      .collection(REVIEWS_COLLECTION)
      .where('productId', '==', productId)
      .where('userId', '==', userId)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    const reviewData = {
      productId,
      userId,
      userName: userName || 'Anonymous',
      userEmail: userEmail || '',
      rating: Number(rating),
      title: title || '',
      comment: comment || '',
      status: 'approved', // Auto-approve for now, can add moderation later
      helpful: 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(REVIEWS_COLLECTION).add(reviewData);
    
    // Update product average rating
    await updateProductRating(productId);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

// PUT - Mark review as helpful
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, action } = body;

    if (!reviewId || action !== 'helpful') {
      return NextResponse.json({ error: 'reviewId and action are required' }, { status: 400 });
    }

    await adminDb.collection(REVIEWS_COLLECTION).doc(reviewId).update({
      helpful: FieldValue.increment(1),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// Helper to update product average rating
async function updateProductRating(productId: string) {
  try {
    // Simple query without composite index
    const snapshot = await adminDb
      .collection(REVIEWS_COLLECTION)
      .where('productId', '==', productId)
      .get();

    const reviews = snapshot.docs
      .map((doc) => doc.data())
      .filter(r => r.status === 'approved');
      
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await adminDb.collection(PRODUCTS_COLLECTION).doc(productId).update({
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}
