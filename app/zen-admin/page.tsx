'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
}

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    lowStockProducts: [],
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/users'),
      ]);

      const [productsData, ordersData, usersData] = await Promise.all([
        productsRes.ok ? productsRes.json() : { products: [] },
        ordersRes.ok ? ordersRes.json() : { orders: [] },
        usersRes.ok ? usersRes.json() : { users: [] },
      ]);

      const products = productsData.products || [];
      const orders = ordersData.orders || [];
      const users = usersData.users || [];

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce((sum: number, order: { total?: number }) => sum + (order.total || 0), 0);

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a: { createdAt: string }, b: { createdAt: string }) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
        .map((order: { id: string; customerName?: string; shippingAddress?: { name?: string }; total?: number; status?: string; createdAt: string }) => ({
          id: order.id,
          customerName: order.customerName || order.shippingAddress?.name || 'Customer',
          total: order.total || 0,
          status: order.status || 'pending',
          createdAt: order.createdAt,
        }));

      // Get low stock products (stock < 10)
      const lowStockProducts = products
        .filter((p: { stock?: number }) => (p.stock || 0) < 10)
        .slice(0, 5)
        .map((p: { id: string; name: string; stock?: number }) => ({
          id: p.id,
          name: p.name,
          stock: p.stock || 0,
        }));

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        recentOrders,
        lowStockProducts,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'emerald' },
    { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'blue' },
    { title: 'Products', value: stats.totalProducts.toString(), icon: Package, color: 'purple' },
    { title: 'Users', value: stats.totalUsers.toString(), icon: Users, color: 'orange' },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-emerald-400 bg-emerald-500/20';
      case 'shipped': return 'text-blue-400 bg-blue-500/20';
      case 'processing': return 'text-amber-400 bg-amber-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-zinc-400">Welcome back, ZenAdmin2026!</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-5 h-5" />
            <span className="font-mono">{currentTime.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center p-8"
        >
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="ml-3 text-zinc-400">Loading dashboard data...</span>
        </motion.div>
      )}

      {/* Alert Banner - Show only if no products */}
      {!loading && stats.totalProducts === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
        >
          <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-400 font-medium">No products in store</p>
            <p className="text-zinc-400 text-sm">Add your first product to start selling!</p>
          </div>
          <Link
            href="/zen-admin/products"
            className="px-4 py-2 bg-amber-500 text-black font-medium rounded-xl hover:bg-amber-400 transition-colors"
          >
            Add Product
          </Link>
        </motion.div>
      )}

      {/* Low Stock Alert */}
      {!loading && stats.lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
        >
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">{stats.lowStockProducts.length} Products Low on Stock</p>
            <p className="text-zinc-400 text-sm">
              {stats.lowStockProducts.map(p => p.name).join(', ')}
            </p>
          </div>
          <Link
            href="/zen-admin/products"
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors"
          >
            Manage Stock
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-zinc-500">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              <Link href="/zen-admin/orders" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 py-3 border-b border-zinc-800 last:border-0"
                  >
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{order.customerName}</p>
                      <p className="text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium text-sm">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Low Stock Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Low Stock Items</h2>
              <Link href="/zen-admin/products" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Manage <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-zinc-500">All products are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-xl"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      product.stock === 0 ? 'bg-red-400' :
                      product.stock < 5 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <span className="flex-1 text-zinc-300">{product.name}</span>
                    <span className={`text-sm font-medium ${
                      product.stock === 0 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add Product', href: '/zen-admin/products', icon: Package },
            { label: 'View Orders', href: '/zen-admin/orders', icon: ShoppingCart },
            { label: 'Manage Users', href: '/zen-admin/users', icon: Users },
            { label: 'View Store', href: '/', icon: Eye },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-3 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all group"
            >
              <action.icon className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400" />
              <span className="text-white font-medium text-sm">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
