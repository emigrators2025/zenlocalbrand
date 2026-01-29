import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await getUser(userId);

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
