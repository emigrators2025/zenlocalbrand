import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { adminSession } from '@/lib/admin-session';

interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
  signingKeyVerified: boolean;
  adminEmail: string | null;
  loginTime: number | null;
  lastActivity: number | null;
  
  // Actions
  login: (token: string) => void;
  setAdminEmail: (email: string | null) => void;
  logout: () => void;
  verifySigningKey: (key: string) => boolean;
  grantEmailAdminAccess: (email: string) => void;
  updateActivity: () => void;
  checkAndLogoutIfInactive: () => boolean;
  getSessionInfo: () => { loginTime: number | null; lastActivity: number | null; remainingTime: number };
}

const CORRECT_SIGNING_KEY = 'ZEN-2026-ADMIN-KEY-X9K4M2P7Q3R8L5N1';

const createSessionToken = () =>
  btoa(`ZEN-ADMIN-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      signingKeyVerified: false,
      adminEmail: null,
      loginTime: null,
      lastActivity: null,

      login: (token) => {
        const now = Date.now();
        adminSession.startSession();
        set({ 
          isAuthenticated: true, 
          token,
          loginTime: now,
          lastActivity: now,
        });
      },

      setAdminEmail: (email) => set({ adminEmail: email }),

      logout: () => {
        adminSession.endSession();
        set({
          isAuthenticated: false,
          token: null,
          signingKeyVerified: false,
          adminEmail: null,
          loginTime: null,
          lastActivity: null,
        });
      },

      verifySigningKey: (key) => {
        const isValid = key === CORRECT_SIGNING_KEY;
        if (isValid) {
          const now = Date.now();
          adminSession.startSession();
          set({ 
            signingKeyVerified: true,
            loginTime: now,
            lastActivity: now,
          });
        }
        return isValid;
      },

      grantEmailAdminAccess: (email: string) => {
        const now = Date.now();
        adminSession.startSession();
        set({
          isAuthenticated: true,
          signingKeyVerified: true,
          token: createSessionToken(),
          adminEmail: email,
          loginTime: now,
          lastActivity: now,
        });
      },

      updateActivity: () => {
        adminSession.updateActivity();
        set({ lastActivity: Date.now() });
      },

      checkAndLogoutIfInactive: () => {
        const state = get();
        if (!state.isAuthenticated || !state.signingKeyVerified) {
          return false;
        }

        if (adminSession.isSessionExpired()) {
          // Auto logout due to inactivity
          adminSession.endSession();
          set({
            isAuthenticated: false,
            token: null,
            signingKeyVerified: false,
            adminEmail: null,
            loginTime: null,
            lastActivity: null,
          });
          return true; // Session was expired
        }
        return false;
      },

      getSessionInfo: () => {
        const state = get();
        return {
          loginTime: state.loginTime,
          lastActivity: state.lastActivity,
          remainingTime: adminSession.getRemainingTime(),
        };
      },
    }),
    {
      name: 'zen-admin-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist everything to keep admin signed in
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        signingKeyVerified: state.signingKeyVerified,
        adminEmail: state.adminEmail,
        loginTime: state.loginTime,
        lastActivity: state.lastActivity,
      }),
    }
  )
);
