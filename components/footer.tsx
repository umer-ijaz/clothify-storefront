"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { getFooterInfo } from "@/lib/footer";
import { SiTiktok } from "react-icons/si";

interface FooterInfo {
  address: string;
  email: string;
  phone: string;
}

export default function Footer() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo>({
    address: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const data = await getFooterInfo();
        setFooterInfo({
          address: data?.address || "",
          email: data?.email || "",
          phone: data?.phone || "",
        });
      } catch (error) {
        console.error("Failed to fetch footer info", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooter();
  }, []);

  const Skeleton = () => (
    <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
  );

  return (
    <footer className="bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white py-12 w-full h-auto">
      <div className="max-w-full border-b-white border-b-[1px] pb-5">
        {/* Left Section - Brand */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative pl-6 md:pl-0">
          {/* Logo and Description */}
          <div className="max-w-full md:max-w-xs text-center md:text-left pl-6 pr-6 md:pr-0">
            <Image
              src="/logo.webp"
              alt="Brand Logo"
              width={100}
              height={100}
              loading="lazy"
              className="w-30 h-25 mx-auto md:mx-0 border p-2"
            />
            <p className="mt-4 text-sm heading-luxury">
              „Trage Selbstvertrauen, beherrsche den Moment. Mode, die spricht,
              bevor du es tust!“
              <br />
              „Stil ist nicht nur, was du trägst – es ist, wie du dich
              ausdrückst. Finde deinen Look noch heute!“
            </p>
          </div>

          {/* Middle Section */}
          <div className="flex flex-col md:flex-row gap-10">
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-3 heading">Direktlinks</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/category/men" className="hover:underline">
                    Herren
                  </Link>
                </li>
                <li>
                  <Link href="/category/women" className="hover:underline">
                    Damen
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:underline">
                    Über uns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-3 heading">
                  Informationen
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {loading ? <Skeleton /> : <span>{footerInfo.email}</span>}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    {loading ? <Skeleton /> : <span>{footerInfo.phone}</span>}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {loading ? <Skeleton /> : <span>{footerInfo.address}</span>}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3 heading">Impressum</h3>
                <ul className="space-y-2">
                  <Link href="/impression" className="hover:underline">
                    Impressum
                  </Link>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="Shipping_Methods flex flex-col items-start md:items-start gap-10">
            {/* Shipping Methods */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h3 className="font-bold text-lg mb-3 heading">Versandarten</h3>
              <div className="flex flex-col-reverse justify-start gap-4">
                <Image src="/DHL-photo.png" alt="DPD" width={100} height={50} />
                <Image src="/DPD-Photo.png" alt="DHL" width={80} height={30} />
              </div>
            </div>
            <div className="flex flex-col items-start md:items-start gap-2">
              <h3 className="font-bold text-lg mb-2 heading">
                Allgemeine Geschäftsbedingungen
              </h3>
              <div className="flex flex-col-reverse justify-center md:justify-start gap-2">
                <Link href="/return-condition" className="hover:underline">
                  Rückgaberecht
                </Link>
              </div>
            </div>
            {/* Payment Methods */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <h3 className="font-bold text-lg mb-2 heaidng">
                Zahlungsmethoden
              </h3>
              <div className="flex flex-col-reverse justify-center md:justify-start gap-2">
                <Link
                  href="/payment-methods-details/paypal"
                  className="hover:underline"
                >
                  Paypal
                </Link>
                <Link
                  href="/payment-methods-details/via-bank"
                  className="hover:underline"
                >
                  Kreditkarte / Debitkarte
                </Link>
              </div>
            </div>

            {/* Invoice Methods */}
            <div className="flex flex-col items-start md:items-start gap-2">
              <h3 className="font-bold text-lg mb-2 heading">Rechnungsarten</h3>
              <div className="flex flex-col-reverse justify-center md:justify-start gap-2">
                <Link href="/invoice" className="hover:underline">
                  Rechnungskauf
                </Link>
              </div>
            </div>
          </div>

          {/* Cart Images */}
          <div className="hidden md:block">
            <Image
              src="/cart2.svg"
              alt="Cart"
              width={150}
              height={80}
              className="w-60 h-60 -z-50"
            />
          </div>

          <div className="absolute right-0 bottom-0 md:hidden pb-2">
            <Image
              src="/cart2.svg"
              alt="Cart"
              width={100}
              height={50}
              className="w-35 h-35 sm:w-45 sm:h-45 -z-50"
            />
          </div>
        </div>

        {
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="https://www.facebook.com/share/1DmBGBh3Wv/"
              className="p-2 border rounded-full bg-white"
              target="_blank"
            >
              <Facebook className="w-6 h-6 p-1 md:w-8 md:h-8 bg-red-500 rounded-full" />
            </a>
            <a
              href="https://www.instagram.com/daniels_believe?igsh=MW05M2JwOTR1MWoxaQ=="
              className="p-2 border rounded-full bg-white"
              target="_blank"
            >
              <Instagram className="w-6 h-6 p-1 md:w-8 md:h-8 bg-red-500 rounded-full" />
            </a>
            <a
              href="https://www.tiktok.com/@daniels_believe?_t=ZS-8yZe7VBgyKA&_r=1"
              className="p-2 border rounded-full bg-white"
              target="_blank"
            >
              <SiTiktok className="w-6 h-6 p-1 md:w-8 md:h-8 bg-red-500 rounded-full" />
            </a>
          </div>
        }
      </div>

      {/* Copyright */}
      <div className="text-center mt-10 text-sm">
        Urheberrecht © 2025. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
