"use client";

import TextField from "@/components/text-field";

export default function ReturnCondition() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800 mt-5 mb-5 shadow-md rounded-md pl-10">
      <TextField text={"Rückgabe & Umtausch"} />
      <p className="text-sm text-gray-500 mb-8">
        Zuletzt aktualisiert: 22-07-2025
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Rückgabe & Umtausch</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Rückgabe oder Umtausch von Textilprodukten innerhalb von 15 Tagen
            nach Lieferung möglich.
          </li>
          <li>
            Artikel müssen unbenutzt, ungewaschen, originalverpackt und in
            einwandfreiem Zustand sein.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Rückgabefrist</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Rücksendeantrag innerhalb von 15 Tagen stellen.</li>
          <li>
            Artikel müssen spätestens 20 Tage nach Lieferung bei uns eingehen.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. So starten Sie eine Rückgabe
        </h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Support über [E-Mail/Kontaktformular-Link] kontaktieren.</li>
          <li>Bestellnummer, Artikel und Grund angeben.</li>
          <li>Auf Rücksendenummer (RA) und ggf. Rücksendeetikett warten.</li>
          <li>
            Artikel sicher verpacken und innerhalb von 7 Tagen zurücksenden.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          4. Rückgabeberechtigte Artikel
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>✔️ Alle Textilien im Originalzustand</li>
          <li>
            ❌ Keine Rückgabe: Sonderanfertigungen, personalisierte Artikel,
            Hygieneartikel, reduzierte oder Musterware
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Rückversand</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Kostenlose Rücksendung innerhalb Deutschlands.</li>
          <li>
            Kunde trägt Versandkosten bei Nutzung eines eigenen Versanddienstes.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          6. Rückerstattung & Umtausch
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Volle Rückerstattung oder Gutschrift/Umtausch möglich.</li>
          <li>
            Erstattung erfolgt innerhalb von 7 Werktagen nach Rücksendung.
          </li>
          <li>Gutschriften sind unbegrenzt gültig, aber nicht übertragbar.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Defekte oder falsche Artikel
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Innerhalb von 7 Tagen melden, idealerweise mit Fotos.</li>
          <li>
            Versandkosten werden übernommen, Ersatz oder volle Erstattung.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          8. Wiederauffüllungs- & Zusatzgebühren
        </h2>
        <p>
          Keine Gebühr, außer bei nicht einwandfreiem Zustand – ggf. Abzug bis
          zu 20 % vom Erstattungsbetrag.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Verlorene Pakete</h2>
        <p>
          Keine Haftung nach Übergabe an Versanddienstleister, außer bei
          Versicherung oder Nutzung unseres Etiketts.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Kontakt</h2>
        <p>
          Fragen? Schreiben Sie uns an{" "}
          <a href="mailto:Info@danielsbelieve.de" className="text-blue-600">
            Info@danielsbelieve.de
          </a>{" "}
          oder rufen Sie uns an unter +49 1522 3815822. Wir antworten in der
          Regel innerhalb von 24 Stunden.
        </p>
      </section>
    </div>
  );
}
