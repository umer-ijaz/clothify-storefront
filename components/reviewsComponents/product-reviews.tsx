"use client";

import { Star, ThumbsUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: Date | any; // Optional since existing reviews might not have this field
  // Add any other fields from Firestore
}

interface Product {
  id: string;
  name: string;
  // Other product properties not used in this component
  [key: string]: any;
}

interface ProductReviewsProps {
  product: Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productRating, setProductRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initial number of reviews to show
  const initialReviewCount = 2;

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

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

      // Get reviews from the product document's reviews array
      const fetchedReviews = itemData?.reviews || [];
      setReviews(fetchedReviews);

      // If rating or reviewsCount wasn't in the document, calculate and update them
      if (
        itemData?.rating === undefined ||
        itemData?.reviewsCount === undefined
      ) {
        const totalRating = fetchedReviews.reduce(
          (sum: number, review: any) => sum + (review.rating || 0),
          0
        );
        const newAvgRating =
          fetchedReviews.length > 0 ? totalRating / fetchedReviews.length : 0;

        setProductRating(newAvgRating);
        setReviewsCount(fetchedReviews.length);

        // Update the product document in Firestore with calculated values
        const docRef = doc(firestore, collectionName, product.id);
        await updateDoc(docRef, {
          rating: newAvgRating,
          reviewsCount: fetchedReviews.length,
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate rating distribution
  const calculateRatingDistribution = () => {
    const distribution = [
      { stars: 5, percentage: 0, count: 0 },
      { stars: 4, percentage: 0, count: 0 },
      { stars: 3, percentage: 0, count: 0 },
      { stars: 2, percentage: 0, count: 0 },
      { stars: 1, percentage: 0, count: 0 },
    ];

    if (!reviews || reviews.length === 0) return distribution;

    reviews.forEach((review) => {
      const stars = Math.round(review.rating); // Ensure integer star rating
      if (stars >= 1 && stars <= 5) {
        const index = 5 - stars; // 5 stars at index 0
        distribution[index].count++;
      }
    });

    const total = reviews.length;
    return distribution.map((d) => ({
      ...d,
      percentage: Math.round((d.count / total) * 100),
    }));
  };

  // Check if product exists
  if (!product) {
    return <div>No product data available</div>;
  }

  const ratings = calculateRatingDistribution();

  const formatDate = () => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
  };

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Star color styles - using amber-500 for golden color
  const starFillColor = "#f59e0b"; // amber-500
  const starEmptyColor = "#d1d5db"; // gray-300

  // Function to render stars with half-star support
  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const starSize = size === "md" ? "w-5 h-5" : "w-4 h-4";

    return [...Array(5)].map((_, i) => {
      // Full star
      if (i < Math.floor(rating)) {
        return (
          <Star
            key={i}
            className={starSize}
            fill={starFillColor}
            stroke={starFillColor}
          />
        );
      }
      // Half star
      else if (i < Math.ceil(rating) && !Number.isInteger(rating)) {
        return (
          <div key={i} className={`relative ${starSize}`}>
            {/* Empty star background */}
            <Star
              className={`absolute ${starSize}`}
              fill={starEmptyColor}
              stroke="#9ca3af"
            />
            {/* Half-filled star overlay */}
            <div className="absolute overflow-hidden" style={{ width: "50%" }}>
              <Star
                className={starSize}
                fill={starFillColor}
                stroke={starFillColor}
              />
            </div>
          </div>
        );
      }
      // Empty star
      else {
        return (
          <Star
            key={i}
            className={starSize}
            fill={starEmptyColor}
            stroke="#9ca3af"
          />
        );
      }
    });
  };

  // Get reviews to display based on showAllReviews state
  const displayedReviews = showAllReviews
    ? reviews
    : reviews?.slice(0, initialReviewCount);

  // Determine if we need to show the "View More" button
  const hasMoreReviews = reviews && reviews.length > initialReviewCount;

  if (isLoading) {
    return (
      <div className="w-full text-center py-8">
        Bewertungen werden geladen ...
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto py-8 px-4">
      <h2 className="text-3xl font-semibold mb-6 heading-luxury">Kunden bewertungen</h2>

      <div className="grid md:grid-cols-[1fr,2fr] gap-8 mb-8">
        {/* Left side - Overall rating */}
        <div className="flex flex-col items-center md:items-start">
          <div className="text-5xl font-bold mb-2">
            {productRating.toFixed(1)}
          </div>
          <div className="flex gap-1 mb-2">
            {renderStars(productRating, "md")}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {reviewsCount} Bewertungsnoten
          </div>
        </div>

        {/* Right side - Rating breakdown */}
        <div className="space-y-3">
          {ratings.map(({ stars, percentage }) => (
            <div key={stars} className="flex items-center gap-2">
              <div className="flex gap-1 min-w-[100px]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    fill={i < stars ? starFillColor : starEmptyColor}
                    stroke={i < stars ? starFillColor : "#9ca3af"}
                  />
                ))}
              </div>
              {/* Custom progress bar with amber color */}
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: starFillColor,
                  }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground min-w-[40px]">
                {percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Individual reviews */}
      <div className="space-y-6">
        {displayedReviews && displayedReviews.length > 0 ? (
          <>
            {displayedReviews.map((review) => (
              <Card key={review.id} className="border border-blue-100 bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">{review.name}</h3>
                      <div className="flex gap-1 mb-2">
                        {renderStars(review.rating, "sm")}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate()}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4">{review.comment}</p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={
                        helpfulReviews.includes(review.id)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleHelpfulClick(review.id)}
                      style={
                        helpfulReviews.includes(review.id)
                          ? {
                              backgroundColor: starFillColor,
                              borderColor: starFillColor,
                            }
                          : {}
                      }
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {helpfulReviews.includes(review.id)
                        ? "Helpful"
                        : "Helpful"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      War diese Bewertung hilfreich?
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* View More button */}
            {hasMoreReviews && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="group bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white rounded-full"
                >
                  {showAllReviews
                    ? "Weniger anzeigen"
                    : "Weitere Bewertungen anzeigen"}
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform ${
                      showAllReviews ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground">
            Noch keine Bewertungen. Seien Sie der Erste, der dieses Produkt
            bewertet!
          </p>
        )}
      </div>
    </div>
  );
}
