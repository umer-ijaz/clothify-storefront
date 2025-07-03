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
  customerInfo, // Add customerInfo as a prop
}: {
  clientSecret: string;
  onSuccessfulPayment: (paymentIntentId: string) => void;
  customerInfo: CustomerInfo; // Add this type
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for stripe and elements to be ready
    if (stripe && elements) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Give it a moment to fully initialize
      return () => clearTimeout(timer);
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Payment system is not ready. Please try again.");
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
                country: "DE", // Germany country code
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        setErrorMessage(error.message || "An unexpected error occurred.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccessfulPayment(paymentIntent.id);
      } else if (paymentIntent) {
        setErrorMessage(`Payment status: ${paymentIntent.status}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
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
        <p className="text-sm text-gray-600 text-center">Loading payment form...</p>
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
              fields: {
                // billingDetails: {
                //   email: "never",
                //   phone: "never",
                //   address: "never"
                // }
              },
              defaultValues: {
                billingDetails: {
                  email: '',
                }
              }
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
                <span>Processing Payment...</span>
              </div>
            ) : (
              "Complete Payment"
            )}
          </button>
        </div>
      </form>
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
  const [modal, setModal] = useState(false);
  const [showDeliveryInstructions, setShowDeliveryInstructions] =
    useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    country: "Germany",
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
    if (user && customerInfo.email === "") {
      setCustomerInfo((prev) => ({ ...prev, email: user.email || "" }));
    }
    if (!user) {
      setModal(true);
      toast.error("You must be logged in to make payments.");
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
  const deliveryFee = deliveryMethod === "standard" ? deliveryPrice : 0;
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
        ...(paymentDetails.method === "Cash on Delivery" && {
          expectedDelivery: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
        }),
      },
      invoice: {
        invoiceId: `INV-${Date.now()}`,
        date: now.toISOString(),
        details: `Invoice for order placed on ${now.toLocaleDateString()}`,
      },
      deliveryMethod: deliveryMethod,
      createdAt: now.toISOString(),
      status: paymentDetails.status,
    };
  };

  const createPaymentIntent = async () => {
    if (totalPrice <= 0) {
      toast.error("Cart is empty or total is zero.");
      return;
    }

    // Show loading state
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
          currency: "eur", // Explicitly set EUR currency
          metadata: {
            customerEmail: customerInfo.email,
            customerName: customerInfo.fullName,
            country: customerInfo.country,
            totalAmount: totalPrice.toString(),
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.error || "No client secret received");
      }
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      setShowStripeModal(false);
      setClientSecret(null);
      toast.error("Failed to initialize payment. Please try again.");
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
          `Please fill in the ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field.`
        );
        return false;
      }
    }

    if (!/^\S+@\S+\.\S+$/.test(customerInfo.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const proceedToStripePayment = async () => {
    if (!user) {
      setModal(true);
      toast.error("You must be logged in to make payments.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }
    await createPaymentIntent();
  };

  const handleSuccessfulStripePayment = async (paymentIntentId: string) => {
    if (!user) {
      toast.error("User session lost. Please log in again.");
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
      toast.success("Order placed successfully with Stripe!");
      router.push("/orders");
    } catch (error) {
      console.error("Error placing order after Stripe payment:", error);
      toast.error(
        "Failed to finalize order after payment. Please contact support."
      );
    }
  };

  const handleCashCheckout = async () => {
    if (!user) {
      setModal(true);
      toast.error("You must be logged in to make payments.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }

    try {
      const order = createOrder({
        method: "Cash on Delivery",
        transactionId: "COD" + Math.floor(Math.random() * 1000000),
        status: "Pending",
      });
      await addOrderToUserProfile(user.uid, order);
      clearCart();
      toast.success("Order placed successfully! (Cash on Delivery)");
      router.push("/orders");
    } catch (error) {
      console.error("Error placing cash order:", error);
      toast.error("Failed to place cash order. Please try again.");
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
            Cart
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-red-500">Payment</span>
        </nav>
        <TextField text={"Payment"} />
        <div className="grid md:grid-cols-5 gap-8 px-2 sm:px-4 md:px-8 lg:px-12">
          <div className="md:col-span-3 bg-white p-6 rounded-lg border border-gray-200 shadow-md">
            <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
            <div className="grid gap-6">
              {/* Country/Region */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  Country/Region <span className="text-red-500">*</span>
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
                  Full name (first name and surname){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Company Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company name (optional)
                </Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.companyName}
                  onChange={handleInputChange}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  May be used to assist delivery
                </p>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Address</Label>

                {/* Street Address */}
                <Input
                  id="streetAddress"
                  placeholder="Street name and number, pickup location"
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.streetAddress}
                  onChange={handleInputChange}
                  required
                />

                {/* Additional Address Info */}
                <Input
                  id="additionalAddress"
                  placeholder="PO Box, c/o, Pakadoo PAK-ID, etc."
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                  value={customerInfo.additionalAddress}
                  onChange={handleInputChange}
                />
              </div>

              {/* Postcode and Town/City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-sm font-medium">
                    Postcode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postcode"
                    placeholder="Enter postcode"
                    className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
                    value={customerInfo.postcode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="townCity" className="text-sm font-medium">
                    Town/City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="townCity"
                    placeholder="Enter town/city"
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
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  placeholder="Enter email address"
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
                  <span>Delivery instructions</span>
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform ${
                      showDeliveryInstructions ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <p className="text-xs text-gray-500">
                  Add preferences, notes, access codes and more
                </p>

                {showDeliveryInstructions && (
                  <div className="space-y-4 mt-4 p-2 rounded-md">
                    <div className="space-y-2">
                      <Label
                        htmlFor="deliveryPreferences"
                        className="text-sm font-medium"
                      >
                        Delivery Preferences
                      </Label>
                      <Textarea
                        id="deliveryPreferences"
                        placeholder="Add your delivery preferences here..."
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
                        Notes
                      </Label>
                      <Textarea
                        id="deliveryNotes"
                        placeholder="Add any additional notes here..."
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
                        Access Codes
                      </Label>
                      <Textarea
                        id="accessCodes"
                        placeholder="Add access codes or gate codes here..."
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none min-h-[80px] resize-none"
                        value={customerInfo.accessCodes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Required fields. Save
                this information for faster check-out next time
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-6 rounded-lg border border-gray-200 bg-white shadow-md h-full">
            <h2 className="text-xl font-semibold mb-4">Cart Total</h2>
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
                <span className="font-medium">Subtotal</span>
                <span className="font-medium"> €{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Tax ({taxRate}%)</span>
                <span className="font-medium"> €{tax.toFixed(2)}</span>
              </div>
              <div className="space-y-2 border-t pt-2">
                <span className="font-medium block mb-2">Delivery Options</span>
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
                      <Label htmlFor="standard">Standard Delivery</Label>
                    </div>
                    <span className="text-emerald-500"> €{deliveryPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="pickup"
                        id="pickup"
                        className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                      />
                      <Label htmlFor="pickup">Personal Pickup</Label>
                    </div>
                    <span className="text-emerald-500">Free</span>
                  </div>
                </RadioGroup>
              </div>
              <span className="font-medium">Payment Methods</span>
              <div className="space-y-2">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value);
                    if (value === "card") {
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
                      <Label htmlFor="card_stripe">Card (Stripe)</Label>
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="cash"
                      id="cash"
                      className="text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                    />
                    <Label htmlFor="cash">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  {" "}
                  €{cart.length > 0 ? totalPrice.toFixed(2) : "0.00"}
                </span>
              </div>
              {paymentMethod === "card" && !showStripeModal && (
                <div className="flex flex-row justify-center mt-4">
                  <Button
                    text="Proceed to Secure Payment"
                    onClick={proceedToStripePayment}
                  />
                </div>
              )}

              {paymentMethod === "card" && showStripeModal && (
                <div className="fixed inset-0 bg-[#1b1b1b2a] bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold">
                        Enter Card Details
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
                        Total Amount: <span className="font-semibold">€{totalPrice.toFixed(2)}</span>
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
                        <p className="text-gray-600">Initializing secure payment...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="flex flex-row justify-center mt-4">
                  <Button text="Checkout (Cash)" onClick={handleCashCheckout} />
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
