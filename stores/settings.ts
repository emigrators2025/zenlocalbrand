import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSettings, updateSettings, initializeSettings, DBSettings } from '@/lib/db-service';

interface SettingsState {
  settings: DBSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  saveSettings: (data: Partial<DBSettings>) => Promise<void>;
  initSettings: () => Promise<void>;
}

const defaultSettings: DBSettings = {
  siteName: 'ZEN LOCAL BRAND',
  tagline: 'Premium Streetwear Collection',
  description: 'Elevate your style with our exclusive collection of premium streetwear.',
  email: 'support@zenlocalbrand.shop',
  phone: '+201062137061',
  address: 'Cairo, Egypt',
  socialLinks: {
    instagram: 'https://www.instagram.com/zen.local_brand/',
    twitter: '',
    facebook: '',
    tiktok: '',
  },
  heroTitle: 'ZEN LOCAL BRAND',
  heroSubtitle: 'Elevate your style with our exclusive collection of premium streetwear. Designed for those who dare to stand out.',
  heroButtonText: 'Shop Now',
  aboutTitle: 'Our Story',
  aboutContent: 'Founded in 2026, ZEN LOCAL BRAND was born from a passion for creating high-quality streetwear that combines comfort with cutting-edge design.',
  footerText: ' 2026 ZEN LOCAL BRAND. All rights reserved.',
  announcementBar: '🚚 Free shipping on orders over 1500 EGP!',
  primaryColor: '#10b981',
  accentColor: '#34d399',
  currency: 'EGP',
  taxRate: 0,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,

      loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const settings = await getSettings();
          set({ settings: settings || defaultSettings, isLoading: false });
        } catch (error) {
          console.error('Error loading settings:', error);
          set({ error: 'Failed to load settings', isLoading: false });
        }
      },

      saveSettings: async (data: Partial<DBSettings>) => {
        set({ isLoading: true, error: null });
        try {
          await updateSettings(data);
          const current = get().settings;
          set({
            settings: current ? { ...current, ...data } : { ...defaultSettings, ...data },
            isLoading: false,
          });
        } catch (error) {
          console.error('Error saving settings:', error);
          set({ error: 'Failed to save settings', isLoading: false });
          throw error;
        }
      },

      initSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const settings = await initializeSettings();
          set({ settings, isLoading: false });
        } catch (error) {
          console.error('Error initializing settings:', error);
          set({ error: 'Failed to initialize settings', isLoading: false });
        }
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
