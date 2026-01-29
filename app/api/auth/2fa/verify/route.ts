import { NextRequest, NextResponse } from 'next/server';

// Access the global store
declare global {
  var twoFactorCodes: Map<string, { code: string; expires: number; email: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and code are required' },
        { status: 400 }
      );
    }

    // Get stored code
    const storedData = global.twoFactorCodes?.get(userId);

    if (!storedData) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (storedData.expires < Date.now()) {
      global.twoFactorCodes.delete(userId);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Normalize code (remove dashes and convert to uppercase)
    const normalizedInput = code.replace(/-/g, '').toUpperCase();
    const normalizedStored = storedData.code.toUpperCase();

    // Verify code
    if (normalizedInput !== normalizedStored) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Code is valid - delete it so it can't be reused
    global.twoFactorCodes.delete(userId);

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
    });
  } catch (error: unknown) {
    console.error('Error verifying 2FA code:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify code';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
