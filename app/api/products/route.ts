import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const PRODUCTS_COLLECTION = 'products';

// GET - Fetch all products
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection(PRODUCTS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      category,
      images,
      sizes,
      colors,
      stock,
      status,
      featured,
    } = body;

    if (!name || !slug || !category || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const productData = {
      name,
      slug,
      description: description || '',
      price: price || 0,
      comparePrice: comparePrice || 0,
      category,
      images,
      sizes: sizes || [],
      colors: colors || [],
      stock: stock || 0,
      status: status || 'draft',
      featured: featured || false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(PRODUCTS_COLLECTION).add(productData);
    await docRef.update({ id: docRef.id });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Remove undefined fields and add timestamp
    const cleanData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && key !== 'createdAt' && key !== 'updatedAt') {
        cleanData[key] = value;
      }
    }

    await adminDb.collection(PRODUCTS_COLLECTION).doc(id).update(cleanData);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await adminDb.collection(PRODUCTS_COLLECTION).doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
