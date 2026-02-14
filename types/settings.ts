export interface SiteStats {
  happyCustomers: string;
  totalProducts: string;
  countries: string;
  satisfaction: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  aboutTitle: string;
  aboutContent: string;
  footerText: string;
  announcementBar?: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  currency: string;
  taxRate: number;
  enforceEmail2FA: boolean;
  stats: SiteStats;
}
