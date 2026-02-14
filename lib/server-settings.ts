'use server';

import 'server-only';
import type { SiteSettings } from '@/types/settings';
import { adminDb } from './firebase-admin';
import { DEFAULT_SITE_SETTINGS } from './default-settings';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'site_settings';

export async function getPublicSettings(): Promise<SiteSettings> {
  try {
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return DEFAULT_SITE_SETTINGS;
    }

    const data = snapshot.data() as Partial<SiteSettings>;
    const merged = { ...DEFAULT_SITE_SETTINGS, ...data } as SiteSettings;

    return {
      ...merged,
      primaryColor: DEFAULT_SITE_SETTINGS.primaryColor,
      accentColor: DEFAULT_SITE_SETTINGS.accentColor,
      backgroundColor: DEFAULT_SITE_SETTINGS.backgroundColor,
      textColor: DEFAULT_SITE_SETTINGS.textColor,
      fontFamily: DEFAULT_SITE_SETTINGS.fontFamily,
      borderRadius: DEFAULT_SITE_SETTINGS.borderRadius,
    };
  } catch (error) {
    console.error('Failed to load public settings', error);
    return DEFAULT_SITE_SETTINGS;
  }
}
