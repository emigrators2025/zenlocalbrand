import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Generate a secure 12-character alphanumeric code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format as XXX-XXX-XXX-XXX for readability
  return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 9)}-${code.slice(9, 12)}`;
}

// In-memory store for 2FA codes (in production, use Redis or database)
// This will be shared across requests in the same server instance
declare global {
  var twoFactorCodes: Map<string, { code: string; expires: number; email: string }>;
}

if (!global.twoFactorCodes) {
  global.twoFactorCodes = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // Generate code
    const code = generateCode();
    const codeWithoutDashes = code.replace(/-/g, '');
    
    // Store code with 10-minute expiration
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    global.twoFactorCodes.set(userId, { code: codeWithoutDashes, expires, email });

    // Clean up expired codes
    for (const [key, value] of global.twoFactorCodes.entries()) {
      if (value.expires < Date.now()) {
        global.twoFactorCodes.delete(key);
      }
    }

    // Send email with proper formatting to avoid spam
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Security Code - ZEN LOCAL BRAND</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ZEN LOCAL BRAND</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Premium Streetwear</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">Security Verification Code</h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                You're receiving this email because a sign-in attempt was made to your ZEN LOCAL BRAND account. Enter the code below to complete your sign-in:
              </p>
              
              <!-- Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 24px; background-color: #f9fafb; border-radius: 12px; text-align: center; border: 2px dashed #d1d5db;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
                    <p style="margin: 0; color: #10b981; font-size: 36px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">${code}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                <strong style="color: #6b7280;">⏱️ This code expires in 10 minutes.</strong>
              </p>
              
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                If you didn't request this code, please ignore this email or contact our support team if you have concerns about your account security.
              </p>
            </td>
          </tr>
          
          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                      🔒 <strong>Security Tip:</strong> ZEN LOCAL BRAND will never ask for your password or full verification code via phone or email. Keep this code private.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #1f2937; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">ZEN LOCAL BRAND</p>
              <p style="margin: 0 0 16px; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Premium Streetwear Collection<br>
                Cairo, Egypt
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                📧 support@zenlocalbrand.shop | 📞 +201062137061
              </p>
              <hr style="border: none; border-top: 1px solid #374151; margin: 16px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 11px; line-height: 1.5;">
                This is an automated security message from ZEN LOCAL BRAND. You received this email because someone attempted to sign in to the account associated with ${email}.<br><br>
                © 2026 ZEN LOCAL BRAND. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const msg = {
      to: email,
      from: {
        email: 'support@zenlocalbrand.shop',
        name: 'ZEN LOCAL BRAND Security',
      },
      subject: `${code} is your ZEN LOCAL BRAND verification code`,
      text: `Your ZEN LOCAL BRAND verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nZEN LOCAL BRAND\nCairo, Egypt\nsupport@zenlocalbrand.shop`,
      html,
      // Additional headers to improve deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
      categories: ['2fa', 'security', 'verification'],
      asm: {
        groupId: 0, // Your unsubscribe group ID if you have one
      },
    };

    await sgMail.send(msg);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      expiresAt: expires,
    });
  } catch (error: unknown) {
    console.error('Error sending 2FA code:', error);
    const message = error instanceof Error ? error.message : 'Failed to send verification code';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
