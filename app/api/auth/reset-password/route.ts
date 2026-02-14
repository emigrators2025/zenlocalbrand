import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';

const BRAND_NAME = 'zen local brand';
const BRAND_TAGLINE = 'premium streetwear collective';
const resetRedirectUrl = process.env.NEXT_PUBLIC_RESET_REDIRECT_URL || 'https://zenlocalbrand.shop';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let resetLink: string;
    try {
      resetLink = await adminAuth.generatePasswordResetLink(email, {
        url: resetRedirectUrl,
        handleCodeInApp: false,
      });
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'auth/user-not-found') {
        // Avoid leaking which emails exist
        return NextResponse.json({ success: true });
      }
      throw error;
    }

    const html = `
    <div style="font-family: 'Space Grotesk', 'Segoe UI', sans-serif; background: #020617; padding: 40px 16px; color: #e2e8f0;">
      <table width="100%" style="max-width: 680px; margin: 0 auto; border-spacing: 0; background: linear-gradient(135deg, #020617 0%, #0f172a 60%, #020617 100%); border: 1px solid #1e1b4b; border-radius: 28px; overflow: hidden;">
        <tr>
          <td style="padding: 48px 48px 16px; text-align: center;">
            <div style="display: inline-block; padding: 10px 28px; border: 1px solid rgba(226, 232, 240, 0.2); border-radius: 999px; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #a5b4fc;">
              ${BRAND_NAME}
            </div>
            <h1 style="margin: 24px 0 8px; font-size: 34px; color: #f8fafc; letter-spacing: -0.04em;">Reset your password</h1>
            <p style="margin: 0; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4em; font-size: 11px;">
              ${BRAND_TAGLINE}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 48px 40px;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 24px; padding: 32px;">
              <p style="margin: 0 0 24px; color: #cbd5f5; line-height: 1.7;">
                Someone requested to update the password for your ${BRAND_NAME} account. Tap the button below within the next hour to secure your access.
              </p>
              <p style="text-align: center; margin: 0 0 30px;">
                <a href="${resetLink}" style="display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 42px; border-radius: 999px; background: linear-gradient(120deg, #a855f7, #ec4899, #f97316); color: #020617; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none;">
                  reset password
                </a>
              </p>
              <div style="border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 22px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                <p style="margin: 0 0 12px;">Link not working? Paste this fallback URL in your browser:</p>
                <p style="margin: 0; color: #38bdf8; word-break: break-all;">${resetLink}</p>
              </div>
            </div>
            <div style="margin-top: 32px; padding: 18px 24px; border-radius: 20px; background: rgba(12, 10, 24, 0.9); border: 1px solid rgba(168, 85, 247, 0.2); color: #c4b5fd; font-size: 13px; line-height: 1.6;">
              If you did not request this change, ignore this email and your password will stay the same. For support, contact support@zenlocalbrand.shop.
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 48px 48px; text-align: center; color: #475569; font-size: 12px;">
            © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved · Cairo, Egypt
          </td>
        </tr>
      </table>
    </div>
    `;

    const text = `We received a password reset request for your ${BRAND_NAME} account. Use the link below to choose a new password:

${resetLink}

If you didn't request this, please ignore this email.`;

    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset your password',
      text,
      html,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Failed to send reset email');
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Reset password email error:', error);
    const message = error instanceof Error ? error.message : 'Unable to send reset email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
