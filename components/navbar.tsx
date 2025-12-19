"use client";

import type React from "react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { useCartStore } from "@/context/addToCartContext";
import { useUser } from "@/context/userContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CartIcon from "@/public/cart-icon.svg";
import ProfileIcon from "@/public/profile.svg";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { AuthModal } from "./auth-modal";
import { fetchCategories, type Category } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import formatName from "@/lib/formatNames";

const popularSearches = [
  "Men's Shoes", // man shoes
  "Women's Clothing", // woman clothing
  "Clothes for Ladies", // clothes for ladies
];

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [debouncedValue, setDebouncedValue] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mobileExpandedCategories, setMobileExpandedCategories] = useState<
    Set<string>
  >(new Set());
  const searchRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.getCartCount());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { user, loading } = useUser();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Debounce input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  // Update suggestions when debounced value changes
  useEffect(() => {
    async function fetchSuggestions() {
      if (debouncedValue) {
        const items = await getProducts();

        const filteredNames = items
          .filter((product) =>
            product.name?.toLowerCase().includes(debouncedValue.toLowerCase())
          )
          .map((product) => product.name)
          .filter((name, index, self) => name && self.indexOf(name) === index)
          .slice(0, 10);

        setSuggestions(filteredNames);
      } else {
        setSuggestions([]);
      }
    }

    fetchSuggestions();
  }, [debouncedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setIsOpen(false);
    router.push(`/search?query=${encodeURIComponent(suggestion)}`);
    setInputValue("");
  };

  // Mobile category toggle
  const toggleMobileCategory = (categoryTitle: string) => {
    const newExpanded = new Set(mobileExpandedCategories);
    if (newExpanded.has(categoryTitle)) {
      newExpanded.delete(categoryTitle);
    } else {
      newExpanded.add(categoryTitle);
    }
    setMobileExpandedCategories(newExpanded);
  };

  // Desktop hover handlers
  const handleCategoryHover = (categoryTitle: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(categoryTitle);
  };

  const handleCategoryLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  const handleSubcategoryHover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\p{L}\p{N} \t-]/gu, "");
  };

  const handleSubcategoryClick = (
    categoryTitle: string,
    subcategory: string | any
  ) => {
    const categorySlug = createSlug(categoryTitle);
    const subcategorySlug = createSlug(
      typeof subcategory === "string"
        ? subcategory
        : subcategory.title || subcategory
    );

    router.push(`/productCategory/${categorySlug}/${subcategorySlug}`);
    setHoveredCategory(null);
  };

  const handleCategoryNavigation = (
    categoryTitle: string,
    categoryHref?: string
  ) => {
    if (categoryHref) {
      router.push(categoryHref);
    } else {
      const categorySlug = createSlug(categoryTitle);
      router.push(`/category/${categorySlug}`);
    }
    setHoveredCategory(null);
  };

  const mainNavItems = [
    {
      title: "Home",
      href: "/",
      description: "Discover our latest collections and offers.",
    },
    {
      title: "Shop",
      href: "/products",
      children: categories,
    },
    {
      title: "Services",
      href: "/services",
      description:
        "Learn more about our customer service and repair services.",
    },
    {
      title: "About Us",
      href: "/about",
      description:
        "Learn more about our history, mission, and values.",
    },
    {
      title: "Contact",
      href: "/contact",
      description: "Contact us for inquiries, support, or feedback.",
    },
  ];

  useEffect(() => {
    if (cartCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user?.email
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?query=${encodeURIComponent(inputValue.trim())}`);
      setInputValue("");
      setIsOpen(false);
      setIsSearchOpen(false);
    }
  };

  return (
    <section
      className={cn(
        "flex items-center py-4 gap-3 md:gap-3 w-full px-4 md:px-6 lg:px-8 transition-all duration-300 bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] sticky top-0 left-0 right-0 z-50 h-auto",
        !isNavbarVisible ? "-translate-y-full" : "translate-y-0"
      )}
    >
      {/* Mobile Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white p-2"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="bg-white w-[90vw] sm:w-[350px] p-0"
        >
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto scrollbar-hide">
            <nav className="py-2">
              {/* Mobile Logo */}
              <div className="px-4 mb-4">
                <Link
                  href="/"
                  className="flex justify-center"
                  aria-label="Home"
                >
                  <div className="h-[60px] w-[60px] relative">
                    <Image
                      src="/logo.webp?height=150&width=150"
                      alt="logo"
                      fill
                      className="cursor-pointer object-contain"
                      loading="lazy"
                    />
                  </div>
                </Link>
              </div>

              {/* Mobile Navigation Items */}
              {mainNavItems.map((item) => {
                if (item.title === "Shop" && item.children) {
                  return (
                    <div key={`mobile-${item.title}`} className="border-b">
                      <div
                        className="subheading flex items-center justify-between px-4 py-3 text-base font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleMobileCategory(item.title)}
                      >
                        <span>{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            mobileExpandedCategories.has(item.title)
                              ? "rotate-180"
                              : ""
                          )}
                        />
                      </div>

                      {/* Mobile Categories Dropdown */}
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 scrollbar-hide",
                          mobileExpandedCategories.has(item.title)
                            ? "max-h-[70vh] opacity-100"
                            : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="bg-gray-50 max-h-[60vh] overflow-y-auto scrollbar-hide subheading">
                          {item.children.map((category) => (
                            <div
                              key={`mobile-category-${category.id || category.title
                                }`}
                              className="border-b border-gray-200 last:border-b-0"
                            >
                              {/* Category Header */}
                              <div className="flex items-center">
                                <SheetClose asChild>
                                  <button
                                    onClick={() =>
                                      handleCategoryNavigation(
                                        category.title,
                                        category.href
                                      )
                                    }
                                    aria-label="Category"
                                    className="flex-1 text-left px-4 py-2.5 text-sm font-medium hover:bg-white transition-colors"
                                  >
                                    {category.title === "Women"
                                      ? "Women"
                                      : category.title === "Men"
                                        ? "Men"
                                        : category.title}
                                  </button>
                                </SheetClose>
                                {category.subcategories &&
                                  category.subcategories.length > 0 && (
                                    <button
                                      onClick={() =>
                                        toggleMobileCategory(category.title)
                                      }
                                      aria-label="Mobile Cateogory"
                                      className="p-2 hover:bg-white transition-colors"
                                    >
                                      <ChevronDown
                                        className={cn(
                                          "h-4 w-4 transition-transform duration-200",
                                          mobileExpandedCategories.has(
                                            category.title
                                          )
                                            ? "rotate-180"
                                            : ""
                                        )}
                                      />
                                    </button>
                                  )}
                              </div>

                              {/* Mobile Subcategories */}
                              {category.subcategories &&
                                category.subcategories.length > 0 && (
                                  <div
                                    className={cn(
                                      "overflow-hidden transition-all duration-200 scrollbar-hide",
                                      mobileExpandedCategories.has(
                                        category.title
                                      )
                                        ? "max-h-[50vh] opacity-100"
                                        : "max-h-0 opacity-0"
                                    )}
                                  >
                                    <div className="bg-white max-h-[40vh] overflow-y-auto scrollbar-hide subcategory">
                                      {category.subcategories.map(
                                        (subcategory, subIndex) => (
                                          <SheetClose
                                            asChild
                                            key={`mobile-subcategory-${category.id}-${subIndex}`}
                                          >
                                            <button
                                              onClick={() =>
                                                handleSubcategoryClick(
                                                  category.title,
                                                  subcategory
                                                )
                                              }
                                              aria-label="SubCategory"
                                              className="block w-full text-left px-6 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-600 transition-colors border-l-2 border-transparent hover:border-red-300"
                                            >
                                              {subcategory.title}
                                            </button>
                                          </SheetClose>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <SheetClose asChild key={`mobile-nav-${item.title}`}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-4 py-3 text-base font-medium transition-colors hover:bg-gray-50 border-b",
                        pathname === item.href
                          ? "text-red-600 bg-red-50"
                          : "text-gray-700"
                      )}
                      aria-label="Items"
                    >
                      {item.title}
                    </Link>
                  </SheetClose>
                );
              })}

              {/* Mobile Login Button */}
              <div className="px-4 pt-4 pb-6">
                {!loading && (
                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] border-none hover:opacity-90 text-white"
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Click"
                  >
                    {user ? "My Account" : "Sign In"}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo - Hidden on mobile when search is open */}
      <Link
        href="/"
        className={cn(
          "hidden md:block",
          isSearchOpen ? "hidden" : "block md:h-[70px] md:w-[70px]"
        )}
        aria-label="Home"
      >
        <div className="h-[50px] w-[50px] md:h-[70px] md:w-[70px] relative">
          <Image
            src="/logo.webp?height=110&width=110"
            alt="logo"
            fill
            className="cursor-pointer object-contain"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-0 lg:gap-1 heading">
        <NavigationMenu>
          <NavigationMenuList>
            {mainNavItems.map((item) =>
              item.children ? (
                <NavigationMenuItem key={`desktop-${item.title}`}>
                  <NavigationMenuTrigger className="text-white hover:bg-white/20 hover:text-white transition-colors duration-300 heading-luxury">
                    {formatName(item.title)}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white shadow-2xl border-0">
                    <div className="w-[90vw] lg:w-[1000px] min-h-[400px] md:min-h-[500px] flex flex-col lg:flex-row">
                      {/* Categories Sidebar */}
                      <div className="w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
                        <div className="p-4 lg:p-6">
                          <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-gray-800 border-b border-gray-300 pb-2">
                            Categories
                          </h3>
                          <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                            <ul className="space-y-1">
                              {item.children.map((category) => (
                                <li
                                  key={`desktop-category-${category.id || category.title
                                    }`}
                                  onMouseEnter={() =>
                                    handleCategoryHover(category.title)
                                  }
                                  onMouseLeave={handleCategoryLeave}
                                >
                                  <div
                                    className={cn(
                                      "group relative flex items-center justify-between p-2 lg:p-3 rounded-lg transition-all duration-200 cursor-pointer",
                                      hoveredCategory === category.title
                                        ? "bg-gradient-to-r from-red-500/15 to-orange-500/15 shadow-sm"
                                        : "hover:bg-white hover:shadow-sm"
                                    )}
                                    onClick={() =>
                                      handleCategoryNavigation(
                                        category.title,
                                        category.href
                                      )
                                    }
                                  >
                                    <div className="flex-1">
                                      <div className="font-semibold text-sm lg:text-base text-gray-800 group-hover:text-red-600 transition-colors">
                                        {category.title === "Women"
                                          ? "Women"
                                          : category.title === "Men"
                                            ? "Men"
                                            : category.title}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                        {category.description ||
                                          "Browse all products"}
                                      </p>
                                    </div>
                                    {category.subcategories &&
                                      category.subcategories.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                            {category.subcategories.length}
                                          </span>
                                          <ArrowRight
                                            className={cn(
                                              "h-3 w-3 lg:h-4 lg:w-4 text-gray-400 transition-all duration-200",
                                              hoveredCategory === category.title
                                                ? "text-red-500 translate-x-1"
                                                : ""
                                            )}
                                          />
                                        </div>
                                      )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Subcategories Panel */}
                      <div
                        className="flex-1 bg-white"
                        onMouseEnter={handleSubcategoryHover}
                        onMouseLeave={handleCategoryLeave}
                      >
                        <div className="p-4 lg:p-6">
                          {hoveredCategory ? (
                            <>
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 lg:mb-4 border-b border-gray-200 pb-2 lg:pb-3">
                                <h3 className="text-lg lg:text-xl font-bold text-gray-800">
                                  {hoveredCategory}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1 lg:mt-0">
                                  <span className="text-xs lg:text-sm text-gray-500 bg-gray-100 px-2 lg:px-3 py-1 rounded-full">
                                    {item.children.find(
                                      (cat) => cat.title === hoveredCategory
                                    )?.subcategories?.length || 0}{" "}
                                    subcategories
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleCategoryNavigation(hoveredCategory)
                                    }
                                    aria-label="All Category"
                                    className="text-red-600 border-red-200 hover:bg-red-50 text-xs lg:text-sm"
                                  >
                                    Show All
                                  </Button>
                                </div>
                              </div>
                              <div className="max-h-[300px] lg:max-h-[380px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                                  {item.children
                                    .find(
                                      (cat) => cat.title === hoveredCategory
                                    )
                                    ?.subcategories?.map(
                                      (subcategory, subIndex) => (
                                        <button
                                          key={`desktop-subcategory-${hoveredCategory}-${subIndex}`}
                                          onClick={() =>
                                            handleSubcategoryClick(
                                              hoveredCategory,
                                              subcategory
                                            )
                                          }
                                          aria-label="SubCategory"
                                          className="group p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-red-50 hover:to-orange-50"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <div className="font-medium text-sm lg:text-base text-gray-800 group-hover:text-red-600 transition-colors">
                                                {subcategory.title}
                                              </div>
                                              <div className="text-xs text-gray-500 mt-1">
                                                Discover{" "}
                                                {subcategory.title.toLowerCase()}
                                              </div>
                                            </div>
                                            <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-red-500 transition-all duration-200 transform group-hover:translate-x-1" />
                                          </div>
                                        </button>
                                      )
                                    ) || (
                                      <div className="col-span-2 text-center py-6">
                                        <div className="text-gray-400 mb-2">
                                          <Search className="h-10 w-10 mx-auto" />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                          No subcategories available for{" "}
                                          {hoveredCategory}
                                        </p>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6">
                              <div className="mb-4 lg:mb-6">
                                <div className="relative">
                                  <div className="h-16 w-16 lg:h-24 lg:w-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mx-auto mb-3 lg:mb-4 flex items-center justify-center">
                                    <ArrowRight className="h-6 w-6 lg:h-8 lg:w-8 text-red-400" />
                                  </div>
                                </div>
                              </div>
                              <h4 className="text-base lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">
                                Discover our categories
                              </h4>
                              <p className="text-xs lg:text-sm text-gray-500 max-w-xs lg:max-w-sm">
                                Hover over a category on the left to discover its subcategories.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={`desktop-nav-${item.title}`}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-white hover:bg-white/20 hover:text-white transition-colors duration-300 heading-luxury"
                      )}
                      aria-label="Items"
                    >
                      {formatName(item.title)}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {!loading &&
          (!user ? (
            <button onClick={() => setIsModalOpen(true)} aria-label="Search">
              <div className="heading-luxury text-sm font-medium leading-none text-white hover:bg-white/20 hover:text-white transition-colors duration-300 block select-none space-y-1 rounded-md p-3 no-underline outline-none hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10 focus:bg-accent focus:text-accent-foreground">
                Sign In
              </div>
            </button>
          ) : null)}
      </div>

      {/* Search Bar - Responsive */}
      <div
        className={cn(
          "flex-1 transition-all",
          isSearchOpen ? "flex ml-2" : "hidden md:flex"
        )}
      >
        <form
          className="w-full"
          onSubmit={handleSearchSubmit}
          aria-label="Search Form"
        >
          <div className="relative max-w-[600px]" ref={searchRef}>
            <div className="flex items-center rounded-full">
              <Input
                type="search"
                placeholder="Search for products..."
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className="search bg-white pl-4 md:pl-8 focus:border-orange-500 focus:ring-red-500/20 rounded-full border border-gray-400 text-sm"
              />
              <div className="flex items-center pr-1">
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Submit"
                  className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-transparent text-red absolute right-1 cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
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
                          aria-label="Select Suggestion"
                        >
                          <div className="flex gap-2 items-center">
                            <div>
                              <Search className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                            </div>
                            <span className="overflow-hidden text-ellipsis line-clamp-1 text-sm md:text-base">
                              {suggestion}
                            </span>
                          </div>
                          <div>
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                          </div>
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
                            aria-label="search"
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
      </div>

      {/* User and Cart Icons */}
      <div className="flex items-center gap-2">
        {!loading &&
          (user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="bg-white p-1 md:p-1.5 rounded-full cursor-pointer">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8">
                    {user.photoURL ? (
                      <AvatarImage
                        src={user.photoURL || "/placeholder.svg"}
                        alt={user.displayName || "User"}
                      />
                    ) : null}
                    <AvatarFallback className="bg-red-500 text-white text-xs md:text-sm font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 md:w-56 bg-white"
              >
                <DropdownMenuLabel className="subheading">
                  Mein Konto
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/orders"
                    className="cursor-pointer text-sm md:text-base subheading"
                    aria-label="Orders"
                  >
                    Bestellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 cursor-pointer text-sm md:text-base subheading"
                >
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white p-1 md:p-2 rounded-full"
              aria-label="Profile"
            >
              <ProfileIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          ))}

        <Link href="/cart" aria-label="cart">
          <div className="relative bg-white p-1 md:p-2 rounded-full">
            <CartIcon className="h-5 w-5 md:h-6 md:w-6" />
            {isClient && cartCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-red-600 text-white text-[10px] md:text-xs px-1.5 md:px-2 rounded-full
            transform transition-all duration-300
            ${animate ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
                  }`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
        </Link>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
