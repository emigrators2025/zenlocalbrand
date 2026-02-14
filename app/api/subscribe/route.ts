import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const subscribersRef = adminDb.collection('subscribers');
    
    // Check if already subscribed
    const existingSnapshot = await subscribersRef
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { message: 'You are already subscribed!' },
        { status: 200 }
      );
    }

    // Add new subscriber
    await subscribersRef.add({
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      source: 'homepage',
      active: true,
    });

    // Also update user record if they have an account
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        isSubscribed: true,
        subscribedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully subscribed!' 
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subscribersSnapshot = await adminDb.collection('subscribers')
      .where('active', '==', true)
      .orderBy('subscribedAt', 'desc')
      .get();

    const subscribers = subscribersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ 
      subscribers,
      count: subscribers.length 
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
