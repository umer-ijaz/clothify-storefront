export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: string;
    items: any[];
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
  };
}