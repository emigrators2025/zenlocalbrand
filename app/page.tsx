'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Package, Sparkles, Truck, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useProductsStore } from '@/stores/products';

export default function HomePage() {
  const { products, loadProducts } = useProductsStore();
  const activeProducts = products.filter(p => p.status === 'active');
  const featuredProducts = activeProducts.filter(p => p.featured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : activeProducts.slice(0, 4);

  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSubscribe = async () => {
    if (!subscribeEmail || !subscribeEmail.includes('@')) {
      setSubscribeStatus('error');
      setSubscribeMessage('Please enter a valid email');
      return;
    }

    setSubscribeLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage(data.message || 'Successfully subscribed!');
        setSubscribeEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setSubscribeStatus('error');
      setSubscribeMessage('Failed to subscribe. Please try again.');
    } finally {
      setSubscribeLoading(false);
      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 4000);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/20">
               Premium Streetwear Collection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              ZEN LOCAL
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              BRAND
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          >
            Elevate your style with our exclusive collection of premium streetwear.
            Designed for those who dare to stand out.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-lg flex items-center gap-2 mx-auto sm:mx-0"
              >
                Shop Now
                <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-zinc-800 text-white font-medium rounded-lg border border-zinc-700 hover:border-emerald-500 transition-colors mx-auto sm:mx-0"
              >
                View Collection
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-emerald-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over 5,000 EGP' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Sparkles, title: 'Premium Quality', desc: 'Handcrafted with care' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700"
              >
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <feature.icon className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {featuredProducts.length > 0 ? 'Featured Products' : 'Our Collection'}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover our latest arrivals and best sellers
            </p>
          </motion.div>

          {activeProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-800 mb-6">
                <Package className="text-gray-600" size={48} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">No Products Available</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                We are currently curating our collection. Check back soon for amazing products!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 hover:border-emerald-500 transition-colors"
                  >
                    Browse Categories
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/products/${product.slug}`}>
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
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 hover:border-emerald-500 transition-colors inline-flex items-center gap-2"
                  >
                    View All Products
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the ZEN Community
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Be the first to know about new drops, exclusive offers, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                disabled={subscribeLoading || subscribeStatus === 'success'}
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <motion.button
                whileHover={{ scale: subscribeLoading ? 1 : 1.05 }}
                whileTap={{ scale: subscribeLoading ? 1 : 0.95 }}
                onClick={handleSubscribe}
                disabled={subscribeLoading || subscribeStatus === 'success'}
                className="px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {subscribeLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Subscribing...
                  </>
                ) : subscribeStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Subscribed!
                  </>
                ) : (
                  'Subscribe'
                )}
              </motion.button>
            </div>
            {subscribeMessage && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-sm ${subscribeStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {subscribeMessage}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
