"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { firestore } from "../../lib/firebaseConfig";
import AnnouncementPopup from "@/components/announcement-popup";
import { Bell } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: any;
}

const LOCAL_STORAGE_KEY = "announcementShown";

export default function AnnouncementPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLatestAnnouncement = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(firestore, "announcements"),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const announcementData = {
          id: doc.id,
          ...doc.data(),
        } as Announcement;

        setAnnouncement(announcementData);
        return announcementData;
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  // Automatically show announcement once on first load
  useEffect(() => {
    const alreadyShown = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!alreadyShown) {
      fetchLatestAnnouncement().then((announcementData) => {
        if (announcementData) {
          setShowPopup(true);
          localStorage.setItem(LOCAL_STORAGE_KEY, "true");
        }
      });
    }
  }, []);

  const handleAnnouncementClick = async () => {
    // Show popup when button is clicked
    if (!announcement) {
      const data = await fetchLatestAnnouncement();
      if (data) {
        setAnnouncement(data);
      }
    }
    setShowPopup(true);
  };

  return (
    <div className="">
      {/* Notification Button */}
      <div className="fixed bottom-8 left-6 z-[1000]">
        <button
          onClick={handleAnnouncementClick}
          disabled={loading}
          className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
        >
          {/* Notification Ping */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </div>

          {/* Bell Icon */}
          <Bell
            className={`h-6 w-6 ${
              loading ? "animate-spin" : "group-hover:animate-bounce"
            }`}
          />

          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Letzte Ankündigung
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Announcement Popup */}
      <AnnouncementPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        announcement={announcement}
        loading={loading}
      />
    </div>
  );
}
