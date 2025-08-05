import { X } from "lucide-react";
import { useEffect } from "react";

interface Announcement {
  title: string;
  message: string;
  createdAt: any; // Firestore Timestamp or Date
}

interface Props {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  loading: boolean;
}

export default function AnnouncementPopup({
  isOpen,
  announcement,
  onClose,
  loading,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        onClose(); // Auto-close after 6 seconds
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !announcement || loading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm bg-opacity-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-center text-red-600 mb-2">
          {announcement.title}
        </h3>

        <p className="text-gray-700 text-center whitespace-pre-line mb-4">
          {announcement.message}
        </p>

        {announcement.createdAt?.toDate && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Gepostet am:{" "}
            {new Date(announcement.createdAt.toDate()).toLocaleDateString(
              "de-DE",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
