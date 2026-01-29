import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser, getUser, updateUser } from '@/lib/db-service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  initialize: () => void;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      initialized: false,

      initialize: () => {
        // Auth state is managed by onAuthStateChanged listener
        // This function ensures the listener is set up
        if (typeof window !== 'undefined' && !get().initialized) {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            set({
              user,
              isAuthenticated: !!user,
              initialized: true,
            });
          });
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName });
          
          // Send verification email
          await sendEmailVerification(userCredential.user);
          
          // Create user in Firestore
          await createUser(userCredential.user.uid, {
            email,
            displayName,
            emailVerified: false,
          });
          
          set({
            user: userCredential.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          let errorMessage = 'Failed to create account';
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email is already registered';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters';
          }
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Update last login in Firestore
          await updateUser(userCredential.user.uid, {
            lastLogin: new Date() as any,
          });
          
          set({
            user: userCredential.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          let errorMessage = 'Failed to sign in';
          if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later';
          }
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          
          // Create or update user in Firestore
          const existingUser = await getUser(userCredential.user.uid);
          if (!existingUser) {
            await createUser(userCredential.user.uid, {
              email: userCredential.user.email || '',
              displayName: userCredential.user.displayName || '',
              photoURL: userCredential.user.photoURL || '',
            });
          } else {
            await updateUser(userCredential.user.uid, {
              lastLogin: new Date() as any,
            });
          }
          
          set({
            user: userCredential.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          let errorMessage = 'Failed to sign in with Google';
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup was blocked. Please allow popups for this site';
          }
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await firebaseSignOut(auth);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Failed to sign out', isLoading: false });
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
        } catch (error: any) {
          let errorMessage = 'Failed to send reset email';
          if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
          }
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      sendVerificationEmail: async () => {
        const { user } = get();
        if (!user) {
          throw new Error('No user logged in');
        }
        
        set({ isLoading: true, error: null });
        try {
          await sendEmailVerification(user);
          set({ isLoading: false });
        } catch (error: any) {
          let errorMessage = 'Failed to send verification email';
          if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many requests. Please try again later';
          }
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      updateUserProfile: async (displayName: string) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true });
        try {
          await updateProfile(user, { displayName });
          await updateUser(user.uid, { displayName });
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to update profile', isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: User | null) => set({
        user,
        isAuthenticated: !!user,
      }),
      
      setInitialized: (initialized: boolean) => set({ initialized }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({}), // Don't persist user data, let Firebase handle it
    }
  )
);

// Initialize auth state listener
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setInitialized(true);
  });
}
