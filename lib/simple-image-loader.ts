export interface SimpleImageConfig {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxFileSize?: number; // in KB
  lazy?: boolean;
}

/**
 * Compress image to prevent browser crashes
 */
export function compressImageUrl(url: string, config: SimpleImageConfig = {}): string {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return url;
  }

  try {
    const { quality = 60, width, height, maxFileSize = 500 } = config; // Default 500KB max
    const urlObj = new URL(url);
    
    // Aggressive compression for large images
    if (width) urlObj.searchParams.set('w', Math.min(width, 800).toString()); // Max 800px wide
    if (height) urlObj.searchParams.set('h', Math.min(height, 800).toString()); // Max 800px tall
    
    // Lower quality for better compression
    urlObj.searchParams.set('q', Math.min(quality, 70).toString()); // Max 70% quality
    
    // Force JPEG format for better compression (unless PNG transparency needed)
    if (!url.includes('.png')) {
      urlObj.searchParams.set('fm', 'jpg');
    }
    
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

/**
 * Simple image URL optimizer for Firebase Storage
 */
export function optimizeImageUrl(url: string, config: SimpleImageConfig = {}): string {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return url;
  }

  try {
    const { quality = 75, width, height } = config;
    const urlObj = new URL(url);
    
    // Simple Firebase Storage optimization parameters
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    if (quality < 100) urlObj.searchParams.set('q', quality.toString());
    
    return urlObj.toString();
  } catch (error) {
    return url; // Return original if optimization fails
  }
}

/**
 * Get fallback placeholder image
 */
export function getPlaceholderImage(width: number = 400, height: number = 400): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">
        No Image
      </text>
    </svg>
  `)}`;
}

/**
 * Simple image loader with fallback and compression
 */
export function loadImageWithFallback(
  primaryUrl: string | undefined,
  fallbackUrl?: string,
  config: SimpleImageConfig = {}
): string {
  if (primaryUrl && primaryUrl.trim() !== '') {
    // Use compression for potentially large images
    return compressImageUrl(primaryUrl, config);
  }
  
  if (fallbackUrl && fallbackUrl.trim() !== '') {
    return compressImageUrl(fallbackUrl, config);
  }
  
  return getPlaceholderImage(config.width, config.height);
}

/**
 * Create low-quality placeholder for instant loading
 */
export function createLowQualityPlaceholder(url: string, width: number = 100): string {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', '10'); // Very low quality for instant load
    urlObj.searchParams.set('fm', 'jpg');
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}
