import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, User } from '@/types';

// Products Collection
const productsCollection = collection(db, 'products');

export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
}) {
  let q = query(productsCollection, orderBy('createdAt', 'desc'));

  if (options?.category) {
    q = query(q, where('category', '==', options.category));
  }

  if (options?.featured) {
    q = query(q, where('featured', '==', true));
  }

  if (options?.limitCount) {
    q = query(q, limit(options.limitCount));
  }

  if (options?.lastDoc) {
    q = query(q, startAfter(options.lastDoc));
  }

  const snapshot = await getDocs(q);
  const products: Product[] = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    products.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Product);
  });

  return {
    products,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(productsCollection, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(productsCollection, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Product;
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(productsCollection, {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const docRef = doc(productsCollection, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProduct(id: string) {
  const docRef = doc(productsCollection, id);
  await deleteDoc(docRef);
}

// Orders Collection
const ordersCollection = collection(db, 'orders');

export async function getOrders(userId?: string) {
  let q = query(ordersCollection, orderBy('createdAt', 'desc'));

  if (userId) {
    q = query(q, where('userId', '==', userId));
  }

  const snapshot = await getDocs(q);
  const orders: Order[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    orders.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Order);
  });

  return orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const docRef = doc(ordersCollection, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Order;
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(ordersCollection, {
    ...order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return docRef.id;
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const docRef = doc(ordersCollection, id);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

// Users Collection
const usersCollection = collection(db, 'users');

export async function getUserById(id: string): Promise<User | null> {
  const docRef = doc(usersCollection, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as User;
}

export async function createUser(user: Omit<User, 'createdAt'>) {
  const docRef = doc(usersCollection, user.id);
  await updateDoc(docRef, {
    ...user,
    createdAt: Timestamp.now(),
  }).catch(() => {
    // If doc doesn't exist, create it
    addDoc(usersCollection, {
      ...user,
      createdAt: Timestamp.now(),
    });
  });
}

export async function updateUser(id: string, data: Partial<User>) {
  const docRef = doc(usersCollection, id);
  await updateDoc(docRef, data);
}

export async function getUsers() {
  const snapshot = await getDocs(usersCollection);
  const users: User[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as User);
  });

  return users;
}
