'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Save,
  Loader2,
  DollarSign,
  Percent,
  Type,
  MessageSquare,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settings';
import toast from 'react-hot-toast';

const CURRENCY_CODE = 'EGP';

export default function AdminSettingsPage() {
  const { settings, isLoading, loadSettings, saveSettings } = useSettingsStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    instagram: '',
    twitter: '',
    facebook: '',
    tiktok: '',
    heroTitle: '',
    heroSubtitle: '',
    heroButtonText: '',
    aboutTitle: '',
    aboutContent: '',
    footerText: '',
    announcementBar: '',
    currency: CURRENCY_CODE,
    taxRate: 0,
    enforceEmail2FA: true,
    statsHappyCustomers: '10K+',
    statsTotalProducts: '50+',
    statsCountries: '15+',
    statsSatisfaction: '99%',
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || '',
        tagline: settings.tagline || '',
        description: settings.description || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        instagram: settings.socialLinks?.instagram || '',
        twitter: settings.socialLinks?.twitter || '',
        facebook: settings.socialLinks?.facebook || '',
        tiktok: settings.socialLinks?.tiktok || '',
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        heroButtonText: settings.heroButtonText || '',
        aboutTitle: settings.aboutTitle || '',
        aboutContent: settings.aboutContent || '',
        footerText: settings.footerText || '',
        announcementBar: settings.announcementBar || '',
        currency: CURRENCY_CODE,
        taxRate: settings.taxRate || 0,
        enforceEmail2FA: settings.enforceEmail2FA ?? true,
        statsHappyCustomers: settings.stats?.happyCustomers || '10K+',
        statsTotalProducts: settings.stats?.totalProducts || '50+',
        statsCountries: settings.stats?.countries || '15+',
        statsSatisfaction: settings.stats?.satisfaction || '99%',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({
        siteName: form.siteName,
        tagline: form.tagline,
        description: form.description,
        email: form.email,
        phone: form.phone,
        address: form.address,
        socialLinks: {
          instagram: form.instagram,
          twitter: form.twitter,
          facebook: form.facebook,
          tiktok: form.tiktok,
        },
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        heroButtonText: form.heroButtonText,
        aboutTitle: form.aboutTitle,
        aboutContent: form.aboutContent,
        footerText: form.footerText,
        announcementBar: form.announcementBar,
        currency: CURRENCY_CODE,
        taxRate: form.taxRate,
        enforceEmail2FA: form.enforceEmail2FA,
        stats: {
          happyCustomers: form.statsHappyCustomers,
          totalProducts: form.statsTotalProducts,
          countries: form.statsCountries,
          satisfaction: form.statsSatisfaction,
        },
      });
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Store Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Configure your store information and preferences
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-medium rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Account Security</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">Require Email 2FA for all logins</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Forces the email verification code for every sign-in (including admin logins).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, enforceEmail2FA: !form.enforceEmail2FA })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.enforceEmail2FA ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
                aria-pressed={form.enforceEmail2FA}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.enforceEmail2FA ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </motion.div>
        {/* Store Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Store Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Store Name</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Contact Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 w-5 h-5 text-zinc-500" />
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Social Links</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="url"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Facebook</label>
              <div className="relative">
                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="url"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">TikTok</label>
              <input
                type="url"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Homepage Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Type className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Homepage Content</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Hero Title</label>
              <input
                type="text"
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Hero Subtitle</label>
              <textarea
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Hero Button Text</label>
              <input
                type="text"
                value={form.heroButtonText}
                onChange={(e) => setForm({ ...form, heroButtonText: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Announcement Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Announcement Bar</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Announcement Message (leave empty to hide)
            </label>
            <input
              type="text"
              value={form.announcementBar}
              onChange={(e) => setForm({ ...form, announcementBar: e.target.value })}
              placeholder="🚚 Free shipping on orders over 5,000 EGP!"
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Stats Display</h2>
          </div>
          <p className="text-zinc-400 text-sm mb-4">
            These stats are displayed on the About page
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Happy Customers</label>
              <input
                type="text"
                value={form.statsHappyCustomers}
                onChange={(e) => setForm({ ...form, statsHappyCustomers: e.target.value })}
                placeholder="10K+"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Products</label>
              <input
                type="text"
                value={form.statsTotalProducts}
                onChange={(e) => setForm({ ...form, statsTotalProducts: e.target.value })}
                placeholder="50+"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Countries</label>
              <input
                type="text"
                value={form.statsCountries}
                onChange={(e) => setForm({ ...form, statsCountries: e.target.value })}
                placeholder="15+"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Satisfaction</label>
              <input
                type="text"
                value={form.statsSatisfaction}
                onChange={(e) => setForm({ ...form, statsSatisfaction: e.target.value })}
                placeholder="99%"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Currency & Tax */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Currency & Tax</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Currency</label>
              <input
                type="text"
                value={`${form.currency || CURRENCY_CODE} - Egyptian Pound`}
                readOnly
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Currency is fixed to Egyptian Pound to keep storefront pricing consistent.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tax Rate (%)</label>
              <div className="relative">
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
