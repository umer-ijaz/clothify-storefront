/**
 * Firebase Image Utilities
 * Handles Firebase Storage image URLs with timeout and error handling
 */

export interface ImageConfig {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimizes Firebase Storage URLs with query parameters
 */
export function optimizeFirebaseImage(
  url: string, 
  config: ImageConfig = {}
): string {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return url;
  }

  try {
    const { quality = 75, width, height, format = 'webp' } = config;
    const urlObj = new URL(url);
    
    // Add optimization parameters
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    urlObj.searchParams.set('q', quality.toString());
    urlObj.searchParams.set('fm', format);
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to optimize Firebase image URL:', error);
    return url;
  }
}

/**
 * Validates if a Firebase image URL is accessible
 */
export async function validateFirebaseImage(url: string): Promise<boolean> {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Firebase image validation failed:', error);
    return false;
  }
}

/**
 * Creates a fallback image URL
 */
export function getFallbackImage(width: number = 200, height: number = 200): string {
  return `/placeholder.svg`;
}

/**
 * Generates a blur data URL for images
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Image URL with fallback handling
 */
export function getImageWithFallback(
  primaryUrl: string | undefined,
  fallbackUrl?: string,
  width?: number,
  height?: number
): string {
  if (primaryUrl && primaryUrl.trim() !== '') {
    return primaryUrl;
  }
  
  if (fallbackUrl && fallbackUrl.trim() !== '') {
    return fallbackUrl;
  }
  
  return getFallbackImage(width, height);
}
