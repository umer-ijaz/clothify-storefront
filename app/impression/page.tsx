"use client";

import { useEffect, useState } from "react";
import TextField from "@/components/text-field";
import { CompanyInfo } from "@/interfaces/companyInfo";
import Loading from "../loading";
import { fetchCompanyImpression } from "@/lib/Impression";

export default function ImpressionPage() {
  const [companyData, setCompanyData] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCompanyImpression();
        if (data) {
          setCompanyData(data);
        } else {
          setError("Impression data not found.");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError("Failed to load impression data. Please try again later.");
        console.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        <Loading />
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
        <TextField text={"Legal Notice"} />

        <div className="space-y-3 text-gray-800 leading-relaxed">
          <h1 className="text-bold text-red-500 sm:text-sm md:text-lg heading">
            Khurram Rehmat
          </h1>
          <div className="space-y-1">
            <p>
              <span className="font-semibold heading">Brand Name:</span>{" "}
              {companyData.brandName}
            </p>
            <p>
              <span className="font-semibold"></span> {companyData.companyType}
            </p>
            <p>
              <span className="font-semibold heading">Address:</span>{" "}
              {companyData.address}
            </p>
            <p>
              <span className="font-semibold heading">Phone:</span>{" "}
              <a
                href={`tel:${companyData.phone}`}
                className="text-blue-600 underline"
              >
                {companyData.phone}
              </a>
            </p>
            <p>
              <span className="font-semibold heading">Email:</span>{" "}
              <a
                href={`mailto:${companyData.email}`}
                className="text-blue-600 underline"
              >
                {companyData.email}
              </a>
            </p>
            <p>
              <span className="font-semibold heading">VAT ID:</span>{" "}
              {companyData.vatId}
            </p>
          </div>

          <div>
            <span className="font-semibold block mb-1">
              Liability for Content:
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
