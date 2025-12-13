import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { productApi } from '@/lib/wordpress'
import { generateStructuredData } from '@/lib/seo'
import ProductCard from '@/components/Product/ProductCard'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const product = await productApi.getProductBySlug(slug)
    
    return {
      title: product.name || 'Product',
      description: product.description || 'Product details',
      openGraph: {
        title: product.name || 'Product',
        description: product.description || 'Product details',
        images: product.image ? [product.image] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name || 'Product',
        description: product.description || 'Product details',
        images: product.image ? [product.image] : [],
      },
    }
  } catch {
    return {
      title: 'Product Not Found',
    }
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  
  try {
    const product = await productApi.getProductBySlug(slug)
    
    const structuredData = generateStructuredData({
      type: 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${slug}`,
    })

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <main className="container mx-auto px-4 py-8">
          <ProductCard product={product} />
        </main>
      </>
    )
  } catch {
    notFound()
  }
}
