'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  brandName?: string;
  tagline?: string;
  inverted?: boolean;
}

export function Logo({ size = 'md', showText = false, inverted = false }: LogoProps) {
  const sizes = {
    sm: { width: 80, height: 32 },
    md: { width: 120, height: 48 },
    lg: { width: 160, height: 64 },
    xl: { width: 200, height: 80 },
  };

  return (
    <Link href="/" className="flex items-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Image
          src="/logo.png"
          alt="ZEN Local Brand"
          width={sizes[size].width}
          height={sizes[size].height}
          className={`object-contain ${inverted ? 'brightness-0 invert' : ''}`}
          priority
        />
      </motion.div>
    </Link>
  );
}
