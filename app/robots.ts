import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.danielsbelieve.de'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/payments',
          '/orders',
          '/invoice',
          '/mobilesearch',
          '/pop-up',
          '/_next/',
          '/private/',
          '*.json',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/payments', 
          '/orders',
          '/invoice',
          '/mobilesearch',
          '/pop-up',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
