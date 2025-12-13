import { NextRequest, NextResponse } from 'next/server'

const WORDPRESS_URL = process.env.WORDPRESS_URL || 'http://localhost:8080'

async function handleWordPressRequest(
  request: NextRequest,
  method: 'GET' | 'POST' | 'DELETE',
  params: Promise<{ path: string[] }>,
  body?: any
) {
  const { path } = await params
  const searchParams = request.nextUrl.searchParams
  
  const url = new URL(`${WORDPRESS_URL}/wp-json/${path.join('/')}`)
  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value)
  })

  try {
    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      ...(body && { body: JSON.stringify(body) }),
      redirect: 'follow', // Follow redirects
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type') || ''
    
    if (!contentType.includes('application/json')) {
      // WordPress is likely redirecting to install page or returning HTML
      if (response.status === 302 || response.url.includes('install.php')) {
        return NextResponse.json(
          { 
            error: 'WordPress is not installed yet. Please complete the installation at http://localhost:8080',
            code: 'WP_NOT_INSTALLED',
            installUrl: 'http://localhost:8080/wp-admin/install.php'
          },
          { status: 503 }
        )
      }
      
      // Try to get text to see what we got
      const text = await response.text()
      console.error('WordPress returned non-JSON:', text.substring(0, 200))
      
      return NextResponse.json(
        { 
          error: 'WordPress returned an unexpected response. Please ensure WordPress is installed and the REST API is enabled.',
          code: 'WP_INVALID_RESPONSE'
        },
        { status: 502 }
      )
    }

    const data = await response.json()
    const headers = new Headers()
    
    // Copy relevant headers
    if (response.headers.get('x-wp-total')) {
      headers.set('x-wp-total', response.headers.get('x-wp-total') || '')
    }
    if (response.headers.get('x-wp-totalpages')) {
      headers.set('x-wp-totalpages', response.headers.get('x-wp-totalpages') || '')
    }
    
    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return NextResponse.json(data, {
      status: response.status,
      headers,
    })
  } catch (error) {
    console.error('WordPress API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch from WordPress',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'WP_FETCH_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleWordPressRequest(request, 'GET', params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const body = await request.json().catch(() => null)
  return handleWordPressRequest(request, 'POST', params, body)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleWordPressRequest(request, 'DELETE', params)
}
