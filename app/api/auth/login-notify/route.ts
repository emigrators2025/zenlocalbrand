import { NextRequest, NextResponse } from 'next/server';
import { sendLoginAlert } from '@/lib/email';

const ALLOWED_STATUSES = ['success', 'failed', '2fa_required'] as const;
type LoginStatus = (typeof ALLOWED_STATUSES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { email, status, reason, userId, isAdmin } = body as {
      email?: string;
      status?: LoginStatus;
      reason?: string;
      userId?: string;
      isAdmin?: boolean;
    };

    if (!email || !status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Email and valid status are required' }, { status: 400 });
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const realIp = request.headers.get('x-real-ip') || '';
    const clientIp =
      forwardedFor.split(',')[0]?.trim() ||
      realIp.trim() ||
      'Unknown';
    const countryCode =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      'Unknown';
    const city = request.headers.get('x-vercel-ip-city') || request.headers.get('cf-ipcity') || null;
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    await sendLoginAlert({
      email,
      status,
      ipAddress: clientIp,
      countryCode,
      city,
      userAgent,
      reason,
      userId,
      isAdmin,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send login alert', error);
    return NextResponse.json({ error: 'Failed to send login alert' }, { status: 500 });
  }
}
