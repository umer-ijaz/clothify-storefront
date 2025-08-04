"use client";

import React, { useState } from "react";
import {
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomButton from "../components/button";
import generateCreditNotePDF from "@/lib/generateCreditNotes";

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

interface ReturnManagementProps {
  returnRequests: ReturnRequest[];
}

export default function ReturnManagement({
  returnRequests,
}: ReturnManagementProps) {
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  console.log(returnRequests);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Received":
        return <Truck className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-900 border-green-300";
      case "Received":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInspectionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "inspection done":
        return "bg-green-100 text-green-800 border-green-200";
      case "reviewing your product":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending inspection":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: FirestoreTimestamp) => {
    if (!timestamp) return "";
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1_000_000
    );
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateString = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    console.log(selectedReturn);
  };

  if (returnRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">
          Es wurden keine Rückgabeanfragen gefunden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <h3 className="text-blue-700 font-semibold text-lg mb-1">
          Rücksendeverwaltung 📦
        </h3>
        <p className="text-blue-800 text-sm">
          Verfolgen Sie Ihre Rückgabeanfragen und den Inspektionsstatus.
        </p>
      </div>

      {/* Payment Processing Note */}
      <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-amber-700 font-semibold text-sm mb-1">
              Rückerstattungsbearbeitung 💳
            </h4>
            <p className="text-amber-800 text-sm">
              Der Kunde erhält den Rückerstattungsbetrag innerhalb von{" "}
              <span className="font-semibold">5–10</span> Tagen nach der
              Rückerstattung auf die ursprüngliche Zahlungsmethode
              zurückerstattet.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 bg-white">
        {returnRequests.map((returnRequest) => (
          <div
            key={returnRequest.id}
            className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusIcon(returnRequest.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        returnRequest.status
                      )}`}
                    >
                      {returnRequest.status}
                    </span>
                    {returnRequest.inspectionStatus &&
                      returnRequest.status !== "Rejected" && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getInspectionStatusColor(
                            returnRequest.inspectionStatus
                          )}`}
                        >
                          <Search className="w-3 h-3 inline mr-1" />
                          {returnRequest.inspectionStatus}
                        </span>
                      )}
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-2">
                    {returnRequest.itemName}
                  </h4>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Bestellnummer:</span>{" "}
                      {returnRequest.invoiceId &&
                        "OID-" +
                          removeInvPrefix(returnRequest.invoiceId) +
                          base62ToLastFour(returnRequest.orderId)}
                    </p>
                    <p>
                      <span className="font-medium">Menge:</span>{" "}
                      {returnRequest.itemQuantity} × €
                      {returnRequest.itemPrice.toFixed(2)}
                    </p>
                    {returnRequest.refundAmount && (
                      <p>
                        <span className="font-medium">
                          Rückerstattungsbetrag:
                        </span>{" "}
                        €{returnRequest.refundAmount.toFixed(2)}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Grund:</span>{" "}
                      {returnRequest.reason}
                    </p>
                    <p>
                      <span className="font-medium">Beantragt:</span>{" "}
                      {formatTimestamp(returnRequest.requestedAt)}
                    </p>
                    {returnRequest.receivedAt && (
                      <p>
                        <span className="font-medium">Erhalten am:</span>{" "}
                        {formatDateString(returnRequest.receivedAt)}
                      </p>
                    )}
                    {returnRequest.processedAt && (
                      <p>
                        <span className="font-medium">Bearbeitet am:</span>{" "}
                        {formatDateString(returnRequest.processedAt)}
                      </p>
                    )}
                  </div>

                  {returnRequest.adminMessage && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Admin-Nachricht:</span>{" "}
                        {returnRequest.adminMessage}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {returnRequest.inspectionHistory &&
                    returnRequest.inspectionHistory.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(returnRequest)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Verlauf anzeigen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg bg-white">
                          <DialogHeader>
                            <DialogTitle>Rückgabe-Verlauf</DialogTitle>
                            <DialogDescription>
                              Detaillierter Verlauf Ihrer Rückgabeanfrage
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-sm">
                              <h4 className="font-semibold mb-2">
                                {selectedReturn?.itemName}
                              </h4>
                              <p className="text-gray-600">
                                {selectedReturn?.invoiceId
                                  ? "RID-" +
                                    removeInvPrefix(selectedReturn.invoiceId) +
                                    base62ToLastFour(selectedReturn.id)
                                  : selectedReturn?.id}
                              </p>
                            </div>

                            {selectedReturn?.inspectionHistory && (
                              <div className="space-y-3">
                                <h5 className="font-medium text-gray-800">
                                  Inspektionsverlauf:
                                </h5>
                                <div className="space-y-2">
                                  {selectedReturn.inspectionHistory
                                    .sort((a, b) => {
                                      const timeA =
                                        a.timestamp.seconds * 1000 +
                                        a.timestamp.nanoseconds / 1_000_000;
                                      const timeB =
                                        b.timestamp.seconds * 1000 +
                                        b.timestamp.nanoseconds / 1_000_000;
                                      return timeB - timeA; // Newest first
                                    })
                                    .map((history, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex-shrink-0 mt-0.5">
                                          {history.status
                                            .toLowerCase()
                                            .includes("done") ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                          ) : history.status
                                              .toLowerCase()
                                              .includes("reviewing") ? (
                                            <Search className="w-4 h-4 text-blue-500" />
                                          ) : (
                                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-800">
                                              {history.status}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {formatTimestamp(
                                                history.timestamp
                                              )}
                                            </span>
                                          </div>
                                          {history.adminNote && (
                                            <p className="text-xs text-gray-600">
                                              {history.adminNote}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                </div>
              </div>
              <div className="flex justify-end w-full">
                {returnRequest.status == "Completed" ? (
                  <CustomButton
                    text={"Download Credit Notes"}
                    onClick={() => generateCreditNotePDF(returnRequest)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
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
