import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
  signingKeyVerified: boolean;
  login: (token: string) => void;
  logout: () => void;
  verifySigningKey: (key: string) => boolean;
}

const CORRECT_SIGNING_KEY = 'ZEN-2026-ADMIN-KEY-X9K4M2P7Q3R8L5N1';

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      signingKeyVerified: false,
      login: (token) => set({ isAuthenticated: true, token }),
      logout: () => set({ isAuthenticated: false, token: null, signingKeyVerified: false }),
      verifySigningKey: (key) => {
        const isValid = key === CORRECT_SIGNING_KEY;
        if (isValid) {
          set({ signingKeyVerified: true });
        }
        return isValid;
      },
    }),
    {
      name: 'zen-admin-storage',
    }
  )
);
