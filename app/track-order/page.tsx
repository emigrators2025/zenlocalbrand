'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search, 
  CheckCircle, 
  Clock, 
  Truck, 
  MapPin, 
  Home,
  XCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface OrderData {
  orderNumber: string;
  status: string;
  statusLabel: string;
  timeline: {
    key: string;
    label: string;
    description: string;
    completed: boolean;
    current: boolean;
    timestamp: string | null;
  }[];
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
    size?: string;
    color?: string;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    governorate: string;
    country: string;
  } | null;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  isCancelled: boolean;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const params = new URLSearchParams({ orderNumber: orderNumber.trim() });
      if (email.trim()) {
        params.append('email', email.trim());
      }

      const response = await fetch(`/api/orders/track?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Order not found');
        return;
      }

      setOrder(data.order);
    } catch {
      setError('Failed to track order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (key: string, completed: boolean, current: boolean) => {
    if (key === 'pending') return <Package className="w-5 h-5" />;
    if (key === 'processing') return <Clock className="w-5 h-5" />;
    if (key === 'shipped') return <Truck className="w-5 h-5" />;
    if (key === 'out_for_delivery') return <MapPin className="w-5 h-5" />;
    if (key === 'delivered') return <Home className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
            <Package className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Track Your Order
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Enter your order number to see the current status and delivery updates
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Order Number *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., ZEN1234ABC"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your order email"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Order Results */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Order Header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Order #{order.orderNumber}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    Placed on {new Date(order.orderDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  order.isCancelled
                    ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                }`}>
                  {order.isCancelled ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {order.statusLabel}
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-400">Tracking Number</p>
                  <p className="text-white font-mono">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {!order.isCancelled && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Delivery Progress</h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-700" />
                  
                  {order.timeline.map((step, index) => (
                    <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* Icon */}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        step.completed
                          ? 'bg-emerald-500 text-white'
                          : step.current
                          ? 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {getStatusIcon(step.key, step.completed, step.current)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <h4 className={`font-medium ${
                          step.completed || step.current ? 'text-white' : 'text-zinc-500'
                        }`}>
                          {step.label}
                        </h4>
                        <p className={`text-sm ${
                          step.completed || step.current ? 'text-zinc-400' : 'text-zinc-600'
                        }`}>
                          {step.description}
                        </p>
                        {step.timestamp && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {new Date(step.timestamp).toLocaleString('en-GB')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-sm text-zinc-400">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Color: ${item.color}`}
                        {(item.size || item.color) && ' • '}
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-white font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-zinc-700 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-zinc-700">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div className="text-zinc-300">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.governorate}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-zinc-400 mb-4">Need help with your order?</p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            Contact Support <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
