export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  isFlashSale: boolean;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
    phone: string;
    country?: string;
    postcode?: string;
    companyName?: string;
    deliveryPreferences?: string;
    deliveryNotes?: string;
    accessCodes?: string;
  };
  subtotal: number;
  promoCode: string | null;
  promoDiscount: number | 0;
  promoCost: number | 0;
  tax: number;
  deliveryFee: number;
  total: number;
  invoice: {
    invoiceId: string;
    details: string;
    date: string;
  };
  paymentMethod: string;
  paymentDetails: {
    transactionId: string;
    date: string;
    time?: string;
    status: string;
    expectedDelivery?: string;
  };
  deliveryMethod: string;
  createdAt: string;
  status: string;
}

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface InspectionHistoryItem {
  timestamp: FirestoreTimestamp;
  status: string;
  adminNote: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  itemQuantity: number;
  reason: string;
  status:
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Processing"
    | "Completed"
    | "Received";
  requestedAt: FirestoreTimestamp;
  adminMessage?: string;
  invoiceId: string;
  refundAmount?: number;
  inspectionStatus?: string;
  inspectionHistory?: InspectionHistoryItem[];
  receivedAt?: string;
  processedAt?: string;
  updatedAt?: string;
}
