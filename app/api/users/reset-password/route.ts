import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';

// POST - Send password reset email to user
export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a reset token (in production, you'd store this in the database)
    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://zenlocalbrand.shop'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send the password reset email
    const result = await sendPasswordResetEmail(email, userName || 'User', resetLink);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset email sent successfully' 
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}
