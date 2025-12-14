export interface StructuredDataProps {
  type: 'WebSite' | 'WebPage' | 'Product' | 'Organization' | 'BreadcrumbList' | 'ItemList'
  name?: string
  url?: string
  description?: string
  image?: string
  [key: string]: any
}

export function generateStructuredData(props: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const base = {
    '@context': 'https://schema.org',
    '@type': props.type,
  }

  switch (props.type) {
    case 'WebSite':
      return {
        ...base,
        name: props.name,
        url: props.url || baseUrl,
        description: props.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
    
    case 'Product':
      return {
        ...base,
        name: props.name,
        description: props.description,
        image: props.image,
        url: props.url,
        sku: props.sku,
        brand: {
          '@type': 'Brand',
          name: props.brand || 'Product CRUD App',
        },
        offers: props.offers || {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: '0.00',
          priceCurrency: 'USD',
        },
        aggregateRating: props.aggregateRating,
      }
    
    case 'Organization':
      return {
        ...base,
        name: props.name,
        url: props.url || baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: props.sameAs || [],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'support@example.com',
        },
      }
    
    case 'BreadcrumbList':
      return {
        ...base,
        itemListElement: props.itemListElement || [],
      }

    case 'ItemList':
      return {
        ...base,
        itemListElement: props.itemListElement || [],
        numberOfItems: props.numberOfItems || 0,
      }
    
    default:
      return {
        ...base,
        ...props,
      }
  }
}

export function generateBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return generateStructuredData({
    type: 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  })
}

export function generateProductListSchema(products: any[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  return generateStructuredData({
    type: 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        url: `${baseUrl}/products/${product.id}`,
        offers: {
          '@type': 'Offer',
          price: product.price.toString(),
          priceCurrency: 'USD',
          availability: product.stock > 0 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  })
}

// Generate meta tags for social sharing
export function generateSocialMeta(config: {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const defaultImage = `${baseUrl}/og-image.jpg`

  return {
    openGraph: {
      title: config.title,
      description: config.description,
      type: config.type || 'website',
      url: config.url || baseUrl,
      siteName: 'Product CRUD App',
      images: [
        {
          url: config.image || defaultImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [config.image || defaultImage],
    },
  }
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}${path}`
}

// Generate JSON-LD script tag
export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
