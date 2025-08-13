"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Button from "./button";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";
import { toast } from "sonner";
import { resizeImageUrl } from "@/lib/imagesizeadjutment";

interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ReturnItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  orderId: string;
  userId: string;
  invoiceId: string;
  orderCreatedAt: string;
  onSuccess?: () => void;
}

const REASONS = [
  "Größen- oder Passformprobleme",
  "Beschädigter oder defekter Artikel",
  "Entsprach nicht den Erwartungen",
  "Meinungsänderung / Spontankauf",
  "Falsche Bestellung",
  "Lieferverzögerungen",
  "Unerwünschtes Geschenk",
  "Irreführende Produktinformationen",
  "Inkompatibilität / technische Probleme",
  "Schlechter Kundenservice",
  "Sonstiges",
];

export default function ReturnItemModal({
  isOpen,
  onClose,
  item,
  orderId,
  userId,
  orderCreatedAt,
  invoiceId,
  onSuccess,
}: ReturnItemModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalReason =
      selectedReason === "Sonstiges" ? customReason.trim() : selectedReason;

    if (!finalReason) {
      setError("Bitte wählen Sie einen Rücksendegrund aus.");
      return;
    }

    if (!acceptedTerms) {
      setError("Bitte bestätigen Sie die Rückgabebedingungen.");
      return;
    }

    setIsSubmitting(true);

    try {
      const returnsCollectionRef = collection(firestore, "returns");
      const qrCodeData = `RETURN-${orderId}-${item.id}-${Date.now()}`;

      const returnData = {
        userId,
        orderId,
        orderCreatedAt,
        itemId: item.id,
        itemName: item.name,
        itemQuantity: item.quantity,
        itemPrice: item.price,
        reason: finalReason,
        requestedAt: serverTimestamp(),
        status: "Pending",
        qrCode: qrCodeData,
        adminMessage: "",
        invoiceId,
        acceptedTerms: true, // ✅ Track checkbox status
      };

      await addDoc(returnsCollectionRef, returnData);

      toast.success("Rückgabeanfrage erfolgreich übermittelt.");
      setSelectedReason("");
      setCustomReason("");
      setAcceptedTerms(false);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error submitting return request:", err);
      setError("Rückgabeanfrage konnte nicht übermittelt werden.");
      toast.error("Rückgabeanfrage konnte nicht übermittelt werden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedReason("");
      setCustomReason("");
      setAcceptedTerms(false);
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Artikel zurücksenden</DialogTitle>
          <DialogDescription>
            Bitte wählen Sie den Grund für Ihre Rückgabe aus.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Item Details */}
          <div className="flex items-center gap-4 p-3 border rounded-md bg-gray-50">
            <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-300 flex-shrink-0">
              <Image
                src={
                  resizeImageUrl(item.image!, "200x200") ||
                  item.image ||
                  "/placeholder.svg?height=64&width=64"
                }
                alt={item.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    item.image || "/placeholder.svg?height=64&width=64";
                }}
              />
            </div>
            <div>
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-xs text-gray-500">
                Menge: {item.quantity} | Preis: ${item.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Rücksendegrund</Label>
            <div className="space-y-2">
              {REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === "Sonstiges" && (
              <Textarea
                placeholder="Bitte geben Sie den Rücksendegrund an..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                className="bg-white border border-gray-400 rounded-md focus:border-orange-500 focus:ring-red-500/20 pl-4"
                required
              />
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                Ich habe die{" "}
                <a
                  href="/return-condition"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Rückgabebedingungen
                </a>{" "}
                gelesen und akzeptiere sie.
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter className="flex flex-row justify-end items-center gap-2 pt-2">
            <Button text="Abbrechen" onClick={onClose} type="button" />
            <Button
              text={
                isSubmitting ? "Wird übermittelt..." : "Rückgabe einreichen"
              }
              type="submit"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
