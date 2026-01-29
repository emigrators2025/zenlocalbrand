'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Square,
  RotateCcw,
  Save,
  Eye,
  Sun,
  Moon,
} from 'lucide-react';
import { useThemeStore } from '@/stores/theme';

const colorPresets = [
  { name: 'Emerald', primary: '#10b981', accent: '#34d399' },
  { name: 'Blue', primary: '#3b82f6', accent: '#60a5fa' },
  { name: 'Purple', primary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Pink', primary: '#ec4899', accent: '#f472b6' },
  { name: 'Orange', primary: '#f97316', accent: '#fb923c' },
  { name: 'Red', primary: '#ef4444', accent: '#f87171' },
  { name: 'Yellow', primary: '#eab308', accent: '#facc15' },
  { name: 'Teal', primary: '#14b8a6', accent: '#2dd4bf' },
];

const fontOptions = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Playfair Display',
  'Space Grotesk',
  'DM Sans',
];

const radiusOptions = [
  { name: 'None', value: '0' },
  { name: 'Small', value: '0.375rem' },
  { name: 'Medium', value: '0.75rem' },
  { name: 'Large', value: '1rem' },
  { name: 'Full', value: '9999px' },
];

export default function AdminThemePage() {
  const { settings, updateSettings, resetToDefaults } = useThemeStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Theme Customization</h1>
          <p className="text-gray-400 text-sm mt-1">
            Customize the look and feel of your store
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw size={18} />
            Reset
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
          >
            <Save size={18} />
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Colors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Palette className="text-emerald-400" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Colors</h2>
            </div>

            {/* Color Presets */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Color Presets</label>
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateSettings({ 
                      primaryColor: preset.primary,
                      accentColor: preset.accent 
                    })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      settings.primaryColor === preset.primary
                        ? 'border-white'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                    style={{ backgroundColor: preset.primary }}
                  >
                    <span className="sr-only">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Type className="text-blue-400" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Typography</h2>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Font Family</label>
              <div className="grid grid-cols-2 gap-2">
                {fontOptions.map((font) => (
                  <button
                    key={font}
                    onClick={() => updateSettings({ fontFamily: font })}
                    className={`px-4 py-3 rounded-lg border transition-all text-left ${
                      settings.fontFamily === font
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Border Radius */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Square className="text-purple-400" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Border Radius</h2>
            </div>

            <div className="flex gap-2">
              {radiusOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => updateSettings({ borderRadius: option.value })}
                  className={`flex-1 px-4 py-3 border transition-all ${
                    settings.borderRadius === option.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                  style={{ borderRadius: option.value }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Type className="text-orange-400" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Branding</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name</label>
                <input
                  type="text"
                  value={settings.logoText}
                  onChange={(e) => updateSettings({ logoText: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => updateSettings({ tagline: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Eye className="text-emerald-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold">Live Preview</h2>
          </div>

          {/* Preview Content */}
          <div 
            className="rounded-xl overflow-hidden border border-zinc-700"
            style={{ 
              fontFamily: settings.fontFamily,
              borderRadius: settings.borderRadius 
            }}
          >
            {/* Preview Header */}
            <div className="bg-zinc-800 p-4 flex items-center justify-between">
              <span className="font-bold" style={{ color: settings.primaryColor }}>
                {settings.logoText}
              </span>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: settings.primaryColor, borderRadius: settings.borderRadius }}
                />
              </div>
            </div>

            {/* Preview Hero */}
            <div 
              className="p-8 text-center"
              style={{ background: `linear-gradient(to bottom right, ${settings.primaryColor}20, transparent)` }}
            >
              <h3 
                className="text-2xl font-bold mb-2"
                style={{ color: settings.textColor }}
              >
                {settings.logoText}
              </h3>
              <p className="text-gray-400 mb-4">{settings.tagline}</p>
              <button
                className="px-6 py-2 font-medium"
                style={{ 
                  backgroundColor: settings.primaryColor,
                  borderRadius: settings.borderRadius,
                  color: '#000'
                }}
              >
                Shop Now
              </button>
            </div>

            {/* Preview Products */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div 
                  key={i}
                  className="bg-zinc-800 overflow-hidden"
                  style={{ borderRadius: settings.borderRadius }}
                >
                  <div className="aspect-square bg-zinc-700" />
                  <div className="p-3">
                    <p className="font-medium text-sm">Product {i}</p>
                    <p style={{ color: settings.primaryColor }} className="text-sm font-bold">$99.00</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Button States */}
            <div className="p-4 space-y-2">
              <button
                className="w-full py-2 font-medium"
                style={{ 
                  backgroundColor: settings.primaryColor,
                  borderRadius: settings.borderRadius,
                  color: '#000'
                }}
              >
                Primary Button
              </button>
              <button
                className="w-full py-2 font-medium border"
                style={{ 
                  borderColor: settings.primaryColor,
                  borderRadius: settings.borderRadius,
                  color: settings.primaryColor
                }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
