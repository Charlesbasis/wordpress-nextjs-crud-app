'use client'

import { Product } from '@product-crud-pwa/shared'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  onEdit?: () => void
  onDelete?: () => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
      <Link href={`/products/${product.id}`} className="flex-1">
        <div className="relative aspect-square overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <span className="text-blue-400 text-4xl font-bold">
              {product.title.charAt(0).toUpperCase()}
            </span>
          </div>
          {product.stock <= 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product?.title}
          </h3>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-2xl font-bold text-blue-700">
              ${product?.price.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              SKU: {product?.sku || 'N/A'}
            </div>
          </div>
          
          {product?.stock > 0 && (
            <div className="mt-3 text-sm text-green-600">
              {product?.stock} in stock
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <div className="p-4 pt-0 flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onEdit()
              }}
              className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
              className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
