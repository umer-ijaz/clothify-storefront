"use client";

import HomeLink from "@/components/home-link";
import TextField from "@/components/text-field";

export default function InvoiceInfoPage() {
  return (
    <div className="min-h-screen px-2 sm:px-4 md:px-8 lg:px-12 mt-10">
      {/* Breadcrumb */}
      <div className="px-2 sm:px-4 md:px-8 lg:px-12 flex flex-row gap-2 text-sm md:text-xl font-small mb-4 capitalize">
        <HomeLink />
        <span className="text-gray-400">/</span>
        <span className="text-gray-400 subheading">Rechnungsmethode</span>
        <span className="text-gray-400">/</span>
        <span className="text-red-500 subheading">Rechnungskauf</span>
      </div>

      {/* Page Heading */}
      <TextField text={"Rechnung"} />

      {/* Content */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 text-gray-800 leading-relaxed text-base md:text-md">
        <p className="mb-4">
          Sie sind bereits Kunde im{" "}
          <strong>Daniel's Believe Online-Shop</strong>. Um auf Rechnung zu
          kaufen, wählen Sie bitte zunächst die{" "}
          <strong>Produkt-ID/SKU-Nummer</strong> und die{" "}
          <strong>gewünschte Menge</strong> aus und teilen Sie uns diese per
          E-Mail an{" "}
          <a
            href="mailto:info@danielsbelieve.de"
            className="text-blue-600 underline"
          >
            info@danielsbelieve.de
          </a>{" "}
          oder telefonisch unter{" "}
          <a href="tel:+4915223815822" className="text-blue-600 underline">
            +49 152 23815822
          </a>{" "}
          mit. Wir senden Ihnen innerhalb von 24 Stunden eine Rechnung zu.
        </p>
        <p className="mb-4">
          Der Kauf auf Rechnung ist grundsätzlich nur für Einwohner von{" "}
          <strong>Altenheim</strong> oder <strong>betreuter Wohnung</strong>{" "}
          möglich. Bitte teilen Sie den Namen und die Adresse des Altenheims
          oder der betreuten Wohnung, Ihren vollständigen Namen und Ihren
          Wohnbereich mit.
        </p>
        <p className="mb-4">
          Die verantwortliche Person muss die Rechnung innerhalb von{" "}
          <strong>7 Werktagen</strong> bezahlen. Nach der Zahlungsbestätigung
          liefern wir das Produkt an Ihren Wohnort innerhalb von{" "}
          <strong>2–3 Werktagen</strong>.
        </p>
        <p className="text-red-600 font-semibold">
          Hinweis: Rechnungen/Käufe unter <strong>170 Euro</strong> können nicht
          auf Rechnung abgewickelt werden. Eine Rechnung wird nur erstellt, wenn
          der gewünschte Kaufwert <strong>170 Euro übersteigt</strong>. Kunden
          unter 170 Euro müssen <strong>online kaufen</strong>.
        </p>
      </div>
    </div>
  );
}
