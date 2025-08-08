import { firestore } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

export interface Order {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
  }>;
  total: number;
  subtotal: number;
  promoCode: string | null;
  promoDiscount: number | 0;
  tax: number;
  deliveryFee: number;
  customerInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
    phone: string;
    apartment: string;
    country: string;
    postcode: string;
    companyName?: string;
    deliveryPreferences?: string;
    deliveryNotes?: string;
    accessCodes?: string;
  };
  paymentMethod: string;
  paymentDetails: {
    transactionId: string;
    date: string;
    time?: string;
    status: string;
    expectedDelivery?: string;
    cardType?: string;
    lastFour?: string;
  };
  invoice: {
    invoiceId: string;
    date: string;
    details: string;
  };
  deliveryMethod: string;
  createdAt: string;
  status: string;
}

export async function addOrderToUserProfile(userId: string, order: Order) {
  try {
    const userOrdersCollection = collection(
      firestore,
      `users/${userId}/orders`
    );
    await addDoc(userOrdersCollection, order);
    console.log("Order added successfully!");
  } catch (error) {
    console.error("Error adding order to user profile:", error);
    throw error;
  }
}

export const fetchOrdersById = async (
  userId?: string,
  orderId?: string
): Promise<Order[]> => {
  try {
    const orders: Order[] = [];

    if (userId && orderId) {
      // Fetch a specific order for a specific user
      const orderRef = doc(firestore, `users/${userId}/orders/${orderId}`);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        orders.push({
          id: orderSnap.id,
          userId,
          ...orderSnap.data(),
        } as any);
      } else {
        console.warn(`Order ${orderId} not found for user ${userId}`);
      }
    } else if (userId) {
      // Fetch all orders for a specific user
      const ordersRef = collection(firestore, `users/${userId}/orders`);
      const ordersSnap = await getDocs(ordersRef);

      ordersSnap.forEach((doc) => {
        orders.push({
          id: doc.id,
          userId,
          ...doc.data(),
        } as any);
      });
    } else {
      // Fetch all orders for all users
      const usersSnap = await getDocs(collection(firestore, "users"));

      for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        console.log("Fetching orders for user:", uid);

        try {
          const ordersRef = collection(firestore, `users/${uid}/orders`);
          const ordersSnap = await getDocs(ordersRef);

          ordersSnap.forEach((orderDoc) => {
            orders.push({
              id: orderDoc.id,
              userId: uid,
              ...orderDoc.data(),
            } as any);
          });
        } catch (userError) {
          console.error(`Error fetching orders for user ${uid}:`, userError);
        }
      }
    }

    console.log("Total orders fetched:", orders.length);
    return orders;
  } catch (error) {
    console.error("Error in fetchOrders:", error);
    throw error;
  }
};
