'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Simple performance monitoring without external deps
    const monitorPerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Log key metrics
        const metrics = {
          'DOM Content Loaded': navigation.domContentLoadedEventEnd - navigation.fetchStart,
          'Page Load Complete': navigation.loadEventEnd - navigation.fetchStart,
          'First Paint': navigation.responseEnd - navigation.fetchStart,
          'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
          'Server Response': navigation.responseEnd - navigation.requestStart,
        };

        if (process.env.NODE_ENV === 'development') {
          console.group('📊 Performance Metrics');
          Object.entries(metrics).forEach(([key, value]) => {
            console.log(`${key}: ${Math.round(value)}ms`);
          });
          console.groupEnd();
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production' && window.gtag) {
          Object.entries(metrics).forEach(([key, value]) => {
            window.gtag?.('event', 'performance_metric', {
              metric_name: key,
              value: Math.round(value),
              event_category: 'Performance',
            });
          });
        }
      }
    };

    // Bundle size monitoring for development
    const logBundleInfo = () => {
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && 'performance' in window) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        const jsResources = resources.filter(r => r.name.endsWith('.js'));
        const cssResources = resources.filter(r => r.name.endsWith('.css'));
        
        console.group('🚀 Bundle Analysis');
        console.log('JS Files:', jsResources.length);
        console.log('CSS Files:', cssResources.length);
        
        // Largest JS bundles
        const largestJS = jsResources
          .filter(r => r.transferSize && r.transferSize > 0)
          .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
          .slice(0, 5);
        
        if (largestJS.length > 0) {
          console.log('Largest JS Bundles:');
          largestJS.forEach(resource => {
            const size = resource.transferSize ? (resource.transferSize / 1024).toFixed(2) : 'unknown';
            const name = resource.name.split('/').pop() || 'unknown';
            console.log(`  ${name}: ${size}KB`);
          });
        }
        
        console.groupEnd();
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      monitorPerformance();
      logBundleInfo();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          monitorPerformance();
          logBundleInfo();
        }, 1000);
      });
    }
  }, []);

  return null;
}

export default PerformanceMonitor;
