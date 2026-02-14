import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SITE_SETTINGS } from '@/lib/default-settings';
import type { SiteSettings } from '@/types/settings';

type DBSettings = SiteSettings;

interface SettingsState {
  settings: DBSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  saveSettings: (data: Partial<DBSettings>) => Promise<void>;
  initSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SITE_SETTINGS,
      isLoading: false,
      error: null,

      loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/settings');
          if (!response.ok) throw new Error('Failed to fetch settings');
          const result = await response.json();
          set({
            settings: result.settings ? { ...DEFAULT_SITE_SETTINGS, ...result.settings } : DEFAULT_SITE_SETTINGS,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error loading settings:', error);
          set({ error: 'Failed to load settings', isLoading: false });
        }
      },

      saveSettings: async (data: Partial<DBSettings>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`Failed to save settings (${response.status})`);
          }

          const result = await response.json();
          const updated = result?.settings as DBSettings | undefined;
          const fallback = get().settings;

          set({
            settings: updated || (fallback ? { ...fallback, ...data } : { ...DEFAULT_SITE_SETTINGS, ...data }),
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
          const response = await fetch('/api/admin/settings');
          if (!response.ok) throw new Error('Failed to initialize settings');
          const result = await response.json();
          set({ settings: result.settings ? { ...DEFAULT_SITE_SETTINGS, ...result.settings } : DEFAULT_SITE_SETTINGS, isLoading: false });
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
