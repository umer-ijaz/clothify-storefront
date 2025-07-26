"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  fill = false,
  sizes,
  style,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // If there's an error, show placeholder
  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="text-center p-2">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-400 rounded"></div>
          <span className="text-xs text-gray-500">Bild nicht verfügbar</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={className}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes}
        style={style}
        unoptimized={src.includes('firebasestorage.googleapis.com') ? true : false}
      />
    </div>
  );
}
