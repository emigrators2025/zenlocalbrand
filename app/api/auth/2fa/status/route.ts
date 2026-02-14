import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { SiteSettings } from '@/types/settings';

const USERS_COLLECTION = 'users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const settingsSnap = await adminDb
      .collection('settings')
      .doc('site_settings')
      .get();
    const settings = settingsSnap.data() as Partial<SiteSettings> | undefined;
    const enforceEmail2FA = settings?.enforceEmail2FA ?? true;

    if (enforceEmail2FA) {
      return NextResponse.json({ twoFactorEnabled: true });
    }

    if (!userId) {
      return NextResponse.json({ twoFactorEnabled: true });
    }

    // Get user directly from adminDb
    const userDoc = await adminDb.collection(USERS_COLLECTION).doc(userId).get();
    const user = userDoc.exists ? userDoc.data() : null;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled ?? true, // Default to true for security
    });
  } catch (error: unknown) {
    console.error('Error checking 2FA status:', error);
    const message = error instanceof Error ? error.message : 'Failed to check 2FA status';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
