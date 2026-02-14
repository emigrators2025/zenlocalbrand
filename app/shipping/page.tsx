"use client";

import { motion } from "framer-motion";
import { Truck, Clock, Globe, Shield, Package, MapPin } from "lucide-react";

const shippingMethods = [
  {
    name: "Standard Shipping",
    time: "3-5 Business Days",
    price: "50 EGP",
    description: "Reliable delivery across Egypt",
  },
  {
    name: "Express Shipping",
    time: "1-2 Business Days",
    price: "100 EGP",
    description: "Faster delivery when you need it sooner",
  },
  {
    name: "Same Day Delivery",
    time: "Same Day",
    price: "150 EGP",
    description: "Available in Cairo & Giza only",
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Shipping Information
          </h1>
          <p className="text-gray-400 text-lg">
            Everything you need to know about our shipping policies
          </p>
        </motion.div>

        {/* Shipping Methods */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Truck className="w-6 h-6 text-emerald-500" />
            Shipping Methods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shippingMethods.map((method) => (
              <div
                key={method.name}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{method.name}</h3>
                  <span className="text-emerald-500 font-bold">{method.price}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{method.description}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {method.time}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Free Shipping */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Free Shipping
            </h3>
            <p className="text-gray-300">
              Enjoy FREE standard shipping on all orders over <span className="text-emerald-500 font-bold">5,000 EGP</span>! 
              No code needed - discount applied automatically at checkout.
            </p>
          </div>
        </motion.section>

        {/* Processing Time */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-500" />
            Processing Time
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              All orders are processed within <span className="text-white font-semibold">1-2 business days</span>. 
              Orders placed on weekends or holidays will be processed the next business day.
            </p>
            <p className="text-gray-400 text-sm">
              Once your order ships, you will receive a confirmation email with tracking information.
            </p>
          </div>
        </motion.section>

        {/* Delivery Areas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Globe className="w-6 h-6 text-emerald-500" />
            Delivery Areas
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              We currently deliver exclusively within <span className="text-emerald-500 font-bold">Egypt</span>. 
              We ship to all governorates including Cairo, Giza, Alexandria, and all other regions.
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Same-day delivery is available in Cairo and Giza for orders placed before 2 PM.
            </p>
            <div className="text-gray-500 text-sm">
              <strong className="text-white">Coverage:</strong> All Egyptian governorates - 
              Cairo, Giza, Alexandria, Dakahlia, Sharqia, Gharbia, Qalyubia, and more.
            </div>
          </div>
        </motion.section>

        {/* Tracking */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-emerald-500" />
            Order Tracking
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Once your order ships, you will receive an email with your tracking number. 
              You can track your package using the link provided or by logging into your account.
            </p>
            <p className="text-gray-400 text-sm">
              If you have any questions about your order, please contact our support team.
            </p>
          </div>
        </motion.section>

        {/* Guarantee */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-500" />
            Shipping Guarantee
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-300">
              We guarantee safe delivery of all orders. If your package is lost or damaged during 
              shipping, we will send a replacement at no additional cost. Your satisfaction is our priority.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
