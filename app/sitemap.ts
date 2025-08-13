import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'
import { getFlashSaleItems } from '@/lib/flashSaleItems'
import { fetchCategories } from '@/lib/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.danielsbelieve.de'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/allproducts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/flashsaleproducts`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/return-condition`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/impression`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  try {
    // Get products
    const [products, flashSaleItems, categories] = await Promise.all([
      getProducts(),
      getFlashSaleItems(),
      fetchCategories()
    ])

    // Product pages
    const productPages = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    // Flash sale product pages
    const flashSalePages = flashSaleItems.map((item) => ({
      url: `${baseUrl}/product/${item.id}`,
      lastModified: new Date(item.updatedAt || new Date()),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    }))

    // Category pages
    const categoryPages = categories.flatMap((category) => {
      const mainCategoryPage = {
        url: `${baseUrl}/category/${category.href}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }

      const subcategoryPages = category.subcategories.map((subcategory) => ({
        url: `${baseUrl}/category/${category.href}/${subcategory.href}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      return [mainCategoryPage, ...subcategoryPages]
    })

    return [
      ...staticPages,
      ...productPages,
      ...flashSalePages,
      ...categoryPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if dynamic content fails
    return staticPages
  }
}
