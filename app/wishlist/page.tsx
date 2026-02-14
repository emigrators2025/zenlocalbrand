"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { items, isLoading, loadWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (user) {
      loadWishlist(user.uid);
    }
  }, [user, loadWishlist]);

  const handleAddToCart = (item: typeof items[0]) => {
    // Create a Product object from the wishlist item
    const product = {
      id: item.productId,
      name: item.name,
      slug: item.slug,
      description: '',
      price: item.price,
      images: item.images,
      category: '',
      stock: 1,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addItem(product);
  };

  const handleRemove = (productId: string) => {
    if (user) {
      removeFromWishlist(user.uid, productId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Your Wishlist</h1>
          <p className="text-gray-400 mb-6">Please sign in to view your wishlist</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            My Wishlist
          </h1>
          <p className="text-gray-400">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Heart className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-400 mb-6">
              Save items you love by clicking the heart icon
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group"
                >
                  <Link href={`/products/${item.slug}`}>
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="text-white font-semibold mb-1 hover:text-emerald-400 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-emerald-400 font-bold mb-4">
                      {item.price.toLocaleString()} EGP
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 bg-emerald-500 text-black py-2 rounded-lg font-semibold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="p-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
