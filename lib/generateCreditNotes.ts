"use client";

export default function generateCreditNotePDF(returnData: any) {
  import("jspdf").then(async ({ jsPDF }) => {
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const footerHeight = 30;
    let currentY = 0;

    const spacing = {
      sectionGap: 10,
      lineHeight: 6,
    };

    const safeAreaBottom = () => pageHeight - footerHeight;

    const addNewPage = () => {
      doc.addPage();
      currentY = 20;
      addFooter();
    };

    const checkPageSpace = (estimatedHeight: number) => {
      if (currentY + estimatedHeight > safeAreaBottom()) {
        addNewPage();
      }
    };

    const base62ToLastFour = (str: string): string => {
      const charset =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      let result = 0n;
      for (let i = 0; i < str.length; i++) {
        const power = BigInt(str.length - i - 1);
        const value = BigInt(charset.indexOf(str[i]));
        result += value * 62n ** power;
      }
      return result.toString().slice(-4);
    };

    const removeInvPrefix = (id: string): string =>
      id.startsWith("INV-") ? id.slice(4) : id;

    const drawDivider = (y: number) => {
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.3);
      doc.line(marginX, y, pageWidth - marginX, y);
    };

    const addFooter = () => {
      const footerY = pageHeight - 20;
      doc.setLineWidth(0.5).setDrawColor(220, 38, 38);
      doc.line(marginX, footerY - 10, pageWidth - marginX, footerY - 10);

      doc.setFontSize(8).setTextColor(150, 150, 150);
      doc.text(
        "Um unseren Kundenservice zu kontaktieren, besuche www.danielsbelieve.de/contact-us",
        pageWidth / 2,
        footerY - 5,
        { align: "center" }
      );
      doc.text(
        "www.danielsbelieve.de | info@danielsbelieve.de",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );
    };

    const addHeader = () => {
      doc.setFillColor(248, 249, 250);
      doc.rect(0, 0, pageWidth, 50, "F");
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, 10, pageHeight, "F");

      try {
        doc.addImage("/logo.png", "PNG", 20, 10, 40, 30);
      } catch {
        doc.setFontSize(16);
        doc.setTextColor(220, 38, 38);
        doc.text("LOGO", 20, 20);
      }

      const x = marginX + 60;
      doc.setFontSize(26).setFont("helvetica", "bold").setTextColor(0, 0, 0);
      doc.text("KHURRAM REHMAT", x, 15);

      doc.setFontSize(18).setTextColor(220, 38, 38);
      doc.text("DANIEL'S BELIEVE", x, 24);

      doc.setFontSize(13).setTextColor(0, 0, 0);
      doc.text("USt-IdNr.: DE359605885", x, 30);

      doc.setFontSize(10).setTextColor(90, 90, 90);
      doc.text("E-Mail: info@danielsbelieve.de", x, 36);
      doc.text("Adresse: Richthofenstraße 39, 24159 Kiel", x, 41);

      currentY = 60;
    };

    const addCreditNoteInfo = () => {
      const creditNoteNumber = `CN-${removeInvPrefix(
        returnData.invoiceId
      )}${base62ToLastFour(returnData.id)}`;

      checkPageSpace(50);

      doc
        .setFontSize(20)
        .setTextColor(220, 38, 38)
        .setFont("helvetica", "bold")
        .text("RECHNUNGSKORREKTUR", marginX, currentY);

      doc
        .setFontSize(10)
        .setFont("helvetica", "normal")
        .setTextColor(80, 80, 80);

      const lines = [
        `Gutschriftnummer: ${creditNoteNumber}`,
        `Originalrechnungsnummer: ${returnData.invoiceId}`,
        `Rechnungsdatum: ${new Date(
          returnData.orderDetails.createdAt
        ).toLocaleDateString("de-DE")}`,
        `Belegdatum: ${new Date(returnData.processedAt).toLocaleDateString(
          "de-DE"
        )}`,
      ];

      lines.forEach((line, i) => {
        doc.text(line, marginX, currentY + 12 + i * spacing.lineHeight);
      });

      doc
        .setFont("helvetica", "bold")
        .setFontSize(14)
        .setTextColor(220, 38, 38)
        .text(
          `Zahlbetrag: -€${returnData.refundAmount.toFixed(2)}`,
          pageWidth - 20,
          currentY - 2,
          { align: "right" }
        );

      currentY += 12 + lines.length * spacing.lineHeight + spacing.sectionGap;
      drawDivider(currentY - 5);
    };

    const addCustomerInfo = () => {
      const customer = returnData.orderDetails.customerInfo;

      const colWidth = (pageWidth - marginX * 2) / 2;
      const leftX = marginX;
      const rightX = marginX + colWidth;

      const custLines = [
        `Name: ${customer.name}`,
        `Adresse: ${customer.address}`,
        `${customer.postcode} ${customer.city}`,
        `Land: ${customer.country}`,
        `E-Mail: ${customer.email}`,
        `Telefon: ${customer.phone}`,
      ];

      const sellerLines = [
        "Khurram Rehmat",
        "Daniel’s Believe",
        "Richthofenstraße 39",
        "24159 Kiel, Deutschland",
        "USt-IDNr.: DE359605885",
      ];

      const maxLines = Math.max(custLines.length, sellerLines.length);
      checkPageSpace(8 + maxLines * spacing.lineHeight + spacing.sectionGap);

      doc
        .setFont("helvetica", "bold")
        .setFontSize(12)
        .setTextColor(60, 60, 60)
        .text("LIEFERADRESSE", leftX, currentY)
        .text("VERKAUFT VON", rightX, currentY);

      doc
        .setFont("helvetica", "normal")
        .setFontSize(10)
        .setTextColor(90, 90, 90);

      custLines.forEach((line, i) => {
        doc.text(line, leftX, currentY + 8 + i * spacing.lineHeight);
      });

      sellerLines.forEach((line, i) => {
        doc.text(line, rightX, currentY + 8 + i * spacing.lineHeight);
      });

      currentY += 8 + maxLines * spacing.lineHeight + spacing.sectionGap;
      drawDivider(currentY - 5);
    };

    const addOrderInfo = () => {
      const lines = [
        `Belegdatum: ${new Date(returnData.receivedAt).toLocaleDateString(
          "de-DE"
        )}`,
        `Belegnr.: RID-${removeInvPrefix(
          returnData.invoiceId
        )}${base62ToLastFour(returnData.id)}`,
        `Bestelldatum: ${new Date(
          returnData.orderDetails.createdAt
        ).toLocaleDateString("de-DE")}`,
        `Bestellnummer: OID-${removeInvPrefix(
          returnData.invoiceId
        )}${base62ToLastFour(returnData.orderId)}`,
        `Auftraggeber: ${returnData.reason}`,
      ];

      checkPageSpace(
        8 + lines.length * spacing.lineHeight + spacing.sectionGap
      );

      doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(60, 60, 60);
      doc.text("BESTELLINFORMATIONEN", marginX, currentY);

      doc
        .setFont("helvetica", "normal")
        .setFontSize(10)
        .setTextColor(90, 90, 90);
      lines.forEach((line, i) => {
        doc.text(line, marginX, currentY + 8 + i * spacing.lineHeight);
      });

      currentY += 8 + lines.length * spacing.lineHeight + spacing.sectionGap;
      drawDivider(currentY - 5);
    };

    const addItemsTable = () => {
      const vatRate = 0.19;
      const inclVat = returnData.refundAmount;
      const exclVat = inclVat / (1 + vatRate);

      const tableData = [
        [
          returnData.itemName,
          "1",
          `-€${exclVat.toFixed(2)}`,
          "19%",
          `-€${inclVat.toFixed(2)}`,
          `-€${inclVat.toFixed(2)}`,
        ],
      ];

      const estimatedTableHeight = 30 + tableData.length * 10;
      checkPageSpace(estimatedTableHeight);

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "Beschreibung",
            "Menge",
            "Stückpreis (ohne USt.)",
            "USt. %",
            "Stückpreis (inkl. USt.)",
            "Zwischensumme (inkl. USt.)",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 9, textColor: [60, 60, 60], cellPadding: 4 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
        columnStyles: {
          1: { halign: "center" },
          2: { halign: "right" },
          3: { halign: "center" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
        margin: { left: marginX, right: marginX },
      });

      currentY = (doc as any).lastAutoTable.finalY + spacing.sectionGap;
    };

    const addVATSummary = () => {
      const vatRate = 0.19;
      const totalInclVat = returnData.refundAmount;
      const totalExclVat = totalInclVat / (1 + vatRate);
      const vatAmount = totalInclVat - totalExclVat;

      checkPageSpace(45);

      doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(60, 60, 60);
      doc.text("USt.-ZUSAMMENFASSUNG", marginX, currentY);

      autoTable(doc, {
        startY: currentY + 6,
        head: [["USt. %", "Zwischensumme (ohne USt.)", "USt."]],
        body: [
          ["19%", `-€${totalExclVat.toFixed(2)}`, `-€${vatAmount.toFixed(2)}`],
        ],
        theme: "grid",
        styles: { fontSize: 10, textColor: [60, 60, 60], cellPadding: 4 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
        columnStyles: {
          0: { halign: "center" },
          1: { halign: "right" },
          2: { halign: "right" },
        },
        margin: { left: marginX, right: marginX },
      });

      currentY = (doc as any).lastAutoTable.finalY + spacing.sectionGap;

      doc
        .setFontSize(11)
        .setFont("helvetica", "bold")
        .setTextColor(60, 60, 60)
        .text(
          `Gesamtpreis: -€${totalInclVat.toFixed(
            2
          )} (inkl. €${vatAmount.toFixed(2)} USt.)`,
          pageWidth - marginX,
          currentY,
          { align: "right" }
        );
    };

    addHeader();
    addCreditNoteInfo();
    addCustomerInfo();
    addOrderInfo();
    addItemsTable();
    addVATSummary();

    const creditNoteNumber = `CN-${removeInvPrefix(
      returnData.invoiceId
    )}${base62ToLastFour(returnData.id)}`;
    doc.save(`gutschrift-${creditNoteNumber}.pdf`);
  });
}
