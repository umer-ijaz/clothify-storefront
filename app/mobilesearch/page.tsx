"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/products"; // <-- your API util

export default function MobileSearch() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const [popularSearches] = useState<string[]>([
    "Herrenschuhe",
    "Damenbekleidung",
    "Kleidung für Damen",
  ]);

  const searchRef = useRef<HTMLDivElement | null>(null);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch & filter suggestions
  useEffect(() => {
    async function fetchSuggestions() {
      if (debouncedValue) {
        try {
          const items = await getProducts();
          const filteredNames = items
            .filter((product) =>
              product.name?.toLowerCase().includes(debouncedValue.toLowerCase())
            )
            .map((product) => product.name)
            .filter((name, index, self) => name && self.indexOf(name) === index)
            .slice(0, 10);

          setSuggestions(filteredNames);
        } catch (err) {
          console.error("Error fetching products:", err);
        }
      } else {
        setSuggestions([]);
      }
    }

    fetchSuggestions();
  }, [debouncedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(!!e.target.value);
  };

  const handleInputFocus = () => setIsOpen(true);

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?query=${encodeURIComponent(suggestion)}`);
    setInputValue("");
    setIsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?query=${encodeURIComponent(inputValue.trim())}`);
      setInputValue("");
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="block md:hidden py-4 px-4 bg-white shadow-sm">
      <form className="w-full" onSubmit={handleSearchSubmit}>
        <div className="relative w-full" ref={searchRef}>
          <div className="flex items-center rounded-full">
            <Input
              type="search"
              placeholder="Nach Produkten suchen..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="search bg-white pl-4 md:pl-8 focus:border-orange-500 focus:ring-red-500/20 rounded-full border border-gray-400 text-sm md:text-base"
            />
            <div className="flex items-center pr-1">
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-transparent text-red absolute right-1 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Suche</span>
              </Button>
            </div>
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {inputValue ? (
                <div className="max-h-[50vh] overflow-y-auto scrollbar-hide">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion-${index}`}
                        className="flex items-center justify-between w-full px-3 py-2 md:px-4 md:py-3 text-left hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex gap-2 items-center">
                          <Search className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                          <span className="overflow-hidden text-ellipsis line-clamp-1 text-sm md:text-base">
                            {suggestion}
                          </span>
                        </div>
                        <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Keine Ergebnisse gefunden
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                  <div className="max-h-[40vh] overflow-y-auto scrollbar-hide">
                    <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">
                      Beliebte Suchanfragen
                    </h3>
                    <div className="space-y-2">
                      {popularSearches.map((search, index) => (
                        <button
                          key={`popular-${index}`}
                          className="block w-full text-left hover:text-gray-600 cursor-pointer text-sm md:text-base"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
