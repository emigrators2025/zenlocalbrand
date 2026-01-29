'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '$12,426',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Total Orders',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
  },
  {
    title: 'Products',
    value: '48',
    change: '+4',
    trend: 'up',
    icon: Package,
  },
  {
    title: 'Customers',
    value: '1,234',
    change: '-2.1%',
    trend: 'down',
    icon: Users,
  },
];

const recentOrders = [
  { id: '#DVX001', customer: 'John Doe', amount: '$259.99', status: 'Completed', date: '2 hours ago' },
  { id: '#DVX002', customer: 'Jane Smith', amount: '$189.50', status: 'Processing', date: '4 hours ago' },
  { id: '#DVX003', customer: 'Mike Johnson', amount: '$89.99', status: 'Shipped', date: '6 hours ago' },
  { id: '#DVX004', customer: 'Sarah Williams', amount: '$349.00', status: 'Pending', date: '8 hours ago' },
  { id: '#DVX005', customer: 'Chris Brown', amount: '$129.99', status: 'Completed', date: '12 hours ago' },
];

const topProducts = [
  { name: 'Urban Stealth Hoodie', sales: 45, revenue: '$4,050' },
  { name: 'Midnight Runner Tee', sales: 38, revenue: '$1,900' },
  { name: 'Tech Cargo Pants', sales: 28, revenue: '$3,360' },
  { name: 'Shadow Cap', sales: 52, revenue: '$1,820' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back! Here is what is happening with your store.</p>
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
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{order.id}</p>
                  <p className="text-sm text-zinc-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' :
                    order.status === 'Shipped' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Products</h2>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-4 py-3 border-b border-zinc-800 last:border-0"
              >
                <span className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-sm text-zinc-500">{product.sales} sales</p>
                </div>
                <p className="text-emerald-400 font-semibold">{product.revenue}</p>
              </div>
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
            { label: 'Add Product', href: '/admin/products/new' },
            { label: 'View Orders', href: '/admin/orders' },
            { label: 'Manage Users', href: '/admin/users' },
            { label: 'Settings', href: '/admin/settings' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-center transition-all"
            >
              <p className="text-white font-medium">{action.label}</p>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
