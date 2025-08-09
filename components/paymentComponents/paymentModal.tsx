"use client";

import { useEffect, useState, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, ChevronDown } from "lucide-react";
import Image from "next/image";
import Button from "@/components/button";
import { AuthModal } from "@/components/auth-modal";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { addOrderToUserProfile } from "@/lib/orders";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { toast } from "sonner";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getCountries } from "@/context/countries";
import { useDeliveryPriceStore } from "@/context/deliveryPriceContext";
import { useExpressDeliveryPriceStore } from "@/context/expressDeliveryPriceContext";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";
import { getPromoCodes, PromoCode } from "@/lib/promoCodes";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const StripeCheckoutForm = ({
  clientSecret,
  onSuccessfulPayment,
}: {
  clientSecret: string;
  onSuccessfulPayment: (paymentIntentId: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(
        error.message || "Ein unerwarteter Fehler ist aufgetreten."
      );
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Zahlung erfolgreich!");
      onSuccessfulPayment(paymentIntent.id);
    } else if (paymentIntent) {
      setErrorMessage(`Zahlungsstatus: ${paymentIntent.status}`);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="w-full">
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          text={isProcessing ? "Verarbeitung..." : "Bezahlen Sie mit Stripe"}
        />
      </div>
      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}
    </form>
  );
};

// PayPal Checkout Component
const PayPalCheckoutForm = ({
  amount,
  currency = "EUR",
  onSuccessfulPayment,
  customerInfo,
}: {
  amount: number;
  currency?: string;
  onSuccessfulPayment: (transactionId: string) => void;
  customerInfo: {
    country: string;
    fullName: string;
    companyName: string;
    phone: string;
    streetAddress: string;
    additionalAddress: string;
    postcode: string;
    townCity: string;
    email: string;
    deliveryPreferences: string;
    deliveryNotes: string;
    accessCodes: string;
  };
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/create-paypal-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          customerInfo: customerInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Fehler beim Erstellen der PayPal-Bestellung"
        );
      }

      return data.orderID;
    } catch (error) {
      console.error("PayPal Order Creation Error:", error);
      toast.error("Fehler beim Erstellen der PayPal-Bestellung");
      setIsProcessing(false);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/capture-paypal-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: data.orderID,
        }),
      });

      const captureData = await response.json();

      if (!response.ok) {
        throw new Error(
          captureData.error || "Fehler beim Abschließen der PayPal-Zahlung"
        );
      }

      if (captureData.status === "COMPLETED") {
        toast.success("PayPal-Zahlung erfolgreich!");
        onSuccessfulPayment(captureData.transactionId);
      } else {
        toast.error("PayPal-Zahlung konnte nicht abgeschlossen werden");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("PayPal Capture Error:", error);
      toast.error("Fehler beim Abschließen der PayPal-Zahlung");
      setIsProcessing(false);
    }
  };

  const onError = (error: any) => {
    console.error("PayPal Error:", error);
    toast.error("PayPal-Zahlungsfehler");
    setIsProcessing(false);
  };

  const onCancel = () => {
    toast.info("PayPal-Zahlung abgebrochen");
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
        disabled={isProcessing}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
      />
      {isProcessing && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            PayPal-Zahlung wird verarbeitet...
          </span>
        </div>
      )}
    </div>
  );
};

interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  isFlashSale: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  taxRate?: number;
  onSuccess?: (orderId: string) => void;
}

const countries = getCountries();

export default function PaymentModal({
  isOpen,
  onClose,
  products,
  taxRate = 5,
  onSuccess,
}: PaymentModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const { deliveryPrice } = useDeliveryPriceStore();
  const { expressPrice } = useExpressDeliveryPriceStore();
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [modal, setModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showDeliveryInstructions, setShowDeliveryInstructions] =
    useState(false);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Free delivery threshold state
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  const [freeDeliveryDescription, setFreeDeliveryDescription] =
    useState<string>("");
  const [isLoadingFreeDelivery, setIsLoadingFreeDelivery] = useState(true);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [inputCode, setInputCode] = useState("");
  const [discount, setDiscount] = useState<number | 0>(0);
  const [message, setMessage] = useState("");
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState({
    country: "Germany",
    fullName: "",
    companyName: "",
    phone: "",
    streetAddress: "",
    additionalAddress: "",
    postcode: "",
    townCity: "",
    email: user?.email || "",
    deliveryPreferences: "",
    deliveryNotes: "",
    accessCodes: "",
  });

  useEffect(() => {
    const fetchId = async () => {
      try {
        console.log(user?.uid);
        const id = base62ToDecimal(user!.uid);
        setUniqueId(id);
        console.log(id);
      } catch (error) {
        console.error("Failed to Convert Id:", error);
      }
    };

    fetchId();
  }, [user?.uid]);

  useEffect(() => {
    if (uniqueId !== null) {
      console.log("Updated uniqueId:", uniqueId);
    }
  }, [uniqueId]);

  const normalizeDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const handleVerify = async () => {
    setMessage("");
    setDiscount(0);
    setValidUntil(null);

    const enteredCode = inputCode.trim().toLowerCase();

    // Check flash sale condition
    const allFlashSale = products.every((item) => item.isFlashSale === true);
    const hasNonFlashSale = products.some((item) => item.isFlashSale === false);

    if (allFlashSale) {
      setMessage("⚠️ Aktionscode ist nicht anwendbar auf Flash-Sale-Produkte.");
      return;
    }

    const promoCodes = await getPromoCodes();
    setPromoCodes(promoCodes);
    const matchedPromo = promoCodes.find(
      (promo) => promo.code.toLowerCase() === enteredCode
    );

    if (matchedPromo) {
      setSelectedCode(enteredCode);
    }

    if (!matchedPromo) {
      setMessage(
        "❌ Ungültiger Aktionscode. Bitte verwenden Sie einen gültigen Aktionscode."
      );
      return;
    }

    const today = normalizeDate(new Date());
    const expiry = normalizeDate(new Date(matchedPromo.expiryDate));

    if (expiry >= today) {
      setDiscount(matchedPromo.discount);

      // Adjust message depending on cart items
      if (hasNonFlashSale) {
        setMessage(
          `✅ Herzlichen Glückwunsch! Ihr Promo-Code ist gültig. Er gilt nur für Nicht-Flash-Sale-Produkte und Sie erhalten ${matchedPromo.discount}% Rabatt auf diese Artikel.`
        );
      } else {
        setMessage(
          `✅ Herzlichen Glückwunsch! Ihr Promo-Code ist gültig. Sie erhalten ${matchedPromo.discount}% Rabatt.`
        );
      }

      setValidUntil(
        `📅 Der Aktionscode ist gültig bis ${expiry.toDateString()}`
      );
    } else {
      setMessage("⚠️ Der Aktionscode ist abgelaufen.");
    }
  };

  // Fetch free delivery threshold from Firebase
  useEffect(() => {
    const fetchFreeDeliveryData = async () => {
      setIsLoadingFreeDelivery(true);
      try {
        const docRef = doc(firestore, "settings", "deliveryWarranty");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Firebase deliveryWarranty data:", data);

          const freeDeliveryData = data.freeDelivery;
          console.log("Free delivery data:", freeDeliveryData);

          if (freeDeliveryData && freeDeliveryData.threshold) {
            setFreeDeliveryThreshold(freeDeliveryData.threshold || 0);
            setFreeDeliveryDescription(
              freeDeliveryData.description || "Kostenlose Lieferung"
            );
            console.log(
              "Free delivery threshold set to:",
              freeDeliveryData.threshold
            );
            console.log(
              "Free delivery description set to:",
              freeDeliveryData.description
            );
          }
        } else {
          console.log("deliveryWarranty document does not exist");
        }
      } catch (error) {
        console.error("Error fetching free delivery data:", error);
      } finally {
        setIsLoadingFreeDelivery(false);
      }
    };

    if (isOpen) {
      fetchFreeDeliveryData();
    }
  }, [isOpen]);

  const subtotal = products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const allnoflashtotal = products
    .filter((item) => item.isFlashSale === false)
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Check if cart qualifies for free delivery (only for standard delivery)
  const isEligibleForFreeDelivery =
    subtotal >= freeDeliveryThreshold && freeDeliveryThreshold > 0;

  const deliveryFee =
    deliveryMethod === "standard" && isEligibleForFreeDelivery
      ? 0
      : deliveryMethod === "standard"
      ? deliveryPrice
      : deliveryMethod === "express"
      ? expressPrice
      : 0;

  const tax = subtotal * (taxRate / 100);
  const totalPrice =
    subtotal + tax + deliveryFee - ((discount / 100) * allnoflashtotal);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (user?.email && !customerInfo.email) {
      setCustomerInfo((prev) => ({ ...prev, email: user.email! }));
    }
  }, [user?.email]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateCustomerInfo = (): boolean => {
    const requiredFields = [
      "fullName",
      "email",
      "streetAddress",
      "townCity",
      "phone",
      "postcode",
    ];

    for (const field of requiredFields) {
      if (!customerInfo[field as keyof typeof customerInfo]) {
        toast.error(
          `Bitte füllen Sie das Feld ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} aus.`
        );
        return false;
      }
    }

    if (!/^\S+@\S+\.\S+$/.test(customerInfo.email)) {
      toast.error("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return false;
    }

    return true;
  };

  const createPaymentIntent = async () => {
    if (totalPrice <= 0) {
      toast.error("Warenkorb ist leer oder Gesamtbetrag ist null.");
      return;
    }
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice,
          currency: "eur",
          metadata: {
            customerEmail: customerInfo.email,
            customerName: customerInfo.fullName,
            country: customerInfo.country,
            totalAmount: totalPrice.toString(),
          },
        }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowStripeModal(true);
      } else {
        toast.error(data.error || "Zahlung konnte nicht initialisiert werden.");
      }
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      console.error("Fehler beim Erstellen des Zahlungsauftrags:", error);
      toast.error(
        "Zahlung konnte nicht initialisiert werden. Bitte versuchen Sie es erneut."
      );
    }
  };

  const proceedToStripePayment = async () => {
    if (!user) {
      setModal(true);
      toast.error("Sie müssen angemeldet sein, um Zahlungen durchzuführen.");
      return;
    }
    if (products.length === 0) {
      toast.error("Ihr Warenkorb ist leer.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }
    await createPaymentIntent();
  };

  const proceedToPayPalPayment = async () => {
    if (!user) {
      setModal(true);
      toast.error("Sie müssen angemeldet sein, um Zahlungen durchzuführen.");
      return;
    }
    if (products.length === 0) {
      toast.error("Ihr Warenkorb ist leer.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }
    setShowPayPalModal(true);
  };

  const createOrder = (paymentDetails: {
    method: string;
    transactionId: string;
    status: string;
  }) => {
    return {
      items: products.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
        size: item.size,
        color: item.color,
      })),
      total: totalPrice,
      subtotal: subtotal,
      promoCode: selectedCode,
      promoDiscount: discount,
      tax: tax,
      deliveryFee: deliveryFee,
      customerInfo: {
        name: customerInfo.fullName,
        email: customerInfo.email,
        address: `${customerInfo.streetAddress}${
          customerInfo.additionalAddress
            ? ", " + customerInfo.additionalAddress
            : ""
        }`,
        city: customerInfo.townCity,
        phone: customerInfo.phone,
        apartment: customerInfo.additionalAddress,
        country: customerInfo.country,
        postcode: customerInfo.postcode,
        companyName: customerInfo.companyName,
        deliveryPreferences: customerInfo.deliveryPreferences,
        deliveryNotes: customerInfo.deliveryNotes,
        accessCodes: customerInfo.accessCodes,
      },
      paymentMethod: paymentDetails.method,
      paymentDetails: {
        transactionId: paymentDetails.transactionId,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: paymentDetails.status,
        ...(paymentDetails.method === "Cash on Delivery" && {
          expectedDelivery: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
        }),
      },
      invoice: {
        invoiceId: generateCustomId(uniqueId) ?? generateSimpleInvoiceId(),
        date: new Date().toISOString(),
        details: `Invoice for order placed on ${new Date().toLocaleDateString()}`,
      },
      deliveryMethod: deliveryMethod,
      createdAt: new Date().toISOString(),
      status: "Pending",
    };
  };

  const handleSuccessfulStripePayment = async (paymentIntentId: string) => {
    if (!user) {
      toast.error("Benutzersession verloren. Bitte melden Sie sich erneut an.");
      return;
    }
    try {
      const order = createOrder({
        method: "Stripe",
        transactionId: paymentIntentId,
        status: "Completed",
      });
      await addOrderToUserProfile(user.uid, order);
      toast.success("Bestellung mit Stripe erfolgreich aufgegeben!");
      router.push("/orders");
      onClose();
    } catch (error) {
      console.error("Error placing order after Stripe payment:", error);
      toast.error(
        "Bestellung nach Zahlung konnte nicht abgeschlossen werden. Bitte kontaktieren Sie den Support."
      );
    }
  };

  const handleSuccessfulPayPalPayment = async (transactionId: string) => {
    if (!user) {
      toast.error("Benutzersession verloren. Bitte melden Sie sich erneut an.");
      return;
    }
    try {
      const order = createOrder({
        method: "PayPal",
        transactionId: transactionId,
        status: "Completed",
      });
      await addOrderToUserProfile(user.uid, order);
      toast.success("Bestellung mit PayPal erfolgreich aufgegeben!");
      router.push("/orders");
      onClose();
    } catch (error) {
      console.error("Error placing order after PayPal payment:", error);
      toast.error(
        "Bestellung nach Zahlung konnte nicht abgeschlossen werden. Bitte kontaktieren Sie den Support."
      );
    }
  };

  const handleCashCheckout = async () => {
    if (!user) {
      setModal(true);
      toast.error("Sie müssen angemeldet sein, um Zahlungen durchzuführen.");
      return;
    }
    if (products.length === 0) {
      toast.error("Ihr Warenkorb ist leer.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }

    setIsProcessing(true);
    try {
      const order = createOrder({
        method: "Cash on Delivery",
        transactionId:
          "COD-" +
          generateCustomDoc(uniqueId) +
          Math.floor(Math.random() * 100),
        status: "Pending",
      });
      await addOrderToUserProfile(user.uid, order);
      toast.success("Bestellung erfolgreich aufgegeben! (Nachnahme)");
      router.push("/orders");
      onClose();
    } catch (error) {
      console.error("Error placing cash order:", error);
      console.error("Fehler bei der Nachnahme-Bestellung:", error);
      toast.error(
        "Nachnahme-Bestellung konnte nicht aufgegeben werden. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const stripeOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: "stripe",
    },
  };

  const inputStyle =
    "mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="max-w-[99vw]-lg md:max-w-[95vw] p-0 max-h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-lg">
        <DialogTitle className="sr-only">Ihren Kauf abschließen</DialogTitle>
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-red-500">
            <h2 className="text-xl font-bold">Ihren Kauf abschließen</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:grid md:grid-cols-5 gap-8 p-4 md:p-6">
            {/* Customer Information - 3/5 width */}
            <div className="md:col-span-3 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Kundendaten</h2>
              <div className="grid gap-6">
                {/* Country/Region */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Land/Region <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="country"
                      value={customerInfo.country}
                      onChange={(e) =>
                        handleSelectChange("country", e.target.value)
                      }
                      className="appearance-none mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                      required
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Vollständiger Name (Vor- und Nachname){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Geben Sie Ihren vollständigen Namen ein"
                    className={inputStyle}
                    value={customerInfo.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Firmenname (optional)
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Firmenname eingeben"
                    className={inputStyle}
                    value={customerInfo.companyName}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefonnummer <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Telefonnummer eingeben"
                    className={inputStyle}
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Adresse</Label>
                  <Input
                    id="streetAddress"
                    placeholder="Straße und Hausnummer, Abholort"
                    className={inputStyle}
                    value={customerInfo.streetAddress}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    id="additionalAddress"
                    placeholder="Postfach, c/o, etc."
                    className={inputStyle}
                    value={customerInfo.additionalAddress}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Postcode and Town/City */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postcode" className="text-sm font-medium">
                      Postleitzahl <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postcode"
                      placeholder="Postleitzahl eingeben"
                      className={inputStyle}
                      value={customerInfo.postcode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="townCity" className="text-sm font-medium">
                      Ort/Stadt <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="townCity"
                      placeholder="Ort/Stadt eingeben"
                      className={inputStyle}
                      value={customerInfo.townCity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-Mail-Adresse <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    placeholder="E-Mail-Adresse eingeben"
                    className={inputStyle}
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    type="email"
                    required
                  />
                </div>

                {/* Delivery Instructions */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowDeliveryInstructions(!showDeliveryInstructions)
                    }
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <span>Lieferanweisungen</span>
                    <ChevronDown
                      className={`ml-1 w-4 h-4 transition-transform ${
                        showDeliveryInstructions ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <p className="text-xs text-gray-500">
                    Präferenzen, Notizen, Zugangscodes und mehr hinzufügen
                  </p>

                  {showDeliveryInstructions && (
                    <div className="space-y-4 mt-4 p-2 bg-white rounded-md">
                      <div className="space-y-2">
                        <Label
                          htmlFor="deliveryPreferences"
                          className="text-sm font-medium"
                        >
                          Lieferpräferenzen
                        </Label>
                        <Textarea
                          id="deliveryPreferences"
                          placeholder="Fügen Sie hier Ihre Lieferpräferenzen hinzu..."
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none min-h-[80px] resize-none"
                          value={customerInfo.deliveryPreferences}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="deliveryNotes"
                          className="text-sm font-medium"
                        >
                          Notizen
                        </Label>
                        <Textarea
                          id="deliveryNotes"
                          placeholder="Fügen Sie hier zusätzliche Notizen hinzu..."
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none min-h-[80px] resize-none"
                          value={customerInfo.deliveryNotes}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="accessCodes"
                          className="text-sm font-medium"
                        >
                          Zugangscodes
                        </Label>
                        <Textarea
                          id="accessCodes"
                          placeholder="Fügen Sie hier Zugangscodes oder Torcodes hinzu..."
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none min-h-[80px] resize-none"
                          value={customerInfo.accessCodes}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary - 2/5 width */}
            <div className="md:col-span-2 flex flex-col gap-5">
              {promoCodes && (
                <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-md gap-2">
                  <h2 className="text-xl font-semibold">
                    Geben Sie den Promo-Code ein
                  </h2>

                  <div className="flex flex-col gap-3 justify-end items-end mt-2">
                    <Input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Enter code here"
                      className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                    />
                    <Button text={"Verify"} onClick={handleVerify} />
                  </div>

                  {message && (
                    <div className="mt-4 text-sm font-medium text-green-700">
                      {message}
                    </div>
                  )}

                  {validUntil && (
                    <div className="text-xs text-gray-600 mt-1 italic">
                      {validUntil}
                    </div>
                  )}

                  {discount !== null && (
                    <div className="text-sm text-blue-800 mt-1">
                      🎉 Angewendeter Rabatt: <strong>{discount}%</strong>
                    </div>
                  )}
                </div>
              )}
              <div className="md:col-span-2 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Bestellübersicht</h2>
                <div className="space-y-4 w-full">
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {item.image && (
                            <div className="w-10 h-10 rounded overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <span>{item.name}</span>
                        </div>
                        <div className="text-xs text-red-500">
                          {item.isFlashSale === true
                            ? "Artikel gehört zu FlashSale."
                            : null}
                        </div>
                      </div>
                      <div>
                        <span className="text-emerald-500">
                          {" "}
                          €{item.price.toFixed(2)}
                        </span>{" "}
                        x{" "}
                        <span className="text-emerald-500">
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="font-medium">Zwischensumme</span>
                    <span className="font-medium"> €{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Steuer ({taxRate}%)</span>
                    <span className="font-medium"> €{tax.toFixed(2)}</span>
                  </div>
                  {promoCodes && (
                    <div className="flex justify-between">
                      <span className="font-medium flex flex-col gap-1">
                        <div>PromoDiscount ({discount}%)</div>
                        <div className="bg-red-100 text-red-500 rounded-md w-full text-xs px-1 py-1">
                          Aktionscodes sind nicht auf Flash-Produkte anwendbar.
                        </div>
                      </span>
                      <span className="font-medium">
                        {" "}
                        €{((discount / 100) * allnoflashtotal).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2 border-t pt-2">
                    <span className="font-medium block mb-2">
                      Lieferoptionen
                    </span>

                    {/* Free delivery message */}
                    {!isLoadingFreeDelivery && freeDeliveryThreshold > 0 && (
                      <div
                        className={`p-3 rounded-lg mb-3 ${
                          isEligibleForFreeDelivery
                            ? "bg-green-50 border border-green-200"
                            : "bg-blue-50 border border-blue-200"
                        }`}
                      >
                        {isEligibleForFreeDelivery ? (
                          <div className="text-green-700">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="font-medium">
                                Kostenlose Lieferung qualifiziert!
                              </span>
                            </div>
                            <p className="text-sm mt-1">
                              Nur Standard-Lieferung ist kostenlos ab{" "}
                              {freeDeliveryDescription}€{freeDeliveryThreshold}
                            </p>
                          </div>
                        ) : (
                          <div className="text-blue-700">
                            <p className="text-sm">
                              Noch{" "}
                              <strong>
                                €{(freeDeliveryThreshold - subtotal).toFixed(2)}
                              </strong>{" "}
                              für kostenlose Standard-Lieferung hinzufügen
                            </p>
                            <p className="text-xs mt-1">
                              Nur Standard-Lieferung ist kostenlos ab{" "}
                              {freeDeliveryDescription}€{freeDeliveryThreshold}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <RadioGroup
                      value={deliveryMethod}
                      onValueChange={setDeliveryMethod}
                      className="space-y-2 "
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="standard"
                            id="standard"
                            className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                          />
                          <Label htmlFor="standard">Standard-Lieferung</Label>
                        </div>
                        <span className="text-emerald-500">
                          {deliveryMethod === "standard" &&
                          isEligibleForFreeDelivery
                            ? "Kostenlos"
                            : `€${deliveryPrice}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="express"
                            id="express"
                            className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                          />
                          <Label htmlFor="express">Express-Lieferung</Label>
                        </div>
                        <span className="text-emerald-500">
                          €{expressPrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="pickup"
                            id="pickup"
                            className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                          />
                          <Label htmlFor="pickup">Selbstabholung</Label>
                        </div>
                        <span className="text-emerald-500">Kostenlos</span>
                      </div>
                    </RadioGroup>
                  </div>

                  <span className="font-medium">Zahlungsmethoden</span>
                  <div className="space-y-2">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="card"
                            id="card"
                            className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                          />
                          <Label htmlFor="card">Karte (Stripe)</Label>
                        </div>
                        <div className="flex space-x-1">
                          <Image
                            width={30}
                            height={30}
                            src="/visa.svg"
                            alt="Visa"
                            className="object-contain w-8 h-8"
                          />
                          <Image
                            width={30}
                            height={30}
                            src="/master.svg"
                            alt="Mastercard"
                            className="object-contain w-8 h-8"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="paypal"
                            id="paypal"
                            className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                          />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>
                        <div className="flex space-x-1">
                          <Image
                            width={30}
                            height={30}
                            src="/paypal-logo.svg"
                            alt="PayPal"
                            className="object-contain w-8 h-8"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="cash"
                          id="cash"
                          className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                        />
                        <Label htmlFor="cash">Nachnahme</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="font-bold">Gesamtbetrag</span>
                    <span className="font-bold">€{totalPrice.toFixed(2)}</span>
                  </div>

                  {paymentMethod === "card" && !showStripeModal && (
                    <div className="flex flex-row justify-center mt-4">
                      <Button
                        text="Zur sicheren Zahlung fortfahren"
                        onClick={proceedToStripePayment}
                      />
                    </div>
                  )}

                  {paymentMethod === "paypal" && !showPayPalModal && (
                    <div className="flex flex-row justify-center mt-4">
                      <Button
                        text="Mit PayPal bezahlen"
                        onClick={proceedToPayPalPayment}
                      />
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div className="flex flex-row justify-center mt-4">
                      <Button
                        text={
                          isProcessing
                            ? "Wird verarbeitet..."
                            : "Kauf abschließen (Nachnahme)"
                        }
                        onClick={handleCashCheckout}
                        disabled={isProcessing}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Payment Modal */}
        {paymentMethod === "card" && showStripeModal && clientSecret && (
          <div className="fixed inset-0 bg-[#0d0e112d] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Kartendetails eingeben
                </h3>
                <button
                  onClick={() => {
                    setShowStripeModal(false);
                    setClientSecret(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <Elements
                stripe={stripePromise}
                options={stripeOptions}
                key={clientSecret}
              >
                <StripeCheckoutForm
                  clientSecret={clientSecret}
                  onSuccessfulPayment={handleSuccessfulStripePayment}
                />
              </Elements>
            </div>
          </div>
        )}

        {/* PayPal Payment Modal */}
        {paymentMethod === "paypal" && showPayPalModal && (
          <div className="fixed inset-0 bg-[#0d0e112d] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Image
                    src="/paypal-logo.svg"
                    alt="PayPal"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  PayPal-Zahlung
                </h3>
                <button
                  onClick={() => setShowPayPalModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <PayPalScriptProvider
                options={{
                  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                  currency: "EUR",
                  intent: "capture",
                }}
              >
                <PayPalCheckoutForm
                  amount={totalPrice}
                  currency="EUR"
                  onSuccessfulPayment={handleSuccessfulPayPalPayment}
                  customerInfo={customerInfo}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        )}
      </DialogContent>
      <AuthModal isOpen={modal} onClose={() => setModal(false)} />
    </Dialog>
  );
}

function base62ToDecimal(str: string) {
  const charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = 0n; // use BigInt for large numbers

  for (let i = 0; i < str.length; i++) {
    const power = BigInt(str.length - i - 1);
    const value = BigInt(charset.indexOf(str[i]));
    result += value * 62n ** power;
  }

  return result.toString(); // convert BigInt to string if needed
}

function generateCustomId(uniqueId: string | null): string | null {
  if (!uniqueId) return null;

  const day = new Date().getDate().toString().padStart(2, "0"); // "05"
  const lastFour = uniqueId.slice(-4); // e.g., "abcd"
  const randomNum = Math.floor(Math.random() * 10) + 1; // 1–10

  return `INV-${day}${lastFour}${randomNum}`;
}

function generateCustomDoc(uniqueId: string | null): string | null {
  if (!uniqueId) return null;

  const day = new Date().getDate().toString().padStart(2, "0"); // "05"
  const lastFour = uniqueId.slice(-4); // e.g., "abcd"
  const randomNum = Math.floor(Math.random() * 10) + 1; // 1–10

  return `${day}${lastFour}${randomNum}`;
}

function generateSimpleInvoiceId(): string {
  const day = new Date().getDate().toString().padStart(2, "0"); // ensures 01–31
  const random = Math.floor(Math.random() * 9000) + 1000; // random 4-digit number
  return `INV-${day}${random}`;
}
