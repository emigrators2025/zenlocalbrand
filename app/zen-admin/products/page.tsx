'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Image as ImageIcon,
  Search,
  Filter,
  Loader2,
  Upload,
} from 'lucide-react';
import { useProductsStore } from '@/stores/products';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  status: 'draft' | 'active' | 'archived';
  featured: boolean;
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  comparePrice: 0,
  category: '',
  images: [],
  sizes: [],
  colors: [],
  stock: 0,
  status: 'draft',
  featured: false,
};

const categories = ['Hoodies', 'T-Shirts', 'Pants', 'Jackets', 'Accessories', 'Shoes'];
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const availableColors = ['Black', 'White', 'Gray', 'Navy', 'Green', 'Red', 'Blue', 'Brown'];
const MAX_IMAGE_SIZE_MB = 5;

// Generate slug from product name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36);
};

export default function AdminProductsPage() {
  const { products, loadProducts, addProduct, updateProduct, deleteProduct, approveProduct } = useProductsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Upload image to Firebase Storage with timeout
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`);
      return null;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Upload timed out after 30 seconds')), 30000);
    });

    try {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const storagePath = `products/${uniqueId}.${extension}`;
      
      setUploadProgress(`Uploading ${file.name}...`);
      
      const storageRef = ref(storage, storagePath);
      
      // Race between upload and timeout
      const uploadPromise = async () => {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      };
      
      const downloadUrl = await Promise.race([uploadPromise(), timeoutPromise]);
      
      return downloadUrl;
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for common Firebase errors
      if (errorMsg.includes('storage/unauthorized')) {
        throw new Error('Storage access denied. Please check Firebase Storage rules.');
      } else if (errorMsg.includes('storage/canceled')) {
        throw new Error('Upload was cancelled');
      } else if (errorMsg.includes('timed out')) {
        throw new Error('Upload timed out. Please check your internet connection.');
      } else if (errorMsg.includes('storage/unknown')) {
        throw new Error('Storage error. Please try again.');
      }
      
      throw error;
    }
  };

  // Handle file selection - upload one at a time for better error handling
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const successfulUploads: string[] = [];
    let failedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);
      
      try {
        const url = await uploadImage(file);
        if (url) {
          successfulUploads.push(url);
          // Update form immediately after each successful upload
          setForm(prev => ({
            ...prev,
            images: [...prev.images, url],
          }));
        } else {
          failedCount++;
        }
      } catch (error: unknown) {
        console.error(`Failed to upload ${file.name}:`, error);
        const errorMsg = error instanceof Error ? error.message : 'Upload failed';
        toast.error(`${file.name}: ${errorMsg}`);
        failedCount++;
      }
    }

    if (successfulUploads.length > 0) {
      toast.success(`${successfulUploads.length} image(s) uploaded!`);
    }
    
    if (failedCount > 0 && successfulUploads.length === 0) {
      toast.error('All uploads failed. Check Firebase Storage rules.');
    }

    setIsUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image from form
  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (form.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (form.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSaving(true);

    try {
      if (editingId) {
        // For updates, don't change the slug
        await updateProduct(editingId, form);
        toast.success('Product updated successfully!');
      } else {
        // For new products, generate a slug
        const productData = {
          ...form,
          slug: generateSlug(form.name),
        };
        await addProduct(productData);
        toast.success('Product added successfully!');
      }

      setForm(initialForm);
      setShowForm(false);
      setEditingId(null);
    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for common Firestore errors
      if (errorMessage.includes('permission-denied')) {
        toast.error('Permission denied. Check Firestore security rules.');
      } else if (errorMessage.includes('unauthenticated')) {
        toast.error('You must be logged in to save products.');
      } else if (errorMessage.includes('invalid-argument')) {
        toast.error('Invalid product data. Please check all fields.');
      } else {
        toast.error(`Failed to save product: ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (product: typeof products[0]) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      comparePrice: product.comparePrice || 0,
      category: product.category,
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock: product.stock || 0,
      status: product.status || 'draft',
      featured: product.featured || false,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully!');
      } catch {
        toast.error('Failed to delete product');
      }
    }
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // Toggle color selection
  const toggleColor = (color: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your product inventory
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setForm(initialForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"
        >
          <Package className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
          <p className="text-gray-400 mb-6">
            Add your first product to start selling
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
          >
            <Plus size={20} />
            Add Your First Product
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group"
            >
              {/* Product Image */}
              <div className="aspect-square bg-zinc-800 relative">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-gray-600" size={48} />
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                  product.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  product.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {product.status}
                </div>
                {product.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                    Featured
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-gray-400 text-sm truncate">{product.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-emerald-400 font-bold text-lg">{product.price} EGP</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-gray-500 line-through text-sm">{product.comparePrice} EGP</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1">Stock: {product.stock || 0}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                  {product.status !== 'active' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => approveProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm"
                    >
                      <Check size={16} />
                      Approve
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSaving && !isUploading && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => !isSaving && !isUploading && setShowForm(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  disabled={isSaving || isUploading}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product"
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Price and Compare Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (EGP) *</label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="1"
                      placeholder="0"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Compare Price (EGP)</label>
                    <input
                      type="number"
                      value={form.comparePrice || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="1"
                      placeholder="Original price for discounts"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Category and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock *</label>
                    <input
                      type="number"
                      value={form.stock || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Images *</label>
                  
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isUploading 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-zinc-700 hover:border-emerald-500 hover:bg-zinc-800/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-3" />
                          <p className="text-emerald-400 font-medium">{uploadProgress || 'Uploading...'}</p>
                          <p className="text-gray-500 text-sm mt-1">This may take up to 30 seconds</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsUploading(false);
                              setUploadProgress('');
                              toast.error('Upload cancelled');
                            }}
                            className="mt-3 px-4 py-1 text-sm text-red-400 border border-red-500/50 rounded hover:bg-red-500/10"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-12 h-12 text-gray-500 mb-3" />
                          <p className="text-white font-medium">Click to upload images</p>
                          <p className="text-gray-500 text-sm mt-1">
                            PNG, JPG, GIF up to {MAX_IMAGE_SIZE_MB}MB each
                          </p>
                          <p className="text-gray-600 text-xs mt-2">
                            You can select multiple images at once
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {form.images.map((img, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-zinc-700"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-emerald-500 text-black text-xs font-medium rounded">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          form.sizes.includes(size)
                            ? 'bg-emerald-500 border-emerald-500 text-black font-medium'
                            : 'bg-zinc-800 border-zinc-700 hover:border-emerald-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium mb-2">Available Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          form.colors.includes(color)
                            ? 'bg-emerald-500 border-emerald-500 text-black font-medium'
                            : 'bg-zinc-800 border-zinc-700 hover:border-emerald-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status and Featured */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'active' | 'archived' }))}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending Review</option>
                      <option value="active">Active (Published)</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      <span>Featured Product</span>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isSaving || isUploading}
                    className="flex-1 px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="flex-1 px-4 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingId ? 'Update Product' : 'Add Product'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
