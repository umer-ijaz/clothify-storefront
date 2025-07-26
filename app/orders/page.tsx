"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/userContext";
import { useReturnStore } from "@/context/returnContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";
import Link from "next/link";
import Image from "next/image";
import HomeLink from "@/components/home-link";
import TextField from "@/components/text-field";
import Loading from "../loading";
import InvoiceModal from "../payments/invoice-modal";
import ProductReviewModal from "@/components/productComponents/product-reiw-modal";
import ReturnItemModal from "@/components/return-item-modal";
import ReturnManagement from "@/components/return-management";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
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
  status: "Pending" | "Approved" | "Rejected" | "Processing" | "Completed" | "Received";
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

export default function OrdersPage() {
  const { user, loading } = useUser();
  const {
    policy: returnPolicy,
    isLoading: isPolicyLoading,
    fetchReturnPolicy,
    clearCache,
  } = useReturnStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  // Invoice Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Return Modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] =
    useState<OrderItem | null>(null);
  const [selectedOrderForReturn, setSelectedOrderForReturn] =
    useState<Order | null>(null);

  // Return Requests state
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const ordersRef = collection(firestore, `users/${user.uid}/orders`);
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            createdAt: data.createdAt,
            total: data.total,
            items: data.items || [],
            invoice: data.invoice || {
              invoiceId: `INV-${Date.now()}`,
              details: `Rechnung generiert für Bestellung ${doc.id}`,
              date: new Date().toISOString(),
            },
            customerInfo: data.customerInfo || {
              name: "",
              email: "",
              address: "",
              city: "",
              phone: "",
              country: "",
              postcode: "",
              companyName: "",
              deliveryPreferences: "",
              deliveryNotes: "",
              accessCodes: "",
            },
            subtotal: data.subtotal || 0,
            tax: data.tax || 0,
            deliveryFee: data.deliveryFee || 0,
            paymentMethod:
              data.paymentMethod || data.paymentDetails?.paymentMethod || "",
            paymentDetails: data.paymentDetails || {
              transactionId: "",
              date: "",
              time: "",
              status: "",
              expectedDelivery: "",
            },
            deliveryMethod: data.deliveryMethod || "",
            status: data.status || "Pending",
          } as Order;
        });
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Fehler beim Laden der Bestellungen:", err);
        toast.error("Bestellungen konnten nicht geladen werden");
      } finally {
        setFetching(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    // Force clear cache and refetch on mount (for testing only)
    console.log("OrdersPage: Cache wird geleert und neu geladen...");
    clearCache();
  }, [clearCache]);

  useEffect(() => {
    const fetchReturnRequests = async () => {
      if (!user) return;

      try {
        const returnsRef = collection(firestore, "returns");
        const q = query(returnsRef, where("userId", "==", user.uid));

        const snapshot = await getDocs(q);
        let fetchedReturns: ReturnRequest[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderId: data.orderId,
            itemId: data.itemId,
            status: data.status || "Pending",
            requestedAt: data.requestedAt,
            itemName: data.itemName,
            itemPrice: data.itemPrice,
            itemQuantity: data.itemQuantity,
            reason: data.reason,
            invoiceId: data.invoiceId,
            adminMessage: data.adminMessage,
            refundAmount: data.refundAmount,
            inspectionStatus: data.inspectionStatus,
            inspectionHistory: data.inspectionHistory || [],
            receivedAt: data.receivedAt,
            processedAt: data.processedAt,
            updatedAt: data.updatedAt,
          };
        });

        // Sort in JavaScript instead of Firestore
        fetchedReturns = fetchedReturns.sort((a, b) => {
          const timeA =
            a.requestedAt.seconds * 1000 +
            a.requestedAt.nanoseconds / 1_000_000;
          const timeB =
            b.requestedAt.seconds * 1000 +
            b.requestedAt.nanoseconds / 1_000_000;

          return timeB - timeA; // descending order
        });

        setReturnRequests(fetchedReturns);
      } catch (err) {
        console.error("Fehler beim Laden der Rückgabeanfragen:", err);
        toast.error("Rückgabeanfragen konnten nicht geladen werden");
      }
    };

    if (user) fetchReturnRequests();
  }, [user]);

  useEffect(() => {
    if (!returnPolicy && !isPolicyLoading) {
      console.log("OrdersPage: Rückgaberichtlinien werden geladen...");
      fetchReturnPolicy();
    }
  }, [returnPolicy, isPolicyLoading, fetchReturnPolicy]);

  const refreshReturnRequests = async () => {
    if (!user) return;

    try {
      const returnsRef = collection(firestore, "returns");
      const q = query(returnsRef, where("userId", "==", user.uid));

      const snapshot = await getDocs(q);
      let fetchedReturns: ReturnRequest[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          orderId: data.orderId,
          itemId: data.itemId,
          status: data.status || "Pending",
          requestedAt: data.requestedAt,
          itemName: data.itemName,
          itemPrice: data.itemPrice,
          itemQuantity: data.itemQuantity,
          reason: data.reason,
          invoiceId: data.invoiceId,
          adminMessage: data.adminMessage,
          refundAmount: data.refundAmount,
          inspectionStatus: data.inspectionStatus,
          inspectionHistory: data.inspectionHistory || [],
          receivedAt: data.receivedAt,
          processedAt: data.processedAt,
          updatedAt: data.updatedAt,
        };
      });

      fetchedReturns = fetchedReturns.sort((a, b) => {
        const timeA =
          a.requestedAt.seconds * 1000 + a.requestedAt.nanoseconds / 1_000_000;
        const timeB =
          b.requestedAt.seconds * 1000 + b.requestedAt.nanoseconds / 1_000_000;

        return timeB - timeA; // Sort by newest first
      });

      setReturnRequests(fetchedReturns);
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Rückgabeanfragen:", err);
      toast.error("Rückgabeanfragen konnten nicht aktualisiert werden");
    }
  };

  if (loading || fetching || isPolicyLoading) {
    return <Loading />;
  }

  const handleAddReview = (review: {
    name: string;
    rating: number;
    comment: string;
  }) => {
    console.log("Neue Bewertung:", review);
    toast.success("Bewertung wurde erfolgreich hinzugefügt");
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return;

    try {
      const orderRef = doc(firestore, `users/${user.uid}/orders/${orderId}`);
      await updateDoc(orderRef, {
        status: "Cancelled",
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
      toast.success("Bestellung wurde erfolgreich storniert");
    } catch (err) {
      console.error("Fehler beim Stornieren der Bestellung:", err);
      toast.error("Bestellung konnte nicht storniert werden");
    }
  };

  const isWithinReturnPeriod = (orderCreationDate: string): boolean => {
    if (
      !returnPolicy ||
      returnPolicy.returnPeriodDays <= 0 ||
      !orderCreationDate
    ) {
      return false;
    }
    try {
      const createdAt = new Date(orderCreationDate);
      const deadline = new Date(createdAt);
      deadline.setDate(createdAt.getDate() + returnPolicy.returnPeriodDays);
      deadline.setHours(23, 59, 59, 999);
      return new Date() <= deadline;
    } catch (e) {
      console.error("Fehler bei der Berechnung der Rückgabefrist:", e);
      return false;
    }
  };

  const getReturnStatus = (orderId: string, itemId: string): string | null => {
    const returnRequest = returnRequests.find(
      (req) => req.orderId === orderId && req.itemId === itemId
    );
    return returnRequest ? returnRequest.status : null;
  };

  const handleOpenReturnModal = (item: OrderItem, order: Order) => {
    setSelectedItemForReturn(item);
    setSelectedOrderForReturn(order);
    setShowReturnModal(true);
  };

  const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      Completed: "Abgeschlossen",
      Pending: "Ausstehend",
      Processing: "In Bearbeitung",
      Delivered: "Geliefert",
      Shipped: "Versandt",
      Cancelled: "Storniert",
      "Ready to Pick Up": "Bereit zur Abholung",
    };
    return statusMap[status] || status;
  };

  const getReturnStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      Pending: "Rückgabe ausstehend",
      Approved: "Rückgabe genehmigt",
      Rejected: "Rückgabe abgelehnt",
      Processing: "Rückgabe wird bearbeitet",
      Completed: "Rückgabe abgeschlossen",
      Received: "Rückgabe erhalten",
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-white mt-0 pb-10">
      <div className="py-8 px-4 sm:px-6 md:px-8 lg:px-12 flex flex-row gap-2 text-md md:text-xl font-small mb-2 capitalize">
        <HomeLink />
        <span className="text-gray-400">/</span>
        <span className="text-red-500">Bestellungen</span>
      </div>
      <TextField text={"Bestellungen & Retouren"} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-6">
          <h2 className="text-blue-700 font-semibold text-lg mb-1">Hinweis</h2>
          <p className="text-blue-800">
            Bestellungen können nur storniert werden, wenn der Status der
            Bestellung <strong>Ausstehend</strong> ist. Retouren sind innerhalb
            von <strong>{returnPolicy?.returnPeriodDays ?? 1} Tagen</strong>{" "}
            nach Lieferung möglich.
          </p>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Meine Bestellungen ({orders.length})
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Meine Rendite ({returnRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Keine Bestellungen gefunden
                </h3>
                <p className="text-gray-500 mb-6">
                  Sie haben noch keine Bestellungen aufgegeben.
                </p>
                <Link
                  href="/allproducts"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white font-semibold rounded-full hover:shadow-lg transition-shadow"
                >
                  Jetzt einkaufen
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders
                  .filter((order) => order.status !== "Cancelled")
                  .map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-6 shadow-md bg-white hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                        <div>
                          <span className="text-gray-500 text-sm">
                            Bestellnummer:
                          </span>
                          <span className="font-semibold ml-2 text-gray-800">
                            {"OID-" +
                              removeInvPrefix(order.invoice.invoiceId) +
                              base62ToLastFour(order.id)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Status:</span>
                          <span
                            className={`ml-2 font-medium px-3 py-1 rounded-full text-xs ${
                              order.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Processing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Ready to Pick Up"
                                ? "bg-orange-100 text-orange-500"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Bestellt am:</span>{" "}
                          {formatDate(order.createdAt)}
                        </div>
                        {order.paymentDetails.expectedDelivery && (
                          <div>
                            <span className="font-medium">
                              Erwartete Lieferung:
                            </span>{" "}
                            {formatDate(order.paymentDetails.expectedDelivery)}
                          </div>
                        )}
                        {order.deliveryMethod && (
                          <div>
                            <span className="font-medium">Liefermethode:</span>{" "}
                            {order.deliveryMethod}
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div>
                            <span className="font-medium">
                              Zahlungsmethode:
                            </span>{" "}
                            {order.paymentMethod}
                          </div>
                        )}
                      </div>

                      {/* Customer Info Section */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Lieferadresse:
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{order.customerInfo.name}</div>
                          {order.customerInfo.companyName && (
                            <div>{order.customerInfo.companyName}</div>
                          )}
                          <div>{order.customerInfo.address}</div>
                          <div>
                            {order.customerInfo.postcode}{" "}
                            {order.customerInfo.city}
                          </div>
                          {order.customerInfo.country && (
                            <div>{order.customerInfo.country}</div>
                          )}
                          <div>Tel: {order.customerInfo.phone}</div>
                          <div>E-Mail: {order.customerInfo.email}</div>
                          {order.customerInfo.deliveryNotes && (
                            <div>
                              <span className="font-medium">
                                Lieferhinweise:
                              </span>{" "}
                              {order.customerInfo.deliveryNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-b py-4 my-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Artikel:
                        </h4>
                        <ul className="space-y-4">
                          {order.items.map((item, idx) => {
                            const canReturn =
                              (order.status === "Delivered" ||
                                order.status === "Shipped") &&
                              isWithinReturnPeriod(order.createdAt) &&
                              !getReturnStatus(order.id, item.id);

                            const returnStatus = getReturnStatus(
                              order.id,
                              item.id
                            );

                            return (
                              <li
                                key={idx}
                                className="flex flex-col gap-2 relative"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 flex items-center gap-3">
                                    <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-200 flex-shrink-0">
                                      <Image
                                        src={
                                          item.image ||
                                          "/placeholder.svg?height=64&width=64"
                                        }
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-sm mb-1">
                                        {item.name}
                                      </h5>
                                      <div className="text-gray-500 text-xs space-y-1">
                                        <div>Menge: {item.quantity}</div>
                                        <div>
                                          Einzelpreis: €{item.price.toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-sm">
                                      €{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    {returnStatus && (
                                      <span
                                        className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                                          returnStatus === "Pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : returnStatus === "Approved"
                                            ? "bg-green-100 text-green-800"
                                            : returnStatus === "Rejected"
                                            ? "bg-red-100 text-red-800"
                                            : returnStatus === "Processing"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {getReturnStatusText(returnStatus)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-2">
                                  {(order.status === "Delivered" ||
                                    order.status === "Shipped") && (
                                    <ProductReviewModal
                                      onAddReview={handleAddReview}
                                      product={{
                                        id: item.id,
                                        name: item.name,
                                        image: item.image || "/placeholder.svg",
                                      }}
                                      itemType={
                                        item.id.startsWith("sale")
                                          ? "flashSaleItem"
                                          : "product"
                                      }
                                    />
                                  )}
                                  {canReturn && (
                                    <button
                                      className="px-4 py-2 bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all duration-300"
                                      onClick={() =>
                                        handleOpenReturnModal(item, order)
                                      }
                                    >
                                      Artikel zurückgeben
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Zwischensumme:</span>
                            <span>€{order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lieferkosten:</span>
                            <span>€{order.deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Steuern:</span>
                            <span>€{order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Gesamt:</span>
                            <span>€{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {order.paymentDetails.transactionId && (
                        <div className="text-xs text-gray-500 mb-4">
                          <div>
                            Transaktions-ID:{" "}
                            {order.paymentDetails.transactionId}
                          </div>
                          {order.paymentDetails.date && (
                            <div>
                              Bezahlt am:{" "}
                              {formatDate(order.paymentDetails.date)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Invoice Info */}
                      {order.invoice && (
                        <div className="text-xs text-gray-500 mb-4">
                          <div>Rechnungsnummer: {order.invoice.invoiceId}</div>
                          {order.invoice.date && (
                            <div>
                              Rechnungsdatum: {formatDate(order.invoice.date)}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        {order.status === "Pending" && (
                          <button
                            className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Bestellung stornieren
                          </button>
                        )}
                        <button
                          className="px-6 py-2 bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all duration-300"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowInvoiceModal(true);
                          }}
                        >
                          Rechnung herunterladen
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="returns" className="mt-6">
            <ReturnManagement returnRequests={returnRequests} />
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && showInvoiceModal && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          orderData={{
            id: selectedOrder.id,
            items: selectedOrder.items,
            customerInfo: selectedOrder.customerInfo,
            subtotal: selectedOrder.subtotal,
            tax: selectedOrder.tax,
            deliveryFee: selectedOrder.deliveryFee,
            total: selectedOrder.total,
            paymentMethod: selectedOrder.paymentMethod,
            paymentDetails: selectedOrder.paymentDetails,
            deliveryMethod: selectedOrder.deliveryMethod,
            createdAt: selectedOrder.createdAt,
            status: selectedOrder.status,
            invoice: selectedOrder.invoice,
          }}
        />
      )}

      {selectedItemForReturn &&
        selectedOrderForReturn &&
        showReturnModal &&
        user && (
          <ReturnItemModal
            isOpen={showReturnModal}
            onClose={() => {
              setShowReturnModal(false);
              setSelectedItemForReturn(null);
              setSelectedOrderForReturn(null);
            }}
            item={selectedItemForReturn}
            orderId={selectedOrderForReturn.id}
            invoiceId={selectedOrderForReturn?.invoice.invoiceId}
            userId={user.uid}
            orderCreatedAt={selectedOrderForReturn.createdAt}
            onSuccess={refreshReturnRequests}
          />
        )}
    </div>
  );
}
function base62ToLastFour(str: string): string {
  const charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = 0n;

  for (let i = 0; i < str.length; i++) {
    const power = BigInt(str.length - i - 1);
    const value = BigInt(charset.indexOf(str[i]));
    result += value * 62n ** power;
  }

  const decimalStr = result.toString();
  return decimalStr.slice(-4);
}

function removeInvPrefix(id: string): string {
  if (id.startsWith("INV-")) {
    return id.slice(4); // remove first 4 characters
  }
  return id; // return unchanged if prefix not present
}
