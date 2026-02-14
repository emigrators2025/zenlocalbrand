"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Search,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
  Wallet,
  Banknote,
  Phone,
  ImageIcon,
} from "lucide-react";
import { useAdminStore } from "@/stores/admin";
import { formatPrice } from "@/lib/utils";

interface DBOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    governorate: string;
    country: string;
  };
  paymentMethod: 'cod' | 'instapay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentScreenshot?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminStore();
  
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/zen-admin/login");
    } else {
      loadOrders();
    }
  }, [isAuthenticated, router]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const formattedOrders = data.orders.map((order: DBOrder & { createdAt: string; updatedAt: string }) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: DBOrder["status"]) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      
      if (!response.ok) throw new Error('Failed to update order');
      
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "confirmed":
        return "bg-emerald-500/20 text-emerald-400";
      case "processing":
        return "bg-blue-500/20 text-blue-400";
      case "shipped":
        return "bg-purple-500/20 text-purple-400";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Orders</h1>
              <p className="text-gray-400 mt-1">Manage customer orders</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-white font-medium">
                          Order #{order.id.slice(0, 8)}
                        </span>
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {order.userName} ({order.userEmail})
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-emerald-500 font-bold">{formatPrice(order.total)}</p>
                        <p className="text-gray-500 text-sm">{order.items.length} items</p>
                      </div>
                      {/* Payment Method Badge */}
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        order.paymentMethod === 'instapay' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {order.paymentMethod === 'instapay' ? (
                          <Wallet className="w-3 h-3" />
                        ) : (
                          <Banknote className="w-3 h-3" />
                        )}
                        {order.paymentMethod === 'instapay' ? 'InstaPay' : 'COD'}
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Status Update */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status as DBOrder["status"])}
                          disabled={isUpdating || selectedOrder.status === status}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                            selectedOrder.status === status
                              ? getStatusColor(status)
                              : "bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Customer</h3>
                    <p className="text-gray-400">{selectedOrder.userName}</p>
                    <p className="text-gray-400">{selectedOrder.userEmail}</p>
                    {selectedOrder.userPhone && (
                      <p className="text-gray-400 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.userPhone}
                      </p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Payment Method</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                      selectedOrder.paymentMethod === 'instapay' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {selectedOrder.paymentMethod === 'instapay' ? (
                        <>
                          <Wallet className="w-5 h-5" />
                          InstaPay Transfer
                        </>
                      ) : (
                        <>
                          <Banknote className="w-5 h-5" />
                          Cash on Delivery (COD)
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Screenshot (InstaPay only) */}
                  {selectedOrder.paymentMethod === 'instapay' && selectedOrder.paymentScreenshot && (
                    <div>
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        Payment Screenshot
                      </h3>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <a 
                          href={selectedOrder.paymentScreenshot} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="relative w-full h-64 rounded-lg overflow-hidden">
                            <Image
                              src={selectedOrder.paymentScreenshot}
                              alt="Payment Screenshot"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </a>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Click to open full size
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Shipping Address</h3>
                    <p className="text-gray-400">
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.governorate}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <p className="text-white">{item.name}</p>
                            <p className="text-gray-500 text-sm">
                              Qty: {item.quantity}
                              {item.size && ` | Size: ${item.size}`}
                              {item.color && ` | Color: ${item.color}`}
                            </p>
                          </div>
                          <p className="text-emerald-500">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-gray-400 mb-2">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 mb-2">
                      <span>Shipping</span>
                      <span>{formatPrice(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span className="text-emerald-500">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
