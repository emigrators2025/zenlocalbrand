"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Heart, Leaf, Truck } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Passion for Fashion",
    description: "Every piece we create is born from our love for exceptional design and quality craftsmanship.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "We are committed to sustainable practices, using eco-friendly materials wherever possible.",
  },
  {
    icon: Award,
    title: "Quality First",
    description: "We never compromise on quality. Every item undergoes rigorous quality checks.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "We ensure your orders reach you quickly and safely, no matter where you are.",
  },
];

const team = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    image: "/team/alex.jpg",
  },
  {
    name: "Sarah Johnson",
    role: "Creative Director",
    image: "/team/sarah.jpg",
  },
  {
    name: "Mike Williams",
    role: "Head of Operations",
    image: "/team/mike.jpg",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Our Story
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Founded in 2026, ZEN LOCAL BRAND was born from a passion for creating 
              high-quality streetwear that combines comfort with cutting-edge design.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-400 mb-4">
                At ZEN LOCAL BRAND, we believe that fashion should be accessible to everyone 
                without compromising on quality or style. Our mission is to create timeless 
                pieces that empower individuals to express their unique identity.
              </p>
              <p className="text-gray-400 mb-6">
                We are dedicated to pushing the boundaries of streetwear, blending classic 
                aesthetics with modern innovation. Every collection tells a story, and every 
                piece is crafted with intention and care.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
              >
                Explore Our Collection
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-6xl font-bold text-white/10">ZEN.</h2>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These core principles guide everything we do at ZEN LOCAL BRAND.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Happy Customers" },
              { number: "50+", label: "Products" },
              { number: "15+", label: "Countries" },
              { number: "99%", label: "Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-emerald-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Join the ZEN Community
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Be the first to know about new drops, exclusive offers, and style tips.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
