import dynamic from 'next/dynamic';

// PayPal components - heavy, only load when needed
export const PayPalProviderWrapper = dynamic(
  () => import('@/paypal-provider-wrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm">Loading PayPal...</span>
      </div>
    ),
  }
);

// Payment Modal - only load when user wants to checkout
export const PaymentModal = dynamic(
  () => import('@/components/paymentComponents/paymentModal'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-sm">Loading checkout...</p>
        </div>
      </div>
    ),
  }
);

// Product Reviews - only load when user scrolls to reviews
export const ProductReviews = dynamic(
  () => import('@/components/reviewsComponents/product-reviews'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    ),
  }
);

// Auth Modal - only load when user tries to login
export const AuthModal = dynamic(
  () => import('@/components/auth-modal').then(mod => ({ default: mod.AuthModal })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    ),
  }
);

// Product Quick View - only load when user clicks quick view
export const ProductDetailModal = dynamic(
  () => import('@/components/productModal/product-detail-modal'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ),
  }
);

export default {
  PayPalProviderWrapper,
  PaymentModal,
  ProductReviews,
  AuthModal,
  ProductDetailModal,
};
