import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { SiteSettings } from '@/types/settings';
import { DEFAULT_SITE_SETTINGS } from './default-settings';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  CONTACTS: 'contacts',
  SHIPPING_ZONES: 'shipping_zones',
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activity_logs',
} as const;

// User interface
export interface DBUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
  isSubscribed: boolean;
  orderCount: number;
  totalSpent: number;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

// Product interface
export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  status: 'draft' | 'active' | 'archived';
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order interface
export interface DBOrder {
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Contact message interface
export interface DBContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: Timestamp;
}

// Site settings interface
export type DBSettings = SiteSettings;

// ============ USER FUNCTIONS ============

export async function createUser(userId: string, data: Partial<DBUser>) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, {
    ...data,
    id: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isSubscribed: data.isSubscribed ?? false,
    orderCount: 0,
    totalSpent: 0,
  });
}

export async function getUser(userId: string): Promise<DBUser | null> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? (snapshot.data() as DBUser) : null;
}

export async function updateUser(userId: string, data: Partial<DBUser>) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllUsers(): Promise<DBUser[]> {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DBUser);
}

// ============ PRODUCT FUNCTIONS ============

export async function createProduct(data: Omit<DBProduct, 'id' | 'createdAt' | 'updatedAt'>) {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const docRef = await addDoc(productsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function getProduct(productId: string): Promise<DBProduct | null> {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  const snapshot = await getDoc(productRef);
  return snapshot.exists() ? (snapshot.data() as DBProduct) : null;
}

export async function updateProduct(productId: string, data: Partial<DBProduct>) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  await updateDoc(productRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId: string) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  await deleteDoc(productRef);
}

export async function getActiveProducts(): Promise<DBProduct[]> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(
    productsRef,
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DBProduct);
}

export async function getAllProducts(): Promise<DBProduct[]> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DBProduct);
}

// ============ ORDER FUNCTIONS ============

export async function createOrder(data: Omit<DBOrder, 'id' | 'createdAt' | 'updatedAt'>) {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const docRef = await addDoc(ordersRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(docRef, { id: docRef.id });
  
  // Update user order count and total spent
  if (data.userId) {
    const userRef = doc(db, COLLECTIONS.USERS, data.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as DBUser;
      await updateDoc(userRef, {
        orderCount: (userData.orderCount || 0) + 1,
        totalSpent: (userData.totalSpent || 0) + data.total,
        updatedAt: serverTimestamp(),
      });
    }
  }
  
  return docRef.id;
}

export async function getOrder(orderId: string): Promise<DBOrder | null> {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const snapshot = await getDoc(orderRef);
  return snapshot.exists() ? (snapshot.data() as DBOrder) : null;
}

export async function updateOrder(orderId: string, data: Partial<DBOrder>) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await updateDoc(orderRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getUserOrders(userId: string): Promise<DBOrder[]> {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DBOrder);
}

export async function getAllOrders(): Promise<DBOrder[]> {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DBOrder);
}

// ============ CONTACT FUNCTIONS ============

export async function createContact(data: Omit<DBContact, 'id' | 'createdAt' | 'status'>) {
  const contactsRef = collection(db, COLLECTIONS.CONTACTS);
  const docRef = await addDoc(contactsRef, {
    ...data,
    status: 'new',
    createdAt: serverTimestamp(),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function getAllContacts(): Promise<DBContact[]> {
  const contactsRef = collection(db, COLLECTIONS.CONTACTS);
  const q = query(contactsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DBContact);
}

export async function updateContactStatus(contactId: string, status: DBContact['status']) {
  const contactRef = doc(db, COLLECTIONS.CONTACTS, contactId);
  await updateDoc(contactRef, { status });
}

// ============ SETTINGS FUNCTIONS ============

const SETTINGS_DOC_ID = 'site_settings';

export async function getSettings(): Promise<DBSettings | null> {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  const snapshot = await getDoc(settingsRef);
  return snapshot.exists() ? (snapshot.data() as DBSettings) : null;
}

export async function updateSettings(data: Partial<DBSettings>) {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  await setDoc(settingsRef, data, { merge: true });
}

export async function initializeSettings() {
  const existing = await getSettings();
  if (!existing) {
    await updateSettings(DEFAULT_SITE_SETTINGS);
    return DEFAULT_SITE_SETTINGS;
  }
  return existing;
}

// ============ ACTIVITY LOG FUNCTIONS ============

export async function logActivity(data: {
  type: string;
  description: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  const logsRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
  await addDoc(logsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getRecentActivity(limitCount: number = 50) {
  const logsRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
  const q = query(logsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
