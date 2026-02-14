import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const PRODUCTS_COLLECTION = 'products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Fetch all data in parallel
    const [ordersSnapshot, usersSnapshot, productsSnapshot] = await Promise.all([
      adminDb.collection(ORDERS_COLLECTION).orderBy('createdAt', 'desc').get(),
      adminDb.collection(USERS_COLLECTION).get(),
      adminDb.collection(PRODUCTS_COLLECTION).get(),
    ]);

    // Convert snapshots to arrays
    const orders = ordersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      } as { id: string; createdAt: Date; status: string; total: number; items: Array<{ productId: string; name: string; quantity: number; price: number }> };
    });

    const users = usersSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const products = productsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Calculate date range
    const now = new Date();
    let startDate = new Date(0);
    if (period === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (period === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Filter orders by period
    const filteredOrders = orders.filter((order) => {
      const orderDate = order.createdAt;
      return orderDate >= startDate;
    });

    // Calculate metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus: { [key: string]: number } = {};
    filteredOrders.forEach((order) => {
      const status = order.status as string;
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    // Top products by sales
    const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
    filteredOrders.forEach((order) => {
      const items = order.items as Array<{ productId: string; name: string; quantity: number; price: number }> || [];
      items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, sales: 0, revenue: 0 };
        }
        productSales[item.productId].sales += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders
    const recentOrders = filteredOrders.slice(0, 5).map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      date: order.createdAt?.toISOString?.() || new Date().toISOString(),
    }));

    const analyticsData = {
      totalRevenue,
      totalOrders,
      totalUsers: users.length,
      totalProducts: products.filter((p) => (p as { status?: string }).status === 'active').length,
      revenueChange: 12.5, // Placeholder
      ordersChange: 8.3,
      averageOrderValue,
      pendingOrders: ordersByStatus['pending'] || 0,
      deliveredOrders: ordersByStatus['delivered'] || 0,
      topProducts,
      recentOrders,
      ordersByStatus,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
