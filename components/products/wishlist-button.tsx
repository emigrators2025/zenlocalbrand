"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
  className?: string;
  iconSize?: number;
}

export function WishlistButton({ product, className = "", iconSize = 20 }: WishlistButtonProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  
  const isWishlisted = isInWishlist(product.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast.error("Please sign in to save items");
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(user.uid, product.id);
      toast.success("Removed from wishlist");
    } else {
      await addToWishlist(user.uid, {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
      });
      toast.success("Added to wishlist");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all duration-200 ${
        isWishlisted
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
      } ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`transition-all ${isWishlisted ? "fill-current" : ""}`}
        size={iconSize}
      />
    </button>
  );
}
