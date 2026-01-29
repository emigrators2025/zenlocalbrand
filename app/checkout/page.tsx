'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, CheckCircle, Wallet, Banknote, Upload, Copy, Check, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { formatPrice } from '@/lib/utils';
import { createOrder } from '@/lib/db-service';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, name: 'Shipping', icon: Truck },
  { id: 2, name: 'Payment', icon: Wallet },
  { id: 3, name: 'Confirmation', icon: CheckCircle },
];

const INSTAPAY_NUMBER = '+201212549545';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    governorate: '',
    country: 'Egypt',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'instapay'>('cod');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');

  const subtotal = total;
  const shipping = subtotal > 1500 ? 0 : 50;
  const orderTotal = subtotal + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, address, city, governorate } = shippingInfo;
    
    if (!firstName || !lastName || !email || !phone || !address || !city || !governorate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setCurrentStep(2);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(INSTAPAY_NUMBER);
    setCopied(true);
    toast.success('InstaPay number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'instapay' && !paymentScreenshot) {
      toast.error('Please upload your payment screenshot');
      return;
    }
    
    setLoading(true);
    
    try {
      let screenshotUrl = '';
      
      // Upload screenshot if InstaPay
      if (paymentMethod === 'instapay' && paymentScreenshot) {
        const fileName = `payments/${Date.now()}_${paymentScreenshot.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, paymentScreenshot);
        screenshotUrl = await getDownloadURL(storageRef);
      }
      
      // Create order in database
      const newOrderNumber = `ZEN${Date.now().toString(36).toUpperCase()}`;
      
      await createOrder({
        userId: user?.uid || 'guest',
        userEmail: shippingInfo.email,
        userName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        userPhone: shippingInfo.phone,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        })),
        subtotal: total,
        shipping: shipping,
        total: orderTotal,
        status: 'pending',
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          governorate: shippingInfo.governorate,
          country: 'Egypt',
        },
        paymentMethod,
        paymentStatus: 'pending',
        paymentScreenshot: screenshotUrl || undefined,
        notes: `Order #${newOrderNumber}`,
      });
      
      // Send order confirmation emails
      try {
        await fetch('/api/orders/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail: shippingInfo.email,
            customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            customerPhone: shippingInfo.phone,
            orderNumber: newOrderNumber,
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            total: orderTotal,
            subtotal: total,
            shipping,
            paymentMethod,
            shippingAddress: {
              street: shippingInfo.address,
              city: shippingInfo.city,
              governorate: shippingInfo.governorate,
              country: 'Egypt',
            },
            paymentScreenshot: screenshotUrl || undefined,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail the order if emails fail
      }
      
      setOrderNumber(newOrderNumber);
      setLoading(false);
      setCurrentStep(3);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      setLoading(false);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (items.length === 0 && currentStep < 3) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="gradient-bg min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link 
            href="/cart"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <step.icon className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Governorate *
                      </label>
                      <select
                        value={shippingInfo.governorate}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, governorate: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Governorate</option>
                        <option value="Cairo">Cairo</option>
                        <option value="Giza">Giza</option>
                        <option value="Alexandria">Alexandria</option>
                        <option value="Dakahlia">Dakahlia</option>
                        <option value="Sharqia">Sharqia</option>
                        <option value="Gharbia">Gharbia</option>
                        <option value="Qalyubia">Qalyubia</option>
                        <option value="Beheira">Beheira</option>
                        <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                        <option value="Monufia">Monufia</option>
                        <option value="Damietta">Damietta</option>
                        <option value="Port Said">Port Said</option>
                        <option value="Ismailia">Ismailia</option>
                        <option value="Suez">Suez</option>
                        <option value="Fayoum">Fayoum</option>
                        <option value="Beni Suef">Beni Suef</option>
                        <option value="Minya">Minya</option>
                        <option value="Assiut">Assiut</option>
                        <option value="Sohag">Sohag</option>
                        <option value="Qena">Qena</option>
                        <option value="Luxor">Luxor</option>
                        <option value="Aswan">Aswan</option>
                        <option value="Red Sea">Red Sea</option>
                        <option value="New Valley">New Valley</option>
                        <option value="Matrouh">Matrouh</option>
                        <option value="North Sinai">North Sinai</option>
                        <option value="South Sinai">South Sinai</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-6">
                    Continue to Payment
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-4">
                    {/* Cash on Delivery */}
                    <label 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod' 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}>
                        <Banknote className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">Cash on Delivery (COD)</p>
                        <p className="text-zinc-400 text-sm">Pay when you receive your order</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-emerald-500' : 'border-zinc-600'
                      }`}>
                        {paymentMethod === 'cod' && (
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </label>

                    {/* InstaPay */}
                    <label 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'instapay' 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="instapay"
                        checked={paymentMethod === 'instapay'}
                        onChange={() => setPaymentMethod('instapay')}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        paymentMethod === 'instapay' ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}>
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">InstaPay</p>
                        <p className="text-zinc-400 text-sm">Pay instantly via InstaPay transfer</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'instapay' ? 'border-emerald-500' : 'border-zinc-600'
                      }`}>
                        {paymentMethod === 'instapay' && (
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </label>
                  </div>

                  {/* InstaPay Instructions */}
                  {paymentMethod === 'instapay' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-4">
                        <h3 className="text-white font-semibold mb-3">How to pay with InstaPay:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-sm">
                          <li>Open your banking app (CIB, NBE, QNB, etc.)</li>
                          <li>Go to InstaPay / Transfers</li>
                          <li>Send <span className="text-emerald-400 font-bold">{formatPrice(orderTotal)}</span> to:</li>
                        </ol>
                        
                        <div className="mt-4 flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
                          <div className="flex-1">
                            <p className="text-zinc-400 text-xs">InstaPay Number</p>
                            <p className="text-white font-mono text-lg">{INSTAPAY_NUMBER}</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyNumber}
                            className={`p-2 rounded-lg transition-colors ${
                              copied ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                            }`}
                          >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Screenshot Upload */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Upload Payment Screenshot *
                        </label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                            screenshotPreview 
                              ? 'border-emerald-500 bg-emerald-500/5' 
                              : 'border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          
                          {screenshotPreview ? (
                            <div className="space-y-3">
                              <div className="relative w-full max-w-xs mx-auto aspect-video">
                                <Image
                                  src={screenshotPreview}
                                  alt="Payment screenshot"
                                  fill
                                  className="object-contain rounded-lg"
                                />
                              </div>
                              <p className="text-emerald-400 text-sm">Screenshot uploaded ✓</p>
                              <p className="text-zinc-500 text-xs">Click to change</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                              <p className="text-zinc-300">Click to upload screenshot</p>
                              <p className="text-zinc-500 text-sm mt-1">PNG, JPG up to 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                      {loading ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </form>

                <p className="text-xs text-zinc-500 text-center mt-4">
                  {paymentMethod === 'cod' 
                    ? '💵 You will pay in cash when your order arrives'
                    : '📱 Your order will be confirmed after payment verification'}
                </p>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white mb-4">Order Placed!</h2>
                <p className="text-zinc-400 mb-2">Thank you for your order.</p>
                <p className="text-zinc-500 mb-8">
                  {paymentMethod === 'cod' 
                    ? 'You will pay when your order arrives.'
                    : 'We will verify your payment and confirm your order shortly.'}
                </p>
                
                <div className="bg-zinc-900/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-zinc-400">Order Number</p>
                  <p className="text-xl font-mono font-bold text-white">
                    #{orderNumber}
                  </p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-8">
                  <p className="text-emerald-400 text-sm">
                    📱 We will contact you at <span className="font-semibold">{shippingInfo.phone}</span> to confirm your order
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button variant="outline">Continue Shopping</Button>
                  </Link>
                  <Link href="/">
                    <Button>Back to Home</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          {currentStep < 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <div className="glass rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.name}</p>
                        <p className="text-sm text-zinc-500">
                          {item.size && `Size: ${item.size}`} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-white font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-700 pt-4 space-y-3">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-zinc-700">
                    <span>Total</span>
                    <span>{formatPrice(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
