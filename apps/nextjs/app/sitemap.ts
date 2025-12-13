import { MetadataRoute } from 'next'
import { productApi } from '@/lib/wordpress'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // Dynamic product routes
  try {
    const products = await productApi.getProducts(1, 100)
    const productRoutes = products.data.map((product: any) => ({
      url: `${baseUrl}/products/${product.slug || product.id}`,
      lastModified: new Date(product.modified || product.date),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
    
    return [...routes, ...productRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return routes
  }
}
