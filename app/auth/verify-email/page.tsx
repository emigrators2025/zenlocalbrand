'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, sendVerificationEmail } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // If email is already verified, redirect to home
    if (user.emailVerified) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      await sendVerificationEmail();
      toast.success('Verification email sent!');
      setCountdown(60); // 60 second cooldown
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send verification email';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      // Reload user to get fresh email verification status
      await auth.currentUser?.reload();
      
      if (auth.currentUser?.emailVerified) {
        toast.success('Email verified successfully!');
        // Force state update
        window.location.href = '/';
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch {
      toast.error('Failed to check verification status');
    } finally {
      setIsChecking(false);
    }
  };

  if (!user) {
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
              <Mail className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-zinc-400">
              We&apos;ve sent a verification email to
            </p>
            <p className="text-emerald-400 font-medium mt-1">{user.email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Next Steps:</h3>
            <ol className="space-y-3 text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-medium">
                  1
                </span>
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-medium">
                  2
                </span>
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-medium">
                  3
                </span>
                <span>Come back here and click &quot;I&apos;ve Verified My Email&quot;</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  I&apos;ve Verified My Email
                </>
              )}
            </Button>

            <Button
              onClick={handleResendEmail}
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
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-zinc-500 text-sm">
              Wrong email?{' '}
              <Link href="/auth/signup" className="text-emerald-400 hover:underline">
                Sign up again
              </Link>
            </p>
            <p className="text-zinc-500 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white flex items-center justify-center gap-1">
                Continue without verifying <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
