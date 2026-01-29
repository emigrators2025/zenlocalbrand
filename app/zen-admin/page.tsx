'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

// Mock data for dashboard
const stats = [
  { title: 'Total Revenue', value: '$0.00', change: '0%', trend: 'up', icon: DollarSign },
  { title: 'Total Orders', value: '0', change: '0', trend: 'up', icon: ShoppingCart },
  { title: 'Products', value: '0', change: '0', trend: 'up', icon: Package },
  { title: 'Active Users', value: '0', change: '0%', trend: 'up', icon: Users },
];

const recentActivity = [
  { id: 1, type: 'login', message: 'Admin login from 192.168.1.1', time: 'Just now', icon: Globe },
  { id: 2, type: 'system', message: 'Store initialized', time: '2 hours ago', icon: CheckCircle },
];

const pendingTasks = [
  { id: 1, task: 'Add your first product', priority: 'high', href: '/zen-admin/products' },
  { id: 2, task: 'Configure shipping zones', priority: 'medium', href: '/zen-admin/shipping' },
  { id: 3, task: 'Customize store theme', priority: 'low', href: '/zen-admin/theme' },
  { id: 4, task: 'Set up notifications', priority: 'low', href: '/zen-admin/notifications' },
];

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="w-5 h-5" />
          <span className="font-mono">{currentTime.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Alert Banner */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <stat.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <span className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 ml-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 ml-1" />
                )}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-zinc-500">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Link href="/zen-admin/analytics" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 py-3 border-b border-zinc-800 last:border-0"
              >
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <activity.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-xs text-zinc-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Setup Tasks</h2>
            <span className="text-sm text-zinc-500">{pendingTasks.length} remaining</span>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full ${
                  task.priority === 'high' ? 'bg-red-400' :
                  task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className="flex-1 text-zinc-300 group-hover:text-white">{task.task}</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

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

      {/* Admin Credentials Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Your Admin Credentials</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-zinc-800 rounded-xl">
            <p className="text-zinc-500 mb-1">Username</p>
            <p className="text-white font-mono">ZenAdmin2026</p>
          </div>
          <div className="p-4 bg-zinc-800 rounded-xl">
            <p className="text-zinc-500 mb-1">Signing Key</p>
            <p className="text-white font-mono text-xs break-all">ZEN-2026-ADMIN-KEY-X9K4M2P7Q3R8L5N1</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-4">Keep these credentials secure. Do not share them with anyone.</p>
      </motion.div>
    </div>
  );
}
