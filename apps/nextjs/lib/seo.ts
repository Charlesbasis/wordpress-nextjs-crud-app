export interface StructuredDataProps {
    type: 'WebSite' | 'WebPage' | 'Product' | 'Organization' | 'BreadcrumbList'
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
          offers: props.offers || {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
          },
        }
      
      case 'Organization':
        return {
          ...base,
          name: props.name,
          url: props.url || baseUrl,
          logo: `${baseUrl}/logo.png`,
          sameAs: props.sameAs || [],
        }
      
      case 'BreadcrumbList':
        return {
          ...base,
          itemListElement: props.itemListElement || [],
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
  