import { collection, addDoc, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

export interface Order {
  id: string;
  projectId: string;
  projectTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
  price: number;
}

const ORDERS_COLLECTION = 'orders';

export const orderService = {
  async createOrder(order: Omit<Order, 'id'>) {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    return await addDoc(ordersRef, order);
  },

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      callback(orders);
    });
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status });
  },

  async deleteOrder(orderId: string) {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  }
};
