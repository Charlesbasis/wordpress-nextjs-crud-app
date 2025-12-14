
interface CacheConfig {
    ttl: number
    key: string
  }
  
  export async function getCached<T>(
    config: CacheConfig,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cached = await cache.get(config.key)
    if (cached) return JSON.parse(cached)
    
    // Fetch fresh data
    const data = await fetcher()
    
    // Store in cache
    await cache.set(config.key, JSON.stringify(data), config.ttl)
    
    return data
  }
