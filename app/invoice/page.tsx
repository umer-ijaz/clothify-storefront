"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, DownloadCloud, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import HomeLink from "@/components/home-link";
import TextField from "@/components/text-field";

export default function InvoiceInfoPage() {
  const [open, setOpen] = useState(false);

  const steps = [
    "Bestellung aufgeben und auf Bestätigung warten.",
    "Ein Dialogfenster zeigt Ihre Bestellbestätigung an.",
    "Klicken Sie auf 'Rechnung herunterladen (PDF)', um Ihre Rechnung zu speichern.",
    "Rechnungen können später auch im Bereich 'Meine Bestellungen' heruntergeladen werden.",
  ];

  return (
    <div className="min-h-screen px-2 sm:px-4 md:px-8 lg:px-12 mt-10">
      <div className="px-2 sm:px-4 md:px-8 lg:px-12 flex flex-row gap-2 text-sm md:text-xl font-small mb-4 capitalize">
        <HomeLink />
        <span className="text-gray-400">/</span>
        <span className="text-gray-400">Rechnungsmethode</span>
        <span className="text-gray-400">/</span>
        <span className="text-red-500">Rechnung</span>
      </div>
      <TextField text={"Rechnung"} />
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center pb-10 gap-10 md:gap-5">
        {/* Left Image */}
        <div className="w-full md:w-1/2">
          <Image
            src="/invoice.jpg"
            alt="Rechnungsillustration"
            width={500}
            height={300}
          />
        </div>
        {/* Right Content */}
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <FileText className="text-purple-600 w-8 h-8" />
            <h1 className="text-3xl font-bold text-gray-800">
              Rechnung herunterladen (PDF)
            </h1>
          </div>
          <p className="text-gray-600 text-base mb-4">
            Nach erfolgreicher Bestellung im <strong>Daniel Online-Shop</strong>{" "}
            werden Sie zur Bestellübersicht weitergeleitet, wo Sie auf den
            Download-Button der entsprechenden Bestellung klicken können, um die
            Rechnung zu generieren.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400 mb-6">
            <h2 className="text-purple-700 font-semibold text-lg mb-1">
              Tipp 💡
            </h2>
            <p className="text-purple-800">
              Speichern Sie Ihre Rechnung immer für spätere Referenz, Rückgaben
              oder Garantieansprüche. Sie können alle Ihre Rechnungen im Bereich{" "}
              <strong>Meine Bestellungen</strong> einsehen.
            </p>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            So erhalten Sie Ihre Rechnung
          </h2>
          <ul className="space-y-3 text-gray-700 mb-6">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <ArrowRight className="text-indigo-500 mt-1" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
          {/* Example Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)} className="cursor-pointer">
                Bestätigungsdialog anzeigen
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-none">
              <DialogHeader>
                <DialogTitle>Bestellung erfolgreich aufgegeben</DialogTitle>
                <DialogDescription>
                  Vielen Dank für Ihre Bestellung! Sie können jetzt Ihre
                  Rechnung herunterladen.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => alert("Rechnung wird heruntergeladen...")}
                  className="bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white rounded-full border-none hover:bg-red cursor-pointer"
                >
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  Rechnung herunterladen (PDF)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
