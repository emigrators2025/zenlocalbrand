'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Globe,
  DollarSign,
  Clock,
  X,
  Check,
  Power,
} from 'lucide-react';
import { useShippingStore, ShippingZone } from '@/stores/shipping';

interface ZoneForm {
  name: string;
  countries: string;
  regions: string;
  baseCost: number;
  freeShippingThreshold: number;
  estimatedDays: string;
  isActive: boolean;
}

const initialForm: ZoneForm = {
  name: '',
  countries: '',
  regions: '',
  baseCost: 0,
  freeShippingThreshold: 100,
  estimatedDays: '3-5 days',
  isActive: true,
};

const popularCountries = [
  'United States', 'Canada', 'United Kingdom', 'Australia',
  'Germany', 'France', 'Japan', 'South Korea',
  'UAE', 'Saudi Arabia', 'Egypt', 'India',
];

export default function AdminShippingPage() {
  const { zones, addZone, updateZone, deleteZone, toggleZone } = useShippingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ZoneForm>(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const zoneData = {
      name: form.name,
      countries: form.countries.split(',').map(c => c.trim()).filter(Boolean),
      regions: form.regions.split(',').map(r => r.trim()).filter(Boolean),
      baseCost: form.baseCost,
      freeShippingThreshold: form.freeShippingThreshold,
      estimatedDays: form.estimatedDays,
      isActive: form.isActive,
    };

    if (editingId) {
      updateZone(editingId, zoneData);
    } else {
      addZone(zoneData);
    }

    setForm(initialForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (zone: ShippingZone) => {
    setForm({
      name: zone.name,
      countries: zone.countries.join(', '),
      regions: zone.regions.join(', '),
      baseCost: zone.baseCost,
      freeShippingThreshold: zone.freeShippingThreshold,
      estimatedDays: zone.estimatedDays,
      isActive: zone.isActive,
    });
    setEditingId(zone.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this shipping zone?')) {
      deleteZone(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipping Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure shipping zones and rates
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setForm(initialForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
        >
          <Plus size={20} />
          Add Zone
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Zones</p>
              <p className="text-2xl font-bold mt-1">{zones.length}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Globe className="text-emerald-400" size={24} />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Zones</p>
              <p className="text-2xl font-bold mt-1">{zones.filter(z => z.isActive).length}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Check className="text-blue-400" size={24} />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Countries Covered</p>
              <p className="text-2xl font-bold mt-1">
                {new Set(zones.flatMap(z => z.countries)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <MapPin className="text-purple-400" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Zones List */}
      {zones.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"
        >
          <Truck className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">No Shipping Zones</h3>
          <p className="text-gray-400 mb-6">
            Create shipping zones to define delivery areas and rates
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
          >
            <Plus size={20} />
            Create First Zone
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-zinc-900 border rounded-xl p-6 ${
                zone.isActive ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{zone.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      zone.isActive 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 flex items-center gap-1 mb-1">
                        <Globe size={14} /> Countries
                      </p>
                      <p className="font-medium">
                        {zone.countries.length > 0 ? zone.countries.slice(0, 3).join(', ') : 'All'}
                        {zone.countries.length > 3 && ` +${zone.countries.length - 3} more`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 flex items-center gap-1 mb-1">
                        <DollarSign size={14} /> Base Cost
                      </p>
                      <p className="font-medium text-emerald-400">${zone.baseCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 flex items-center gap-1 mb-1">
                        <Truck size={14} /> Free Shipping
                      </p>
                      <p className="font-medium">Orders over ${zone.freeShippingThreshold}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 flex items-center gap-1 mb-1">
                        <Clock size={14} /> Delivery Time
                      </p>
                      <p className="font-medium">{zone.estimatedDays}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleZone(zone.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      zone.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    }`}
                  >
                    <Power size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(zone)}
                    className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <Edit size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(zone.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Zone Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Zone Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., North America, Europe, Local"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Countries (comma-separated)</label>
                  <textarea
                    value={form.countries}
                    onChange={(e) => setForm(prev => ({ ...prev, countries: e.target.value }))}
                    placeholder="United States, Canada, Mexico"
                    rows={2}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {popularCountries.slice(0, 6).map(country => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => {
                          const current = form.countries ? form.countries.split(',').map(c => c.trim()) : [];
                          if (!current.includes(country)) {
                            setForm(prev => ({
                              ...prev,
                              countries: [...current, country].join(', ')
                            }));
                          }
                        }}
                        className="text-xs px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700"
                      >
                        + {country}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Regions (comma-separated)</label>
                  <input
                    type="text"
                    value={form.regions}
                    onChange={(e) => setForm(prev => ({ ...prev, regions: e.target.value }))}
                    placeholder="California, New York, Texas"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Base Shipping Cost *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        value={form.baseCost}
                        onChange={(e) => setForm(prev => ({ ...prev, baseCost: parseFloat(e.target.value) || 0 }))}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Free Shipping Over</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        value={form.freeShippingThreshold}
                        onChange={(e) => setForm(prev => ({ ...prev, freeShippingThreshold: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Delivery Time</label>
                  <input
                    type="text"
                    value={form.estimatedDays}
                    onChange={(e) => setForm(prev => ({ ...prev, estimatedDays: e.target.value }))}
                    placeholder="3-5 business days"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Zone is active</span>
                </label>

                <div className="flex gap-4 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-4 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
                  >
                    {editingId ? 'Update Zone' : 'Add Zone'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
