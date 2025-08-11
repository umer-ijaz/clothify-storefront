"use client";

import { UserProvider } from "@/context/userContext";
import ClearCategoriesClient from "@/components/clearCategory";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";

const MobileSearch = dynamic(() => import("../app/mobilesearch/page"), {
  ssr: false,
});
const AnnouncementPage = dynamic(() => import("../app/pop-up/page"), {
  ssr: false,
});

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ClearCategoriesClient />
      <MobileSearch />
      <AnnouncementPage />
      {children}
      <div>
        <a
          href="https://wa.me/923324257764"
          target="_blank"
          className="whatsapp-float"
        >
          <img
            src="https://img.icons8.com/color/24/000000/whatsapp--v1.png"
            alt="WhatsApp"
            width={20}
            height={20}
          />
          <span className="body">Chatten Sie mit uns</span>
        </a>
      </div>
      <Toaster />
    </UserProvider>
  );
}
