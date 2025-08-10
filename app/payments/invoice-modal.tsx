"use client";

import { useState } from "react";
import { Download, CheckCircle, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceModalProps } from "@/interfaces/invoiceinterface";

export default function InvoiceModal({
  isOpen,
  onClose,
  orderData,
}: InvoiceModalProps) {
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  if (!isOpen) return null;

  const generateInvoicePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = 0;

    const addHeader = () => {
      // Set background color for the entire header
      doc.setFillColor(248, 249, 250);
      doc.rect(0, 0, pageWidth, 50, "F");

      // Red accent on the left
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, 10, pageHeight, "F");

      const logoWidth = 40;
      const logoHeight = 30;
      const logoX = margin;
      const logoY = 10;

      try {
        doc.addImage("/logo.png", "PNG", logoX, logoY, logoWidth, logoHeight);
      } catch {
        doc.setFontSize(16);
        doc.setTextColor(220, 38, 38);
        doc.text("LOGO", logoX, 20);
      }

      // Add vertical line on right side of logo
      const lineX = logoX + logoWidth + 10; // 10px right of logo
      doc.setDrawColor(200, 200, 200); // Light gray color
      doc.setLineWidth(0.5);
      doc.line(lineX, logoY, lineX, logoY + logoHeight + 3);

      // Company info on the right side - moved closer to logo
      const rightX = margin + 60; // Reduced space after logo from ~80 to 60

      // "Khurram Rehmat" in bigger bold black text
      doc.setFontSize(26); // Increased from 20 to 24
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("KHURRAM REHMAT", rightX, 15);

      // "Daniel's Believe" in red and larger
      doc.setFontSize(18); // Increased from 14 to 18
      doc.setTextColor(220, 38, 38);
      doc.text("DANIEL'S BELIEVE", rightX, 24); // Adjusted y-position

      // "DE359605885" in black with larger text
      doc.setFontSize(13); // Increased from 11 to 13
      doc.setTextColor(0, 0, 0);
      doc.text("DE359605885", rightX, 30); // Adjusted y-position

      // Contact info (email and address) - larger size
      doc.setFontSize(10); // Increased from 9 to 10
      doc.setTextColor(90, 90, 90);
      doc.text("Email: info@danilsbelive.de", rightX, 36); // Adjusted y-position
      doc.text("Address: Richthofenstraße 39, 24159 Kiel", rightX, 41); // Adjusted y-position

      currentY = 60;
    };

    const addFooter = () => {
      const footerY = pageHeight - 20;
      doc.setLineWidth(0.5);
      doc.setDrawColor(220, 38, 38);
      doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Vielen Dank für Ihren Einkauf bei Daniel E-Commerce!",
        pageWidth / 2,
        footerY - 5,
        { align: "center" }
      );
      doc.text(
        "www.danielsbelieve.de | info@danilsbelive.de",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );
    };

    const addInvoiceInfo = () => {
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text("RECHNUNG", margin, currentY);

      doc.setFontSize(10);
      doc.text(
        `Rechnungsnummer: ${orderData.invoice.invoiceId}`,
        margin,
        currentY + 8
      );
      doc.text(
        `Datum: ${new Date(orderData.invoice.date).toLocaleDateString(
          "de-DE"
        )}`,
        margin,
        currentY + 16
      );
      doc.text(
        `Bestellnummer: ${
          "OID-" +
          removeInvPrefix(orderData.invoice.invoiceId) +
          base62ToLastFour(orderData.id)
        }`,
        pageWidth / 2 + 8,
        currentY + 8
      );

      currentY += 30;
    };

    const addCustomerAndPaymentInfo = () => {
      const colWidth = (pageWidth - margin * 3) / 2;
      const leftX = margin;
      const rightX = margin * 2 + colWidth;
      const lineHeight = 6; // Consistent line height
      const maxLines = 10; // Maximum expected lines per column

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.text("RECHNUNGSADRESSE", leftX, currentY);
      doc.text("ZAHLUNGSINFORMATIONEN", rightX, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);

      const leftY = currentY + 10;
      const rightY = currentY + 10;

      // Customer Info (left column) - with automatic line breaks
      const customer = orderData.customerInfo;

      // Split address into multiple lines if needed
      const addressLines = doc.splitTextToSize(
        `${customer.name}\n${
          customer.companyName ? customer.companyName + "\n" : ""
        }${customer.address}\n${customer.postcode || ""} ${
          customer.city
        }\nLand: ${customer.country || "Deutschland"}\nTelefon: ${
          customer.phone
        }\nEmail: ${customer.email}`,
        colWidth - 5 // Slightly less than column width for padding
      );

      // Payment Info (right column)
      const payment = orderData.paymentDetails;
      const paymentInfo = [
        `Zahlungsmethode: ${orderData.paymentMethod}`,
        `Transaktions-ID: ${payment.transactionId}`,
        `Datum: ${new Date(payment.date).toLocaleDateString("de-DE")}`,
        ...(payment.time ? [`Uhrzeit: ${payment.time}`] : []),
        `Status: ${translateStatus(payment.status)}`,
        ...(payment.expectedDelivery
          ? [`Voraussichtliche Lieferung: ${payment.expectedDelivery}`]
          : []),
      ];

      // Calculate total lines needed (use whichever is longer)
      const totalLines = Math.max(
        addressLines.length,
        paymentInfo.length,
        maxLines
      );

      // Draw left column lines
      addressLines.forEach((line: any, index: any) => {
        if (index < maxLines) {
          doc.text(line, leftX, leftY + index * lineHeight);
        }
      });

      // Draw right column lines
      paymentInfo.forEach((line, index) => {
        if (index < maxLines) {
          doc.text(line, rightX, rightY + index * lineHeight);
        }
      });

      // Add empty lines if needed to balance columns
      for (let i = addressLines.length; i < totalLines; i++) {
        doc.text("", leftX, leftY + i * lineHeight);
      }
      for (let i = paymentInfo.length; i < totalLines; i++) {
        doc.text("", rightX, rightY + i * lineHeight);
      }

      currentY += totalLines * lineHeight + 10;
    };

    const addItemsTable = () => {
      const itemRows = orderData.items.map((item) => [
        item.name,
        item.size || "N/A",
        item.color || "N/A",
        item.quantity,
        `€${item.price.toFixed(2)}`,
        `€${(item.price * item.quantity).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Artikel", "Größe", "Farbe", "Menge", "Preis", "Gesamt"]],
        body: itemRows,
        theme: "grid",
        styles: {
          fontSize: 9,
          textColor: [60, 60, 60],
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: 255,
        },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { halign: "center" },
          2: { halign: "center" },
          3: { halign: "center" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
        margin: { left: margin, right: margin },
        didDrawPage: () => {
          addHeader();
          addFooter();
        },
        showHead: "everyPage",
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    };

    const addSummaryAndPaymentDetails = async () => {
      const summaryWidth = 80;
      const summaryX = pageWidth - margin - summaryWidth;

      // Summary Box
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(summaryX, currentY, summaryWidth, 50, 3, 3, "F");

      const labelX = summaryX + 40;
      const valueX = summaryX + summaryWidth - 5;
      let lineY = currentY + 10;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Zwischensumme:", labelX, lineY, { align: "right" });
      doc.text("Steuer (19)%:", labelX, (lineY += 6), {
        align: "right",
      });
      doc.text("Versand:", labelX, (lineY += 6), { align: "right" });
      doc.text(
        `promoDiscount (${orderData.promoDiscount})%:`,
        labelX,
        (lineY += 6),
        {
          align: "right",
        }
      );
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      lineY = currentY + 10;
      doc.text(`€${orderData.subtotal.toFixed(2)}`, valueX, lineY, {
        align: "right",
      });
      doc.text(`€${orderData.tax.toFixed(2)}`, valueX, (lineY += 6), {
        align: "right",
      });
      doc.text(`€${orderData.deliveryFee.toFixed(2)}`, valueX, (lineY += 6), {
        align: "right",
      });
      doc.text(`-€${orderData.promoCost}`, valueX, (lineY += 6), {
        align: "right",
      });
      doc.setDrawColor(220, 38, 38);
      doc.line(summaryX, currentY + 40, summaryX + summaryWidth, currentY + 40);

      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text("GESAMTSUMME:", labelX, currentY + 48, { align: "right" });
      doc.text(`€${orderData.total.toFixed(2)}`, valueX, currentY + 48, {
        align: "right",
      });

      // Terms Block
      currentY += 60;
      const terms = [
        "Vielen Dank für Ihre Bestellung.",
        "Vekauft von",
        "Khurram Rehmat",
        "Daniel’s Believe",
        "Richthofen Str 39, 24159 Kiel",
        "Germany",
        "Ust-IDNr. DE359605885",
      ];

      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.setFont("helvetica", "normal");

      for (const line of terms) {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
          addHeader();
          addFooter();
        }
        doc.text(line, margin, currentY);
        currentY += 6;
      }
    };

    // Generate full PDF
    addHeader();
    addInvoiceInfo();
    addCustomerAndPaymentInfo();
    addItemsTable();
    addSummaryAndPaymentDetails();
    doc.save(`rechnung-${orderData.invoice.invoiceId}.pdf`);
    setInvoiceGenerated(true);
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "Completed":
        return "Abgeschlossen";
      case "Pending":
        return "Ausstehend";
      case "Processing":
        return "In Bearbeitung";
      case "Shipped":
        return "Versandt";
      case "Cancelled":
        return "Storniert";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 w-full">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-2 text-sm">
            <span className="font-semibold">Bestellstatus: </span>
            <span
              className={
                orderData.status === "Completed"
                  ? "text-green-600"
                  : orderData.status === "Pending"
                  ? "text-yellow-600"
                  : "text-gray-600"
              }
            >
              {translateStatus(orderData.status)}
            </span>
          </div>
          {invoiceGenerated ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Rechnung heruntergeladen
              </h2>
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-full"
              >
                Schließen
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Bestellung bestätigt!</h2>
              <p className="text-gray-600 text-center mb-6">
                Klicken Sie unten, um Ihre Rechnung herunterzuladen.
              </p>
              <button
                onClick={generateInvoicePDF}
                className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 text-white py-3 px-6 rounded-full flex items-center gap-2"
              >
                <Download size={18} />
                Rechnung herunterladen
              </button>
            </>
          )}
        </div>
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
