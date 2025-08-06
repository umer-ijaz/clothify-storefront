"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { loadImageWithFallback, createLowQualityPlaceholder, type SimpleImageConfig } from "@/lib/simple-image-loader";

interface SimpleImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  quality?: number;
  priority?: boolean;
  lazy?: boolean;
  maxFileSize?: number;
}

export default function SimpleImage({
  src,
  alt,
  width,
  height,
  className = "",
  quality = 60, // Lower default quality to prevent crashes
  priority = false,
  lazy = true,
  maxFileSize = 500,
}: SimpleImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const imgRef = useRef<HTMLDivElement>(null);

  const config: SimpleImageConfig = { quality, width, height, maxFileSize, lazy };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Progressive loading: low quality first, then high quality
  useEffect(() => {
    if (!isInView || !src) return;

    if (hasError) {
      setCurrentSrc(loadImageWithFallback(undefined, undefined, config));
      return;
    }

    // Start with very low quality placeholder for instant loading
    const lowQualitySrc = createLowQualityPlaceholder(src, 100);
    setCurrentSrc(lowQualitySrc);

    // Preload the high-quality image in background
    const highQualityImg = new window.Image();
    const highQualitySrc = loadImageWithFallback(src, undefined, config);
    
    highQualityImg.onload = () => {
      // Switch to high quality once loaded
      setCurrentSrc(highQualitySrc);
      setIsLoading(false);
    };

    highQualityImg.onerror = () => {
      setHasError(true);
      setCurrentSrc(loadImageWithFallback(undefined, undefined, config));
      setIsLoading(false);
    };

    // Start loading high-quality image
    highQualityImg.src = highQualitySrc;

  }, [isInView, src, hasError, config]);

  return (
    <div ref={imgRef} className="relative">
      {!isInView ? (
        // Placeholder for lazy loading
        <div 
          className={`bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      ) : (
        <>
          {isLoading && (
            <div 
              className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
              style={{ width, height }}
            />
          )}
          <Image
            src={currentSrc || loadImageWithFallback(undefined, undefined, config)}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            unoptimized={true}
            loading={lazy && !priority ? "lazy" : "eager"}
            onError={() => setHasError(true)}
            onLoad={() => setIsLoading(false)}
          />
        </>
      )}
    </div>
  );
}
