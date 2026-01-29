import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserLogin {
  id: string;
  email?: string;
  name?: string;
  ip: string;
  location?: string;
  device: string;
  browser: string;
  timestamp: Date;
  isRegistered: boolean;
}

interface UsersState {
  logins: UserLogin[];
  addLogin: (login: Omit<UserLogin, 'id' | 'timestamp'>) => void;
  clearOldLogins: (days: number) => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      logins: [],
      
      addLogin: (login) => {
        const newLogin: UserLogin = {
          ...login,
          id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          logins: [newLogin, ...state.logins].slice(0, 1000) // Keep last 1000 logins
        }));
      },
      
      clearOldLogins: (days) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        set((state) => ({
          logins: state.logins.filter(l => new Date(l.timestamp) > cutoff)
        }));
      },
    }),
    {
      name: 'zen-users-storage',
    }
  )
);
