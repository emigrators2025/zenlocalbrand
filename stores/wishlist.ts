import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  
  // Actions
  loadWishlist: (userId: string) => Promise<void>;
  addToWishlist: (userId: string, product: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeFromWishlist: (userId: string, productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      loadWishlist: async (userId: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/wishlist?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            set({ items: data.items || [] });
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addToWishlist: async (userId: string, product: Omit<WishlistItem, 'addedAt'>) => {
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId: product.productId, product }),
          });
          
          if (response.ok) {
            set((state) => ({
              items: [...state.items, { ...product, addedAt: new Date().toISOString() }],
            }));
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error);
        }
      },

      removeFromWishlist: async (userId: string, productId: string) => {
        try {
          const response = await fetch(`/api/wishlist?userId=${userId}&productId=${productId}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            set((state) => ({
              items: state.items.filter((item) => item.productId !== productId),
            }));
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
