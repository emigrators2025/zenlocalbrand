'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl' },
  };

  return (
    <Link href="/" className="flex items-center gap-3">
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className={`${sizes[size].icon} relative`}
      >
        {/* ZEN Logo - Stylized Z with gradient */}
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <defs>
            <linearGradient id="zenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Background circle */}
          <circle cx="25" cy="25" r="24" fill="url(#zenGradient)" filter="url(#glow)"/>
          {/* Z letter */}
          <path
            d="M14 14 L36 14 L36 18 L22 32 L36 32 L36 36 L14 36 L14 32 L28 18 L14 18 Z"
            fill="white"
            strokeWidth="0"
          />
          {/* Inner diamond accent */}
          <path
            d="M25 20 L28 25 L25 30 L22 25 Z"
            fill="rgba(255,255,255,0.3)"
          />
        </svg>
      </motion.div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-black text-white tracking-tight leading-none`}>
            ZEN
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 tracking-[0.2em] uppercase">
            Local Brand
          </span>
        </div>
      )}
    </Link>
  );
}
