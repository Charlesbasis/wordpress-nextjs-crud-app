'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product, ProductUpdateDto } from '@product-crud-pwa/shared'
import { productApi } from '@/lib/wordpress'
import ProductModal from './ProductModal'
import ProductForm from './ProductForm'

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product: initialProduct }: ProductDetailClientProps) {
  const router = useRouter()
  const [product, setProduct] = useState(initialProduct)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpdate = async (data: ProductUpdateDto) => {
    setIsSubmitting(true)
    try {
      const updatedProduct = await productApi.updateProduct(product.id, data)
      setProduct(updatedProduct)
      showToast('Product updated successfully!', 'success')
      setIsEditModalOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      showToast('Failed to update product. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await productApi.deleteProduct(product.id)
      showToast('Product deleted successfully!', 'success')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      console.error('Delete error:', error)
      showToast('Failed to delete product. Please try again.', 'error')
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Products</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-400 text-9xl font-bold">
                {product.title.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {product.title}
                </h1>

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-blue-700">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.stock <= 0 && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </span>
                  )}
                  {product.stock > 0 && product.stock <= 10 && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Low Stock
                    </span>
                  )}
                  {product.stock > 10 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      In Stock
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">SKU</span>
                    <span className="text-gray-900 font-semibold">{product.sku}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Stock Quantity</span>
                    <span className="text-gray-900 font-semibold">{product.stock} units</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Product ID</span>
                    <span className="text-gray-900 font-semibold">#{product.id}</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Product Information</h3>
                  <p className="text-sm text-blue-700">
                    This product is managed through the WordPress backend. 
                    All changes are synchronized in real-time.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={isDeleting}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Product
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full bg-red-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Product
                    </>
                  )}
                </button>

                <Link
                  href="/"
                  className="block w-full bg-gray-200 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
                >
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        <ProductForm
          product={product}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </ProductModal>
    </div>
  )
}
