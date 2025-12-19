"use client";

import { useState, useEffect } from "react";
import TextField from "@/components/text-field";
import { fetchReturnPolicyPeriod } from "@/lib/returnCondition";

export default function ReturnCondition() {
  const [returnPeriod, setReturnPeriod] = useState<number>(14); // Standardwert
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const loadReturnPolicy = async () => {
      try {
        const period = await fetchReturnPolicyPeriod();
        if (period) {
          setReturnPeriod(period);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadReturnPolicy();
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    setLastUpdated(formattedDate);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800 mt-5 mb-5 shadow-md rounded-md pl-10">
      <TextField text={"Return & Exchange"} />
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {lastUpdated}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Return & Exchange</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            You can return or exchange any item sold by Daniel’s Believe within
            <strong> {returnPeriod} days</strong> of delivery.
          </li>
          <li>
            Items must be in new, unused, and unwashed condition, in original
            packaging, with tags (if applicable) and without damage, odors, or
            markings.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Return Period</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Return requests must be submitted within
            <strong> {returnPeriod} days</strong> of delivery.
          </li>
          <li>
            Items must be received by us no later than <strong>{returnPeriod + 6} days</strong>
            after delivery.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. How to Initiate a Return
        </h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Customers must initiate the return via the return button.
          </li>
          <li>We receive the return request and approve it.</li>
          <li>
            Customers will receive a barcode via email within 24 business hours.
          </li>
          <li>
            Customers present the barcode at the shipping carrier's branch.
          </li>
          <li>
            After scanning the barcode, the shipping carrier sends the package
            back to us free of charge.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Eligible Items</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>✔️ All textiles in original, perfect condition</li>
          <li>
            ❌ Non-returnable: custom printed fabrics, personalized items,
            clearance or discounted goods, hygienic items (e.g., underwear), and
            samples.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Return Shipping</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Free return shipping within Germany.</li>
          <li>
            Customers bear the return shipping costs for self-shipment (except
            in cases of defects/damage).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          6. Refund & Exchange
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            We offer full refunds to the original payment method.
          </li>
          <li>
            Refunds are processed within <strong>3 business days</strong>
            after inspection of receipt.
          </li>
          <li>
            The amount will be credited within <strong>5–10 days</strong> after
            issuance of the refund.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Defective or Incorrect Items
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Contact us within <strong>7 days</strong> of delivery via email and
            preferably with photos.
          </li>
          <li>
            We cover retail shipping and offer replacement or full refund.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          8. Restocking Fee & Additional Costs
        </h2>
        <p>
          No restocking fee unless the item is not in its original condition – in
          which case we reserve the right to withhold a partial amount (up to 20%)
          from the refund amount.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Lost Shipments</h2>
        <p>
          Once the return has been handed over to the shipping carrier, we assume
          no liability for loss – unless you have chosen insurance or used our
          label.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
        <p>
          For questions or support, reach us via email at{" "}
          <a href="mailto:Info@danielsbelieve.de" className="text-blue-600">
            Info@danielsbelieve.de
          </a>{" "}
          or by phone at <strong>+49 1522 3815822</strong>. We strive to
          respond within <strong>24 hours</strong>.
        </p>
      </section>
    </div>
  );
}
