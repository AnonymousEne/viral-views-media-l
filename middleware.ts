import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limiter'
import { captureException, addBreadcrumb } from '@/lib/monitoring'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Apply security headers to all responses
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // CSP header for better security
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.firebase.com https://*.googleapis.com;"
    )

    // API route protection
    if (pathname.startsWith('/api/')) {
      addBreadcrumb({
        message: `API request to ${pathname}`,
        category: 'api',
        data: { 
          method: request.method,
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      // Determine rate limit type based on endpoint
      let limitType: 'auth' | 'api' | 'upload' = 'api'
      
      if (pathname.includes('/auth/')) {
        limitType = 'auth'
      } else if (pathname.includes('/media') && request.method === 'POST') {
        limitType = 'upload'
      }

      // Apply rate limiting
      const rateLimitResult = await rateLimit(request, limitType)
      if (!rateLimitResult.success) {
        const retryAfter = rateLimitResult.resetTime 
          ? Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000)
          : 60

        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retryAfter: retryAfter
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString()
            }
          }
        )
      }

      // CORS headers for API routes
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
              ? 'https://viral-views.com' 
              : '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          }
        })
      }
      
      response.headers.set(
        'Access-Control-Allow-Origin', 
        process.env.NODE_ENV === 'production' 
          ? 'https://viral-views.com' 
          : '*'
      )
    }

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      // In a real app, you'd verify admin permissions here
      // For demo purposes, we'll just add monitoring
      addBreadcrumb({
        message: 'Admin area access',
        category: 'admin',
        data: { pathname }
      })
    }

    return response

  } catch (error) {
    captureException(error)
    
    // In case of middleware error, allow the request to continue
    // but log the error for investigation
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
