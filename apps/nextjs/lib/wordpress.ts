import axios, { AxiosError } from 'axios'
import type {
  Product,
  ProductCreateDto,
  ProductUpdateDto,
  PaginatedResponse
} from '@product-crud-pwa/shared'

// Use Next.js API route as proxy to avoid CORS issues
const API_BASE = typeof window !== 'undefined' 
  ? '/api/wordpress'  // Client-side: use Next.js API proxy
  : `${process.env.WORDPRESS_URL || 'http://localhost:8080'}/wp-json`  // Server-side: direct connection

// Create axios instance
export const wpApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add request interceptor for auth
wpApi.interceptors.request.use(
  (config) => {
    // In browser, add token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('wp_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling
wpApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wp_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Helper function to map WordPress REST API response to Product interface
function mapWordPressProductToProduct(wpProduct: any): Product {
  return {
    id: wpProduct.id,
    title: typeof wpProduct.title === 'string' 
      ? wpProduct.title 
      : wpProduct.title?.rendered || wpProduct.title || '',
    price: wpProduct.price ?? 0,
    sku: wpProduct.sku || '',
    stock: wpProduct.stock ?? 0,
  }
}

// Cache layer for better performance
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const getFromCache = <T>(key: string): T | null => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

const setToCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() })
}

// Products API with caching
export const productApi = {
  getProducts: async (
    page: number = 1,
    perPage: number = 12,
    filters?: {
      search?: string
      category?: number
      tag?: number
      orderby?: string
      order?: 'asc' | 'desc'
    }
  ): Promise<PaginatedResponse<Product>> => {
    const cacheKey = `products_${page}_${perPage}_${JSON.stringify(filters)}`
    const cached = getFromCache<PaginatedResponse<Product>>(cacheKey)
    
    if (cached) {
      return cached
    }

    // Fix: Convert all values to strings for URLSearchParams
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      _embed: 'true',
    })
    
    // Add filter params as strings
    if (filters) {
      if (filters.search) params.append('search', filters.search)
      if (filters.category !== undefined) params.append('category', filters.category.toString())
      if (filters.tag !== undefined) params.append('tag', filters.tag.toString())
      if (filters.orderby) params.append('orderby', filters.orderby)
      if (filters.order) params.append('order', filters.order)
    }

    const response = await wpApi.get(`/wp/v2/products?${params}`)
    
    // Map WordPress response to Product interface
    const products = Array.isArray(response.data) 
      ? response.data.map(mapWordPressProductToProduct)
      : []
    
    // Fix: Match PaginatedResponse structure
    const result: PaginatedResponse<Product> = {
      data: products,
      total: parseInt(response.headers['x-wp-total'] || '0', 10),
      totalPages: parseInt(response.headers['x-wp-totalpages'] || '0', 10)
    }

    setToCache(cacheKey, result)
    return result
  },

  getProduct: async (id: number): Promise<Product> => {
    const cacheKey = `product_${id}`
    const cached = getFromCache<Product>(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await wpApi.get(`/wp/v2/products/${id}`, {
      params: { _embed: 'true' }
    })

    const product = mapWordPressProductToProduct(response.data)
    setToCache(cacheKey, product)
    return product
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const cacheKey = `product_slug_${slug}`
    const cached = getFromCache<Product>(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await wpApi.get('/wp/v2/products', {
      params: {
        slug,
        _embed: 'true'
      }
    })

    if (response.data[0]) {
      const product = mapWordPressProductToProduct(response.data[0])
      setToCache(cacheKey, product)
      return product
    }
    
    throw new Error('Product not found')
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await wpApi.get('/wp/v2/products', {
      params: {
        search: query,
        per_page: '10',
        _embed: 'true'
      }
    })
    return Array.isArray(response.data) 
      ? response.data.map(mapWordPressProductToProduct)
      : []
  },

  createProduct: async (data: ProductCreateDto): Promise<Product> => {
    // Clear relevant caches
    cache.clear()
    
    // Map to WordPress format
    const wpData: any = {
      title: data.title,
      content: data.content || '',
      excerpt: data.excerpt || '',
      status: data.status || 'publish',
    }
    
    const response = await wpApi.post('/wp/v2/products', wpData)
    
    // Save custom fields
    const productId = response.data.id
    if (productId) {
      await Promise.all([
        wpApi.post(`/wp/v2/products/${productId}`, { price: data.price }),
        wpApi.post(`/wp/v2/products/${productId}`, { sku: data.sku }),
        wpApi.post(`/wp/v2/products/${productId}`, { stock: data.stock }),
      ])
    }
    
    // Fetch the complete product
    return productApi.getProduct(productId)
  },

  updateProduct: async (id: number, data: ProductUpdateDto): Promise<Product> => {
    cache.delete(`product_${id}`)
    
    // Map to WordPress format
    const wpData: any = {}
    if (data.title) wpData.title = data.title
    if (data.content !== undefined) wpData.content = data.content
    if (data.excerpt !== undefined) wpData.excerpt = data.excerpt
    if (data.status) wpData.status = data.status
    
    // Update post first
    if (Object.keys(wpData).length > 0) {
      await wpApi.post(`/wp/v2/products/${id}`, wpData)
    }
    
    // Update custom fields
    const updates: Promise<any>[] = []
    if (data.price !== undefined) {
      updates.push(wpApi.post(`/wp/v2/products/${id}`, { price: data.price }))
    }
    if (data.sku !== undefined) {
      updates.push(wpApi.post(`/wp/v2/products/${id}`, { sku: data.sku }))
    }
    if (data.stock !== undefined) {
      updates.push(wpApi.post(`/wp/v2/products/${id}`, { stock: data.stock }))
    }
    
    await Promise.all(updates)
    
    // Fetch the updated product
    return productApi.getProduct(id)
  },

  deleteProduct: async (id: number): Promise<void> => {
    cache.delete(`product_${id}`)
    await wpApi.delete(`/wp/v2/products/${id}`, {
      params: { force: true }
    })
  },

  uploadMedia: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await wpApi.post('/wp/v2/media', formData, {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Type': file.type
      }
    })

    return response.data
  }
}

// SWR hooks for data fetching
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

const fetcher = (url: string) => wpApi.get(url).then(res => {
  // Map response for SWR hooks too
  if (Array.isArray(res.data)) {
    return res.data.map(mapWordPressProductToProduct)
  }
  return mapWordPressProductToProduct(res.data)
})

export const useProducts = (page: number = 1, filters?: any) => {
  // Fix: Convert filters to string values
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: '12',
    _embed: 'true',
  })
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  return useSWR(`/wp/v2/products?${params}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000
  })
}

export const useInfiniteProducts = (filters?: any) => {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null
    
    const params = new URLSearchParams({
      page: (pageIndex + 1).toString(),
      per_page: '12',
      _embed: 'true',
    })
    
    // Fix: Convert filters to string values
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    
    return `/wp/v2/products?${params}`
  }

  return useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    parallel: true
  })
}

export const useProduct = (id?: number) => {
  return useSWR(id ? `/wp/v2/products/${id}?_embed=true` : null, fetcher, {
    revalidateOnFocus: false
  })
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await wpApi.post('/jwt-auth/v1/token', {
      username,
      password
    })
    
    if (response.data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wp_token', response.data.token)
        wpApi.defaults.headers.common.Authorization = `Bearer ${response.data.token}`
      }
    }
    
    return response.data
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wp_token')
      delete wpApi.defaults.headers.common.Authorization
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('wp_token')
  }
}
