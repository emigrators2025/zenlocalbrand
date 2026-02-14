'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Trash2,
  Eye,
  X,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: Date;
}

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      const fetchedMessages: ContactMessage[] = (data.contacts || []).map((contact: { id: string; name?: string; email?: string; phone?: string; subject?: string; message?: string; status?: string; createdAt?: string }) => ({
        id: contact.id,
        name: contact.name || 'Unknown',
        email: contact.email || '',
        phone: contact.phone || '',
        subject: contact.subject || 'No Subject',
        message: contact.message || '',
        status: contact.status || 'unread',
        createdAt: contact.createdAt ? new Date(contact.createdAt) : new Date(),
      }));
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (message: ContactMessage) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: message.id, status: 'read' }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: 'read' } : m))
      );
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, status: 'read' });
      }
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleMarkAsReplied = async (message: ContactMessage) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: message.id, status: 'replied' }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: 'replied' } : m))
      );
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, status: 'replied' });
      }
      toast.success('Marked as replied');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesFilter = filter === 'all' || message.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'read':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'replied':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'read':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'replied':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
          <p className="text-zinc-400">
            {unreadCount > 0 
              ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
              : 'All messages have been read'}
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-xl">
          {(['all', 'unread', 'read', 'replied'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Messages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">
              {searchQuery || filter !== 'all'
                ? 'No messages match your filters'
                : 'No contact messages yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                  message.status === 'unread' ? 'bg-emerald-500/5' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (message.status === 'unread') {
                    handleMarkAsRead(message);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`font-medium truncate ${
                        message.status === 'unread' ? 'text-white' : 'text-zinc-300'
                      }`}>
                        {message.name}
                      </h3>
                      <span className="text-xs text-zinc-500 whitespace-nowrap">
                        {message.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-400 truncate mb-1">
                      {message.subject}
                    </p>
                    <p className="text-sm text-zinc-500 truncate">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-lg border ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message.id);
                      }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedMessage.status)}
                  <span className={`px-2 py-1 text-xs rounded-lg border ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-zinc-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <h2 className="text-xl font-bold text-white mb-4">
                  {selectedMessage.subject}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-zinc-400" />
                    <span className="text-white">{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-zinc-400" />
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-zinc-400" />
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-400">
                      {selectedMessage.createdAt.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400">Message</span>
                  </div>
                  <p className="text-white whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-800">
                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={() => handleMarkAsReplied(selectedMessage)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Replied</span>
                  </button>
                )}
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
