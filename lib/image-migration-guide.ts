/**
 * Quick guide for replacing images to prevent browser crashes
 */

// For normal product images (thumbnails, cards, etc.)
// OLD:
// <Image src={product.image} alt={product.name} width={300} height={300} />

// NEW:
// <SimpleImage 
//   src={product.image} 
//   alt={product.name} 
//   width={300} 
//   height={300}
//   quality={60}  // Lower quality for faster loading
//   lazy={true}   // Lazy load by default
// />

// For large images that might crash browser (main product images, hero images)
// NEW:
// <SafeImage 
//   src={product.image} 
//   alt={product.name} 
//   width={800} 
//   height={600}
//   maxFileSize={300}  // Max 300KB to prevent crashes
//   onError={() => console.log('Image failed to load')}
// />

export const ImageMigrationGuide = {
  // Use SimpleImage for most cases
  SimpleImage: {
    quality: 60, // Reduced from 75 to prevent large files
    lazy: true,
    maxFileSize: 500, // KB
  },
  
  // Use SafeImage for potentially large images
  SafeImage: {
    quality: 65, // Conservative quality
    maxFileSize: 300, // Very conservative size limit
    progressiveLoading: true,
  },
  
  // Quick replace patterns
  replacePatterns: {
    // Thumbnails and cards
    thumbnail: { width: 150, height: 150, quality: 50 },
    // Product cards
    card: { width: 300, height: 300, quality: 60 },
    // Main product images
    main: { width: 600, height: 600, quality: 65, component: 'SafeImage' },
    // Hero/banner images
    hero: { width: 800, height: 400, quality: 70, component: 'SafeImage' },
  }
};
