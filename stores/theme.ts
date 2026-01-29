import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  logoText: string;
  tagline: string;
}

interface ThemeState {
  settings: ThemeSettings;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: ThemeSettings = {
  primaryColor: '#10b981',
  accentColor: '#34d399',
  backgroundColor: '#09090b',
  textColor: '#ffffff',
  fontFamily: 'Inter',
  borderRadius: '0.75rem',
  logoText: 'ZEN LOCAL BRAND',
  tagline: 'Premium Streetwear Collection',
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      resetToDefaults: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'zen-theme-storage',
    }
  )
);
