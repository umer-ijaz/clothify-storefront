"use client";
import { SearchIcon, ArrowRight, Search } from "lucide-react";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { getProducts } from "@/lib/products";

// Mock data for suggestions
const popularSearches = [
  "Schuhe", // shoes
  "Kleider", // dresses
  "Jacken", // jackets
  "Jeans", // jeans
  "T-Shirts", // t-shirts
  "Sneaker", // sneakers
];

interface FilterProps {
  onFilterChange: (filters: { category: string; searchTerm: string }) => void;
  isLoading: boolean;
}

export default function FilterProducts({
  onFilterChange,
  isLoading,
}: FilterProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search term with useCallback for stable reference
  const debounceSearch = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 500); // 500ms debounce delay
  }, []);

  // Update debounced search term when searchTerm changes
  useEffect(() => {
    debounceSearch(searchTerm);
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, debounceSearch]);

  // Fetch suggestions when debounced search term changes
  useEffect(() => {
    async function fetchSuggestions() {
      if (debouncedSearchTerm) {
        try {
          const items = await getProducts();
          // Filter items where product.name includes debouncedValue (case-insensitive)
          const filteredNames = items
            .filter((product) =>
              product.name
                ?.toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase())
            )
            .map((product) => product.name)
            .filter((name, index, self) => name && self.indexOf(name) === index)
            .slice(0, 10);

          setSuggestions(
            filteredNames.length > 0
              ? filteredNames
              : mockSuggestions(debouncedSearchTerm)
          );
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions(mockSuggestions(debouncedSearchTerm));
        }
      } else {
        setSuggestions([]);
      }
    }

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Apply filters when category or debounced search changes
  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      searchTerm: debouncedSearchTerm,
    });
  }, [selectedCategory, debouncedSearchTerm, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setDebouncedSearchTerm(suggestion);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (searchTerm) {
      setIsOpen(true);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center pb-4 px-3">
      {["All", "Women", "Men", "Shuhe"].map((category) => (
        <button
          key={category}
          className={`px-4 py-2 text-sm font-medium rounded-full border cursor-pointer ${
            selectedCategory === category.toLowerCase()
              ? "bg-red-500 text-white"
              : "text-gray-700 hover:bg-orange-600 hover:text-white transition-all duration-300"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => setSelectedCategory(category.toLowerCase())}
          disabled={isLoading}
        >
          {category === "All"
            ? "Alle"
            : category === "Women"
            ? "Damen"
            : category === "Men"
            ? "Herren"
            : category === "Shoes"
            ? "Schuhe"
            : category}
        </button>
      ))}

      <div className="relative w-full sm:w-64" ref={searchRef}>
        <input
          type="text"
          placeholder="Nach Produkten suchen..."
          className="px-2 pr-8 py-2 text-sm search bg-white pl-8 focus:border-orange-500 focus:ring-red-500/20 rounded-full border border-gray-400"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 rounded-full bg-transparent text-red absolute right-0 top-0 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Suche</span>
        </Button>

        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SearchIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock suggestions fallback
const mockSuggestions = (query: string) => {
  if (!query) return [];

  return popularSearches
    .filter((item) => item.includes(query.toLowerCase()))
    .concat([
      `${query} casual`,
      `${query} formal`,
      `${query} summer`,
      `${query} winter`,
      `${query} sale`,
    ])
    .slice(0, 6);
};
