'use client'

import { Suspense } from 'react'
import { useProducts } from '@/lib/wordpress'
import ProductCard from './ProductCard'
import type { Product } from '@product-crud-pwa/shared'

export default function ProductList() {
  const { data, error, isLoading } = useProducts(1)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-64 rounded" />
        ))}
      </div>
    )
  }

  if (error) {
    // Check if it's a WordPress installation error
    const errorData = error.response?.data || error
    const isNotInstalled = errorData?.code === 'WP_NOT_INSTALLED' || 
                          errorData?.code === 'WP_INVALID_RESPONSE'
    
    return (
      <div className="text-center py-12">
        <div className={`border rounded-lg p-6 max-w-md mx-auto ${
          isNotInstalled 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-2 ${
            isNotInstalled ? 'text-blue-800' : 'text-yellow-800'
          }`}>
            {isNotInstalled ? 'WordPress Setup Required' : 'WordPress Connection Error'}
          </h2>
          <p className={`mb-4 ${isNotInstalled ? 'text-blue-700' : 'text-yellow-700'}`}>
            {isNotInstalled 
              ? 'WordPress needs to be installed before you can use this app.'
              : 'Unable to connect to WordPress. Please make sure WordPress is running.'}
          </p>
          <div className="text-sm space-y-2">
            {isNotInstalled ? (
              <>
                <p className="font-semibold">To set up WordPress:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Visit <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">http://localhost:8080</a></li>
                  <li>Complete the installation wizard</li>
                  <li>Refresh this page</li>
                </ol>
                <p className="mt-4 font-semibold">Or use WP-CLI:</p>
                <code className="block mt-2 bg-blue-100 p-2 rounded text-xs">
                  docker compose exec wordpress wp core install --url=http://localhost:8080 --title="Product CRUD" --admin_user=admin --admin_password=admin --admin_email=admin@example.com --skip-email
                </code>
              </>
            ) : (
              <p>Check with: <code className="bg-yellow-100 p-1 rounded">docker compose ps</code></p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // useProducts returns mapped array directly, not PaginatedResponse
  const products = Array.isArray(data) ? data : []

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Suspense>
  )
}
