'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

// Sample products
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Urban Stealth Hoodie',
    slug: 'urban-stealth-hoodie',
    description: 'Premium quality hoodie',
    price: 89.99,
    comparePrice: 129.99,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'],
    category: 'Hoodies',
    stock: 50,
    status: 'active',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Midnight Runner Tee',
    slug: 'midnight-runner-tee',
    description: 'Comfortable oversized t-shirt',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'],
    category: 'T-Shirts',
    stock: 100,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Tech Cargo Pants',
    slug: 'tech-cargo-pants',
    description: 'Functional cargo pants',
    price: 119.99,
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200'],
    category: 'Pants',
    stock: 30,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Shadow Cap',
    slug: 'shadow-cap',
    description: 'Minimalist cap',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200'],
    category: 'Accessories',
    stock: 0,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Product deleted');
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-zinc-400">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </Link>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {selectedProducts.length > 0 && (
          <Button
            variant="danger"
            onClick={() => {
              setProducts((prev) =>
                prev.filter((p) => !selectedProducts.includes(p.id))
              );
              setSelectedProducts([]);
              toast.success(`${selectedProducts.length} products deleted`);
            }}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete ({selectedProducts.length})
          </Button>
        )}
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Product</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Category</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Price</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-xs text-zinc-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300">{product.category}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{formatPrice(product.price)}</p>
                        {product.comparePrice && (
                          <p className="text-xs text-zinc-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${
                        product.stock === 0 ? 'text-red-400' :
                        product.stock < 10 ? 'text-yellow-400' : 'text-zinc-300'
                      }`}>
                        {product.stock === 0 ? 'Out of stock' : product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-zinc-400" />
                        </button>
                        
                        {activeMenu === product.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-10 w-40 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 overflow-hidden z-10"
                          >
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 w-full"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No products found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
