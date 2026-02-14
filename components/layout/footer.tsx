'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone, Music2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import type { SiteSettings } from '@/types/settings';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=hoodies', label: 'Hoodies' },
    { href: '/products?category=t-shirts', label: 'T-Shirts' },
    { href: '/products?category=accessories', label: 'Accessories' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns' },
    { href: '/faq', label: 'FAQ' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: Music2,
};

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const socialEntries = Object.entries(settings.socialLinks || {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({
      href: value as string,
      Icon: SOCIAL_ICON_MAP[key] ?? Instagram,
      label: key,
    }));

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo size="lg" inverted />
            <p className="mt-4 text-zinc-400 max-w-sm">
              {settings.description}
            </p>
            <div className="flex gap-4 mt-6">
              {socialEntries.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-colors"
                >
                  <social.Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-zinc-400">
                <Mail className="w-4 h-4 text-primary" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Phone className="w-4 h-4 text-primary" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-400">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">
            {settings.footerText}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
