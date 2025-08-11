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
      <TextField text={"Rückgabe & Umtausch"} />
      <p className="text-sm text-gray-500 mb-8">
        Zuletzt aktualisiert: {lastUpdated}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Rückgabe & Umtausch</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Sie können jeden von Daniel’s Believe verkauften Artikel innerhalb
            von <strong>{returnPeriod} Tagen</strong> nach Lieferung zurückgeben
            oder umtauschen.
          </li>
          <li>
            Artikel müssen in neuem, unbenutztem und ungewaschenem Zustand, in
            Originalverpackung, mit Etiketten (falls vorhanden) und ohne
            Beschädigungen, Gerüche oder Markierungen sein.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Rückgabezeitraum</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Rückgabeanträge müssen innerhalb von{" "}
            <strong>{returnPeriod} Tagen</strong> nach Lieferung eingereicht
            werden.
          </li>
          <li>
            Artikel müssen spätestens <strong>{returnPeriod + 6} Tage</strong>{" "}
            nach Lieferung bei uns eingegangen sein.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. Wie Sie eine Rückgabe einleiten
        </h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Kunden müssen über den Rückgabe-Button die Rückgabe einleiten.
          </li>
          <li>Wir erhalten den Rückgabeantrag und genehmigen ihn.</li>
          <li>
            Kunden erhalten innerhalb von 24 Werksstunden per E-Mail einen
            Barcode.
          </li>
          <li>
            Kunden legen den Barcode in der Filiale des Versanddienstleisters
            vor.
          </li>
          <li>
            Nach dem Scannen des Barcodes sendet der Versanddienstleister das
            Paket kostenfrei an uns zurück.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Zulässige Artikel</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>✔️ Alle Textilien in originalem, einwandfreiem Zustand</li>
          <li>
            ❌ Nicht rückgabefähig: individuell bedruckte Stoffe,
            personalisierte Artikel, Ausverkaufs- oder rabattierte Ware,
            hygienische Artikel (z. B. Unterwäsche) und Muster.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Rückversand</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Kostenloser Rückversand innerhalb Deutschlands.</li>
          <li>
            Kunden tragen die Rücksendekosten bei eigenem Versand (außer bei
            Defekten/Beschädigungen).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          6. Rückerstattung & Umtausch
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Wir bieten vollständige Rückerstattung auf die ursprüngliche
            Zahlungsmethode.
          </li>
          <li>
            Rückerstattungen werden innerhalb von <strong>3 Werktagen</strong>{" "}
            nach Eingangsprüfung bearbeitet.
          </li>
          <li>
            Der Betrag wird innerhalb von <strong>5–10 Tagen</strong> nach
            Ausstellung der Rückerstattung gutgeschrieben.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Defekte oder falsche Artikel
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Kontaktieren Sie uns innerhalb von <strong>7 Tagen</strong> nach
            Lieferung per E-Mail und möglichst mit Fotos.
          </li>
          <li>
            Wir übernehmen den Rückversand und bieten Ersatz oder vollständige
            Rückerstattung.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          8. Wiedereinlagerungs­gebühr & Zusatzkosten
        </h2>
        <p>
          Keine Wiedereinlagerungsgebühr, es sei denn, der Artikel ist nicht im
          Originalzustand – in dem Fall behalten wir uns vor, einen Teilbetrag
          (bis zu 20 %) vom Erstattungsbetrag einzubehalten.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Verlorene Sendungen</h2>
        <p>
          Sobald die Rücksendung an den Versanddienstleister übergeben wurde,
          übernehmen wir keine Haftung bei Verlust – außer Sie haben eine
          Versicherung gewählt oder unser Etikett genutzt.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Kontakt</h2>
        <p>
          Bei Fragen oder Unterstützung erreichen Sie uns per E-Mail an{" "}
          <a href="mailto:Info@danielsbelieve.de" className="text-blue-600">
            Info@danielsbelieve.de
          </a>{" "}
          oder telefonisch unter <strong>+49 1522 3815822</strong>. Wir bemühen
          uns, innerhalb von <strong>24 Stunden</strong> zu antworten.
        </p>
      </section>
    </div>
  );
}
