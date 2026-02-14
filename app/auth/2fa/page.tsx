'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useAdminStore } from '@/stores/admin';
import { PRIMARY_ADMIN_EMAIL } from '@/lib/security';

function TwoFactorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: adminLogin, setAdminEmail } = useAdminStore();
  
  const [code, setCode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(600); // 10 minutes in seconds

  const userId = searchParams.get('uid');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!userId || !email) {
      router.push('/auth/login');
    }
  }, [userId, email, router]);

  useEffect(() => {
    // Countdown for code expiration
    if (expiresIn > 0) {
      const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [expiresIn]);

  useEffect(() => {
    // Countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow alphanumeric characters
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);

    // Auto-focus next input
    if (sanitized.length === 3 && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (pastedData.length >= 12) {
      setCode([
        pastedData.slice(0, 3),
        pastedData.slice(3, 6),
        pastedData.slice(6, 9),
        pastedData.slice(9, 12),
      ]);
    }
  };

  const notifyLogin = async (payload: {
    email: string;
    status: 'success' | 'failed' | '2fa_required';
    reason?: string;
    userId?: string;
    isAdmin?: boolean;
  }) => {
    try {
      await fetch('/api/auth/login-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Login alert failed', error);
    }
  };

  const isAdminAccount = email && email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 12) {
      toast.error('Please enter the complete 12-character code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store 2FA verification in session
      sessionStorage.setItem('2fa_verified', userId!);
      
      await notifyLogin({
        email: email!,
        status: 'success',
        userId: userId ?? undefined,
        isAdmin: !!isAdminAccount,
      });

      if (isAdminAccount) {
        const token = btoa(`ZEN-ADMIN-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        adminLogin(token);
        setAdminEmail(email!);
      }

      toast.success('Verification successful!');
      router.push(isAdminAccount ? '/zen-admin/login' : '/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      if (email) {
        await notifyLogin({
          email,
          status: 'failed',
          reason: message,
          userId: userId ?? undefined,
          isAdmin: !!isAdminAccount,
        });
      }
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/2fa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      toast.success('New verification code sent!');
      setCountdown(60);
      setExpiresIn(600); // Reset expiration
      setCode(['', '', '', '']); // Clear inputs
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send code';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!userId || !email) {
    return null;
  }

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center py-12 px-4">
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
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-6"
            >
              <Shield className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h1>
            <p className="text-zinc-400">
              Enter the 12-character code sent to
            </p>
            <p className="text-emerald-400 font-medium mt-1">{email}</p>
          </div>

          {/* Code Expiration */}
          <div className={`text-center mb-6 ${expiresIn < 120 ? 'text-red-400' : 'text-zinc-500'}`}>
            <p className="text-sm">
              Code expires in <span className="font-mono font-bold">{formatTime(expiresIn)}</span>
            </p>
          </div>

          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
            {code.map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  id={`code-${index}`}
                  type="text"
                  value={segment}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={3}
                  className="w-16 h-14 text-center text-xl font-mono font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                  placeholder="XXX"
                />
                {index < 3 && <span className="text-zinc-500 text-2xl">-</span>}
              </div>
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying || code.join('').length !== 12}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 mb-4"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                Verify Code
              </>
            )}
          </Button>

          {/* Resend Code */}
          <Button
            onClick={handleResendCode}
            disabled={isResending || countdown > 0}
            variant="outline"
            className="w-full border-white/10 hover:bg-white/5 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Resend in {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Resend Code
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="mt-8 bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Security Tips
            </h4>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• Check your inbox and spam folder</li>
              <li>• The code is case-insensitive</li>
              <li>• Never share your code with anyone</li>
              <li>• Each code can only be used once</li>
            </ul>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-zinc-400 hover:text-white flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <TwoFactorContent />
    </Suspense>
  );
}
