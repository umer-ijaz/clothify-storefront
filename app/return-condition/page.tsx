"use client";

import TextField from "@/components/text-field";

export default function ReturnCondition() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800 mt-5 mb-5 shadow-md rounded-md pl-10">
      <TextField text={"Rückgabe & Umtausch"} />
      <p className="text-sm text-gray-500 mb-8">
        Zuletzt aktualisiert: 25-07-2025
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Rückgabe & Umtausch</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Sie können jeden <strong>Artikel von Daniel’s Believe</strong>{" "}
            innerhalb von
            <strong> 14 Tagen</strong> nach Lieferung zurückgeben oder
            umtauschen.
          </li>
          <li>
            Die Artikel müssen sich in{" "}
            <strong>neuem, unbenutztem und ungewaschenem Zustand</strong>{" "}
            befinden, in der <strong>Originalverpackung</strong>, mit{" "}
            <strong>angebracht Etiketten</strong> (falls vorhanden) und dürfen
            keine Flecken, Gerüche oder Beschädigungen aufweisen.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Rückgabefrist</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Rückgabeanträge müssen{" "}
            <strong>innerhalb von 14 Tagen nach Lieferung</strong> eingereicht
            werden.
          </li>
          <li>
            Die Artikel müssen spätestens <strong>20 Tage</strong> nach
            Lieferung bei uns eingehen.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. So starten Sie eine Rückgabe
        </h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Klicken Sie auf den Rückgabe-Button, um den Prozess zu starten.
          </li>
          <li>Wir erhalten den Rückgabeantrag und genehmigen diesen.</li>
          <li>
            Innerhalb von 24 Werktagen erhalten Sie den Barcode per E-Mail.
          </li>
          <li>
            Bringen Sie den Barcode zur nächstgelegenen Filiale des
            Versanddienstleisters.
          </li>
          <li>
            Nach dem Scannen des Barcodes wird das Paket kostenlos an uns
            zurückgesendet.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          4. Rückgabeberechtigte Artikel
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>✔️ Alle Textilien im ursprünglichen, einwandfreien Zustand</li>
          <li>
            ❌ Keine Rückgabe: bedruckte Sonderstoffe, personalisierte Artikel,
            Ausverkaufs- oder Rabattware, Hygieneartikel (z. B. Unterwäsche) und
            Muster.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Rückversand</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Kostenloser Rückversand</strong> innerhalb Deutschlands.
          </li>
          <li>
            Der Kunde trägt die Rücksendekosten bei Nutzung eines eigenen
            Versanddienstleisters (außer bei beschädigten/fehlerhaften
            Artikeln).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          6. Rückerstattung & Umtausch
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Wir erstatten den vollen Betrag auf Ihre ursprüngliche
            Zahlungsmethode.
          </li>
          <li>
            Rückerstattungen werden innerhalb von <strong>7 Werktagen</strong>{" "}
            nach Erhalt und Prüfung der Rücksendung bearbeitet.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Defekte oder falsche Artikel
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Bitte kontaktieren Sie uns innerhalb von <strong>7 Tagen</strong>{" "}
            nach Erhalt der Ware per E-Mail – idealerweise mit{" "}
            <strong>Fotos</strong> des Problems.
          </li>
          <li>
            Wir übernehmen die Rücksendekosten und bieten einen{" "}
            <strong>Ersatz</strong> oder eine{" "}
            <strong>volle Rückerstattung</strong> an.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          8. Wiederauffüllungs- & Zusatzgebühren
        </h2>
        <p>
          Es fällt keine Gebühr an, es sei denn, der Artikel ist nicht im
          Originalzustand – in diesem Fall behalten wir uns das Recht vor, bis
          zu 20 % vom Erstattungsbetrag abzuziehen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Verlorene Pakete</h2>
        <p>
          Nach Übergabe an den Versanddienstleister übernehmen wir keine Haftung
          für verlorene Pakete, außer bei <strong>versichertem Versand</strong>{" "}
          oder Nutzung unseres Rücksendeetiketts.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Kontakt</h2>
        <p>
          Bei Fragen oder Anliegen schreiben Sie uns an{" "}
          <a href="mailto:Info@danielsbelieve.de" className="text-blue-600">
            Info@danielsbelieve.de
          </a>{" "}
          oder rufen Sie uns unter <strong>+49 1522 3815822</strong> an. Wir
          antworten in der Regel innerhalb von <strong>24 Stunden.</strong>
        </p>
      </section>
    </div>
  );
}
