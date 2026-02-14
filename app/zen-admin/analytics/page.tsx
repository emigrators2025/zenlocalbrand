'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  averageOrderValue: number;
  pendingOrders: number;
  deliveredOrders: number;
  topProducts: { name: string; sales: number; revenue: number }[];
  recentOrders: { id: string; total: number; status: string; date: string }[];
  ordersByStatus: { [key: string]: number };
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    topProducts: [],
    recentOrders: [],
    ordersByStatus: {},
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(data.totalRevenue),
      change: data.revenueChange,
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toString(),
      change: data.ordersChange,
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Total Users',
      value: data.totalUsers.toString(),
      change: 5.2,
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Active Products',
      value: data.totalProducts.toString(),
      change: 0,
      icon: Package,
      color: 'orange',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track your store performance and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-zinc-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
              {stat.change !== 0 && (
                <span
                  className={`flex items-center text-sm font-medium ${
                    stat.change > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {stat.change > 0 ? '+' : ''}
                  {stat.change}%
                  {stat.change > 0 ? (
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 ml-1" />
                  )}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-zinc-500">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Orders by Status</h2>
          <div className="space-y-4">
            {[
              { status: 'pending', label: 'Pending', color: 'yellow' },
              { status: 'confirmed', label: 'Confirmed', color: 'blue' },
              { status: 'processing', label: 'Processing', color: 'purple' },
              { status: 'shipped', label: 'Shipped', color: 'cyan' },
              { status: 'delivered', label: 'Delivered', color: 'emerald' },
              { status: 'cancelled', label: 'Cancelled', color: 'red' },
            ].map((item) => {
              const count = data.ordersByStatus[item.status] || 0;
              const percentage = data.totalOrders > 0 ? (count / data.totalOrders) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400 capitalize">{item.label}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${item.color}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Top Products</h2>
          {data.topProducts.length > 0 ? (
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-lg text-zinc-400 text-sm font-medium">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.sales} sold</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-medium">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500">No sales data yet</p>
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Recent Orders</h2>
          {data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-zinc-500 text-sm">
                    <th className="pb-4 font-medium">Order ID</th>
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-zinc-800">
                      <td className="py-4 text-white font-mono text-sm">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="py-4 text-zinc-400 text-sm">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            order.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : order.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-white font-medium text-right">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500">No orders yet</p>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{formatPrice(data.averageOrderValue)}</p>
              <p className="text-xs text-zinc-500 mt-1">Avg. Order Value</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{data.pendingOrders}</p>
              <p className="text-xs text-zinc-500 mt-1">Pending Orders</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{data.deliveredOrders}</p>
              <p className="text-xs text-zinc-500 mt-1">Delivered</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{data.totalProducts}</p>
              <p className="text-xs text-zinc-500 mt-1">Active Products</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
