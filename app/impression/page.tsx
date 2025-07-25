"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../lib/firebaseConfig"; // adjust if needed
import TextField from "@/components/text-field";

// TypeScript interface
export interface CompanyInfo {
  brandName: string;
  companyType: string;
  address: string;
  phone: string;
  email: string;
  vatId: string;
  liabilityContent: string;
}

export default function ImpressionPage() {
  const [companyData, setCompanyData] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyDocRef = doc(firestore, "company_info", "impression");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(companyDocRef);
        if (docSnap.exists()) {
          setCompanyData(docSnap.data() as CompanyInfo);
        } else {
          setError("Impression data not found.");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error fetching impression data:", message);
        setError("Failed to load impression data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading impression data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 text-lg font-medium">
        {error}
      </div>
    );
  }

  if (!companyData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <TextField text={"Impressum"} />

        <div className="space-y-3 text-gray-800 leading-relaxed">
          <h1 className="text-bold text-red-500 sm:text-sm md:text-lg">
            Khurram Rehmat
          </h1>
          <div className="space-y-1">
            <p>
              <span className="font-semibold">Markenname:</span>{" "}
              {companyData.brandName}
            </p>
            <p>
              <span className="font-semibold"></span> {companyData.companyType}
            </p>
            <p>
              <span className="font-semibold">Adresse:</span>{" "}
              {companyData.address}
            </p>
            <p>
              <span className="font-semibold">Telefon:</span>{" "}
              <a
                href={`tel:${companyData.phone}`}
                className="text-blue-600 underline"
              >
                {companyData.phone}
              </a>
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              <a
                href={`mailto:${companyData.email}`}
                className="text-blue-600 underline"
              >
                {companyData.email}
              </a>
            </p>
            <p>
              <span className="font-semibold">Ust.Nr.:</span>{" "}
              {companyData.vatId}
            </p>
          </div>

          <div>
            <span className="font-semibold block mb-1">
              Haftung für Inhalte:
            </span>
            <p className="whitespace-pre-line py-2">
              {companyData.liabilityContent}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
