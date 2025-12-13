'use client'

import { Product } from '@product-crud-pwa/shared'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Placeholder for image - you can add image URL to Product interface later */}
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
    </div>
  )
}
