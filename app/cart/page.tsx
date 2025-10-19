"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/context/addToCartContext";
import Image from "next/image";
import HomeLink from "@/components/home-link";
import TextField from "@/components/text-field";
import Button from "@/components/button";
import { useTaxStore } from "@/context/taxContext";
import formatName from "@/lib/formatNames";
import { resizeImageUrl } from "@/lib/imagesizeadjutment";

export default function CartClient() {
  const { cart, removeFromCart, updateQuantity, toggleChecked } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  const { taxRate, setTaxRate } = useTaxStore();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const totalPrice = cart.reduce(
    (acc, item) =>
      item.isChecked ? acc + Number(item.price) * item.quantity : acc,
    0
  );

  // Check if at least one item is selected
  const hasSelectedItems = cart.some((item) => item.isChecked);

  function updateAll() {
    cart.forEach((item) => {
      toggleChecked(item.id, item.isFlashSale, true);
    });
  }

  // Handle payment button click
  const handlePaymentClick = (e: React.MouseEvent) => {
    if (!hasSelectedItems) {
      e.preventDefault();
      alert("Bitte wählen Sie mindestens einen Artikel aus, um fortzufahren.");
      return;
    }
  };

  return (
    <>
      <div className="w-full pt-0 pb-20">
        <h1 className="py-8 mx-4 sm:mx-6 md:mx-8 lg:mx-12 flex gap-1 md:gap-2 text-md md:text-xl font-small mb-4 capitalize">
          <HomeLink />
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-red-500 subheading">Warenkorb</span>
        </h1>

        <TextField text={"Warenkorb"} />
        <div className="mx-2 sm:mx-4 md:mx-8 lg:mx-12 py-12 px-2 sm:px-4 md:px-8 lg:px-12 rounded-xl bg-white shadow-lg">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-xl font-semibold mb-1 heading">
                Einkaufswagen
              </h1>
              <p className="text-gray-600 text-md mb-6 body">
                Sie haben {cart.length} Artikel in Ihrem Warenkorb.
              </p>
            </div>
            <Button text="Alle markieren" onClick={updateAll} />
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4 heading">
                Ihr Warenkorb ist leer.
              </p>
              <Link
                href="/"
                className="body inline-block items-center gap-2 px-4 md:px-5 py-2 md:py-3 
    bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] bg-[length:200%_200%] bg-left
    text-md md:text-md text-white font-semibold shadow-lg 
    transition-all duration-500 ease-out transform hover:shadow-xl cursor-pointer text-center
    hover:bg-right hover:from-[#EB1E24] hover:via-[#F05021] hover:to-[#ff3604] active:bg-right hover:from-[#EB1E24] hover:via-[#F05021] hover:to-[#ff3604] text-white px-6 py-2 text-sm font-medium hover:bg-[#EB1E24] active:bg-[#EB1E24] transition-all rounded-full"
              >
                Weiter einkaufen
              </Link>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 justify-between w-full">
              <div className="flex-1">
                {/* Desktop View Header - Hidden on Mobile */}
                <div className="mb-4 hidden md:grid grid-cols-4 font-semibold text-xl">
                  <div className="col-span-1 subheading">Produkt</div>
                  <div className="text-center col-span-1 subheading">Preis</div>
                  <div className="text-center col-span-1 subheading">Menge</div>
                </div>

                {/* Mobile View Header */}
                <div className="mb-4 md:hidden font-semibold text-xl">
                  <div>Artikel</div>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="border-b pb-4">
                      {/* Desktop View - Hidden on Mobile */}
                      <div className="hidden md:grid grid-cols-4 items-center">
                        <div className="col-span-1 flex items-center gap-3 justify-center">
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            onChange={(e) =>
                              toggleChecked(
                                item.id,
                                item.isFlashSale,
                                e.target.checked
                              )
                            }
                            className={`mr-2 ${
                              item.isChecked
                                ? "accent-red-500"
                                : "accent-gray-200"
                            }`}
                          />

                          <div className="w-18 h-18 relative">
                            <Image
                              src={
                                item.image
                                  ? resizeImageUrl(item.image, "200x200")
                                  : item.image ||
                                    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-17%20143442-97O1rCbUW4ps5N28iXf3OiBRIGrib7.png" ||
                                    "/placeholder.svg"
                              }
                              alt={item.name}
                              width={60}
                              height={60}
                              className="object-contain rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = item.image;
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {formatName(item.name)}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {item.color && `Color: ${item.color}`}
                              {item.size && ` | Size: ${item.size}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-center text-gray-500">
                          €{item.price.toFixed(2)}
                        </div>

                        <div className="flex items-center justify-center gap-20">
                          <div className="flex items-center">
                            <span className="mx-2 w-6 text-center text-gray-500">
                              {item.quantity}
                            </span>
                            <div className="flex flex-col justify-center items-center gap-0">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.isFlashSale,
                                    item.quantity + 1
                                  )
                                }
                                className="w-5 h-5 flex items-center justify-center rounded-full"
                              >
                                <span className="sr-only">Increase</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="gray"
                                  className="hover:text-gray-700"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.isFlashSale,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="w-5 h-5 flex items-center justify-center rounded-full"
                              >
                                <span className="sr-only">Decrease</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="gray"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              removeFromCart(item.id, item.isFlashSale)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500"
                            aria-label="Remove item"
                          >
                            <Image
                              src={"/bin.svg"}
                              width={100}
                              height={100}
                              alt={"Bin"}
                              className="w-5 h-5"
                            />
                          </button>
                        </div>
                      </div>

                      {/* Mobile View - Vertical Layout */}
                      <div className="md:hidden w-full">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.isChecked}
                              onChange={(e) =>
                                toggleChecked(
                                  item.id,
                                  item.isFlashSale,
                                  e.target.checked
                                )
                              }
                              className={`mr-2 ${
                                item.isChecked
                                  ? "accent-red-500"
                                  : "accent-gray-200"
                              }`}
                            />

                            <div className="w-[50px] h-[50px] relative flex-shrink-0">
                              <Image
                                src={
                                  item.image
                                    ? resizeImageUrl(item.image, "200x200")
                                    : item.image ||
                                      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-17%20143442-97O1rCbUW4ps5N28iXf3OiBRIGrib7.png" ||
                                      "/placeholder.svg"
                                }
                                alt={item.name}
                                fill
                                className="object-contain rounded-md"
                                onError={(e) => {
                                  e.currentTarget.src = item.image; // fallback to original
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="font-small">
                                {formatName(item.name)}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {item.color && `Color: ${item.color}`}
                                {item.size && ` | Size: ${item.size}`}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                €{item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              removeFromCart(item.id, item.isFlashSale)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500"
                            aria-label="Remove item"
                          >
                            <Image
                              src={"/bin.svg"}
                              width={100}
                              height={100}
                              alt={"Bin"}
                              className="w-5 h-5"
                            />
                          </button>
                        </div>

                        <div className="flex justify-end items-center">
                          <div className="flex items-center">
                            <span className="mx-2 w-6 text-center text-gray-500">
                              {item.quantity}
                            </span>
                            <div className="flex flex-col justify-center items-center gap-0">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.isFlashSale,
                                    item.quantity + 1
                                  )
                                }
                                className="w-5 h-5 flex items-center justify-center rounded-full"
                              >
                                <span className="sr-only">Increase</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="gray"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.isFlashSale,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="w-5 h-5 flex items-center justify-center rounded-full"
                              >
                                <span className="sr-only">Decrease</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="gray"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-80">
                <div className="border rounded-xl p-4">
                  <h2 className="text-center font-semibold mb-4 heading">
                    Gesamtsumme
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Zwischensumme</span>
                      <span className="font-medium">
                        €{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Steuer</span>
                      <span className="font-medium">
                        €{(totalPrice * (taxRate / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Steuerprozentsatz</span>
                      <span className="font-medium">{taxRate}%</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Gesamt</span>
                        <span>
                          €
                          {(totalPrice + totalPrice * (taxRate / 100)).toFixed(
                            2
                          )}
                        </span>
                      </div>
                      {!hasSelectedItems && cart.length > 0 && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Wählen Sie Artikel aus, um den Gesamtbetrag zu sehen
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      {!hasSelectedItems && cart.length > 0 && (
                        <p className="text-sm text-red-500 text-center">
                          Bitte wählen Sie mindestens einen Artikel aus.
                        </p>
                      )}
                      <Link
                        href="/payments"
                        className={`flex justify-center w-full ${
                          !hasSelectedItems ? "pointer-events-none" : ""
                        }`}
                        onClick={handlePaymentClick}
                      >
                        <Button
                          text="Zur Bezahlung fortfahren"
                          disabled={!hasSelectedItems}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
