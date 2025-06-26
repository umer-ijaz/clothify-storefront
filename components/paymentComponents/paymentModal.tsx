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
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      onSuccessfulPayment(paymentIntent.id);
    } else if (paymentIntent) {
      setErrorMessage(`Payment status: ${paymentIntent.status}`);
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
          text={isProcessing ? "Processing..." : "Pay with Stripe"}
        />
      </div>
      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}
    </form>
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
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [modal, setModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showDeliveryInstructions, setShowDeliveryInstructions] =
    useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const subtotal = products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryFee = deliveryMethod === "standard" ? 100 : 0;
  const tax = subtotal * (taxRate / 100);
  const totalPrice = subtotal + tax + deliveryFee;

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

  const createPaymentIntent = async () => {
    if (totalPrice <= 0) {
      toast.error("Cart is empty or total is zero.");
      return;
    }
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowStripeModal(true);
      } else {
        toast.error(data.error || "Failed to initialize payment.");
      }
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  const proceedToStripePayment = async () => {
    if (!user) {
      setModal(true);
      toast.error("You must be logged in to make payments.");
      return;
    }
    if (products.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }
    await createPaymentIntent();
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
        invoiceId: `INV-${Date.now()}`,
        date: new Date().toISOString(),
        details: `Invoice for order placed on ${new Date().toLocaleDateString()}`,
      },
      deliveryMethod: deliveryMethod,
      createdAt: new Date().toISOString(),
      status: paymentDetails.status,
    };
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
      toast.success("Order placed successfully with Stripe!");

      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      if (onSuccess) {
        onSuccess(orderId);
      } else {
        router.push("/orders");
      }
      onClose();
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
    if (products.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!validateCustomerInfo()) {
      return;
    }

    setIsProcessing(true);
    try {
      const order = createOrder({
        method: "Cash on Delivery",
        transactionId: "COD" + Math.floor(Math.random() * 1000000),
        status: "Pending",
      });
      await addOrderToUserProfile(user.uid, order);
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      toast.success("Order placed successfully! (Cash on Delivery)");

      if (onSuccess) {
        onSuccess(orderId);
      } else {
        router.push("/orders");
      }
      onClose();
    } catch (error) {
      console.error("Error placing cash order:", error);
      toast.error("Failed to place cash order. Please try again.");
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
        <DialogTitle className="sr-only">Complete Your Purchase</DialogTitle>
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-red-500">
            <h2 className="text-xl font-bold">Complete Your Purchase</h2>
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
              <h2 className="text-xl font-semibold mb-6">
                Customer Information
              </h2>
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
                    className={inputStyle}
                    value={customerInfo.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company name (optional)
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    className={inputStyle}
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
                    className={inputStyle}
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Address</Label>
                  <Input
                    id="streetAddress"
                    placeholder="Street name and number, pickup location"
                    className={inputStyle}
                    value={customerInfo.streetAddress}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    id="additionalAddress"
                    placeholder="PO Box, c/o, etc."
                    className={inputStyle}
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
                      className={inputStyle}
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
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    placeholder="Enter email address"
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
                    <div className="space-y-4 mt-4 p-2 bg-white rounded-md">
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
              </div>
            </div>

            {/* Order Summary - 2/5 width */}
            <div className="md:col-span-2 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4 w-full">
                {products.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
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
                    <div>
                      <span className="text-emerald-500">
                        {" "}
                        €{item.price.toFixed(2)}
                      </span>{" "}
                      x{" "}
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
                  <span className="font-medium block mb-2">
                    Delivery Options
                  </span>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                    className="space-y-2"
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
                      <span className="text-emerald-500"> €100</span>
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
                        <Label htmlFor="card">Card (Stripe)</Label>
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
                  <span className="font-bold">€{totalPrice.toFixed(2)}</span>
                </div>

                {paymentMethod === "card" && !showStripeModal && (
                  <div className="flex flex-row justify-center mt-4">
                    <Button
                      text="Proceed to Secure Payment"
                      onClick={proceedToStripePayment}
                    />
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="flex flex-row justify-center mt-4">
                    <Button
                      text={
                        isProcessing
                          ? "Processing..."
                          : "Complete Purchase (Cash)"
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

        {/* Stripe Payment Modal */}
        {paymentMethod === "card" && showStripeModal && clientSecret && (
          <div className="fixed inset-0 bg-[#0d0e112d] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Enter Card Details</h3>
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
      </DialogContent>
      <AuthModal isOpen={modal} onClose={() => setModal(false)} />
    </Dialog>
  );
}
