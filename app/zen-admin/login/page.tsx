'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/stores/admin';
import { ADMIN_PASSWORD, ADMIN_USERNAME, PRIMARY_ADMIN_EMAIL } from '@/lib/security';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, verifySigningKey, isAuthenticated, signingKeyVerified, setAdminEmail } = useAdminStore();
  
  const [step, setStep] = useState<'credentials' | 'signing-key'>(
    isAuthenticated && !signingKeyVerified ? 'signing-key' : 'credentials'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signingKey, setSigningKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedIdentifier = username.trim().toLowerCase();
    const acceptsIdentifier =
      normalizedIdentifier === ADMIN_USERNAME.toLowerCase() ||
      normalizedIdentifier === PRIMARY_ADMIN_EMAIL.toLowerCase();

    // Verify credentials
    if (acceptsIdentifier && password === ADMIN_PASSWORD) {
      const token = btoa(`ZEN-ADMIN-${Date.now()}-${Math.random().toString(36)}`);
      login(token);
      setAdminEmail(PRIMARY_ADMIN_EMAIL);
      toast.success('Credentials verified!');
      setStep('signing-key');
    } else {
      setError('Invalid username or password');
      toast.error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const handleSigningKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (verifySigningKey(signingKey)) {
      toast.success('Welcome to ZEN Admin Panel!');
      router.push('/zen-admin');
    } else {
      setError('Invalid signing key');
      toast.error('Invalid signing key');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-2xl mb-4"
            >
              <Shield className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-zinc-400">
              {step === 'credentials' 
                ? 'Enter your admin credentials' 
                : 'Enter your signing key to continue'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${step === 'credentials' ? 'bg-emerald-500' : 'bg-emerald-500/30'}`} />
            <div className={`w-12 h-0.5 ${step === 'signing-key' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'signing-key' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Step 1: Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ZenAdmin2026 or owner email"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-12 pr-12 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* Step 2: Signing Key */}
          {step === 'signing-key' && (
            <form onSubmit={handleSigningKeySubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Admin Signing Key
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={signingKey}
                    onChange={(e) => setSigningKey(e.target.value)}
                    placeholder="Enter your signing key"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  The signing key was provided during admin account setup
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Access Admin Panel'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full text-sm text-zinc-400 hover:text-white"
              >
                Back to credentials
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-zinc-900/50 rounded-xl">
            <p className="text-xs text-zinc-500 text-center">
               This is a secure admin area. All access attempts are logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
