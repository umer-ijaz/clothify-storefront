"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, KeyboardEvent } from "react";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}: PaginationProps) {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  // Sync input with currentPage prop
  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setInputPage(value);
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(inputPage);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        handlePageChange(page);
      } else {
        setInputPage(currentPage.toString());
      }
    }
  };

  const handleInputBlur = () => {
    setInputPage(currentPage.toString());
  };

  // Only show current page, next page (if exists), and last page with ellipsis
  const getVisiblePages = () => {
    const pages = [currentPage];

    // Add next page if exists and not last page
    if (currentPage < totalPages) {
      pages.push(currentPage + 1);
    }

    // Add last page if not already included
    if (!pages.includes(totalPages) && totalPages > 0) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Determine where to place ellipsis
  const shouldShowEllipsis = () => {
    return currentPage + 1 < totalPages - 1;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "h-9 w-9 rounded-md flex items-center justify-center border border-gray-200",
          "hover:bg-gray-50 transition-colors",
          currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Always show first page if not visible */}
      {currentPage > 1 && (
        <button
          onClick={() => handlePageChange(1)}
          className={cn(
            "h-9 w-9 rounded-md flex items-center justify-center border border-gray-200",
            "hover:bg-gray-50 transition-colors cursor-pointer",
            "text-sm font-medium"
          )}
        >
          1
        </button>
      )}

      {/* Show ellipsis if needed */}
      {currentPage > 2 && (
        <span className="h-9 w-9 flex items-center justify-center text-gray-400">
          ...
        </span>
      )}

      {/* Current and next pages */}
      {getVisiblePages().map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={cn(
            "h-9 w-9 rounded-md flex items-center justify-center text-sm font-medium",
            "border transition-colors",
            currentPage === page
              ? "border-red-500 bg-red-500 text-white"
              : "border-gray-200 hover:bg-gray-50 cursor-pointer"
          )}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {/* Show ellipsis before last page if needed */}
      {shouldShowEllipsis() && (
        <span className="h-9 w-9 flex items-center justify-center text-gray-400">
          ...
        </span>
      )}

      {/* Page input */}
      <div className="flex items-center gap-1 ml-2">
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-12 h-9 border border-gray-200 rounded-md text-center text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          aria-label="Page number"
        />
        <span className="text-sm text-gray-500">of {totalPages}</span>
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "h-9 w-9 rounded-md flex items-center justify-center border border-gray-200",
          "hover:bg-gray-50 transition-colors",
          currentPage >= totalPages
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
