import type { SiteSettings } from '@/types/settings';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'ZEN LOCAL BRAND',
  tagline: 'Premium Streetwear Collection',
  description: 'Elevate your style with our exclusive collection of premium streetwear.',
  email: 'support@zenlocalbrand.shop',
  phone: '+201062137061',
  address: 'Cairo, Egypt',
  socialLinks: {
    instagram: 'https://www.instagram.com/zen.local_brand/',
    twitter: '',
    facebook: '',
    tiktok: '',
  },
  heroTitle: 'ZEN LOCAL BRAND',
  heroSubtitle:
    'Elevate your style with our exclusive collection of premium streetwear. Designed for those who dare to stand out.',
  heroButtonText: 'Shop Now',
  aboutTitle: 'Our Story',
  aboutContent:
    'Founded in 2026, ZEN LOCAL BRAND was born from a passion for creating high-quality streetwear that combines comfort with cutting-edge design.',
  footerText: ' 2026 ZEN LOCAL BRAND. All rights reserved.',
  announcementBar: '🚚 Free shipping on orders over 5,000 EGP!',
  primaryColor: '#10b981',
  accentColor: '#34d399',
  backgroundColor: '#09090b',
  textColor: '#fafafa',
  fontFamily: 'Inter',
  borderRadius: '0.75rem',
  currency: 'EGP',
  taxRate: 0,
  enforceEmail2FA: true,
  stats: {
    happyCustomers: '10K+',
    totalProducts: '50+',
    countries: '15+',
    satisfaction: '99%',
  },
};
