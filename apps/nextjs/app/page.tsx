import { Metadata } from 'next'
import ProductList from '@/components/Product/ProductList'
import { generateStructuredData } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Browse and manage products with our modern CRUD application',
  openGraph: {
    title: 'Product CRUD App - Home',
    description: 'Browse and manage products with our modern CRUD application',
  },
}

export default function HomePage() {
  const structuredData = generateStructuredData({
    type: 'WebSite',
    name: 'Product CRUD App',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    description: 'Modern product management application',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen">
        <ProductList />
      </main>
    </>
  )
}
