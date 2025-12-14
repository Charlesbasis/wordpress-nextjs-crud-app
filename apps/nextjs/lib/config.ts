export const API_CONFIG = {
    // Use direct WordPress API in production
    baseURL: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_WORDPRESS_API_URL 
      : '/api/wordpress',
    
    // Enable CORS for production
    corsEnabled: process.env.NODE_ENV === 'production',
    
    // Cache settings
    cache: {
      products: 300, // 5 min
      product: 1800, // 30 min
    }
  }
  