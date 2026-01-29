'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Palette,
  MapPin,
  Bell,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin';

const navItems = [
  { href: '/zen-admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/zen-admin/products', icon: Package, label: 'Products' },
  { href: '/zen-admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/zen-admin/users', icon: Users, label: 'Users & Logins' },
  { href: '/zen-admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/zen-admin/shipping', icon: MapPin, label: 'Shipping' },
  { href: '/zen-admin/notifications', icon: Bell, label: 'Notifications' },
  { href: '/zen-admin/theme', icon: Palette, label: 'Theme' },
  { href: '/zen-admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, signingKeyVerified, logout } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname !== '/zen-admin/login') {
      if (!isAuthenticated || !signingKeyVerified) {
        router.push('/zen-admin/login');
      }
    }
  }, [mounted, isAuthenticated, signingKeyVerified, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push('/zen-admin/login');
  };

  // Show login page without layout
  if (pathname === '/zen-admin/login') {
    return <>{children}</>;
  }

  // Loading state
  if (!mounted || !isAuthenticated || !signingKeyVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <Link href="/zen-admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg block leading-none">ZEN</span>
                <span className="text-emerald-400 text-xs">Admin Panel</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <span className="text-emerald-400 font-bold">Z</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">ZenAdmin2026</p>
                <p className="text-xs text-zinc-500 truncate">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                View Store 
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
