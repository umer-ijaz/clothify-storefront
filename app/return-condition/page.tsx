"use client";

import { useState, useEffect } from "react";
import TextField from "@/components/text-field";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

export default function ReturnCondition() {
  const [returnPeriod, setReturnPeriod] = useState<number>(14); // Default value
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const fetchReturnPolicy = async () => {
      try {
        const docRef = doc(firestore, "settings", "deliveryWarranty");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.returnPolicy && data.returnPolicy.period) {
            setReturnPeriod(data.returnPolicy.period);
          }
        }
      } catch (error) {
        console.error("Error fetching return policy:", error);
      }
    };

    fetchReturnPolicy();
    // Set last updated date to today
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    setLastUpdated(`${day}-${month}-${year}`);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800 mt-5 mb-5 shadow-md rounded-md pl-10">
      <TextField text={"Return & Exchange"} />
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {lastUpdated}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Returns & Exchanges</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            You may return or exchange any Artikel sold by Daniel’s Believe within{" "}
            <strong>{returnPeriod} days</strong> of delivery.
          </li>
          <li>
            Items must be in new, unused, and unwashed condition, in their
            original packaging, with tags attached (if provided), and free from
            any markings, odors, or damages.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Return Timeframe</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            All return requests must be submitted within{" "}
            <strong>{returnPeriod} days</strong> of delivery.
          </li>
          <li>
            Items must be received by us no later than{" "}
            <strong>{returnPeriod + 6} days</strong> from delivery.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. How to Initiate a Return
        </h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Customers must initiate return on Return button.</li>
          <li>We will received return request and approve.</li>
          <li>
            Customers receive the Barcode via email from us within 24 working
            hours.
          </li>
          <li>
            Customers need to bring Barcode with to the courier company outlet.
          </li>
          <li>
            After scanning the barcode, courier company send the parcel to us
            free of cost.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Eligible Items</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>✔️ All textiles in original, pristine condition</li>
          <li>
            ❌ Non-returnable: custom-printed fabrics, personalized items, final
            sale or discounted goods, hygienic items (like intimate wear), and
            samples .
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Return Shipping</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Free returns within Germany.</li>
          <li>
            Customer covers return shipping if using own courier (unless
            defective/damaged).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Refunds & Exchanges</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We offer full refunds to your original payment method.</li>
          <li>
            Refunds are processed within <strong>3 business days</strong> once we’ve received and
            inspect the return.
          </li>
          <li>
            Customer will have the refund amount into original payment method
            within <strong>5-10 days</strong> once we issue refund.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Defective or Incorrect Items
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Contact us via email within <strong>7 days</strong> of delivery to report damage or
            errors, preferably with photos.
          </li>
          <li>
            We will cover return shipping and offer a replacement or full
            refund.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          8. Restocking & Additional Fees
        </h2>
        <p>
          No restocking fee unless the returned item is not in its original
          condition, in which case we reserve the right to deduct a percentage
          (up to 20%) from the refund.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Lost Packages</h2>
        <p>
          Once the return is handed to the carrier, we are not responsible for
          lost packages unless you opted for insured shipping or used our
          provided label.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Contact Information</h2>
        <p>
          If you have questions or need help, email{" "}
          <a href="mailto:Info@danielsbelieve.de" className="text-blue-600">
            Info@danielsbelieve.de
          </a>{" "}
          or call <strong>+49 1522 3815822</strong>. We aim to respond within <strong>24 hours</strong>.
        </p>
      </section>
    </div>
  );
}
