import { firestore } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
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