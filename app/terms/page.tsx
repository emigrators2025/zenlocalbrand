"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400">
            Last updated: January 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert max-w-none"
        >
          <div className="space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing and using ZEN LOCAL BRAND website and services, you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by these terms, 
                please do not use this service.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">2. Use License</h2>
              <p className="text-gray-300 mb-4">
                Permission is granted to temporarily access the materials (information or software) on 
                ZEN LOCAL BRAND website for personal, non-commercial transitory viewing only.
              </p>
              <p className="text-gray-300">
                This license shall automatically terminate if you violate any of these restrictions and 
                may be terminated by ZEN LOCAL BRAND at any time.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">3. Product Information</h2>
              <p className="text-gray-300 mb-4">
                We make every effort to display as accurately as possible the colors and images of our 
                products. We cannot guarantee that your computer monitor display of any color will be accurate.
              </p>
              <p className="text-gray-300">
                We reserve the right to limit the quantities of any products or services that we offer. 
                All descriptions of products and pricing are subject to change at any time without notice.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">4. Orders and Payment</h2>
              <p className="text-gray-300 mb-4">
                By placing an order, you warrant that you are legally capable of entering into binding contracts. 
                All orders are subject to acceptance and availability.
              </p>
              <p className="text-gray-300">
                We reserve the right to refuse or cancel any order for any reason, including but not limited to 
                product availability, errors in product or pricing information, or fraud.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">5. Returns and Refunds</h2>
              <p className="text-gray-300 mb-4">
                We offer a 30-day return policy on all unworn items with original tags attached. 
                Items must be in their original condition for a full refund.
              </p>
              <p className="text-gray-300">
                Sale items are final sale and cannot be returned or exchanged. 
                Shipping costs are non-refundable.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-gray-300">
                All content on this website, including but not limited to text, graphics, logos, images, 
                and software, is the property of ZEN LOCAL BRAND and is protected by international 
                copyright laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-300">
                ZEN LOCAL BRAND shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">8. Changes to Terms</h2>
              <p className="text-gray-300">
                We reserve the right to modify these terms at any time. Changes will be effective immediately 
                upon posting to the website. Your continued use of the service constitutes acceptance of 
                the modified terms.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">9. Contact Information</h2>
              <p className="text-gray-300">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@zenlocalbrand.com" className="text-emerald-500 hover:text-emerald-400">
                  legal@zenlocalbrand.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
