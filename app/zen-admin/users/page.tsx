'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Globe,
  Monitor,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  User,
  UserCheck,
  Mail,
  ShoppingBag,
  DollarSign,
  Loader2,
  MoreVertical,
  KeyRound,
  Ban,
  CheckCircle,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';

interface DBUser {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  emailVerified?: boolean;
  isSubscribed?: boolean;
  disabled?: boolean;
  disabledAt?: string;
  orderCount?: number;
  totalSpent?: number;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'subscribed' | 'disabled'>('all');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'delete' | 'disable' | 'enable' | 'reset' | null;
    user: DBUser | null;
  }>({ type: null, user: null });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenu(null);
    if (actionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [actionMenu]);

  const handleSendResetLink = async (user: DBUser) => {
    setActionLoading(user.id);
    setConfirmDialog({ type: null, user: null });
    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.displayName || 'Customer' }),
      });
      if (response.ok) {
        showNotification('success', `Password reset link sent to ${user.email}`);
      } else {
        const data = await response.json();
        showNotification('error', data.error || 'Failed to send reset link');
      }
    } catch (error) {
      showNotification('error', 'Failed to send reset link');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisableAccount = async (user: DBUser) => {
    setActionLoading(user.id);
    setConfirmDialog({ type: null, user: null });
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, action: 'disable' }),
      });
      if (response.ok) {
        showNotification('success', `Account disabled for ${user.email}`);
        fetchUsers();
      } else {
        showNotification('error', 'Failed to disable account');
      }
    } catch (error) {
      showNotification('error', 'Failed to disable account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnableAccount = async (user: DBUser) => {
    setActionLoading(user.id);
    setConfirmDialog({ type: null, user: null });
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, action: 'enable' }),
      });
      if (response.ok) {
        showNotification('success', `Account enabled for ${user.email}`);
        fetchUsers();
      } else {
        showNotification('error', 'Failed to enable account');
      }
    } catch (error) {
      showNotification('error', 'Failed to enable account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: DBUser) => {
    setActionLoading(user.id);
    setConfirmDialog({ type: null, user: null });
    try {
      const response = await fetch(`/api/users?id=${user.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showNotification('success', `User ${user.email} deleted`);
        fetchUsers();
      } else {
        showNotification('error', 'Failed to delete user');
      }
    } catch (error) {
      showNotification('error', 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'verified' && user.emailVerified) ||
      (filterType === 'subscribed' && user.isSubscribed) ||
      (filterType === 'disabled' && user.disabled);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalUsers: users.length,
    verifiedUsers: users.filter(u => u.emailVerified).length,
    subscribedUsers: users.filter(u => u.isSubscribed).length,
    disabledUsers: users.filter(u => u.disabled).length,
    totalRevenue: users.reduce((sum, u) => sum + (u.totalSpent || 0), 0),
  };

  const exportData = () => {
    const data = users.map(u => ({
      Email: u.email || '',
      Name: u.displayName || 'Unknown',
      Phone: u.phone || '',
      EmailVerified: u.emailVerified ? 'Yes' : 'No',
      Subscribed: u.isSubscribed ? 'Yes' : 'No',
      Orders: u.orderCount || 0,
      TotalSpent: u.totalSpent || 0,
      JoinedAt: u.createdAt || '',
      LastLogin: u.lastLogin || '',
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zen-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users & Logins</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage registered users and track activity
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportData}
            disabled={users.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            Export
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'emerald' },
          { label: 'Verified', value: stats.verifiedUsers, icon: UserCheck, color: 'blue' },
          { label: 'Subscribed', value: stats.subscribedUsers, icon: Mail, color: 'purple' },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'orange' },
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
            placeholder="Search by email, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'verified' | 'subscribed' | 'disabled')}
            className="pl-10 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified</option>
            <option value="subscribed">Subscribed</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Loader2 className="mx-auto text-emerald-400 mb-4 animate-spin" size={48} />
          <p className="text-gray-400">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"
        >
          <Users className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Users will appear here once they register'}
          </p>
        </motion.div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-gray-400 font-medium">User</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Phone</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Orders</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Spent</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Last Login</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.emailVerified ? 'bg-emerald-500/10' : 'bg-zinc-800'
                        }`}>
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                          ) : user.emailVerified ? (
                            <UserCheck className="text-emerald-400" size={20} />
                          ) : (
                            <User className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.displayName || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{user.phone || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-gray-400" />
                        <span className="text-sm">{user.orderCount || 0}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-emerald-400">
                        {formatCurrency(user.totalSpent || 0)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-400">{formatDate(user.lastLogin)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.disabled && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                            Disabled
                          </span>
                        )}
                        {user.emailVerified && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                            Verified
                          </span>
                        )}
                        {user.isSubscribed && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                            Subscribed
                          </span>
                        )}
                        {!user.emailVerified && !user.isSubscribed && !user.disabled && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenu(actionMenu === user.id ? null : user.id);
                          }}
                          disabled={actionLoading === user.id}
                          className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <MoreVertical size={18} />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {actionMenu === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 overflow-hidden"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenu(null);
                                  setConfirmDialog({ type: 'reset', user });
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-700 transition-colors text-left"
                              >
                                <KeyRound size={16} className="text-blue-400" />
                                Send Reset Link
                              </button>
                              
                              {user.disabled ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenu(null);
                                    setConfirmDialog({ type: 'enable', user });
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-700 transition-colors text-left"
                                >
                                  <CheckCircle size={16} className="text-emerald-400" />
                                  Enable Account
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenu(null);
                                    setConfirmDialog({ type: 'disable', user });
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-700 transition-colors text-left"
                                >
                                  <Ban size={16} className="text-orange-400" />
                                  Disable Account
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenu(null);
                                  setConfirmDialog({ type: 'delete', user });
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left text-red-400"
                              >
                                <Trash2 size={16} />
                                Delete User
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.type && confirmDialog.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmDialog({ type: null, user: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${
                  confirmDialog.type === 'delete' ? 'bg-red-500/20' :
                  confirmDialog.type === 'disable' ? 'bg-orange-500/20' :
                  confirmDialog.type === 'enable' ? 'bg-emerald-500/20' :
                  'bg-blue-500/20'
                }`}>
                  {confirmDialog.type === 'delete' && <Trash2 className="text-red-400" size={24} />}
                  {confirmDialog.type === 'disable' && <Ban className="text-orange-400" size={24} />}
                  {confirmDialog.type === 'enable' && <CheckCircle className="text-emerald-400" size={24} />}
                  {confirmDialog.type === 'reset' && <KeyRound className="text-blue-400" size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {confirmDialog.type === 'delete' && 'Delete User'}
                    {confirmDialog.type === 'disable' && 'Disable Account'}
                    {confirmDialog.type === 'enable' && 'Enable Account'}
                    {confirmDialog.type === 'reset' && 'Send Password Reset'}
                  </h3>
                  <p className="text-gray-400 text-sm">{confirmDialog.user.email}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                {confirmDialog.type === 'delete' && (
                  <>Are you sure you want to permanently delete this user? This action cannot be undone.</>
                )}
                {confirmDialog.type === 'disable' && (
                  <>This will prevent the user from logging in. They can be re-enabled later.</>
                )}
                {confirmDialog.type === 'enable' && (
                  <>This will allow the user to log in again.</>
                )}
                {confirmDialog.type === 'reset' && (
                  <>A password reset link will be sent to the user&apos;s email address.</>
                )}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog({ type: null, user: null })}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmDialog.type === 'delete') handleDeleteUser(confirmDialog.user!);
                    if (confirmDialog.type === 'disable') handleDisableAccount(confirmDialog.user!);
                    if (confirmDialog.type === 'enable') handleEnableAccount(confirmDialog.user!);
                    if (confirmDialog.type === 'reset') handleSendResetLink(confirmDialog.user!);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium ${
                    confirmDialog.type === 'delete' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : confirmDialog.type === 'disable'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {confirmDialog.type === 'delete' && 'Delete'}
                  {confirmDialog.type === 'disable' && 'Disable'}
                  {confirmDialog.type === 'enable' && 'Enable'}
                  {confirmDialog.type === 'reset' && 'Send Link'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg z-50 ${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-80">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
