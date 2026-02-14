import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_SITE_SETTINGS } from '@/lib/default-settings';
import type { SiteSettings } from '@/types/settings';

const COLLECTION = 'settings';
const DOC_ID = 'site_settings';
const CURRENCY_CODE = 'EGP';

// GET - Fetch site settings
export async function GET() {
  try {
    const docRef = adminDb.collection(COLLECTION).doc(DOC_ID);
    const snapshot = await docRef.get();
    
    if (!snapshot.exists) {
      // Initialize with defaults if not exists
      await docRef.set(DEFAULT_SITE_SETTINGS);
      return NextResponse.json({ settings: { ...DEFAULT_SITE_SETTINGS, currency: CURRENCY_CODE } });
    }
    
    const data = snapshot.data() as SiteSettings | undefined;
    const merged = { ...DEFAULT_SITE_SETTINGS, ...(data || {}), currency: CURRENCY_CODE };
    
    return NextResponse.json({ settings: merged });
  } catch (error) {
    console.error('Failed to fetch settings', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<SiteSettings> | null;
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const docRef = adminDb.collection(COLLECTION).doc(DOC_ID);
    const sanitizedPayload: Partial<SiteSettings> = {
      ...payload,
      currency: CURRENCY_CODE,
    };

    await docRef.set(sanitizedPayload, { merge: true });
    const snapshot = await docRef.get();
    const data = snapshot.data() as SiteSettings | undefined;
    const merged = { ...DEFAULT_SITE_SETTINGS, ...(data || {}), currency: CURRENCY_CODE };

    return NextResponse.json({ success: true, settings: merged });
  } catch (error) {
    console.error('Failed to update settings', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
