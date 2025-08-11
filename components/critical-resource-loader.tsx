'use client';

import { useEffect } from 'react';

// Preload critical resources
export function CriticalResourceLoader() {
  useEffect(() => {
    // Preload critical fonts
    const fontPreloads = [
      '/fonts/geist-sans.woff2',
      '/fonts/geist-mono.woff2',
    ].filter(Boolean);

    fontPreloads.forEach((font) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical scripts only when needed
    const scripts = [
      {
        src: 'https://www.paypal.com/sdk/js?client-id=' + process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID + '&components=buttons',
        condition: () => window.location.pathname.includes('payment') || window.location.pathname.includes('cart'),
      },
    ];

    scripts.forEach(({ src, condition }) => {
      if (condition()) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
    });

    // Preconnect to external domains
    const preconnects = [
      'https://firebasestorage.googleapis.com',
      'https://api.stripe.com',
      'https://js.stripe.com',
    ];

    preconnects.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}

// Resource preloader hook
export function useResourcePreloader() {
  useEffect(() => {
    // Preload next page resources on hover
    const handleLinkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        // Preload the page
        import('next/link').then(({ default: Link }) => {
          const router = require('next/router');
          if (router.router) {
            router.router.prefetch(link.pathname);
          }
        });
      }
    };

    // Add hover listeners for link prefetching
    document.addEventListener('mouseover', handleLinkHover);
    
    return () => {
      document.removeEventListener('mouseover', handleLinkHover);
    };
  }, []);
}

export default CriticalResourceLoader;
