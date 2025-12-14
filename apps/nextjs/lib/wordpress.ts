import axios, { AxiosError } from 'axios'
import type {
  Product,
  ProductCreateDto,
  ProductUpdateDto,
  PaginatedResponse
} from '@product-crud-pwa/shared'

const API_BASE = typeof window !== 'undefined' 
  ? '/api/wordpress'
  : `${process.env.WORDPRESS_URL || 'http://localhost:8080'}/wp-json`

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

// Enhanced response interceptor
wpApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wp_token')
        localStorage.removeItem('wp_user')
        window.location.href = '/login?error=session_expired'
      }
    }
    return Promise.reject(error)
  }
)

// Helper function to map WordPress response
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

// Cache layer
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

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

// Products API
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
    
    if (cached) return cached

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      _embed: 'true',
    })
    
    if (filters) {
      if (filters.search) params.append('search', filters.search)
      if (filters.category !== undefined) params.append('category', filters.category.toString())
      if (filters.tag !== undefined) params.append('tag', filters.tag.toString())
      if (filters.orderby) params.append('orderby', filters.orderby)
      if (filters.order) params.append('order', filters.order)
    }

    const response = await wpApi.get(`/wp/v2/products?${params}`)
    const products = Array.isArray(response.data) 
      ? response.data.map(mapWordPressProductToProduct)
      : []
    
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
    if (cached) return cached

    const response = await wpApi.get(`/wp/v2/products/${id}`, {
      params: { _embed: 'true' }
    })

    const product = mapWordPressProductToProduct(response.data)
    setToCache(cacheKey, product)
    return product
  },

  createProduct: async (data: ProductCreateDto): Promise<Product> => {
    cache.clear()
    
    console.log('📝 Creating product with data:', data)
    
    // FIXED: Use the correct format for meta fields
    // WordPress now supports direct meta field updates via register_post_meta
    const wpData = {
      title: data.title,
      content: data.content || '',
      excerpt: data.excerpt || '',
      status: data.status || 'publish',
      // Use the meta object to set custom fields
      meta: {
        _product_price: data.price,
        _product_sku: data.sku,
        _product_stock: data.stock,
      },
      // Also send them as top-level fields for backward compatibility
      price: data.price,
      sku: data.sku,
      stock: data.stock,
    }
    
    try {
      const response = await wpApi.post('/wp/v2/products', wpData)
      console.log('✅ Product created:', response.data)
      
      // Fetch the complete product to ensure we have all data
      const product = await productApi.getProduct(response.data.id)
      console.log('✅ Product fetched with meta:', product)
      
      return product
    } catch (error: any) {
      console.error('❌ Create product error:', error.response?.data || error.message)
      throw error
    }
  },

  updateProduct: async (id: number, data: ProductUpdateDto): Promise<Product> => {
    cache.delete(`product_${id}`)
    
    console.log('📝 Updating product:', id, data)
    
    const wpData: any = {
      meta: {}
    }
    
    // Update post fields
    if (data.title) wpData.title = data.title
    if (data.content !== undefined) wpData.content = data.content
    if (data.excerpt !== undefined) wpData.excerpt = data.excerpt
    if (data.status) wpData.status = data.status
    
    // Update meta fields
    if (data.price !== undefined) {
      wpData.meta._product_price = data.price
      wpData.price = data.price // Also send as top-level field
    }
    if (data.sku !== undefined) {
      wpData.meta._product_sku = data.sku
      wpData.sku = data.sku
    }
    if (data.stock !== undefined) {
      wpData.meta._product_stock = data.stock
      wpData.stock = data.stock
    }
    
    try {
      const response = await wpApi.post(`/wp/v2/products/${id}`, wpData)
      console.log('✅ Product updated:', response.data)
      
      const product = await productApi.getProduct(id)
      console.log('✅ Product fetched after update:', product)
      
      return product
    } catch (error: any) {
      console.error('❌ Update product error:', error.response?.data || error.message)
      throw error
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    cache.delete(`product_${id}`)
    await wpApi.delete(`/wp/v2/products/${id}`, {
      params: { force: true }
    })
  },
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    try {
      console.log('🔐 Attempting login...')
      const response = await wpApi.post('/jwt-auth/v1/token', {
        username,
        password
      })
      
      if (response.data.token) {
        console.log('✅ Login successful')
        if (typeof window !== 'undefined') {
          localStorage.setItem('wp_token', response.data.token)
          localStorage.setItem('wp_user', JSON.stringify({
            email: response.data.user_email,
            nicename: response.data.user_nicename,
            displayName: response.data.user_display_name,
          }))
          wpApi.defaults.headers.common.Authorization = `Bearer ${response.data.token}`
        }
      }
      
      return response.data
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message)
      throw error
    }
  },

  logout: () => {
    console.log('👋 Logging out...')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wp_token')
      localStorage.removeItem('wp_user')
      delete wpApi.defaults.headers.common.Authorization
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('wp_token')
  },

  getUser: () => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('wp_user')
    return userStr ? JSON.parse(userStr) : null
  }
}

// SWR hooks
import useSWR from 'swr'

const fetcher = (url: string) => wpApi.get(url).then(res => {
  if (Array.isArray(res.data)) {
    return res.data.map(mapWordPressProductToProduct)
  }
  return mapWordPressProductToProduct(res.data)
})

export const useProducts = (page: number = 1, filters?: any) => {
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

export const useProduct = (id?: number) => {
  return useSWR(id ? `/wp/v2/products/${id}?_embed=true` : null, fetcher, {
    revalidateOnFocus: false
  })
}
