import { create } from 'zustand';
import { Product } from '@/types';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  approveProduct: (id: string) => Promise<void>;
  getApprovedProducts: () => Product[];
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      const formattedProducts = data.products.map((p: Product & { createdAt: string; updatedAt: string }) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })) as Product[];
      set({ products: formattedProducts, isLoading: false });
    } catch (error) {
      console.error('Failed to load products:', error);
      set({ error: 'Failed to load products', isLoading: false });
    }
  },

  addProduct: async (product) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          category: product.category,
          images: product.images,
          sizes: product.sizes || [],
          colors: product.colors || [],
          stock: product.stock || 0,
          status: product.status || 'draft',
          featured: product.featured || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      // Reload products from API
      await get().loadProducts();
    } catch (error) {
      console.error('Failed to add product:', error);
      set({ error: 'Failed to add product', isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { createdAt, updatedAt, ...rest } = data;
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...rest }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      // Reload products from API
      await get().loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
      set({ error: 'Failed to update product', isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      // Update local state immediately
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete product:', error);
      set({ error: 'Failed to delete product', isLoading: false });
      throw error;
    }
  },

  approveProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'active' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve product');
      }

      // Update local state
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, status: 'active' as const, updatedAt: new Date() } : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to approve product:', error);
      set({ error: 'Failed to approve product', isLoading: false });
      throw error;
    }
  },

  getApprovedProducts: () => {
    return get().products.filter((p) => p.status === 'active');
  },
}));

