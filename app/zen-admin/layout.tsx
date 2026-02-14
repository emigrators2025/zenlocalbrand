'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  MapPin,
  Bell,
  BarChart3,
  Shield,
  FileText,
  Clock,
  AlertTriangle,
  Mail,
  Tag,
  MessageCircle,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin';
import { ACTIVITY_EVENTS, debounce } from '@/lib/admin-session';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/zen-admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/zen-admin/products', icon: Package, label: 'Products' },
  { href: '/zen-admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/zen-admin/users', icon: Users, label: 'Users & Logins' },
  { href: '/zen-admin/contacts', icon: Mail, label: 'Contacts' },
  { href: '/zen-admin/live-chat', icon: MessageCircle, label: 'Live Chat' },
  { href: '/zen-admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/zen-admin/coupons', icon: Tag, label: 'Coupons' },
  { href: '/zen-admin/shipping', icon: MapPin, label: 'Shipping' },
  { href: '/zen-admin/notifications', icon: Bell, label: 'Notifications' },
  { href: '/zen-admin/content', icon: FileText, label: 'Content' },
  { href: '/zen-admin/security', icon: Shield, label: 'Security' },
  { href: '/zen-admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    isAuthenticated, 
    signingKeyVerified, 
    logout, 
    updateActivity, 
    checkAndLogoutIfInactive,
    getSessionInfo 
  } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30 * 60 * 1000);
  const warningShownRef = useRef(false);

  // Mark as hydrated after component mounts
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Activity tracker - update on user interaction
  const handleActivity = useCallback(
    debounce(() => {
      if (isAuthenticated && signingKeyVerified && pathname !== '/zen-admin/login') {
        updateActivity();
        setShowTimeoutWarning(false);
        warningShownRef.current = false;
      }
    }, 1000),
    [isAuthenticated, signingKeyVerified, pathname, updateActivity]
  );

  // Set up activity listeners
  useEffect(() => {
    if (!hydrated || pathname === '/zen-admin/login') return;
    if (!isAuthenticated || !signingKeyVerified) return;

    // Add activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial activity update
    updateActivity();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [hydrated, isAuthenticated, signingKeyVerified, pathname, handleActivity, updateActivity]);

  // Check for inactivity timeout every minute
  useEffect(() => {
    if (!hydrated || pathname === '/zen-admin/login') return;
    if (!isAuthenticated || !signingKeyVerified) return;

    const checkInactivity = () => {
      const wasLoggedOut = checkAndLogoutIfInactive();
      if (wasLoggedOut) {
        toast.error('Session expired due to inactivity', { duration: 5000 });
        router.push('/zen-admin/login');
        return;
      }

      // Update remaining time and show warning if < 5 minutes
      const { remainingTime: remaining } = getSessionInfo();
      setRemainingTime(remaining);

      if (remaining <= 5 * 60 * 1000 && remaining > 0 && !warningShownRef.current) {
        setShowTimeoutWarning(true);
        warningShownRef.current = true;
        toast('Your session will expire in 5 minutes due to inactivity', {
          icon: '⚠️',
          duration: 5000,
        });
      }
    };

    // Check immediately
    checkInactivity();

    // Then check every 30 seconds
    const interval = setInterval(checkInactivity, 30000);

    return () => clearInterval(interval);
  }, [hydrated, isAuthenticated, signingKeyVerified, pathname, checkAndLogoutIfInactive, getSessionInfo, router]);

  // Auth protection
  useEffect(() => {
    if (!hydrated) return;
    if (pathname !== '/zen-admin/login') {
      if (!isAuthenticated || !signingKeyVerified) {
        router.push('/zen-admin/login');
      }
    }
  }, [hydrated, isAuthenticated, signingKeyVerified, pathname, router]);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    router.push('/zen-admin/login');
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show login page without layout
  if (pathname === '/zen-admin/login') {
    return <>{children}</>;
  }

  // Loading state while hydrating or checking auth
  if (!hydrated || !isAuthenticated || !signingKeyVerified) {
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
              {/* Session Timer */}
              {showTimeoutWarning && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-400">
                    Session expires in {formatTime(remainingTime)}
                  </span>
                </div>
              )}
              <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                View Store 
              </Link>
            </div>
          </div>
        </header>

        {/* Session Timeout Warning Modal */}
        <AnimatePresence>
          {showTimeoutWarning && remainingTime <= 2 * 60 * 1000 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Session Expiring</h3>
                    <p className="text-sm text-zinc-400">
                      Your session will expire in {formatTime(remainingTime)}
                    </p>
                  </div>
                </div>
                <p className="text-zinc-400 mb-6">
                  You&apos;ve been inactive for a while. Move your mouse or press any key to stay logged in.
                </p>
                <button
                  onClick={() => {
                    updateActivity();
                    setShowTimeoutWarning(false);
                    warningShownRef.current = false;
                    toast.success('Session extended');
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                >
                  Keep Me Signed In
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
