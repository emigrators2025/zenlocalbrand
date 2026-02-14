'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { WishlistButton } from './wishlist-button';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                className="p-3 bg-emerald-500 rounded-full text-white shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>
              <WishlistButton 
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  images: product.images,
                }} 
              />
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-lg">
                  Featured
                </span>
              )}
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg">
                  Sale
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-lg">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-zinc-500 line-through text-sm">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
