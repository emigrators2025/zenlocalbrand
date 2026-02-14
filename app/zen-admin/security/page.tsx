'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Key,
  Clock,
  Monitor,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  LogOut,
  Lock,
  Smartphone,
  Globe,
  Activity,
  Eye,
  EyeOff,
  Copy,
  Check,
  Settings,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LoginAttempt {
  id: string;
  timestamp: Date;
  success: boolean;
  ip: string;
  userAgent: string;
  location?: string;
}

const SIGNING_KEY = 'ZEN-2026-ADMIN-KEY-X9K4M2P7Q3R8L5N1';

export default function AdminSecurityPage() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    signingKeyVerified, 
    adminEmail, 
    logout,
    getSessionInfo 
  } = useAdminStore();
  
  const [showSigningKey, setShowSigningKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    loginTime: number | null;
    lastActivity: number | null;
    remainingTime: number;
  } | null>(null);
  
  // Mock login attempts - in production, fetch from Firestore
  const [loginAttempts] = useState<LoginAttempt[]>([
    {
      id: '1',
      timestamp: new Date(),
      success: true,
      ip: '192.168.1.1',
      userAgent: 'Chrome/120.0 Windows',
      location: 'Cairo, Egypt',
    },
  ]);

  useEffect(() => {
    if (isAuthenticated && signingKeyVerified) {
      // Update every second
      const interval = setInterval(() => {
        setSessionInfo(getSessionInfo());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, signingKeyVerified, getSessionInfo]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatDateTime = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const copySigningKey = async () => {
    try {
      await navigator.clipboard.writeText(SIGNING_KEY);
      setCopied(true);
      toast.success('Signing key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleForceLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/zen-admin/login');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
        <p className="text-zinc-400">Manage your admin security and session settings</p>
      </motion.div>

      {/* Current Session */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Monitor className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Current Session</h2>
            <p className="text-sm text-zinc-400">Active session information</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Session Started</span>
            </div>
            <p className="text-white font-medium">
              {formatDateTime(sessionInfo?.loginTime)}
            </p>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Last Activity</span>
            </div>
            <p className="text-white font-medium">
              {formatDateTime(sessionInfo?.lastActivity)}
            </p>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Session Expires In</span>
            </div>
            <p className={`font-medium ${
              sessionInfo && sessionInfo.remainingTime < 5 * 60 * 1000 
                ? 'text-amber-400' 
                : 'text-emerald-400'
            }`}>
              {sessionInfo ? formatDuration(sessionInfo.remainingTime) : 'N/A'}
            </p>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Authenticated</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleForceLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </motion.div>

      {/* Signing Key */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Key className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Signing Key</h2>
            <p className="text-sm text-zinc-400">Required for admin panel access</p>
          </div>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 font-mono text-sm overflow-hidden">
              {showSigningKey ? (
                <span className="text-emerald-400">{SIGNING_KEY}</span>
              ) : (
                <span className="text-zinc-500">••••••••••••••••••••••••••••••••</span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setShowSigningKey(!showSigningKey)}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                {showSigningKey ? (
                  <EyeOff className="w-5 h-5 text-zinc-400" />
                ) : (
                  <Eye className="w-5 h-5 text-zinc-400" />
                )}
              </button>
              <button
                onClick={copySigningKey}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-400">
            <p className="font-medium mb-1">Keep this key secure!</p>
            <p className="text-amber-400/80">
              Never share your signing key. Anyone with this key can access your admin panel.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Session Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Session Settings</h2>
            <p className="text-sm text-zinc-400">Configure session behavior</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="text-white font-medium">Inactivity Timeout</p>
              <p className="text-sm text-zinc-400">Auto logout after period of inactivity</p>
            </div>
            <div className="text-emerald-400 font-medium">30 minutes</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="text-white font-medium">Persistent Session</p>
              <p className="text-sm text-zinc-400">Stay logged in until manual sign out</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="text-white font-medium">Two-Step Verification</p>
              <p className="text-sm text-zinc-400">Signing key required after credentials</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Login Attempts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recent Login Attempts</h2>
            <p className="text-sm text-zinc-400">Monitor access to your admin panel</p>
          </div>
        </div>

        <div className="space-y-3">
          {loginAttempts.length > 0 ? (
            loginAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl"
              >
                <div className={`p-2 rounded-lg ${
                  attempt.success ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}>
                  {attempt.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      attempt.success ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {attempt.success ? 'Successful Login' : 'Failed Attempt'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
                    <span>{attempt.ip}</span>
                    <span>•</span>
                    <span>{attempt.userAgent}</span>
                    {attempt.location && (
                      <>
                        <span>•</span>
                        <span>{attempt.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm text-zinc-500">
                  {attempt.timestamp.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-500">
              No login attempts recorded
            </div>
          )}
        </div>
      </motion.div>

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Tips</h2>
            <p className="text-sm text-zinc-400">Best practices for admin security</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: Lock,
              title: 'Use Strong Passwords',
              description: 'Combine uppercase, lowercase, numbers, and symbols',
            },
            {
              icon: Key,
              title: 'Protect Your Signing Key',
              description: 'Never share or store it in plain text',
            },
            {
              icon: Smartphone,
              title: 'Check Login Alerts',
              description: 'Review email notifications for unusual activity',
            },
            {
              icon: LogOut,
              title: 'Log Out When Done',
              description: 'Always sign out on shared or public devices',
            },
          ].map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-xl"
            >
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <tip.icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">{tip.title}</p>
                <p className="text-sm text-zinc-400">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
