import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Verify secret
  if (body.secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }
  
  try {
    // Revalidate specific product page
    if (body.path) {
      await revalidatePath(body.path)
    }
    
    // Also revalidate homepage (product list)
    await revalidatePath('/')
    
    return Response.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return Response.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
