"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

const faqCategories = [
  {
    name: "Orders & Shipping",
    faqs: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 3-5 business days across Egypt. Express shipping takes 1-2 business days, and Same Day Delivery is available in Cairo and Giza for orders placed before 2 PM."
      },
      {
        question: "Do you ship outside Egypt?",
        answer: "Currently, we only ship within Egypt. We deliver to all governorates including Cairo, Giza, Alexandria, Dakahlia, Sharqia, and all other regions."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order ships, you will receive an SMS and email with a tracking number. You can also track your order by logging into your account and viewing your order history."
      },
      {
        question: "Can I change or cancel my order?",
        answer: "You can modify or cancel your order within 1 hour of placing it. After that, orders enter processing and cannot be changed. Please contact support immediately at +201062137061 if you need to make changes."
      },
      {
        question: "Is there free shipping?",
        answer: "Yes! We offer FREE standard shipping on all orders over 1,500 EGP. No code needed - the discount is applied automatically at checkout."
      },
    ]
  },
  {
    name: "Returns & Refunds",
    faqs: [
      {
        question: "What is your return policy?",
        answer: "We offer a 14-day return policy on all unworn items with original tags attached. Items must be in their original condition for a full refund. Sale items are final sale."
      },
      {
        question: "How do I start a return?",
        answer: "To start a return, contact us at support@zenlocalbrand.shop or call +201062137061. Our team will guide you through the return process."
      },
      {
        question: "How long do refunds take?",
        answer: "Once we receive your return, please allow 5-7 business days for inspection and processing. Refunds will be credited to your original payment method within 3-5 business days after approval."
      },
      {
        question: "Do you offer exchanges?",
        answer: "Yes, we offer exchanges for different sizes or colors. Simply contact our support team and we will arrange the exchange for you."
      },
    ]
  },
  {
    name: "Products & Sizing",
    faqs: [
      {
        question: "How do I find my size?",
        answer: "Each product page includes a detailed size guide with measurements. We recommend measuring your body and comparing to our size charts for the best fit. When in doubt, size up!"
      },
      {
        question: "Are your products true to size?",
        answer: "Our products generally run true to size. However, some items may have a relaxed or oversized fit. Check the product description and reviews for specific fit information."
      },
      {
        question: "What materials do you use?",
        answer: "We use high-quality materials including premium cotton and sustainable materials. Each product page lists the specific materials used."
      },
      {
        question: "How should I care for my items?",
        answer: "Care instructions are included on each product tag and product page. Generally, we recommend washing in cold water and air drying to maintain quality and longevity."
      },
    ]
  },
  {
    name: "Account & Payment",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "Click on the Sign Up link in the navigation or during checkout. You will need to provide your email, create a password, and fill in your basic information."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept Cash on Delivery (COD) across Egypt, as well as credit/debit cards (Visa, Mastercard) and mobile wallets. All online transactions are securely encrypted."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard SSL encryption and never store your complete payment information. All transactions are processed through secure payment providers."
      },
      {
        question: "Can I pay cash on delivery?",
        answer: "Yes! Cash on Delivery is available for all orders within Egypt. You can pay in cash when your order arrives."
      },
    ]
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Find answers to common questions about our products and services
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.section
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">{category.name}</h2>
              <div className="space-y-3">
                {category.faqs.map((faq, faqIndex) => {
                  const itemId = `${categoryIndex}-${faqIndex}`;
                  const isOpen = openItems.includes(itemId);

                  return (
                    <div
                      key={itemId}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="text-white font-medium pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4">
                              <p className="text-gray-400">{faq.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
            <p className="text-gray-400 mb-4">
              Our support team is here to help you with anything you need.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
