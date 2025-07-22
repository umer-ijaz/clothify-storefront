"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Download,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
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

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  itemQuantity: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Processing" | "Completed";
  requestedAt: FirestoreTimestamp;
  qrCode: string;
  adminMessage?: string;
  invoiceId: string;
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const generateQRCode = async (qrData: string) => {
    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = async (qrData: string, returnId: string) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, qrData, {
        width: 300,
        margin: 2,
      });

      const link = document.createElement("a");
      link.download = `return-qr-${returnId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const handleViewQR = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    generateQRCode(returnRequest.qrCode);
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
          Verfolgen Sie Ihre Rückgabeanfragen und laden Sie QR-Codes für eine
          einfache Abwicklung herunter.
        </p>
      </div>

      <div className="grid gap-4 bg-white">
        {returnRequests.map((returnRequest) => (
          <div
            key={returnRequest.id}
            className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(returnRequest.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      returnRequest.status
                    )}`}
                  >
                    {returnRequest.status}
                  </span>
                </div>

                <h4 className="font-semibold text-gray-800 mb-1">
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
                  <p>
                    <span className="font-medium">Grund:</span>{" "}
                    {returnRequest.reason}
                  </p>
                  <p>
                    <span className="font-medium">Beantragt:</span>{" "}
                    {new Date(
                      returnRequest.requestedAt.seconds * 1000 +
                        returnRequest.requestedAt.nanoseconds / 1_000_000
                    ).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
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

              <div className="flex flex-col sm:flex-row gap-2 ">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQR(returnRequest)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      QR-Code anzeigen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                      <DialogTitle>QR-Code für Rückgabe</DialogTitle>
                      <DialogDescription>
                        Scannen Sie diesen QR-Code, um den Status Ihrer Rückgabe
                        zu verfolgen.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4">
                      {qrCodeUrl && (
                        <div className="p-4 bg-white border rounded-lg">
                          <Image
                            src={qrCodeUrl}
                            alt="Return QR Code"
                            width={300}
                            height={300}
                            className="rounded"
                          />
                        </div>
                      )}
                      <p className="text-sm text-gray-600 text-center">
                        Rückgabe-ID: {selectedReturn?.id}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    downloadQRCode(returnRequest.qrCode, returnRequest.id)
                  }
                  className="flex items-center gap-2 bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B]"
                >
                  <Download className="w-4 h-4" />
                  QR-Code herunterladen
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden canvas for QR code generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
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
