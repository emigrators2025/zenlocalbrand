'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Package, Search, Filter, Grid, List, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { useProductsStore } from '@/stores/products';

const categories = ['All', 'Hoodies', 'T-Shirts', 'Pants', 'Jackets', 'Accessories', 'Shoes'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

const priceRanges = [
  { value: 'all', label: 'All Prices', min: 0, max: Infinity },
  { value: 'under-500', label: 'Under 500 EGP', min: 0, max: 500 },
  { value: '500-1000', label: '500 - 1000 EGP', min: 500, max: 1000 },
  { value: '1000-2000', label: '1000 - 2000 EGP', min: 1000, max: 2000 },
  { value: 'over-2000', label: 'Over 2000 EGP', min: 2000, max: Infinity },
];

export default function ProductsPage() {
  const { products, isLoading, loadProducts } = useProductsStore();
  const activeProducts = products.filter(p => p.status === 'active');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  // Load products from Firestore on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    // Get price range from selection
    const priceFilter = priceRanges.find(p => p.value === selectedPriceRange) || priceRanges[0];
    let filtered = activeProducts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceFilter.min && p.price <= priceFilter.max);

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [activeProducts, searchTerm, selectedCategory, sortBy, selectedPriceRange]);

  // Count active filters
  const activeFilterCount = [
    searchTerm ? 1 : 0,
    selectedCategory !== 'All' ? 1 : 0,
    selectedPriceRange !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedPriceRange('all');
    setSortBy('newest');
  };

  if (isLoading && products.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Collection</h1>
          <p className="text-gray-400">
            {activeProducts.length > 0
              ? `Showing ${filteredProducts.length} of ${activeProducts.length} products`
              : 'Browse our premium streetwear collection'}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* View Toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-emerald-500 text-black' : 'hover:bg-zinc-800'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-emerald-500 text-black' : 'hover:bg-zinc-800'}`}
            >
              <List size={20} />
            </button>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
            >
              <X size={18} />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black'
                  : 'bg-zinc-900 border border-zinc-800 hover:border-emerald-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        {activeProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
              <Package className="text-gray-600" size={64} />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We are currently preparing our collection. Check back soon for amazing streetwear!
            </p>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg"
              >
                Back to Home
              </motion.button>
            </Link>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
              <Search className="text-gray-600" size={40} />
            </div>
            <h2 className="text-xl font-bold mb-4">No Products Found</h2>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link href={`/products/${product.slug}`}>
                    {viewMode === 'grid' ? (
                      <div className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300">
                        <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-gray-600" size={48} />
                            </div>
                          )}
                          {product.featured && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-black text-xs font-medium rounded">
                              Featured
                            </div>
                          )}
                          {product.comparePrice && product.comparePrice > product.price && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold truncate group-hover:text-emerald-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{product.category}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-emerald-400 font-bold">{product.price} EGP</span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="text-gray-500 line-through text-sm">{product.comparePrice} EGP</span>
                            )}
                          </div>
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {product.sizes.slice(0, 4).map(size => (
                                <span key={size} className="text-xs px-2 py-0.5 bg-zinc-800 rounded">
                                  {size}
                                </span>
                              ))}
                              {product.sizes.length > 4 && (
                                <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded">
                                  +{product.sizes.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="group flex bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300">
                        <div className="w-32 h-32 bg-zinc-800 flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-gray-600" size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-400 text-sm">{product.category}</p>
                            {product.sizes && product.sizes.length > 0 && (
                              <p className="text-gray-500 text-xs mt-1">
                                Sizes: {product.sizes.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold text-lg">{product.price} EGP</span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="block text-gray-500 line-through text-sm">{product.comparePrice} EGP</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
