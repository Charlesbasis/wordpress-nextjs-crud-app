'use client'

import { useState } from 'react'
import { useProducts, productApi } from '@/lib/wordpress'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import ProductForm from './ProductForm'
import type { Product, ProductCreateDto, ProductUpdateDto } from '@product-crud-pwa/shared'
import { mutate } from 'swr'

export default function ProductList() {
  const { data, error, isLoading } = useProducts(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle create product
  const handleCreate = async (data: ProductCreateDto) => {
    setIsSubmitting(true)
    try {
      await productApi.createProduct(data)
      showToast('Product created successfully!', 'success')
      setIsCreateModalOpen(false)
      // Refresh the product list
      mutate('/wp/v2/products?page=1&per_page=12&_embed=true')
    } catch (error) {
      console.error('Create error:', error)
      showToast('Failed to create product. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle update product
  const handleUpdate = async (data: ProductUpdateDto) => {
    if (!editingProduct) return
    
    setIsSubmitting(true)
    try {
      await productApi.updateProduct(editingProduct.id, data)
      showToast('Product updated successfully!', 'success')
      setEditingProduct(null)
      mutate('/wp/v2/products?page=1&per_page=12&_embed=true')
    } catch (error) {
      console.error('Update error:', error)
      showToast('Failed to update product. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete product
  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) {
      return
    }

    try {
      await productApi.deleteProduct(product.id)
      showToast('Product deleted successfully!', 'success')
      mutate('/wp/v2/products?page=1&per_page=12&_embed=true')
    } catch (error) {
      console.error('Delete error:', error)
      showToast('Failed to delete product. Please try again.', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    const errorData = error.response?.data || error
    const isNotInstalled = errorData?.code === 'WP_NOT_INSTALLED' || 
                          errorData?.code === 'WP_INVALID_RESPONSE'
    
    return (
      <div className="container mx-auto px-4 py-12">
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
              </>
            ) : (
              <p>Check with: <code className="bg-yellow-100 p-1 rounded">docker compose ps</code></p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const products = Array.isArray(data) ? data : []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">{products.length} products available</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Product
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: Product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onEdit={() => setEditingProduct(product)}
              onDelete={() => handleDelete(product)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Product"
      >
        <ProductForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      </ProductModal>

      {/* Edit Modal */}
      <ProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
      >
        <ProductForm
          product={editingProduct || undefined}
          onSubmit={handleUpdate}
          onCancel={() => setEditingProduct(null)}
          isLoading={isSubmitting}
        />
      </ProductModal>
    </div>
  )
}
