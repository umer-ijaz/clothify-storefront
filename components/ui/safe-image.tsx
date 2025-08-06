"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { compressImageUrl, createLowQualityPlaceholder, getPlaceholderImage } from "@/lib/simple-image-loader";

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  maxFileSize?: number; // in KB
  onError?: () => void;
}

/**
 * Ultra-safe image component that prevents browser crashes from large images
 * Uses aggressive compression and progressive loading
 */
export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  maxFileSize = 300, // Very conservative 300KB max
  onError,
}: SafeImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [isInView, setIsInView] = useState(priority);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Load earlier to improve UX
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Progressive image loading with abort capability
  useEffect(() => {
    if (!isInView || !src || hasError) return;

    // Cancel any ongoing load
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const loadProgressively = async () => {
      try {
        // Step 1: Show ultra-low quality placeholder immediately
        const tinyPlaceholder = createLowQualityPlaceholder(src, 50);
        setCurrentSrc(tinyPlaceholder);
        setLoadingProgress(25);

        // Step 2: Check if signal was aborted
        if (signal.aborted) return;

        // Step 3: Load small compressed version
        const smallCompressed = compressImageUrl(src, {
          quality: 40,
          width: Math.min(width, 400),
          height: Math.min(height, 400),
          maxFileSize,
        });

        const smallImg = new window.Image();
        smallImg.onload = () => {
          if (!signal.aborted) {
            setCurrentSrc(smallCompressed);
            setLoadingProgress(60);
            
            // Step 4: Load final quality version
            const finalImg = new window.Image();
            const finalSrc = compressImageUrl(src, {
              quality: 65, // Still conservative
              width: Math.min(width, 800), // Max 800px
              height: Math.min(height, 800),
              maxFileSize: maxFileSize * 1.5, // Slightly larger for final
            });

            finalImg.onload = () => {
              if (!signal.aborted) {
                setCurrentSrc(finalSrc);
                setIsLoading(false);
                setLoadingProgress(100);
              }
            };

            finalImg.onerror = () => {
              if (!signal.aborted) {
                // Final version failed, keep the small compressed
                setIsLoading(false);
                setLoadingProgress(100);
              }
            };

            finalImg.src = finalSrc;
          }
        };

        smallImg.onerror = () => {
          if (!signal.aborted) {
            setHasError(true);
            setIsLoading(false);
            onError?.();
          }
        };

        smallImg.src = smallCompressed;

      } catch (error) {
        if (!signal.aborted) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    loadProgressively();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isInView, src, width, height, maxFileSize, hasError, onError]);

  // Error fallback
  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500 text-sm">
          <div className="mb-1">⚠️</div>
          <div>Image failed</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative">
      {/* Loading indicator */}
      {isLoading && (
        <>
          <div 
            className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
            style={{ width, height }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
              {loadingProgress}%
            </div>
          </div>
        </>
      )}

      {/* Actual image */}
      {(isInView && currentSrc) && (
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
          unoptimized={true}
          loading={priority ? "eager" : "lazy"}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
        />
      )}

      {/* Fallback placeholder if not in view */}
      {!isInView && (
        <div 
          className={`bg-gray-200 ${className}`}
          style={{ width, height }}
        />
      )}
    </div>
  );
}
