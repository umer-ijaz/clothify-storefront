"use client";
import { useCartStore } from "@/context/addToCartContext";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, ChevronDown } from "lucide-react";
import HomeLink from "@/components/home-link";
import Link from "next/link";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TextField from "@/components/text-field";
import Button from "@/components/button";
import { useTaxStore } from "@/context/taxContext";
import { useDeliveryPriceStore } from "@/context/deliveryPriceContext";
import { addOrderToUserProfile, Order } from "@/lib/orders";
import { AuthModal } from "@/components/auth-modal";
import { toast } from "sonner";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getCountries } from "@/context/countries";
import { useExpressDeliveryPriceStore } from "@/context/expressDeliveryPriceContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import PayPalProviderWrapper from "@/components/paypal-provider-wrapper";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CustomerInfo {
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
}

const StripeCheckoutForm = ({
  clientSecret,
  onSuccessfulPayment,
  customerInfo,
}: {
  clientSecret: string;
  onSuccessfulPayment: (paymentIntentId: string) => void;
  customerInfo: CustomerInfo;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (stripe && elements) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage(
        "Zahlungssystem nicht bereit. Bitte versuchen Sie es erneut."
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
          payment_method_data: {
            billing_details: {
              name: customerInfo.fullName,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: {
                line1: customerInfo.streetAddress,
                line2: customerInfo.additionalAddress || undefined,
                city: customerInfo.townCity,
                postal_code: customerInfo.postcode,
                country: "DE",
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Zahlungsfehler:", error);
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
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Fehler bei der Zahlungsabwicklung:", error);
      setErrorMessage(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      );
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <p className="text-sm text-gray-600 text-center">
          Zahlungsformular wird geladen...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="min-h-[200px]">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card"],
              fields: {},
              defaultValues: {
                billingDetails: {
                  email: "",
                },
              },
            }}
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        <div className="w-full">
          <button
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className="w-full bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Zahlung wird bearbeitet...</span>
              </div>
            ) : (
              "Zahlung abschließen"
            )}
          </button>
        </div>
      </form>
    </div>
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
  customerInfo: CustomerInfo;
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
        throw new Error(data.error || "Fehler beim Erstellen der PayPal-Bestellung");
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
        throw new Error(captureData.error || "Fehler beim Abschließen der PayPal-Zahlung");
      }

      if (captureData.status === "COMPLETED") {
        toast.success("PayPal-Zahlung erfolgreich!");
        onSuccessfulPayment(captureData.transactionId);
      } else {
        throw new Error(`PayPal-Zahlungsstatus: ${captureData.status}`);
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
      <div className="min-h-[200px]">
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
            height: 50,
          }}
        />
      </div>
      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 p-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">PayPal-Zahlung wird bearbeitet...</span>
        </div>
      )}
    </div>
  );
};

export default function Payments() {
  const { cart, clearCart } = useCartStore();
  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { taxRate } = useTaxStore();
  const { deliveryPrice } = useDeliveryPriceStore();
  const { expressPrice } = useExpressDeliveryPriceStore();
  const [modal, setModal] = useState(false);
  const [showDeliveryInstructions, setShowDeliveryInstructions] =
    useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [uniqueId, setUniqueId] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    country: "Deutschland",
    fullName: "",
    companyName: "",
    phone: "",
    streetAddress: "",
    additionalAddress: "",
    postcode: "",
    townCity: "",
    email: "",
    deliveryPreferences: "",
    deliveryNotes: "",
    accessCodes: "",
  });

  const countries = getCountries();

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

  useEffect(() => {
    if (user && customerInfo.email === "") {
      setCustomerInfo((prev) => ({ ...prev, email: user.email || "" }));
    }
    if (!user) {
      setModal(true);
      toast.error("Sie müssen angemeldet sein, um Zahlungen durchzuführen.");
    }
    setMounted(true);
  }, [user]);

  if (!mounted) {
    return null;
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryFee =
    deliveryMethod === "standard"
      ? deliveryPrice
      : deliveryMethod == "express"
      ? expressPrice
      : 0;
  const tax = subtotal * (taxRate / 100);
  const totalPrice = subtotal + tax + deliveryFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createOrder = (paymentDetails: {
    method: string;
    transactionId: string;
    status: string;
  }): Order => {
    const now = new Date();
    return {
      items: cart.map((item) => ({
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
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        status: paymentDetails.status,
        ...(paymentDetails.method === "Cash upon delivery" && {
          expectedDelivery: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
        }),
      },
      invoice: {
        invoiceId: generateCustomId(uniqueId) ?? generateSimpleInvoiceId(),

        date: now.toISOString(),
        details: `Invoice for order placed on ${now.toLocaleDateString()}`,
      },
      deliveryMethod: deliveryMethod,
      createdAt: now.toISOString(),
      status: "Pending",
    };
  };

  const createPaymentIntent = async () => {
    if (totalPrice <= 0) {
      toast.error("Warenkorb ist leer oder Gesamtbetrag ist null.");
      return;
    }

    setShowStripeModal(true);
    setClientSecret(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP-Fehler! Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.error || "Kein Client Secret erhalten");
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des Zahlungsauftrags:", error);
      setShowStripeModal(false);
      setClientSecret(null);
      toast.error(
        "Fehler bei der Initialisierung der Zahlung. Bitte versuchen Sie es erneut."
      );
    }
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
      if (!customerInfo[field as keyof CustomerInfo]) {
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

  const proceedToStripePayment = async () => {
    if (!user) {
      setModal(true);
      toast.error("Sie müssen angemeldet sein, um Zahlungen durchzuführen.");
      return;
    }
    if (cart.length === 0) {
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
    if (cart.length === 0) {
      toast.error("Ihr Warenkorb ist leer.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }
    setShowPayPalModal(true);
  };

  const handleSuccessfulStripePayment = async (paymentIntentId: string) => {
    if (!user) {
      toast.error("Benutzersitzung verloren. Bitte melden Sie sich erneut an.");
      return;
    }
    try {
      const order = createOrder({
        method: "Stripe",
        transactionId: paymentIntentId,
        status: "Completed",
      });
      await addOrderToUserProfile(user.uid, order);
      clearCart();
      toast.success("Bestellung mit Stripe erfolgreich aufgegeben!");
      router.push("/orders");
    } catch (error) {
      console.error("Fehler bei der Bestellung nach Stripe-Zahlung:", error);
      toast.error(
        "Fehler beim Abschließen der Bestellung nach der Zahlung. Bitte kontaktieren Sie den Support."
      );
    }
  };

  const handleSuccessfulPayPalPayment = async (transactionId: string) => {
    if (!user) {
      toast.error("Benutzersitzung verloren. Bitte melden Sie sich erneut an.");
      return;
    }
    try {
      const order = createOrder({
        method: "PayPal",
        transactionId: transactionId,
        status: "Completed",
      });
      await addOrderToUserProfile(user.uid, order);
      clearCart();
      toast.success("Bestellung mit PayPal erfolgreich aufgegeben!");
      setShowPayPalModal(false);
      router.push("/orders");
    } catch (error) {
      console.error("Fehler bei der Bestellung nach PayPal-Zahlung:", error);
      toast.error(
        "Fehler beim Abschließen der Bestellung nach der Zahlung. Bitte kontaktieren Sie den Support."
      );
    }
  };

  const handleCashCheckout = async () => {
    if (!user) {
      setModal(true);
      toast.error("Sie müssen angemeldet sein, um Zahlungen durchzuführen.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Ihr Warenkorb ist leer.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }

    try {
      const order = createOrder({
        method: "Cash upon delivery",
        transactionId:
          "COD-" + generateCustomDoc(uniqueId) + Math.floor(Math.random() * 100),
        status: "Pending",
      });
      await addOrderToUserProfile(user.uid, order);
      clearCart();
      toast.success(
        "Bestellung erfolgreich aufgegeben! (Barzahlung bei Lieferung)"
      );
      router.push("/orders");
    } catch (error) {
      console.error("Fehler bei der Barzahlungsbestellung:", error);
      toast.error(
        "Fehler bei der Barzahlungsbestellung. Bitte versuchen Sie es erneut."
      );
    }
  };

  const stripeOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: "stripe",
      variables: {
        fontFamily: "system-ui, sans-serif",
        fontSizeBase: "16px",
        borderRadius: "8px",
        colorPrimary: "#EB1E24",
        spacingUnit: "4px",
      },
      rules: {
        ".Tab": {
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          padding: "12px",
        },
        ".Tab:hover": {
          backgroundColor: "#f1f3f4",
        },
        ".Tab--selected": {
          backgroundColor: "white",
          borderColor: "#EB1E24",
        },
        ".Input": {
          fontSize: "16px", // Prevents zoom on iOS
          padding: "12px",
        },
        ".Label": {
          fontSize: "14px",
          fontWeight: "500",
        },
      },
    },
    locale: "de",
    loader: "auto",
  };

  return (
    <div className="relative pb-20 h-full">
      <div className="mt-0">
        <nav className="py-8 flex items-center mb-4 text-md md:text-xl font-small capitalize gap-1 md:gap-1 px-4 sm:px-6 md:px-8 lg:px-12">
          <HomeLink />
          <span className="mx-2 text-gray-400">/</span>
          <Link href={"/cart"} className="text-gray-400 hover:text-gray-700">
            Warenkorb
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-red-500">Zahlung</span>
        </nav>
        <TextField text={"Zahlung"} />
        <div className="grid md:grid-cols-5 gap-8 px-2 sm:px-4 md:px-8 lg:px-12">
          <div className="md:col-span-3 bg-white p-6 rounded-lg border border-gray-200 shadow-md">
            <h2 className="text-xl font-semibold mb-6">Kundeninformationen</h2>
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
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Company Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Firmenname (optional)
                </Label>
                <Input
                  id="companyName"
                  placeholder="Firmenname eingeben"
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.companyName}
                  onChange={handleInputChange}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefonnummer
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="Telefonnummer eingeben"
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Kann zur Unterstützung der Lieferung verwendet werden
                </p>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Adresse</Label>

                {/* Street Address */}
                <Input
                  id="streetAddress"
                  placeholder="Straße und Hausnummer, Abholort"
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.streetAddress}
                  onChange={handleInputChange}
                  required
                />

                {/* Additional Address Info */}
                <Input
                  id="additionalAddress"
                  placeholder="Postfach, c/o, Pakadoo PAK-ID, etc."
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
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
                    className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                    value={customerInfo.postcode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="townCity" className="text-sm font-medium">
                    Stadt/Ort <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="townCity"
                    placeholder="Stadt/Ort eingeben"
                    className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
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
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
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
                  Wünsche, Notizen, Zugangscodes und mehr hinzufügen
                </p>

                {showDeliveryInstructions && (
                  <div className="space-y-4 mt-4 p-2 rounded-md">
                    <div className="space-y-2">
                      <Label
                        htmlFor="deliveryPreferences"
                        className="text-sm font-medium"
                      >
                        Lieferwünsche
                      </Label>
                      <Textarea
                        id="deliveryPreferences"
                        placeholder="Fügen Sie hier Ihre Lieferwünsche hinzu..."
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

              <div className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Pflichtfelder. Speichern
                Sie diese Informationen für einen schnelleren Checkout beim
                nächsten Mal
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-6 rounded-lg border border-gray-200 bg-white shadow-md h-full">
            <h2 className="text-xl font-semibold mb-4">Warenkorbsumme</h2>
            <div className="space-y-4 w-full">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span>{item.name}</span>
                  <div>
                    <span className="text-emerald-500"> €{item.price}</span> x{" "}
                    <span className="text-emerald-500">{item.quantity}</span>
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
              <div className="space-y-2 border-t pt-2">
                <span className="font-medium block mb-2">Lieferoptionen</span>
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
                    <span className="text-emerald-500"> €{deliveryPrice}</span>
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
                    <span className="text-emerald-500"> €{expressPrice}</span>
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
                  onValueChange={(value) => {
                    setPaymentMethod(value);
                    if (value === "card") {
                      setClientSecret(null);
                      setShowPayPalModal(false);
                    } else if (value === "paypal") {
                      setShowStripeModal(false);
                      setClientSecret(null);
                    } else {
                      setShowStripeModal(false);
                      setShowPayPalModal(false);
                      setClientSecret(null);
                    }
                  }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="card"
                        id="card_stripe"
                        className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                      />
                      <Label htmlFor="card_stripe">Karte (Stripe)</Label>
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
                        height={20}
                        src="/paypal-logo.svg"
                        alt="PayPal"
                        className="object-contain w-12 h-6"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="cash"
                      id="cash"
                      className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                    />
                    <Label htmlFor="cash">Barzahlung bei Lieferung</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-bold">Gesamtsumme</span>
                <span className="font-bold">
                  {" "}
                  €{cart.length > 0 ? totalPrice.toFixed(2) : "0.00"}
                </span>
              </div>
              {paymentMethod === "card" && !showStripeModal && (
                <div className="flex flex-row justify-center mt-4">
                  <Button
                    text="Zur sicheren Zahlung"
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

              {paymentMethod === "card" && showStripeModal && (
                <div className="fixed inset-0 bg-[#1b1b1b2a] bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold">
                        Kartendaten eingeben
                      </h3>
                      <button
                        onClick={() => {
                          setShowStripeModal(false);
                          setClientSecret(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Gesamtbetrag:{" "}
                        <span className="font-semibold">
                          €{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {clientSecret ? (
                      <Elements
                        stripe={stripePromise}
                        options={stripeOptions}
                        key={clientSecret}
                      >
                        <StripeCheckoutForm
                          clientSecret={clientSecret}
                          onSuccessfulPayment={handleSuccessfulStripePayment}
                          customerInfo={customerInfo} // Pass customerInfo here
                        />
                      </Elements>
                    ) : (
                      <div className="space-y-4 text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                        <p className="text-gray-600">
                          Sichere Zahlung wird initialisiert...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && showPayPalModal && (
                <div className="fixed inset-0 bg-[#1b1b1b2a] bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold">
                        PayPal-Zahlung
                      </h3>
                      <button
                        onClick={() => {
                          setShowPayPalModal(false);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Gesamtbetrag:{" "}
                        <span className="font-semibold">
                          €{totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        Sie werden zur sicheren PayPal-Zahlung weitergeleitet
                      </div>
                    </div>
                    <PayPalProviderWrapper clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!}>
                      <PayPalCheckoutForm
                        amount={totalPrice}
                        currency="EUR"
                        onSuccessfulPayment={handleSuccessfulPayPalPayment}
                        customerInfo={customerInfo}
                      />
                    </PayPalProviderWrapper>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="flex flex-row justify-center mt-4">
                  <Button
                    text="Zur Kasse (Barzahlung)"
                    onClick={handleCashCheckout}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Image
        src="/BG-Customer-reviews.png"
        alt="Customer Reviews Background"
        fill
        className="object-contain absolute -z-50 bottom-50"
      />
      <AuthModal isOpen={modal} onClose={() => setModal(false)} />
    </div>
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
