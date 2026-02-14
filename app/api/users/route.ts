import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const USERS_COLLECTION = 'users';

// GET - Get user by ID or all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get single user
      const userDoc = await adminDb.collection(USERS_COLLECTION).doc(userId).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const userData = userDoc.data();
      return NextResponse.json({
        user: {
          ...userData,
          createdAt: userData?.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: userData?.updatedAt?.toDate?.()?.toISOString() || null,
          lastLogin: userData?.lastLogin?.toDate?.()?.toISOString() || null,
        },
      });
    }

    // Get all users
    const snapshot = await adminDb
      .collection(USERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, displayName, photoURL, emailVerified } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    const userData = {
      id: userId,
      email,
      displayName: displayName || '',
      photoURL: photoURL || null,
      emailVerified: emailVerified || false,
      phone: '',
      address: null,
      isSubscribed: false,
      orderCount: 0,
      totalSpent: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection(USERS_COLLECTION).doc(userId).set(userData);

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Handle special actions
    if (action === 'disable') {
      await adminDb.collection(USERS_COLLECTION).doc(userId).update({
        disabled: true,
        disabledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, message: 'Account disabled' });
    }

    if (action === 'enable') {
      await adminDb.collection(USERS_COLLECTION).doc(userId).update({
        disabled: false,
        disabledAt: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, message: 'Account enabled' });
    }

    // Remove undefined values and add updatedAt
    const cleanData: Record<string, unknown> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });
    cleanData.updatedAt = FieldValue.serverTimestamp();

    // Handle lastLogin conversion
    if (cleanData.lastLogin) {
      cleanData.lastLogin = FieldValue.serverTimestamp();
    }

    await adminDb.collection(USERS_COLLECTION).doc(userId).update(cleanData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await adminDb.collection(USERS_COLLECTION).doc(userId).delete();

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
