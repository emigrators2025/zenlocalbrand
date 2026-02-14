'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Search, Heart, AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import type { SiteSettings } from '@/types/settings';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

interface NavbarProps {
  settings: SiteSettings;
}

export function Navbar({ settings }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCartStore();
  const { user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showVerificationBanner = user && !user.emailVerified;

  return (
    <>
      {/* Email Verification Banner */}
      {showVerificationBanner && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/90 backdrop-blur-sm text-black py-2 px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Please verify your email address.</span>
            <Link
              href="/auth/verify-email"
              className="font-semibold underline hover:no-underline"
            >
              Verify now
            </Link>
          </div>
        </motion.div>
      )}

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          showVerificationBanner ? 'top-10' : 'top-0'
        } ${
          isScrolled ? 'bg-zinc-950/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Logo size="md" inverted />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex p-2 text-zinc-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Link>
              <Link
                href="/cart"
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount()}
                  </motion.span>
                )}
              </Link>
              <Link
                href={user ? '/account' : '/auth/login'}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-zinc-950 pt-24 px-4 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-bold py-3 border-b border-zinc-800 ${
                    pathname === link.href ? 'text-primary' : 'text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className={showVerificationBanner ? 'h-[7.5rem]' : 'h-20'} />
    </>
  );
}
