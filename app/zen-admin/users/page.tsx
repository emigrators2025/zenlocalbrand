'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Globe,
  Monitor,
  Clock,
  Search,
  Filter,
  Trash2,
  Download,
  RefreshCw,
  MapPin,
  User,
  UserCheck,
} from 'lucide-react';
import { useUsersStore, UserLogin } from '@/stores/users';

export default function AdminUsersPage() {
  const { logins, clearOldLogins } = useUsersStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registered' | 'guest'>('all');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredLogins = logins.filter(login => {
    const matchesSearch = 
      login.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      login.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      login.ip.includes(searchTerm) ||
      login.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'registered' && login.isRegistered) ||
      (filterType === 'guest' && !login.isRegistered);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalLogins: logins.length,
    registeredUsers: logins.filter(l => l.isRegistered).length,
    guests: logins.filter(l => !l.isRegistered).length,
    uniqueIPs: new Set(logins.map(l => l.ip)).size,
  };

  const exportData = () => {
    const data = logins.map(l => ({
      Email: l.email || 'Guest',
      Name: l.name || 'Unknown',
      IP: l.ip,
      Location: l.location || 'Unknown',
      Device: l.device,
      Browser: l.browser,
      Date: formatDate(l.timestamp),
      Type: l.isRegistered ? 'Registered' : 'Guest',
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zen-logins-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users & Logins</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track visitor activity and IP addresses
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Download size={18} />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => clearOldLogins(30)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={18} />
            Clear Old
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Logins', value: stats.totalLogins, icon: Users, color: 'emerald' },
          { label: 'Registered', value: stats.registeredUsers, icon: UserCheck, color: 'blue' },
          { label: 'Guests', value: stats.guests, icon: User, color: 'purple' },
          { label: 'Unique IPs', value: stats.uniqueIPs, icon: Globe, color: 'orange' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`text-${stat.color}-400`} size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by email, name, IP, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="pl-10 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="all">All Users</option>
            <option value="registered">Registered</option>
            <option value="guest">Guests</option>
          </select>
        </div>
      </div>

      {/* Logins Table */}
      {filteredLogins.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"
        >
          <Users className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">No Login Data Yet</h3>
          <p className="text-gray-400">
            User visits will appear here once they start browsing your store
          </p>
        </motion.div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-gray-400 font-medium">User</th>
                  <th className="text-left p-4 text-gray-400 font-medium">IP Address</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Location</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Device</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Time</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogins.map((login, index) => (
                  <motion.tr
                    key={login.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          login.isRegistered ? 'bg-emerald-500/10' : 'bg-zinc-800'
                        }`}>
                          {login.isRegistered ? (
                            <UserCheck className="text-emerald-400" size={20} />
                          ) : (
                            <User className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{login.name || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">{login.email || 'Guest'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-gray-400" />
                        <code className="text-sm bg-zinc-800 px-2 py-0.5 rounded">{login.ip}</code>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm">{login.location || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm">{login.device}</p>
                          <p className="text-gray-400 text-xs">{login.browser}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm">{formatDate(login.timestamp)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        login.isRegistered 
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {login.isRegistered ? 'Registered' : 'Guest'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
