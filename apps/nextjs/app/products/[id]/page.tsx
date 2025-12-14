import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { productApi } from '@/lib/wordpress'
import { generateStructuredData } from '@/lib/seo'
import ProductDetailClient from '@/components/Product/ProductDetailClient'

type Props = {
  params: Promise<{ id: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const product = await productApi.getProduct(parseInt(id))
    
    return {
      title: product.title,
      description: `Buy ${product.title} for $${product.price}. SKU: ${product.sku}. ${product.stock > 0 ? 'In stock' : 'Out of stock'}.`,
      openGraph: {
        title: product.title,
        description: `Price: $${product.price} | SKU: ${product.sku}`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}`,
        images: [
          {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: `Price: $${product.price} | ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}`,
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}`,
      },
    }
  } catch (error) {
    return {
      title: 'Product Not Found',
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  
  let product
  try {
    product = await productApi.getProduct(parseInt(id))
  } catch (error) {
    notFound()
  }

  // Generate structured data for SEO
  const structuredData = generateStructuredData({
    type: 'Product',
    name: product.title,
    description: `Product with SKU ${product.sku}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}`,
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'USD',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}`,
    },
    sku: product.sku,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductDetailClient product={product} />
    </>
  )
}

export const revalidate = 1800 // 30 minutes

export async function generateStaticParams() {
  // Pre-generate top 50 products at build time
  const products = await productApi.getProducts(1, 50)
  
  return products.data.map((product) => ({
    id: product.id.toString(),
  }))
}
