"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  getDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";
import Button from "../button";

// Define item types
type ItemType = "product" | "flashSaleItem";

interface ProductReviewModalProps {
  product: {
    id: string;
    name: string;
    image: string;
  };
  itemType?: ItemType; // Explicitly specify the item type
  onAddReview?: (review: {
    name: string;
    rating: number;
    comment: string;
  }) => void;
}

interface Review {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

export default function ProductReviewModal({
  product,
  itemType = "product", // Default to product if not specified
  onAddReview,
}: ProductReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    rating?: string;
    comment?: string;
  }>({});

  // State for fetched reviews data
  const [productRating, setProductRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch reviews when modal opens
  useEffect(() => {
    if (open) {
      fetchReviews();
    }
  }, [open]);

  // Function to fetch reviews and calculate rating
  const fetchReviews = async () => {
    if (!product.id) return;

    setIsLoading(true);
    try {
      // First determine which collection the item belongs to
      let collectionName = "";
      let itemExists = false;

      // Check if item exists in products collection
      const productDoc = await getDoc(doc(firestore, "v_products", product.id));
      if (productDoc.exists()) {
        collectionName = "v_products";
        itemExists = true;
      } else {
        // Check if item exists in flashSaleItems collection
        const flashSaleDoc = await getDoc(
          doc(firestore, "v_flashSaleItems", product.id)
        );
        if (flashSaleDoc.exists()) {
          collectionName = "v_flashSaleItems";
          itemExists = true;
        }
      }

      if (!itemExists) {
        setIsLoading(false);
        return;
      }

      // Get the current rating and reviewsCount from the item document
      const itemDoc =
        collectionName === "v_products"
          ? productDoc
          : await getDoc(doc(firestore, "v_flashSaleItems", product.id));

      const itemData = itemDoc.data();
      if (itemData && itemData.rating !== undefined) {
        setProductRating(itemData.rating);
      }
      if (itemData && itemData.reviewsCount !== undefined) {
        setReviewsCount(itemData.reviewsCount);
      }

      // Fetch all reviews
      const reviewsCollectionRef = collection(
        firestore,
        `${collectionName}/${product.id}/reviews`
      );

      const reviewsSnapshot = await getDocs(reviewsCollectionRef);
      const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      setReviews(fetchedReviews);

      // If rating or reviewsCount wasn't in the document, calculate them from reviews
      if (
        itemData?.rating === undefined ||
        itemData?.reviewsCount === undefined
      ) {
        setReviewsCount(fetchedReviews.length);

        if (fetchedReviews.length > 0) {
          const totalRating = fetchedReviews.reduce(
            (sum, review) => sum + (review.rating || 0),
            0
          );
          const avgRating = totalRating / fetchedReviews.length;
          setProductRating(avgRating);
        } else {
          setProductRating(0);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate star distribution based on fetched rating
  const fullStars = Math.floor(productRating);
  const hasHalfStar = productRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const submitReview = async (review: {
    name: string;
    rating: number;
    comment: string;
  }) => {
    setIsSubmitting(true);
    setSubmitError("");

    if (!product || !product.id) {
      setSubmitError(
        "Produktinformationen fehlen. Bewertung konnte nicht gesendet werden."
      );
      setIsSubmitting(false);
      return false;
    }

    const isFlashSale = product.id.startsWith("sale");
    const collectionName = isFlashSale ? "v_flashSaleItems" : "v_products";
    const docRef = doc(firestore, collectionName, product.id);

    try {
      // Check if the item exists
      const itemDoc = await getDoc(docRef);
      if (!itemDoc.exists()) {
        throw new Error(
          `Produkt nicht gefunden in Sammlung: ${collectionName}`
        );
      }

      // Add review to subcollection
      const reviewData: Omit<Review, "id"> = {
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: serverTimestamp() as Timestamp,
      };

      const reviewsCollectionRef = collection(
        firestore,
        `${collectionName}/${product.id}/reviews`
      );

      await addDoc(reviewsCollectionRef, reviewData);

      // Recalculate average rating for local state only (don't update Firestore)
      const reviewsSnapshot = await getDocs(reviewsCollectionRef);
      const updatedReviews = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      const totalRating = updatedReviews.reduce(
        (sum, r) => sum + (r.rating || 0),
        0
      );
      const newAverageRating =
        updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;
      const newReviewsCount = updatedReviews.length;

      // Only update local state, not Firestore
      setReviews(updatedReviews);
      setProductRating(newAverageRating);
      setReviewsCount(newReviewsCount);

      if (onAddReview) {
        onAddReview(review);
      }

      return true;
    } catch (error: any) {
      console.error("[Review Submit] Fehler:", error);
      setSubmitError(
        error.message ||
          "Bewertung konnte nicht gesendet werden. Bitte erneut versuchen."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; rating?: string; comment?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (rating === 0) newErrors.rating = "Please select a rating";
    if (!comment.trim()) newErrors.comment = "Review comment is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await submitReview({ name, rating, comment });

    if (success) {
      setName("");
      setComment("");
      setRating(0);
      setErrors({});
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button text={"Bewertung schreiben"} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Bewertung schreiben</DialogTitle>
          <DialogDescription>
            Teilen Sie Ihre Meinung über {product.name} mit anderen Kunden.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-sm text-gray-600">
              Bewertungen werden geladen...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-400">
                <Image
                  src={product.image || "/platzhalter.svg?height=64&width=64"}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="flex">
                    {Array.from({ length: fullStars }).map((_, i) => (
                      <Star
                        key={`full-${i}`}
                        className="h-5 w-5 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                    {hasHalfStar && (
                      <Star
                        key="half"
                        className="h-5 w-5 text-yellow-500 fill-yellow-500 opacity-50"
                      />
                    )}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                      <Star
                        key={`empty-${i}`}
                        className="h-5 w-5 text-gray-300 fill-gray-300"
                      />
                    ))}
                  </div>
                  <span>({reviewsCount} Bewertungen)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">
                Ihre Bewertung <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      i < (hoveredRating || rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 fill-gray-300"
                    }`}
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoveredRating(i + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                  />
                ))}
              </div>
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Ihr Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ihr Name"
                className="search bg-white pl-3 focus:border-orange-500 focus:ring-red-500/20 rounded-sm border border-gray-400"
              />
              {errors.name && (
                <p className="text-sm text-red-500">Name ist erforderlich</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">
                Ihre Bewertung <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Teilen Sie Ihre Erfahrungen mit diesem Produkt"
                rows={4}
                className="search bg-white pl-3 focus:border-orange-500 focus:ring-red-500/20 rounded-sm border border-gray-400"
              />
              {errors.comment && (
                <p className="text-sm text-red-500">
                  Bewertungstext ist erforderlich
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-500 font-medium">{submitError}</p>
            )}

            <DialogFooter className="flex flex-row justify-end items-center gap-2">
              <Button text={"Abbrechen"} onClick={() => setOpen(false)} />
              <Button
                text={
                  isSubmitting ? "Wird übermittelt..." : "Bewertung absenden"
                }
                type="submit"
              />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
