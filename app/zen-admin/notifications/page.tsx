'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Send,
  Edit,
  Trash2,
  Clock,
  Users,
  Mail,
  Package,
  Truck,
  Tag,
  Settings,
  X,
  Check,
} from 'lucide-react';
import { useNotificationsStore, Notification } from '@/stores/notifications';

interface NotificationForm {
  type: 'order' | 'shipping' | 'promo' | 'system';
  title: string;
  message: string;
  recipientType: 'all' | 'specific' | 'subscribers';
  recipientEmail: string;
}

const initialForm: NotificationForm = {
  type: 'promo',
  title: '',
  message: '',
  recipientType: 'all',
  recipientEmail: '',
};

const notificationTypes = [
  { value: 'order', label: 'Order Update', icon: Package, color: 'blue' },
  { value: 'shipping', label: 'Shipping Update', icon: Truck, color: 'purple' },
  { value: 'promo', label: 'Promotion', icon: Tag, color: 'emerald' },
  { value: 'system', label: 'System', icon: Settings, color: 'orange' },
];

const templates = [
  {
    type: 'order',
    title: 'Order Confirmed!',
    message: 'Thank you for your order! We\'re preparing your items and will notify you when they ship.',
  },
  {
    type: 'shipping',
    title: 'Your Order Has Shipped!',
    message: 'Great news! Your order is on its way. Track your package using the link in your email.',
  },
  {
    type: 'promo',
    title: ' Special Offer Just for You!',
    message: 'Enjoy 20% off your next purchase with code ZENLOCAL20. Valid for 48 hours only!',
  },
  {
    type: 'system',
    title: 'Account Update',
    message: 'Your account has been successfully updated. If you didn\'t make this change, please contact support.',
  },
];

export default function AdminNotificationsPage() {
  const { notifications, addNotification, deleteNotification, sendNotification } = useNotificationsStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NotificationForm>(initialForm);

  const handleSubmit = (e: React.FormEvent, sendImmediately: boolean = false) => {
    e.preventDefault();
    
    addNotification({
      ...form,
      status: sendImmediately ? 'sent' : 'draft',
      sentAt: sendImmediately ? new Date() : undefined,
    });

    setForm(initialForm);
    setShowForm(false);
  };

  const handleSend = (id: string) => {
    if (confirm('Send this notification to all recipients?')) {
      sendNotification(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this notification?')) {
      deleteNotification(id);
    }
  };

  const useTemplate = (template: typeof templates[0]) => {
    setForm(prev => ({
      ...prev,
      type: template.type as any,
      title: template.title,
      message: template.message,
    }));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    draft: notifications.filter(n => n.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">
            Send notifications to your customers
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setForm(initialForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
        >
          <Plus size={20} />
          New Notification
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
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Bell className="text-emerald-400" size={24} />
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
              <p className="text-gray-400 text-sm">Sent</p>
              <p className="text-2xl font-bold mt-1">{stats.sent}</p>
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
              <p className="text-gray-400 text-sm">Drafts</p>
              <p className="text-2xl font-bold mt-1">{stats.draft}</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Edit className="text-orange-400" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"
        >
          <Bell className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">No Notifications Yet</h3>
          <p className="text-gray-400 mb-6">
            Create notifications to keep your customers informed
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
          >
            <Plus size={20} />
            Create First Notification
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => {
            const typeConfig = notificationTypes.find(t => t.value === notification.type);
            const TypeIcon = typeConfig?.icon || Bell;
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${typeConfig?.color}-500/10`}>
                    <TypeIcon className={`text-${typeConfig?.color}-400`} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        notification.status === 'sent'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {notification.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-gray-400">
                        {typeConfig?.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {notification.recipientType === 'all' ? 'All customers' :
                         notification.recipientType === 'subscribers' ? 'Subscribers' :
                         notification.recipientEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {notification.sentAt 
                          ? `Sent ${formatDate(notification.sentAt)}`
                          : `Created ${formatDate(notification.createdAt)}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {notification.status === 'draft' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(notification.id)}
                        className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        <Send size={18} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Notification Modal */}
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
              className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
                <h2 className="text-xl font-bold">New Notification</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4">
                {/* Quick Templates */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quick Templates</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => useTemplate(template)}
                        className="p-2 text-left text-xs bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors truncate"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {notificationTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, type: type.value as any }))}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                          form.type === type.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        <type.icon size={18} />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Notification title"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    placeholder="Write your notification message..."
                    rows={4}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium mb-2">Recipients</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Customers', icon: Users },
                      { value: 'subscribers', label: 'Subscribers Only', icon: Mail },
                      { value: 'specific', label: 'Specific Email', icon: Mail },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          form.recipientType === option.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="recipientType"
                          value={option.value}
                          checked={form.recipientType === option.value}
                          onChange={(e) => setForm(prev => ({ ...prev, recipientType: e.target.value as any }))}
                          className="hidden"
                        />
                        <option.icon size={18} />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {form.recipientType === 'specific' && (
                    <input
                      type="email"
                      value={form.recipientEmail}
                      onChange={(e) => setForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      placeholder="customer@email.com"
                      className="w-full mt-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-zinc-800">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Save as Draft
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={(e) => handleSubmit(e as any, true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
                  >
                    <Send size={18} />
                    Send Now
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
